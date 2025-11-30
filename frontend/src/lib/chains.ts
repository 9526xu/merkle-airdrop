export type ChainInfo = {
  id: number;
  name: string;
  explorerTxUrl?: (hash: string) => string;
  explorerAddressUrl?: (address: string) => string;
  airdropAddress?: `0x${string}`;
};

const DEFAULT_AIRDROP = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;
const ANVIL_AIRDROP = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS_31337 as
  | `0x${string}`
  | undefined;
const SEPOLIA_AIRDROP = process.env
  .NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS_11155111 as `0x${string}` | undefined;

const DEFAULT_EXPLORER_BASE = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL;
const ANVIL_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER_BASE_URL_31337 ?? DEFAULT_EXPLORER_BASE;
const SEPOLIA_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER_BASE_URL_11155111 ??
  "https://sepolia.etherscan.io";

export const CHAINS: Record<number, ChainInfo> = {
  31337: {
    id: 31337,
    name: "Anvil",
    explorerTxUrl: ANVIL_EXPLORER_BASE
      ? (hash: string) => `${ANVIL_EXPLORER_BASE}/tx/${hash}`
      : undefined,
    explorerAddressUrl: ANVIL_EXPLORER_BASE
      ? (address: string) => `${ANVIL_EXPLORER_BASE}/address/${address}`
      : undefined,
    airdropAddress: ANVIL_AIRDROP ?? DEFAULT_AIRDROP,
  },
  11155111: {
    id: 11155111,
    name: "Sepolia",
    explorerTxUrl: (hash: string) => `${SEPOLIA_EXPLORER_BASE}/tx/${hash}`,
    explorerAddressUrl: (address: string) =>
      `${SEPOLIA_EXPLORER_BASE}/address/${address}`,
    airdropAddress: SEPOLIA_AIRDROP ?? DEFAULT_AIRDROP,
  },
};

export function getChain(chainId?: number): ChainInfo | undefined {
  if (!chainId) return undefined;
  return CHAINS[chainId];
}

export function getAirdropAddress(chainId?: number): `0x${string}` | undefined {
  return getChain(chainId)?.airdropAddress;
}
