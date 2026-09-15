import { COATS, coatOf, short } from "../lib/site";
import type { Notch } from "../lib/pons";

/**
 * The arm. progress 0..1 pulls it back from -15deg to -78deg.
 * No canvas, no rAF loop: this moves when the chain moves, 15s poll.
 */
export function Catapult({
  progress,
  notches,
  fired = false,
}: {
  progress: number;
  notches: Notch[];
  fired?: boolean;
}) {
  const angle = fired ? 28 : -15 - progress * 63;
  const riders = notches.filter((n) => n.kind === "buy").slice(-9);

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      <svg viewBox="0 0 800 460" className="w-full h-auto" role="img"
           aria-label={`Catapult wound to ${Math.round(progress * 100)} percent`}>
        <defs>
          <linearGradient id="pool" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12B5C9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0A7A88" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* the pool, where the cat lands at graduation */}
        <rect x="560" y="330" width="220" height="100" rx="14" fill="url(#pool)" />
        <text x="670" y="452" textAnchor="middle" className="fill-ink/50"
              fontSize="16" letterSpacing="3">THE POOL</text>

        {/* frame */}
        <path d="M120 400 L200 240 L280 400 Z" fill="none" stroke="#121212" strokeWidth="10"
              strokeLinejoin="round" />
        <rect x="90" y="398" width="230" height="12" rx="6" fill="#121212" />

        {/* arm + basket, driven by progress */}
        <g transform={`rotate(${angle} 200 240)`}
           style={{ transition: "transform 900ms cubic-bezier(.2,.8,.2,1)" }}>
          <rect x="192" y="60" width="16" height="185" rx="8" fill="#121212" />
          <circle cx="200" cy="58" r="26" fill="#FF6A2B" stroke="#121212" strokeWidth="6" />
          {riders.map((n, i) => (
            <circle key={n.tx + i} r="7" cx={200 + (i % 3) * 14 - 14} cy={44 - Math.floor(i / 3) * 14}
                    fill={coatOf(n.wallet)} stroke="#121212" strokeWidth="2" />
          ))}
        </g>

        {/* rope tension */}
        <line x1="200" y1="240" x2={200 - progress * 40} y2="396"
              stroke="#FF6A2B" strokeWidth={4 + progress * 4} strokeLinecap="round" />
      </svg>

      <div className="mt-6 flex items-baseline justify-between font-mono text-sm">
        <span>WIND-UP</span>
        <span className="text-2xl font-bold">{(progress * 100).toFixed(2)}%</span>
        <span>LANDING</span>
      </div>
      <div className="mt-2 h-2 w-full bg-ink/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#FF6A2B] transition-[width] duration-700"
             style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
    </div>
  );
}

/** Founding Fifty strip. Cosmetic. No promise attached to it, ever. */
export function NotchWall({ notches }: { notches: Notch[] }) {
  const buys = notches.filter((n) => n.kind === "buy").slice(0, 50);
  if (buys.length === 0) {
    return <p className="font-mono text-sm opacity-60">No notches yet. The arm is slack.</p>;
  }
  return (
    <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
      {buys.map((n) => (
        <li key={n.tx} className="flex items-center gap-2 border border-ink/15 rounded px-2 py-1">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: coatOf(n.wallet) }} />
          <span className="opacity-50">#{n.index}</span>
          <span>{short(n.wallet)}</span>
        </li>
      ))}
    </ol>
  );
}

export const COAT_COUNT = COATS.length;
