/** Normalises text so quote matching ignores typographic quotes, dashes, case and spacing. */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[„“”"«»‘’'`]/g, "")
    .replace(/[‐-―−]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when an excerpt quoted by the AI really appears in the source text.
 * Ellipses inside the excerpt split it into fragments that must all appear in order.
 * Very short excerpts (under 8 characters) are never treated as verified.
 */
export function quoteAppearsInText(quote: string, source: string): boolean {
  const q = normalizeForMatch(quote);
  if (q.length < 8) return false;
  const s = normalizeForMatch(source);
  const parts = q
    .split(/\.\.\.|\[\.\.\.\]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  let from = 0;
  for (const part of parts) {
    const idx = s.indexOf(part, from);
    if (idx === -1) return false;
    from = idx + part.length;
  }
  return parts.length > 0;
}
