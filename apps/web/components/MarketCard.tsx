import React from 'react';
import Link from 'next/link';
import { MarketItem } from '../lib/housing/types';
import { ArrowUpRight, Database } from 'lucide-react';

interface MarketCardProps {
  market: MarketItem;
}

export function MarketCard({ market }: MarketCardProps) {
  return (
    <Link
      href={`/market/${market.id}`}
      className="group block p-5 rounded-lg bg-[#121514] border border-[#222725] hover:border-[#10B981]/40 hover:bg-[#151917] transition-all relative overflow-hidden font-mono"
    >
      {/* Top Meta Line: City & Coordinates + Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#F4F4F0] uppercase tracking-wider">
            {market.city}
          </span>
          <span className="text-[10px] text-[#565E5A]">
            {market.coordinates}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${market.status === 'TESTNET ACTIVE' || market.status === 'DEVNET ACTIVE' ? 'bg-[#10B981]' : 'bg-amber-400'}`} />
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
            market.status === 'TESTNET ACTIVE' || market.status === 'DEVNET ACTIVE'
              ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20'
              : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
          }`}>
            {market.status}
          </span>
        </div>
      </div>

      {/* Main Question / Market Title */}
      <h3 className="text-sm sm:text-base font-semibold text-[#F4F4F0] group-hover:text-white mb-4 line-clamp-2 leading-snug">
        {market.title}
      </h3>

      {/* Baseline & Rule Grid */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[#161A18] border border-[#222725] mb-4 text-xs">
        <div>
          <span className="text-[10px] text-[#565E5A] block uppercase">Official Baseline</span>
          <span className="text-[#F4F4F0] font-semibold font-tabular">
            {typeof market.baselineValue === 'number' && market.baselineValue > 10000
              ? `A$${market.baselineValue.toLocaleString()}`
              : market.baselineValue}
          </span>
          <span className="text-[10px] text-[#8A918E] block">({market.baselinePeriod})</span>
        </div>
        <div>
          <span className="text-[10px] text-[#565E5A] block uppercase">Target Period</span>
          <span className="text-[#10B981] font-semibold">
            {market.targetPeriod}
          </span>
          <span className="text-[10px] text-[#8A918E] block truncate">{market.ruleFormula}</span>
        </div>
      </div>

      {/* Footer Info: Provider & Resolution Date */}
      <div className="flex items-center justify-between text-[11px] text-[#8A918E] pt-2 border-t border-[#1D2220]">
        <div className="flex items-center space-x-1.5">
          <Database className="w-3 h-3 text-[#565E5A]" />
          <span className="text-[#8A918E]">{market.provider} Official Dataset</span>
        </div>
        <div className="flex items-center space-x-1 group-hover:text-[#10B981] transition-colors">
          <span>View Market Specification</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
