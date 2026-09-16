import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { formatEther, formatUnits } from "viem";
import { Btn, Eyebrow, Page, Panel } from "@/components/chrome";
import { useBasin, useLaunch } from "@/lib/use-launch";
import { basinWriteUrl, harvestBasin, hasWallet } from "@/lib/wallet";
import { BASIN_CA, explorerAddress, explorerTx, isAddr, short } from "@/lib/site";

export const Route = createFileRoute("/basin")({ component: BasinPage });

function BasinPage() {
  const basin = useBasin();
  const { state } = useLaunch();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const live = isAddr(BASIN_CA);

  const onHarvest = async () => {
    setErr(null);
    setBusy(true);
    try {
      const hash = await harvestBasin();
      setTx(hash);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "failed";
      if (msg === "NO_WALLET") {
        window.open(basinWriteUrl(), "_blank", "noopener,noreferrer");
        setErr("No wallet here — opened the explorer write page.");
      } else if (msg === "NO_BASIN") {
        setErr("Basin not deployed yet.");
      } else {
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const water = live && basin ? waterLevel(basin.eth, basin.pending) : 0.08;

  return (
    <Page>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Eyebrow>Fee sink</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
          The Basin.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-paper/75">
          Creator fees accrue, then sit here. Ops pulls. Nobody else is owed a split.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-paper/10 bg-night">
          <div className="relative h-56">
            <div
              className="absolute inset-x-0 bottom-0 bg-pool/90 transition-[height] duration-500 ease-out"
              style={{ height: `${Math.round(water * 100)}%` }}
            />
            <div className="absolute inset-x-0 bottom-0 h-3 bg-paper/20" />
            <div className="relative z-10 flex h-full flex-col justify-between p-5">
              <Eyebrow className="text-paper/70">Cistern</Eyebrow>
              <p className="font-display text-3xl tabular-nums sm:text-4xl">
                {live && basin ? `${trimEth(basin.eth)} ETH` : "Dry"}
              </p>
            </div>
          </div>
        </div>

        {live && basin ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Stat label="Pending in escrow" value={`${trimEth(basin.pending)} ETH`} />
            <Stat
              label="Buyback locked"
              value={`${trimTok(basin.locked)} POOLT`}
              hint="How big the cat is. 5-year vest. Not a TVL cartoon."
            />
            <Stat label="Releasable" value={`${trimTok(basin.releasable)} POOLT`} />
            <Stat label="Basin address" value={short(BASIN_CA)} />
          </div>
        ) : (
          <p className="mt-6 max-w-md font-mono text-sm text-mute">
            Basin is not on chain yet. Same wait as the token. Harvest stays dark until the
            address is real.
          </p>
        )}

        <Panel className="mt-10">
          <p className="font-display text-2xl">Harvest</p>
          <p className="mt-2 max-w-prose text-paper/75">
            This does not pay you. It moves fees into the Basin. Anyone may call it. Gas is
            yours; the ETH is not.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Btn onClick={() => void onHarvest()} disabled={busy || !live}>
              {busy ? "Harvesting…" : "Harvest"}
            </Btn>
            {live && (
              <a
                href={explorerAddress(BASIN_CA)}
                target="_blank"
                rel="noreferrer"
                className="min-h-12 px-3 font-mono text-label tracking-wide underline decoration-paper/30 underline-offset-4 hover:text-rope"
              >
                {short(BASIN_CA)}
              </a>
            )}
          </div>
          {!live && (
            <p className="mt-4 font-mono text-label text-mute">
              Basin CA pending. Same as the token.
            </p>
          )}
          {tx && (
            <p className="mt-3 font-mono text-label">
              <a className="underline" href={explorerTx(tx)} target="_blank" rel="noreferrer">
                {tx}
              </a>
            </p>
          )}
          {err && <p className="mt-3 font-mono text-label text-rope">{err}</p>}
          {!hasWallet() && live && (
            <p className="mt-3 font-mono text-label text-mute">
              No injected wallet — Harvest still opens the explorer.
            </p>
          )}
        </Panel>

        <p className="mt-8 font-mono text-label text-mute">
          Buyback {state?.buybackEnabled ? "on" : "unset"} · sweep may revert
          InternalSwapRequiresOperator while pons runs the buyback. Harvest still claims
          escrow.
        </p>
      </section>
    </Page>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2 font-display text-2xl tabular-nums leading-none sm:text-3xl">
        {value}
      </div>
      {hint && <p className="mt-2 text-sm text-mute">{hint}</p>}
    </Panel>
  );
}

function trimEth(wei: bigint): string {
  const s = formatEther(wei);
  const [a, b = ""] = s.split(".");
  return b ? `${a}.${b.slice(0, 5)}` : a ?? "0";
}

function trimTok(wei: bigint): string {
  const s = formatUnits(wei, 18);
  const [a, b = ""] = s.split(".");
  return b ? `${a}.${b.slice(0, 2)}` : a ?? "0";
}

function waterLevel(eth: bigint, pending: bigint): number {
  const n = Number(eth + pending) / 1e18;
  if (!Number.isFinite(n) || n <= 0) return 0.08;
  return Math.min(0.92, 0.12 + Math.log10(1 + n) / 3);
}
