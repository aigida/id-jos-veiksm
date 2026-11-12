/**
 * DEMONSTRATION DATA ONLY.
 * Illustrates the layout of a portal report for DELFI.lt based on the project's
 * first manual walkthrough (six political articles, 11–12 Nov 2026).
 * Values are illustrative, not the result of an automated study.
 */
export const DELFI_DEMO = {
  portal: "DELFI",
  domain: "delfi.lt",
  period: { from: "2026-11-11", to: "2026-11-12" },
  preparedAt: "2026-11-12",
  sampleSize: 6,
  sampling:
    "Rankiniu būdu atrinkti politikos ir viešosios politikos rubrikos straipsniai, publikuoti per dvi dienas.",
  description:
    "Vienas didžiausių Lietuvos naujienų portalų, skelbiantis naujienas, komentarus, verslo, pramogų ir regionų turinį.",
  declaredValues: {
    verified: false,
    note: "Redakcinės vertybės ir misija demonstracijoje nepatikrintos. Realioje analizėje jos būtų cituojamos iš portalo viešai skelbiamos redakcinės politikos su nuoroda.",
  },
  ownership: {
    verified: false,
    note: "Nuosavybės informacija demonstracijoje nepatikrinta. Ją reikia patikrinti viešuose registruose (pvz., Visuomenės informavimo rengėjų ir skleidėjų informacinėje sistemoje VIRSIS) ir pateikti su šaltinio nuoroda. Nuosavybė savaime neįrodo redakcinio šališkumo.",
  },
  topics: [
    { label: "Nacionalinis saugumas ir gynyba", count: 2 },
    { label: "Vidaus politikos sprendimai", count: 2 },
    { label: "Užsienio politika", count: 1 },
    { label: "Santykiai su Kinija ir Taivanu", count: 1 },
  ],
  origin: [
    { label: "ELTA informacija", count: 3 },
    { label: "DELFI redakcijos medžiaga", count: 3 },
  ],
  sources: [
    { label: "Valdžios institucijos", count: 7 },
    { label: "Politikai", count: 6 },
    { label: "Ekspertai", count: 2 },
    { label: "Organizacijos", count: 1 },
    { label: "Piliečiai", count: 0 },
  ],
  headlineTone: [
    { label: "Neutralus", count: 4 },
    { label: "Iš dalies vertinamasis", count: 2 },
    { label: "Emociškai įkrautas", count: 0 },
  ],
  missingPerspectives: [
    {
      perspective: "Piliečių ir bendruomenių balsas",
      reason: "Imtyje nėra cituojamų piliečių – dominuoja institucijų ir politikų pozicijos.",
    },
    {
      perspective: "Nepriklausomi ekspertai",
      reason: "Ekspertai cituojami retai, todėl sprendimų vertinimas daugiausia perteikiamas per pačius sprendimų priėmėjus.",
    },
    {
      perspective: "Ekonominis poveikis verslui ir regionams",
      reason: "Užsienio politikos temose (pvz., santykiuose su Kinija) mažai aptariamos praktinės pasekmės.",
    },
  ],
  articles: [
    { n: 1, topic: "Nacionalinis saugumas ir gynyba", origin: "ELTA", date: "2026-11-11", summary: "Straipsnis apie gynybos finansavimo sprendimus" },
    { n: 2, topic: "Nacionalinis saugumas ir gynyba", origin: "DELFI", date: "2026-11-11", summary: "Straipsnis apie regiono saugumo situacijos vertinimus" },
    { n: 3, topic: "Užsienio politika", origin: "ELTA", date: "2026-11-11", summary: "Straipsnis apie užsienio politikos prioritetus" },
    { n: 4, topic: "Santykiai su Kinija ir Taivanu", origin: "DELFI", date: "2026-11-12", summary: "Straipsnis apie Lietuvos santykius su Kinija ir Taivanu" },
    { n: 5, topic: "Vidaus politikos sprendimai", origin: "ELTA", date: "2026-11-12", summary: "Straipsnis apie Vyriausybės sprendimą" },
    { n: 6, topic: "Vidaus politikos sprendimai", origin: "DELFI", date: "2026-11-12", summary: "Straipsnis apie Seimo diskusiją" },
  ],
  direction: {
    sufficient: false,
    dimensions: [
      { label: "Temų įvairovė", note: "4 temos per 6 straipsnius – per maža imtis tendencijai." },
      { label: "Šaltinių balansas", note: "Dominuoja oficialūs šaltiniai; reikia ilgesnio laikotarpio palyginimui." },
      { label: "Kalbos vertinamumas", note: "Daugiausia neutralios antraštės; 2 iš dalies vertinamosios." },
      { label: "Valdžios ir opozicijos balsų santykis", note: "Nevertinta – nepakanka duomenų." },
    ],
  },
} as const;
