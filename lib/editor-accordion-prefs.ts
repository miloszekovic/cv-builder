export const EDITOR_ACCORDION_PREFS_KEY = "cv-gen-editor-accordions";

export type EditorAccordionPrefKey =
  | "sidebar.details"
  | "sidebar.education"
  | "sidebar.skills"
  | "sidebar.certificates"
  | "sidebar.languages"
  | "sidebar.hobbies";

export type EditorAccordionPrefs = Partial<Record<EditorAccordionPrefKey, boolean>>;

function safeParsePrefs(raw: string | null): EditorAccordionPrefs {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as EditorAccordionPrefs;
  } catch {
    return {};
  }
}

export function readEditorAccordionPrefs(): EditorAccordionPrefs {
  if (typeof window === "undefined") return {};
  try {
    return safeParsePrefs(localStorage.getItem(EDITOR_ACCORDION_PREFS_KEY));
  } catch {
    return {};
  }
}

export function readEditorAccordionPref(
  key: EditorAccordionPrefKey,
  defaultOpen: boolean,
): boolean {
  const prefs = readEditorAccordionPrefs();
  return prefs[key] ?? defaultOpen;
}

export function writeEditorAccordionPref(key: EditorAccordionPrefKey, open: boolean) {
  if (typeof window === "undefined") return;
  try {
    const prefs = readEditorAccordionPrefs();
    prefs[key] = open;
    localStorage.setItem(EDITOR_ACCORDION_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}
