import { Web3Hub } from "@/components/Web3Hub";
import { AppNav } from "@/components/AppNav";

export const metadata = {
  title: "Web3 Integration · DeFi, NFTs & Privy",
  description: "Comprehensive Web3 architecture integration: MakerDAO vaults, Uniswap V3 swapper, OpenSea NFT receipts, and Privy embedded wallet orchestration.",
};

export default function Web3Page() {
  return (
    <div className="universe-page min-h-screen text-text flex flex-col">
      <AppNav live={true} />
      <main className="flex-1">
        <Web3Hub />
      </main>
    </div>
  );
}

