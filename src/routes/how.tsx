import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Page, Panel } from "@/components/chrome";
import { Field, Rails } from "@/components/world";
import { useLaunch } from "@/lib/use-launch";
import { BRAND, isLaunched } from "@/lib/site";

export const Route = createFileRoute("/how")({ component: How });

function How() {
  const { state } = useLaunch();
  const fee = state ? Number(state.feeBps) / 100 : null;
  const tax = state ? Number(state.creatorTaxBps) / 100 : null;
  const total = fee !== null && tax !== null ? fee + tax : null;
  const launched = isLaunched();
  const landed = (state?.phase ?? 0) >= 2;

  return (
    <Page>
      <Field
        kicker="Mechanics"
        title="The curve is the machine."
        progress={state?.progress ?? 0}
        fired={landed}
        waiting={!launched}
        focus="how"
      >
        <p className="max-w-2xl font-sans text-base leading-relaxed text-ink/80 sm:text-lg">
          {BRAND.sub} Mice are buyers. The fish is the pool. There is no keeper, no merkle, no score
          on chain. The site only reads logs.
        </p>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          <Phase
            n="01"
            title="The wind-up"
            body="Every buy pulls the arm back. The first fifty buyers sit as mice on the wall — cosmetic, never a payout."
            art="/cast/mouse.png"
            artAlt="A voxel mouse"
          />
          <Phase
            n="02"
            title="The landing"
            body="When the curve sells out, pons builds a locked Uniswap v4 pool. That instant is the cat leaving the basket for the fish."
            art="/cast/cat.png"
            artAlt="The voxel cat"
          />
          <Phase
            n="03"
            title="The pool"
            body="The js13k game opens. Jump, eat, grow. Scores stay on the device. Buybacks vest five years. No claim button."
            art="/cast/fish.png"
            artAlt="The voxel fish"
          />
        </ol>

        <section className="mt-10">
          <h2 className="font-display text-sm sm:text-base">What a trade costs</h2>
          <p className="mt-3 max-w-2xl font-sans text-ink/75">
            Launch config pins the protocol fee. Creator tax is chosen at launch. The sum is the
            number a trader actually pays. Nothing is hidden as “zero tax.”
          </p>
          <div className="mt-6 overflow-hidden rounded-sm bg-paper pixel-border">
            <table className="w-full font-sans text-sm">
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

        <Panel className="mt-6">
          <Eyebrow className="text-rope">Snipe window</Eyebrow>
          <p className="mt-2 font-sans text-base leading-snug sm:text-lg">
            The first five seconds of a pons launch are taxed by the protocol. Closed to bots. The
            tax starts near 99% and decays to zero. Launcher and creator fee recipient are exempt.
          </p>
        </Panel>

        <section className="mt-8">
          <Rails />
        </section>
      </Field>
    </Page>
  );
}

function Phase({
  n,
  title,
  body,
  art,
  artAlt,
}: {
  n: string;
  title: string;
  body: string;
  art: string;
  artAlt: string;
}) {
  return (
    <li>
      <Panel className="flex h-full flex-col">
        <div className="mb-4 grid h-36 place-items-center overflow-hidden rounded-sm bg-sky">
          <img src={art} alt={artAlt} className="max-h-32 w-auto" />
        </div>
        <p className="font-display text-label text-rope">{n}</p>
        <h3 className="mt-1 font-display text-sm leading-snug sm:text-base">{title}</h3>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink/75">{body}</p>
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
    <tr className="border-b border-ink/10 last:border-0">
      <td className="px-4 py-3 pr-4 text-mute sm:px-5">{label}</td>
      <td
        className={`px-4 py-3 text-right font-display text-label sm:px-5 ${strong ? "bg-rope text-paper" : ""}`}
      >
        {value}
      </td>
    </tr>
  );
}
