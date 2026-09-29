/**
 * The only module in this app that talks to GenLayer. Every RPC url, chain
 * id, and contract address comes from env vars (see .env.example) — nothing
 * here is hardcoded per environment. Reads use an account-less client;
 * writes require a connected browser wallet (window.ethereum) and are never
 * signed with a key that touches this codebase.
 */
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus, type CalldataEncodable, type Hash, type Network } from "genlayer-js/types";

const VALID_NETWORKS: Network[] = ["localnet", "studionet", "testnetAsimov", "testnetBradbury", "mainnet"];

function resolveNetworkName(): Network {
  const raw = process.env.NEXT_PUBLIC_NETWORK_NAME ?? "studionet";
  return (VALID_NETWORKS as string[]).includes(raw) ? (raw as Network) : "studionet";
}

export const NETWORK_NAME: Network = resolveNetworkName();
export const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC ?? "https://studio.genlayer.com/api";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "61999");
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://explorer-studio.genlayer.com";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export function isContractConfigured(): boolean {
  return Boolean(CONTRACT_ADDRESS);
}

/**
 * Extracts a human-readable message from whatever a wallet/RPC call rejects
 * with. EIP-1193 providers and viem often reject with a plain
 * {code, message} object rather than an Error instance, so a bare
 * `String(err)` collapses to "[object Object]" — this checks the common
 * shapes (Error, viem's shortMessage/message, EIP-1193 error objects) before
 * falling back to JSON.
 */
export function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    const candidate = obj.shortMessage ?? obj.message ?? obj.details ?? obj.reason;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }
  return String(err);
}

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}

// genlayer-js's `studionet` preset already carries the right chain id and RPC
// url. We only pass a custom `endpoint` (a separate createClient param, not a
// mutated chain shape) when the configured RPC genuinely differs from the
// preset's default — overriding the chain object's own `rpcUrls` breaks its
// internal transport and produces empty, unparsable RPC responses.
const usingDefaultRpc = RPC_URL === studionet.rpcUrls?.default?.http?.[0];
const endpointOverride = usingDefaultRpc ? undefined : RPC_URL;

type ReadClient = ReturnType<typeof createClient>;
let readClient: ReadClient | null = null;

/** Account-less client for view calls — no wallet needed to read the docket. */
export function getReadClient(): ReadClient {
  if (!readClient) {
    readClient = createClient({ chain: studionet, endpoint: endpointOverride });
  }
  return readClient;
}

export type WalletClient = ReturnType<typeof createClient>;

type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
  providers?: EIP1193Provider[];
};

/**
 * genlayer-js's client.connect() signs in via a MetaMask *Snap*
 * (npm:genlayer-wallet-plugin) — it calls the MetaMask-only `wallet_getSnaps`
 * method to check whether the snap is installed. If another wallet extension
 * (Coinbase Wallet, Rabby, Brave Wallet, etc.) has also injected itself and
 * taken over `window.ethereum`, that call fails with a confusing "no
 * handler" error. Multi-wallet-aware extensions expose every injected
 * provider under `window.ethereum.providers`, so pick the MetaMask one
 * specifically instead of trusting whichever provider is on top.
 */
function findMetaMaskProvider(): EIP1193Provider | undefined {
  const ethereum = (globalThis as { ethereum?: EIP1193Provider }).ethereum;
  if (!ethereum) return undefined;
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return ethereum.providers.find((p) => p.isMetaMask) ?? ethereum;
  }
  return ethereum;
}

