import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

import { articleAnalysisSchema, type ArticleAnalysis } from "./analysis.schema";
import type { ExcerptCheck } from "./excerpts";

export type SavedAnalysis = Tables<"saved_analyses">;
export type Project = Tables<"research_projects">;
export type SavedAnalysisSummary = Pick<
  SavedAnalysis,
  "id" | "title" | "url" | "portal" | "published_date" | "topic" | "tone" | "notes" | "project_id" | "analyzed_at" | "is_sample"
>;

const SUMMARY_COLUMNS = "id,title,url,portal,published_date,topic,tone,notes,project_id,analyzed_at,is_sample";

function fail(error: { message: string } | null, msg: string): asserts error is null {
  if (error) {
    console.error(error);
    throw new Error(msg);
  }
}

export const analysesQuery = () =>
  queryOptions({
    queryKey: ["analyses"],
    queryFn: async (): Promise<SavedAnalysisSummary[]> => {
      const { data, error } = await supabase.from("saved_analyses").select(SUMMARY_COLUMNS).order("analyzed_at", { ascending: false });
      fail(error, "Nepavyko įkelti išsaugotų analizių.");
      return data ?? [];
    },
  });

export const analysisQuery = (id: string) =>
  queryOptions({
    queryKey: ["analyses", id],
    queryFn: async (): Promise<SavedAnalysis | null> => {
      const { data, error } = await supabase.from("saved_analyses").select("*").eq("id", id).maybeSingle();
      fail(error, "Nepavyko įkelti analizės.");
      return data;
    },
  });

export const analysesByIdsQuery = (ids: string[]) =>
  queryOptions({
    queryKey: ["analyses", "by-ids", [...ids].sort().join(",")],
    queryFn: async (): Promise<SavedAnalysis[]> => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from("saved_analyses").select("*").in("id", ids).order("analyzed_at", { ascending: true });
      fail(error, "Nepavyko įkelti analizių palyginimui.");
      return data ?? [];
    },
  });

export const projectsQuery = () =>
  queryOptions({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from("research_projects").select("*").order("created_at", { ascending: false });
      fail(error, "Nepavyko įkelti projektų.");
      return data ?? [];
    },
  });

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["projects", id],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase.from("research_projects").select("*").eq("id", id).maybeSingle();
      fail(error, "Nepavyko įkelti projekto.");
      return data;
    },
  });

/** Parses stored JSON back into an analysis; null when the stored shape is no longer valid. */
export function parseStoredAnalysis(json: Json): ArticleAnalysis | null {
  const r = articleAnalysisSchema.safeParse(json);
  return r.success ? r.data : null;
}

export type SaveAnalysisInput = {
  title: string;
  url: string;
  portal: string;
  publishedDate: string;
  analysis: ArticleAnalysis;
  excerptChecks: ExcerptCheck[];
  analyzedAt: string;
  model: string;
  isSample: boolean;
  notes: string;
  projectId: string | null;
};

/** Saves the analysis result and evidence only — the full article text is deliberately not stored. */
export async function saveAnalysis(input: SaveAnalysisInput): Promise<string> {
  const { data, error } = await supabase
    .from("saved_analyses")
    .insert({
      title: input.title.slice(0, 500),
      url: input.url.slice(0, 2000),
      portal: input.portal.slice(0, 100),
      published_date: input.publishedDate.slice(0, 50),
      topic: input.analysis.topic.slice(0, 500),
      main_idea: input.analysis.main_idea,
      tone: input.analysis.language.tone,
      analysis: input.analysis as unknown as Json,
      excerpt_checks: input.excerptChecks as unknown as Json,
      analyzed_at: input.analyzedAt,
      model: input.model,
      is_sample: input.isSample,
      notes: input.notes,
      project_id: input.projectId,
    })
    .select("id")
    .single();
  fail(error, "Analizės išsaugoti nepavyko.");
  return data.id;
}

export async function updateAnalysis(id: string, patch: { notes?: string; project_id?: string | null }) {
  const { error } = await supabase.from("saved_analyses").update(patch).eq("id", id);
  fail(error, "Pakeitimų išsaugoti nepavyko.");
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase.from("saved_analyses").delete().eq("id", id);
  fail(error, "Analizės ištrinti nepavyko.");
}

export async function createProject(input: { name: string; description: string }): Promise<string> {
  const { data, error } = await supabase
    .from("research_projects")
    .insert({ name: input.name.trim().slice(0, 200), description: input.description.trim().slice(0, 5000) })
    .select("id")
    .single();
  fail(error, "Projekto sukurti nepavyko.");
  return data.id;
}

export async function updateProject(id: string, patch: { name?: string; description?: string; notes?: string }) {
  const { error } = await supabase.from("research_projects").update(patch).eq("id", id);
  fail(error, "Projekto pakeitimų išsaugoti nepavyko.");
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("research_projects").delete().eq("id", id);
  fail(error, "Projekto ištrinti nepavyko.");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("lt-LT", { year: "numeric", month: "2-digit", day: "2-digit" });
}
