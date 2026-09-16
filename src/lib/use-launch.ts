import { useEffect, useState } from "react";
import {
  readBasin,
  readLaunchState,
  scanNotches,
  type BasinState,
  type LaunchState,
  type Notch,
} from "./pons";
import { INDEXER, LAUNCH_BLOCK, isLaunched } from "./site";

export function useLaunch() {
  const [state, setState] = useState<LaunchState | null>(null);
  const [notches, setNotches] = useState<Notch[]>([]);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!isLaunched() || LAUNCH_BLOCK === 0n) return;
    let alive = true;
    let cursor: bigint = LAUNCH_BLOCK;
    let buyCount = 0;

    const tick = async () => {
      try {
        const next = await readLaunchState();
        if (alive && next) setState(next);
        const { notches: fresh, scannedTo } = await scanNotches(cursor, buyCount);
        if (!alive) return;
        if (fresh.length) {
          buyCount += fresh.filter((n) => n.kind === "buy").length;
          setNotches((prev) => {
            const seen = new Set(prev.map((n) => `${n.tx}:${n.logIndex}`));
            const extra = fresh.filter((n) => !seen.has(`${n.tx}:${n.logIndex}`));
            return extra.length ? [...prev, ...extra] : prev;
          });
        }
        cursor = scannedTo + 1n;
        setStale(false);
      } catch {
        if (alive) setStale(true);
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), INDEXER.pollMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return { state, notches, stale };
}

export function useBasin() {
  const [basin, setBasin] = useState<BasinState | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const next = await readBasin();
        if (alive) setBasin(next);
      } catch {
        /* keep last */
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), INDEXER.pollMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return basin;
}
