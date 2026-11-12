import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Plus, Scale, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import {
  AssistNote,
  Excerpt,
  InsufficientData,
  Panel,
  Section,
  formatDateTime,
} from "@/components/analysis-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compareCoverage } from "@/lib/analysis.functions";
import type { Comparison } from "@/lib/analysis.schema";
import { PORTALS } from "@/lib/portals";
import { SAMPLE_COMPARISON } from "@/lib/sample-article";

type CompareSearch = { tema?: string | undefined };

export const Route = createFileRoute("/palyginimas")({
  validateSearch: (search: Record<string, unknown>): CompareSearch => ({
    tema: typeof search["tema"] === "string" ? search["tema"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Temos palyginimas – PERSPEKTYVA" },
      {
        name: "description",
        content: "Palyginkite, kaip skirtingi Lietuvos portalai nušviečia tą patį įvykį: antraštės, šaltiniai, akcentai ir spragos.",
      },
      { property: "og:title", content: "Temos palyginimas – PERSPEKTYVA" },
      {
        property: "og:description",
        content: "To paties įvykio nušvietimo palyginimas skirtinguose portaluose su pagrindžiančiomis ištraukomis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

type Slot = { id: number; portal: string; title: string; text: string };

let nextId = 3;

function ComparePage() {
  const { tema } = Route.useSearch();
  const [topic, setTopic] = useState(tema ?? "");
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, portal: "DELFI", title: "", text: "" },
    { id: 2, portal: "LRT", title: "", text: "" },
  ]);
  const [isSample, setIsSample] = useState(false);
  const [analyzed, setAnalyzed] = useState<Slot[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  const compareFn = useServerFn(compareCoverage);

  const mutation = useMutation({
    mutationFn: (input: { topic: string; slots: Slot[] }) =>
      compareFn({
        data: {
          topic: input.topic,
          articles: input.slots.map((s) => ({ portal: s.portal, title: s.title, text: s.text })),
        },
      }),
    onSuccess: (res, input) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setAnalyzed(input.slots);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    },
    onError: () => toast.error("Palyginimo atlikti nepavyko. Patikrinkite, ar visi tekstai pakankamo ilgio."),
  });

  function update(id: number, patch: Partial<Slot>) {
    setIsSample(false);
    setSlots((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function addSlot() {
    const used = new Set(slots.map((s) => s.portal));
    const portal = PORTALS.find((p) => !used.has(p.name))?.name ?? "";
    setSlots((s) => [...s, { id: nextId++, portal, title: "", text: "" }]);
  }

  function loadSample() {
    setIsSample(true);
    setTopic(SAMPLE_COMPARISON.topic);
    setSlots(SAMPLE_COMPARISON.articles.map((a) => ({ id: nextId++, ...a })));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const filled = slots.filter((s) => s.text.trim().length > 0);
    let problem = "";
    if (filled.length < 2) problem = "Palyginimui reikia bent dviejų straipsnių tekstų.";
    else if (filled.some((s) => s.text.trim().length < 200)) problem = "Kiekvienas tekstas turi būti bent 200 simbolių.";
    else if (filled.some((s) => !s.portal.trim())) problem = "Nurodykite kiekvieno straipsnio portalą.";
    if (problem) {
      toast.error(problem);
      return;
    }
    mutation.mutate({ topic, slots: filled });
  }

  const result = mutation.data?.ok ? mutation.data : null;
  const sourceFor = (portal: string, idx: number) =>
    analyzed.find((s) => s.portal === portal)?.text ?? analyzed[idx]?.text ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <p className="kicker mb-3">03 · Temos palyginimas</p>
      <h1 className="text-4xl font-normal sm:text-5xl">Kaip skirtingai rašo apie tą patį?</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Įklijuokite 2–6 straipsnius apie tą patį įvykį iš skirtingų portalų. Portalai lyginami tik pagal šių
        konkrečių tekstų požymius.
      </p>

      <datalist id="portal-list">
        {PORTALS.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="topic" className="kicker">Tema arba įvykis</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="pvz. gynybos finansavimo sprendimas"
              className="mt-1.5 h-11 bg-card"
            />
          </div>
          <Button type="button" variant="ghost" className="self-end" onClick={loadSample}>
            <FileText className="mr-2 h-4 w-4" /> Pavyzdiniai tekstai
          </Button>
        </div>

        {isSample ? (
          <p className="text-xs text-warning-foreground">
            Įkelti sugalvoti pavyzdiniai tekstai iš išgalvotų portalų – tai nėra tikri straipsniai.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {slots.map((s, i) => (
            <Panel key={s.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="kicker">Straipsnis {i + 1}</span>
                {slots.length > 2 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Pašalinti straipsnį ${i + 1}`}
                    onClick={() => setSlots((all) => all.filter((x) => x.id !== s.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <Input
                  aria-label={`Straipsnio ${i + 1} portalas`}
                  list="portal-list"
                  value={s.portal}
                  onChange={(e) => update(s.id, { portal: e.target.value })}
                  placeholder="Portalas"
                />
                <Input
                  aria-label={`Straipsnio ${i + 1} antraštė`}
                  value={s.title}
                  onChange={(e) => update(s.id, { title: e.target.value })}
                  placeholder="Antraštė"
                />
              </div>
              <Textarea
                aria-label={`Straipsnio ${i + 1} tekstas`}
                value={s.text}
                onChange={(e) => update(s.id, { text: e.target.value })}
                placeholder="Įklijuokite straipsnio tekstą…"
                className="min-h-[180px] font-serif leading-relaxed"
              />
              <p className="text-right font-mono text-xs text-muted-foreground">{s.text.length} simb.</p>
            </Panel>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {slots.length < 6 ? (
            <Button type="button" variant="outline" onClick={addSlot}>
              <Plus className="mr-1.5 h-4 w-4" /> Pridėti straipsnį
            </Button>
          ) : null}
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lyginama…
              </>
            ) : (
              <>
                <Scale className="mr-2 h-4 w-4" /> Palyginti
              </>
            )}
          </Button>
          {mutation.isPending ? <span className="text-xs text-muted-foreground">Gali užtrukti iki minutės.</span> : null}
        </div>
        <AssistNote />
      </form>

      <div ref={resultRef} className="scroll-mt-24">
        {result ? (
          <ComparisonResult data={result.data} analyzedAt={result.analyzedAt} sourceFor={sourceFor} isSample={isSample} />
        ) : null}
      </div>
    </div>
  );
}

function ComparisonResult({
  data,
  analyzedAt,
  sourceFor,
  isSample,
}: {
  data: Comparison;
  analyzedAt: string;
  sourceFor: (portal: string, idx: number) => string;
  isSample: boolean;
}) {
  return (
    <div className="mt-16 space-y-12">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="kicker">Palyginimo rezultatas · {formatDateTime(analyzedAt)}</p>
          <Badge variant="muted">DI analizė</Badge>
          {isSample ? <Badge variant="demo">Pavyzdiniai tekstai</Badge> : null}
        </div>
        <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed">{data.topic_summary}</p>
      </div>

      {!data.sufficient_data ? (
        <InsufficientData>Pateiktų tekstų nepakanka kai kurioms palyginimo išvadoms. Žr. ribotumus.</InsufficientData>
      ) : null}

      <Section kicker="Lentelė" title="Palyginimas">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="kicker w-40 p-3 font-normal">Aspektas</th>
                {data.portals.map((p, i) => (
                  <th key={i} className="p-3 font-serif text-base font-medium">{p.portal}</th>
                ))}
              </tr>
            </thead>
            <tbody className="align-top">
              <Row label="Antraštė" cells={data.portals.map((p) => <span className="font-serif text-base">{p.headline}</span>)} />
              <Row label="Akcentas" cells={data.portals.map((p) => p.main_emphasis)} />
              <Row label="Šaltiniai" cells={data.portals.map((p) => p.sources_cited)} />
              <Row
                label="Tonas"
                cells={data.portals.map((p) => (
                  <Badge variant={p.tone === "neutralus" ? "verified" : "unverified"}>{p.tone}</Badge>
                ))}
              />
              <Row label="Tik čia" cells={data.portals.map((p) => p.unique_points)} />
              <Row
                label="Ištrauka"
                cells={data.portals.map((p, i) => <Excerpt text={p.excerpt} source={sourceFor(p.portal, i)} className="mt-0" />)}
              />
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-10 md:grid-cols-2">
        <Section kicker="Sutampa" title="Bendri faktai">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {data.shared_facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
        <Section kicker="Skiriasi" title="Esminiai skirtumai">
          <ul className="space-y-4">
            {data.differences.map((d, i) => (
              <li key={i}>
                <p className="font-medium">{d.aspect}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section kicker="Ko neparodo?" title="Nepakankamai atspindėtos perspektyvos">
        <div className="grid gap-4 md:grid-cols-3">
          {data.underrepresented.map((u, i) => (
            <Panel key={i}>
              <h3 className="text-lg font-medium">{u.perspective}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{u.reason}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section kicker="Tolesniam tyrimui" title="Klausimai žurnalistui">
        <ol className="grid gap-3 md:grid-cols-2">
          {data.follow_up_questions.map((q, i) => (
            <li key={i} className="rounded-md bg-ink p-4 font-serif text-lg leading-snug text-ink-foreground">
              {q}
            </li>
          ))}
        </ol>
      </Section>

      <Section kicker="Neapibrėžtumas" title="Ribotumai">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {data.limitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
          <li>Palyginimas apima tik pateiktus tekstus ir neatspindi bendros portalų redakcinės krypties.</li>
        </ul>
      </Section>
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: ReactNode[] }) {
  return (
    <tr className="border-t border-border">
      <th scope="row" className="kicker p-3 text-left font-normal">{label}</th>
      {cells.map((c, i) => (
        <td key={i} className="p-3 leading-relaxed">{c}</td>
      ))}
    </tr>
  );
}
