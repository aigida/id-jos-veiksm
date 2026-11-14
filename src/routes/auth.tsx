import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Panel } from "@/components/analysis-ui";
import { GoogleButton } from "@/components/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { consumeAfterAuth, rememberAfterAuth, safeRedirectPath } from "@/lib/after-auth";
import { useAuth } from "@/lib/auth-context";

type AuthSearch = { redirect?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeRedirectPath(search["redirect"]) ?? undefined,
  }),
  head: () => ({
    meta: [
      { title: "Prisijungimas – PERSPEKTYVA" },
      { name: "description", content: "Prisijunkite prie PERSPEKTYVA, kad galėtumėte išsaugoti analizes ir kurti tyrimų projektus." },
      { property: "og:title", content: "Prisijungimas – PERSPEKTYVA" },
      { property: "og:description", content: "Asmeninė darbo erdvė žurnalistų analizėms ir tyrimų projektams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "Neteisingas el. paštas arba slaptažodis.",
  "Email not confirmed": "El. paštas dar nepatvirtintas. Paspauskite nuorodą laiške.",
  "User already registered": "Toks vartotojas jau užregistruotas. Prisijunkite.",
};
const lt = (msg: string) => ERRORS[msg] ?? (msg.includes("Password") ? "Slaptažodis turi būti bent 6 simbolių." : "Nepavyko. Bandykite dar kartą.");

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<null | "email" | "google">(null);
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  useEffect(() => {
    if (redirect) rememberAfterAuth(redirect);
  }, [redirect]);

  // Signed in (password, Google return, or already) → go where the user was heading.
  useEffect(() => {
    if (ready && user) void navigate({ href: consumeAfterAuth() ?? "/darbo-erdve", replace: true });
  }, [ready, user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending("email");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(lt(error.message));
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) toast.error(lt(error.message));
        else if (!data.session) setSent("confirm");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) toast.error(lt(error.message));
        else setSent("reset");
      }
    } finally {
      setPending(null);
    }
  }

  async function google() {
    setPending("google");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) {
      toast.error("Prisijungti per Google nepavyko.");
      setPending(null);
    }
    // Redirected or session set — the effect above navigates once the session arrives.
    if (!result.redirected) setPending(null);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 pt-12 sm:px-6 md:grid-cols-[1fr_420px]">
      <div>
        <p className="kicker mb-3">Mano darbo erdvė</p>
        <h1 className="text-4xl font-normal sm:text-5xl">Išsaugokite analizes ir kurkite tyrimus</h1>
        <ul className="mt-6 max-w-md list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Išsaugotos analizės neišnyks perkrovus puslapį.</li>
          <li>Jūsų analizes, pastabas ir projektus matote tik jūs.</li>
          <li>Viso straipsnio tekstas nesaugomas – tik analizė, trumpos ištraukos ir nuoroda.</li>
        </ul>
      </div>

      <Panel className="space-y-5">
        {sent ? (
          <div className="space-y-3" role="status">
            <h2 className="text-2xl font-medium">Patikrinkite el. paštą</h2>
            <p className="text-sm text-muted-foreground">
              {sent === "confirm"
                ? `Išsiuntėme patvirtinimo nuorodą adresu ${email}. Paspaudę ją būsite prisijungę.`
                : `Jei paskyra adresu ${email} egzistuoja, išsiuntėme slaptažodžio keitimo nuorodą.`}
            </p>
            <Button variant="outline" onClick={() => { setSent(null); setMode("signin"); }}>Grįžti</Button>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-medium">
                {mode === "signin" ? "Prisijungti" : mode === "signup" ? "Sukurti paskyrą" : "Atkurti slaptažodį"}
              </h2>
            </div>
            {mode !== "forgot" ? (
              <>
                <GoogleButton onClick={google} pending={pending === "google"} />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> arba el. paštu <span className="h-px flex-1 bg-border" />
                </div>
              </>
            ) : null}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="kicker">El. paštas</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              {mode !== "forgot" ? (
                <div>
                  <Label htmlFor="password" className="kicker">Slaptažodis</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={pending !== null}>
                {pending === "email" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === "signin" ? "Prisijungti" : mode === "signup" ? "Registruotis" : "Siųsti nuorodą"}
              </Button>
            </form>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              {mode === "signin" ? (
                <>
                  <button type="button" className="underline underline-offset-4" onClick={() => setMode("signup")}>Neturite paskyros? Registruotis</button>
                  <button type="button" className="text-muted-foreground underline underline-offset-4" onClick={() => setMode("forgot")}>Pamiršote slaptažodį?</button>
                </>
              ) : (
                <button type="button" className="underline underline-offset-4" onClick={() => setMode("signin")}>Jau turite paskyrą? Prisijungti</button>
              )}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
