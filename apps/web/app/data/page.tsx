import React from 'react';
import { OFFICIAL_PROVIDERS } from '../../lib/housing/providers';
import { SchemaVisualizer } from '../../components/SchemaVisualizer';
import { 
  Database, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  FileText, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function DataCredibilityPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981]">
          <Database className="w-3.5 h-3.5" />
          <span>DATA CREDIBILITY ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F4F0]">
          Sovereign Statistical Registries
        </h1>
        <p className="text-sm text-[#8A918E] leading-relaxed font-mono">
          HedgeHouse does not rely on opaque third-party oracles, web-scraped real estate portals, or subjective crowd consensus. All protocol contracts resolve exclusively against official national statistical datasets.
        </p>
      </div>

      {/* Schema Transformer Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#F4F4F0]">
              Unified Schema Normalization
            </h3>
            <p className="text-xs font-mono text-[#8A918E]">
              Phase 0 ingests 4 fundamentally distinct data structures into one deterministic schema
            </p>
          </div>
          <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/20 hidden sm:inline-block">
            STRICT TYPE SAFETY
          </span>
        </div>

        <SchemaVisualizer />
      </div>

      {/* 4 Sovereign Provider Profiles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#222725] pb-3">
          <h3 className="text-lg font-bold text-[#F4F4F0]">
            Verified Government Providers
          </h3>
          <span className="text-xs font-mono text-[#8A918E]">
            ALL 4 SOURCES VERIFIED IN PHASE 0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFICIAL_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="bg-[#121514] border border-[#222725] rounded-lg p-6 font-mono space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#222725]">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                      {provider.id}
                    </span>
                    <span className="text-xs text-[#8A918E]">{provider.country}</span>
                  </div>
                  <h4 className="text-base font-semibold text-[#F4F4F0]">{provider.name}</h4>
                </div>
                <div className="flex items-center space-x-1 text-[#10B981] text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#8A918E] leading-relaxed">
                {provider.description}
              </p>

              {/* Metadata Grid */}
              <div className="bg-[#161A18] border border-[#222725] rounded p-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#565E5A]">Jurisdiction:</span>
                  <span className="text-[#F4F4F0] text-right">{provider.jurisdiction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565E5A]">Frequency:</span>
                  <span className="text-[#F4F4F0] capitalize">{provider.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565E5A]">Publication Schedule:</span>
                  <span className="text-[#8A918E] text-right">{provider.publicationLag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565E5A]">Historical Depth:</span>
                  <span className="text-[#F4F4F0] text-right">{provider.historicalDepth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565E5A]">License / Rights:</span>
                  <span className="text-[#8A918E] text-right">{provider.license}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#222725]">
                  <span className="text-[#565E5A]">Latest Verified Period:</span>
                  <span className="text-[#10B981] font-semibold">{provider.latestPeriod} ({provider.latestValue})</span>
                </div>
              </div>

              {/* Endpoint Link */}
              <div className="pt-2">
                <a
                  href={provider.endpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8A918E] hover:text-[#10B981] flex items-center justify-between transition-colors"
                >
                  <span className="truncate pr-2">Endpoint: {provider.datasetName}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Determinism vs Subjectivity Comparison */}
      <div className="bg-[#121514] border border-[#222725] rounded-lg p-6 sm:p-8 font-mono space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs text-[#10B981] uppercase tracking-wider block">
            System Design Principle
          </span>
          <h3 className="text-xl font-bold text-[#F4F4F0]">
            Deterministic Resolution vs Subjective Prediction Markets
          </h3>
          <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed">
            Conventional prediction platforms rely on token-weighted voting, subjective multi-sig judges, or ambiguous wording disputes. HedgeHouse is built strictly as financial infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded bg-[#161A18] border border-[#222725] space-y-3">
            <div className="text-amber-400 font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Generic Social Prediction Markets</span>
            </div>
            <ul className="space-y-2 text-[#8A918E]">
              <li>• Disputed settlements decided by subjective community committees</li>
              <li>• Susceptible to economic attacks and oracle bribery</li>
              <li>• Ill-defined resolution timestamps and news source conflicts</li>
              <li>• High frictional fees and uncertain collateral safety</li>
            </ul>
          </div>

          <div className="p-4 rounded bg-[#161A18] border border-[#10B981]/30 space-y-3">
            <div className="text-[#10B981] font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>HedgeHouse Protocol Engine</span>
            </div>
            <ul className="space-y-2 text-[#F4F4F0]">
              <li>• 100% deterministic mathematical evaluation against raw numbers</li>
              <li>• Anchored exclusively to legal statutory government releases</li>
              <li>• Exact period mapping (e.g. Q2 2026 vs Q2 2027)</li>
              <li>• Automated verification bridge refuses premature or missing data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
