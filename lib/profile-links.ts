export const LINKEDIN_HANDLE_PREFIX = "linkedin.com/in/";
export const GITHUB_HANDLE_PREFIX = "github.com/";

function stripUrlNoise(raw?: string): string {
  return (raw ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
}

function firstPathSegment(value: string): string {
  return value.replace(/\/+$/, "").split(/[/?#]/)[0] ?? "";
}

export function parseLinkedInHandle(raw?: string): string {
  const v = stripUrlNoise(raw);
  if (!v) return "";
  const match = v.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (match?.[1]) return firstPathSegment(match[1]);
  return firstPathSegment(v);
}

export function parseGitHubHandle(raw?: string): string {
  const v = stripUrlNoise(raw);
  if (!v) return "";
  const match = v.match(/github\.com\/([^/?#]+)/i);
  if (match?.[1]) return firstPathSegment(match[1]);
  return firstPathSegment(v);
}

export function composeLinkedInValue(handle: string): string {
  const h = parseLinkedInHandle(handle);
  return h ? `${LINKEDIN_HANDLE_PREFIX}${h}` : "";
}

export function composeGitHubValue(handle: string): string {
  const h = parseGitHubHandle(handle);
  return h ? `${GITHUB_HANDLE_PREFIX}${h}` : "";
}
