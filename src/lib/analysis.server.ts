import { NoObjectGeneratedError, Output, streamText } from "ai";

import {
  ANALYSIS_MODEL,
  RESPONSES_OPTIONS,
  createGatewayModel,
  describeAiError,
} from "./ai-gateway.server";
import {
  articleAnalysisSchema,
  comparisonSchema,
  type AnalysisResult,
  type ArticleAnalysis,
  type Comparison,
} from "./analysis.schema";

const BASE_RULES = `Tu esi žurnalistams skirto įrankio PERSPEKTYVA analizės asistentas.
Tavo užduotis – kritiškai ir neutraliai išanalizuoti pateiktą žiniasklaidos turinį.

Griežtos taisyklės:
- Atsakyk tik lietuvių kalba.
- Nepriskirk straipsniui ar portalui politinės krypties be aiškių, pakankamų įrodymų. Vienas straipsnis niekada nėra pakankamas įrodymas portalo krypčiai.
- Atskirai vertink faktus, citatas, komentarus ir nuomones.
- Kiekvieną išvadą pagrįsk konkrečia ištrauka. Ištraukos (laukai "excerpt") turi būti nukopijuotos pažodžiui iš pateikto teksto, be jokių pakeitimų, 8–200 simbolių ilgio. Jei negali pateikti tikslios ištraukos, palik lauką null (kur leidžiama) arba nepateik to punkto.
- Neišgalvok citatų, faktų, šaltinių, žmonių ar nuorodų. Remkis tik pateiktu tekstu.
- Trūkstamas perspektyvas vadink „galimai neįtrauktomis“, o ne „nutylėtais faktais“, jei negali to pagrįsti.
- Jei teksto nepakanka patikimai išvadai, nustatyk sufficient_data = false ir tai paaiškink apribojimuose.
- Būk glaustas: kiekvienas paaiškinimas – 1–3 sakiniai.`;

const ARTICLE_INSTRUCTIONS = `${BASE_RULES}

Analizuok vieną straipsnį:
1. Pagrindinė tema (topic, iki 6 žodžių) ir mintis (main_idea).
2. Ar antraštė atitinka turinį (headline). Jei antraštė nepateikta – "nepakanka duomenų".
3. Pagrindiniai veikėjai ir jų vaidmenys (actors), šaltinio tipas ir, jei yra, jų citata/ištrauka.
4. Kokie įvykio aspektai akcentuojami (emphases, 2–5).
5. Kalbos tonas ir 1–4 konkretūs vertinamosios ar emocinės kalbos pavyzdžiai (language.examples). Jei kalba neutrali, pavyzdžių gali nebūti.
6. Faktų, citatų, komentarų ir nuomonių pavyzdžiai (statements, 3–6).
7. Galimai neįtrauktos reikšmingos perspektyvos (missing_perspectives, 1–4).
8. Papildomi šaltiniai ar pašnekovai, kuriuos žurnalistas galėtų įtraukti (additional_sources, 2–5).
9. Klausimai tolesniam žurnalistiniam tyrimui (follow_up_questions, 3–5).
10. Analizės ribotumai (limitations, 1–4).`;

const COMPARISON_INSTRUCTIONS = `${BASE_RULES}

Palygink, kaip skirtingi portalai nušviečia tą pačią temą ar įvykį. Kiekvienam pateiktam straipsniui sukurk po vieną įrašą masyve "portals" ta pačia tvarka:
- headline: straipsnio antraštė (jei nepateikta – trumpai „antraštė nepateikta“),
- main_emphasis: kas akcentuojama,
- sources_cited: kokie veikėjai ir šaltinių tipai cituojami,
- tone: kalbos tonas,
- unique_points: kas minima tik šiame straipsnyje,
- excerpt: viena būdinga pažodinė ištrauka iš to straipsnio.
Taip pat: bendri visiems straipsniams faktai (shared_facts), esminiai skirtumai (differences: aspektas ir aprašymas), nepakankamai atspindėtos perspektyvos (underrepresented), klausimai žurnalistui ir ribotumai.
Nelygink portalų politinės krypties – lygink tik šių konkrečių tekstų turinio požymius.`;

async function runStructured<T>(
  instructions: string,
  prompt: string,
  schema: typeof articleAnalysisSchema | typeof comparisonSchema,
  signal: AbortSignal | undefined,
): Promise<AnalysisResult<T>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "DI paslauga nesukonfigūruota. Kreipkitės į projekto savininką." };

  try {
    let streamError: unknown;
    const result = streamText({
      model: createGatewayModel(apiKey),
      instructions,
      messages: [{ role: "user", content: prompt }],
      output: Output.object({ schema }),
      ...(signal ? { abortSignal: signal } : {}),
      providerOptions: RESPONSES_OPTIONS,
      onError: ({ error }) => {
        streamError = error;
      },
    });
    // Consume the stream server-side; only the final object is returned to the browser.
    for await (const _ of result.fullStream) {
      // drain
    }
    if (streamError) throw streamError;
    const output = (await result.output) as T;
    return { ok: true, data: output, analyzedAt: new Date().toISOString(), model: ANALYSIS_MODEL };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      return { ok: false, error: "DI pateikė netinkamo formato atsakymą. Bandykite dar kartą." };
    }
    console.error("AI analysis failed", error);
    return { ok: false, error: describeAiError(error) };
  }
}

export function analyzeArticleText(
  input: { text: string; title: string; portal: string; url: string; date: string },
  signal?: AbortSignal,
) {
  const meta = [
    `Antraštė: ${input.title || "(nepateikta)"}`,
    `Portalas: ${input.portal || "(nenurodytas)"}`,
    `Publikavimo data: ${input.date || "(nenurodyta)"}`,
    `Nuoroda: ${input.url || "(nepateikta)"}`,
  ].join("\n");
  const prompt = `${meta}\n\nStraipsnio tekstas:\n"""\n${input.text}\n"""`;
  return runStructured<ArticleAnalysis>(ARTICLE_INSTRUCTIONS, prompt, articleAnalysisSchema, signal);
}

export function compareArticles(
  input: { topic: string; articles: { portal: string; title: string; text: string }[] },
  signal?: AbortSignal,
) {
  const blocks = input.articles
    .map(
      (a, i) =>
        `### Straipsnis ${i + 1}\nPortalas: ${a.portal}\nAntraštė: ${a.title || "(nepateikta)"}\nTekstas:\n"""\n${a.text}\n"""`,
    )
    .join("\n\n");
  const prompt = `Tema: ${input.topic || "(nenurodyta – nustatyk iš tekstų)"}\n\n${blocks}`;
  return runStructured<Comparison>(COMPARISON_INSTRUCTIONS, prompt, comparisonSchema, signal);
}
