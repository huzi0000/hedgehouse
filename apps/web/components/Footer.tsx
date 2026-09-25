import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GitBranch, Terminal, Globe, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#222725] bg-[#0B0D0C] text-[#8A918E] text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-[#10B981]">H</span>
              </div>
              <span className="font-semibold tracking-wider text-[#F4F4F0]">HEDGEHOUSE PROTOCOL</span>
            </div>
            <p className="text-xs text-[#8A918E] leading-relaxed max-w-md">
              A decentralized risk-transfer protocol on Solana providing non-custodial synthetic hedging against metropolitan real estate volatility, settling deterministically on official public indices.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#565E5A]">
              <span>CLUSTER: SOLANA LOCAL/DEVNET</span>
              <span>•</span>
              <span>VERIFIED PROVIDERS: 4</span>
              <span>•</span>
              <span>INVARIANTS: 15/15 PASS</span>
            </div>
          </div>

          {/* Protocol Architecture */}
          <div className="space-y-2.5">
            <div className="text-[#F4F4F0] text-xs font-semibold uppercase tracking-wider">Protocol Pipeline</div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center space-x-1.5 text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 0: Multi-Gov Data (Pass)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 1: Anchor Invariants (Pass)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-[#10B981]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 2: Terminal Interface (Live)</span>
              </li>
              <li className="flex items-center space-x-1.5 text-[#8A918E]">
                <span className="w-3.5 h-3.5 inline-block text-center">•</span>
                <span>Phase 3: Solana Devnet Engine</span>
              </li>
            </ul>
          </div>

          {/* Official Indices */}
          <div className="space-y-2.5">
            <div className="text-[#F4F4F0] text-xs font-semibold uppercase tracking-wider">Verified Indices</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="https://www.fhfa.gov/data/hpi" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4F4F0] flex items-center justify-between">
                  <span>US: FHFA MSA Index</span>
                  <ExternalLink className="w-3 h-3 text-[#565E5A]" />
                </a>
              </li>
              <li>
                <a href="https://landregistry.data.gov.uk" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4F4F0] flex items-center justify-between">
                  <span>UK: HM Land Registry HPI</span>
                  <ExternalLink className="w-3 h-3 text-[#565E5A]" />
                </a>
              </li>
              <li>
                <a href="https://data.gov.sg" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4F4F0] flex items-center justify-between">
                  <span>SG: URA Property Index</span>
                  <ExternalLink className="w-3 h-3 text-[#565E5A]" />
                </a>
              </li>
              <li>
                <a href="https://www.abs.gov.au" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4F4F0] flex items-center justify-between">
                  <span>AU: ABS Cat 6432.0 Dwellings</span>
                  <ExternalLink className="w-3 h-3 text-[#565E5A]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Disclaimer Banner */}
        <div className="border-t border-[#222725] pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-[#565E5A]">
          <p className="max-w-3xl leading-relaxed">
            RESEARCH PROTOTYPE DISCLAIMER: HedgeHouse is developed for empirical evaluation and protocol verification purposes on Solana Devnet. Markets do not trade real-money assets and are not open to retail speculation. Settlement outcomes are computed purely deterministically against raw statistical tables published by sovereign statistical bureaus.
          </p>
          <div className="flex items-center space-x-4 shrink-0">
            <a 
              href="https://github.com/huzi0000/hedgehouse" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#8A918E] hover:text-[#F4F4F0] flex items-center space-x-1"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
