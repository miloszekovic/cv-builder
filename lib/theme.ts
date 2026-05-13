export const THEME_STORAGE_KEY = "cv-gen-theme";

export type AppTheme = "light" | "dark";

export function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light") return "light";
    return "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  notifyThemeListeners();
}

const themeListeners = new Set<() => void>();

export function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function notifyThemeListeners() {
  for (const l of themeListeners) l();
}

/** Inline in layout; must stay in sync with readStoredTheme. */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var t=localStorage.getItem(k);var r=document.documentElement;if(t==="light"){r.classList.remove("dark");}else{r.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`;
