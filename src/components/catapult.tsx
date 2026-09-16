import { coatOf, short } from "@/lib/site";
import type { Notch } from "@/lib/pons";
import { Eyebrow } from "@/components/chrome";

/**
 * The machine. progress 0..1 pulls the arm from slack to fully wound.
 * One CSS rotate. Moves when the chain moves — 15s poll, not 60fps.
 */
export function Catapult({
  progress,
  notches,
  fired = false,
  waiting = false,
}: {
  progress: number;
  notches: Notch[];
  fired?: boolean;
  waiting?: boolean;
}) {
  const wound = Math.max(0, Math.min(1, progress));
  const angle = fired ? 34 : -8 - wound * 70;
  const riders = notches.filter((n) => n.kind === "buy").slice(-8);
  const ropeX = 300 - 24 - wound * 52;
  const ropeW = 6 + wound * 6;

  return (
    <div className="relative mx-auto w-full max-w-6xl select-none overflow-hidden rounded-2xl border border-paper/10 bg-night">
      <svg
        viewBox="0 0 1100 640"
        className="h-auto w-full"
        role="img"
        aria-label={
          waiting
            ? "Catapult at rest. The arm goes up tomorrow."
            : `Catapult wound to ${Math.round(wound * 100)} percent`
        }
      >
        <defs>
          <radialGradient id="sky" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="var(--color-raised)" />
            <stop offset="100%" stopColor="var(--color-night)" />
          </radialGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-paper)" stopOpacity="0.55" />
            <stop offset="35%" stopColor="var(--color-pool)" />
            <stop offset="100%" stopColor="var(--color-pool)" stopOpacity="0.7" />
          </linearGradient>
          <filter id="pool-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1100" height="640" fill="url(#sky)" />

        <g fill="var(--color-paper)" opacity="0.45">
          <circle cx="90" cy="48" r="1.4" />
          <circle cx="210" cy="92" r="1" />
          <circle cx="380" cy="36" r="1.1" />
          <circle cx="640" cy="70" r="0.9" />
          <circle cx="790" cy="40" r="1.3" />
          <circle cx="980" cy="88" r="1" />
          <circle cx="1040" cy="30" r="0.8" />
        </g>

        <path
          d="M0 520 C 180 500, 360 536, 560 518 C 760 500, 920 528, 1100 512 L 1100 640 L 0 640 Z"
          fill="var(--color-raised)"
        />
        <path
          d="M0 520 C 180 500, 360 536, 560 518 C 760 500, 920 528, 1100 512"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="1.5"
          opacity="0.25"
        />

        {/* pool */}
        <ellipse
          cx="860"
          cy="508"
          rx="168"
          ry="48"
          fill="var(--color-pool)"
          opacity="0.18"
          filter="url(#pool-glow)"
        />
        <ellipse cx="860" cy="496" rx="150" ry="38" fill="url(#water)" />
        <ellipse
          cx="860"
          cy="486"
          rx="118"
          ry="14"
          fill="var(--color-paper)"
          opacity="0.28"
          className="animate-ripple origin-center"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <text
          x="860"
          y="568"
          textAnchor="middle"
          fill="var(--color-paper)"
          opacity="0.45"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="13"
          letterSpacing="6"
        >
          THE POOL
        </text>

        {/* A-frame — wood beam with cream edge */}
        <path
          d="M168 530 L300 200 L432 530"
          fill="none"
          stroke="var(--color-wood)"
          strokeWidth="34"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M168 530 L300 200 L432 530"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M214 400 L386 400"
          stroke="var(--color-wood)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M214 400 L386 400"
          stroke="var(--color-paper)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M236 340 L364 340"
          stroke="var(--color-paper)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <rect x="148" y="522" width="304" height="18" rx="4" fill="var(--color-wood)" />
        <rect
          x="148"
          y="522"
          width="304"
          height="18"
          rx="4"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="3"
        />

        {/* winch */}
        <circle cx="300" cy="530" r="22" fill="var(--color-wood)" />
        <circle
          cx="300"
          cy="530"
          r="22"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="4"
        />
        <circle cx="300" cy="530" r="7" fill="var(--color-rope)" />

        {/* rope */}
        <line
          x1="300"
          y1="218"
          x2={ropeX}
          y2="530"
          stroke="var(--color-rope)"
          strokeWidth={ropeW}
          strokeLinecap="round"
        />

        {/* arm + basket */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "300px 218px",
            transition: "transform 900ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <rect
            x="289"
            y="8"
            width="22"
            height="220"
            rx="8"
            fill="var(--color-wood)"
            stroke="var(--color-paper)"
            strokeWidth="4"
          />
          <circle cx="300" cy="218" r="18" fill="var(--color-wood)" />
          <circle
            cx="300"
            cy="218"
            r="18"
            fill="none"
            stroke="var(--color-paper)"
            strokeWidth="5"
          />
          <circle cx="300" cy="218" r="5" fill="var(--color-paper)" />

          <ellipse
            cx="300"
            cy="4"
            rx="58"
            ry="30"
            fill="var(--color-rope)"
            stroke="var(--color-paper)"
            strokeWidth="4"
          />
          <ellipse
            cx="300"
            cy="-2"
            rx="42"
            ry="14"
            fill="var(--color-night)"
            stroke="var(--color-paper)"
            strokeWidth="2.5"
          />

          {!waiting && !fired && (
            <image href="/cat/body.png" x="248" y="-70" width="104" height="66" />
          )}

          {riders.map((n, i) => (
            <circle
              key={`${n.tx}:${n.logIndex}`}
              r="6.5"
              cx={278 + (i % 4) * 14}
              cy={-2 - Math.floor(i / 4) * 13}
              fill={coatOf(n.wallet)}
              stroke="var(--color-paper)"
              strokeWidth="1.4"
            />
          ))}
        </g>

        <circle cx="300" cy="218" r="8" fill="var(--color-rope)" />
        <circle
          cx="300"
          cy="218"
          r="8"
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="3"
        />

        {fired && <image href="/cat/body.png" x="720" y="310" width="220" height="138" />}
      </svg>

      {waiting && (
        <img
          src="/cat/face.png"
          alt=""
          className="animate-breathe pointer-events-none absolute bottom-8 left-3 w-28 sm:bottom-14 sm:left-10 sm:w-56 lg:w-64"
        />
      )}
    </div>
  );
}

