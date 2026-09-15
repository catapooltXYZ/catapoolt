import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { encodeFunctionData, formatEther, parseAbi } from "viem";
import { client } from "../lib/pons";
import { connect, currentAccount, sendTx } from "../lib/wallet";
import { BASIN_CA, TOKEN_CA, explorerAddress, explorerTx, short } from "../lib/site";

export const Route = createFileRoute("/basin")({ component: BasinPage });

const basinAbi = parseAbi([
  "function totalReceived() view returns (uint256)",
  "function totalPulled() view returns (uint256)",
  "function pendingEscrow() view returns (uint256)",
  "function hoard() view returns (uint256 locked, uint256 releasable)",
  "function harvest()",
]);

type View = { balance: bigint; received: bigint; pending: bigint; locked: bigint };

function BasinPage() {
  const [v, setV] = useState<View | null>(null);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [tx, setTx] = useState<`0x${string}` | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!BASIN_CA) return;
    let alive = true;
    const read = async () => {
      try {
        const c = { address: BASIN_CA, abi: basinAbi } as const;
        const balance = await client.getBalance({ address: BASIN_CA });
        const received = await client.readContract({ ...c, functionName: "totalReceived" });
        const pending = await client.readContract({ ...c, functionName: "pendingEscrow" });
        const [locked] = await client.readContract({ ...c, functionName: "hoard" });
        if (alive) setV({ balance, received, pending, locked });
      } catch {
        /* keep last good values */
      }
    };
    read();
    const id = setInterval(read, 20_000);
    currentAccount().then((a) => alive && setAccount(a));
    return () => { alive = false; clearInterval(id); };
  }, []);

  const harvest = async () => {
    setErr(null);
    setBusy(true);
    try {
      if (!account) setAccount(await connect());
      const data = encodeFunctionData({ abi: basinAbi, functionName: "harvest" });
      setTx(await sendTx(BASIN_CA as `0x${string}`, data));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "transaction failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-12 space-y-8">
      <header>
        <h1 className="text-4xl font-black">The Basin</h1>
        <p className="mt-2 opacity-70">
          Where the creator fee collects. It does not pay holders and it never claimed
          it would. This page exists so the balance is public.
        </p>
      </header>

      {!BASIN_CA ? (
        <p className="border border-dashed border-ink/30 rounded-xl py-4 text-center font-mono">
          Not deployed yet.
        </p>
      ) : (
        <>
          <dl className="grid sm:grid-cols-2 gap-3 font-mono text-sm">
            <Row label="BASIN BALANCE" value={v ? `${formatEther(v.balance)} ETH` : "—"} />
            <Row label="UNCLAIMED IN ESCROW" value={v ? `${formatEther(v.pending)} ETH` : "—"} />
            <Row label="LIFETIME RECEIVED" value={v ? `${formatEther(v.received)} ETH` : "—"} />
            <Row label="CAT SIZE (LOCKED BUYBACK)" value={v ? formatEther(v.locked) : "—"} />
          </dl>

          <section className="border border-ink/15 rounded-xl p-5 space-y-3">
            <h2 className="font-bold">Harvest</h2>
            <p className="text-sm opacity-70">
              Anyone may call this. It sweeps the curve where it can and pulls the
              escrow balance into the Basin. <strong>It does not pay you.</strong> You
              pay the gas and the ETH stays in the contract.
            </p>
            <button onClick={harvest} disabled={busy}
                    className="bg-ink text-paper rounded-lg px-5 py-3 font-bold disabled:opacity-40">
              {busy ? "Confirm in wallet…" : account ? "Harvest" : "Connect & harvest"}
            </button>

            {tx && (
              <p className="font-mono text-xs">
                sent{" "}
                <a className="underline" href={explorerTx(tx)} target="_blank" rel="noreferrer">
                  {short(tx)}
                </a>
              </p>
            )}
            {err && <p className="font-mono text-xs text-[#C05780]">{err}</p>}
          </section>

          <p className="font-mono text-xs opacity-60">
            Basin{" "}
            <a className="underline" href={explorerAddress(BASIN_CA)} target="_blank" rel="noreferrer">
              {short(BASIN_CA)}
            </a>
            {TOKEN_CA && <> · token {short(TOKEN_CA)}</>}
          </p>
        </>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/15 rounded-xl px-4 py-3">
      <dt className="opacity-50 text-xs tracking-widest">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  );
}
