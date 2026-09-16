import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Btn, Page, Panel } from "@/components/chrome";
import { Field } from "@/components/world";
import { useLaunch } from "@/lib/use-launch";
import { finishLaunch, hasWallet } from "@/lib/wallet";
import { TOKEN_CA, explorerTx, isLaunched, short } from "@/lib/site";

export const Route = createFileRoute("/landing")({ component: Landing });

function Landing() {
  const { state, notches } = useLaunch();
  const launched = isLaunched();
  const landed = (state?.phase ?? 0) >= 2;
  const needsFinish = Boolean(state?.ready && (state?.phase ?? 0) < 2);
  const lastBuy = [...notches].reverse().find((n) => n.kind === "buy");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);

  const onFinish = async () => {
    setErr(null);
    setBusy(true);
    try {
      const hash = await finishLaunch();
      setTx(hash);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "failed";
      setErr(msg === "NO_WALLET" ? "Connect a wallet on Robinhood Chain 4663." : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <Field
        kicker="Graduation"
        title={landed ? "The cat landed." : "The fish is still waiting."}
        progress={state?.progress ?? 0}
        fired={landed}
        waiting={!launched}
        focus="land"
      >
        <p className="max-w-xl font-sans text-base text-ink/80 sm:text-lg">
          One moment. Block, transaction, last notch. We show the address, never a name.
        </p>

        <dl className="mt-6 overflow-hidden rounded-sm bg-paper pixel-border">
          <Record
            label="Status"
            value={
              landed ? "Pool created" : launched ? phaseLabel(state?.phase ?? 0) : "Not launched"
            }
          />
          <Record label="Token" value={launched ? short(TOKEN_CA) : "pending"} />
          <Record label="Last notch" value={lastBuy ? short(lastBuy.wallet) : "—"} />
          <Record label="Last notch tx" value={lastBuy ? lastBuy.tx.slice(0, 10) + "…" : "—"} />
          <Record label="Block" value={lastBuy ? lastBuy.block.toString() : "—"} />
        </dl>

        {needsFinish ? (
          <Panel className="mt-8">
            <p className="font-display text-sm sm:text-base">Finish the launch</p>
            <p className="mt-2 font-sans text-ink/75">
              The curve is ready. Auto-graduation can fail. Anyone may call createGraduatedPool.
            </p>
            <Btn onClick={() => void onFinish()} disabled={busy} className="mt-5">
              {busy ? "Sending…" : hasWallet() ? "Create the pool" : "Need a wallet"}
            </Btn>
            {err && <p className="mt-3 font-display text-label text-rope">{err}</p>}
            {tx && (
              <p className="mt-3 font-display text-label">
                <a className="underline" href={explorerTx(tx)} target="_blank" rel="noreferrer">
                  {tx.slice(0, 10)}…
                </a>
              </p>
            )}
          </Panel>
        ) : (
          <p className="mt-6 max-w-md font-sans text-sm text-mute">
            {launched
              ? "Waiting for the curve to fill. This page becomes the record."
              : "No launch yet. The pool stays empty until the cat flies."}
          </p>
        )}
      </Field>
    </Page>
  );
}

function phaseLabel(phase: number): string {
  return ["On the curve", "Swept", "Pool created", "Rescued"][phase] ?? `phase ${phase}`;
}

function Record({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 border-b border-ink/10 px-5 py-4 last:border-0 sm:grid-cols-[160px_1fr]">
      <dt className="font-display text-label uppercase tracking-wide-label text-mute">{label}</dt>
      <dd className="mt-1 font-display text-label tabular-nums sm:mt-0">{value}</dd>
    </div>
  );
}
