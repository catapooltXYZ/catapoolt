import { createFileRoute } from "@tanstack/react-router";
import { BRAND, PONS } from "../lib/site";

export const Route = createFileRoute("/how")({ component: How });

function How() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-12 space-y-10">
      <header>
        <h1 className="text-4xl font-black">How it works</h1>
        <p className="mt-2 opacity-70">{BRAND.line}</p>
      </header>

      <Block n="01" title="The curve is the catapult">
        Catapoolt launches on pons v2. The whole supply sits on a bonding curve, and
        every buy pulls the arm further back. The percentage on the front page is the
        curve's own progress toward its graduation threshold, read straight off the
        contract. Nothing about it is decorative.
      </Block>

      <Block n="02" title="The landing">
        When the curve sells out it closes and hands everything it collected to a
        Uniswap v4 pool whose liquidity is locked permanently. That is the cat landing
        in the pool. Nobody can pull that liquidity out afterwards — not us, not pons.
        If the automatic step runs out of gas, anyone can finish it. It does not need us.
      </Block>

      <Block n="03" title="What you pay">
        Two numbers, both fixed at launch and both shown live on the front page: the
        protocol trade fee and our creator tax. Fees are charged in ETH, never in
        the token. Selling back to the curve is always open until the curve sells out.
      </Block>

      <Block n="04" title="The first five seconds">
        pons taxes buys for the first five seconds of every launch, starting near 99%
        and decaying to zero. It exists to make sniping the opening unprofitable. It
        applies to buys only and it is gone almost immediately. Do not race it.
      </Block>

      <Block n="05" title="The cat eats and grows">
        Part of our own fee buys the token back off the market. Those tokens are not
        burned and not handed to us: pons locks them and releases them linearly over
        five years. The size of the cat on this site is that locked amount, read from
        the buyback vault. It is the only number we grow.
      </Block>

      <Block n="06" title="What we are not doing">
        No airdrop. No staking. No merkle claim. No keeper bot. No score written to
        chain, no signature to farm. Game scores are cosmetic. Every number on this
        site comes from a contract read, and when the read fails we show the last
        good one rather than a demo.
      </Block>

      <section className="font-mono text-xs opacity-60 space-y-1 border-t border-ink/15 pt-6">
        <p>pons v2 factory {PONS.factory}</p>
        <p>{BRAND.credit}</p>
        <p>{BRAND.disclaimer}</p>
      </section>
    </main>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex gap-4">
      <span className="font-mono text-sm opacity-40 pt-1">{n}</span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 leading-relaxed opacity-80">{children}</p>
      </div>
    </section>
  );
}
