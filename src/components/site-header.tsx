import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

import { Logo } from "./logo";

const NAV = [
  { to: "/portalas", label: "Portalas" },
  { to: "/straipsnis", label: "Straipsnis" },
  { to: "/palyginimas", label: "Palyginimas" },
  { to: "/metodika", label: "Metodika" },
  { to: "/darbo-erdve", label: "Mano darbo erdvė" },
] as const;

function AccountControl() {
  const { user, ready, signOut } = useAuth();
  if (!ready) return <span className="h-8 w-8" aria-hidden />;
  if (!user) {
    return (
      <Link
        to="/auth"
        search={{ redirect: undefined }}
        className="ml-1 inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-foreground hover:bg-muted"
      >
        <LogIn className="h-3.5 w-3.5" aria-hidden /> Prisijungti
      </Link>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
        aria-label="Paskyra"
      >
        <UserRound className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/darbo-erdve">Mano darbo erdvė</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/projektai">Projektai</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Atsijungti
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <AccountControl />
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
