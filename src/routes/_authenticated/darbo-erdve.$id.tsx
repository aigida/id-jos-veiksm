import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ArticleResult } from "@/components/article-result";
import { EmptyState, ProjectSelect, WorkspaceHeader } from "@/components/workspace-ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { excerptLookup } from "@/lib/excerpts";
import { analysisQuery, deleteAnalysis, parseStoredAnalysis, projectsQuery, updateAnalysis } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/darbo-erdve/$id")({
  head: () => ({
    meta: [
      { title: "Išsaugota analizė – PERSPEKTYVA" },
      { name: "description", content: "Išsaugotos straipsnio analizės peržiūra ir pastabos." },
      { property: "og:title", content: "Išsaugota analizė – PERSPEKTYVA" },
      { property: "og:description", content: "Išsaugotos analizės peržiūra." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedAnalysisPage,
});

function SavedAnalysisPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const row = useQuery(analysisQuery(id));
  const projects = useQuery(projectsQuery());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (row.data) setNotes(row.data.notes);
  }, [row.data]);

  const update = useMutation({
    mutationFn: (patch: { notes?: string; project_id?: string | null }) => updateAnalysis(id, patch),
    onSuccess: () => {
      toast.success("Pakeitimai išsaugoti.");
      void queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko išsaugoti."),
  });
  const del = useMutation({
    mutationFn: () => deleteAnalysis(id),
    onSuccess: () => {
      toast.success("Analizė ištrinta.");
      void queryClient.invalidateQueries({ queryKey: ["analyses"] });
      void navigate({ to: "/darbo-erdve" });
    },
  });

  if (row.isLoading) return <p className="mx-auto max-w-6xl px-6 pt-12 text-sm text-muted-foreground">Įkeliama…</p>;
  const data = row.data ? parseStoredAnalysis(row.data.analysis) : null;
  if (!row.data || !data) {
    return <div className="mx-auto max-w-6xl px-6 pt-12"><EmptyState title="Analizė nerasta" /></div>;
  }
  const r = row.data;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <WorkspaceHeader kicker="Išsaugota analizė" title="Analizė ir pastabos" />
      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_280px]">
        <div>
          <Label htmlFor="notes" className="kicker">Mano pastabos</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 min-h-[120px] bg-card" />
          <Button className="mt-2" onClick={() => update.mutate({ notes })} disabled={update.isPending}>Išsaugoti pastabas</Button>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="kicker">Projektas</Label>
            <ProjectSelect className="mt-1.5" projects={projects.data ?? []} value={r.project_id} onChange={(v) => update.mutate({ project_id: v })} />
          </div>
          <Button variant="outline" className="w-full" onClick={() => { if (window.confirm("Ištrinti šią analizę?")) del.mutate(); }}>Ištrinti analizę</Button>
          <p className="text-xs text-muted-foreground">Straipsnio tekstas nesaugomas; ištraukų patikrinimas atliktas išsaugojimo metu.</p>
        </div>
      </div>
      <ArticleResult
        data={data}
        analyzedAt={r.analyzed_at}
        check={excerptLookup(r.excerpt_checks)}
        meta={{ title: r.title, portal: r.portal, date: r.published_date, url: r.url }}
        isSample={r.is_sample}
      />
    </div>
  );
}
