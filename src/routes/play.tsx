import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/chrome";
import { Field } from "@/components/world";
import { useLaunch } from "@/lib/use-launch";
import { isLaunched } from "@/lib/site";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  const { state } = useLaunch();
  const launched = isLaunched();
  const landed = (state?.phase ?? 0) >= 2;
  const open = launched && landed;

  return (
    <Page>
      <Field
        kicker="Game engine"
        title="Jump. Eat. Grow."
        progress={state?.progress ?? 0}
        fired={landed}
        waiting={!launched}
        focus="play"
      >
        <p className="max-w-xl font-sans text-base text-ink/80 sm:text-lg">
          The engine is black. The grass frames it. Scores stay on this device. Money does not
          enter the canvas.
        </p>

        <div className="mt-8 overflow-hidden rounded-sm bg-ink pixel-border">
          <div className="bg-rope px-4 py-2 text-center font-display text-label tracking-widest text-paper">
            CATAPOOLT
          </div>
          {open ? (
            <iframe title="Catapoolt" src="/game/index.html" className="aspect-[4/3] w-full bg-ink" />
          ) : (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-sky">
              <div className="mc-grass absolute inset-x-0 bottom-0 h-8" />
              <div className="dirt-bar absolute inset-x-0 bottom-0 h-6" />
              <img
                src="/sprites/cat-a.png"
                alt=""
                className="spr animate-bob absolute bottom-[12%] left-[10%] w-[28%] max-w-32"
              />
              <p className="absolute inset-x-0 bottom-0 bg-ink/80 p-5 text-center font-display text-sm leading-relaxed text-paper sm:p-8 sm:text-lg">
                Opens when the cat lands.
              </p>
            </div>
          )}
        </div>
        <p className="mt-3 font-sans text-sm text-mute">
          Game engine based on “Catapoolt” by glebv (js13k 2025, MIT). Chain layer original.
        </p>
      </Field>
    </Page>
  );
}
