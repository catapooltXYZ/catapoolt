import {
  createPublicClient,
  defineChain,
  http,
  parseAbi,
  parseAbiItem,
  type Address,
  type Log,
} from "viem";
import {
  BASIN_CA,
  CHAIN_ID,
  CURVE_CA,
  INDEXER,
  LAUNCH_BLOCK,
  PONS,
  TOKEN_CA,
  URLS,
  asAddr,
  isAddr,
  isLaunched,
} from "./site";

export const robinhood = defineChain({
  id: CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [URLS.rpc] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: URLS.explorer },
  },
});

export const client = createPublicClient({
  chain: robinhood,
  transport: http(URLS.rpc, { batch: false, retryCount: 2, timeout: 20_000 }),
});

const factoryAbi = parseAbi([
  "function getLaunchedToken(address token) view returns ((address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, bool buybackEnabled, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, uint256 sweptAt, bool exists))",
  "function createGraduatedPool(address token) returns (uint256 positionId)",
  "function transferCreatorFeeRecipient(address token, address newRecipient)",
]);

const curveAbi = parseAbi([
  "function realQuoteReserve() view returns (uint256)",
  "function graduationThreshold() view returns (uint256)",
  "function readyToGraduate() view returns (bool)",
  "function graduated() view returns (bool)",
  "function feeBps() view returns (uint256)",
  "function creatorTaxBps() view returns (uint256)",
  "function sellableTokens() view returns (uint256)",
  "function currentSnipeTaxBps(address recipient) view returns (uint256)",
]);

export const basinAbi = parseAbi([
  "function harvest()",
  "function harvestToken(address asset)",
  "function pendingEscrow() view returns (uint256)",
  "function hoard() view returns (uint256 locked, uint256 releasable)",
  "function totalReceived() view returns (uint256)",
  "function token() view returns (address)",
  "function curve() view returns (address)",
  "function ops() view returns (address)",
]);

const vaultAbi = parseAbi([
  "function totalLocked(address token) view returns (uint256)",
  "function releasable(address token) view returns (uint256)",
]);

const escrowAbi = parseAbi([
  "function balanceOf(address recipient) view returns (uint256)",
]);

const buyEvent = parseAbiItem(
  "event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)",
);
const sellEvent = parseAbiItem(
  "event CurveSell(address indexed seller, address indexed recipient, uint256 tokensIn, uint256 quoteOut, uint256 fee, uint256 tax)",
);

export type LaunchState = {
  phase: number;
  raised: bigint;
  threshold: bigint;
  progress: number;
  ready: boolean;
  graduated: boolean;
  feeBps: bigint;
  creatorTaxBps: bigint;
  sellable: bigint;
  buybackEnabled: boolean;
  creatorFeeRecipient: Address;
};

export type Notch = {
  kind: "buy" | "sell";
  wallet: Address;
  tx: `0x${string}`;
  logIndex: number;
  block: bigint;
  index: number;
  quote: bigint;
};

export type BasinState = {
  eth: bigint;
  pending: bigint;
  locked: bigint;
  releasable: bigint;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRateLimit(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  return s.includes("429") || s.toLowerCase().includes("rate") || s.includes("-32005");
}

async function read<T>(fn: () => Promise<T>): Promise<T> {
  let wait = 400;
  for (let i = 0; i < 5; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimit(err) || i === 4) throw err;
      await sleep(wait);
      wait *= 2;
    }
  }
  throw new Error("rpc");
}

