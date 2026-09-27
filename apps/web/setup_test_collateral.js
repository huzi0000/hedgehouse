const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram
} = require('@solana/web3.js');
const {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

const DEVNET_RPC = 'https://api.devnet.solana.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('====================================================');
  console.log('HEDGEHOUSE — SETUP DEVNET TEST COLLATERAL MINT');
  console.log('====================================================');

  const connection = new Connection(DEVNET_RPC, { commitment: 'confirmed' });

  const deployerKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/deployer-keypair.json'), 'utf8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  console.log('Deployer Pubkey: ', deployer.publicKey.toBase58());

  // Generate a new mint keypair or load existing
  const mintKeypairPath = path.resolve(__dirname, '../../target/deploy/test-usdc-mint.json');
  let testMintKeypair;
  if (fs.existsSync(mintKeypairPath)) {
    testMintKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(mintKeypairPath, 'utf8'))));
    console.log('Found existing Test Mint Keypair:', testMintKeypair.publicKey.toBase58());
  } else {
    testMintKeypair = Keypair.generate();
    fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(testMintKeypair.secretKey)));
    console.log('Generated new Test Mint Keypair:', testMintKeypair.publicKey.toBase58());
  }

  const testMint = testMintKeypair.publicKey;
  console.log('Test USDC Mint Address:       ', testMint.toBase58());

  // ATA for deployer
  const deployerAta = getAssociatedTokenAddressSync(testMint, deployer.publicKey);
  console.log('Deployer Test USDC ATA:       ', deployerAta.toBase58());

  // Calculate rent for Mint account (82 bytes)
  const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  // Mint amount: 10,000 test tokens with 6 decimals = 10_000_000_000 base units
  const mintAmount = 10_000_000_000n;

  console.log('\nBuilding atomic collateral setup transaction:');
  console.log('1. SystemProgram.createAccount (Mint account, 82 bytes)');
  console.log('2. createInitializeMintInstruction (6 decimals, authority = deployer)');
  console.log('3. createAssociatedTokenAccountInstruction (deployer ATA)');
  console.log('4. createMintToInstruction (10,000.000000 TEST USDC to deployer ATA)');

  const tx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }),
    SystemProgram.createAccount({
      fromPubkey: deployer.publicKey,
      newAccountPubkey: testMint,
      lamports: mintRent,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID
    }),
    createInitializeMintInstruction(testMint, 6, deployer.publicKey, null),
    createAssociatedTokenAccountInstruction(
      deployer.publicKey,
      deployerAta,
      deployer.publicKey,
      testMint
    ),
    createMintToInstruction(
      testMint,
      deployerAta,
      deployer.publicKey,
      mintAmount
    )
  );

  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = deployer.publicKey;
  tx.sign(deployer, testMintKeypair);

  console.log('\nSubmitting transaction to Solana Devnet...');
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 5
  });
  console.log('Submitted signature:', sig);

  console.log('Waiting for confirmation...');
  let confirmed = false;
  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    try {
      const st = await connection.getSignatureStatus(sig);
      if (st && st.value && (st.value.confirmationStatus === 'confirmed' || st.value.confirmationStatus === 'finalized')) {
        if (st.value.err) throw new Error(`On-chain transaction error: ${JSON.stringify(st.value.err)}`);
        confirmed = true;
        console.log(`Confirmed! Status: ${st.value.confirmationStatus}`);
        break;
      }
    } catch (e) {
      if (e.message && e.message.includes('On-chain transaction error')) throw e;
    }
    process.stdout.write('.');
  }

  if (!confirmed) {
    throw new Error('Transaction confirmation timed out');
  }

  // Save mint info
  const mintMetadata = {
    name: 'TEST USDC (HedgeHouse Devnet)',
    symbol: 'testUSDC',
    decimals: 6,
    mint: testMint.toBase58(),
    deployerAta: deployerAta.toBase58(),
    initialMintAmount: '10000000000',
    initialMintFormatted: '10,000.000000 testUSDC',
    txSignature: sig,
    explorerUrl: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
    mintExplorerUrl: `https://explorer.solana.com/address/${testMint.toBase58()}?cluster=devnet`
  };

  fs.writeFileSync(
    path.resolve(__dirname, '../../target/deploy/test-collateral-metadata.json'),
    JSON.stringify(mintMetadata, null, 2)
  );

  console.log('\n====================================================');
  console.log('TEST COLLATERAL SETUP COMPLETE');
  console.log('====================================================');
  console.log('Mint Address:    ', testMint.toBase58());
  console.log('Deployer ATA:    ', deployerAta.toBase58());
  console.log('Minted Amount:   10,000.000000 testUSDC');
  console.log('Transaction:     ', sig);
  console.log(`Explorer:         https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('\nSetup error:', err);
  process.exit(1);
});
