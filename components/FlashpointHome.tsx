import Link from "next/link";
import { BetaForm } from "@/components/BetaForm";
import { HeroBasket, LandingPrimaryCTA, MarketPill, ScorePreview } from "@/components/LandingLive";
import { ImmersivePortal } from "@/components/ImmersivePortal";
import { ChromeOrbitWidget } from "@/components/ChromeOrbitWidget";
import { Logo } from "@/components/Logo";
import { GhostType } from "@/components/GhostType";
import { WalletConnect } from "@/components/WalletConnect";
import { LIVE_DATA_READY } from "@/lib/launch";

const JOURNEY = [
  ["01", "Headline lands", "Overnight wires are monitored for market-moving events."],
  ["02", "AI triages", "The signal is ranked by urgency, sector, and source quality."],
  ["03", "Thesis forms", "A concise explanation connects the event to affected assets."],
  ["04", "Basket is sized", "Two to four tokenized sector ETFs are weighted to liquidity."],
  ["05", "Receipt is committed", "The basket is recorded onchain before it is published."],
  ["06", "Open grades the call", "At 9:45 ET, outcomes are measured against real prices and SPY."],
];

const AUDIENCES = [
  ["01", "Global retail traders", "For Mumbai, Dubai, Lagos, and other markets where US overnight news arrives during the day."],
  ["02", "Crypto-native traders", "Get real-world sector exposure while staying in your wallet and using tokenized markets."],
  ["03", "Bots and AI agents", "A paid API is planned so automated systems can read signals and build on the public record."],
];

const TOKEN_USE = [
  ["Custom triggers", "Build alerts around the events and thresholds you care about."],
  ["Deeper history and replay", "Review past signals and replay how a thesis developed."],
  ["API credits", "Use Flashpoint data and workflows through the planned API."],
  ["Practice-league perks", "Compete on a simulated record without risking capital."],
];

const ROADMAP = [
  ["Weeks 1–2", "Ship the record", "Publish the live feed, onchain receipts, and the first public baskets."],
  ["Weeks 3–4", "Grade in public", "Start the 9:45 ET scorecard. Show every result, including misses."],
  ["Weeks 5–7", "Open the beta", "Invite global traders, tune alerts, and improve the overnight workflow."],
  ["Weeks 8–10+", "Build the platform", "Explore deeper replay, token utility, and API access as the record grows."],
];

const SECTIONS = [
  ["Why it matters", "#why"],
  ["How it works", "#how"],
  ["Proof", "#proof"],
  ["Who it’s for", "#audience"],
  ["Web3 & DeFi", "#web3"],
  ["Token", "#token"],
  ["Roadmap", "#roadmap"],
] as const;

