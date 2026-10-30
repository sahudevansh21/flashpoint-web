"use client";

import { useState } from "react";
import { 
  X, 
  ArrowLeftRight, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  Wallet 
} from "lucide-react";
import { usePrivyWallet } from "@/lib/privy";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  basketId: string;
  thesis: string;
  token: string;
  tokenName?: string;
  sizeUSDG: number;
  tokenPrice?: number;
  canonicalHash?: string;
}

export function BasketWeb3Modal({
  isOpen,
  onClose,
  basketId,
  thesis,
  token,
  tokenName,
  sizeUSDG,
  tokenPrice = 124.5,
  canonicalHash,
}: Props) {
  const { address, connect } = usePrivyWallet();
  const [activeTab, setActiveTab] = useState<"uniswap" | "makerdao" | "nft">("uniswap");

  // Uniswap state
  const [swapFrom, setSwapFrom] = useState("DAI");
  const [slippage, setSlippage] = useState("0.5");
  const [swapExecuting, setSwapExecuting] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null);

  // MakerDAO state
  const [borrowDAI, setBorrowDAI] = useState(sizeUSDG.toString());
  const [collateralETH, setCollateralETH] = useState(((sizeUSDG * 1.5) / 3200).toFixed(3));
  const [vaultExecuting, setVaultExecuting] = useState(false);
  const [vaultSuccess, setVaultSuccess] = useState<string | null>(null);

  // NFT state
  const [minting, setMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<{ id: string; txHash: string; openseaUrl: string } | null>(null);

  if (!isOpen) return null;

  const handleUniswapSwap = () => {
    setSwapExecuting(true);
    setTimeout(() => {
      const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setSwapSuccess(mockHash);
      setSwapExecuting(false);
    }, 1400);
  };

  const handleMakerDAOBorrow = () => {
    setVaultExecuting(true);
    setTimeout(() => {
      const mockVaultId = "#" + Math.floor(1000 + Math.random() * 9000);
      setVaultSuccess(mockVaultId);
      setVaultExecuting(false);
    }, 1300);
  };

  const handleMintNFT = () => {
    setMinting(true);
    setTimeout(() => {
      const id = "#" + Math.floor(1000 + Math.random() * 9000);
      const hash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setMintedNFT({
        id,
        txHash: hash,
        openseaUrl: `https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/${id.replace('#', '')}`,
      });
      setMinting(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-2xl bg-[#0f0e0d] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-hot/10 text-hot border border-hot/20">
              <Layers size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-hot uppercase">Web3 Protocol Execution</span>
                <span className="text-[11px] text-muted font-mono">{basketId}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white m-0">
                Execute {token} &amp; Mint Onchain Proof
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 pt-3 gap-2">
          {[
            { id: "uniswap", label: "Uniswap Swapper", icon: ArrowLeftRight },
            { id: "makerdao", label: "MakerDAO Vault", icon: Coins },
            { id: "nft", label: "OpenSea NFT Receipt", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-mono text-xs font-semibold border-b-2 transition-all ${
                  active
                    ? "border-hot text-hot bg-white/5"
                    : "border-transparent text-muted hover:text-white"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
          {/* TAB 1: UNISWAP */}
          {activeTab === "uniswap" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-3">
                <div className="flex justify-between text-dim">
                  <span>Pay from connected wallet:</span>
                  <span>Slippage: {slippage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white font-sans">{sizeUSDG.toLocaleString()} DAI</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold">DAI (USD Peg)</span>
                </div>
              </div>

              <div className="flex justify-center -my-2 z-10">
                <span className="p-1.5 rounded-full bg-hot text-black">
                  <ArrowLeftRight size={14} />
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-3">
                <div className="flex justify-between text-dim">
                  <span>Receive Tokenized ETF:</span>
                  <span>Pool: Uniswap V3 (0.05%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-hot font-sans">
                    {(sizeUSDG / tokenPrice).toFixed(3)} {token}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-hot/20 text-hot font-bold border border-hot/30">
                    {token}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-dim text-[11px] p-2 bg-white/[0.02] rounded-xl border border-white/5">
                <span>Smart Contract Router:</span>
                <span className="text-cool font-mono">0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45</span>
              </div>

              <button
                type="button"
                onClick={handleUniswapSwap}
                disabled={swapExecuting}
                className="liquid-glow-btn p-3.5 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2 mt-2"
              >
                {swapExecuting ? "Executing Multi-Hop Swap..." : `Confirm Uniswap Swap for ${token}`}
              </button>

              {swapSuccess && (
                <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Transaction Confirmed onchain!
                  </span>
                  <span className="text-dim text-[11px]">{swapSuccess.slice(0, 12)}…</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MAKERDAO */}
          {activeTab === "makerdao" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              <p className="font-sans text-xs text-muted m-0 leading-relaxed">
                Fund this overnight trade without selling your ETH. Open a MakerDAO Vault (CDP) to deposit WETH collateral and borrow DAI with a 4.5% stability fee.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-1">
                  <span className="text-dim">Deposit Collateral</span>
                  <span className="text-lg font-bold text-white">{collateralETH} WETH</span>
                  <span className="text-[11px] text-muted">Value: ${(parseFloat(collateralETH) * 3200).toFixed(0)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-1">
                  <span className="text-dim">Generate Stablecoin</span>
                  <span className="text-lg font-bold text-hot">{borrowDAI} DAI</span>
                  <span className="text-[11px] text-green-400">Ratio: 213% (Safe)</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-dim">
                <div className="flex justify-between">
                  <span>Maker Liquidation Ratio:</span>
                  <span className="text-white">145%</span>
                </div>
                <div className="flex justify-between">
                  <span>Liquidation Price:</span>
                  <span className="text-red-400">$1,920 / ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="text-cool">IPFS Pinning Enabled</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMakerDAOBorrow}
                disabled={vaultExecuting}
                className="liquid-glow-btn p-3.5 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2 mt-2"
              >
                {vaultExecuting ? "Opening Vault & Minting DAI..." : `Borrow ${borrowDAI} DAI from MakerDAO`}
              </button>

              {vaultSuccess && (
                <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> MakerDAO Vault {vaultSuccess} Active!
                  </span>
                  <span className="text-dim text-[11px]">Ready to trade</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NFT OPENSEA */}
          {activeTab === "nft" && (
            <div className="flex flex-col gap-4 font-mono text-xs">
              <p className="font-sans text-xs text-muted m-0 leading-relaxed">
                Mint an ERC-721 cryptographic receipt on Polygon for this trade signal. The metadata is permanently hashed and viewable on OpenSea.
              </p>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-2.5">
                <div className="flex justify-between text-dim">
                  <span>NFT Standard:</span>
                  <span className="text-white font-bold">ERC-721 (OpenZeppelin)</span>
                </div>
                <div className="flex justify-between text-dim">
                  <span>Network:</span>
                  <span className="text-purple-400 font-bold">Polygon PoS (Low Gas)</span>
                </div>
                <div className="flex justify-between text-dim">
                  <span>Canonical Receipt Hash:</span>
                  <span className="text-hot font-bold truncate max-w-[240px]">
                    {canonicalHash || "0x98f4c219a1...de45"}
                  </span>
                </div>
                <div className="flex justify-between text-dim">
                  <span>Marketplace:</span>
                  <span className="text-blue-400 font-bold">OpenSea Verified</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMintNFT}
                disabled={minting}
                className="liquid-glow-btn p-3.5 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2 mt-2"
              >
                {minting ? "Minting to Polygon..." : "Mint Proof NFT on Polygon"}
              </button>

              {mintedNFT && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={16} /> Token {mintedNFT.id} Minted!
                    </span>
                    <span className="text-dim text-[11px]">{mintedNFT.txHash.slice(0, 10)}…</span>
                  </div>
                  <a
                    href={mintedNFT.openseaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white bg-purple-600 hover:bg-purple-500 text-center py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 mt-1"
                  >
                    View on OpenSea Marketplace <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-dim">
          <span>Non-custodial: Verified smart contracts on Ethereum &amp; Polygon</span>
          <button
            type="button"
            onClick={onClose}
            className="text-soft hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
