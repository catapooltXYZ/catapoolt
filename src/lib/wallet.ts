import { CHAIN } from "./site";

// Minimal wallet layer. EIP-6963 first, injected fallback.
// No wagmi, no walletconnect: one chain, one button, sequential calls only.

type Eip1193 = {
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (e: string, cb: (...a: unknown[]) => void) => void;
};

let provider: Eip1193 | null = null;

export function discoverProviders(): Promise<Eip1193[]> {
  return new Promise((resolve) => {
    const found: Eip1193[] = [];
    const onAnnounce = (e: Event) => {
      const detail = (e as CustomEvent).detail as { provider: Eip1193 };
      if (detail?.provider && !found.includes(detail.provider)) found.push(detail.provider);
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      const injected = (window as unknown as { ethereum?: Eip1193 }).ethereum;
      if (found.length === 0 && injected) found.push(injected);
      resolve(found);
    }, 150);
  });
}

export async function connect(): Promise<`0x${string}`> {
  const [first] = await discoverProviders();
  if (!first) throw new Error("No wallet found. Install MetaMask or OKX.");
  provider = first;

  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  await ensureChain();
  return accounts[0] as `0x${string}`;
}

/// Adds Robinhood Chain if missing. Skips the switch when already on 4663 —
/// some wallets throw on a redundant wallet_switchEthereumChain.
async function ensureChain() {
  if (!provider) throw new Error("not connected");
  const current = (await provider.request({ method: "eth_chainId" })) as string;
  if (current?.toLowerCase() === CHAIN.hex) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN.hex }],
    });
  } catch {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: CHAIN.hex,
        chainName: CHAIN.name,
        rpcUrls: [CHAIN.rpc],
        nativeCurrency: CHAIN.nativeCurrency,
        blockExplorerUrls: [CHAIN.explorer],
      }],
    });
  }
}

/// One transaction at a time. This RPC rejects batched JSON-RPC.
export async function sendTx(to: `0x${string}`, data: `0x${string}`, value = "0x0") {
  if (!provider) await connect();
  const from = ((await provider!.request({ method: "eth_accounts" })) as string[])[0];
  if (!from) throw new Error("no account");
  await ensureChain();
  return (await provider!.request({
    method: "eth_sendTransaction",
    params: [{ from, to, data, value }],
  })) as `0x${string}`;
}

export async function currentAccount(): Promise<`0x${string}` | null> {
  const [first] = await discoverProviders();
  if (!first) return null;
  provider = first;
  const accounts = (await first.request({ method: "eth_accounts" })) as string[];
  return (accounts[0] as `0x${string}`) ?? null;
}
