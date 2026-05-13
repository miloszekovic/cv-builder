import { NextResponse } from "next/server";
import { generateCvWithOpenAI } from "@/lib/openai";
import type { GenerateCvInput } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Partial<GenerateCvInput>;
  if (!b || typeof b.description !== "string") {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  const input: GenerateCvInput = {
    description: b.description,
    targetRole: typeof b.targetRole === "string" ? b.targetRole : "",
    tone:
      b.tone === "direct" || b.tone === "friendly" || b.tone === "professional"
        ? b.tone
        : "professional",
    maxCvLength:
      b.maxCvLength === "short" || b.maxCvLength === "medium"
        ? b.maxCvLength
        : undefined,
  };

  const result = await generateCvWithOpenAI(input);
  if ("error" in result) {
    const status =
      result.code === "MISSING_OPENAI_KEY"
        ? 503
        : result.code === "VALIDATION_ERROR"
          ? 422
          : 500;
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status },
    );
  }

  return NextResponse.json({ cv: result.cv });
}