export function RopeMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Eyebrow>Tension</Eyebrow>
        <span className="font-display text-3xl tabular-nums leading-none sm:text-4xl">
          {pct.toFixed(2)}
          <span className="text-xl text-mute">%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-raised">
        <div
          className="h-full rounded-full bg-rope transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CoatCat({ color, label }: { color: string; label: string }) {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full p-0.5" aria-label={label}>
      <polygon points="8,14 11,4 16,14" fill={color} />
      <polygon points="24,14 21,4 16,14" fill={color} />
      <ellipse cx="16" cy="20" rx="10" ry="9" fill={color} />
      <rect x="11" y="16" width="2.5" height="5" rx="1" fill="var(--color-eye)" />
      <rect x="18.5" y="16" width="2.5" height="5" rx="1" fill="var(--color-eye)" />
    </svg>
  );
}

export function NotchWall({ notches }: { notches: Notch[] }) {
  const buys = notches.filter((n) => n.kind === "buy").slice(0, 50);
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-mono text-label uppercase tracking-wide-label text-mute">
          The Founding Fifty
        </h2>
        <p className="font-mono text-label tabular-nums text-mute">{buys.length} / 50</p>
      </div>
      <ol className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
        {Array.from({ length: 50 }, (_, i) => {
          const n = buys[i];
          return (
            <li
              key={n ? `${n.tx}:${n.logIndex}` : `seat-${i}`}
              className="aspect-square rounded-md border border-paper/10 bg-raised"
              title={n ? `${short(n.wallet)} · #${n.index}` : `Seat ${i + 1}`}
            >
              {n ? (
                <CoatCat color={coatOf(n.wallet)} label={short(n.wallet)} />
              ) : (
                <span className="grid h-full place-items-center font-mono text-label text-mute/30">
                  {i + 1}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-mono text-label text-mute">
        Cosmetic. First fifty buyers on the curve. Not a promise, not a payout.
      </p>
    </div>
  );
}
