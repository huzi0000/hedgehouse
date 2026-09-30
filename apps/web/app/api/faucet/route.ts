import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// In-memory rate limiting: 1 airdrop per recipient every 60 seconds
const rateLimitMap = new Map<string, number>();

const TESTNET_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.testnet.solana.com';
const TEST_USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TEST_USDC_MINT || '3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg'
);

function getFaucetKeypair(): Keypair | null {
  // 1. Try environment variable (Vercel production)
  const envKey = process.env.TESTNET_FAUCET_KEY;
  if (envKey) {
    try {
      if (envKey.startsWith('[')) {
        return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(envKey)));
      } else {
        const bs58 = require('bs58');
        return Keypair.fromSecretKey(bs58.decode(envKey));
      }
    } catch (e) {
      console.error('[Faucet] Failed to parse TESTNET_FAUCET_KEY env var:', e);
    }
  }

  // 2. Try reading local deployer keypair (Local dev)
  try {
    const localKeyPath = path.resolve(process.cwd(), '../../target/deploy/deployer-keypair.json');
    if (fs.existsSync(localKeyPath)) {
      const keyData = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      return Keypair.fromSecretKey(Uint8Array.from(keyData));
    }
    const altLocalPath = path.resolve(process.cwd(), 'target/deploy/deployer-keypair.json');
    if (fs.existsSync(altLocalPath)) {
      const keyData = JSON.parse(fs.readFileSync(altLocalPath, 'utf8'));
      return Keypair.fromSecretKey(Uint8Array.from(keyData));
    }
  } catch (e) {
    // Ignore in production if file not found
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipient } = body;

    if (!recipient || typeof recipient !== 'string') {
      return NextResponse.json({ error: 'Recipient public key is required' }, { status: 400 });
    }

    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      return NextResponse.json({ error: 'Invalid Solana address format' }, { status: 400 });
    }

    // Rate limiting check
    const now = Date.now();
    const lastRequest = rateLimitMap.get(recipientPubkey.toBase58());
    if (lastRequest && now - lastRequest < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastRequest)) / 1000);
      return NextResponse.json(
        { error: `Rate limited. Please wait ${waitSeconds}s before requesting again.` },
        { status: 429 }
      );
    }

    const faucetKeypair = getFaucetKeypair();
    if (!faucetKeypair) {
      return NextResponse.json(
        { error: 'Faucet service is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    const connection = new Connection(TESTNET_RPC, 'confirmed');

    // Faucet ATA and recipient ATA
    const faucetAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, faucetKeypair.publicKey);
    const recipientAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, recipientPubkey);

    // Abuse protection: limit claims if recipient already holds >= 500 testUSDC
    try {
      const recipientAccount = await getAccount(connection, recipientAta, 'confirmed');
      const currentBalance = Number(recipientAccount.amount) / 1_000_000;
      if (currentBalance >= 500) {
        return NextResponse.json(
          { error: `Recipient wallet already holds ${currentBalance.toFixed(0)} testUSDC. Faucet is restricted to balances below 500 testUSDC.` },
          { status: 400 }
        );
      }
    } catch {
      // Account does not exist yet or has no balance - allowable for faucet claim
    }

    // 100 testUSDC = 100_000_000 base units (6 decimals)
    const amountUnits = 100_000_000n;

    const tx = new Transaction().add(
      // Ensure recipient ATA exists
      createAssociatedTokenAccountIdempotentInstruction(
        faucetKeypair.publicKey,
        recipientAta,
        recipientPubkey,
        TEST_USDC_MINT
      ),
      // Transfer 100 testUSDC
      createTransferInstruction(
        faucetAta,
        recipientAta,
        faucetKeypair.publicKey,
        amountUnits
      )
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [faucetKeypair], {
      commitment: 'confirmed'
    });

    rateLimitMap.set(recipientPubkey.toBase58(), now);

    return NextResponse.json({
      success: true,
      amount: 100,
      mint: TEST_USDC_MINT.toBase58(),
      signature: sig,
      explorerUrl: `https://explorer.solana.com/tx/${sig}?cluster=testnet`
    });
  } catch (err: any) {
    console.error('[Faucet Error]:', err);
    // Sanitize any internal RPC/system details
    const rawMsg = err?.message || '';
    const safeMsg = rawMsg.includes('insufficient funds')
      ? 'Faucet reserves are currently refilling. Please try again soon.'
      : 'Failed to process testUSDC faucet claim. Please try again in a few moments.';
    return NextResponse.json(
      { error: safeMsg },
      { status: 500 }
    );
  }
}
