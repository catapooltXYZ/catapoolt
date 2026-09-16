import { createFileRoute, Link } from "@tanstack/react-router";
import { formatEther } from "viem";
import { NotchWall, Rails, RopeMeter, World } from "@/components/world";
import { Btn, Eyebrow, Page, Panel } from "@/components/chrome";
import { useLaunch } from "@/lib/use-launch";
import { BRAND, TOKEN_CA, ethShort, isLaunched, ponsToken, short } from "@/lib/site";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { state, notches, stale } = useLaunch();
  const launched = isLaunched();
  const progress = state?.progress ?? 0;
  const landed = (state?.phase ?? 0) >= 2;
  const needsFinish = Boolean(state?.ready && (state?.phase ?? 0) < 2);

  return (
    <Page>
      <World
        progress={progress}
        fired={landed}
        waiting={!launched}
        curveLine={
          launched && state
            ? `${ethShort(state.raised, 6)} / ${ethShort(state.threshold, 2)} ETH on the curve`
            : null
        }
      />

      <section className="relative z-20 mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 sm:grid-cols-12 sm:px-8">
        <Panel className="sm:col-span-7">
          <RopeMeter value={progress} />
          {launched && state ? (
            <>
              <p className="mt-3 font-sans text-sm text-mute">
                {formatEther(state.raised)} / {formatEther(state.threshold)} ETH on the curve
                {stale ? " · last good read" : ""}
              </p>
              <p className="mt-1 font-sans text-sm text-ink/70">
                Trade cost {(Number(state.feeBps + state.creatorTaxBps) / 100).toFixed(2)}% · first
                5 seconds carry a protocol anti-snipe tax.
              </p>
            </>
          ) : (
            <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-mute">
              Token not live. No CA to copy. When the curve opens, every buy pulls this arm back.
              Graduation is the cat leaving the basket for the fish.
            </p>
          )}
        </Panel>
        <div className="flex flex-col justify-end gap-3 sm:col-span-5">
          {launched ? (
            <>
              <Btn href={ponsToken(TOKEN_CA)} className="w-full">
                {landed ? "Trade the pool" : "Wind the arm — buy on pons"}
              </Btn>
              {needsFinish && (
                <Link
                  to="/landing"
                  className="grid min-h-12 place-items-center rounded-sm bg-paper px-6 font-display text-label uppercase tracking-wide-label pixel-border"
                >
                  Finish the launch
                </Link>
              )}
              <p className="font-display text-label text-mute">CA {short(TOKEN_CA)}</p>
            </>
          ) : (
            <Panel>
              <Eyebrow>CA pending</Eyebrow>
              <p className="mt-2 font-sans text-sm text-mute">The arm is slack. The fish is safe.</p>
            </Panel>
          )}
        </div>
      </section>

      <section className="relative z-20 mx-auto w-full max-w-6xl px-4 pb-6 sm:px-8">
        <NotchWall notches={notches} />
      </section>

      <section className="relative z-20 mx-auto w-full max-w-6xl px-4 pb-4 sm:px-8">
        <Rails />
        <p className="mt-3 font-sans text-sm text-mute">{BRAND.disclaimer}</p>
      </section>
    </Page>
  );
}
