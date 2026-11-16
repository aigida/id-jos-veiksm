import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Scale, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Panel, Section } from "@/components/analysis-ui";
import { EmptyState, WorkspaceHeader } from "@/components/workspace-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { analysesQuery, deleteProject, formatDate, projectQuery, updateAnalysis, updateProject } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/projektai/$id")({
  head: () => ({
    meta: [
      { title: "Tyrimų projektas – PERSPEKTYVA" },
      { name: "description", content: "Projekto aprašymas, pastabos ir jam priskirtos analizės." },
      { property: "og:title", content: "Tyrimų projektas – PERSPEKTYVA" },
      { property: "og:description", content: "Asmeninis tyrimų projektas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const project = useQuery(projectQuery(id));
  const analyses = useQuery(analysesQuery());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [toAdd, setToAdd] = useState("");

  useEffect(() => {
    if (project.data) {
      setName(project.data.name);
      setDescription(project.data.description);
      setNotes(project.data.notes);
    }
  }, [project.data]);

  const save = useMutation({
    mutationFn: () => updateProject(id, { name: name.trim().slice(0, 200), description: description.slice(0, 5000), notes: notes.slice(0, 20000) }),
    onSuccess: () => {
      toast.success("Projektas išsaugotas.");
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko išsaugoti."),
  });
  const assign = useMutation({
    mutationFn: (v: { analysisId: string; projectId: string | null }) => updateAnalysis(v.analysisId, { project_id: v.projectId }),
    onSuccess: (_r, v) => {
      toast.success(v.projectId ? "Analizė priskirta projektui." : "Analizė pašalinta iš projekto.");
      setToAdd("");
      void queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko."),
  });
  const del = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      toast.success("Projektas ištrintas. Jo analizės liko darbo erdvėje.");
      void queryClient.invalidateQueries();
      void navigate({ to: "/projektai" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko ištrinti."),
  });

  if (project.isLoading) return <p className="mx-auto max-w-6xl px-6 pt-12 text-sm text-muted-foreground">Įkeliama…</p>;
  if (!project.data) return <div className="mx-auto max-w-6xl px-6 pt-12"><EmptyState title="Projektas nerastas" /></div>;

  const inProject = (analyses.data ?? []).filter((a) => a.project_id === id);
  const others = (analyses.data ?? []).filter((a) => a.project_id !== id);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <WorkspaceHeader kicker="Tyrimų projektas" title={project.data.name} intro={project.data.description || undefined}>
        {inProject.length >= 2 ? (
          <Button asChild variant="outline">
            <Link to="/darbo-erdve/palyginimas" search={{ ids: inProject.map((a) => a.id).join(",") }}>
              <Scale className="mr-2 h-4 w-4" /> Palyginti projekto analizes
            </Link>
          </Button>
        ) : null}
      </WorkspaceHeader>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_340px]">
        <Section kicker={`${inProject.length} analizės`} title="Projekto analizės">
          {inProject.length === 0 ? (
            <EmptyState title="Projekte dar nėra analizių">Pridėkite išsaugotą analizę dešinėje arba priskirkite ją išsaugodami.</EmptyState>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {inProject.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <Link to="/darbo-erdve/$id" params={{ id: a.id }} className="font-serif text-lg hover:underline">{a.title || a.topic}</Link>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(a.analyzed_at)}</span>
                      <span>· {a.portal || "Portalas nenurodytas"}</span>
                      <span>· {a.topic}</span>
                      {a.is_sample ? <Badge variant="demo">Pavyzdys</Badge> : null}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Pašalinti iš projekto"
                    title="Pašalinti iš projekto (analizė neištrinama)"
                    disabled={assign.isPending}
                    onClick={() => assign.mutate({ analysisId: a.id, projectId: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="space-y-6">
          <Panel className="space-y-3">
            <h2 className="text-xl font-medium">Pridėti analizę</h2>
            {others.length ? (
              <>
                <Select value={toAdd} onValueChange={setToAdd}>
                  <SelectTrigger aria-label="Analizė, kurią pridėti" className="bg-card"><SelectValue placeholder="Pasirinkite analizę" /></SelectTrigger>
                  <SelectContent>
                    {others.map((a) => <SelectItem key={a.id} value={a.id}>{a.title || a.topic}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button disabled={!toAdd || assign.isPending} onClick={() => assign.mutate({ analysisId: toAdd, projectId: id })}>Pridėti</Button>
                <p className="text-xs text-muted-foreground">Analizė gali priklausyti vienam projektui – jei ji jau kitame, bus perkelta.</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Kitų išsaugotų analizių nėra.</p>
            )}
          </Panel>

          <Panel>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) save.mutate(); }}>
              <h2 className="text-xl font-medium">Projekto informacija</h2>
              <div><Label htmlFor="pname" className="kicker">Pavadinimas</Label><Input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
              <div><Label htmlFor="pdesc" className="kicker">Aprašymas</Label><Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" /></div>
              <div><Label htmlFor="pnotes" className="kicker">Asmeninės pastabos</Label><Textarea id="pnotes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 min-h-[140px]" /></div>
              <Button type="submit" disabled={save.isPending || !name.trim()}>Išsaugoti projektą</Button>
            </form>
          </Panel>

          <Button variant="outline" className="w-full" onClick={() => { if (window.confirm("Ištrinti projektą? Jo analizės liks darbo erdvėje.")) del.mutate(); }}>
            Ištrinti projektą
          </Button>
        </div>
      </div>
    </div>
  );
}
