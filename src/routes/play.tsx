import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { readLaunchState } from "../lib/pons";
import { BRAND, isLaunched } from "../lib/site";

export const Route = createFileRoute("/play")({ component: Play });

/**
 * The js13k engine is a self-contained single-file build with its own canvas,
 * audio context and rAF loop. It runs in an iframe from /game/index.html rather
 * than being mounted into React: no SSR conflict, no global collisions, and the
 * upstream build stays byte-identical so the MIT credit means something.
 */
function Play() {
  const [phase, setPhase] = useState<number | null>(null);

  useEffect(() => {
    if (!isLaunched()) return;
    readLaunchState().then((s) => s && setPhase(s.phase)).catch(() => {});
  }, []);

  const landed = (phase ?? 0) >= 2;

  return (
    <main className="max-w-4xl mx-auto px-5 py-10">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-black">Play</h1>
        <span className="font-mono text-xs opacity-60">
          {landed ? "the cat is in the pool" : "free to play, scores are cosmetic"}
        </span>
      </header>

      <div className="mt-6 rounded-2xl overflow-hidden border-4 border-ink bg-black">
        <iframe
          src="/game/index.html"
          title="Catapoolt"
          className="w-full block"
          style={{ aspectRatio: "4 / 3", border: 0 }}
          allow="autoplay"
        />
      </div>

      <p className="mt-4 font-mono text-xs opacity-60">
        Scores live in your browser. Nothing here is signed, submitted or rewarded —
        no keeper, no leaderboard contract, no claim. {BRAND.credit}
      </p>
    </main>
  );
}
