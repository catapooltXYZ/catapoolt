import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { BRAND, TOKEN_CA, URLS, isLaunched, short } from "@/lib/site";
import { useLaunch } from "@/lib/use-launch";

const NAV = [
  { to: "/how", label: "How" },
  { to: "/play", label: "Play" },
  { to: "/landing", label: "Land" },
  { to: "/basin", label: "Pond" },
] as const;

const hudBtn =
  "inline-flex min-h-11 shrink-0 items-center rounded-sm bg-paper px-3 font-display text-label uppercase tracking-wide text-ink pixel-border hover:bg-rope hover:text-paper sm:min-h-12 sm:px-4";

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2" aria-label={BRAND.name}>
      <img src="/cast/logo.png" alt="" className="size-10 rounded-sm pixel-border sm:size-12" />
      <span
        className={cn(
          "font-display text-[10px] leading-none tracking-wide sm:text-xs",
          light ? "pixel-title" : "text-ink",
        )}
      >
        {BRAND.name.toUpperCase()}
      </span>
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-display text-label uppercase tracking-wide-label text-mute", className)}>
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
    "inline-flex min-h-12 items-center justify-center rounded-sm px-5 font-display text-label tracking-wide transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
    tone === "primary"
      ? "bg-rope text-paper pixel-border hover:bg-ink"
      : "bg-paper text-ink pixel-border hover:bg-sky",
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

export function HudChip({
  children,
  tone = "paper",
  className,
}: {
  children: ReactNode;
  tone?: "paper" | "rope";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-10 items-center rounded-sm px-3 font-display text-label tracking-wide pixel-border",
        tone === "rope" ? "bg-rope text-paper" : "bg-paper text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function WorldHud() {
  const { state } = useLaunch();
  const launched = isLaunched();
  const pct = Math.max(0, Math.min(100, (state?.progress ?? 0) * 100));

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1.5 bg-ink/20">
        <div
          className="h-full bg-rope transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-3 p-3 pt-3.5 sm:p-4 sm:pt-5">
        <Link to="/" className="pointer-events-auto" aria-label="Catapoolt home">
          <Wordmark light />
        </Link>
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <HudChip>${BRAND.ticker}</HudChip>
          <HudChip>{launched ? `${pct.toFixed(0)}%` : "0%"}</HudChip>
          {!launched && <HudChip tone="rope">T-24</HudChip>}
          <HudChip className="hidden sm:inline-flex">{launched ? short(TOKEN_CA) : "CA pending"}</HudChip>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex flex-nowrap items-center justify-center gap-1.5 overflow-x-auto p-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] sm:gap-3 sm:p-4">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={hudBtn}
            activeProps={{ className: "bg-rope text-paper hover:bg-ink" }}
          >
            {item.label}
          </Link>
        ))}
        <a href={URLS.x} target="_blank" rel="noreferrer" className={hudBtn}>
          X
        </a>
      </nav>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-20 mx-auto w-full max-w-6xl px-5 pb-28 pt-8 font-sans text-sm leading-relaxed text-ink/70 sm:px-8">
      <p className="font-display text-label leading-relaxed">{BRAND.credit}</p>
      <p className="mt-2">{BRAND.disclaimer}</p>
      <p className="mt-3 font-display text-label">
        {isLaunched() ? `CA ${short(TOKEN_CA)}` : "CA pending"} · Robinhood Chain 4663 · $
        {BRAND.ticker}
      </p>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-sky text-ink">
      <WorldHud />
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
  return <div className={cn("rounded-sm bg-paper p-5 pixel-border sm:p-6", className)}>{children}</div>;
}
