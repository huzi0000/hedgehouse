'use client';

import React, { useState, useMemo } from 'react';
import { MARKETS_DATA } from '../../lib/housing/markets';
import { MarketCard } from '../../components/MarketCard';
import { Search, Filter, Globe, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');

  const filteredMarkets = useMemo(() => {
    return MARKETS_DATA.filter((market) => {
      const matchesSearch =
        market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.provider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry =
        selectedCountry === 'ALL' || market.countryCode === selectedCountry;

      const matchesProvider =
        selectedProvider === 'ALL' || market.provider === selectedProvider;

      return matchesSearch && matchesCountry && matchesProvider;
    });
  }, [searchQuery, selectedCountry, selectedProvider]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981] mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>DISCOVERY ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F4F0]">
            Housing-Risk Benchmark Contracts
          </h1>
          <p className="text-xs sm:text-sm text-[#8A918E] mt-1 font-mono">
            Directly referenced to sovereign statistical datasets • Devnet contracts
          </p>
        </div>

        <div className="text-xs font-mono text-[#8A918E] bg-[#161A18] border border-[#222725] px-3 py-1.5 rounded self-start md:self-auto">
          AVAILABLE CONTRACTS: <span className="text-[#10B981] font-semibold">{filteredMarkets.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121514] border border-[#222725] rounded-lg p-4 mb-8 space-y-4 font-mono">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#565E5A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, ticker, or provider (e.g. Miami, UKHPI, URA)..."
              className="w-full bg-[#161A18] border border-[#222725] rounded pl-9 pr-4 py-2 text-xs text-[#F4F4F0] placeholder-[#565E5A] focus:outline-none focus:border-[#10B981]/50"
            />
          </div>

          {/* Country Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'ALL', label: 'All Regions' },
              { id: 'US', label: 'United States' },
              { id: 'GB', label: 'United Kingdom' },
              { id: 'SG', label: 'Singapore' },
              { id: 'AU', label: 'Australia' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCountry(tab.id)}
                className={`px-3 py-2 text-xs rounded transition-colors ${
                  selectedCountry === tab.id
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold'
                    : 'bg-[#161A18] text-[#8A918E] hover:text-[#F4F4F0] border border-[#222725]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter: Provider */}
        <div className="flex items-center space-x-2 pt-2 border-t border-[#1D2220] text-xs">
          <span className="text-[#565E5A]">Filter Provider:</span>
          {['ALL', 'FHFA', 'UKHPI', 'URA', 'ABS'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                selectedProvider === p
                  ? 'text-[#10B981] bg-[#10B981]/10 font-medium'
                  : 'text-[#8A918E] hover:text-[#F4F4F0]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="bg-[#121514] border border-[#222725] rounded-lg p-12 text-center font-mono">
          <div className="text-sm text-[#8A918E] mb-2">No benchmark markets match your query</div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('ALL');
              setSelectedProvider('ALL');
            }}
            className="text-xs text-[#10B981] underline hover:opacity-80"
          >
            Reset search filters
          </button>
        </div>
      )}
    </div>
  );
}
