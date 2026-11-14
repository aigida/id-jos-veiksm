const KEY = "perspektyva:after-auth";

/** Accepts only same-origin relative paths ("/x"), never "//host" or absolute URLs. */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return null;
  if (/^\/[a-z]+:/i.test(v)) return null;
  if (v.startsWith("/auth") || v.startsWith("/reset-password")) return null;
  return v;
}

export function rememberAfterAuth(path: unknown) {
  const safe = safeRedirectPath(path);
  if (!safe || typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, safe);
}

export function consumeAfterAuth(): string | null {
  if (typeof window === "undefined") return null;
  const v = safeRedirectPath(window.sessionStorage.getItem(KEY));
  window.sessionStorage.removeItem(KEY);
  return v;
}
