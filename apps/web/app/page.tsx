import React from 'react';
import Link from 'next/link';
import { MARKETS_DATA } from '../lib/housing/markets';
import { PulseTicker } from '../components/PulseTicker';
import { MarketCard } from '../components/MarketCard';
import { HeroVideo } from '../components/HeroVideo';
import { 
  ArrowRight, 
  Database, 
  Layers, 
  Cpu, 
  BarChart3, 
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const featuredMarkets = MARKETS_DATA.slice(0, 4);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Global Housing Pulse Ticker */}
      <PulseTicker />

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[53%_47%] gap-8 lg:gap-12 items-center">
          {/* Left Column: Label, Headline, Paragraph, CTAs */}
          <div className="flex flex-col items-start space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-2.5 sm:px-3 py-1 rounded bg-[#161A18] border border-[#2B322F] text-[11px] sm:text-xs font-mono text-[#10B981] max-w-full">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
              <span className="font-semibold tracking-wider uppercase text-[#F4F4F0] truncate">GLOBAL HOUSING RISK / SOLANA</span>
            </div>

            {/* Headline */}
            <h1 className="text-[26px] sm:text-5xl lg:text-[54px] xl:text-6xl font-bold tracking-tight text-[#F4F4F0] leading-[1.14]">
              Trade the risk<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
                behind housing markets.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-lg text-[#8A918E] leading-relaxed max-w-xl font-sans">
              Explore housing-market outcomes across major global cities, resolved using predefined official public data sources.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 font-mono w-full sm:w-auto">
              <Link
                href="/markets"
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] font-semibold text-xs rounded transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-[#10B981]/15"
              >
                <span>EXPLORE MARKETS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/data"
                className="px-5 py-2.5 bg-[#161A18] hover:bg-[#1B201E] border border-[#2B322F] text-[#F4F4F0] font-medium text-xs rounded transition-colors flex items-center justify-center space-x-2"
              >
                <Database className="w-3.5 h-3.5 text-[#10B981]" />
                <span>VIEW DATA SOURCES</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Ambient Hero Video */}
          <div className="w-full flex justify-center lg:justify-end">
            <HeroVideo />
          </div>
        </div>

        {/* Data Credibility Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 sm:pt-10 mt-10 sm:mt-12 border-t border-[#222725] font-mono">
          <div>
            <span className="text-[11px] text-[#565E5A] block uppercase">Official Providers</span>
            <span className="text-lg font-bold text-[#F4F4F0]">4 Sovereign</span>
          </div>
          <div>
            <span className="text-[11px] text-[#565E5A] block uppercase">Settlement Mechanism</span>
            <span className="text-lg font-bold text-[#10B981]">Deterministic</span>
          </div>
          <div>
            <span className="text-[11px] text-[#565E5A] block uppercase">Subjective Voting</span>
            <span className="text-lg font-bold text-[#8A918E]">0.0% Discretion</span>
          </div>
          <div>
            <span className="text-[11px] text-[#565E5A] block uppercase">Target Network</span>
            <span className="text-lg font-bold text-[#F4F4F0]">Solana Mainnet</span>
          </div>
        </div>
      </section>

      {/* Featured Housing Markets Section */}
      <section className="w-full bg-[#0E1110] border-t border-[#222725] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981] mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase tracking-wider">CONTRACT REGISTRY</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0]">
                Featured Housing Markets
              </h2>
            </div>
            <Link
              href="/markets"
              className="text-xs font-mono text-[#8A918E] hover:text-[#10B981] flex items-center space-x-1"
            >
              <span>View all supported contracts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      </section>

      {/* How HedgeHouse Works Section (Anchor target: #how-it-works) */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider block mb-2 font-semibold">
            PROTOCOL LIFECYCLE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F4F0] mb-3">
            How HedgeHouse Works
          </h2>
          <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed font-mono">
            Pure algorithmic settlement referenced directly to sovereign statistical bureaus. Zero subjective voting, zero oracle discretion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
          {/* Step 01 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 inline-block mb-3">
                01
              </span>
              <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2 uppercase">Official Data</h4>
              <p className="text-xs text-[#8A918E] leading-relaxed">
                Raw housing statistics are ingested directly from official government authorities: FHFA (US), HM Land Registry (UK), URA (SG), and ABS (AU).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1D2220] text-[10px] text-[#565E5A]">
              Source: Sovereign Bureaus
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 inline-block mb-3">
                02
              </span>
              <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2 uppercase">Normalize</h4>
              <p className="text-xs text-[#8A918E] leading-relaxed">
                Official housing data is normalized by HedgeHouse into the canonical <code className="text-[#10B981]">HousingObservation</code> schema, standardizing timestamps and units.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1D2220] text-[10px] text-[#565E5A]">
              Interface: Strict TypeScript
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 inline-block mb-3">
                03
              </span>
              <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2 uppercase">Deterministic Rule</h4>
              <p className="text-xs text-[#8A918E] leading-relaxed">
                A deterministic rule strictly evaluates the specified period and target value. Mathematical predicates prevent arbitrary interpretation or social disputes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1D2220] text-[10px] text-[#565E5A]">
              Engine: Mathematical Proof
            </div>
          </div>

          {/* Step 04 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 inline-block mb-3">
                04
              </span>
              <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2 uppercase">Resolve on Solana</h4>
              <p className="text-xs text-[#8A918E] leading-relaxed">
                The authorized resolution bridge submits the verified outcome to the HedgeHouse protocol, unlocking collateral to winning positions upon Mainnet deployment.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1D2220] text-[10px] text-amber-400">
              State: Awaiting Deployment
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture Banner */}
      <section className="w-full bg-[#121514] border-y border-[#222725] py-14 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 text-xs text-[#10B981]">
                <Cpu className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider">SOLANA PROTOCOL ARCHITECTURE</span>
              </div>
              <h3 className="text-2xl font-bold text-[#F4F4F0]">
                Non-Custodial Matched-Pair Collateral Vaults
              </h3>
              <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed">
                The HedgeHouse Anchor program utilizes Program Derived Address (PDA) collateral vaults. Depositing 1 USDC mints 1 YES token and 1 NO token on-chain. Winning tokens redeem 1.00 USDC upon deterministic settlement.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  Isolated Market PDAs
                </span>
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  SPL Token Pairs (YES/NO)
                </span>
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  Deterministic Settlement
                </span>
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-amber-400">
                  Target: Solana Mainnet
                </span>
              </div>
            </div>

            <div className="bg-[#0B0D0C] border border-[#222725] rounded-lg p-5 text-xs space-y-3">
              <div className="flex items-center justify-between text-[#8A918E] border-b border-[#222725] pb-2">
                <span>DEPLOYMENT STATUS</span>
                <span className="text-[#10B981]">ARCHITECTURE</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">Sovereign Data Feeds</span>
                  <span className="text-[#10B981]">LIVE &amp; VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">Deterministic Resolver</span>
                  <span className="text-[#10B981]">ALGORITHMIC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">Anchor Program Source</span>
                  <span className="text-[#10B981]">IMPLEMENTED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">Web Interface</span>
                  <span className="text-[#10B981]">MAINNET-FACING</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">On-Chain Execution</span>
                  <span className="text-amber-400">AWAITING DEPLOYMENT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
