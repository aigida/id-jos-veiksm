import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Panel } from "@/components/analysis-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Naujas slaptažodis – PERSPEKTYVA" },
      { name: "description", content: "Nustatykite naują PERSPEKTYVA paskyros slaptažodį." },
      { property: "og:title", content: "Naujas slaptažodis – PERSPEKTYVA" },
      { property: "og:description", content: "Slaptažodžio atkūrimas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setIsRecovery(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Slaptažodžio pakeisti nepavyko. Nuoroda galėjo nebegalioti.");
      return;
    }
    toast.success("Slaptažodis pakeistas.");
    void navigate({ to: "/darbo-erdve" });
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16 sm:px-6">
      <Panel className="space-y-4">
        <h1 className="text-3xl font-medium">Naujas slaptažodis</h1>
        {!isRecovery ? (
          <p className="text-sm text-muted-foreground">Atidarykite šį puslapį per nuorodą iš slaptažodžio atkūrimo laiško.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new-password" className="kicker">Naujas slaptažodis</Label>
              <Input id="new-password" type="password" minLength={6} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>Išsaugoti slaptažodį</Button>
          </form>
        )}
      </Panel>
    </div>
  );
}
