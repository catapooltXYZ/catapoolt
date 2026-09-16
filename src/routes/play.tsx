import { createFileRoute } from "@tanstack/react-router";
import { Eyebrow, Page } from "@/components/chrome";
import { useLaunch } from "@/lib/use-launch";
import { isLaunched } from "@/lib/site";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  const { state } = useLaunch();
  const open = isLaunched() && (state?.phase ?? 0) >= 2;

  return (
    <Page>
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Eyebrow>Game engine</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
          Jump. Eat. Grow.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-paper/75">
          The engine is black. The site frames it. Scores stay on this device. Money does not
          enter the canvas.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border-2 border-paper/15 bg-night ring-8 ring-raised">
          <div className="bg-rope px-4 py-2 text-center font-display text-sm tracking-widest text-night">
            CATAPOOLT
          </div>
          {open ? (
            <iframe
              title="Catapoolt"
              src="/game/index.html"
              className="aspect-[4/3] w-full bg-night"
            />
          ) : (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-night">
              <img
                src="/cat/body.png"
                alt="The blob cat, mid-leap"
                className="absolute inset-0 h-full w-full object-contain p-4 sm:p-8"
              />
              <p className="absolute inset-x-0 bottom-0 bg-night/80 p-6 text-center font-display text-2xl text-paper sm:p-10 sm:text-4xl">
                Opens when the cat lands.
              </p>
            </div>
          )}
        </div>
        <p className="mt-3 font-mono text-label text-mute">
          Game engine based on “Catapoolt” by glebv (js13k 2025, MIT). Chain layer original.
        </p>
      </section>
    </Page>
  );
}
