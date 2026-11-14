import type { ArticleAnalysis } from "./analysis.schema";

/** An unsaved analysis kept in this browser tab while the user signs in. Never sent anywhere. */
export type PendingAnalysis = {
  form: { url: string; title: string; portal: string; date: string; text: string };
  result: { data: ArticleAnalysis; analyzedAt: string; model: string };
  isSample: boolean;
};

const KEY = "perspektyva:pending-analysis";

export function stashPendingAnalysis(p: PendingAnalysis) {
  window.sessionStorage.setItem(KEY, JSON.stringify(p));
}

export function takePendingAnalysis(): PendingAnalysis | null {
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as PendingAnalysis;
  } catch {
    return null;
  }
}
