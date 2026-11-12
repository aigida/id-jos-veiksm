import { AlertTriangle, CheckCircle2, CircleHelp, FlaskConical, Info } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { quoteAppearsInText } from "@/lib/quote-check";
import { cn } from "@/lib/utils";

export const INSUFFICIENT = "Nepakanka duomenų patikimai išvadai";

export function DemoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="demo-hatch flex gap-3 rounded-md border border-warning/60 p-4 text-sm text-warning-foreground">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-wider">Demonstraciniai duomenys</p>
        <p className="mt-1 leading-relaxed text-foreground/80">{children}</p>
      </div>
    </div>
  );
}

export function InsufficientData({ children }: { children?: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border border-warning/60 bg-warning-soft p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div>
        <p className="font-medium text-warning-foreground">{INSUFFICIENT}</p>
        {children ? <p className="mt-1 leading-relaxed text-foreground/80">{children}</p> : null}
      </div>
    </div>
  );
}

export function AssistNote() {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="leading-relaxed">
        DI analizė yra pagalbinė priemonė, o ne galutinis žurnalistinis vertinimas. Ištraukos automatiškai
        tikrinamos pateiktame tekste – nepatvirtintas ištraukas vertinkite ypač atsargiai.
      </p>
    </div>
  );
}

export function Section({
  kicker,
  title,
  children,
  className,
  aside,
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <section className={cn("rule-top pt-4", className)}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {kicker ? <p className="kicker mb-1">{kicker}</p> : null}
          <h2 className="text-2xl font-medium">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A quoted excerpt plus a badge telling whether it was found verbatim in the source text. */
export function Excerpt({ text, source, className }: { text: string | null; source?: string; className?: string }) {
  if (!text) return null;
  const found = source ? quoteAppearsInText(text, source) : null;
  return (
    <figure className={cn("mt-2", className)}>
      <blockquote className="evidence text-[0.95rem] leading-relaxed text-foreground/85">„{text}“</blockquote>
      {found === null ? null : found ? (
        <Badge variant="verified" className="mt-1.5 gap-1">
          <CheckCircle2 className="h-3 w-3" aria-hidden /> Rasta tekste
        </Badge>
      ) : (
        <Badge variant="unverified" className="mt-1.5 gap-1">
          <CircleHelp className="h-3 w-3" aria-hidden /> Nerasta tekste – patikrinkite
        </Badge>
      )}
    </figure>
  );
}

export function BarList({ items, unit = "" }: { items: readonly { label: string; count: number }[]; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const total = items.reduce((s, i) => s + i.count, 0);
  return (
    <ul className="space-y-3">
      {items.map((item, idx) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span>{item.label}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {item.count}
              {unit} {total > 0 ? `· ${Math.round((item.count / total) * 100)}%` : ""}
            </span>
          </div>
          <div className="h-2 w-full rounded-sm bg-muted">
            <div
              className={cn(
                "h-2 rounded-sm",
                ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"][idx % 5],
              )}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MetaRow({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-4 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="kicker">{i.label}</dt>
          <dd className="mt-1 text-sm">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-md border border-border bg-card p-5", className)}>{children}</div>;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("lt-LT", { dateStyle: "medium", timeStyle: "short" });
}
