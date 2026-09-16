import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Btn, Marquee } from "@/components/chrome";
import {
  BASIN_CA,
  TOKEN_CA,
  URLS,
  coatOf,
  explorerAddress,
  isAddr,
  isLaunched,
  PONS,
  ponsToken,
  short,
} from "@/lib/site";
import type { Notch } from "@/lib/pons";

export type MeadowFocus = "watch" | "how" | "play" | "land" | "pond";

function Pixel({
  a,
  b,
  alt,
  className,
  delay,
}: {
  a: string;
  b?: string;
  alt: string;
  className?: string;
  delay?: string;
}) {
  return (
    <span
      className={`relative inline-block ${className ?? ""}`}
      style={delay ? { animationDelay: delay } : undefined}
    >
      <img src={a} alt={alt} className="spr block h-auto w-full" />
      {b ? (
        <img src={b} alt="" className="spr animate-frame absolute inset-0 block h-auto w-full" />
      ) : null}
    </span>
  );
}

function Ground() {
  return (
    <>
      <div className="mc-grass absolute inset-x-0 z-10 h-4" style={{ bottom: "var(--marquee-h)" }} />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <Marquee />
      </div>
    </>
  );
}

function Clouds() {
  return (
    <>
      <img
        src="/sprites/cloud.png"
        alt=""
        className="spr animate-cloud pointer-events-none absolute top-10 h-10 w-28 sm:top-14 sm:h-14 sm:w-40"
        style={{ left: "-8%" }}
      />
      <img
        src="/sprites/cloud.png"
        alt=""
        className="spr animate-cloud pointer-events-none absolute top-24 h-8 w-20 sm:top-28"
        style={{ left: "18%", animationDuration: "62s", animationDelay: "-20s" }}
      />
      <img
        src="/sprites/cloud.png"
        alt=""
        className="spr animate-cloud pointer-events-none absolute top-8 hidden h-12 w-32 sm:block"
        style={{ left: "55%", animationDuration: "70s", animationDelay: "-32s" }}
      />
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
  const tilt = fired ? 8 : -wound * 6;
  const [spooked, setSpooked] = useState<string | null>(null);
  const poke = (id: string) => {
    setSpooked(id);
    window.setTimeout(() => setSpooked((cur) => (cur === id ? null : cur)), 420);
  };

  const showCatapult = focus === "watch" || focus === "land";
  const showPond = focus === "watch" || focus === "pond";
  const showMice = focus === "watch" || focus === "how";
  const showCat = focus !== "pond";
  const feet = { bottom: "var(--ground-h)" } as const;

  return (
    <>
      {showCatapult && (
        <div
          className="absolute z-20 hidden w-40 sm:block sm:left-[18%] sm:w-52 lg:w-60"
          style={{
            ...feet,
            transform: `rotate(${tilt}deg)`,
            transformOrigin: "40% 90%",
            transition: "transform 900ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <img
            src="/sprites/catapult.png"
            alt={
              waiting
                ? "Catapult at rest. The arm goes up tomorrow."
                : `Catapult wound to ${Math.round(wound * 100)} percent`
            }
            className="spr w-full"
          />
          {showCat && (
            <button
              type="button"
              onClick={() => poke("cat")}
              className="pointer-events-auto absolute left-[48%] top-[-6%] w-[42%] border-0 bg-transparent p-0"
              aria-label="Tap the cat"
            >
              <span className={spooked === "cat" ? "spook block" : "block"}>
                <Pixel a="/sprites/cat-a.png" b="/sprites/cat-b.png" alt="The Catapoolt cat" className="w-full" />
              </span>
            </button>
          )}
        </div>
      )}

      {showCat && !showCatapult && (
        <button
          type="button"
          onClick={() => poke("cat")}
          className="pointer-events-auto absolute z-30 left-[8%] w-24 border-0 bg-transparent p-0 sm:left-[18%] sm:w-32 lg:w-36"
          style={feet}
          aria-label="Tap the cat"
        >
          <span className={spooked === "cat" ? "spook block" : "block"}>
            <Pixel a="/sprites/cat-a.png" b="/sprites/cat-b.png" alt="The Catapoolt cat" className="w-full" />
          </span>
        </button>
      )}

      {showPond && (
        <div className="absolute z-20 right-[3%] w-20 sm:right-[5%] sm:w-28 lg:w-32" style={feet}>
          <img src="/sprites/water.png" alt="" className="spr w-full" />
          <button
            type="button"
            onClick={() => poke("fish")}
            className="pointer-events-auto absolute inset-0 grid place-items-center border-0 bg-transparent p-0"
            aria-label="Tap the fish"
          >
            <span className={spooked === "fish" ? "spook block w-4/5" : "animate-bob block w-4/5"}>
              <Pixel a="/sprites/fish-a.png" b="/sprites/fish-b.png" alt="The pool fish" className="w-full" />
            </span>
          </button>
        </div>
      )}

      {showMice &&
        [0, 1].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => poke(`mouse${i}`)}
            className={`pointer-events-auto absolute z-30 right-0 border-0 bg-transparent p-0 animate-pigwalk ${
              i === 1 ? "hidden sm:block" : ""
            } w-16 sm:w-24 lg:w-28`}
            style={{ ...feet, animationDelay: `${-i * 7}s` }}
            aria-label="Tap a mouse"
          >
            <span className={spooked === `mouse${i}` ? "spook block" : "block"}>
              <Pixel
                a="/sprites/mouse-a.png"
                b="/sprites/mouse-b.png"
                alt="A mouse on the grass"
                className="w-full"
              />
            </span>
          </button>
        ))}

      {focus === "how" &&
        [1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => poke(`m${i}`)}
            className="pointer-events-auto absolute z-30 hidden w-16 border-0 bg-transparent p-0 animate-scurry sm:block sm:w-20"
            style={{ ...feet, left: `${12 + i * 18}%`, animationDelay: `${-i * 7}s` }}
            aria-label="Tap a mouse"
          >
            <span className={spooked === `m${i}` ? "spook block" : "block"}>
              <Pixel
                a="/sprites/mouse-a.png"
                b="/sprites/mouse-b.png"
                alt=""
                className="w-full"
              />
            </span>
          </button>
        ))}
    </>
  );
}

