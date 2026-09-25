'use client';

import React, { useState } from 'react';
import { ConnectWalletModal } from '../../components/ConnectWalletModal';
import { 
  Wallet, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Lock, 
  ArrowUpRight, 
  Coins, 
  Terminal,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3 mb-10">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981]">
          <Wallet className="w-3.5 h-3.5" />
          <span>POSITION PORTFOLIO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F4F0]">
          Protocol Positions & Collateral Vaults
        </h1>
        <p className="text-sm text-[#8A918E] font-mono leading-relaxed">
          Manage your SPL position tokens, monitor active market exposure, and redeem collateral payouts upon deterministic resolution.
        </p>
      </div>

      {/* Disconnected Shell State */}
      <div className="bg-[#121514] border border-[#222725] rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto mb-16 font-mono space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#161A18] border border-[#2B322F] flex items-center justify-center mx-auto text-[#10B981]">
          <Wallet className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#F4F4F0]">
            Solana Wallet Disconnected
          </h3>
          <p className="text-xs text-[#8A918E] max-w-md mx-auto leading-relaxed">
            Connect your Solana wallet to query your token accounts for active YES/NO position mints across all HedgeHouse market PDAs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] font-semibold text-xs rounded transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-[#10B981]/15"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Solana Wallet</span>
          </button>
          <Link
            href="/markets"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#161A18] hover:bg-[#1B201E] border border-[#2B322F] text-[#F4F4F0] text-xs rounded transition-colors text-center"
          >
            Browse Active Markets
          </Link>
        </div>

        <div className="pt-4 border-t border-[#1D2220] flex items-center justify-center space-x-2 text-[11px] text-[#565E5A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Solana Devnet Integration • Zero mainnet funds required</span>
        </div>
      </div>

      {/* Educational Architecture: How HedgeHouse Positions Work */}
      <div className="space-y-6">
        <div className="border-b border-[#222725] pb-3">
          <h3 className="text-lg font-bold text-[#F4F4F0]">
            On-Chain Token Mechanics
          </h3>
          <p className="text-xs font-mono text-[#8A918E]">
            How the HedgeHouse Anchor protocol represents risk positions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Card 1 */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-3">
            <div className="w-8 h-8 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center text-[#10B981]">
              <Coins className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-[#F4F4F0]">SPL Token Pairs</h4>
            <p className="text-[#8A918E] leading-relaxed">
              Every market initializes two dedicated SPL token mints: `yes_mint` and `no_mint`. When you deposit collateral, tokens are minted directly into your Associated Token Accounts (ATA).
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-3">
            <div className="w-8 h-8 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center text-[#10B981]">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-[#F4F4F0]">Isolated Vault PDA</h4>
            <p className="text-[#8A918E] leading-relaxed">
              Collateral is locked in an isolated Program Derived Address (PDA) owned strictly by the Anchor market contract. The protocol has 0% pooled cross-market contagion risk.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-3">
            <div className="w-8 h-8 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-[#F4F4F0]">Deterministic Redemption</h4>
            <p className="text-[#8A918E] leading-relaxed">
              Once the official index resolves the market outcome, holders of the winning token burn their balance to claim 1 USDC collateral per token directly from the vault.
            </p>
          </div>
        </div>
      </div>

      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
