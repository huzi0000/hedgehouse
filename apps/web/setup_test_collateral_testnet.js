const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram
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

const TESTNET_RPC = 'https://api.testnet.solana.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('====================================================');
  console.log('HEDGEHOUSE — SETUP TESTNET TEST COLLATERAL MINT');
  console.log('====================================================');

  const connection = new Connection(TESTNET_RPC, { commitment: 'confirmed' });

  const deployerKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/deployer-keypair.json'), 'utf8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  console.log('Deployer Pubkey: ', deployer.publicKey.toBase58());

  // Distinct keypair for Testnet mint
  const mintKeypairPath = path.resolve(__dirname, '../../target/deploy/testnet-test-usdc-mint.json');
  let testMintKeypair;
  if (fs.existsSync(mintKeypairPath)) {
    testMintKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(mintKeypairPath, 'utf8'))));
    console.log('Found existing Testnet Test Mint Keypair:', testMintKeypair.publicKey.toBase58());
  } else {
    testMintKeypair = Keypair.generate();
    fs.writeFileSync(mintKeypairPath, JSON.stringify(Array.from(testMintKeypair.secretKey)));
    console.log('Generated new Testnet Test Mint Keypair:', testMintKeypair.publicKey.toBase58());
  }

  const testMint = testMintKeypair.publicKey;
  console.log('Testnet testUSDC Mint Address:', testMint.toBase58());

  // Check if mint already exists on Testnet
  const mintInfo = await connection.getAccountInfo(testMint, 'confirmed');
  if (mintInfo) {
    console.log('Testnet testUSDC mint already initialized on-chain!');
    const deployerAta = getAssociatedTokenAddressSync(testMint, deployer.publicKey);
    console.log('Deployer ATA:', deployerAta.toBase58());
    return;
  }

  // ATA for deployer
  const deployerAta = getAssociatedTokenAddressSync(testMint, deployer.publicKey);
  console.log('Deployer Testnet testUSDC ATA:', deployerAta.toBase58());

  // Rent for Mint account (82 bytes)
  const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  // Mint amount: 100,000 test tokens with 6 decimals = 100_000_000_000 base units
  const mintAmount = 100_000_000_000n;

  const tx = new Transaction().add(
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

  console.log('\nSubmitting atomic testUSDC creation tx to Solana Testnet...');
  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  console.log('Transaction signature:', sig);

  console.log('Waiting for confirmation...');
  await connection.confirmTransaction(sig, 'confirmed');

  const metadata = {
    name: 'TEST USDC (HedgeHouse Testnet)',
    symbol: 'testUSDC',
    decimals: 6,
    mint: testMint.toBase58(),
    deployerAta: deployerAta.toBase58(),
    initialMintAmount: '100000000000',
    initialMintFormatted: '100,000.000000 testUSDC',
    txSignature: sig,
    explorerUrl: `https://explorer.solana.com/tx/${sig}?cluster=testnet`,
    mintExplorerUrl: `https://explorer.solana.com/address/${testMint.toBase58()}?cluster=testnet`
  };

  fs.writeFileSync(
    path.resolve(__dirname, '../../target/deploy/testnet-collateral-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\n====================================================');
  console.log('TESTNET COLLATERAL SETUP COMPLETE');
  console.log('====================================================');
  console.log('Mint Address:    ', testMint.toBase58());
  console.log('Deployer ATA:    ', deployerAta.toBase58());
  console.log('Minted Amount:   100,000.000000 testUSDC');
  console.log('Transaction:     ', sig);
  console.log('Explorer:         https://explorer.solana.com/tx/' + sig + '?cluster=testnet');
  console.log('====================================================\n');

  const bal = await connection.getBalance(deployer.publicKey, 'confirmed');
  console.log(`Remaining Testnet SOL Balance: ${(bal / 1e9).toFixed(9)} SOL (${bal} lamports)`);
}

main().catch(err => {
  console.error('\nSetup error:', err);
  process.exit(1);
});