export async function readLaunchState(): Promise<LaunchState | null> {
  const token = asAddr(TOKEN_CA);
  const curve = asAddr(CURVE_CA);
  if (!token || !curve) return null;

  const launch = await read(() =>
    client.readContract({
      address: PONS.factory,
      abi: factoryAbi,
      functionName: "getLaunchedToken",
      args: [token],
    }),
  );
  if (!launch.exists) return null;

  const raised = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "realQuoteReserve" }),
  );
  const threshold = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "graduationThreshold" }),
  );
  const ready = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "readyToGraduate" }),
  );
  const graduated = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "graduated" }),
  );
  const feeBps = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "feeBps" }),
  );
  const creatorTaxBps = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "creatorTaxBps" }),
  );
  const sellable = await read(() =>
    client.readContract({ address: curve, abi: curveAbi, functionName: "sellableTokens" }),
  );

  const progress =
    threshold === 0n ? 0 : Math.min(1, Number((raised * 10_000n) / threshold) / 10_000);

  return {
    phase: launch.phase,
    raised,
    threshold,
    progress,
    ready,
    graduated,
    feeBps,
    creatorTaxBps,
    sellable,
    buybackEnabled: launch.buybackEnabled,
    creatorFeeRecipient: launch.creatorFeeRecipient,
  };
}

export async function readBasin(): Promise<BasinState | null> {
  const basin = asAddr(BASIN_CA);
  if (!basin) return null;
  const eth = await read(() => client.getBalance({ address: basin }));
  const pending = await read(() =>
    client.readContract({ address: basin, abi: basinAbi, functionName: "pendingEscrow" }),
  );
  let locked = 0n;
  let releasable = 0n;
  const token = asAddr(TOKEN_CA);
  if (token) {
    try {
      const hoard = await read(() =>
        client.readContract({ address: basin, abi: basinAbi, functionName: "hoard" }),
      );
      locked = hoard[0];
      releasable = hoard[1];
    } catch {
      locked = await read(() =>
        client.readContract({
          address: PONS.buybackVault,
          abi: vaultAbi,
          functionName: "totalLocked",
          args: [token],
        }),
      );
    }
  }
  return { eth, pending, locked, releasable };
}

export async function readEscrowOf(addr: Address): Promise<bigint> {
  return read(() =>
    client.readContract({
      address: PONS.feeEscrow,
      abi: escrowAbi,
      functionName: "balanceOf",
      args: [addr],
    }),
  );
}

async function getLogsRetry(params: {
  address: Address;
  events: [typeof buyEvent, typeof sellEvent];
  fromBlock: bigint;
  toBlock: bigint;
}): Promise<Log[]> {
  let wait = 500;
  for (let i = 0; i < 6; i++) {
    try {
      return (await client.getLogs(params)) as unknown as Log[];
    } catch (err) {
      if (!isRateLimit(err) || i === 5) throw err;
      await sleep(wait);
      wait *= 2;
    }
  }
  return [];
}

export async function scanNotches(
  fromBlock: bigint,
  buyCount: number,
): Promise<{ notches: Notch[]; scannedTo: bigint }> {
  if (!isLaunched() || !isAddr(CURVE_CA) || fromBlock === 0n) {
    return { notches: [], scannedTo: fromBlock };
  }

  const latest = await read(() => client.getBlockNumber());
  if (fromBlock > latest) return { notches: [], scannedTo: latest };

  const notches: Notch[] = [];
  let cursor = fromBlock;
  let buys = buyCount;

  while (cursor <= latest) {
    const end = cursor + INDEXER.chunk - 1n > latest ? latest : cursor + INDEXER.chunk - 1n;
    const logs = await getLogsRetry({
      address: CURVE_CA,
      events: [buyEvent, sellEvent],
      fromBlock: cursor,
      toBlock: end,
    });

    for (const log of logs) {
      const eventName = (log as { eventName?: string }).eventName;
      const args = (log as { args?: { recipient?: Address; quoteIn?: bigint; quoteOut?: bigint } })
        .args;
      const wallet = args?.recipient;
      if (!wallet) continue;
      const kind: "buy" | "sell" = eventName === "CurveSell" ? "sell" : "buy";
      if (kind === "buy") buys += 1;
      notches.push({
        kind,
        wallet,
        tx: log.transactionHash ?? "0x",
        logIndex: Number(log.logIndex ?? 0),
        block: log.blockNumber ?? 0n,
        index: kind === "buy" ? buys : 0,
        quote: kind === "buy" ? (args?.quoteIn ?? 0n) : (args?.quoteOut ?? 0n),
      });
    }

    cursor = end + 1n;
  }

  return { notches, scannedTo: latest };
}

export const factoryWriteAbi = factoryAbi;
