'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { 
  Wallet, 
  Coins, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft,
  ShieldCheck,
  Flame
} from 'lucide-react';
import {
  fetchUserBalances,
  buildDepositCollateralTx,
  buildRedeemPairTx,
  MIAMI_MARKET_SPEC,
  HEDGEHOUSE_PROGRAM_ID,
  TEST_USDC_MINT,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  UserBalances
} from '../lib/solana/protocol';

interface DevnetMarketTradingPanelProps {
  marketId: string;
}

export function DevnetMarketTradingPanel({ marketId }: DevnetMarketTradingPanelProps) {
  const isMiami = marketId === 'miami-fhfa-2027q2-decline';
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const [mode, setMode] = useState<'DEPOSIT' | 'REDEEM'>('DEPOSIT');
  const [amountStr, setAmountStr] = useState<string>('10');
  const [balances, setBalances] = useState<UserBalances | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const loadBalances = useCallback(async () => {
    if (!connected || !publicKey || !connection) return;
    setIsLoadingBalances(true);
    try {
      const b = await fetchUserBalances(connection, publicKey);
      setBalances(b);
    } catch (e) {
      console.error('Failed to query Devnet balances:', e);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [connected, publicKey, connection]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  // Non-Miami markets are not yet initialized on-chain
  if (!isMiami) {
    return (
      <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-4 text-xs font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
          <span className="font-bold text-[#F4F4F0] uppercase tracking-wider">Position Interface</span>
          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-semibold">
            COMING ON-CHAIN
          </span>
        </div>
        <p className="text-[#8A918E] leading-relaxed font-sans text-xs">
          This market specification is verified against official statistics. Real on-chain contract deployment will occur in the next market batch.
        </p>
        <button
          disabled
          className="w-full py-3 px-4 rounded bg-[#1B201E] border border-[#2B322F] text-xs text-[#8A918E] font-semibold cursor-not-allowed uppercase tracking-wider"
        >
          AWAITING ON-CHAIN BATCH
        </button>
      </div>
    );
  }

  const parsedAmount = parseFloat(amountStr) || 0;
  const maxRedeemable = balances ? Math.min(balances.yesTokens, balances.noTokens) : 0;

  const handleSubmit = async () => {
    if (!connected || !publicKey || !connection) {
      setVisible(true);
      return;
    }

    setTxError(null);
    setTxSignature(null);

    if (parsedAmount <= 0) {
      setTxError('Please enter a valid amount greater than 0.');
      return;
    }

    if (balances && balances.sol < 0.002) {
      setTxError('Insufficient Devnet SOL for transaction fees. Please fund your wallet via the Solana Devnet faucet.');
      return;
    }

    if (mode === 'DEPOSIT') {
      if (balances && balances.testUsdc < parsedAmount) {
        setTxError(`Insufficient TEST USDC balance (${balances.testUsdc.toFixed(2)} available).`);
        return;
      }
    } else {
      if (maxRedeemable < parsedAmount) {
        setTxError(`Insufficient matched pairs. You can redeem up to ${maxRedeemable.toFixed(2)} matched YES/NO pairs.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let tx;
      if (mode === 'DEPOSIT') {
        tx = await buildDepositCollateralTx(connection, publicKey, parsedAmount);
      } else {
        tx = await buildRedeemPairTx(connection, publicKey, parsedAmount);
      }

      const sig = await sendTransaction(tx, connection);
      setTxSignature(sig);

      // Refresh balances after confirmation
      await connection.confirmTransaction(sig, 'confirmed');
      await loadBalances();
    } catch (err: any) {
      console.error('Transaction execution error:', err);
      let msg = err?.message || 'Transaction failed.';
      if (msg.includes('User rejected')) {
        msg = 'Transaction was rejected in your wallet.';
      } else if (msg.includes('insufficient funds')) {
        msg = 'Insufficient funds for transaction fee.';
      }
      setTxError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121514] border border-[#222725] rounded-lg p-5 space-y-5 text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#222725]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold text-[#F4F4F0] uppercase tracking-wider">Devnet Protocol Execution</span>
        </div>
        <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 font-semibold">
          SOLANA / DEVNET
        </span>
      </div>

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-[#0B0D0C] p-1 rounded border border-[#222725]">
        <button
          type="button"
          onClick={() => { setMode('DEPOSIT'); setTxError(null); setTxSignature(null); }}
          className={`py-2 px-3 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            mode === 'DEPOSIT'
              ? 'bg-[#161A18] text-[#10B981] border border-[#2B322F]'
              : 'text-[#8A918E] hover:text-[#F4F4F0]'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Deposit Collateral</span>
        </button>
        <button
          type="button"
          onClick={() => { setMode('REDEEM'); setTxError(null); setTxSignature(null); }}
          className={`py-2 px-3 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            mode === 'REDEEM'
              ? 'bg-[#161A18] text-amber-400 border border-[#2B322F]'
              : 'text-[#8A918E] hover:text-[#F4F4F0]'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Redeem Pair</span>
        </button>
      </div>

      {/* Connected Wallet Balances */}
      {connected && publicKey ? (
        <div className="p-3 bg-[#0B0D0C] border border-[#222725] rounded space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#8A918E] border-b border-[#1A1F1D] pb-1.5">
            <span className="flex items-center gap-1">
              <Wallet className="w-3 h-3 text-[#10B981]" />
              Your On-Chain Balances
            </span>
            <button
              onClick={loadBalances}
              disabled={isLoadingBalances}
              className="text-[#8A918E] hover:text-[#F4F4F0] flex items-center gap-1 text-[10px]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingBalances ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#565E5A] block text-[10px]">TEST USDC:</span>
              <span className="font-semibold text-[#F4F4F0]">
                {balances ? `${balances.testUsdc.toFixed(2)} testUSDC` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#565E5A] block text-[10px]">Devnet SOL:</span>
              <span className="font-semibold text-[#F4F4F0]">
                {balances ? `${balances.sol.toFixed(4)} SOL` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#565E5A] block text-[10px]">YES Tokens:</span>
              <span className="font-semibold text-[#10B981]">
                {balances ? `${balances.yesTokens.toFixed(2)} YES` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#565E5A] block text-[10px]">NO Tokens:</span>
              <span className="font-semibold text-[#F43F5E]">
                {balances ? `${balances.noTokens.toFixed(2)} NO` : '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-[#161A18]/60 border border-[#222725] rounded text-center space-y-2">
          <p className="text-xs text-[#8A918E]">Connect a Solana Devnet wallet to interact with this market contract.</p>
          <button
            onClick={() => setVisible(true)}
            disabled={connecting}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] font-semibold text-xs rounded transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect Devnet Wallet'}
          </button>
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-[#8A918E]">
          <span>{mode === 'DEPOSIT' ? 'Deposit Amount (testUSDC):' : 'Pairs to Redeem:'}</span>
          {mode === 'REDEEM' && (
            <span className="text-[11px] text-[#565E5A]">
              Max Redeemable: <strong className="text-[#F4F4F0]">{maxRedeemable.toFixed(2)}</strong>
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            min="1"
            step="1"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-[#161A18] border border-[#2B322F] rounded p-2.5 text-sm text-[#F4F4F0] focus:outline-none focus:border-[#10B981]/60 font-mono"
            placeholder="Amount"
          />
          <div className="absolute right-2 top-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setAmountStr('10')}
              className="px-1.5 py-0.5 text-[10px] bg-[#222725] hover:bg-[#2B322F] text-[#8A918E] rounded"
            >
              10
            </button>
            <button
              type="button"
              onClick={() => setAmountStr('50')}
              className="px-1.5 py-0.5 text-[10px] bg-[#222725] hover:bg-[#2B322F] text-[#8A918E] rounded"
            >
              50
            </button>
            {mode === 'REDEEM' && (
              <button
                type="button"
                onClick={() => setAmountStr(maxRedeemable.toString())}
                className="px-1.5 py-0.5 text-[10px] bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded"
              >
                MAX
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mechanism explanation */}
      <div className="p-3 bg-[#0B0D0C] border border-[#222725] rounded text-[11px] text-[#8A918E] leading-relaxed font-sans space-y-1">
        {mode === 'DEPOSIT' ? (
          <p>
            Depositing <strong className="text-[#F4F4F0]">{parsedAmount || 0} TEST USDC</strong> locks collateral in the isolated PDA vault and mints exactly{' '}
            <strong className="text-[#10B981]">{parsedAmount || 0} YES</strong> + <strong className="text-[#F43F5E]">{parsedAmount || 0} NO</strong> tokens directly to your ATA.
            Fixed 1:1 pair collateralization — zero AMM slippage.
          </p>
        ) : (
          <p>
            Redeeming <strong className="text-[#F4F4F0]">{parsedAmount || 0} pairs</strong> burns{' '}
            <strong className="text-[#10B981]">{parsedAmount || 0} YES</strong> and <strong className="text-[#F43F5E]">{parsedAmount || 0} NO</strong> tokens, unlocking{' '}
            <strong className="text-[#F4F4F0]">{parsedAmount || 0} TEST USDC</strong> from the vault back to your wallet.
          </p>
        )}
      </div>

      {/* Success Banner */}
      {txSignature && (
        <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs text-[#10B981] font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Transaction Confirmed On-Chain!</span>
          </div>
          <a
            href={getExplorerTxUrl(txSignature)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-[11px] text-[#8A918E] hover:text-[#10B981] transition-colors break-all"
          >
            <span>{txSignature.slice(0, 20)}...{txSignature.slice(-12)}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
          </a>
        </div>
      )}

      {/* Error Banner */}
      {txError && (
        <div className="p-3 bg-red-950/30 border border-red-500/30 rounded flex items-start space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span className="font-sans leading-snug">{txError}</span>
        </div>
      )}

      {/* Action Button */}
      {connected ? (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || parsedAmount <= 0}
          className={`w-full py-3 px-4 rounded text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
            isSubmitting || parsedAmount <= 0
              ? 'bg-[#1B201E] border border-[#2B322F] text-[#565E5A] cursor-not-allowed'
              : mode === 'DEPOSIT'
              ? 'bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] shadow-lg shadow-[#10B981]/10'
              : 'bg-amber-400 hover:bg-amber-500 text-[#0B0D0C] shadow-lg shadow-amber-400/10'
          }`}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing Transaction...</span>
            </>
          ) : mode === 'DEPOSIT' ? (
            <>
              <Coins className="w-4 h-4" />
              <span>Deposit {parsedAmount > 0 ? `${parsedAmount} testUSDC` : ''}</span>
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4" />
              <span>Redeem {parsedAmount > 0 ? `${parsedAmount} Pairs` : ''}</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="w-full py-3 px-4 rounded bg-[#10B981] hover:bg-[#059669] text-[#0B0D0C] text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/10"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Devnet Wallet</span>
        </button>
      )}

      {/* Contract Reference Metadata */}
      <div className="pt-3 border-t border-[#1D2220] space-y-1.5 text-[10px] text-[#565E5A]">
        <div className="flex justify-between items-center">
          <span>Program ID:</span>
          <a
            href={getExplorerAddressUrl(HEDGEHOUSE_PROGRAM_ID.toBase58())}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8A918E] hover:text-[#10B981] font-mono flex items-center gap-1"
          >
            {HEDGEHOUSE_PROGRAM_ID.toBase58().slice(0, 6)}...{HEDGEHOUSE_PROGRAM_ID.toBase58().slice(-4)}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span>Market PDA:</span>
          <a
            href={getExplorerAddressUrl(MIAMI_MARKET_SPEC.marketPda.toBase58())}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8A918E] hover:text-[#10B981] font-mono flex items-center gap-1"
          >
            {MIAMI_MARKET_SPEC.marketPda.toBase58().slice(0, 6)}...{MIAMI_MARKET_SPEC.marketPda.toBase58().slice(-4)}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span>Vault PDA:</span>
          <a
            href={getExplorerAddressUrl(MIAMI_MARKET_SPEC.vaultPda.toBase58())}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8A918E] hover:text-[#10B981] font-mono flex items-center gap-1"
          >
            {MIAMI_MARKET_SPEC.vaultPda.toBase58().slice(0, 6)}...{MIAMI_MARKET_SPEC.vaultPda.toBase58().slice(-4)}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
