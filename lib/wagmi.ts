import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

// WalletConnect requires a project ID. Get a free one at https://cloud.reown.com.
// Without it, injected wallets (MetaMask, Coinbase extension) still work; only
// WalletConnect-based mobile wallets need the ID.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const wagmiConfig = getDefaultConfig({
  appName: "flowr",
  projectId,
  chains: [mainnet, arbitrum, base, polygon, optimism],
  ssr: true,
});
