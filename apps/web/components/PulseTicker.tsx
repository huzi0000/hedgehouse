import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ShieldCheck, Activity } from 'lucide-react';

interface PulseItem {
  city: string;
  country: string;
  provider: string;
  period: string;
  value: string;
  change: string;
  isPositive: boolean;
  marketId: string;
}

const PULSE_DATA: PulseItem[] = [
  {
    city: 'Miami',
    country: 'USA',
    provider: 'FHFA',
    period: '2026-Q2',
    value: '666.21',
    change: '-0.65%',
    isPositive: false,
    marketId: 'mia-fhfa-2027q2-lt-2026q2',
  },
  {
    city: 'London',
    country: 'UK',
    provider: 'UKHPI',
    period: '2026-07',
    value: '96.4 pts',
    change: '-0.10%',
    isPositive: false,
    marketId: 'ldn-ukhpi-202707-gt-3pct',
  },
  {
    city: 'Singapore',
    country: 'SG',
    provider: 'URA',
    period: '2026-Q2',
    value: '219.4 pts',
    change: '+0.50%',
    isPositive: true,
    marketId: 'sg-ura-2027q2-lt-2026q2',
  },
  {
    city: 'Sydney',
    country: 'AU',
    provider: 'ABS',
    period: '2026-Q2',
    value: 'A$1,487,600',
    change: '-4.03%',
    isPositive: false,
    marketId: 'syd-abs-2027q2-lt-1450k',
  },
];

export function PulseTicker() {
  return (
    <div className="w-full border-y border-[#222725] bg-[#0E1110] overflow-x-auto py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] text-xs font-mono">
        <div className="flex items-center space-x-2 text-[#10B981] pr-4 border-r border-[#222725] shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold text-[11px] tracking-wider uppercase">Live Housing Pulse</span>
        </div>

        <div className="flex items-center justify-between w-full pl-6 space-x-6">
          {PULSE_DATA.map((item) => (
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
                <span className="text-[#8A918E] font-tabular">{item.value}</span>
                <span className="text-[10px] text-[#565E5A]">({item.period})</span>
              </div>

              <div
                className={`flex items-center space-x-0.5 text-[11px] font-semibold ${
                  item.isPositive ? 'text-[#10B981]' : 'text-[#F43F5E]'
                }`}
              >
                {item.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{item.change}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
