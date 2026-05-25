import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { chromium as playwrightChromium, type Browser, type Page } from "playwright-core";
import type { CVData } from "./cv-schema";
import { buildPdfFooterTemplate, pdfBottomMarginForTemplate } from "./cv-pdf-footer";

/** Reuse one browser locally; serverless must launch per request (concurrency + freeze). */
const isServerless = Boolean(process.env.VERCEL);

let sharedBrowser: Browser | null = null;

/** Matches @sparticuz/chromium@147.0.2 — used when Vercel omits the local bin/ trace. */
const SPARTICUZ_CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v147.0.2/chromium-v147.0.2-pack.x64.tar";

async function resolveSparticuzExecutable(
  chromium: Awaited<typeof import("@sparticuz/chromium")>["default"],
): Promise<string> {
  const binPath = path.join(process.cwd(), "node_modules/@sparticuz/chromium/bin");
  if (fs.existsSync(binPath)) return chromium.executablePath(binPath);
  return chromium.executablePath(SPARTICUZ_CHROMIUM_PACK_URL);
}

async function launchPdfBrowser(): Promise<Browser> {
  if (isServerless) {
    const sparticuzChromium = await import("@sparticuz/chromium");
    const chromium = sparticuzChromium.default;
    // CV PDF is static HTML/CSS — skip WebGL/swiftshader for stability on Lambda.
    chromium.setGraphicsMode = false;
    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await resolveSparticuzExecutable(chromium),
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({ headless: true });
}

async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser?.isConnected()) return sharedBrowser;
  sharedBrowser = await launchPdfBrowser();
  return sharedBrowser;
}

async function closeSharedBrowser(): Promise<void> {
  if (!sharedBrowser) return;
  try {
    await sharedBrowser.close();
  } finally {
    sharedBrowser = null;
  }
}

function isBrowserClosedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /browser has been closed|target page, context or browser has been closed/i.test(msg);
}

export function loadPrintCss(): string {
  const file = path.join(process.cwd(), "public", "cv-print.css");
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return `body{font-family:system-ui,sans-serif;margin:0;color:#0f172a;}
.cv-print-root{font-size:11pt;}`;
  }
}

/** Dynamic imports keep `react-dom/server` out of the App Router static graph (Next 16 / Turbopack). */
export async function buildCvPrintHtml(cv: CVData, css: string): Promise<string> {
  const [{ renderToStaticMarkup }, { Document }] = await Promise.all([
    import("react-dom/server"),
    import("@/components/print/Document"),
  ]);
  const inner = renderToStaticMarkup(
    createElement(Document, { cv, variant: "pdf" }),
  );
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${css}</style>
</head>
<body style="margin:0;background:#fff;">${inner}</body>
</html>`;
}

async function renderPageToPdf(page: Page, html: string, cv: CVData): Promise<Buffer> {
  await page.setContent(html, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  const footerTemplate = buildPdfFooterTemplate(cv);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate,
    margin: { top: "16mm", bottom: pdfBottomMarginForTemplate(cv), left: "8mm", right: "8mm" },
  });
  return Buffer.from(pdf);
}

async function renderWithDedicatedBrowser(html: string, cv: CVData): Promise<Buffer> {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    try {
      return await renderPageToPdf(page, html, cv);
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

async function renderWithSharedBrowser(html: string, cv: CVData): Promise<Buffer> {
  const browser = await getSharedBrowser();
  const page = await browser.newPage();
  try {
    return await renderPageToPdf(page, html, cv);
  } catch (e) {
    await closeSharedBrowser().catch(() => {});
    throw e;
  } finally {
    await page.close().catch(() => {});
  }
}

export async function renderCvToPdfBuffer(cv: CVData): Promise<Buffer> {
  const css = loadPrintCss();
  const html = await buildCvPrintHtml(cv, css);

  if (isServerless) {
    try {
      return await renderWithDedicatedBrowser(html, cv);
    } catch (e) {
      if (isBrowserClosedError(e)) {
        return renderWithDedicatedBrowser(html, cv);
      }
      throw e;
    }
  }

  return renderWithSharedBrowser(html, cv);
}