export function FlashpointHome() {
  return (
    <main className="flashpoint-home fp-landing" id="about">
      <a className="skip-link" href="#why">Skip to project details</a>

      <section className="fp-hero" aria-labelledby="home-title">
        <header className="flashpoint-home-header">
          <Logo size={23} />
          <div className="flashpoint-home-actions">
            <nav className="portal-nav" aria-label="Main navigation">
              <a className="portal-nav-active" href="#about" aria-current="page">Overview</a>
              <a href="#how">How it works</a>
              <a href="#proof">Proof</a>
            </nav>
            <details className="portal-menu">
              <summary>Menu</summary>
              <nav aria-label="More destinations">
                <Link href="/feed">Live Feed</Link>
                <Link href="/scorecard">Scorecard</Link>
                <Link href="/chat">AI Voice Terminal</Link>
                <Link href="/web3">Web3 Hub &amp; DeFi Swapper</Link>
                <Link href="/me">Alerts &amp; preferences</Link>
                <a href="#token">Token &amp; roadmap</a>
              </nav>
            </details>
            <div className="portal-wallet-action">
              <WalletConnect size="sm" className="portal-wallet-connect" />
            </div>
          </div>
        </header>

        <nav className="project-rail" aria-label="Flashpoint sections">
          {SECTIONS.map(([label, href], index) => (
            <a key={href} href={href} className={index === 0 ? "project-rail-active" : undefined}>
              {label}
            </a>
          ))}
        </nav>

        <div className="portal-caption" aria-hidden="true">
          <span>Overnight intelligence</span>
          <strong><span>[01]</span> Headline to basket</strong>
        </div>

        <ImmersivePortal
          href={LIVE_DATA_READY ? "/feed" : "#join-beta"}
          actionLabel={LIVE_DATA_READY ? "See tonight’s baskets" : "Join the beta"}
        />

        <section className="home-copy" aria-labelledby="home-title">
          <MarketPill />
          <GhostType />
          <p>Know what to buy when news breaks, before Wall Street opens. Every basket is recorded before it’s public and graded at the open.</p>
          <div className="home-ctas">
            <LandingPrimaryCTA />
            <Link className="home-cta-secondary" href="/scorecard">Check the scorecard</Link>
          </div>
          <span className="home-principle">Non-custodial · 24/7 tokenized markets · Public record, including misses</span>
        </section>

        <aside className="fp-live-card" aria-label="Latest basket">
          <div className="fp-live-card-heading">
            <span>{LIVE_DATA_READY ? "[ LATEST BASKET ]" : "[ BETA PREVIEW ]"}</span>
            <span>60s engine</span>
          </div>
          <HeroBasket />
        </aside>

        <a className="fp-scroll-cue" href="#why"><span aria-hidden="true">↓</span> Scroll to explore</a>
      </section>

      <div className="fp-content">
        <section className="fp-section fp-why" id="why" aria-labelledby="why-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 01 ] · THE OVERNIGHT GAP</span>
            <h2 id="why-title">The world doesn’t stop when Wall Street closes.</h2>
            <p>Markets go quiet. Headlines don’t. Flashpoint turns the gap into a clear, reviewable trade idea.</p>
          </div>
          <div className="fp-stat-grid">
            <article className="fp-stat-card"><strong>17.5<span>h</span></strong><p>US markets are closed each weekday.</p></article>
            <article className="fp-stat-card"><strong>24<span>/7</span></strong><p>Tokenized markets keep moving around the clock.</p></article>
            <article className="fp-stat-card"><strong>60<span>s</span></strong><p>Target time from headline to a sized basket.</p></article>
            <article className="fp-stat-card"><strong>9:45<span> ET</span></strong><p>Every basket is graded at the regular market open.</p></article>
          </div>
        </section>

        <section className="fp-section" id="how" aria-labelledby="how-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 02 ] · FROM SIGNAL TO SCORE</span>
            <h2 id="how-title">Six steps. One transparent record.</h2>
            <p>Every stage connects the news to the basket, then the basket to its outcome.</p>
          </div>
          <ol className="fp-steps">
            {JOURNEY.map(([number, title, detail]) => (
              <li className="fp-step" key={number}>
                <span className="fp-step-number">[{number}]</span>
                <div><h3>{title}</h3><p>{detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="fp-section fp-proof" id="proof" aria-labelledby="proof-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 03 ] · PROOF, NOT PROMISES</span>
            <h2 id="proof-title">The receipt comes before the reveal.</h2>
            <p>Judge the process and the record for yourself. No edited winners list, no secret timing advantage.</p>
          </div>
          <div className="fp-proof-grid">
            <article><span>01 / COMMIT</span><h3>Recorded onchain</h3><p>The basket receipt is committed before the public signal appears.</p></article>
            <article><span>02 / GRADE</span><h3>Measured on real prices</h3><p>Outcomes are graded at the open against the market, with execution assumptions made clear.</p></article>
            <article><span>03 / SHARE</span><h3>Nobody goes first</h3><p>Everyone sees the same published basket and its timestamp. Winners and misses stay visible.</p></article>
          </div>
        </section>

        <section className="fp-section fp-score" aria-labelledby="score-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 04 ] · PUBLIC SCORECARD</span>
            <h2 id="score-title">The track record earns the trust.</h2>
            <p>Performance numbers stay blank until baskets have been graded. Then every result, good or bad, is part of the record.</p>
          </div>
          <ScorePreview />
          <Link className="fp-text-link" href="/scorecard">Explore the full scorecard <span aria-hidden="true">↗</span></Link>
        </section>

        <section className="fp-section" id="audience" aria-labelledby="audience-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 05 ] · BUILT FOR GLOBAL MARKETS</span>
            <h2 id="audience-title">A faster read on the overnight.</h2>
          </div>
          <div className="fp-audience-grid">
            {AUDIENCES.map(([number, title, detail]) => (
              <article className="fp-audience-card" key={number}>
                <span className="fp-eyebrow">[{number}]</span><h3>{title}</h3><p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="fp-section fp-web3" id="web3" aria-labelledby="web3-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 06 ] · WEB3 &amp; DEFI ARCHITECTURE</span>
            <h2 id="web3-title">Decentralized finance, verifiable NFTs, and smart contracts.</h2>
            <p>Built on battle-tested Web3 protocols: MakerDAO decentralized collateral, Uniswap V3 liquidity routing, and Polygon ERC-721 receipts verified on OpenSea.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <article className="liquid-card p-6 flex flex-col gap-3.5 border border-white/10">
              <span className="font-mono text-xs font-bold text-cool uppercase tracking-wider">01 / DEFI &amp; STABLECOINS</span>
              <h3 className="font-display text-xl font-bold text-white m-0">MakerDAO CDP Vaults</h3>
              <p className="font-sans text-xs text-muted leading-relaxed m-0">
                Deposit WETH collateral to borrow decentralized DAI with transparent stability fees, zero counterparty bank risk, and immutable IPFS storage.
              </p>
              <div className="mt-auto pt-3 border-t border-white/5 font-mono text-[11px] text-cool">
                100% decentralized collateralization
              </div>
            </article>

            <article className="liquid-card p-6 flex flex-col gap-3.5 border border-white/10">
              <span className="font-mono text-xs font-bold text-hot uppercase tracking-wider">02 / AMM SMART CONTRACTS</span>
              <h3 className="font-display text-xl font-bold text-white m-0">Uniswap V3 Swapping</h3>
              <p className="font-sans text-xs text-muted leading-relaxed m-0">
                Exchange tokenized sector ETFs against DAI or USDC with concentrated liquidity depth, low slippage, and audited Solidity routing contracts.
              </p>
              <div className="mt-auto pt-3 border-t border-white/5 font-mono text-[11px] text-hot-soft">
                Multi-hop liquidity pools &amp; oracles
              </div>
            </article>

            <article className="liquid-card p-6 flex flex-col gap-3.5 border border-white/10">
              <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-wider">03 / NFT PROOFS &amp; OPENSEA</span>
              <h3 className="font-display text-xl font-bold text-white m-0">ERC-721 on Polygon</h3>
              <p className="font-sans text-xs text-muted leading-relaxed m-0">
                Mint cryptographic proof receipts of every overnight signal onto Polygon PoS for near-zero gas, verified and tradable on OpenSea.
              </p>
              <div className="mt-auto pt-3 border-t border-white/5 font-mono text-[11px] text-purple-300">
                OpenZeppelin standard · OpenSea verified
              </div>
            </article>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/web3" className="liquid-glow-btn px-6 py-3 rounded-xl font-bold text-sm text-black inline-flex items-center gap-2">
              Launch Web3 Terminal &amp; Swapper →
            </Link>
            <span className="font-mono text-xs text-dim">
              Powered by Privy embedded wallets &amp; Web3.js
            </span>
          </div>
        </section>

        <section className="fp-section fp-token" id="token" aria-labelledby="token-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 07 ] · TOKEN UTILITY</span>
            <h2 id="token-title">Useful access, earned over time.</h2>
            <p>Planned utility is tied to product use. The token does not promise financial returns or privileged trading access.</p>
          </div>
          <div className="fp-token-layout">
            <div className="fp-utility-grid">
              {TOKEN_USE.map(([title, detail]) => <article key={title}><span aria-hidden="true">↗</span><h3>{title}</h3><p>{detail}</p></article>)}
            </div>
            <aside className="fp-token-boundaries">
              <span className="fp-eyebrow">CLEAR BOUNDARIES</span>
              <h3>What the token never promises</h3>
              <ul>
                <li>No early access to a basket</li>
                <li>No revenue share</li>
                <li>No launch before six weeks of public record and a legal opinion</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="fp-section" id="roadmap" aria-labelledby="roadmap-title">
          <div className="fp-section-intro">
            <span className="fp-eyebrow">[ 07 ] · ROADMAP</span>
            <h2 id="roadmap-title">Ship the record first.</h2>
            <p>Milestones are sequenced around public proof and product readiness.</p>
          </div>
          <ol className="fp-roadmap">
            {ROADMAP.map(([when, title, detail]) => <li key={when}><span>{when}</span><h3>{title}</h3><p>{detail}</p></li>)}
          </ol>
        </section>

        <section className="fp-beta" id="join-beta" aria-labelledby="beta-title">
          <div><span className="fp-eyebrow">[ 08 ] · EARLY ACCESS</span><h2 id="beta-title">Be there when the next headline hits.</h2><p>Join the beta list for product updates and access announcements.</p></div>
          <BetaForm />
        </section>

        <footer className="fp-footer">
          <Logo size={19} />
          <p>Information, not investment advice. Not available to US persons. Non-custodial.</p>
          <nav aria-label="Footer navigation"><Link href="/feed">Live Feed</Link><Link href="/scorecard">Scorecard</Link><Link href="/me">Alerts</Link></nav>
        </footer>
      </div>
      <ChromeOrbitWidget />
    </main>
  );
}
