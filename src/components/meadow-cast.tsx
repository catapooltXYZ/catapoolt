import { useEffect, useRef, useState, type ReactNode } from "react";

function Pixel({
  a,
  b,
  alt,
}: {
  a: string;
  b?: string;
  alt: string;
}) {
  return (
    <span className="relative inline-block h-full">
      <img src={a} alt={alt} className="vox block h-full w-auto" />
      {b ? (
        <img src={b} alt="" className="vox animate-frame absolute inset-0 block h-full w-auto" />
      ) : null}
    </span>
  );
}

function usePrefersReduce() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

function Hop({ active, children }: { active: boolean; children: ReactNode }) {
  return <span className={active ? "leap block h-full" : "block h-full"}>{children}</span>;
}

const GRASS_END = 0.62;

export function MeadowCast({
  progress: _progress,
  waiting: _waiting,
}: {
  progress: number;
  waiting: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const reduce = usePrefersReduce();
  const [hop, setHop] = useState<string | null>(null);
  const poke = (id: string) => {
    setHop(id);
    window.setTimeout(() => setHop((cur) => (cur === id ? null : cur)), 720);
  };

  useEffect(() => {
    const el = catRef.current;
    const host = stageRef.current;
    if (!el || !host || reduce) return;
    let x = host.clientWidth * 0.18;
    let dir = 1;
    let raf = 0;
    const step = () => {
      const w = el.offsetWidth || 96;
      const max = Math.max(24, host.clientWidth * GRASS_END - w);
      x += dir * 0.7;
      if (x >= max) {
        x = max;
        dir = -1;
      }
      if (x <= 10) {
        x = 10;
        dir = 1;
      }
      el.style.transform = `translateX(${x}px) scaleX(${dir})`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  useEffect(() => {
    const host = stageRef.current;
    if (!host || reduce) return;
    const mice: { el: HTMLButtonElement; anim: Animation }[] = [];
    let alive = true;

    const spawn = () => {
      if (!alive || mice.length >= 3) return;
      const W = host.clientWidth;
      const grass = W * GRASS_END;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const from = dir === 1 ? -70 : grass;
      const to = dir === 1 ? grass : -70;
      const lane = Math.floor(Math.random() * 3) * 6;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "meadow-mouse";
      btn.style.bottom = `calc(var(--ground-h) + ${lane}px)`;
      btn.setAttribute("aria-label", "Tap a mouse");
      btn.innerHTML =
        '<span class="block h-full"><span class="relative inline-block h-full">' +
        '<img src="/sprites/mouse-a.png" alt="" class="vox block h-full w-auto" />' +
        '<img src="/sprites/mouse-b.png" alt="" class="vox animate-frame absolute inset-0 block h-full w-auto" />' +
        "</span></span>";
      host.appendChild(btn);
      const dur = (Math.abs(to - from) / (0.05 + Math.random() * 0.025)) * 16;
      const anim = btn.animate(
        [
          { transform: `translateX(${from}px) scaleX(${dir})` },
          { transform: `translateX(${to}px) scaleX(${dir})` },
        ],
        { duration: dur, easing: "linear" },
      );
      const rec = { el: btn, anim };
      mice.push(rec);
      anim.onfinish = () => {
        btn.remove();
        const i = mice.indexOf(rec);
        if (i >= 0) mice.splice(i, 1);
      };
      btn.addEventListener("click", () => {
        const inner = btn.querySelector("span");
        inner?.classList.add("leap");
        window.setTimeout(() => inner?.classList.remove("leap"), 720);
      });
    };

    const t1 = window.setTimeout(spawn, 400);
    const t2 = window.setTimeout(spawn, 1600);
    const id = window.setInterval(spawn, 3200);
    return () => {
      alive = false;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearInterval(id);
      mice.forEach((m) => {
        m.anim.cancel();
        m.el.remove();
      });
    };
  }, [reduce]);

  return (
    <div ref={stageRef} className="pointer-events-none absolute inset-0 z-20">
      <button
        ref={catRef}
        type="button"
        className="hero-cat pointer-events-auto"
        onClick={() => poke("cat")}
        aria-label="Tap the cat"
      >
        <Hop active={hop === "cat"}>
          <Pixel a="/sprites/cat-a.png" b="/sprites/cat-b.png" alt="The Catapoolt cat" />
        </Hop>
      </button>

      <Pond onPoke={() => poke("fish")} hopping={hop === "fish"} />
    </div>
  );
}

function Pond({ onPoke, hopping }: { onPoke: () => void; hopping: boolean }) {
  const reduce = usePrefersReduce();
  const aRef = useRef<HTMLButtonElement>(null);
  const bRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (reduce) return;
    const timers: number[] = [];
    const run = (el: HTMLButtonElement | null, speed: number, start: number, leapEvery: number) => {
      if (!el) return () => {};
      const pond = el.parentElement;
      if (!pond) return () => {};
      let x = start;
      let dir = 1;
      let raf = 0;
      const step = () => {
        const max = Math.max(8, pond.clientWidth - el.offsetWidth - 8);
        x += dir * speed;
        if (x >= max) {
          x = max;
          dir = -1;
        }
        if (x <= 4) {
          x = 4;
          dir = 1;
        }
        el.style.transform = `translateX(${x}px) scaleX(${dir})`;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      const inner = () => el.querySelector("span");
      const leap = () => {
        inner()?.classList.add("leap");
        window.setTimeout(() => inner()?.classList.remove("leap"), 720);
      };
      timers.push(window.setTimeout(leap, 900));
      timers.push(window.setInterval(leap, leapEvery));
      return () => cancelAnimationFrame(raf);
    };
    const stopA = run(aRef.current, 0.42, 18, 3200);
    const stopB = run(bRef.current, 0.3, 110, 4100);
    return () => {
      stopA();
      stopB();
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
    };
  }, [reduce]);

  return (
    <div className="meadow-pond pointer-events-auto">
      <button ref={aRef} type="button" className="pond-fish f-a" onClick={onPoke} aria-label="Tap the koi">
        <Hop active={hopping}>
          <Pixel a="/sprites/fish-a.png" b="/sprites/fish-b.png" alt="" />
        </Hop>
      </button>
      <button ref={bRef} type="button" className="pond-fish f-b" onClick={onPoke} aria-label="Tap the koi">
        <Hop active={hopping}>
          <Pixel a="/sprites/fish-a.png" b="/sprites/fish-b.png" alt="" />
        </Hop>
      </button>
    </div>
  );
}
