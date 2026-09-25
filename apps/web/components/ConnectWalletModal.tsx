'use client';

import React from 'react';
import { X, ShieldAlert, Cpu, Terminal, ExternalLink } from 'lucide-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#121514] border border-[#2B322F] rounded-lg shadow-2xl p-6 relative text-[#F4F4F0] font-mono"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8A918E] hover:text-[#F4F4F0] p-1 rounded transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F4F4F0]">Connect Solana Wallet</h3>
            <p className="text-[11px] text-[#8A918E]">TARGET CLUSTER: SOLANA MAINNET</p>
          </div>
        </div>

        <div className="bg-[#161A18] border border-[#222725] rounded p-4 mb-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-[#10B981]">
            <Terminal className="w-3.5 h-3.5" />
            <span className="font-semibold">AWAITING PROTOCOL DEPLOYMENT</span>
          </div>
          <p className="text-xs text-[#8A918E] leading-relaxed">
            HedgeHouse official housing-data pipelines are live. On-chain market collateral vaults and YES/NO SPL token minting will activate upon Solana Mainnet protocol deployment.
          </p>
        </div>

        <div className="space-y-2.5 mb-6">
          <div className="p-3 rounded border border-[#222725] bg-[#161A18]/60 flex items-center justify-between">
            <span className="text-xs font-medium text-[#F4F4F0]">Phantom</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#222725] text-[#8A918E]">Mainnet Adapter</span>
          </div>
          <div className="p-3 rounded border border-[#222725] bg-[#161A18]/60 flex items-center justify-between">
            <span className="text-xs font-medium text-[#F4F4F0]">Solflare</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#222725] text-[#8A918E]">Mainnet Adapter</span>
          </div>
          <div className="p-3 rounded border border-[#222725] bg-[#161A18]/60 flex items-center justify-between">
            <span className="text-xs font-medium text-[#F4F4F0]">Backpack</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#222725] text-[#8A918E]">Mainnet Adapter</span>
          </div>
        </div>

        <div className="border-t border-[#222725] pt-4 flex items-center justify-between text-xs text-[#8A918E]">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Non-custodial architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#222725] hover:bg-[#2B322F] text-[#F4F4F0] rounded font-medium text-xs transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
