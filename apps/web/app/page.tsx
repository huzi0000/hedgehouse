import React from 'react';
import Link from 'next/link';
import { MARKETS_DATA } from '../lib/housing/markets';
import { OFFICIAL_PROVIDERS } from '../lib/housing/providers';
import { PulseTicker } from '../components/PulseTicker';
import { MarketCard } from '../components/MarketCard';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  Lock, 
  Terminal, 
  Cpu, 
  BarChart3, 
  Globe2,
  FileCheck2,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const featuredMarkets = MARKETS_DATA.slice(0, 4);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Pulse Ticker */}
      <PulseTicker />

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative">
        <div className="flex flex-col items-start max-w-3xl space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#161A18] border border-[#2B322F] text-xs font-mono text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[#F4F4F0] font-medium">PHASE 2</span>
            <span className="text-[#565E5A]">/</span>
            <span>SOLANA HOUSING-RISK PROTOCOL</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F4F0] leading-[1.15]">
            Hedge the Macro.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
              Settle on Truth.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-[#8A918E] leading-relaxed max-w-2xl">
            A decentralized risk-transfer protocol on Solana providing non-custodial synthetic hedging against metropolitan real estate volatility, settling deterministically on official public indices.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/markets"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] font-mono font-semibold text-xs rounded transition-colors flex items-center space-x-2 shadow-lg shadow-[#10B981]/15"
            >
              <span>Explore Benchmark Markets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/data"
              className="px-5 py-2.5 bg-[#161A18] hover:bg-[#1B201E] border border-[#2B322F] text-[#F4F4F0] font-mono font-medium text-xs rounded transition-colors flex items-center space-x-2"
            >
              <Database className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Data Credibility & Sources</span>
            </Link>
          </div>

          {/* Key Terminal Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-[#222725] font-mono">
            <div>
              <span className="text-[11px] text-[#565E5A] block uppercase">Bureaus Ingested</span>
              <span className="text-lg font-bold text-[#F4F4F0]">4 Sovereign</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565E5A] block uppercase">Settlement Mode</span>
              <span className="text-lg font-bold text-[#10B981]">Deterministic</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565E5A] block uppercase">Anchor Invariants</span>
              <span className="text-lg font-bold text-[#F4F4F0]">15 / 15 Passed</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565E5A] block uppercase">Subjective Voting</span>
              <span className="text-lg font-bold text-[#8A918E]">0.0% Discretion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Markets Section */}
      <section className="w-full bg-[#0E1110] border-t border-[#222725] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981] mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>ACTIVE BENCHMARKS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F0]">
                Metropolitan Housing Contracts
              </h2>
            </div>
            <Link
              href="/markets"
              className="text-xs font-mono text-[#8A918E] hover:text-[#10B981] flex items-center space-x-1"
            >
              <span>View all jurisdictions</span>
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

      {/* How It Works (01-04 Flow) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider block mb-2">
            Execution Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F4F0] mb-3">
            Algorithmic Truth Over Social Consensus
          </h2>
          <p className="text-sm text-[#8A918E] leading-relaxed">
            HedgeHouse completely eliminates oracle governance, community voting, and subjective disputes. Every market is anchored to sovereign statistical registries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
          {/* Step 1 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative">
            <span className="text-2xl font-bold text-[#2B322F] block mb-3">01</span>
            <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2">Deterministic Rule Spec</h4>
            <p className="text-xs text-[#8A918E] leading-relaxed">
              Market PDA is deployed with immutable baseline period, target period, and mathematical formula referencing an official public index.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative">
            <span className="text-2xl font-bold text-[#2B322F] block mb-3">02</span>
            <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2">Matched-Pair Collateral</h4>
            <p className="text-xs text-[#8A918E] leading-relaxed">
              Users deposit USDC into the isolated Market Vault PDA. Exactly 1 YES and 1 NO SPL token are minted per 1 collateral unit. Fully solvent.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative">
            <span className="text-2xl font-bold text-[#2B322F] block mb-3">03</span>
            <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2">Government Data Release</h4>
            <p className="text-xs text-[#8A918E] leading-relaxed">
              The designated statistical agency (e.g. FHFA or ONS) publishes the final monthly or quarterly bulletin through public data feeds.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-lg bg-[#121514] border border-[#222725] relative">
            <span className="text-2xl font-bold text-[#10B981] block mb-3">04</span>
            <h4 className="text-sm font-semibold text-[#F4F4F0] mb-2">Automated Settlement</h4>
            <p className="text-xs text-[#8A918E] leading-relaxed">
              The resolution engine evaluates the condition against raw observations. Winning token holders burn their position to redeem 1 USDC per token.
            </p>
          </div>
        </div>
      </section>

      {/* Protocol Architecture Banner */}
      <section className="w-full bg-[#121514] border-y border-[#222725] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981]">
                <Cpu className="w-4 h-4" />
                <span>SOLANA ON-CHAIN INFRASTRUCTURE</span>
              </div>
              <h3 className="text-2xl font-bold text-[#F4F4F0]">
                Built on Solana Program PDA Architecture
              </h3>
              <p className="text-sm text-[#8A918E] leading-relaxed">
                The HedgeHouse Anchor program (`programs/hedgehouse`) implements rigorous account ownership constraints, signer checks, and state-machine transitions. Every invariant has been formally tested across 15 on-chain failure and success vectors.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  Isolated Collateral Vaults
                </span>
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  SPL Token Pairs (YES/NO)
                </span>
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  Strict Non-Reentrancy
                </span>
                <span className="px-2.5 py-1 rounded bg-[#161A18] border border-[#222725] text-[#8A918E]">
                  Devnet Target
                </span>
              </div>
            </div>

            <div className="bg-[#0B0D0C] border border-[#222725] rounded-lg p-5 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-[#8A918E] border-b border-[#222725] pb-2">
                <span>VERIFICATION CHECKLIST</span>
                <span className="text-[#10B981]">STATUS</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">1. Phase 0 Real Ingestion</span>
                  <span className="text-[#10B981]">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">2. Deterministic Resolver</span>
                  <span className="text-[#10B981]">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">3. 15 Anchor Invariants</span>
                  <span className="text-[#10B981]">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">4. Phase 2 Web UI</span>
                  <span className="text-[#10B981]">COMPLETE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A918E]">5. Devnet Cluster Deployment</span>
                  <span className="text-amber-400">PHASE 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
