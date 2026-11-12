import { createFileRoute } from "@tanstack/react-router";

import { Section } from "@/components/analysis-ui";

export const Route = createFileRoute("/metodika")({
  head: () => ({
    meta: [
      { title: "Metodika ir etika – PERSPEKTYVA" },
      {
        name: "description",
        content: "Kaip PERSPEKTYVA analizuoja žiniasklaidos turinį, kokių principų laikosi ir kokie yra DI analizės ribotumai.",
      },
      { property: "og:title", content: "Metodika ir etika – PERSPEKTYVA" },
      {
        property: "og:description",
        content: "Analizės kriterijai, rizikos ir etiniai principai: įrodymai, neapibrėžtumas ir žmogaus sprendimas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MethodPage,
});

const CRITERIA = [
  "Pagrindinė tema ir mintis",
  "Veikėjai ir jų vaidmenys",
  "Cituojamų šaltinių tipai: institucijos, politikai, ekspertai, piliečiai, organizacijos",
  "Akcentuojami įvykio aspektai",
  "Antraštės ir teksto atitikimas",
  "Neutrali, vertinamoji ar emociškai įkrauta kalba – su pavyzdžiais",
  "Galimai neįtrauktos perspektyvos",
  "Papildomi šaltiniai ir klausimai žurnalistui",
];

const RISKS = [
  {
    risk: "Klaidingas politinės krypties priskyrimas",
    why: "DI gali supaprastinti sudėtingą redakcinę poziciją iki vienos etiketės.",
    fix: "Vertiname kelias dimensijas, pateikiame įrodymus ir neapibrėžtumą.",
  },
  {
    risk: "DI haliucinacijos",
    why: "Modelis gali išgalvoti šaltinius, citatas ar faktus.",
    fix: "Kiekviena ištrauka automatiškai tikrinama pateiktame tekste ir pažymima.",
  },
  {
    risk: "Atrankos šališkumas",
    why: "Straipsnių imtis gali neatspindėti viso portalo turinio.",
    fix: "Visada nurodome imties dydį, laikotarpį ir atrankos principą.",
  },
  {
    risk: "Algoritmo šališkumas",
    why: "Modelis gali atkartoti mokymo duomenų stereotipus.",
    fix: "Vienodi kriterijai visiems tekstams ir žmogaus peržiūra.",
  },
  {
    risk: "Konteksto praradimas",
    why: "Antraštė ar trumpa ištrauka gali neatspindėti viso straipsnio.",
    fix: "Analizuojame visą pateiktą tekstą ir rodome publikacijos duomenis.",
  },
  {
    risk: "Autorių teisės",
    why: "Automatinis turinio rinkimas gali pažeisti svetainių sąlygas.",
    fix: "Naudojame naudotojo pateiktą tekstą, straipsnių neperpublikuojame ir nesaugome.",
  },
  {
    risk: "Per didelis pasitikėjimas DI",
    why: "Automatinė išvada gali būti priimta kaip faktas.",
    fix: "Aiškiai žymime, kad įrankis pagalbinis – galutinę išvadą daro žmogus.",
  },
];

function MethodPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <p className="kicker mb-3">Metodika ir etika</p>
      <h1 className="max-w-3xl text-4xl font-normal sm:text-5xl">Ne tiesos arbitras, o kritinio mąstymo pagalbininkas.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Vietoj vienos politinės etiketės PERSPEKTYVA analizuoja konkrečius turinio požymius: kokios temos
        akcentuojamos, kas cituojamas, kokia kalba vartojama ir kokios perspektyvos lieka nuošalyje.
      </p>

      <div className="mt-14 space-y-14">
        <Section kicker="Kriterijai" title="Ką vertiname kiekviename tekste">
          <ol className="grid gap-x-10 gap-y-3 md:grid-cols-2">
            {CRITERIA.map((c, i) => (
              <li key={c} className="flex gap-4 border-b border-border pb-3">
                <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section kicker="Principai" title="Kaip pateikiame išvadas">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-medium">Įrodymai</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Prie kiekvienos išvados – pažodinė ištrauka. Jei jos nėra pateiktame tekste, ji pažymima kaip
                nerasta.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Neapibrėžtumas</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Kai duomenų per mažai, rodome įspėjimą „Nepakanka duomenų patikimai išvadai“, o ne spėjimą.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Atskirtis</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Deklaruojamos portalo vertybės atskiriamos nuo empiriškai stebimo turinio. Nuosavybė savaime
                neįrodo šališkumo.
              </p>
            </div>
          </div>
        </Section>

        <Section kicker="Rizikos" title="Rizikos ir kaip jas mažiname">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="kicker py-2 pr-4 font-normal">Rizika</th>
                  <th className="kicker py-2 pr-4 font-normal">Kodėl tai problema</th>
                  <th className="kicker py-2 font-normal">Kaip sprendžiame</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {RISKS.map((r) => (
                  <tr key={r.risk} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium">{r.risk}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.why}</td>
                    <td className="py-3">{r.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section kicker="Būsena" title="Kas jau veikia, o kas – demonstracija">
          <ul className="space-y-3 text-sm">
            <li>
              <span className="font-medium">Veikia su DI:</span>{" "}
              <span className="text-muted-foreground">straipsnio analizė ir temos palyginimas pagal pateiktus tekstus.</span>
            </li>
            <li>
              <span className="font-medium">Demonstracija:</span>{" "}
              <span className="text-muted-foreground">
                portalo profilis (DELFI.lt pavyzdys). Automatinis straipsnių rinkimas ir savaitinė stebėsena –
                kitame etape.
              </span>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
