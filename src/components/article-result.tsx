import type { ReactNode } from "react";

import { Excerpt, InsufficientData, MetaRow, Panel, Section, formatDateTime } from "@/components/analysis-ui";
import { Badge } from "@/components/ui/badge";
import type { ArticleAnalysis } from "@/lib/analysis.schema";
import { cn } from "@/lib/utils";

export type ArticleMeta = { title: string; portal: string; date: string; url: string };

/**
 * Full article-analysis view. `check` returns whether an excerpt was found in the article text
 * (live text on the analysis page, stored snapshot in the workspace).
 */
export function ArticleResult({
  data,
  analyzedAt,
  check,
  meta,
  isSample,
  actions,
  className,
}: {
  data: ArticleAnalysis;
  analyzedAt: string;
  check: (excerpt: string | null) => boolean | null;
  meta: ArticleMeta;
  isSample: boolean;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-16 space-y-12", className)}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="kicker">Analizės rezultatas</p>
          <Badge variant="muted">DI analizė</Badge>
          {isSample ? <Badge variant="demo">Pavyzdinis tekstas</Badge> : null}
        </div>
        <h2 className="mt-3 text-3xl font-medium sm:text-4xl">{meta.title || data.topic}</h2>
        {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}
        <div className="mt-5">
          <MetaRow
            items={[
              { label: "Portalas", value: meta.portal || "Nenurodytas" },
              { label: "Publikuota", value: meta.date || "Nenurodyta" },
              { label: "Analizuota", value: formatDateTime(analyzedAt) },
              {
                label: "Nuoroda",
                value: meta.url ? (
                  <a href={meta.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    Atidaryti
                  </a>
                ) : (
                  "Nepateikta"
                ),
              },
            ]}
          />
        </div>
      </div>

      {!data.sufficient_data ? (
        <InsufficientData>Pateiktame tekste nepakanka informacijos kai kurioms išvadoms. Žr. ribotumus.</InsufficientData>
      ) : null}

      <Section kicker="Tema" title="Pagrindinė mintis">
        <p className="max-w-3xl font-serif text-xl leading-relaxed">{data.main_idea}</p>
        <div className="mt-6 max-w-3xl rounded-md border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker">Antraštė ir tekstas</span>
            <Badge variant={data.headline.fit === "atitinka" ? "verified" : data.headline.fit === "nepakanka duomenų" ? "muted" : "unverified"}>
              {data.headline.fit}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.headline.explanation}</p>
        </div>
      </Section>

      <Section kicker="Kas kalba?" title="Šaltiniai ir pašnekovai">
        {data.actors.length === 0 ? (
          <InsufficientData>Tekste nerasta aiškiai įvardytų šaltinių ar pašnekovų.</InsufficientData>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.actors.map((a, i) => (
              <Panel key={`${a.name}-${i}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-medium">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">{a.role}</p>
                  </div>
                  <Badge variant="outline">{a.source_type}</Badge>
                </div>
                <Excerpt text={a.excerpt} found={check(a.excerpt)} />
              </Panel>
            ))}
          </div>
        )}
      </Section>

      <Section kicker="Akcentai" title="Kas pabrėžiama">
        <ol className="space-y-5">
          {data.emphases.map((e, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[2rem_1fr]">
              <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-medium">{e.point}</p>
                <Excerpt text={e.excerpt} found={check(e.excerpt)} />
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        kicker="Kalba"
        title="Kalbos tonas"
        aside={<Badge variant={data.language.tone === "neutralus" ? "verified" : "unverified"}>{data.language.tone}</Badge>}
      >
        <p className="max-w-3xl text-muted-foreground">{data.language.summary}</p>
        {data.language.examples.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.language.examples.map((ex, i) => (
              <Panel key={i}>
                <Excerpt text={ex.excerpt} found={check(ex.excerpt)} className="mt-0" />
                <p className="mt-3 text-sm text-muted-foreground">{ex.comment}</p>
              </Panel>
            ))}
          </div>
        ) : null}
      </Section>

      <Section kicker="Atskyrimas" title="Faktai, citatos, komentarai, nuomonės">
        <div className="divide-y divide-border border-y border-border">
          {data.statements.map((s, i) => (
            <div key={i} className="grid gap-2 py-4 sm:grid-cols-[140px_1fr]">
              <span className="kicker pt-1">{s.type}</span>
              <div>
                <Excerpt text={s.excerpt} found={check(s.excerpt)} className="mt-0" />
                <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-10 md:grid-cols-2">
        <Section kicker="Ko neparodo?" title="Galimai neįtrauktos perspektyvos">
          <ul className="space-y-4">
            {data.missing_perspectives.map((m, i) => (
              <li key={i}>
                <p className="font-medium">{m.perspective}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.reason}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section kicker="Kam paskambinti?" title="Papildomi šaltiniai">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {data.additional_sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section kicker="Tolesniam tyrimui" title="Klausimai žurnalistui">
        <ol className="grid gap-3 md:grid-cols-2">
          {data.follow_up_questions.map((q, i) => (
            <li key={i} className="rounded-md bg-ink p-4 font-serif text-lg leading-snug text-ink-foreground">
              {q}
            </li>
          ))}
        </ol>
      </Section>

      <Section kicker="Neapibrėžtumas" title="Analizės ribotumai">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {data.limitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
          <li>Analizė remiasi tik vienu straipsniu ir negali būti taikoma viso portalo redakcinei krypčiai.</li>
        </ul>
      </Section>
    </div>
  );
}
