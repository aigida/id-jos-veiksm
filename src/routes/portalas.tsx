import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, ShieldQuestion } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  BarList,
  DemoBanner,
  InsufficientData,
  MetaRow,
  Panel,
  Section,
} from "@/components/analysis-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DELFI_DEMO } from "@/lib/demo-delfi";
import { findPortal } from "@/lib/portals";

type PortalSearch = { q?: string | undefined; laikotarpis?: string | undefined };

const PERIODS = [
  { value: "7", label: "Paskutinės 7 dienos" },
  { value: "30", label: "Paskutinės 30 dienų" },
  { value: "90", label: "Paskutiniai 3 mėnesiai" },
];

export const Route = createFileRoute("/portalas")({
  validateSearch: (search: Record<string, unknown>): PortalSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    laikotarpis: typeof search["laikotarpis"] === "string" ? search["laikotarpis"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Portalo analizė – PERSPEKTYVA" },
      {
        name: "description",
        content: "Žiniasklaidos portalo profilis: vertybės, nuosavybė, temos, šaltiniai, antraščių tonas ir trūkstamos perspektyvos.",
      },
      { property: "og:title", content: "Portalo analizė – PERSPEKTYVA" },
      {
        property: "og:description",
        content: "Demonstracinė DELFI.lt portalo turinio analizė su aiškiais imties ribotumais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/portalas" });
  const q = search.q ?? "delfi.lt";
  const period = search.laikotarpis ?? "7";
  const [value, setValue] = useState(q);
  const portal = findPortal(q);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigate({ search: { q: value.trim() || undefined, laikotarpis: period } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <p className="kicker mb-3">01 · Portalo analizė</p>
      <h1 className="text-4xl font-normal sm:text-5xl">Kas rašo?</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-2 sm:grid-cols-[1fr_220px_auto]">
        <Input
          aria-label="Portalo pavadinimas arba adresas"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Portalo pavadinimas arba adresas"
          className="h-11 bg-card"
        />
        <Select value={period} onValueChange={(v) => navigate({ search: { q, laikotarpis: v } })}>
          <SelectTrigger className="h-11 bg-card" aria-label="Analizės laikotarpis">
            <SelectValue>{PERIODS.find((p) => p.value === period)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="h-11">
          Rodyti profilį
        </Button>
      </form>

      <div className="mt-10">
        {portal?.id === "delfi" ? (
          <DelfiDemo period={period} />
        ) : (
          <NoPortalData name={portal?.name ?? q} known={!!portal} />
        )}
      </div>
    </div>
  );
}

function NoPortalData({ name, known }: { name: string; known: boolean }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-medium">{name}</h2>
      <InsufficientData>
        {known
          ? "Šiam portalui dar nėra surinktos straipsnių imties. Automatinis straipsnių gavimas bus prijungtas vėlesnėje versijoje – kol kas demonstracinis profilis parengtas tik DELFI.lt."
          : "Šis portalas nėra pradiniame analizuojamų Lietuvos portalų sąraše, todėl jo profilio pateikti negalime."}
      </InsufficientData>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <p className="kicker mb-2">Ką galite padaryti dabar</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Įklijuokite konkretaus šio portalo straipsnio tekstą – DI jį išanalizuos su pagrindžiančiomis
            ištraukomis.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/straipsnis">
              Analizuoti straipsnį <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Panel>
        <Panel>
          <p className="kicker mb-2">Arba</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Peržiūrėkite, kaip atrodo portalo ataskaita.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/portalas" search={{ q: "delfi.lt" }}>
              DELFI.lt pavyzdys <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}

function DelfiDemo({ period }: { period: string }) {
  const d = DELFI_DEMO;
  return (
    <div className="space-y-12">
      <DemoBanner>
        Tai pavyzdinė ataskaita, iliustruojanti sąsają ir analizės logiką. Ji parengta rankiniu būdu iš {d.sampleSize}{" "}
        straipsnių ({d.period.from} – {d.period.to}) ir nėra realaus automatinio tyrimo rezultatas. Pasirinktas
        laikotarpis ({PERIODS.find((p) => p.value === period)?.label.toLowerCase()}) šiai imčiai netaikomas.
      </DemoBanner>

      <div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 className="text-4xl font-medium">{d.portal}</h2>
          <a
            href={`https://www.${d.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground hover:text-foreground"
          >
            {d.domain} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-3 max-w-3xl text-muted-foreground">{d.description}</p>
        <div className="mt-6">
          <MetaRow
            items={[
              { label: "Analizės data", value: d.preparedAt },
              { label: "Laikotarpis", value: `${d.period.from} – ${d.period.to}` },
              { label: "Imtis", value: `${d.sampleSize} straipsniai` },
              { label: "Būsena", value: <Badge variant="demo">Demo</Badge> },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <Section kicker="Deklaruojama" title="Misija ir redakcinės vertybės">
          <Badge variant="unverified" className="mb-3 gap-1">
            <ShieldQuestion className="h-3 w-3" /> Nepatikrinta
          </Badge>
          <p className="text-sm leading-relaxed text-muted-foreground">{d.declaredValues.note}</p>
        </Section>
        <Section kicker="Kontekstas" title="Nuosavybė ir valdymas">
          <Badge variant="unverified" className="mb-3 gap-1">
            <ShieldQuestion className="h-3 w-3" /> Nepatikrinta
          </Badge>
          <p className="text-sm leading-relaxed text-muted-foreground">{d.ownership.note}</p>
        </Section>
      </div>

      <Section kicker="Imtis" title="Analizuoti straipsniai" aside={<span className="kicker">{d.sampling}</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="kicker py-2 pr-4 font-normal">Nr.</th>
                <th className="kicker py-2 pr-4 font-normal">Data</th>
                <th className="kicker py-2 pr-4 font-normal">Tema</th>
                <th className="kicker py-2 pr-4 font-normal">Kilmė</th>
                <th className="kicker py-2 font-normal">Aprašas / nuoroda</th>
              </tr>
            </thead>
            <tbody>
              {d.articles.map((a) => (
                <tr key={a.n} className="border-b border-border">
                  <td className="py-3 pr-4 font-mono text-muted-foreground">{a.n}</td>
                  <td className="py-3 pr-4 font-mono">{a.date}</td>
                  <td className="py-3 pr-4">{a.topic}</td>
                  <td className="py-3 pr-4">{a.origin}</td>
                  <td className="py-3">
                    {a.summary}
                    <span className="block text-xs text-muted-foreground">
                      Demonstracinis įrašas – nuoroda ir ištrauka bus pateiktos realioje analizėje
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-10 md:grid-cols-2">
        <Section kicker="Turinys" title="Temų pasiskirstymas">
          <BarList items={d.topics} />
        </Section>
        <Section kicker="Kilmė" title="Medžiagos šaltinis">
          <BarList items={d.origin} />
        </Section>
        <Section kicker="Balsai" title="Cituojami veikėjai">
          <BarList items={d.sources} unit=" cit." />
        </Section>
        <Section kicker="Kalba" title="Antraščių tonas">
          <BarList items={d.headlineTone} />
        </Section>
      </div>

      <Section kicker="Ko neparodo?" title="Galimai trūkstamos perspektyvos">
        <div className="grid gap-4 md:grid-cols-3">
          {d.missingPerspectives.map((m) => (
            <Panel key={m.perspective}>
              <h3 className="text-lg font-medium">{m.perspective}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.reason}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section kicker="Tendencijos" title="Politinių ir ideologinių tendencijų vertinimas">
        <InsufficientData>
          {d.sampleSize} straipsniai per dvi dienas – maža ir nereprezentatyvi imtis. Vienos politinės etiketės
          nepriskiriame; žemiau – atskiros dimensijos ir jų būsena.
        </InsufficientData>
        <dl className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {d.direction.dimensions.map((dim) => (
            <div key={dim.label} className="border-b border-border pb-4">
              <dt className="font-medium">{dim.label}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{dim.note}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