/** Requests a browser wallet connection and returns a client that can sign writes. */
export async function connectWallet(): Promise<{ client: WalletClient; address: string }> {
  const ethereum = findMetaMaskProvider();
  if (!ethereum) {
    throw new Error("No browser wallet found. Install MetaMask to file or resolve cases.");
  }
  if (!ethereum.isMetaMask) {
    throw new Error(
      "GenLayer requires MetaMask specifically (it signs through a MetaMask Snap). " +
        "Disable other wallet extensions or select MetaMask as the active wallet, then try again.",
    );
  }
  const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts[0];
  if (!address) {
    throw new Error("Wallet did not return an account.");
  }
  const client = createClient({
    chain: studionet,
    endpoint: endpointOverride,
    account: address as `0x${string}`,
    provider: ethereum,
  });
  // Installs (or verifies) the GenLayer MetaMask Snap this client signs
  // through, and switches the wallet's active network to match NETWORK_NAME.
  try {
    await client.connect(NETWORK_NAME);
  } catch (err) {
    throw new Error(
      `Could not connect to the GenLayer MetaMask Snap: ${formatError(err)}. ` +
        "Make sure MetaMask is up to date and Snaps are enabled.",
    );
  }
  return { client, address };
}

function requireContract(): string {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not configured.");
  }
  return CONTRACT_ADDRESS;
}

const TERMINAL_FAILURE_STATUSES = new Set<TransactionStatus>([
  TransactionStatus.CANCELED,
  TransactionStatus.UNDETERMINED,
  TransactionStatus.VALIDATORS_TIMEOUT,
  TransactionStatus.LEADER_TIMEOUT,
]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Polls a transaction until Studionet reaches FINALIZED (not just ACCEPTED). */
async function pollUntilFinalized(client: ReadClient | WalletClient, hash: Hash) {
  const intervalMs = 3000;
  const maxAttempts = 200; // ~10 minutes
  let last: Awaited<ReturnType<ReadClient["getTransaction"]>> | undefined;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    last = await client.getTransaction({ hash });
    if (last.statusName === TransactionStatus.FINALIZED) return last;
    if (last.statusName && TERMINAL_FAILURE_STATUSES.has(last.statusName)) {
      throw new Error(`Transaction ended without finalizing (status: ${last.statusName}). See ${explorerTxUrl(hash)}`);
    }
    await sleep(intervalMs);
  }
  throw new Error(`Transaction is still ${last?.statusName ?? "pending"} after ~10 minutes. See ${explorerTxUrl(hash)}`);
}

/** Reads a view method's raw string return value. */
export async function readContract(functionName: string, args: CalldataEncodable[] = []): Promise<string> {
  const client = getReadClient();
  const result = await client.readContract({
    address: requireContract() as `0x${string}`,
    functionName,
    args,
  });
  return typeof result === "string" ? result : String(result);
}

export type WriteResult = { hash: string; explorerUrl: string; returnValue: string };

/** Sends a write, waits for finalization, and decodes the leader's return value. */
export async function writeContract(
  client: WalletClient,
  functionName: string,
  args: CalldataEncodable[],
): Promise<WriteResult> {
  const hash = (await client.writeContract({
    address: requireContract() as `0x${string}`,
    functionName,
    args,
    value: 0n,
  })) as Hash;
  const receipt = await pollUntilFinalized(client, hash);
  return { hash, explorerUrl: explorerTxUrl(hash), returnValue: decodedReturnValue(receipt) };
}

/**
 * Extracts the leader's decoded return value from a finalized Studio
 * transaction. On studionet the result lives at
 * consensus_data.leader_receipt[].result.payload.raw (calldata bytes) rather
 * than the top-level txDataDecoded field used on public testnets.
 */
function decodedReturnValue(receipt: unknown): string {
  const consensusData = (receipt as { consensus_data?: unknown } | undefined)?.consensus_data as
    | { leader_receipt?: unknown }
    | undefined;
  const leaderReceipt = consensusData?.leader_receipt;
  const entry = (Array.isArray(leaderReceipt) ? leaderReceipt[0] : leaderReceipt) as
    | { result?: { status?: string; payload?: { raw?: number[] } | string | null } }
    | undefined;
  const result = entry?.result;
  if (!result || result.status !== "return") return "";
  const payload = result.payload;
  const raw = payload && typeof payload === "object" ? payload.raw : undefined;
  if (!Array.isArray(raw)) return typeof payload === "string" ? payload : "";
  try {
    return new TextDecoder().decode(Uint8Array.from(raw)).trim();
  } catch {
    return "";
  }
}
