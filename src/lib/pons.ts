import { createPublicClient, http, parseAbi, parseAbiItem, defineChain } from "viem";
import { CHAIN, PONS, INDEXER, TOKEN_CA, CURVE_CA, LAUNCH_BLOCK } from "./site";

export const robinhood = defineChain({
  id: CHAIN.id,
  name: CHAIN.name,
  nativeCurrency: CHAIN.nativeCurrency,
  rpcUrls: { default: { http: [CHAIN.rpc] } },
  blockExplorers: { default: { name: "Blockscout", url: CHAIN.explorer } },
});

// This chain rejects JSON-RPC batch requests. Keep every call sequential.
export const client = createPublicClient({
  chain: robinhood,
  transport: http(CHAIN.rpc, { batch: false, retryCount: INDEXER.retries }),
  batch: { multicall: false },
});

export const factoryAbi = parseAbi([
  "struct LaunchedToken { address token; address curve; address deployer; address creatorFeeRecipient; address pairToken; uint256 graduationThreshold; uint24 poolFee; int24 tickSpacing; uint16 creatorTaxBps; bool buybackEnabled; uint8 phase; uint256 sweptQuote; uint256 sweptTokens; uint256 sweptAt; bool exists; }",
  "function getLaunchedToken(address token) view returns (LaunchedToken)",
  "function canLaunch(address who) view returns (bool)",
  "function maxCreatorTaxBps() view returns (uint16)",
  "function createGraduatedPool(address token)",
]);

export const curveAbi = parseAbi([
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function realQuoteReserve() view returns (uint256)",
  "function graduationThreshold() view returns (uint256)",
  "function sellableTokens() view returns (uint256)",
  "function readyToGraduate() view returns (bool)",
  "function graduated() view returns (bool)",
  "function feeBps() view returns (uint256)",
  "function creatorTaxBps() view returns (uint256)",
  "function currentSnipeTaxBps(address recipient) view returns (uint256)",
]);

export const buybackAbi = parseAbi([
  "function totalLocked(address token) view returns (uint256)",
  "function vestedAmount(address token) view returns (uint256)",
  "function releasable(address token) view returns (uint256)",
]);

export const curveBuy = parseAbiItem(
  "event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)",
);
export const curveSell = parseAbiItem(
  "event CurveSell(address indexed seller, address indexed recipient, uint256 tokensIn, uint256 quoteOut, uint256 fee, uint256 tax)",
);

export type Phase = 0 | 1 | 2 | 3; // NotGraduated | Swept | PoolCreated | Rescued

export type LaunchState = {
  phase: Phase;
  raised: bigint;
  threshold: bigint;
  progress: number;       // 0..1, drives the catapult arm
  sellable: bigint;
  readyToGraduate: boolean;
  feeBps: bigint;
  creatorTaxBps: bigint;
  hoard: bigint;          // buyback supply locked = how big the cat is
};

const read = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);

/// Sequential on purpose: no batch, no multicall on this RPC.
export async function readLaunchState(): Promise<LaunchState | null> {
  if (!TOKEN_CA || !CURVE_CA) return null;

  const launch = await client.readContract({
    address: PONS.factory, abi: factoryAbi,
    functionName: "getLaunchedToken", args: [TOKEN_CA],
  });

  const curve = { address: CURVE_CA, abi: curveAbi } as const;
  const raised = await read(client.readContract({ ...curve, functionName: "realQuoteReserve" }), 0n);
  const threshold = await read(client.readContract({ ...curve, functionName: "graduationThreshold" }), 1n);
  const sellable = await read(client.readContract({ ...curve, functionName: "sellableTokens" }), 0n);
  const ready = await read(client.readContract({ ...curve, functionName: "readyToGraduate" }), false);
  const feeBps = await read(client.readContract({ ...curve, functionName: "feeBps" }), 0n);
  const taxBps = await read(client.readContract({ ...curve, functionName: "creatorTaxBps" }), 0n);
  const hoard = await read(client.readContract({
    address: PONS.buybackVault, abi: buybackAbi,
    functionName: "totalLocked", args: [TOKEN_CA],
  }), 0n);

  const progress = threshold > 0n
    ? Math.min(1, Number((raised * 10_000n) / threshold) / 10_000)
    : 0;

  return {
    phase: Number(launch.phase) as Phase,
    raised, threshold, progress, sellable,
    readyToGraduate: ready, feeBps, creatorTaxBps: taxBps, hoard,
  };
}

export type Notch = {
  kind: "buy" | "sell";
  wallet: `0x${string}`;   // recipient, not the router
  quote: bigint;
  tokens: bigint;
  block: bigint;
  tx: `0x${string}`;
  index: number;           // 1-based notch number; 1..50 = Founding Fifty
};

/// Chunked, sequential, retrying log scan. No keeper, no server, no database.
/// Pass the last scanned block back in to continue where the poll left off.
export async function scanNotches(fromBlock: bigint, seen = 0) {
  if (!CURVE_CA) return { notches: [] as Notch[], scannedTo: fromBlock };

  const head = await client.getBlockNumber();
  const out: Notch[] = [];
  let cursor = fromBlock > 0n ? fromBlock : LAUNCH_BLOCK;
  let index = seen;

  while (cursor <= head) {
    const to = cursor + INDEXER.chunk - 1n > head ? head : cursor + INDEXER.chunk - 1n;
    const logs = await withRetry(() =>
      client.getLogs({ address: CURVE_CA, events: [curveBuy, curveSell], fromBlock: cursor, toBlock: to }),
    );
    for (const log of logs) {
      const buy = log.eventName === "CurveBuy";
      const a = log.args as Record<string, bigint | `0x${string}`>;
      out.push({
        kind: buy ? "buy" : "sell",
        wallet: a.recipient as `0x${string}`,
        quote: (buy ? a.quoteIn : a.quoteOut) as bigint,
        tokens: (buy ? a.tokensOut : a.tokensIn) as bigint,
        block: log.blockNumber!,
        tx: log.transactionHash!,
        index: buy ? ++index : index,
      });
    }
    cursor = to + 1n;
  }
  return { notches: out, scannedTo: head };
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let wait = INDEXER.backoffMs;
  for (let i = 0; i < INDEXER.retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === INDEXER.retries - 1) throw e;
      await new Promise((r) => setTimeout(r, wait));
      wait *= 2; // 429 is normal on this RPC
    }
  }
  throw new Error("unreachable");
}

/// Permissionless rescue: if auto-graduation ran out of gas, anyone can finish it.
/// This is the button that replaces the keeper we are never writing again.
export function finishLaunchCall() {
  return {
    address: PONS.factory,
    abi: factoryAbi,
    functionName: "createGraduatedPool" as const,
    args: [TOKEN_CA] as const,
  };
}
