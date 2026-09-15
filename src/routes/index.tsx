import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { Catapult, NotchWall } from "../components/catapult";
import { readLaunchState, scanNotches, type LaunchState, type Notch } from "../lib/pons";
import { BRAND, TOKEN_CA, LAUNCH_BLOCK, INDEXER, isLaunched, ponsToken, short } from "../lib/site";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [state, setState] = useState<LaunchState | null>(null);
  const [notches, setNotches] = useState<Notch[]>([]);

  useEffect(() => {
    if (!isLaunched()) return;
    let alive = true;
    let cursor = LAUNCH_BLOCK;

    const tick = async () => {
      try {
        const s = await readLaunchState();
        if (alive && s) setState(s);
        const { notches: fresh, scannedTo } = await scanNotches(cursor, notches.filter(n => n.kind === "buy").length);
        if (alive && fresh.length) setNotches((prev) => [...prev, ...fresh]);
        cursor = scannedTo + 1n;
      } catch {
        /* keep the last good set on screen — never fall back to a demo tape */
      }
    };

    tick();
    const id = setInterval(tick, INDEXER.pollMs);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const progress = state?.progress ?? 0;
  const landed = (state?.phase ?? 0) >= 2;

  return (
    <main className="min-h-screen bg-paper text-ink px-5 py-10">
      <section className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight">CATAPOOLT</h1>
        <p className="mt-3 text-xl">{BRAND.line}</p>
        <p className="mt-1 opacity-60">{BRAND.sub}</p>
      </section>

      <section className="mt-12">
        <Catapult progress={progress} notches={notches} fired={landed} />
      </section>

      <section className="max-w-3xl mx-auto mt-10 grid sm:grid-cols-3 gap-4 font-mono text-sm">
        <Stat label="RAISED" value={state ? `${formatEther(state.raised)} ETH` : "—"} />
        <Stat label="TARGET" value={state ? `${formatEther(state.threshold)} ETH` : "—"} />
        <Stat label="TRADE COST"
              value={state ? `${Number(state.feeBps + state.creatorTaxBps) / 100}%` : "—"} />
      </section>

      <section className="max-w-3xl mx-auto mt-10">
        {isLaunched() ? (
          <a href={ponsToken(TOKEN_CA)} target="_blank" rel="noreferrer"
             className="block text-center bg-ink text-paper rounded-xl py-4 font-bold">
            {landed ? "Trade on the pool" : "Wind the arm — buy on pons"}
          </a>
        ) : (
          <div className="text-center border border-dashed border-ink/30 rounded-xl py-4 font-mono">
            CA pending. The arm goes up soon.
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto mt-12">
        <h2 className="font-mono text-sm tracking-widest opacity-60 mb-3">THE FOUNDING FIFTY</h2>
        <NotchWall notches={notches} />
      </section>

      {isLaunched() && (
        <p className="max-w-3xl mx-auto mt-10 font-mono text-xs opacity-60 text-center">
          CA {short(TOKEN_CA)} · the first 5 seconds of a pons launch carry a protocol
          anti-snipe tax on buys. It decays to zero.
        </p>
      )}

      <footer className="max-w-3xl mx-auto mt-16 border-t border-ink/15 pt-6
                         font-mono text-xs opacity-60 space-y-1 text-center">
        <p>{BRAND.credit}</p>
        <p>{BRAND.disclaimer}</p>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/15 rounded-xl px-4 py-3">
      <div className="opacity-50 text-xs tracking-widest">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
