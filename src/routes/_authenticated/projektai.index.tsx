import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Panel } from "@/components/analysis-ui";
import { EmptyState, WorkspaceHeader } from "@/components/workspace-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analysesQuery, createProject, deleteProject, projectsQuery } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/projektai/")({
  head: () => ({
    meta: [
      { title: "Tyrimų projektai – PERSPEKTYVA" },
      { name: "description", content: "Grupuokite išsaugotas analizes į tyrimų projektus." },
      { property: "og:title", content: "Tyrimų projektai – PERSPEKTYVA" },
      { property: "og:description", content: "Asmeniniai tyrimų projektai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const queryClient = useQueryClient();
  const projects = useQuery(projectsQuery());
  const analyses = useQuery(analysesQuery());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation({
    mutationFn: () => createProject({ name, description }),
    onSuccess: () => {
      toast.success("Projektas sukurtas.");
      setName("");
      setDescription("");
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko."),
  });
  const del = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Projektas ištrintas. Jo analizės liko darbo erdvėje.");
      void queryClient.invalidateQueries();
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate();
  }

  const count = (id: string) => (analyses.data ?? []).filter((a) => a.project_id === id).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <WorkspaceHeader kicker="Mano darbo erdvė" title="Tyrimų projektai" intro="Atidarykite projektą, kad pridėtumėte analizių, rašytumėte pastabas ir palygintumėte jo analizes." />
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_340px]">
        <div>
          {projects.data?.length ? (
            <ul className="divide-y divide-border border-y border-border">
              {projects.data.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <Link to="/projektai/$id" params={{ id: p.id }} className="font-serif text-lg hover:underline">{p.name}</Link>
                    {p.description ? <p className="mt-1 text-sm text-muted-foreground">{p.description}</p> : null}
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{count(p.id)} analizės</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Ištrinti projektą" onClick={() => { if (window.confirm("Ištrinti projektą?")) del.mutate(p.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={projects.isLoading ? "Įkeliama…" : "Dar nėra projektų"} />
          )}
        </div>
        <Panel>
          <form onSubmit={onSubmit} className="space-y-3">
            <h2 className="text-xl font-medium">Naujas projektas</h2>
            <div><Label htmlFor="pname" className="kicker">Pavadinimas</Label><Input id="pname" value={name} onChange={(e) => setName(e.target.value)} placeholder="pvz. Seimo rinkimų komunikacija" className="mt-1.5" /></div>
            <div><Label htmlFor="pdesc" className="kicker">Aprašymas</Label><Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" /></div>
            <Button type="submit" disabled={create.isPending || !name.trim()}>Sukurti</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
