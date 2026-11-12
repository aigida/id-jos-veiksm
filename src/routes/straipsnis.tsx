import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  AssistNote,
  Excerpt,
  InsufficientData,
  MetaRow,
  Panel,
  Section,
  formatDateTime,
} from "@/components/analysis-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeArticle, fetchArticle } from "@/lib/analysis.functions";
import type { ArticleAnalysis } from "@/lib/analysis.schema";
import { portalFromUrl } from "@/lib/portals";
import { SAMPLE_ARTICLE } from "@/lib/sample-article";

type ArticleSearch = { url?: string | undefined };

export const Route = createFileRoute("/straipsnis")({
  validateSearch: (search: Record<string, unknown>): ArticleSearch => ({
    url: typeof search["url"] === "string" ? search["url"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Straipsnio analizė – PERSPEKTYVA" },
      {
        name: "description",
        content: "Įklijuokite straipsnį – DI išskirs pagrindinę mintį, pašnekovus, kalbos toną, faktus ir nuomones bei trūkstamas perspektyvas.",
      },
      { property: "og:title", content: "Straipsnio analizė – PERSPEKTYVA" },
      {
        property: "og:description",
        content: "Straipsnio šaltinių, kalbos ir perspektyvų analizė su pažodžiui patikrintomis ištraukomis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

type Form = { url: string; title: string; portal: string; date: string; text: string };

function ArticlePage() {
  const { url: initialUrl } = Route.useSearch();
  const [form, setForm] = useState<Form>({
    url: initialUrl ?? "",
    title: "",
    portal: initialUrl ? (portalFromUrl(initialUrl)?.name ?? "") : "",
    date: "",
    text: "",
  });
  const [isSample, setIsSample] = useState(false);
  const [analyzedText, setAnalyzedText] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const fetchFn = useServerFn(fetchArticle);
  const analyzeFn = useServerFn(analyzeArticle);

  const fetchMutation = useMutation({
    mutationFn: (url: string) => fetchFn({ data: { url } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setIsSample(false);
      setForm((f) => ({
        ...f,
        title: res.title || f.title,
        date: res.date || f.date,
        portal: portalFromUrl(res.url)?.name ?? res.portal,
        text: res.text,
      }));
      toast.success("Straipsnio tekstas gautas. Peržiūrėkite ir paleiskite analizę.");
    },
    onError: () => toast.error("Nepavyko gauti teksto. Įklijuokite jį rankiniu būdu."),
  });

  const analyzeMutation = useMutation({
    mutationFn: (f: Form) => analyzeFn({ data: f }),
    onSuccess: (res, f) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setAnalyzedText(f.text);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    onError: (e) => toast.error(e instanceof Error && e.message.includes("200") ? "Tekstas per trumpas analizei." : "Analizės atlikti nepavyko."),
  });

  const autoFetched = useRef(false);
  useEffect(() => {
    if (initialUrl && !autoFetched.current) {
      autoFetched.current = true;
      fetchMutation.mutate(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function loadSample() {
    setIsSample(true);
    setForm({ url: "", title: SAMPLE_ARTICLE.title, portal: SAMPLE_ARTICLE.portal, date: SAMPLE_ARTICLE.date, text: SAMPLE_ARTICLE.text });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.text.trim().length < 200) {
      toast.error("Įklijuokite straipsnio tekstą (mažiausiai 200 simbolių).");
      return;
    }
    analyzeMutation.mutate(form);
  }

  const result = analyzeMutation.data?.ok ? analyzeMutation.data : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <p className="kicker mb-3">02 · Straipsnio analizė</p>
      <h1 className="text-4xl font-normal sm:text-5xl">Kaip rašo?</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Įklijuokite straipsnio tekstą arba nuorodą. DI analizuoja tik tai, kas pateikta, ir kiekvieną išvadą
        pagrindžia ištrauka.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url" className="kicker">Straipsnio nuoroda (nebūtina)</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="url"
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
                placeholder="https://www.delfi.lt/…"
                className="h-11 bg-card"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                disabled={!form.url.trim() || fetchMutation.isPending}
                onClick={() => fetchMutation.mutate(form.url.trim())}
              >
                {fetchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="ml-1.5">Gauti tekstą</span>
              </Button>
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between">
              <Label htmlFor="text" className="kicker">Straipsnio tekstas</Label>
              <span className="font-mono text-xs text-muted-foreground">{form.text.length.toLocaleString("lt-LT")} simb.</span>
            </div>
            <Textarea
              id="text"
              value={form.text}
              onChange={(e) => {
                setIsSample(false);
                set("text", e.target.value);
              }}
              placeholder="Įklijuokite visą straipsnio tekstą…"
              className="mt-1.5 min-h-[320px] bg-card font-serif text-base leading-relaxed"
            />
            {isSample ? (
              <p className="mt-2 text-xs text-warning-foreground">
                Įkeltas sugalvotas pavyzdinis tekstas – jis nėra tikras straipsnis.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div>
            <Label htmlFor="title" className="kicker">Antraštė</Label>
            <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5 bg-card" />
          </div>
          <div>
            <Label htmlFor="portal" className="kicker">Portalas</Label>
            <Input id="portal" value={form.portal} onChange={(e) => set("portal", e.target.value)} placeholder="pvz. DELFI" className="mt-1.5 bg-card" />
          </div>
          <div>
            <Label htmlFor="date" className="kicker">Publikavimo data</Label>
            <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="mt-1.5 bg-card" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={analyzeMutation.isPending}>
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizuojama…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Analizuoti straipsnį
              </>
            )}
          </Button>
          {analyzeMutation.isPending ? (
            <p className="text-xs text-muted-foreground">Analizė gali užtrukti iki minutės.</p>
          ) : null}
          <Button type="button" variant="ghost" size="sm" className="w-full" onClick={loadSample}>
            <FileText className="mr-2 h-4 w-4" /> Išbandyti su pavyzdiniu tekstu
          </Button>
          <AssistNote />
        </aside>
      </form>

      <div ref={resultRef} className="scroll-mt-24">
        {result ? (
          <ArticleResult
            data={result.data}
            analyzedAt={result.analyzedAt}
            source={analyzedText}
            meta={form}
            isSample={isSample}
          />
        ) : null}
      </div>
    </div>
  );
}

function ArticleResult({
  data,
  analyzedAt,
  source,
  meta,
  isSample,
}: {
  data: ArticleAnalysis;
  analyzedAt: string;
  source: string;
  meta: Form;
  isSample: boolean;
}) {
  return (
    <div className="mt-16 space-y-12">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="kicker">Analizės rezultatas</p>
          <Badge variant="muted">DI analizė</Badge>
          {isSample ? <Badge variant="demo">Pavyzdinis tekstas</Badge> : null}
        </div>
        <h2 className="mt-3 text-3xl font-medium sm:text-4xl">{meta.title || data.topic}</h2>
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
                <Excerpt text={a.excerpt} source={source} />
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
                <Excerpt text={e.excerpt} source={source} />
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
                <Excerpt text={ex.excerpt} source={source} className="mt-0" />
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
                <Excerpt text={s.excerpt} source={source} className="mt-0" />
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
