import { Link } from "@tanstack/react-router";

import { Logo } from "./logo";

const NAV = [
  { to: "/portalas", label: "Portalas" },
  { to: "/straipsnis", label: "Straipsnis" },
  { to: "/palyginimas", label: "Palyginimas" },
  { to: "/metodika", label: "Metodika" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="-mx-2 flex items-center gap-1 overflow-x-auto text-sm">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-sm px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium underline decoration-2 underline-offset-[10px]" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted-foreground sm:grid-cols-[1fr_2fr] sm:px-6">
        <div>
          <p className="kicker mb-2">PERSPEKTYVA · v0.1</p>
          <p>Prototipas žurnalistams, redaktoriams ir medijų tyrėjams.</p>
        </div>
        <p className="leading-relaxed">
          DI analizė yra pagalbinė priemonė, o ne galutinis žurnalistinis vertinimas. Kiekvieną išvadą
          tikrinkite pirminiame šaltinyje. Įrankis neklijuoja portalams politinių etikečių ir nėra „tiesos
          arbitras“.
        </p>
      </div>
    </footer>
  );
}
