import { getCvAccent } from "./cv-accents";
import type { CVData } from "./cv-schema";
import { normalizeCvTemplate, type CvTemplateId } from "./cv-templates";

const pageNums = `<span class="pageNumber"></span> / <span class="totalPages"></span>`;

function footerShell(inner: string, extra = "") {
  return `<div style="width:100%;box-sizing:border-box;${extra}">${inner}</div>`;
}

const FOOTER_BUILDERS: Record<CvTemplateId, (accent: string) => string> = {
  classic: (accent) =>
    footerShell(
      `<div style="border-top:1px solid #cbd5e1;padding:4px 16mm 0;display:flex;justify-content:flex-end;font-family:Georgia,'Times New Roman',serif;">
<span style="font-size:8px;font-style:italic;color:#64748b;">Page ${pageNums}</span>
</div>`,
    ),

  modern: (accent) =>
    footerShell(
      `<div style="border-top:3px solid ${accent};padding:5px 16mm 0;display:flex;justify-content:space-between;align-items:baseline;font-family:ui-sans-serif,system-ui,sans-serif;">
<span style="font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#0f172a;">Curriculum vitae</span>
<span style="font-size:8px;font-weight:600;color:#475569;">${pageNums}</span>
</div>`,
    ),

  minimal: (accent) =>
    footerShell(
      `<div style="padding:7px 16mm 0;display:flex;justify-content:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<span style="font-size:7px;font-weight:400;letter-spacing:0.14em;color:#9ca3af;">${pageNums.replace(" / ", " · ")}</span>
</div>`,
    ),

  executive: () =>
    footerShell(
      `<div style="background:#0f172a;padding:5px 16mm;display:flex;justify-content:flex-end;font-family:ui-sans-serif,system-ui,sans-serif;">
<span style="font-size:7px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">Page ${pageNums.replace(" / ", " of ")}</span>
</div>`,
    ),

  studio: (accent) =>
    footerShell(
      `<div style="border-top:4px solid ${accent};padding:5px 16mm 0;display:flex;justify-content:flex-end;font-family:ui-sans-serif,system-ui,sans-serif;">
<span style="font-size:8px;font-weight:700;color:${accent};letter-spacing:0.04em;">${pageNums}</span>
</div>`,
    ),

  mono: () =>
    footerShell(
      `<div style="border-top:1px dashed #a1a1aa;padding:5px 16mm 0;display:flex;justify-content:flex-start;font-family:ui-monospace,'SF Mono',Consolas,monospace;">
<span style="font-size:8px;color:#52525b;">pg ${pageNums.replace(" / ", "/")}</span>
</div>`,
    ),

  nordic: () =>
    footerShell(
      `<div style="padding:9px 16mm 0;display:flex;justify-content:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<span style="font-size:7px;font-weight:300;letter-spacing:0.22em;text-transform:uppercase;color:#cbd5e1;">${pageNums.replace(" / ", " — ")}</span>
</div>`,
    ),
};

/** Playwright `footerTemplate` HTML — must use inline styles. */
export function buildPdfFooterTemplate(cv: CVData): string {
  const template = normalizeCvTemplate(cv.meta.template) ?? "classic";
  const accent = getCvAccent(cv.meta.accent).accent;
  return FOOTER_BUILDERS[template](accent);
}

/** Extra bottom margin for PDF when the footer needs more room (e.g. dark band). */
export function pdfBottomMarginForTemplate(cv: CVData): string {
  const template = normalizeCvTemplate(cv.meta.template) ?? "classic";
  return template === "executive" ? "16mm" : "14mm";
}
