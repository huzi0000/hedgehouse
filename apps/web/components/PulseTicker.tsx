import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getRegionVerification } from '../lib/housing/cache';

interface PulseCityConfig {
  key: string;
  city: string;
  country: string;
  marketId: string;
  unit: string;
}

const CITIES: PulseCityConfig[] = [
  {
    key: 'miami',
    city: 'Miami',
    country: 'USA',
    marketId: 'miami-fhfa-2027q2-decline',
    unit: 'pts',
  },
  {
    key: 'london',
    city: 'London',
    country: 'UK',
    marketId: 'london-ukhpi-202707-growth',
    unit: 'pts',
  },
  {
    key: 'singapore',
    city: 'Singapore',
    country: 'SG',
    marketId: 'singapore-ura-2027q2-rise-2pct',
    unit: 'pts',
  },
  {
    key: 'sydney',
    city: 'Sydney',
    country: 'AU',
    marketId: 'sydney-abs-2027q2-exceed-1500k',
    unit: 'AUD',
  },
];

export function PulseTicker() {
  const items = CITIES.map((c) => {
    const verif = getRegionVerification(c.key);
    return {
      ...c,
      provider: verif?.provider || 'Official',
      latestPeriod: verif?.latestPeriod || 'Latest',
      latestValue: verif
        ? c.unit === 'AUD'
          ? `A$${verif.latestValue.toLocaleString()}`
          : `${verif.latestValue.toLocaleString()} pts`
        : 'Unavailable',
      change: verif?.calculatedChange ?? null,
    };
  });

  return (
    <div className="w-full border-y border-[#222725] bg-[#0E1110] overflow-x-auto py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] text-xs font-mono">
        <div className="flex items-center space-x-2 text-[#10B981] pr-4 border-r border-[#222725] shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold text-[11px] tracking-wider uppercase">Official Index Data</span>
        </div>

        <div className="flex items-center justify-between w-full pl-6 space-x-6">
          {items.map((item) => (
            <Link
              key={item.city}
              href={`/market/${item.marketId}`}
              className="flex items-center space-x-3 group hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center space-x-1.5">
                <span className="text-[#F4F4F0] font-medium">{item.city}</span>
                <span className="text-[10px] text-[#565E5A] px-1 py-0.5 rounded bg-[#161A18] border border-[#222725]">
                  {item.provider}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[#8A918E] font-tabular">{item.latestValue}</span>
                <span className="text-[10px] text-[#565E5A]">({item.latestPeriod})</span>
              </div>

              {typeof item.change === 'number' && (
                <div
                  className={`flex items-center space-x-0.5 text-[11px] font-semibold font-tabular ${
                    item.change >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
                  }`}
                >
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{item.change >= 0 ? `+${item.change}%` : `${item.change}%`}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
