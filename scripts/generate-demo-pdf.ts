import fs from "node:fs";
import path from "node:path";
import { exampleCvData } from "../lib/default-cv-data";
import { renderCvToPdfBuffer } from "../lib/render-cv-pdf";

async function main() {
  const cv = exampleCvData();
  const pdf = await renderCvToPdfBuffer(cv);
  const outDir = path.join(process.cwd(), "output", "pdf");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "demo-cv.pdf");
  fs.writeFileSync(outPath, pdf);
  console.log(`Wrote ${outPath} (${pdf.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});