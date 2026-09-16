export const BRAND = {
  name: "Catapoolt",
  ticker: "POOLT",
  line: "The curve is the catapult.",
  sub: "Every buy winds it. The pool is where the cat lands.",
  credit: 'Game engine based on "Catapoolt" by glebv (js13k 2025, MIT). Unofficial.',
  disclaimer: "pons v2 is unaudited. This is not an audit, a promise, or a payout.",
} as const;

export const URLS = {
  site: "https://www.catapoolt.xyz",
  x: "https://x.com/catapooltXYZ",
  github: "https://github.com/catapooltXYZ/catapoolt",
  ponsDocs: "https://docs.ponsfamily.com/v2",
  explorer: "https://robinhoodchain.blockscout.com",
  rpc: "https://rpc.mainnet.chain.robinhood.com",
} as const;

export const CHAIN_ID = 4663;

export const PONS = {
  factory: "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e",
  memeHook: "0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044",
  feeEscrow: "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
  buybackVault: "0x42df2a798f82289E177311362e8f5ccC45c1219c",
  launchLocker: "0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952",
} as const;

/** Filled after launch. Empty string = phase 0, CA pending. Never show a fake CA. */
export const TOKEN_CA = "" as `0x${string}` | "";
export const CURVE_CA = "" as `0x${string}` | "";
export const BASIN_CA = "" as `0x${string}` | "";
export const LAUNCH_BLOCK = 0n;

export const INDEXER = {
  pollMs: 15_000,
  chunk: 2000n,
} as const;

export const ZERO = "0x0000000000000000000000000000000000000000" as const;

export function isAddr(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value) && value !== ZERO;
}

export function asAddr(value: string): `0x${string}` | null {
  return isAddr(value) ? value : null;
}

export function isLaunched(): boolean {
  return isAddr(TOKEN_CA) && isAddr(CURVE_CA);
}

export function short(addr: string): string {
  if (!isAddr(addr)) return "pending";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function ponsToken(token: string): string {
  return `https://www.pons.family/token/${token}`;
}

export function explorerAddress(addr: string): string {
  return `${URLS.explorer}/address/${addr}`;
}

export function explorerTx(hash: string): string {
  return `${URLS.explorer}/tx/${hash}`;
}

/** 12 coats. Hash the recipient, never the router. */
export const COATS = [
  "#121212",
  "#2b2118",
  "#5c4030",
  "#c47a3a",
  "#e2c48a",
  "#efe6d2",
  "#7a756c",
  "#ff6a2b",
  "#9a3b1a",
  "#b8b3a8",
  "#1c2430",
  "#3f5c4a",
] as const;

export function coatOf(wallet: string): string {
  const hex = wallet.toLowerCase().replace("0x", "");
  let n = 0;
  for (let i = 0; i < hex.length; i++) n = (n * 16 + parseInt(hex[i] ?? "0", 16)) % COATS.length;
  return COATS[n] ?? COATS[0];
}
