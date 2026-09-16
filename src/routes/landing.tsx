import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Btn, Eyebrow, Page, Panel } from "@/components/chrome";
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
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Eyebrow>Graduation record</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
          {landed ? "The cat landed." : "The cat has not landed."}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-paper/75">
          One moment. Block, transaction, last notch. We show the address, never a name.
        </p>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-paper/10 bg-night">
          <div className="grid min-h-56 place-items-center px-6 py-10">
            {landed ? (
              <img src="/cat/body.png" alt="The cat in the pool" className="max-h-56 w-auto" />
            ) : (
              <div className="text-center">
                <div className="relative mx-auto mb-4 size-32">
                  <span className="absolute inset-0 rounded-full border border-dashed border-pool/50 bg-pool/15" />
                  <img
                    src="/cat/face.png"
                    alt=""
                    className="relative size-full p-5 opacity-50"
                  />
                </div>
                <p className="font-mono text-label uppercase tracking-wide-label text-mute">
                  Pool empty
                </p>
              </div>
            )}
          </div>
        </div>

        <dl className="mt-8 overflow-hidden rounded-2xl border border-paper/10">
          <Record
            label="Status"
            value={
              landed ? "Pool created" : launched ? phaseLabel(state?.phase ?? 0) : "Not launched"
            }
          />
          <Record label="Token" value={launched ? short(TOKEN_CA) : "pending"} />
          <Record label="Last notch" value={lastBuy ? short(lastBuy.wallet) : "—"} />
          <Record
            label="Last notch tx"
            value={lastBuy ? lastBuy.tx.slice(0, 10) + "…" : "—"}
          />
          <Record label="Block" value={lastBuy ? lastBuy.block.toString() : "—"} />
        </dl>

        {needsFinish && (
          <Panel className="mt-10">
            <p className="font-display text-2xl">Finish the launch</p>
            <p className="mt-2 text-paper/75">
              The curve is ready. Auto-graduation can fail. Anyone may call
              createGraduatedPool. No keeper. No wait.
            </p>
            <Btn
              onClick={() => void onFinish()}
              disabled={busy}
              className="mt-5"
            >
              {busy ? "Sending…" : hasWallet() ? "Create the pool" : "Need a wallet"}
            </Btn>
            {tx && (
              <p className="mt-3 font-mono text-label">
                <a className="underline" href={explorerTx(tx)} target="_blank" rel="noreferrer">
                  {tx.slice(0, 10)}…
                </a>
              </p>
            )}
            {err && <p className="mt-3 font-mono text-label text-rope">{err}</p>}
          </Panel>
        )}
      </section>
    </Page>
  );
}

function phaseLabel(phase: number): string {
  return ["On the curve", "Swept", "Pool created", "Rescued"][phase] ?? `phase ${phase}`;
}

function Record({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 border-b border-paper/10 bg-raised px-5 py-4 last:border-0 sm:grid-cols-[160px_1fr]">
      <dt className="font-mono text-label uppercase tracking-wide-label text-mute">{label}</dt>
      <dd className="mt-1 font-mono text-sm tabular-nums sm:mt-0">{value}</dd>
    </div>
  );
}
