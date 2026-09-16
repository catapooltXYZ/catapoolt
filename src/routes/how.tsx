import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Page, Panel } from "@/components/chrome";
import { useLaunch } from "@/lib/use-launch";
import { BRAND } from "@/lib/site";

export const Route = createFileRoute("/how")({ component: How });

function How() {
  const { state } = useLaunch();
  const fee = state ? Number(state.feeBps) / 100 : null;
  const tax = state ? Number(state.creatorTaxBps) / 100 : null;
  const total = fee !== null && tax !== null ? fee + tax : null;

  return (
    <Page>
      <article className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Eyebrow>Mechanics</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
          The curve is the machine.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/80">
          {BRAND.sub} There is no keeper, no merkle, no score on chain. The site only reads
          logs. The economy runs itself.
        </p>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          <Phase
            n="01"
            title="The wind-up"
            body="The token lives on a bonding curve. Every buy pulls the arm back. Graduation progress is physical tension, not a dashboard number. The first fifty buyers sit on the wall as coats — cosmetic, never a payout."
            art="/cat/face.png"
            artAlt="Blob cat waiting in the basket"
          />
          <Phase
            n="02"
            title="The landing"
            body="When the curve sells out, pons builds a locked Uniswap v4 pool. That instant is the cat leaving the basket. Block, tx, and the last notch are the record. Permissionless: if auto-graduation fails, anyone can finish the launch."
            art="/cat/body.png"
            artAlt="Blob cat leaping"
          />
          <Phase
            n="03"
            title="The pool"
            body="The js13k game opens. Jump, eat, grow. Scores stay on the device. Buybacks vest into a vault for five years — that locked supply is how big the cat is. No claim button. No epoch."
            art="/cat/body.png"
            artAlt="Blob cat over the pool"
            pool
          />
        </ol>

        <section className="mt-14">
          <h2 className="font-display text-2xl">What a trade costs</h2>
          <p className="mt-3 max-w-2xl text-paper/75">
            Launch config pins the protocol fee. Creator tax is chosen at launch, at most the
            protocol cap — we aim 100–300 bps. The sum is the number a trader actually pays.
            Nothing is hidden as “zero tax.”
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-paper/10">
            <table className="w-full font-mono text-sm">
              <tbody>
                <Row
                  label="Protocol fee (feeBps)"
                  value={fee === null ? "from launch config" : `${fee.toFixed(2)}%`}
                />
                <Row
                  label="Creator tax (creatorTaxBps)"
                  value={tax === null ? "100–300 bps" : `${tax.toFixed(2)}%`}
                />
                <Row
                  label="You pay"
                  value={total === null ? "fee + creator tax" : `${total.toFixed(2)}%`}
                  strong
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-rope/60 bg-raised px-5 py-6 sm:px-6">
          <Eyebrow className="text-rope">Snipe window</Eyebrow>
          <p className="mt-2 text-lg leading-snug text-paper">
            The first five seconds of a pons launch are taxed by the protocol. Closed to bots.
            The tax starts near 99% and decays to zero (about 25% at one second, about 3% at
            two). Launcher and creator fee recipient are exempt. Extra wallets can only be
            written at launch, never later.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl">The Basin</h2>
          <p className="mt-3 max-w-2xl text-paper/75">
            Creator ETH that is not used for buybacks sits in the pons fee escrow. The Basin
            is the sink that claims it. Harvest is permissionless: it moves fees into the
            Basin. It does not pay you. There is no holder distribution, because a promise we
            cannot keep is worse than no promise.
          </p>
        </section>

        <p className="mt-16 font-mono text-label text-mute">{BRAND.disclaimer}</p>
      </article>
    </Page>
  );
}

function Phase({
  n,
  title,
  body,
  art,
  artAlt,
  pool,
}: {
  n: string;
  title: string;
  body: string;
  art?: string;
  artAlt?: string;
  pool?: boolean;
}) {
  return (
    <li>
      <Panel className="flex h-full flex-col">
        <div className="relative mb-4 grid h-36 place-items-center overflow-hidden rounded-lg bg-night">
          {pool && (
            <span className="absolute size-28 rounded-full bg-pool/80" />
          )}
          {art ? (
            <img src={art} alt={artAlt ?? ""} className="relative z-10 max-h-32 w-auto" />
          ) : null}
        </div>
        <p className="font-mono text-label text-rope">{n}</p>
        <h3 className="mt-1 font-display text-xl leading-none">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-paper/75">{body}</p>
      </Panel>
    </li>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <tr className="border-b border-paper/10 last:border-0">
      <td className="bg-raised px-4 py-3 pr-4 text-mute sm:px-5">{label}</td>
      <td
        className={`px-4 py-3 text-right sm:px-5 ${strong ? "bg-rope font-semibold text-night" : "bg-raised text-paper"}`}
      >
        {value}
      </td>
    </tr>
  );
}
