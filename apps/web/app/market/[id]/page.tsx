'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMarketById } from '../../../lib/housing/markets';
import { IndexChart } from '../../../components/IndexChart';
import { DevnetMarketTradingPanel } from '../../../components/DevnetMarketTradingPanel';
import { 
  ArrowLeft, 
  ExternalLink, 
  Database,
  Building,
  CheckCircle2,
  FileCode2,
  Clock,
  ShieldCheck,
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

  // Position visual selector state
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO'>('YES');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-mono">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-[#8A918E] mb-6">
        <Link href="/markets" className="hover:text-[#F4F4F0] flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Markets</span>
        </Link>
        <span className="text-[#565E5A]">/</span>
        <span className="text-[#8A918E]">{market.country}</span>
        <span className="text-[#565E5A]">/</span>
        <span className="text-[#F4F4F0] font-semibold">{market.city}</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 pb-6 border-b border-[#222725]">
        <div className="space-y-3 max-w-3xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4F4F0] bg-[#161A18] px-2.5 py-0.5 rounded border border-[#2B322F]">
              {market.city}
            </span>
            <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
              {market.provider}
            </span>
            <span className="text-xs text-[#8A918E] bg-[#161A18] px-2 py-0.5 rounded border border-[#222725] uppercase">
              {market.frequency}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
              market.status === 'TESTNET ACTIVE' || market.status === 'DEVNET ACTIVE'
                ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20'
                : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
            }`}>
              {market.status}
            </span>
          </div>

          {/* Market Question */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F4F4F0] leading-tight font-sans">
            {market.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed max-w-2xl font-sans">
            {market.description}
          </p>
        </div>

        {/* Quick Contract Metadata Snapshot */}
        <div className="bg-[#121514] border border-[#222725] rounded-lg p-4 text-xs space-y-2.5 shrink-0 lg:w-80">
          <div className="text-[10px] text-[#565E5A] uppercase tracking-wider pb-1.5 border-b border-[#222725]">
            Official Specification
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Target Period:</span>
            <span className="text-[#10B981] font-semibold">{market.targetPeriod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Official Source:</span>
            <span className="text-[#F4F4F0]">{market.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Series Identifier:</span>
            <span className="text-[#8A918E] truncate max-w-[150px]">{market.seriesName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A918E]">Latest Publication:</span>
            <span className="text-[#F4F4F0]">{market.baselinePeriod}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-[#1D2220]">
            <span className="text-[#565E5A]">Estimated Resolution:</span>
            <span className="text-[#8A918E]">{market.resolutionDate}</span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Chart & Resolution Rule) + Right Column (Position Panel & Verification) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Real Underlying Housing Chart */}
          <IndexChart
            series={market.historicalSeries}
            unit={market.unit}
            baselinePeriod={market.baselinePeriod}
            baselineValue={market.baselineValue}
            targetPeriod={market.targetPeriod}
          />

          {/* Resolution Rule Module */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-xs font-bold text-[#F4F4F0] uppercase tracking-wider">
                  RESOLUTION RULE
                </h3>
              </div>
              <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                DETERMINISTIC EVALUATION
              </span>
            </div>

            {/* Structured YES IF / OTHERWISE NO Rule */}
            <div className="space-y-3">
              <div className="bg-[#161A18] border border-[#222725] rounded p-4 space-y-1">
                <span className="text-[10px] text-[#10B981] font-bold tracking-wider uppercase block">
                  YES IF
                </span>
                <p className="text-sm font-semibold text-[#F4F4F0] leading-snug">
                  {market.provider} {market.city} index at <span className="text-[#10B981]">{market.targetPeriod}</span>{' '}
                  {market.condition === 'TARGET_LT_BASELINE' && 'is lower than baseline level'}
                  {market.condition === 'TARGET_GT_BASELINE' && 'exceeds threshold level'}
                  {market.condition === 'YOY_CHANGE_GT' && 'reflects positive YoY growth strictly greater than'}
                  {market.condition === 'YOY_CHANGE_LT' && 'reflects YoY decline strictly below'}{' '}
                  <span className="text-[#F4F4F0] underline decoration-[#10B981]/50 underline-offset-4">
                    {market.targetThreshold !== undefined
                      ? `${market.targetThreshold}%`
                      : typeof market.baselineValue === 'number' && market.baselineValue > 10000
                      ? `A$${market.baselineValue.toLocaleString()}`
                      : `${market.baselineValue} (${market.baselinePeriod})`}
                  </span>
                </p>
              </div>

              <div className="bg-[#161A18] border border-[#222725] rounded p-4 space-y-1">
                <span className="text-[10px] text-[#F43F5E] font-bold tracking-wider uppercase block">
                  OTHERWISE
                </span>
                <p className="text-sm font-semibold text-[#F4F4F0]">
                  NO
                </p>
              </div>
            </div>

            {/* Technical Rule Specification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#0B0D0C] border border-[#222725] rounded text-xs">
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Official Provider:</span>
                <span className="text-[#F4F4F0] font-medium">{market.providerFullName}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Dataset:</span>
                <span className="text-[#F4F4F0] truncate block">{market.seriesName}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Region / Jurisdiction:</span>
                <span className="text-[#F4F4F0]">{market.city}, {market.country}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Publication Frequency:</span>
                <span className="text-[#F4F4F0] capitalize">{market.frequency}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Target Period:</span>
                <span className="text-[#10B981] font-semibold">{market.targetPeriod}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Resolution Method:</span>
                <span className="text-[#F4F4F0]">Deterministic Mathematical Assertion</span>
              </div>
            </div>
          </div>

          {/* Regional Housing Context */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-2 text-xs">
            <span className="text-[10px] text-[#565E5A] uppercase tracking-wider block">
              Regional Housing Dynamics
            </span>
            <p className="text-[#8A918E] leading-relaxed font-sans">
              {market.economicContext}
            </p>
          </div>
        </div>

        {/* Right Column (YES/NO Position Panel + Source Verification) */}
        <div className="space-y-6">
          {/* YES / NO Position Panel */}
          <DevnetMarketTradingPanel marketId={market.id} />

          {/* Source / Verification Panel */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
              <span className="text-xs font-bold text-[#F4F4F0] uppercase tracking-wider">
                SOURCE &amp; VERIFICATION
              </span>
              <span className="flex items-center space-x-1 text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px]">OFFICIAL</span>
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Official Provider:</span>
                <span className="text-[#F4F4F0] font-medium">{market.providerFullName}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Dataset Series:</span>
                <span className="text-[#8A918E]">{market.seriesName}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Latest Published Period:</span>
                <span className="text-[#10B981] font-semibold">{market.baselinePeriod}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Latest Observation:</span>
                <span className="text-[#F4F4F0] font-tabular">
                  {typeof market.baselineValue === 'number' && market.baselineValue > 10000
                    ? `A$${market.baselineValue.toLocaleString()}`
                    : market.baselineValue}
                </span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Update Frequency:</span>
                <span className="text-[#8A918E] capitalize">{market.frequency}</span>
              </div>
              <div>
                <span className="text-[#565E5A] block text-[10px] uppercase">Resolution Methodology:</span>
                <span className="text-[#8A918E]">Predefined deterministic evaluation</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1D2220]">
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
