import type { ReactNode } from "react";
import { useState } from "react";
import { BASIN_CA, TOKEN_CA, coatOf, explorerAddress, isAddr, PONS, short } from "@/lib/site";
import type { Notch } from "@/lib/pons";

export type MeadowFocus = "watch" | "how" | "play" | "land" | "pond";

const MICE = [
  { id: "m1", bottom: "7.2rem", delay: "0s", duration: "16s", size: "w-14 sm:w-20", hide: false },
  { id: "m2", bottom: "6.4rem", delay: "-5s", duration: "21s", size: "w-11 sm:w-16", hide: false },
  { id: "m3", bottom: "8.1rem", delay: "-9s", duration: "14s", size: "w-12 sm:w-16", hide: true },
  { id: "m4", bottom: "6.8rem", delay: "-13s", duration: "24s", size: "w-10 sm:w-14", hide: true },
  { id: "m5", bottom: "6.1rem", delay: "-2s", duration: "19s", size: "w-14 sm:w-20", hide: false },
] as const;

function MeadowStage() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-sky to-sky-deep" />
      <div
        className="animate-cloud pointer-events-none absolute top-16 h-10 w-24 rounded-sm bg-paper/85 sm:top-20 sm:h-14 sm:w-40"
        style={{ left: "-12%" }}
      />
      <div
        className="animate-cloud pointer-events-none absolute top-28 h-8 w-16 rounded-sm bg-paper/70 sm:top-32"
        style={{ left: "8%", animationDuration: "62s", animationDelay: "-18s" }}
      />
      <div
        className="animate-cloud pointer-events-none absolute top-12 hidden h-12 w-28 rounded-sm bg-paper/75 sm:block"
        style={{ left: "40%", animationDuration: "70s", animationDelay: "-30s" }}
      />
      <Tree className="bottom-28 left-[2%] hidden sm:block" />
      <Tree className="bottom-32 right-[2%] scale-75" />
      <div className="grass-field absolute inset-x-0 bottom-0 z-10 h-[42%] sm:h-[38%]" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-7 bg-dirt sm:h-8" />
    </>
  );
}

