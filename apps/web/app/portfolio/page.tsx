'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  Wallet, 
  ShieldCheck, 
  Coins, 
  Lock, 
  Cpu, 
  Terminal, 
  Info,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ArrowRightLeft
} from 'lucide-react';
import Link from 'next/link';
import { 
  fetchUserBalances, 
  UserBalances, 
  TESTNET_MARKETS_SPEC,
  MarketSpec,
  getExplorerAddressUrl 
} from '../../lib/solana/protocol';

export default function PortfolioPage() {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const [balances, setBalances] = useState<UserBalances | null>(null);
  const [positions, setPositions] = useState<{ spec: MarketSpec; balances: UserBalances }[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadBalances = async () => {
    if (!connected || !publicKey || !connection) {
      setBalances(null);
      setPositions([]);
      return;
    }

    setIsLoadingBalance(true);
    try {
      const activePositions: { spec: MarketSpec; balances: UserBalances }[] = [];
      let walletBal: UserBalances | null = null;

      for (const spec of Object.values(TESTNET_MARKETS_SPEC)) {
        const b = await fetchUserBalances(connection, publicKey, spec);
        if (!walletBal) walletBal = b;
        if (b.yesTokens > 0 || b.noTokens > 0) {
          activePositions.push({ spec, balances: b });
        }
      }

      setBalances(walletBal);
      setPositions(activePositions);
    } catch (err) {
      console.error('Failed to fetch on-chain balances:', err);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [connected, publicKey, connection]);

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasPosition = balances && (balances.yesTokens > 0 || balances.noTokens > 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-mono">
      {/* Header */}
      <div className="max-w-3xl space-y-3 mb-10">
        <div className="flex items-center space-x-2 text-xs text-[#10B981]">
          <Wallet className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">PORTFOLIO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F4F0] uppercase tracking-tight font-sans">
          YOUR HOUSING POSITIONS
        </h1>
        <p className="text-xs sm:text-sm text-[#8A918E] leading-relaxed font-sans">
          Manage your SPL position tokens, track active exposure across metropolitan markets, and redeem collateral payouts upon deterministic settlement.
        </p>
      </div>

      {/* Connected State Container */}
      {connected && publicKey ? (
        <div className="bg-[#121514] border border-[#2B322F] rounded-xl p-6 sm:p-8 mb-16 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#222725]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#8A918E] uppercase tracking-wider">CONNECTED WALLET</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#161A18] border border-[#222725] text-[#10B981] font-semibold">
                  SOLANA TESTNET
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-sm sm:text-base font-bold text-[#F4F4F0] font-mono break-all">
                  {publicKey.toBase58()}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 text-[#8A918E] hover:text-[#10B981] transition-colors"
                  title="Copy Address"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={loadBalances}
                disabled={isLoadingBalance}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#161A18] hover:bg-[#1B201E] border border-[#2B322F] text-xs text-[#8A918E] hover:text-[#F4F4F0] rounded transition-colors"
                title="Refresh Balances"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
              <button
                onClick={() => disconnect()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#161A18] hover:bg-[#201515] border border-[#2B322F] hover:border-red-500/40 text-xs text-[#8A918E] hover:text-red-400 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#161A18] border border-[#222725] rounded p-4 space-y-1">
              <span className="text-[11px] text-[#8A918E] uppercase">Testnet SOL</span>
              <div className="text-lg font-bold text-[#F4F4F0]">
                {isLoadingBalance ? (
                  <span className="text-xs text-[#8A918E] flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Querying...
                  </span>
                ) : balances !== null ? (
                  `${balances.sol.toFixed(4)} SOL`
                ) : (
                  '0.0000 SOL'
                )}
              </div>
            </div>

            <div className="bg-[#161A18] border border-[#222725] rounded p-4 space-y-1">
              <span className="text-[11px] text-[#8A918E] uppercase">TEST USDC</span>
              <div className="text-lg font-bold text-[#F4F4F0]">
                {balances !== null ? `${balances.testUsdc.toFixed(2)} testUSDC` : '0.00'}
              </div>
            </div>

            <div className="bg-[#161A18] border border-[#222725] rounded p-4 space-y-1">
              <span className="text-[11px] text-[#8A918E] uppercase">Active Exposure</span>
              <div className="text-lg font-bold text-[#10B981]">
                {hasPosition ? '1 Market' : '0 Markets'}
              </div>
            </div>

            <div className="bg-[#161A18] border border-[#222725] rounded p-4 space-y-1">
              <span className="text-[11px] text-[#8A918E] uppercase">Protocol Execution</span>
              <div className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Testnet Live</span>
              </div>
            </div>
          </div>

          {/* Active Positions Table or Prompt */}
          {positions.length > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F4F4F0] uppercase tracking-wider">
                  Active Market Positions ({positions.length})
                </h3>
                <span className="text-[11px] text-[#565E5A]">SOLANA TESTNET</span>
              </div>
              {positions.map(({ spec, balances: posBal }) => (
                <div key={spec.id} className="bg-[#0B0D0C] border border-[#222725] rounded-lg p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A1F1D] pb-3">
                    <div>
                      <span className="text-xs font-semibold text-[#F4F4F0]">{spec.name} Housing Risk Market</span>
                      <span className="text-[10px] text-[#565E5A] block">{spec.id}</span>
                    </div>
                    <Link
                      href={`/market/${spec.id}`}
                      className="px-3 py-1.5 bg-[#161A18] hover:bg-[#222725] border border-[#2B322F] text-xs font-semibold text-[#10B981] rounded flex items-center gap-1.5 transition-colors"
                    >
                      <span>Manage / Redeem</span>
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#565E5A] block text-[10px] uppercase">YES Tokens:</span>
                      <span className="font-semibold text-[#10B981]">{posBal.yesTokens.toFixed(2)} YES</span>
                    </div>
                    <div>
                      <span className="text-[#565E5A] block text-[10px] uppercase">NO Tokens:</span>
                      <span className="font-semibold text-[#F43F5E]">{posBal.noTokens.toFixed(2)} NO</span>
                    </div>
                    <div>
                      <span className="text-[#565E5A] block text-[10px] uppercase">Matched Pairs:</span>
                      <span className="font-semibold text-[#F4F4F0]">{Math.min(posBal.yesTokens, posBal.noTokens).toFixed(2)} Pairs</span>
                    </div>
                    <div>
                      <span className="text-[#565E5A] block text-[10px] uppercase">Status:</span>
                      <span className="text-[#10B981] font-semibold">Active On-Chain</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded border border-[#222725] bg-[#161A18]/40 text-xs text-[#8A918E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span>No active positions on Testnet yet. Deposit test collateral in any active market to mint matched pairs.</span>
              <Link
                href="/markets"
                className="text-[#10B981] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Browse Active Markets</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Disconnected State Container */
        <div className="bg-[#121514] border border-[#222725] rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto mb-16 space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#161A18] border border-[#2B322F] flex items-center justify-center mx-auto text-[#10B981]">
            <Wallet className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#F4F4F0] font-sans">
              Connect a Solana Testnet wallet to view your HedgeHouse positions.
            </h2>
            <p className="text-xs text-[#8A918E] max-w-md mx-auto leading-relaxed font-sans">
              HedgeHouse protocol is deployed and testable on Solana Testnet. Connect your wallet to inspect your on-chain SPL tokens and manage collateral positions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setVisible(true)}
              disabled={connecting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] font-semibold text-xs rounded transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-[#10B981]/15"
            >
              <Wallet className="w-4 h-4" />
              <span>{connecting ? 'Connecting...' : 'Connect Testnet Wallet'}</span>
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
            <span>Network: Solana Testnet • Zero mock balances</span>
          </div>
        </div>
      )}

      {/* Educational Token Mechanics */}
      <div className="space-y-6">
        <div className="border-b border-[#222725] pb-3">
          <h3 className="text-lg font-bold text-[#F4F4F0]">
            On-Chain Token Architecture
          </h3>
          <p className="text-xs text-[#8A918E] mt-0.5">
            How HedgeHouse represents risk positions on Solana
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Card 1 */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-3">
            <div className="w-8 h-8 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center text-[#10B981]">
              <Coins className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-[#F4F4F0]">SPL Token Pairs</h4>
            <p className="text-[#8A918E] leading-relaxed font-sans">
              Each market establishes dedicated YES and NO SPL token mints. When collateral is deposited, matching pairs are minted directly to your Associated Token Account (ATA).
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-3">
            <div className="w-8 h-8 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center text-[#10B981]">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-[#F4F4F0]">Isolated Market Vaults</h4>
            <p className="text-[#8A918E] leading-relaxed font-sans">
              Collateral is locked in isolated Program Derived Address (PDA) vaults owned strictly by the market contract. Zero pooled cross-market contagion risk.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-3">
            <div className="w-8 h-8 rounded bg-[#161A18] border border-[#2B322F] flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-[#F4F4F0]">Deterministic Claim</h4>
            <p className="text-[#8A918E] leading-relaxed font-sans">
              Upon publication of the official statistical bulletin, the winning side burns tokens to redeem 1.00 USDC collateral per winning token directly from the vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
