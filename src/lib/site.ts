// Single source of truth. Every constant the site shows lives here.
// Empty string = not launched yet. The UI must render "pending", never a fake CA.

export const BRAND = {
  name: "Catapoolt",
  ticker: "POOLT",
  line: "The curve is the catapult.",
  sub: "Every buy winds it. The pool is where the cat lands.",
  site: "https://www.catapoolt.xyz",
  x: "https://x.com/catapooltXYZ",
  github: "https://github.com/catapooltXYZ/catapoolt",
  credit: "Game engine based on Catapoolt by glebv (js13k 2025, MIT).",
  disclaimer: "Unofficial. pons v2 is unaudited. Tokens can lose all value.",
} as const;

export const CHAIN = {
  id: 4663,
  hex: "0x1237",
  name: "Robinhood Chain",
  rpc: "https://rpc.mainnet.chain.robinhood.com",
  explorer: "https://robinhoodchain.blockscout.com",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
} as const;

// pons v2 singletons (docs.ponsfamily.com/v2)
export const PONS = {
  factory: "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e",
  hook: "0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044",
  escrow: "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
  buybackVault: "0x42df2a798f82289E177311362e8f5ccC45c1219c",
  locker: "0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952",
  launchAndBuy: "0xe33E9E479dF8802cb0866d5d05258bEc4cF62948",
  deployer: "0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42",
  app: "https://www.ponsfamily.com/launchpad",
} as const;

// --- fill these three the hour we launch, then push main ---
export const TOKEN_CA = "" as `0x${string}` | "";
export const CURVE_CA = "" as `0x${string}` | "";
export const BASIN_CA = "" as `0x${string}` | "";

// Block the launch tx landed in. Indexer starts here instead of genesis.
export const LAUNCH_BLOCK = 0n;

export const isLaunched = () => TOKEN_CA !== "" && CURVE_CA !== "";

export const explorerAddress = (a: string) => `${CHAIN.explorer}/address/${a}`;
export const explorerTx = (h: string) => `${CHAIN.explorer}/tx/${h}`;
export const ponsToken = (a: string) => `${PONS.app}/token/${a}`;

// Indexer limits. This RPC does NOT support JSON-RPC batch and rate limits hard.
export const INDEXER = {
  chunk: 2000n,      // blocks per getLogs call
  pollMs: 15_000,
  retries: 4,
  backoffMs: 800,
} as const;

// Cosmetic only. Buyer address hashes into one of these coats.
export const COATS = [
  "#FF6A2B", "#12B5C9", "#F2C14E", "#8E7CC3", "#5FA867", "#E2725B",
  "#3C7A89", "#C05780", "#A9A15B", "#6B7FD7", "#D98C5F", "#4F5D75",
] as const;

export const coatOf = (addr: string) => {
  let h = 0;
  const s = addr.toLowerCase();
  for (let i = 2; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return COATS[h % COATS.length];
};

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
