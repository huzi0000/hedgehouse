import React from 'react';
import Link from 'next/link';
import { GitBranch, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#222725] bg-[#0B0D0C] text-[#8A918E] text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-[#10B981]">H</span>
              </div>
              <span className="font-bold tracking-wider text-[#F4F4F0]">HEDGEHOUSE</span>
            </div>
            <p className="text-xs text-[#8A918E] leading-relaxed max-w-sm">
              Global housing-risk markets on Solana. Synthetic macro hedging settling deterministically against official sovereign housing indices.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-[#F4F4F0] text-xs font-semibold uppercase tracking-wider">Protocol</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/markets" className="hover:text-[#F4F4F0] transition-colors">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/data" className="hover:text-[#F4F4F0] transition-colors">
                  Data Sources
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/huzi0000/hedgehouse" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#F4F4F0] flex items-center space-x-1.5 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Network & Status */}
          <div className="space-y-2">
            <div className="text-[#F4F4F0] text-xs font-semibold uppercase tracking-wider">Deployment Target</div>
            <div className="p-3 bg-[#121514] border border-[#222725] rounded space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#565E5A]">Network:</span>
                <span className="text-[#F4F4F0] font-semibold">SOLANA / MAINNET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#565E5A]">Protocol Status:</span>
                <span className="text-amber-400 font-semibold">AWAITING MAINNET DEPLOYMENT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Honest Status Notice */}
        <div className="border-t border-[#1D2220] pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-[#565E5A]">
          <p className="max-w-2xl leading-relaxed">
            Official housing data is live. HedgeHouse market execution activates after protocol deployment. Settlement outcomes evaluate deterministically against raw statistical tables published by sovereign bureaus.
          </p>
          <div className="flex items-center space-x-4 shrink-0">
            <a 
              href="https://github.com/huzi0000/hedgehouse" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#8A918E] hover:text-[#F4F4F0] flex items-center space-x-1"
            >
              <span>github.com/huzi0000/hedgehouse</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
