import { SOURCE_TYPES, type ArticleAnalysis } from "./analysis.schema";

export type CompareItem = { id: string; title: string; portal: string; analysis: ArticleAnalysis };

const clean = (s: string) =>
  s
    .toLowerCase()
    .replace(/[„“”"«»'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Crude Lithuanian-friendly stems: words of 4+ letters cut to 5 characters. */
export function stems(text: string): Set<string> {
  const words = clean(text).match(/[\p{L}]{4,}/gu) ?? [];
  return new Set(words.map((w) => w.slice(0, 5)));
}

/** Two phrases count as similar when they share enough word stems. */
export function similarPhrases(a: string, b: string): boolean {
  const sa = stems(a);
  const sb = stems(b);
  if (sa.size === 0 || sb.size === 0) return false;
  let shared = 0;
  for (const s of sa) if (sb.has(s)) shared++;
  const smaller = Math.min(sa.size, sb.size);
  const needed = smaller <= 2 ? 1 : 2;
  return shared >= needed && shared / smaller >= 0.5;
}

export type ActorAppearance = { name: string; roles: string[]; sourceType: string; itemIds: string[] };
export type PerspectiveGroup = { label: string; entries: { itemId: string; perspective: string; reason: string }[] };

export function compareSaved(items: CompareItem[]) {
  // Source types per analysis.
  const sources = items.map((it) => {
    const counts = Object.fromEntries(SOURCE_TYPES.map((t) => [t, 0])) as Record<string, number>;
    for (const a of it.analysis.actors) counts[a.source_type] = (counts[a.source_type] ?? 0) + 1;
    return { id: it.id, counts, total: it.analysis.actors.length };
  });
  const sourceTotals = SOURCE_TYPES.map((t) => ({
    label: t,
    count: sources.reduce((s, x) => s + (x.counts[t] ?? 0), 0),
  })).filter((x) => x.count > 0);

  // Actors, merged by normalised name.
  const actorMap = new Map<string, ActorAppearance>();
  for (const it of items) {
    for (const a of it.analysis.actors) {
      const key = clean(a.name);
      if (!key) continue;
      const cur = actorMap.get(key) ?? { name: a.name, roles: [], sourceType: a.source_type, itemIds: [] };
      if (a.role && !cur.roles.includes(a.role)) cur.roles.push(a.role);
      if (!cur.itemIds.includes(it.id)) cur.itemIds.push(it.id);
      actorMap.set(key, cur);
    }
  }
  const actors = [...actorMap.values()].sort((a, b) => b.itemIds.length - a.itemIds.length || a.name.localeCompare(b.name, "lt"));
  const sharedActors = actors.filter((a) => a.itemIds.length > 1);

  // Topics that share wording across analyses.
  const topicGroups: { label: string; itemIds: string[] }[] = [];
  for (const it of items) {
    const g = topicGroups.find((x) => similarPhrases(x.label, it.analysis.topic));
    if (g) g.itemIds.push(it.id);
    else topicGroups.push({ label: it.analysis.topic, itemIds: [it.id] });
  }

  // Missing perspectives grouped by similar wording.
  const perspectiveGroups: PerspectiveGroup[] = [];
  for (const it of items) {
    for (const m of it.analysis.missing_perspectives) {
      const g = perspectiveGroups.find((x) => x.entries.some((e) => similarPhrases(e.perspective, m.perspective)));
      const entry = { itemId: it.id, perspective: m.perspective, reason: m.reason };
      if (g) g.entries.push(entry);
      else perspectiveGroups.push({ label: m.perspective, entries: [entry] });
    }
  }
  const recurringPerspectives = perspectiveGroups.filter((g) => new Set(g.entries.map((e) => e.itemId)).size > 1);

  const toneCounts = new Map<string, number>();
  for (const it of items) toneCounts.set(it.analysis.language.tone, (toneCounts.get(it.analysis.language.tone) ?? 0) + 1);

  return {
    sources,
    sourceTotals,
    actors,
    sharedActors,
    topicGroups,
    sharedTopics: topicGroups.filter((g) => g.itemIds.length > 1),
    perspectiveGroups,
    recurringPerspectives,
    tones: [...toneCounts.entries()].map(([label, count]) => ({ label, count })),
  };
}
