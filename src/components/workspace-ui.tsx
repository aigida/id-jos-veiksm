import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Project } from "@/lib/workspace";
import { cn } from "@/lib/utils";

const NONE = "__none__";

export function ProjectSelect({
  projects,
  value,
  onChange,
  className,
  noneLabel = "Be projekto",
}: {
  projects: Project[];
  value: string | null;
  onChange: (id: string | null) => void;
  className?: string;
  noneLabel?: string;
}) {
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger className={cn("bg-card", className)} aria-label="Projektas">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{noneLabel}</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Heading and sub-navigation shared by every workspace page. */
export function WorkspaceHeader({ kicker, title, intro, children }: { kicker: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <nav className="mb-8 flex gap-1 border-b border-border text-sm" aria-label="Darbo erdvė">
        {(
          [
            { to: "/darbo-erdve", label: "Analizės" },
            { to: "/projektai", label: "Projektai" },
          ] as const
        ).map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="-mb-px border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "border-foreground text-foreground font-medium" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="kicker mb-3">{kicker}</p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-normal sm:text-5xl">{title}</h1>
        {children}
      </div>
      {intro ? <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border p-10 text-center">
      <p className="font-serif text-xl">{title}</p>
      {children ? <div className="mt-2 text-sm text-muted-foreground">{children}</div> : null}
    </div>
  );
}
