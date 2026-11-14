import type { ArticleAnalysis } from "./analysis.schema";
import { normalizeForMatch, quoteAppearsInText } from "./quote-check";

export type ExcerptCheck = { excerpt: string; found: boolean };

/** Every excerpt the AI cited in an article analysis, in display order, without duplicates. */
export function collectExcerpts(a: ArticleAnalysis): string[] {
  const all = [
    ...a.actors.map((x) => x.excerpt),
    ...a.emphases.map((x) => x.excerpt),
    ...a.language.examples.map((x) => x.excerpt),
    ...a.statements.map((x) => x.excerpt),
  ].filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return [...new Set(all)];
}

/** Snapshot of the verification result, so it survives without storing the article text. */
export function checkExcerpts(a: ArticleAnalysis, source: string): ExcerptCheck[] {
  return collectExcerpts(a).map((excerpt) => ({ excerpt, found: quoteAppearsInText(excerpt, source) }));
}

/** Looks up a stored verification result; null when this excerpt was never checked. */
export function excerptLookup(checks: unknown): (excerpt: string | null) => boolean | null {
  const map = new Map<string, boolean>();
  if (Array.isArray(checks)) {
    for (const c of checks) {
      if (c && typeof c === "object" && typeof c.excerpt === "string" && typeof c.found === "boolean") {
        map.set(normalizeForMatch(c.excerpt), c.found);
      }
    }
  }
  return (excerpt) => (excerpt ? (map.get(normalizeForMatch(excerpt)) ?? null) : null);
}