function Actors({
  progress,
  fired,
  waiting,
  focus,
}: {
  progress: number;
  fired: boolean;
  waiting: boolean;
  focus: MeadowFocus;
}) {
  const wound = Math.max(0, Math.min(1, progress));
  const tilt = fired ? 10 : -wound * 8;
  const [spooked, setSpooked] = useState<string | null>(null);
  const poke = (id: string) => {
    setSpooked(id);
    window.setTimeout(() => setSpooked((cur) => (cur === id ? null : cur)), 420);
  };

  const showCatapult = focus === "watch" || focus === "land";
  const showPond = focus === "watch" || focus === "pond";
  const showMice = focus === "watch" || focus === "how";
  const compact = focus !== "watch";

  return (
    <>
      {showPond && (
        <div
          className={`absolute z-20 ${
            focus === "pond"
              ? "right-[4%] bottom-28 h-[22%] w-[40%] max-w-xs sm:right-[5%] sm:bottom-32 sm:h-[28%] sm:w-[26%] sm:max-w-sm"
              : compact
                ? "right-[4%] bottom-28 h-[14%] w-[22%] max-w-36 sm:right-[6%]"
                : "right-[3%] bottom-28 h-[26%] w-[38%] max-w-64 sm:right-[6%] sm:bottom-32 sm:h-[24%] sm:w-[22%] sm:max-w-72"
          }`}
        >
          <p className="mb-1 text-center font-display text-label tracking-wide text-ink">THE POOL</p>
          <div className="relative h-[calc(100%-1rem)] overflow-hidden rounded-[40%] bg-pool pixel-border">
            <div className="animate-ripple absolute inset-x-[8%] top-2 h-3 rounded-full bg-paper/40" />
            <button
              type="button"
              onClick={() => poke("fish")}
              className="pointer-events-auto absolute inset-0 grid place-items-center border-0 bg-transparent p-0"
              aria-label="Tap the fish"
            >
              <img
                src="/cast/fish.png"
                alt="The pool fish"
                className={spooked === "fish" ? "spook w-[82%]" : "animate-bob w-[82%]"}
                style={{ animationDelay: "0.5s" }}
              />
            </button>
          </div>
        </div>
      )}

      {showCatapult && (
        <div
          className={`absolute z-20 ${
            compact
              ? "left-[12%] w-[34%] max-w-[180px] sm:left-[18%] sm:w-[22%] sm:max-w-[220px]"
              : "left-[10%] w-[62%] max-w-sm sm:left-[20%] sm:w-[40%] sm:max-w-xl"
          }`}
          style={{
            bottom: compact ? "6.5rem" : "5.5rem",
            transform: `rotate(${tilt}deg)`,
            transformOrigin: "40% 85%",
            transition: "transform 900ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <img
            src="/cast/catapult.png"
            alt={
              waiting
                ? "Catapult at rest. The arm goes up tomorrow."
                : `Catapult wound to ${Math.round(wound * 100)} percent`
            }
            className="w-full"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => poke("cat")}
        className={`pointer-events-auto absolute z-30 border-0 bg-transparent p-0 ${
          compact
            ? "bottom-28 left-[1%] w-[18%] max-w-24 sm:w-[10%] sm:max-w-28"
            : "bottom-24 left-[1%] w-[32%] max-w-44 sm:left-[2%] sm:w-[16%] sm:max-w-52"
        }`}
        aria-label="Tap the cat"
      >
        <img
          src="/cast/cat.png"
          alt="The Catapoolt cat"
          className={spooked === "cat" ? "spook w-full" : "animate-bob w-full"}
        />
      </button>

      {showMice &&
        MICE.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => poke(m.id)}
            className={`pointer-events-auto absolute z-30 border-0 bg-transparent p-0 ${m.size} ${m.hide || compact ? "hidden sm:block" : ""} ${compact ? "opacity-80" : ""}`}
            style={{ bottom: m.bottom, left: "2%" }}
            aria-label="Tap a mouse"
          >
            <img
              src="/cast/mouse.png"
              alt=""
              className={spooked === m.id ? "spook w-full" : "animate-scurry w-full"}
              style={{ animationDelay: m.delay, animationDuration: m.duration }}
            />
          </button>
        ))}
    </>
  );
}

