import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { BRAND, TOKEN_CA, URLS, isLaunched, short } from "@/lib/site";

const NAV = [
  { to: "/", label: "Watch" },
  { to: "/how", label: "How" },
  { to: "/play", label: "Play" },
  { to: "/landing", label: "Landing" },
  { to: "/basin", label: "Basin" },
] as const;

export function Wordmark({ size = "md" }: { size?: "sm" | "md" }) {
  const letters = BRAND.name.toUpperCase().split("");
  const box = size === "sm" ? "size-6 text-label" : "size-7 text-label sm:size-8 sm:text-xs";
  return (
    <span className="flex items-center gap-px sm:gap-0.5" aria-label={BRAND.name}>
      {letters.map((ch, i) => (
        <span
          key={`${ch}${i}`}
          className={cn(
            "grid place-items-center rounded-full bg-paper font-display leading-none text-night",
            box,
          )}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-label uppercase tracking-wide-label text-mute", className)}>
      {children}
    </p>
  );
}

export function Btn({
  href,
  onClick,
  disabled,
  children,
  tone = "primary",
  className,
}: {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  tone?: "primary" | "ghost";
  className?: string;
}) {
  const cls = cn(
    "inline-flex min-h-12 items-center justify-center rounded-lg px-6 font-display tracking-wide transition-[color,background-color,border-color,transform] duration-150 ease-out active:not-disabled:scale-[0.96]",
    tone === "primary"
      ? "bg-rope text-night hover:bg-paper"
      : "border border-paper/20 text-paper hover:border-rope hover:text-rope",
    disabled && "pointer-events-none opacity-40",
    className,
  );
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-paper/10 bg-night">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="self-start" aria-label="Catapoolt home">
          <Wordmark />
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-label uppercase tracking-wide-label text-mute">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-h-11 items-center text-paper/70 transition-colors duration-150 hover:text-rope [&.active]:text-paper [&.active]:underline [&.active]:decoration-rope [&.active]:underline-offset-8"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={URLS.x}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center hover:text-rope"
          >
            X
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-6xl border-t border-paper/10 px-5 py-8 font-mono text-label leading-relaxed text-mute sm:px-8">
      <p>{BRAND.credit}</p>
      <p className="mt-1">{BRAND.disclaimer}</p>
      <p className="mt-3 text-paper/40">
        {isLaunched() ? `CA ${short(TOKEN_CA)}` : "CA pending"} · Robinhood Chain 4663 · $
        {BRAND.ticker}
      </p>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-night text-paper">
      <div className="night-dust absolute inset-0" />
      <SiteNav />
      <main className="relative">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-paper/10 bg-raised p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}
