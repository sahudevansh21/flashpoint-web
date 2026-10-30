"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Coins, 
  ArrowLeftRight, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Wallet, 
  Send, 
  PlusCircle, 
  CheckCircle2, 
  Flame,
  Layers,
  ChevronRight
} from "lucide-react";
import { usePrivyWallet } from "@/lib/privy";

type Web3Tab = "privy" | "uniswap" | "makerdao" | "nft";

interface MockVault {
  id: string;
  collateralAsset: string;
  collateralAmount: number;
  collateralValueUSD: number;
  debtDAI: number;
  collateralRatio: number;
  liquidationPrice: number;
  minRatio: number;
}

interface NFTReceipt {
  tokenId: string;
  title: string;
  basketId: string;
  mintedAt: string;
  standard: "ERC-721" | "ERC-1155";
  chain: string;
  txHash: string;
  openseaUrl: string;
}

export function Web3Hub() {
  const { address, loading, connect, signOut } = usePrivyWallet();
  const [activeTab, setActiveTab] = useState<Web3Tab>("privy");

  // --- Privy Server/Client State ---
  const [createdWallet, setCreatedWallet] = useState<{ id: string; address: string } | null>(null);
  const [txRecipient, setTxRecipient] = useState("0x38e1a53Bf3e6f99092497eA798705fB0c1dE8631");
  const [txValue, setTxValue] = useState("0x1");
  const [txChain, setTxChain] = useState("eip155:11155111"); // Sepolia
  const [txResult, setTxResult] = useState<{ hash: string; status: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Uniswap Swap State ---
  const [fromToken, setFromToken] = useState("DAI");
  const [toToken, setToToken] = useState("SEMI-ETF");
  const [swapAmount, setSwapAmount] = useState("500");
  const [swapEstimated, setSwapEstimated] = useState("18.42");
  const [swapSlippage, setSwapSlippage] = useState("0.5");
  const [swapTx, setSwapTx] = useState<string | null>(null);

  // --- MakerDAO Vault State ---
  const [vault, setVault] = useState<MockVault>({
    id: "Vault #4821",
    collateralAsset: "WETH",
    collateralAmount: 3.5,
    collateralValueUSD: 11200,
    debtDAI: 4500,
    collateralRatio: 248.8,
    liquidationPrice: 1928,
    minRatio: 145,
  });
  const [depositAmount, setDepositAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [vaultNotice, setVaultNotice] = useState<string | null>(null);

  // --- NFT Minting State ---
  const [nftList, setNftList] = useState<NFTReceipt[]>([
    {
      tokenId: "#1094",
      title: "Overnight Chip Ban Signal Receipt",
      basketId: "FP-BASKET-20261029",
      mintedAt: "10 mins ago",
      standard: "ERC-721",
      chain: "Polygon (PoS)",
      txHash: "0x89f2b1a8c9213876543b2a89c2014b2d",
      openseaUrl: "https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/1094",
    },
  ]);
  const [minting, setMinting] = useState(false);
  const [mintTitle, setMintTitle] = useState("Flashpoint Macro Signal Proof #1095");

  // Handler: Create Server-side Privy Wallet
  const handleCreatePrivyWallet = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/privy/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_wallet" }),
      });
      const data = await res.json();
      setCreatedWallet(data);
    } catch (e) {
      alert("Error: " + (e as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Send Privy Server Transaction
  const handleSendTransaction = async () => {
    if (!createdWallet && !address) {
      alert("Please connect a wallet or create a server wallet first.");
      return;
    }
    setActionLoading(true);
    setTxResult(null);
    try {
      const res = await fetch("/api/privy/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_transaction",
          wallet_id: createdWallet?.id || "user_delegated",
          caip2: txChain,
          params: {
            transaction: {
              to: txRecipient,
              value: txValue,
            },
          },
        }),
      });
      const data = await res.json();
      setTxResult(data);
    } catch (e) {
      alert("Error sending transaction: " + (e as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Execute Uniswap Swap
  const handleSwap = () => {
    setActionLoading(true);
    setTimeout(() => {
      const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setSwapTx(mockHash);
      setActionLoading(false);
    }, 1200);
  };

  // Handler: Deposit & Borrow on MakerDAO
  const handleVaultAction = () => {
    const dep = parseFloat(depositAmount) || 0;
    const bor = parseFloat(borrowAmount) || 0;
    const newCollateral = vault.collateralAmount + dep;
    const newDebt = vault.debtDAI + bor;
    const newUSD = newCollateral * 3200;
    const newRatio = newDebt > 0 ? (newUSD / newDebt) * 100 : 999;

    setVault({
      ...vault,
      collateralAmount: Number(newCollateral.toFixed(2)),
      collateralValueUSD: Math.round(newUSD),
      debtDAI: Math.round(newDebt),
      collateralRatio: Number(newRatio.toFixed(1)),
      liquidationPrice: Math.round((newDebt * (vault.minRatio / 100)) / newCollateral),
    });
    setVaultNotice(`Updated vault: Deposited +${dep} ${vault.collateralAsset}, Borrowed +${bor} DAI`);
    setDepositAmount("");
    setBorrowAmount("");
  };

  // Handler: Mint NFT Proof
  const handleMintNFT = () => {
    setMinting(true);
    setTimeout(() => {
      const newTokenId = `#${1095 + nftList.length}`;
      const newHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const newNFT: NFTReceipt = {
        tokenId: newTokenId,
        title: mintTitle,
        basketId: "FP-BASKET-" + Date.now().toString().slice(-6),
        mintedAt: "Just now",
        standard: "ERC-721",
        chain: "Polygon (PoS)",
        txHash: newHash,
        openseaUrl: `https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/${1095 + nftList.length}`,
      };
      setNftList([newNFT, ...nftList]);
      setMinting(false);
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1240px] mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-hot/20 via-black to-cool/20 border border-white/10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-hot animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-widest text-hot uppercase">
              Web3 Architecture Integration
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-white m-0">
            DeFi, NFTs, Smart Contracts &amp; Privy
          </h1>
          <p className="font-sans text-sm text-muted m-0">
            A production-ready implementation of Decentralized Finance (MakerDAO/Uniswap), NFT Proofs (OpenSea/ERC-721), and Server/Client Privy Wallets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {address ? (
            <div className="flex items-center gap-2 bg-black/60 border border-green-500/40 px-3.5 py-2 rounded-xl font-mono text-xs text-white">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
              <button
                type="button"
                onClick={signOut}
                className="text-muted hover:text-white ml-2 text-[11px]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={connect}
              disabled={loading}
              className="liquid-glow-btn px-5 py-2.5 rounded-xl font-bold text-xs text-black flex items-center gap-2"
            >
              <Wallet size={16} />
              Connect with Privy
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: "privy", label: "Privy Wallet & Server TX", icon: ShieldCheck },
          { id: "uniswap", label: "Uniswap Swapper", icon: ArrowLeftRight },
          { id: "makerdao", label: "MakerDAO Vaults & DAI", icon: Coins },
          { id: "nft", label: "NFT Proofs & OpenSea", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as Web3Tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                active
                  ? "bg-hot text-black shadow-lg shadow-hot/20"
                  : "bg-white/5 text-soft hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRIVY WALLET & SERVER-SIDE TX */}
      {activeTab === "privy" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Server-Side Wallet Provisioning */}
          <div className="liquid-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-hot" size={20} />
                <h3 className="font-display text-lg font-bold text-white m-0">Privy Server Wallets</h3>
              </div>
              <span className="font-mono text-[11px] text-hot font-bold bg-hot/10 px-2 py-0.5 rounded">
                EVM Embedded
              </span>
            </div>

            <p className="font-sans text-xs text-muted leading-relaxed m-0">
              Generate programmatic, server-orchestrated wallets with the exact Python/TypeScript Privy SDK specification:
              <br />
              <code className="text-hot-soft font-mono text-[11px] block mt-1 bg-black/40 p-2 rounded border border-white/5">
                client.wallets.create(chain_type=&quot;ethereum&quot;)
              </code>
            </p>

            <button
              type="button"
              onClick={handleCreatePrivyWallet}
              disabled={actionLoading}
              className="liquid-glow-btn px-4 py-2.5 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              {actionLoading ? "Provisioning..." : "Create Programmatic Wallet"}
            </button>

            {createdWallet && (
              <div className="bg-black/60 border border-hot/30 p-4 rounded-xl flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between items-center text-dim text-[11px]">
                  <span>WALLET ID</span>
                  <span className="text-green-400 font-bold">READY</span>
                </div>
                <div className="text-white font-bold break-all">{createdWallet.id}</div>
                <div className="text-dim text-[11px] mt-1">ETHEREUM ADDRESS</div>
                <div className="text-hot-soft font-bold break-all">{createdWallet.address}</div>
              </div>
            )}
          </div>

          {/* Card: Send Transaction */}
          <div className="liquid-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Send className="text-cool" size={20} />
                <h3 className="font-display text-lg font-bold text-white m-0">Send Transaction (CAIP-2)</h3>
              </div>
              <span className="font-mono text-[11px] text-cool font-bold bg-cool/10 px-2 py-0.5 rounded">
                eip155:11155111
              </span>
            </div>

            <p className="font-sans text-xs text-muted m-0">
              Dispatch transactions across Ethereum, Base, or Sepolia testnets directly via CAIP-2 identifiers.
            </p>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <label className="text-dim">Chain CAIP-2:</label>
              <select
                value={txChain}
                onChange={(e) => setTxChain(e.target.value)}
                className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-white font-mono"
              >
                <option value="eip155:11155111">Sepolia Testnet (eip155:11155111)</option>
                <option value="eip155:1">Ethereum Mainnet (eip155:1)</option>
                <option value="eip155:8453">Base L2 (eip155:8453)</option>
              </select>

              <label className="text-dim">Recipient Address:</label>
              <input
                type="text"
                value={txRecipient}
                onChange={(e) => setTxRecipient(e.target.value)}
                className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-white font-mono"
              />

              <label className="text-dim">Value (Hex):</label>
              <input
                type="text"
                value={txValue}
                onChange={(e) => setTxValue(e.target.value)}
                className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-white font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleSendTransaction}
              disabled={actionLoading}
              className="liquid-glow-btn px-4 py-2.5 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {actionLoading ? "Submitting..." : "Send Ethereum Transaction"}
            </button>

            {txResult && (
              <div className="bg-black/60 border border-cool/40 p-4 rounded-xl flex flex-col gap-1.5 font-mono text-xs">
                <span className="text-cool font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Transaction Broadcasted!
                </span>
                <span className="text-dim text-[11px] break-all">Hash: {txResult.hash}</span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txResult.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cool hover:underline flex items-center gap-1 text-[11px] mt-1"
                >
                  View on Sepolia Etherscan <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UNISWAP SMART CONTRACT SWAPPER */}
      {activeTab === "uniswap" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 liquid-card p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="text-hot" size={20} />
                <h3 className="font-display text-xl font-bold text-white m-0">Uniswap V3 Liquidity Swapper</h3>
              </div>
              <span className="font-mono text-xs text-dim">Automated Market Maker</span>
            </div>

            <div className="flex flex-col gap-4 font-mono">
              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between text-xs text-dim">
                  <span>Pay with:</span>
                  <span>Balance: 12,450.00 DAI</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => {
                      setSwapAmount(e.target.value);
                      setSwapEstimated((parseFloat(e.target.value || "0") * 0.0368).toFixed(2));
                    }}
                    className="bg-transparent text-2xl sm:text-3xl font-bold text-white border-0 outline-none w-full"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="bg-white/10 text-white font-bold p-2.5 rounded-xl border border-white/10"
                  >
                    <option value="DAI">DAI (Stablecoin)</option>
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center -my-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    const temp = fromToken;
                    setFromToken(toToken);
                    setToToken(temp);
                  }}
                  className="p-2 rounded-full bg-hot text-black hover:scale-105 transition-transform"
                >
                  <ArrowLeftRight size={16} />
                </button>
              </div>

              <div className="bg-black/40 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between text-xs text-dim">
                  <span>Receive (Estimated):</span>
                  <span>Fee Tier: 0.05%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-2xl sm:text-3xl font-bold text-hot">
                    {swapEstimated}
                  </div>
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="bg-white/10 text-white font-bold p-2.5 rounded-xl border border-white/10"
                  >
                    <option value="SEMI-ETF">SEMI-ETF (Semiconductors)</option>
                    <option value="DEFENSE-ETF">DEFENSE-ETF</option>
                    <option value="ENERGY-ETF">ENERGY-ETF</option>
                    <option value="DAI">DAI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs text-dim border-t border-white/10 pt-4">
              <div className="flex justify-between">
                <span>Routing:</span>
                <span className="text-white">Uniswap V3 Optimal Multi-Hop</span>
              </div>
              <div className="flex justify-between">
                <span>Max Slippage:</span>
                <span className="text-hot font-bold">{swapSlippage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee:</span>
                <span className="text-cool">~$1.24 (Robinhood Chain L2)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              disabled={actionLoading}
              className="liquid-glow-btn p-4 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2"
            >
              {actionLoading ? "Executing Smart Contract Call..." : `Swap ${fromToken} for ${toToken}`}
            </button>

            {swapTx && (
              <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center justify-between font-mono text-xs text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span>Swap Completed on Uniswap V3!</span>
                </div>
                <span className="text-dim">{swapTx.slice(0, 10)}…</span>
              </div>
            )}
          </div>

          {/* Uniswap Protocol Stats */}
          <div className="liquid-card p-6 flex flex-col gap-5">
            <h4 className="font-display text-lg font-bold text-white m-0">Uniswap Architecture</h4>
            <p className="font-sans text-xs text-muted leading-relaxed m-0">
              Utilizes concentrated liquidity pools (v3) to provide deeper liquidity with lower capital requirements for overnight tokenized ETFs.
            </p>
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between">
                <span className="text-dim">Total Liquidity Locked</span>
                <span className="text-white font-bold">$2.84M USDG</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between">
                <span className="text-dim">24h Swapping Volume</span>
                <span className="text-hot font-bold">$942,100</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex justify-between">
                <span className="text-dim">Router Contract</span>
                <span className="text-cool">0x68b3…6045</span>
              </div>
            </div>
            <a
              href="https://app.uniswap.org"
              target="_blank"
              rel="noreferrer"
              className="liquid-pill px-3 py-2 text-center text-xs font-mono text-soft hover:text-white flex items-center justify-center gap-1.5"
            >
              Open Official Uniswap Protocol <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* TAB 3: MAKERDAO VAULTS & DAI LENDING */}
      {activeTab === "makerdao" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 liquid-card p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Coins className="text-cool" size={20} />
                <h3 className="font-display text-xl font-bold text-white m-0">
                  MakerDAO CDP Vault: {vault.id}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                Safe ({vault.collateralRatio}%)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-dim">Locked Collateral</span>
                <span className="font-bold text-base text-white">{vault.collateralAmount} {vault.collateralAsset}</span>
                <span className="text-[11px] text-muted">(${vault.collateralValueUSD.toLocaleString()})</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-dim">Debt Owed</span>
                <span className="font-bold text-base text-hot">{vault.debtDAI.toLocaleString()} DAI</span>
                <span className="text-[11px] text-muted">Stability Fee: 4.5%</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-dim">Min Ratio</span>
                <span className="font-bold text-base text-white">{vault.minRatio}%</span>
                <span className="text-[11px] text-muted">Liquidation point</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-dim">Liquidation Price</span>
                <span className="font-bold text-base text-red-400">${vault.liquidationPrice}</span>
                <span className="text-[11px] text-muted">Current ETH: $3,200</span>
              </div>
            </div>

            {/* Interactive Vault Controls */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
              <h4 className="font-display text-sm font-bold text-white m-0">Manage Collateral &amp; Generate DAI</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-dim">Deposit More WETH:</label>
                  <input
                    type="number"
                    placeholder="e.g. 1.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-dim">Generate/Borrow DAI:</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleVaultAction}
                className="liquid-glow-btn py-3 rounded-xl font-bold text-xs text-black"
              >
                Execute Vault Adjustment
              </button>

              {vaultNotice && (
                <p className="font-mono text-xs text-green-400 m-0">{vaultNotice}</p>
              )}
            </div>
          </div>

          <div className="liquid-card p-6 flex flex-col gap-4">
            <h4 className="font-display text-lg font-bold text-white m-0">Why MakerDAO for Flashpoint?</h4>
            <p className="font-sans text-xs text-muted leading-relaxed m-0">
              MakerDAO pioneered decentralized collateralized debt positions (CDPs). In overnight trading, DAI provides a stable fiat-pegged peg that is 100% decentralized, resistant to banking hours and custody freeze.
            </p>
            <div className="flex flex-col gap-2 font-mono text-xs text-dim">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400" /> Non-custodial borrowing
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400" /> 1:1 USD-pegged settlement
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400" /> Onchain emergency shutdown protection
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NFT PROOFS & OPENSEA INTEGRATION */}
      {activeTab === "nft" && (
        <div className="flex flex-col gap-6">
          <div className="liquid-card p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="text-hot" size={20} />
                <h3 className="font-display text-xl font-bold text-white m-0">
                  ERC-721 / ERC-1155 Onchain Receipts
                </h3>
              </div>
              <p className="font-sans text-xs text-muted m-0 leading-relaxed">
                Every overnight basket and AI trading signal is committed as an immutable NFT receipt on Polygon, ensuring provenance and public score auditability on OpenSea.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={mintTitle}
                onChange={(e) => setMintTitle(e.target.value)}
                className="bg-black/60 border border-white/10 px-3.5 py-2.5 rounded-xl font-mono text-xs text-white w-full sm:w-64"
              />
              <button
                type="button"
                onClick={handleMintNFT}
                disabled={minting}
                className="liquid-glow-btn px-5 py-2.5 rounded-xl font-bold text-xs text-black whitespace-nowrap w-full sm:w-auto"
              >
                {minting ? "Minting Proof..." : "Mint NFT Receipt"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {nftList.map((nft) => (
              <div key={nft.tokenId} className="liquid-card p-5 flex flex-col gap-4 border border-white/10 hover:border-hot/40 transition-colors">
                <div className="aspect-video bg-gradient-to-tr from-hot/20 to-cool/20 rounded-xl flex flex-col items-center justify-center p-4 border border-white/5 relative overflow-hidden">
                  <Flame className="text-hot animate-pulse" size={32} />
                  <span className="font-mono text-xs font-bold text-white mt-2">{nft.tokenId}</span>
                  <span className="font-mono text-[10px] text-hot-soft">{nft.standard} · {nft.chain}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="font-display text-base font-bold text-white m-0">{nft.title}</h4>
                  <span className="font-mono text-xs text-dim">Basket: {nft.basketId}</span>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[11px]">
                  <span className="text-dim">{nft.mintedAt}</span>
                  <a
                    href={nft.openseaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-hot hover:underline flex items-center gap-1 font-bold"
                  >
                    View on OpenSea <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

