import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Scale, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState, ProjectSelect, WorkspaceHeader } from "@/components/workspace-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analysesQuery, deleteAnalysis, formatDate, projectsQuery } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/darbo-erdve/")({
  head: () => ({
    meta: [
      { title: "Mano darbo erdvė – PERSPEKTYVA" },
      { name: "description", content: "Jūsų išsaugotos straipsnių analizės, pastabos ir projektai." },
      { property: "og:title", content: "Mano darbo erdvė – PERSPEKTYVA" },
      { property: "og:description", content: "Asmeninė išsaugotų analizių istorija." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const queryClient = useQueryClient();
  const analyses = useQuery(analysesQuery());
  const projects = useQuery(projectsQuery());
  const [q, setQ] = useState("");
  const [portal, setPortal] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));

  const del = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      toast.success("Analizė ištrinta.");
      void queryClient.invalidateQueries({ queryKey: ["analyses"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko ištrinti."),
  });

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (analyses.data ?? []).filter((a) => {
      const day = a.analyzed_at.slice(0, 10);
      if (needle && !`${a.title} ${a.topic}`.toLowerCase().includes(needle)) return false;
      if (portal && !a.portal.toLowerCase().includes(portal.trim().toLowerCase())) return false;
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (projectId && a.project_id !== projectId) return false;
      return true;
    });
  }, [analyses.data, q, portal, from, to, projectId]);

  const projectName = (id: string | null) => projects.data?.find((p) => p.id === id)?.name;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <WorkspaceHeader kicker="Mano darbo erdvė" title="Išsaugotos analizės" intro="Duomenys saugomi duomenų bazėje ir matomi tik jums. Pažymėkite kelias analizes, kad jas palygintumėte.">
        {selected.length >= 2 ? (
          <Button asChild>
            <Link to="/darbo-erdve/palyginimas" search={{ ids: selected.join(",") }}>
              <Scale className="mr-2 h-4 w-4" /> Palyginti pasirinktas ({selected.length})
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <Scale className="mr-2 h-4 w-4" /> Pažymėkite bent 2 analizes
          </Button>
        )}
      </WorkspaceHeader>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div><Label className="kicker">Pavadinimas ar tema</Label><Input value={q} onChange={(e) => setQ(e.target.value)} className="mt-1.5 bg-card" /></div>
        <div><Label className="kicker">Portalas</Label><Input value={portal} onChange={(e) => setPortal(e.target.value)} className="mt-1.5 bg-card" /></div>
        <div><Label className="kicker">Nuo</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5 bg-card" /></div>
        <div><Label className="kicker">Iki</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5 bg-card" /></div>
        <div><Label className="kicker">Projektas</Label><ProjectSelect className="mt-1.5" projects={projects.data ?? []} value={projectId} onChange={setProjectId} noneLabel="Visi" /></div>
      </div>

      <div className="mt-8">
        {analyses.isLoading ? (
          <p className="text-sm text-muted-foreground">Įkeliama…</p>
        ) : analyses.isError ? (
          <p className="text-sm text-destructive">{analyses.error.message}</p>
        ) : rows.length === 0 ? (
          <EmptyState title={analyses.data?.length ? "Pagal filtrus nieko nerasta" : "Dar nėra išsaugotų analizių"}>
            <Link to="/straipsnis" search={{ url: undefined }} className="underline underline-offset-4">Analizuokite straipsnį</Link> ir paspauskite „Išsaugoti analizę“.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {rows.map((a) => (
              <li key={a.id} className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 py-4 sm:grid-cols-[auto_110px_1fr_auto] sm:items-center">
                <Checkbox
                  aria-label={`Pažymėti palyginimui: ${a.title || a.topic}`}
                  checked={selected.includes(a.id)}
                  onCheckedChange={(v) => toggle(a.id, v === true)}
                />
                <span className="font-mono text-xs text-muted-foreground">{formatDate(a.analyzed_at)}</span>
                <div className="col-span-2 col-start-2 row-start-2 sm:col-span-1 sm:col-start-auto sm:row-start-auto">
                  <Link to="/darbo-erdve/$id" params={{ id: a.id }} className="font-serif text-lg hover:underline">{a.title || a.topic}</Link>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{a.portal || "Portalas nenurodytas"}</span>
                    <span>· {a.topic}</span>
                    {projectName(a.project_id) ? <Badge variant="muted">{projectName(a.project_id)}</Badge> : null}
                    {a.is_sample ? <Badge variant="demo">Pavyzdys</Badge> : null}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ištrinti analizę"
                  onClick={() => { if (window.confirm("Ištrinti šią analizę?")) del.mutate(a.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
