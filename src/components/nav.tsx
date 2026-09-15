import { Link } from "@tanstack/react-router";
import { BRAND } from "../lib/site";

const items = [
  { to: "/", label: "Wind-up" },
  { to: "/play", label: "Play" },
  { to: "/how", label: "How" },
  { to: "/basin", label: "Basin" },
] as const;

export function Nav() {
  return (
    <header className="border-b border-ink/15 bg-paper">
      <nav className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link to="/" className="font-black tracking-tight text-lg">
          CATAPOOLT
        </Link>
        <div className="flex items-center gap-4 font-mono text-xs">
          {items.slice(1).map((i) => (
            <Link key={i.to} to={i.to} className="hover:opacity-60 [&.active]:underline">
              {i.label}
            </Link>
          ))}
          <a href={BRAND.x} target="_blank" rel="noreferrer" className="hover:opacity-60">
            @catapooltXYZ
          </a>
        </div>
      </nav>
    </header>
  );
}
