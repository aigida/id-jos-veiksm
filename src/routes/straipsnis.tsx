import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AssistNote } from "@/components/analysis-ui";
import { ArticleResult } from "@/components/article-result";
import { SaveAnalysisButton } from "@/components/save-analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeArticle, fetchArticle } from "@/lib/analysis.functions";
import { checkExcerpts } from "@/lib/excerpts";
import { stashPendingAnalysis, takePendingAnalysis, type PendingAnalysis } from "@/lib/pending-analysis";
import { quoteAppearsInText } from "@/lib/quote-check";
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
  const [analyzedMeta, setAnalyzedMeta] = useState<Form | null>(null);
  const [restored, setRestored] = useState<PendingAnalysis["result"] | null>(null);
  const navigate = useNavigate();
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
      setAnalyzedMeta(f);
      setRestored(null);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    onError: (e) => toast.error(e instanceof Error && e.message.includes("200") ? "Tekstas per trumpas analizei." : "Analizės atlikti nepavyko."),
  });

  // Restore an unsaved analysis kept while the user went to sign in.
  useEffect(() => {
    const pending = takePendingAnalysis();
    if (!pending) return;
    setForm(pending.form);
    setIsSample(pending.isSample);
    setAnalyzedText(pending.form.text);
    setAnalyzedMeta(pending.form);
    setRestored(pending.result);
    toast.success("Jūsų analizė atkurta – dabar galite ją išsaugoti.");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, []);

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

  const result = analyzeMutation.data?.ok ? analyzeMutation.data : restored;
  const meta = analyzedMeta ?? form;

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
            check={(x) => (x ? quoteAppearsInText(x, analyzedText) : null)}
            meta={meta}
            isSample={isSample}
            actions={
              <SaveAnalysisButton
                key={result.analyzedAt}
                build={() => ({
                  title: meta.title || result.data.topic,
                  url: meta.url,
                  portal: meta.portal,
                  publishedDate: meta.date,
                  analysis: result.data,
                  excerptChecks: checkExcerpts(result.data, analyzedText),
                  analyzedAt: result.analyzedAt,
                  model: result.model,
                  isSample,
                })}
                onNeedSignIn={() => {
                  stashPendingAnalysis({ form: { ...meta, text: analyzedText }, result, isSample });
                  void navigate({ to: "/auth", search: { redirect: "/straipsnis" } });
                }}
              />
            }
          />
        ) : null}
      </div>
    </div>
  );
}