function CaBar() {
  const launched = isLaunched();
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (!launched || !TOKEN_CA) return;
    try {
      await navigator.clipboard.writeText(TOKEN_CA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="mt-5 flex min-h-11 items-center gap-0 bg-ink font-display text-label text-paper">
      <span className="px-3 py-3 text-gold">CA</span>
      <span className="px-3 py-3 tracking-wide">{launched ? short(TOKEN_CA) : "pending"}</span>
      <button
        type="button"
        onClick={onCopy}
        disabled={!launched}
        className={`px-4 py-3 ${launched ? "bg-buy hover:bg-grass" : "bg-chart"}`}
      >
        {launched ? (copied ? "COPIED" : "COPY") : "T-24"}
      </button>
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
  const launched = isLaunched();

  return (
    <div className="relative isolate min-h-[32rem] overflow-hidden bg-sky sm:min-h-[calc(100dvh-3.75rem)]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-sky to-sky-deep" />
      <Clouds />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pb-36 pt-8 text-center sm:pb-40 sm:pt-12">
        <h1 className="pixel-title m-0 font-display text-[22px] leading-none tracking-wide sm:text-4xl md:text-5xl">
          CATAPOOLT
        </h1>
        <p className="mt-5 font-display text-label tracking-wide text-ink sm:text-xs">
          $POOLT · ON ROBINHOOD
        </p>
        <p className="mt-4 max-w-lg font-display text-label leading-relaxed text-ink sm:text-xs">
          The curve is the catapult.
        </p>
        <p className="mt-2 font-display text-label leading-relaxed text-ink sm:text-xs">
          Mice pile in. The fish is the pool.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {launched ? (
            <Btn href={ponsToken(TOKEN_CA)}>Buy $POOLT</Btn>
          ) : (
            <Link
              to="/how"
              className="mc-btn inline-flex min-h-12 items-center bg-buy px-6 font-display text-label text-paper hover:bg-ink"
            >
              How it works
            </Link>
          )}
          <Link
            to="/play"
            className="mc-btn inline-flex min-h-12 items-center bg-chart px-6 font-display text-label text-paper hover:bg-ink"
          >
            Play
          </Link>
        </div>

        <CaBar />
        <p className="mt-3 font-display text-label text-ink/60">Tap the cat, the mice, the fish.</p>
      </div>

      <Actors progress={progress} fired={fired} waiting={waiting} focus="watch" />
      <Ground />
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
    <div className="relative min-h-[calc(100dvh-3.75rem)] bg-sky">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-sky to-sky-deep" />
        <Clouds />
        <div className="pointer-events-auto">
          <Actors progress={progress} fired={fired} waiting={waiting} focus={focus} />
        </div>
        <Ground />
      </div>
      <div className="relative z-20 mx-auto max-w-5xl px-4 pb-36 pt-10 sm:px-8">
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
      <div className="h-3 overflow-hidden bg-ink/20 pixel-border">
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
      <rect x="6" y="4" width="6" height="6" fill={color} />
      <rect x="20" y="4" width="6" height="6" fill={color} />
      <rect x="6" y="10" width="20" height="14" fill={color} />
      <rect x="10" y="14" width="3" height="3" fill="var(--color-ink)" />
      <rect x="19" y="14" width="3" height="3" fill="var(--color-ink)" />
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
              className="aspect-square bg-paper pixel-border"
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
    <div className="overflow-hidden bg-paper pixel-border">
      <div className="border-b border-ink/10 px-5 py-3">
        <p className="font-display text-label tracking-wide text-mute">The rails</p>
      </div>
      <dl>
        <Rail label="Chain" value="Robinhood 4663" />
        <Rail label="Pad" value="pons v2" href={URLS.ponsDocs} />
        <Rail label="Factory" value={short(PONS.factory)} href={explorerAddress(PONS.factory)} />
        <Rail label="Escrow" value={short(PONS.feeEscrow)} href={explorerAddress(PONS.feeEscrow)} />
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
