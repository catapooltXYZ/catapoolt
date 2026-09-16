import { createWalletClient, custom, type Address } from "viem";
import { basinAbi, factoryWriteAbi, robinhood } from "./pons";
import { BASIN_CA, CHAIN_ID, PONS, TOKEN_CA, URLS, asAddr, explorerAddress } from "./site";

type Eth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getEth(): Eth | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: Eth }).ethereum;
  return eth ?? null;
}

async function ensureChain(eth: Eth): Promise<void> {
  const hex = `0x${CHAIN_ID.toString(16)}`;
  const current = String(await eth.request({ method: "eth_chainId" }));
  if (current.toLowerCase() === hex.toLowerCase()) return;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hex }],
    });
  } catch {
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hex,
          chainName: "Robinhood Chain",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: [URLS.rpc],
          blockExplorerUrls: [URLS.explorer],
        },
      ],
    });
  }
}

async function connect(): Promise<{ account: Address; eth: Eth }> {
  const eth = getEth();
  if (!eth) throw new Error("NO_WALLET");
  await ensureChain(eth);
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  const account = accounts[0] as Address | undefined;
  if (!account) throw new Error("NO_ACCOUNT");
  return { account, eth };
}

export function hasWallet(): boolean {
  return Boolean(getEth());
}

export async function harvestBasin(): Promise<`0x${string}`> {
  const basin = asAddr(BASIN_CA);
  if (!basin) throw new Error("NO_BASIN");
  const { account, eth } = await connect();
  const wallet = createWalletClient({
    account,
    chain: robinhood,
    transport: custom(eth),
  });
  return wallet.writeContract({
    address: basin,
    abi: basinAbi,
    functionName: "harvest",
    account,
    chain: robinhood,
  });
}

export async function finishLaunch(): Promise<`0x${string}`> {
  const token = asAddr(TOKEN_CA);
  if (!token) throw new Error("NO_TOKEN");
  const { account, eth } = await connect();
  const wallet = createWalletClient({
    account,
    chain: robinhood,
    transport: custom(eth),
  });
  return wallet.writeContract({
    address: PONS.factory,
    abi: factoryWriteAbi,
    functionName: "createGraduatedPool",
    args: [token],
    account,
    chain: robinhood,
  });
}

export function basinWriteUrl(): string {
  const basin = asAddr(BASIN_CA);
  if (!basin) return URLS.explorer;
  return `${explorerAddress(basin)}#writeContract`;
}
