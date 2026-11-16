import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { BarList, Panel, Section } from "@/components/analysis-ui";
import { EmptyState, WorkspaceHeader } from "@/components/workspace-ui";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SOURCE_TYPES } from "@/lib/analysis.schema";
import { compareSaved, type CompareItem } from "@/lib/saved-compare";
import { parseIdList } from "@/lib/id-list";
import { analysesByIdsQuery, analysesQuery, formatDate, parseStoredAnalysis } from "@/lib/workspace";

type CompareSearch = { ids?: string | undefined };

export const Route = createFileRoute("/_authenticated/darbo-erdve/palyginimas")({
  validateSearch: (search: Record<string, unknown>): CompareSearch => ({
    ids: typeof search["ids"] === "string" ? search["ids"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Išsaugotų analizių palyginimas – PERSPEKTYVA" },
      { name: "description", content: "Palyginkite kelias išsaugotas analizes: temas, šaltinius, veikėjus, antraštes, toną ir perspektyvas." },
      { property: "og:title", content: "Išsaugotų analizių palyginimas – PERSPEKTYVA" },
      { property: "og:description", content: "Kelių išsaugotų straipsnių analizių palyginimas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedComparePage,
});

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function SavedComparePage() {
  const { ids: idsParam } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const ids = useMemo(() => parseIdList(idsParam), [idsParam]);
  const all = useQuery(analysesQuery());
  const chosen = useQuery({ ...analysesByIdsQuery(ids), enabled: ids.length >= 2 });

  function toggle(id: string, on: boolean) {
    const next = on ? [...ids, id] : ids.filter((x) => x !== id);
    void navigate({ search: { ids: next.length ? next.join(",") : undefined }, replace: true });
  }

  const items: CompareItem[] = useMemo(() => {
    const rows = chosen.data ?? [];
    return ids
      .map((id) => rows.find((r) => r.id === id))
      .flatMap((r) => {
        const analysis = r ? parseStoredAnalysis(r.analysis) : null;
        return r && analysis ? [{ id: r.id, title: r.title || r.topic, portal: r.portal, analysis }] : [];
      });
  }, [chosen.data, ids]);

  const tag = (id: string) => LETTERS[items.findIndex((i) => i.id === id)] ?? "?";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <WorkspaceHeader
        kicker="Mano darbo erdvė"
        title="Analizių palyginimas"
        intro="Pasirinkite bent dvi išsaugotas analizes. Palyginimas sudaromas iš jau išsaugotų rezultatų – nauja DI analizė nevykdoma."
      />

      <Section kicker="Pasirinkimas" title="Lyginamos analizės" className="mt-10">
        {all.isLoading ? (
          <p className="text-sm text-muted-foreground">Įkeliama…</p>
        ) : !all.data?.length ? (
          <EmptyState title="Dar nėra išsaugotų analizių">
            <Link to="/straipsnis" search={{ url: undefined }} className="underline underline-offset-4">Analizuokite straipsnį</Link> ir jį išsaugokite.
          </EmptyState>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {all.data.map((a) => {
              const on = ids.includes(a.id);
              const inputId = `pick-${a.id}`;
              return (
                <li key={a.id}>
                  <label
                    htmlFor={inputId}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${on ? "border-foreground bg-card" : "border-border"}`}
                  >
                    <Checkbox id={inputId} checked={on} onCheckedChange={(v) => toggle(a.id, v === true)} className="mt-0.5" />
                    <span>
                      <span className="font-serif text-base">{a.title || a.topic}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {a.portal || "Portalas nenurodytas"} · {formatDate(a.analyzed_at)}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {ids.length < 2 ? (
        <p className="mt-8 text-sm text-muted-foreground">Pažymėkite bent dvi analizes, kad pamatytumėte palyginimą.</p>
      ) : chosen.isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Įkeliama…</p>
      ) : chosen.isError ? (
        <p className="mt-8 text-sm text-destructive">{chosen.error.message}</p>
      ) : items.length < 2 ? (
        <p className="mt-8 text-sm text-muted-foreground">Pasirinktų analizių nepavyko įkelti arba jų nepakanka palyginimui.</p>
      ) : (
        <CompareResult items={items} tag={tag} />
      )}
    </div>
  );
}

function CompareResult({ items, tag }: { items: CompareItem[]; tag: (id: string) => string }) {
  const c = useMemo(() => compareSaved(items), [items]);
  const usedTypes = SOURCE_TYPES.filter((t) => c.sourceTotals.some((s) => s.label === t));
  const n = items.length;

  return (
    <div className="mt-12 space-y-12">
      <div className="flex gap-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          Panašios temos, veikėjai ir perspektyvos sugrupuoti automatiškai pagal žodžių sutapimą – tai pagalbinis
          grupavimas, ne DI ar redakcinė išvada. Palyginimas apima tik šias {n} analizes ir neatspindi bendros portalų krypties.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.id} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-ink font-mono text-xs text-ink-foreground">{tag(it.id)}</span>
            <Link to="/darbo-erdve/$id" params={{ id: it.id }} className="text-sm hover:underline">
              <span className="font-serif text-base">{it.title}</span>
              <span className="block text-xs text-muted-foreground">{it.portal || "Portalas nenurodytas"}</span>
            </Link>
          </li>
        ))}
      </ol>

      <Section kicker="01" title="Dominuojančios temos">
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="space-y-3 text-sm">
            {items.map((it) => (
              <li key={it.id}><Tag>{tag(it.id)}</Tag> {it.analysis.topic}</li>
            ))}
          </ul>
          <Panel>
            <p className="kicker mb-2">Pasikartojančios temos</p>
            {c.sharedTopics.length ? (
              <ul className="space-y-2 text-sm">
                {c.sharedTopics.map((g) => (
                  <li key={g.label}>{g.label} <span className="font-mono text-xs text-muted-foreground">· {g.itemIds.map(tag).join(", ")}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Panašiai suformuluotų temų nerasta – analizės gali būti apie skirtingus dalykus.</p>
            )}
          </Panel>
        </div>
      </Section>

      <Section kicker="02" title="Informacijos šaltiniai">
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="kicker p-3 font-normal">Šaltinio tipas</th>
                  {items.map((it) => <th key={it.id} className="p-3 text-center font-mono text-xs">{tag(it.id)}</th>)}
                </tr>
              </thead>
              <tbody>
                {usedTypes.map((t) => (
                  <tr key={t} className="border-t border-border">
                    <th scope="row" className="p-3 text-left font-normal">{t}</th>
                    {c.sources.map((s) => <td key={s.id} className="p-3 text-center font-mono">{s.counts[t] || "–"}</td>)}
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted/50">
                  <th scope="row" className="kicker p-3 text-left font-normal">Iš viso</th>
                  {c.sources.map((s) => <td key={s.id} className="p-3 text-center font-mono">{s.total}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="kicker mb-3">Visose analizėse kartu</p>
            {c.sourceTotals.length ? <BarList items={c.sourceTotals} /> : <p className="text-sm text-muted-foreground">Šaltinių neišskirta.</p>}
          </div>
        </div>
      </Section>

      <Section kicker="03" title="Cituojami veikėjai">
        {c.sharedActors.length ? (
          <div className="mb-6">
            <p className="kicker mb-2">Minimi keliose analizėse</p>
            <ul className="flex flex-wrap gap-2">
              {c.sharedActors.map((a) => (
                <li key={a.name}><Badge variant="muted">{a.name} · {a.itemIds.map(tag).join(", ")}</Badge></li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">Bendrų veikėjų nerasta.</p>
        )}
        <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {c.actors.map((a) => (
            <li key={a.name} className="flex items-baseline justify-between gap-3 border-b border-border py-1.5">
              <span>
                {a.name}
                <span className="text-muted-foreground"> – {a.roles.join("; ") || a.sourceType}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{a.itemIds.map(tag).join(", ")}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="04" title="Antraštės ir tonas">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="kicker w-10 p-3 font-normal" />
                <th className="kicker p-3 font-normal">Antraštė</th>
                <th className="kicker p-3 font-normal">Ar atitinka turinį</th>
                <th className="kicker p-3 font-normal">Tonas</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {items.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{tag(it.id)}</td>
                  <td className="p-3 font-serif text-base">{it.title}</td>
                  <td className="p-3">
                    <Badge variant={it.analysis.headline.fit === "atitinka" ? "verified" : "unverified"}>{it.analysis.headline.fit}</Badge>
                    <p className="mt-1.5 text-muted-foreground">{it.analysis.headline.explanation}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={it.analysis.language.tone === "neutralus" ? "verified" : "unverified"}>{it.analysis.language.tone}</Badge>
                    <p className="mt-1.5 text-muted-foreground">{it.analysis.language.summary}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tonų pasiskirstymas: {c.tones.map((t) => `${t.label} (${t.count})`).join(", ")}.
        </p>
      </Section>

      <Section kicker="05" title="Trūkstamos perspektyvos">
        {c.recurringPerspectives.length ? (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {c.recurringPerspectives.map((g) => (
              <Panel key={g.label}>
                <p className="kicker mb-1">Pasikartoja · {[...new Set(g.entries.map((e) => e.itemId))].map(tag).join(", ")}</p>
                <h3 className="text-lg font-medium">{g.label}</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {g.entries.map((e, i) => <li key={i}><Tag>{tag(e.itemId)}</Tag> {e.reason}</li>)}
                </ul>
              </Panel>
            ))}
          </div>
        ) : (
          <p className="mb-6 text-sm text-muted-foreground">Pasikartojančių trūkstamų perspektyvų nerasta.</p>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.id}>
              <p className="kicker mb-2"><Tag>{tag(it.id)}</Tag> {it.portal || "Portalas nenurodytas"}</p>
              {it.analysis.missing_perspectives.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {it.analysis.missing_perspectives.map((m, i) => <li key={i}>{m.perspective}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Analizėje nenurodyta.</p>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Tag({ children }: { children: string }) {
  return <span className="mr-1 inline-block rounded-sm border border-border px-1.5 font-mono text-xs">{children}</span>;
}
