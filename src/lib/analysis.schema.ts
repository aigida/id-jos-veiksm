import { z } from "zod";

/*
 * Strict structured-output schemas for the AI analysis.
 * Every property is required; "optional" values are nullable; no bounds or formats.
 */

export const SOURCE_TYPES = [
  "valdžios institucija",
  "politikas",
  "ekspertas",
  "pilietis",
  "organizacija",
  "žiniasklaida / agentūra",
  "kita",
] as const;

export const TONES = [
  "neutralus",
  "iš dalies vertinamasis",
  "emociškai įkrautas",
  "nepakanka duomenų",
] as const;

export const HEADLINE_FIT = [
  "atitinka",
  "iš dalies atitinka",
  "neatitinka",
  "nepakanka duomenų",
] as const;

export const STATEMENT_TYPES = ["faktas", "citata", "komentaras", "nuomonė"] as const;

export const articleAnalysisSchema = z.object({
  sufficient_data: z.boolean(),
  main_idea: z.string(),
  topic: z.string(),
  headline: z.object({
    fit: z.enum(HEADLINE_FIT),
    explanation: z.string(),
  }),
  actors: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      source_type: z.enum(SOURCE_TYPES),
      excerpt: z.string().nullable(),
    }),
  ),
  emphases: z.array(z.object({ point: z.string(), excerpt: z.string() })),
  language: z.object({
    tone: z.enum(TONES),
    summary: z.string(),
    examples: z.array(z.object({ excerpt: z.string(), comment: z.string() })),
  }),
  statements: z.array(
    z.object({ type: z.enum(STATEMENT_TYPES), excerpt: z.string(), note: z.string() }),
  ),
  missing_perspectives: z.array(z.object({ perspective: z.string(), reason: z.string() })),
  additional_sources: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  limitations: z.array(z.string()),
});

export type ArticleAnalysis = z.infer<typeof articleAnalysisSchema>;

export const comparisonSchema = z.object({
  sufficient_data: z.boolean(),
  topic_summary: z.string(),
  portals: z.array(
    z.object({
      portal: z.string(),
      headline: z.string(),
      main_emphasis: z.string(),
      sources_cited: z.string(),
      tone: z.enum(TONES),
      unique_points: z.string(),
      excerpt: z.string(),
    }),
  ),
  shared_facts: z.array(z.string()),
  differences: z.array(z.object({ aspect: z.string(), description: z.string() })),
  underrepresented: z.array(z.object({ perspective: z.string(), reason: z.string() })),
  follow_up_questions: z.array(z.string()),
  limitations: z.array(z.string()),
});

export type Comparison = z.infer<typeof comparisonSchema>;

export const articleInputSchema = z.object({
  text: z.string().trim().min(200, "Straipsnio tekstas per trumpas (mažiausiai 200 simbolių).").max(40000),
  title: z.string().trim().max(500).optional().default(""),
  portal: z.string().trim().max(100).optional().default(""),
  url: z.string().trim().max(2000).optional().default(""),
  date: z.string().trim().max(50).optional().default(""),
});

export type ArticleInput = z.input<typeof articleInputSchema>;

export const comparisonInputSchema = z.object({
  topic: z.string().trim().max(300).optional().default(""),
  articles: z
    .array(
      z.object({
        portal: z.string().trim().min(1).max(100),
        title: z.string().trim().max(500).optional().default(""),
        text: z.string().trim().min(200, "Kiekvieno straipsnio tekstas turi būti bent 200 simbolių.").max(20000),
      }),
    )
    .min(2, "Palyginimui reikia bent dviejų straipsnių.")
    .max(6),
});

export type ComparisonInput = z.input<typeof comparisonInputSchema>;

export type AnalysisResult<T> =
  | { ok: true; data: T; analyzedAt: string; model: string }
  | { ok: false; error: string };
