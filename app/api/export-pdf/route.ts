import { NextResponse } from "next/server";
import { cvDataSchema } from "@/lib/cv-schema";
import { cvPdfDownloadFileName } from "@/lib/cv-pdf-filename";
import { renderCvToPdfBuffer } from "@/lib/render-cv-pdf";

export const runtime = "nodejs";
/** PDF render (Chromium cold start) — capped by Vercel plan. */
export const maxDuration = 60;

export async function POST(req: Request) {
  if (process.env.PDF_EXPORT_ENABLED === "false") {
    return NextResponse.json({ error: "PDF export disabled" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cvDataSchema.safeParse((body as { cv?: unknown })?.cv);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid CV payload" }, { status: 400 });
  }

  const cv = parsed.data;
  try {
    const pdf = await renderCvToPdfBuffer(cv);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cvPdfDownloadFileName(cv)}"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF render failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
