import { createFileRoute, Link } from "@tanstack/react-router";
import { formatEther } from "viem";
import { Catapult, NotchWall, RopeMeter } from "@/components/catapult";
import { Btn, Eyebrow, Page } from "@/components/chrome";
import { useLaunch } from "@/lib/use-launch";
import { BRAND, TOKEN_CA, isLaunched, ponsToken, short } from "@/lib/site";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { state, notches, stale } = useLaunch();
  const launched = isLaunched();
  const progress = state?.progress ?? 0;
  const landed = (state?.phase ?? 0) >= 2;
  const needsFinish = Boolean(state?.ready && (state?.phase ?? 0) < 2);

  return (
    <Page>
      <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow>
            ${BRAND.ticker} · Robinhood Chain
          </Eyebrow>
          {!launched && (
            <span className="rounded-full bg-paper px-3 py-1 font-mono text-label uppercase tracking-wide-label text-night">
              T-24
            </span>
          )}
        </div>
        <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
          {launched
            ? landed
              ? "The cat landed."
              : "Watch the arm."
            : "The arm goes up tomorrow."}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-paper/80 sm:text-xl">{BRAND.line}</p>
        <p className="mt-1 max-w-xl text-mute">{BRAND.sub}</p>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl px-5 sm:mt-8 sm:px-8">
        <Catapult
          progress={progress}
          notches={notches}
          fired={landed}
          waiting={!launched}
        />
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-6xl gap-8 px-5 sm:grid-cols-12 sm:px-8">
        <div className="sm:col-span-7">
          <RopeMeter value={progress} />
          {launched && state ? (
            <>
              <p className="mt-3 font-mono text-sm text-mute">
                {formatEther(state.raised)} / {formatEther(state.threshold)} ETH on the curve
                {stale ? " · last good read" : ""}
              </p>
              <p className="mt-1 font-mono text-sm text-paper/70">
                Trade cost {(Number(state.feeBps + state.creatorTaxBps) / 100).toFixed(2)}% ·
                first 5 seconds carry a protocol anti-snipe tax.
              </p>
            </>
          ) : (
            <p className="mt-3 max-w-md font-mono text-sm leading-relaxed text-mute">
              Token not live. No CA to copy. When the curve opens, every buy pulls this arm
              back. Graduation is the cat leaving the basket.
            </p>
          )}
        </div>
        <div className="flex flex-col justify-end gap-3 sm:col-span-5">
          {launched ? (
            <>
              <Btn href={ponsToken(TOKEN_CA)} className="w-full">
                {landed ? "Trade the pool" : "Wind the arm — buy on pons"}
              </Btn>
              {needsFinish && (
                <Link
                  to="/landing"
                  className="grid min-h-12 place-items-center rounded-lg border border-paper/20 px-6 font-mono text-label uppercase tracking-wide-label text-paper transition-colors hover:border-rope hover:text-rope"
                >
                  Finish the launch
                </Link>
              )}
              <p className="font-mono text-label text-mute">CA {short(TOKEN_CA)}</p>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-paper/20 px-5 py-4 font-mono text-sm text-mute">
              CA pending · the arm is slack
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-14 w-full max-w-6xl px-5 sm:px-8">
        <NotchWall notches={notches} />
      </section>
    </Page>
  );
}
