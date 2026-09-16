import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { BRAND, TOKEN_CA, URLS, ethShort, isLaunched, short } from "@/lib/site";
import { useLaunch } from "@/lib/use-launch";

const NAV = [
  { to: "/", label: "Watch" },
  { to: "/how", label: "How" },
  { to: "/play", label: "Play" },
  { to: "/landing", label: "Land" },
  { to: "/basin", label: "Pond" },
] as const;

export function Wordmark() {
  return (
    <span className="flex items-center gap-2" aria-label={BRAND.name}>
      <img src="/sprites/head.png" alt="" className="spr size-8 sm:size-10" />
      <span className="font-display text-[10px] leading-none tracking-wide text-gold sm:text-xs">
        CATAPOOLT
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
    "mc-btn inline-flex min-h-12 items-center justify-center px-5 font-display text-label tracking-wide text-paper transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
    tone === "primary" ? "bg-buy hover:bg-ink" : "bg-chart hover:bg-ink",
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

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full border border-paper/20 px-2.5 font-display text-label tracking-wide text-paper">
      {children}
    </span>
  );
}

function TensionRope({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="h-2 w-full bg-wood/80" aria-hidden>
      <div
        className="h-full bg-rope transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function DirtNav() {
  const launched = isLaunched();
  const { state } = useLaunch();
  const progress = state?.progress ?? 0;
  const pct = Math.round(progress * 100);

  return (
    <header className="sticky top-0 z-50">
      <TensionRope value={progress} />
      <div className="dirt-bar border-b-4 border-ink">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
          <Link to="/" className="shrink-0" aria-label="Catapoolt home">
            <Wordmark />
          </Link>
          <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
            <Chip>${BRAND.ticker}</Chip>
            {launched && state ? (
              <Chip>
                {ethShort(state.raised, 3)}/{ethShort(state.threshold, 1)} ETH
              </Chip>
            ) : null}
            <Chip>{pct}%</Chip>
            {!launched && <Chip>T-24</Chip>}
            <Chip>{launched ? short(TOKEN_CA) : "CA pending"}</Chip>
          </div>
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:justify-end sm:gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="mc-btn inline-flex min-h-10 shrink-0 items-center bg-dirt-dark px-2 font-display text-label uppercase tracking-wide text-paper hover:bg-wood sm:px-3"
                activeProps={{ className: "bg-rope text-paper hover:bg-rope" }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={URLS.x}
              target="_blank"
              rel="noreferrer"
              className="mc-btn inline-flex min-h-10 shrink-0 items-center bg-dirt-dark px-2 font-display text-label uppercase tracking-wide text-paper hover:bg-wood sm:px-3"
            >
              X
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Marquee() {
  const line =
    "THE CURVE IS THE CATAPULT  ·  MICE PILE IN  ·  THE FISH IS THE POOL  ·  $POOLT  ·  ROBINHOOD CHAIN  ·  ";
  return (
    <div className="dirt-bar overflow-hidden border-t-4 border-ink py-3">
      <div className="animate-marquee flex w-max gap-0 font-display text-label tracking-wide text-gold">
        <span className="px-4">{line.repeat(4)}</span>
        <span className="px-4" aria-hidden>
          {line.repeat(4)}
        </span>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-20 mx-auto w-full max-w-6xl px-5 pb-10 pt-8 font-sans text-sm leading-relaxed text-ink/70 sm:px-8">
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
      <DirtNav />
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
  return <div className={cn("bg-paper p-5 pixel-border sm:p-6", className)}>{children}</div>;
}
