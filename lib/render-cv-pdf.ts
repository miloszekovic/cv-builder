import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { chromium } from "playwright";
import { getCvAccent } from "./cv-accents";
import type { CVData } from "./cv-schema";

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
  const [{ renderToStaticMarkup }, { CVPrint }] = await Promise.all([
    import("react-dom/server"),
    import("@/components/print/CVPrint"),
  ]);
  const inner = renderToStaticMarkup(createElement(CVPrint, { cv }));
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

export async function renderCvToPdfBuffer(cv: CVData): Promise<Buffer> {
  const css = loadPrintCss();
  const html = await buildCvPrintHtml(cv, css);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const accentHex = getCvAccent(cv.meta.accent).accent;
    const footerTemplate = `<div style="width:100%;box-sizing:border-box;border-top:2px solid ${accentHex};padding:5px 12mm 0;display:flex;justify-content:flex-end;font-family:ui-sans-serif,system-ui,sans-serif,-apple-system,sans-serif;">
<span style="font-size:8px;font-style:italic;font-weight:400;color:#94a3b8;letter-spacing:0.03em;line-height:1.25;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate,
      margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
