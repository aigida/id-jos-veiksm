import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, Newspaper, Scale, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { classifyInput } from "@/lib/route-input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PERSPEKTYVA – pamatyk ir tai, kas liko už kadro" },
      {
        name: "description",
        content:
          "DI įrankis žurnalistams: analizuokite portalus, straipsnius ir palyginkite, kaip skirtingi Lietuvos portalai nušviečia tą pačią temą.",
      },
      { property: "og:title", content: "PERSPEKTYVA – pamatyk ir tai, kas liko už kadro" },
      {
        property: "og:description",
        content: "Analizuokite portalus, straipsnius ir to paties įvykio nušvietimą skirtinguose Lietuvos portaluose.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    to: "/portalas" as const,
    icon: Newspaper,
    n: "01",
    title: "Analizuoti portalą",
    text: "Profilis, deklaruojamos vertybės, nuosavybė, temų ir šaltinių pasiskirstymas pasirinktu laikotarpiu.",
    tag: "Demonstracija: DELFI.lt",
  },
  {
    to: "/straipsnis" as const,
    icon: FileText,
    n: "02",
    title: "Analizuoti straipsnį",
    text: "Pagrindinė mintis, pašnekovai, kalbos tonas, faktai ir nuomonės, trūkstamos perspektyvos.",
    tag: "Veikia su DI",
  },
  {
    to: "/palyginimas" as const,
    icon: Scale,
    n: "03",
    title: "Palyginti temą",
    text: "Kaip DELFI, 15min, LRT, TV3, Lietuvos rytas ir Verslo žinios nušviečia tą patį įvykį.",
    tag: "Veikia su DI",
  },
];

const QUESTIONS = [
  { q: "Kas rašo?", a: "Kokia tai žiniasklaidos priemonė, kokia jos nuosavybė ir deklaruojamos vertybės." },
  { q: "Kaip rašo?", a: "Kokiu kampu pateikiama naujiena, kokie faktai ir pašnekovai akcentuojami." },
  { q: "Ko neparodo?", a: "Kokių šaltinių, veikėjų ar argumentų galimai trūksta." },
];

function Index() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const target = classifyInput(value);
    if (target.kind === "article") navigate({ to: "/straipsnis", search: { url: target.url } });
    else if (target.kind === "portal") navigate({ to: "/portalas", search: { q: target.q } });
    else if (target.kind === "topic") navigate({ to: "/palyginimas", search: { tema: target.tema } });
  }

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <p className="kicker mb-6">Žiniasklaidos turinio ir perspektyvų analizė · Lietuva</p>
        <h1 className="max-w-4xl text-4xl font-normal leading-[1.08] sm:text-6xl">
          Pamatyk ne tik tai, kas parašyta.{" "}
          <em className="text-muted-foreground">Pamatyk ir tai, kas liko už kadro.</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          DI įrankis žurnalistams, padedantis kritiškai įvertinti publikuojamą turinį, pastebėti redakcines
          tendencijas ir palyginti skirtingų portalų požiūrį į tą patį įvykį.
        </p>

        <form onSubmit={onSubmit} className="mt-10 max-w-3xl">
          <label htmlFor="q" className="kicker mb-2 block">
            Portalas, straipsnio nuoroda arba tema
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="pvz. delfi.lt, https://… arba „gynybos finansavimas“"
                className="h-12 bg-card pl-9 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6" disabled={!value.trim()}>
              Analizuoti <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Nuoroda veda į straipsnio analizę, portalo pavadinimas – į portalo profilį, kitas tekstas – į temos
            palyginimą.
          </p>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group flex flex-col bg-card p-6 transition-colors hover:bg-accent/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{f.n}</span>
                <f.icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <h2 className="mt-8 text-2xl font-medium">{f.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="kicker">{f.tag}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {QUESTIONS.map((item) => (
            <div key={item.q} className="rule-top pt-4">
              <h3 className="text-3xl font-normal italic">{item.q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-14 max-w-3xl border-l-2 border-warning pl-4 text-sm leading-relaxed text-muted-foreground">
          PERSPEKTYVA nėra „tiesos arbitras“ ir neklijuoja portalams politinių etikečių. Ji parodo duomenis,
          šaltinius, galimas tendencijas ir neapibrėžtumą – galutinę išvadą visada daro žmogus.{" "}
          <Link to="/metodika" className="text-foreground underline underline-offset-4">
            Kaip vertiname?
          </Link>
        </p>
      </section>
    </div>
  );
}
