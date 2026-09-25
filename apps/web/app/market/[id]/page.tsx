'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMarketById } from '../../../lib/housing/markets';
import { IndexChart } from '../../../components/IndexChart';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink, 
  Info, 
  Cpu, 
  Lock, 
  Calendar, 
  Database,
  Building,
  CheckCircle2,
  FileCode2,
  AlertCircle
} from 'lucide-react';

interface MarketDetailPageProps {
  params: {
    id: string;
  };
}

export default function MarketDetailPage({ params }: MarketDetailPageProps) {
  const market = getMarketById(params.id);

  if (!market) {
    notFound();
  }

  // Position Simulator state
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');
  const [collateralAmount, setCollateralAmount] = useState<string>('100');

  const amountNum = parseFloat(collateralAmount) || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Back */}
      <div className="flex items-center space-x-2 text-xs font-mono text-[#8A918E] mb-6">
        <Link href="/markets" className="hover:text-[#F4F4F0] flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Markets</span>
        </Link>
        <span>/</span>
        <span className="text-[#565E5A]">{market.city}</span>
        <span>/</span>
        <span className="text-[#F4F4F0]">{market.ticker}</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 pb-6 border-b border-[#222725]">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded border border-[#10B981]/20">
              {market.status}
            </span>
            <span className="text-xs font-mono text-[#8A918E] bg-[#161A18] px-2 py-0.5 rounded border border-[#222725]">
              {market.ticker}
            </span>
            <span className="text-xs font-mono text-[#565E5A]">
              COORDINATES: {market.coordinates}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F4F0] leading-tight">
            {market.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed">
            {market.description}
          </p>
        </div>

        {/* Quick Contract Snapshot */}
        <div className="bg-[#121514] border border-[#222725] rounded-lg p-4 font-mono text-xs space-y-2 shrink-0 lg:w-72">
          <div className="text-[10px] text-[#565E5A] uppercase tracking-wider pb-1 border-b border-[#222725]">
            Contract Specification
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Baseline Benchmark:</span>
            <span className="text-[#F4F4F0] font-semibold">
              {typeof market.baselineValue === 'number' && market.baselineValue > 10000
                ? `A$${market.baselineValue.toLocaleString()}`
                : market.baselineValue}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Baseline Period:</span>
            <span className="text-[#F4F4F0]">{market.baselinePeriod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Target Observation:</span>
            <span className="text-[#10B981] font-semibold">{market.targetPeriod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Estimated Settlement:</span>
            <span className="text-[#F4F4F0]">{market.resolutionDate}</span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Chart & Specs) + Right Column (Position Panel & Sources) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Historical SVG Line Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold font-mono text-[#F4F4F0] flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#10B981]" />
                <span>Historical Observation Trend</span>
              </h3>
              <span className="text-xs font-mono text-[#8A918E]">
                Frequency: <span className="text-[#F4F4F0] capitalize">{market.frequency}</span>
              </span>
            </div>
            <IndexChart
              series={market.historicalSeries}
              unit={market.unit}
              baselinePeriod={market.baselinePeriod}
              baselineValue={market.baselineValue}
            />
          </div>

          {/* Mathematical Resolution Rule Module */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 font-mono space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-xs font-semibold text-[#F4F4F0] uppercase tracking-wider">
                  Deterministic Resolution Rule
                </h4>
              </div>
              <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                STRICT ALGORITHMIC EVALUATION
              </span>
            </div>

            <div className="bg-[#0B0D0C] border border-[#222725] p-3 rounded text-xs space-y-2">
              <div className="text-[10px] text-[#565E5A] uppercase">Exact Mathematical Formula</div>
              <div className="text-[#10B981] font-bold text-sm tracking-wide">
                {market.ruleFormula}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Rule Type</span>
                <span className="text-[#F4F4F0] font-semibold">{market.condition}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Resolution Source Series</span>
                <span className="text-[#F4F4F0]">{market.seriesName}</span>
              </div>
            </div>

            <p className="text-xs text-[#8A918E] leading-relaxed pt-2 border-t border-[#1D2220]">
              When the statistical bureau publishes the final bulletin for {market.targetPeriod}, the automated resolution bridge loads the official normalized record. If the condition holds true, the on-chain Anchor state settles to <strong className="text-[#10B981]">YES</strong>. Otherwise, it settles to <strong className="text-[#F43F5E]">NO</strong>.
            </p>
          </div>

          {/* Economic Context */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 text-xs font-mono space-y-2">
            <span className="text-[10px] text-[#565E5A] uppercase tracking-wider block">
              Metropolitan Risk Dynamics
            </span>
            <p className="text-[#8A918E] leading-relaxed">
              {market.economicContext}
            </p>
          </div>
        </div>

        {/* Right Column (Position Simulator + Data Verification) */}
        <div className="space-y-6">
          {/* Position Simulator / Order Panel */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 font-mono space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
              <span className="text-xs font-semibold text-[#F4F4F0] uppercase tracking-wider">
                Position Simulator
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                PHASE 3 DEVNET
              </span>
            </div>

            {/* Side Selector (YES / NO) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedSide('YES')}
                className={`py-2 px-3 rounded text-xs font-semibold transition-all border ${
                  selectedSide === 'YES'
                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                    : 'bg-[#161A18] border-[#222725] text-[#8A918E] hover:text-[#F4F4F0]'
                }`}
              >
                YES (Payout if True)
              </button>
              <button
                onClick={() => setSelectedSide('NO')}
                className={`py-2 px-3 rounded text-xs font-semibold transition-all border ${
                  selectedSide === 'NO'
                    ? 'bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E]'
                    : 'bg-[#161A18] border-[#222725] text-[#8A918E] hover:text-[#F4F4F0]'
                }`}
              >
                NO (Payout if False)
              </button>
            </div>

            {/* Collateral Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#8A918E]">
                <span>Collateral Amount:</span>
                <span>USDC (SPL Vault)</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="w-full bg-[#161A18] border border-[#222725] rounded px-3 py-2 text-sm text-[#F4F4F0] font-tabular focus:outline-none focus:border-[#10B981]/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#565E5A]">
                  USDC
                </span>
              </div>
            </div>

            {/* Matched-Pair Math Breakdown */}
            <div className="bg-[#161A18] border border-[#222725] rounded p-3 text-xs space-y-2">
              <div className="text-[10px] text-[#565E5A] uppercase">Matched-Pair Collateral Model</div>
              <div className="flex justify-between text-[#8A918E]">
                <span>Collateral Deposited:</span>
                <span className="text-[#F4F4F0] font-tabular">{amountNum.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-[#8A918E]">
                <span>Tokens Minted:</span>
                <span className="text-[#10B981] font-tabular">
                  {amountNum} YES + {amountNum} NO
                </span>
              </div>
              <div className="flex justify-between text-[#8A918E] pt-1 border-t border-[#222725]">
                <span>Winning Payout:</span>
                <span className="text-[#F4F4F0] font-tabular font-semibold">
                  1.00 USDC / token
                </span>
              </div>
            </div>

            {/* Disabled Action Button with Devnet Explanation */}
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-2.5 px-4 rounded bg-[#1B201E] border border-[#2B322F] text-xs text-[#8A918E] font-medium cursor-not-allowed opacity-80"
              >
                Deposit Collateral (Devnet — Phase 3)
              </button>
              <div className="flex items-center space-x-1.5 text-[11px] text-[#565E5A]">
                <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>On-chain SPL minting will activate during Phase 3 Devnet cluster launch.</span>
              </div>
            </div>
          </div>

          {/* Official Source & Verification Card */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 font-mono space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
              <span className="text-xs font-semibold text-[#F4F4F0] uppercase tracking-wider">
                Official Bureau Verification
              </span>
              <span className="flex items-center space-x-1 text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px]">VERIFIED</span>
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Publishing Agency</span>
                <span className="text-[#F4F4F0] font-medium">{market.providerFullName}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Jurisdiction</span>
                <span className="text-[#8A918E]">{market.country}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Phase 0 Ingestion Status</span>
                <span className="text-[#10B981]">Direct API / Stream Verified</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1D2220]">
              <a
                href={market.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-[#8A918E] hover:text-[#10B981] transition-colors"
              >
                <span>Visit Sovereign Statistical Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
