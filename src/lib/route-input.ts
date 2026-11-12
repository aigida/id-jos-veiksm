import { findPortal } from "./portals";

export type InputTarget =
  | { kind: "article"; url: string }
  | { kind: "portal"; q: string }
  | { kind: "topic"; tema: string }
  | { kind: "empty" };

/**
 * Decides where the home-page search box sends the user:
 * an article link → article analysis, a portal name/domain → portal analysis,
 * anything else → topic comparison.
 */
export function classifyInput(raw: string): InputTarget {
  const value = raw.trim();
  if (!value) return { kind: "empty" };

  const looksLikeUrl = /^https?:\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+\/\S+/.test(value);
  if (looksLikeUrl) {
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const parsed = new URL(url);
      const hasPath = parsed.pathname.replace(/\/+$/, "").length > 0;
      if (hasPath) return { kind: "article", url: parsed.toString() };
      return { kind: "portal", q: parsed.hostname.replace(/^www\./, "") };
    } catch {
      // fall through to other checks
    }
  }

  const portal = findPortal(value);
  if (portal) return { kind: "portal", q: portal.domain };

  return { kind: "topic", tema: value };
}