function Tree({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute z-10 ${className ?? ""}`} aria-hidden>
      <div className="relative mx-auto h-20 w-16">
        <div className="absolute bottom-0 left-1/2 h-12 w-5 -translate-x-1/2 bg-dirt" />
        <div className="absolute bottom-8 left-1/2 size-14 -translate-x-1/2 bg-grass-dark pixel-border" />
        <div className="absolute bottom-14 left-1/2 size-10 -translate-x-1/2 bg-grass" />
      </div>
    </div>
  );
}

export function World({
  progress,
  fired = false,
  waiting = false,
}: {
  progress: number;
  fired?: boolean;
  waiting?: boolean;
}) {
  return (
    <div className="relative isolate h-[100dvh] min-h-[560px] overflow-hidden bg-sky">
      <MeadowStage />
      <div className="absolute inset-x-0 top-[18%] z-10 px-4 text-center sm:top-[14%]">
        <h1 className="font-display pixel-title text-[clamp(1.15rem,5.4vw,3.4rem)] leading-tight">
          CATAPOOLT
        </h1>
        <p className="mx-auto mt-3 max-w-lg font-sans text-sm text-ink/80 sm:mt-4 sm:text-base">
          The curve is the catapult. Every buy winds it. The mice pile in. The fish is the pool.
        </p>
        <p className="mt-2 font-display text-label tracking-wide text-ink/60">
          Tap the cat, the mice, the fish.
        </p>
      </div>
      <Actors progress={progress} fired={fired} waiting={waiting} focus="watch" />
    </div>
  );
}

export function Field({
  children,
  progress = 0,
  fired = false,
  waiting = true,
  focus = "how",
  title,
  kicker,
}: {
  children: ReactNode;
  progress?: number;
  fired?: boolean;
  waiting?: boolean;
  focus?: Exclude<MeadowFocus, "watch">;
  title: string;
  kicker: string;
}) {
  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 z-0">
        <MeadowStage />
        <Actors progress={progress} fired={fired} waiting={waiting} focus={focus} />
      </div>
      <div className={`relative z-20 mx-auto px-4 pb-32 pt-24 sm:px-8 ${focus === "how" || focus === "play" ? "max-w-5xl" : "max-w-xl sm:ml-8 sm:mr-auto"}`}>
        <p className="font-display text-label tracking-wide text-ink/70">{kicker}</p>
        <h1 className="mt-2 font-display text-sm leading-snug text-ink sm:text-xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function RopeMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="font-display text-label uppercase tracking-wide-label text-mute">Tension</p>
        <span className="font-display text-xl tabular-nums leading-none sm:text-3xl">
          {pct.toFixed(2)}
          <span className="text-label text-mute">%</span>
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm bg-ink/20 pixel-border">
        <div
          className="h-full bg-rope transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CoatMouse({ color, label }: { color: string; label: string }) {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full p-0.5" aria-label={label}>
      <circle cx="10" cy="10" r="4" fill={color} />
      <circle cx="22" cy="10" r="4" fill={color} />
      <ellipse cx="16" cy="20" rx="10" ry="8" fill={color} />
      <circle cx="13" cy="18" r="1.4" fill="var(--color-ink)" />
      <circle cx="19" cy="18" r="1.4" fill="var(--color-ink)" />
    </svg>
  );
}

export function NotchWall({ notches }: { notches: Notch[] }) {
  const buys = notches.filter((n) => n.kind === "buy").slice(0, 50);
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-sm uppercase tracking-wide-label text-ink sm:text-base">
          The Founding Fifty
        </h2>
        <p className="font-display text-label tabular-nums text-mute">{buys.length} / 50</p>
      </div>
      <ol className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
        {Array.from({ length: 50 }, (_, i) => {
          const n = buys[i];
          return (
            <li
              key={n ? `${n.tx}:${n.logIndex}` : `seat-${i}`}
              className="aspect-square rounded-sm bg-paper pixel-border"
              title={n ? `${short(n.wallet)} · #${n.index}` : `Mouse ${i + 1}`}
            >
              {n ? (
                <CoatMouse color={coatOf(n.wallet)} label={short(n.wallet)} />
              ) : (
                <span className="grid h-full place-items-center font-display text-label text-mute/40">
                  {i + 1}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-sans text-sm text-mute">
        Cosmetic mice. First fifty buyers on the curve. Not a promise, not a payout.
      </p>
    </div>
  );
}

export function Rails() {
  return (
    <div className="overflow-hidden rounded-sm bg-paper pixel-border">
      <div className="border-b border-ink/10 px-5 py-3">
        <p className="font-display text-label tracking-wide text-mute">The rails</p>
      </div>
      <dl>
        <Rail label="Chain" value="Robinhood 4663" />
        <Rail
          label="Pad"
          value="pons v2"
          href="https://docs.ponsfamily.com/v2"
        />
        <Rail
          label="Factory"
          value={short(PONS.factory)}
          href={explorerAddress(PONS.factory)}
        />
        <Rail
          label="Escrow"
          value={short(PONS.feeEscrow)}
          href={explorerAddress(PONS.feeEscrow)}
        />
        <Rail label="RPC" value="sequential · no batch" />
        <Rail label="Token" value={isAddr(TOKEN_CA) ? short(TOKEN_CA) : "pending"} />
        <Rail label="Basin" value={isAddr(BASIN_CA) ? short(BASIN_CA) : "pending"} />
        <Rail label="Order" value="OPS EOA first, then Basin" />
      </dl>
    </div>
  );
}

function Rail({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="grid grid-cols-1 border-b border-ink/10 px-5 py-3 last:border-0 sm:grid-cols-[140px_1fr]">
      <dt className="font-display text-label uppercase tracking-wide-label text-mute">{label}</dt>
      <dd className="mt-1 font-display text-label tabular-nums sm:mt-0">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
