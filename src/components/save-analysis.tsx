import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rememberAfterAuth } from "@/lib/after-auth";
import { useAuth } from "@/lib/auth-context";
import { projectsQuery, saveAnalysis, type SaveAnalysisInput } from "@/lib/workspace";

import { ProjectSelect } from "./workspace-ui";

/**
 * „Išsaugoti analizę“: signed-out users are sent to sign in (the caller stashes the unsaved
 * analysis first); signed-in users pick an optional project and notes, then get a confirmation.
 */
export function SaveAnalysisButton({
  build,
  onNeedSignIn,
}: {
  build: () => Omit<SaveAnalysisInput, "notes" | "projectId">;
  onNeedSignIn: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const projects = useQuery({ ...projectsQuery(), enabled: !!user && open });

  const mutation = useMutation({
    mutationFn: () => saveAnalysis({ ...build(), notes, projectId }),
    onSuccess: (id) => {
      setSavedId(id);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Analizė išsaugota jūsų darbo erdvėje.", {
        action: { label: "Atidaryti", onClick: () => void navigate({ to: "/darbo-erdve/$id", params: { id } }) },
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Analizės išsaugoti nepavyko."),
  });

  if (savedId) {
    return (
      <div className="flex flex-wrap items-center gap-3" role="status">
        <span className="inline-flex items-center gap-1.5 text-sm text-verified">
          <Check className="h-4 w-4" aria-hidden /> Analizė išsaugota
        </span>
        <Button asChild variant="outline" size="sm">
          <Link to="/darbo-erdve/$id" params={{ id: savedId }}>Atidaryti darbo erdvėje</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          if (!user) {
            rememberAfterAuth("/straipsnis");
            onNeedSignIn();
            return;
          }
          setOpen(true);
        }}
      >
        <BookmarkPlus className="mr-2 h-4 w-4" /> Išsaugoti analizę
      </Button>
      {!user ? (
        <span className="text-xs text-muted-foreground">Išsaugojimui reikės prisijungti – analizė neprapuls.</span>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">Išsaugoti analizę</DialogTitle>
            <DialogDescription>
              Išsaugomi analizės rezultatai, ištraukos ir jų patikrinimas, antraštė, nuoroda ir portalas. Viso
              straipsnio tekstas nesaugomas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="kicker">Projektas (nebūtina)</Label>
              <ProjectSelect
                className="mt-1.5"
                projects={projects.data ?? []}
                value={projectId}
                onChange={setProjectId}
              />
            </div>
            <div>
              <Label htmlFor="save-notes" className="kicker">Pastabos (nebūtina)</Label>
              <Textarea
                id="save-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ką pastebėjote, ką reikia patikrinti…"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Atšaukti</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
              Išsaugoti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
