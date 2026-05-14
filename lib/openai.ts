import OpenAI from "openai";
import type { CVData } from "./cv-schema";
import { cvDataSchemaForAi } from "./cv-schema";

export type GenerateCvTone = "professional" | "direct" | "friendly";
export type MaxCvLengthHint = "short" | "medium";

export interface GenerateCvInput {
  description: string;
  targetRole: string;
  tone: GenerateCvTone;
  maxCvLength?: MaxCvLengthHint;
}

const toneHints: Record<GenerateCvTone, string> = {
  professional: "Professional, confident, recruiter-friendly.",
  direct: "Direct, concise, minimal filler.",
  friendly: "Warm and approachable while staying credible.",
};

const lengthHints: Record<MaxCvLengthHint, string> = {
  short: "Keep the entire CV very compact to fit comfortably on 2 A4 pages.",
  medium: "Balance detail and brevity; aim to fit on 2 A4 pages.",
};

function buildSystemPrompt() {
  return [
    "You output ONLY valid JSON matching the user's CV schema. No markdown, no code fences, no commentary.",
    "Write concise, specific copy for front-end, UI, performance, accessibility, and AI-native engineering roles.",
    "Avoid generic filler phrases. Prefer concrete outcomes; use sensible estimates only when the user implies them.",
    "Never invent specific company names, job titles at real firms, exact dates, education, certificates, or languages unless the user clearly provided them.",
    "If information is missing, omit fields or use empty strings/empty arrays — do NOT fabricate employers or credentials.",
    "Keep bullets tight (ideally one line each). Limit experience entries unless the user clearly describes multiple roles.",
    "sidebar.skills: include categoryId and visibleTags arrays; only include tags that fit the user story (subset is fine).",
    "meta.sidebarPosition must be 'left' or 'right'. Default 'right'. meta.accent is optional; if omitted, the app uses teal.",
  ].join("\n");
}

function buildUserPrompt(input: GenerateCvInput) {
  const max = input.maxCvLength ? lengthHints[input.maxCvLength] : lengthHints.medium;
  return [
    `Target role: ${input.targetRole || "(unspecified)"}`,
    `Tone: ${toneHints[input.tone]}`,
    `Length: ${max}`,
    "",
    "User description:",
    input.description.trim() || "(empty)",
    "",
    "Return a single JSON object with keys: meta, body, sidebar — matching this TypeScript shape:",
    "{ meta: { versionName?, targetRole?, sidebarPosition: 'left'|'right', accent?: 'teal'|'ocean'|'lavender'|'rose'|'sage'|'clay'|'indigo' },",
    "  body: { image?, photoMode?: 'image'|'initials'|'none', name?, mainRole?, profile?, experience?: Array<{ role?, company?, startYear?, endYear?: number|'present', intro?, bullets?: string[], outro? }> },",
    "  sidebar: { details?: { location?, email?, phone?, website?, linkedIn?, gitHub? }, education?: Array<{ university?, title? }>,",
    "    skills?: Array<{ categoryId: 'frontEnd'|'uiUx'|'tools'|'aiAutomation'|'principles'|'cms'|'os', visibleTags: string[] }>,",
    "    certificates?: Array<{ year?, name? }>, languages?: Array<{ name?, level? }>, hobbiesText?: string } }",
  ].join("\n");
}

function parseJsonLoose(text: string): unknown {
  const trimmed = text.trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(unfenced) as unknown;
}

export async function generateCvWithOpenAI(
  input: GenerateCvInput,
): Promise<{ cv: CVData } | { error: string; code?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local.",
      code: "MISSING_OPENAI_KEY",
    };
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  const runOnce = async (repairHint?: string) => {
    const user = buildUserPrompt(input) + (repairHint ? `\n\n${repairHint}` : "");
    const res = await client.chat.completions.create({
      model,
      temperature: 0.35,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    });
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("Empty model response");
    return parseJsonLoose(content);
  };

  try {
    let parsed: unknown = await runOnce();
    let validated = cvDataSchemaForAi.safeParse(parsed);
    if (!validated.success) {
      parsed = await runOnce(
        "Your previous output failed validation. Return ONLY corrected JSON with the same schema. Fix types: endYear is number or the string 'present'. Ensure meta.sidebarPosition is 'left' or 'right'.",
      );
      validated = cvDataSchemaForAi.safeParse(parsed);
    }
    if (!validated.success) {
      return {
        error: "The model returned JSON that could not be validated. Try again or shorten your description.",
        code: "VALIDATION_ERROR",
      };
    }
    const cv = validated.data;
    cv.meta.targetRole = input.targetRole?.trim() || cv.meta.targetRole;
    return { cv };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI request failed";
    return { error: msg, code: "OPENAI_ERROR" };
  }
}
