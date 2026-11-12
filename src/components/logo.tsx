import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="3" y="7" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="11" y="3" width="18" height="18" fill="currentColor" opacity="0.18" />
      <rect x="11" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-foreground" aria-label="PERSPEKTYVA – pradžia">
      <LogoMark />
      <span className="font-mono text-sm font-semibold tracking-[0.22em]">PERSPEKTYVA</span>
    </Link>
  );
}
