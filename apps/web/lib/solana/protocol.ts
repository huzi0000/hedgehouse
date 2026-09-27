import { PublicKey, Transaction, ComputeBudgetProgram, Connection } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction
} from '@solana/spl-token';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import idlJson from './idl.json';

// Deployed Solana Devnet Configuration
export const SOLANA_CLUSTER = 'devnet';
export const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Verified On-Chain Program and Mint IDs
export const HEDGEHOUSE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HEDGEHOUSE_PROGRAM_ID || 'J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi'
);

export const TEST_USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TEST_USDC_MINT || 'C3nYr1kLuTPN3Pvbc4DD8rvzAwVNHovNKyHpVKU4d3dv'
);

// Miami FHFA Verified Market Specification
export const MIAMI_MARKET_SPEC = {
  id: 'miami-fhfa-2027q2-decline',
  marketPda: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_MARKET_PDA || 'psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg'),
  vaultPda: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_VAULT_PDA || '7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW'),
  yesMint: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_YES_MINT || '26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7'),
  noMint: new PublicKey(process.env.NEXT_PUBLIC_MIAMI_NO_MINT || '9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5'),
  deployTxSignature: '3cfoq5mYcTZzkmCBxVLvKvV6uz5vnZACehmoH2nbmqrjQnnXDBHCVDEJEkgfvYBY8Mm1vk4aM4xvD1mjx5WHMk6U',
  createMarketSignature: 'RxV9CiNGpGi3GcENGaeEneMeFcE9DWaWS9yk45njqWQTLnS6ab2hdtTGtNDLXgLvHPTUPC85FMBWE1JK5v7pDRB'
};

export function getExplorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export interface UserBalances {
  sol: number;
  testUsdc: number;
  yesTokens: number;
  noTokens: number;
}

export async function fetchUserBalances(
  connection: Connection,
  userWallet: PublicKey
): Promise<UserBalances> {
  let sol = 0;
  let testUsdc = 0;
  let yesTokens = 0;
  let noTokens = 0;

  try {
    const lamports = await connection.getBalance(userWallet, 'confirmed');
    sol = lamports / 1e9;
  } catch (e) {}

  try {
    const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
    const bal = await connection.getTokenAccountBalance(userCollateralAta, 'confirmed');
    testUsdc = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  try {
    const userYesAta = getAssociatedTokenAddressSync(MIAMI_MARKET_SPEC.yesMint, userWallet);
    const bal = await connection.getTokenAccountBalance(userYesAta, 'confirmed');
    yesTokens = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  try {
    const userNoAta = getAssociatedTokenAddressSync(MIAMI_MARKET_SPEC.noMint, userWallet);
    const bal = await connection.getTokenAccountBalance(userNoAta, 'confirmed');
    noTokens = Number(bal.value.uiAmountString || 0);
  } catch (e) {}

  return { sol, testUsdc, yesTokens, noTokens };
}

/**
 * Builds an atomic transaction that:
 * 1. Creates idempotent ATAs for YES and NO position tokens if not yet existing
 * 2. Deposits collateral into the isolated market PDA vault
 * 3. Mints 1:1 matching YES and NO position tokens to the user's ATAs
 */
export async function buildDepositCollateralTx(
  connection: Connection,
  userWallet: PublicKey,
  amountUsdc: number
): Promise<Transaction> {
  const dummyWallet: any = {
    publicKey: userWallet,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs
  };

  const provider = new AnchorProvider(connection, dummyWallet, {});
  const program = new Program(idlJson as Idl, provider);

  const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
  const userYesAta = getAssociatedTokenAddressSync(MIAMI_MARKET_SPEC.yesMint, userWallet);
  const userNoAta = getAssociatedTokenAddressSync(MIAMI_MARKET_SPEC.noMint, userWallet);

  // 6 decimals: 1 USDC = 1,000,000 base units
  const baseUnits = BigInt(Math.round(amountUsdc * 1e6));

  const depositIx = await program.methods
    .depositCollateral(new BN(baseUnits.toString()))
    .accounts({
      market: MIAMI_MARKET_SPEC.marketPda,
      user: userWallet,
      userCollateral: userCollateralAta,
      collateralVault: MIAMI_MARKET_SPEC.vaultPda,
      collateralMint: TEST_USDC_MINT,
      yesMint: MIAMI_MARKET_SPEC.yesMint,
      noMint: MIAMI_MARKET_SPEC.noMint,
      userYes: userYesAta,
      userNo: userNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    createAssociatedTokenAccountIdempotentInstruction(
      userWallet,
      userYesAta,
      userWallet,
      MIAMI_MARKET_SPEC.yesMint
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      userWallet,
      userNoAta,
      userWallet,
      MIAMI_MARKET_SPEC.noMint
    ),
    depositIx
  );

  return tx;
}

/**
 * Builds a transaction that burns equal quantities of YES and NO position tokens
 * and redeems equivalent USDC collateral back to the user before resolution.
 */
export async function buildRedeemPairTx(
  connection: Connection,
  userWallet: PublicKey,
  pairsToRedeem: number
): Promise<Transaction> {
  const dummyWallet: any = {
    publicKey: userWallet,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs
  };

  const provider = new AnchorProvider(connection, dummyWallet, {});
  const program = new Program(idlJson as Idl, provider);

  const userCollateralAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, userWallet);
  const userYesAta = getAssociatedTokenAddressSync(MIAMI_MARKET_SPEC.yesMint, userWallet);
  const userNoAta = getAssociatedTokenAddressSync(MIAMI_MARKET_SPEC.noMint, userWallet);

  const baseUnits = BigInt(Math.round(pairsToRedeem * 1e6));

  const redeemIx = await program.methods
    .redeemPair(new BN(baseUnits.toString()))
    .accounts({
      market: MIAMI_MARKET_SPEC.marketPda,
      user: userWallet,
      userCollateral: userCollateralAta,
      collateralVault: MIAMI_MARKET_SPEC.vaultPda,
      yesMint: MIAMI_MARKET_SPEC.yesMint,
      noMint: MIAMI_MARKET_SPEC.noMint,
      userYes: userYesAta,
      userNo: userNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 250000 }),
    redeemIx
  );

  return tx;
}
