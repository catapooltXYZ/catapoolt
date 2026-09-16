import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { formatEther, formatUnits } from "viem";
import { Btn, Eyebrow, Page, Panel } from "@/components/chrome";
import { Field } from "@/components/world";
import { useBasin, useLaunch } from "@/lib/use-launch";
import { basinWriteUrl, harvestBasin, hasWallet } from "@/lib/wallet";
import { BASIN_CA, explorerAddress, explorerTx, isAddr, isLaunched, short } from "@/lib/site";

export const Route = createFileRoute("/basin")({ component: BasinPage });

function BasinPage() {
  const basin = useBasin();
  const { state } = useLaunch();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const live = isAddr(BASIN_CA);
  const launched = isLaunched();
  const landed = (state?.phase ?? 0) >= 2;
  const water = live && basin ? waterLevel(basin.eth, basin.pending) : 0.12;

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

  return (
    <Page>
      <Field
        kicker="Fee sink"
        title="The Pond."
        progress={state?.progress ?? 0}
        fired={landed}
        waiting={!launched}
        focus="pond"
      >
        <p className="max-w-xl font-sans text-base text-ink/80 sm:text-lg">
          Creator fees accrue, then sit here. Ops pulls. Nobody else is owed a split.
        </p>

        <div className="relative mt-8 overflow-hidden rounded-sm pixel-border">
          <div className="relative h-48 bg-sky sm:h-56">
            <div
              className="absolute inset-x-0 bottom-0 bg-pool transition-[height] duration-500 ease-out"
              style={{ height: `${Math.round(water * 100)}%` }}
            />
            <img
              src="/cast/fish.png"
              alt=""
              className="animate-bob absolute right-3 top-3 w-20 sm:w-28"
            />
            <div className="relative z-10 flex h-full flex-col justify-between p-5">
              <Eyebrow>Cistern</Eyebrow>
              <p className="font-display text-xl tabular-nums sm:text-3xl">
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
          </div>
        ) : (
          <p className="mt-6 max-w-md font-sans text-sm text-mute">
            Pond is not on chain yet. Same wait as the token. Harvest stays dark until the address
            is real.
          </p>
        )}

        <Panel className="mt-8">
          <p className="font-display text-sm sm:text-base">Harvest</p>
          <p className="mt-2 max-w-prose font-sans text-ink/75">
            This does not pay you. It moves fees into the Pond. Anyone may call it. Gas is yours;
            the ETH is not.
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
                className="min-h-12 px-3 font-display text-label underline underline-offset-4"
              >
                {short(BASIN_CA)}
              </a>
            )}
          </div>
          {err && <p className="mt-3 font-display text-label text-rope">{err}</p>}
          {tx && (
            <p className="mt-3 font-display text-label">
              <a className="underline" href={explorerTx(tx)} target="_blank" rel="noreferrer">
                {tx}
              </a>
            </p>
          )}
          {!hasWallet() && live && (
            <p className="mt-3 font-display text-label text-mute">
              No injected wallet — Harvest still opens the explorer.
            </p>
          )}
        </Panel>

        <p className="mt-8 font-display text-label text-mute">
          Buyback {state?.buybackEnabled ? "on" : "unset"} · harvest still claims escrow.
        </p>
      </Field>
    </Page>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2 font-display text-lg tabular-nums leading-none sm:text-2xl">{value}</div>
      {hint && <p className="mt-2 font-sans text-sm text-mute">{hint}</p>}
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
  if (!Number.isFinite(n) || n <= 0) return 0.12;
  return Math.min(0.92, 0.12 + Math.log10(1 + n) / 3);
}
