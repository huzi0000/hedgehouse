const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} = require('@solana/web3.js');
const {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID
} = require('@solana/spl-token');
const { Program, AnchorProvider, BN } = require('@coral-xyz/anchor');
const fs = require('fs');
const path = require('path');

const TESTNET_RPC = 'https://api.testnet.solana.com';
const TEST_USDC_MINT = new PublicKey('3pc31EEAFqjrBFJaeCzMHhcSCyvM8TDrSTAU17RD2cWg');
const HEDGEHOUSE_PROGRAM_ID = new PublicKey('J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi');

const MIAMI_SPEC = {
  id: 'miami-fhfa-2027q2-decline',
  name: 'Miami',
  marketPda: new PublicKey('psSrLZqVicFHikn6sD5jZxou2NZGFxK31b1xxP5vDzg'),
  vaultPda: new PublicKey('7ZBYv5JzC5gzf6Vr7Cw3kSubPguTrZixpv9TuWxqV6pW'),
  yesMint: new PublicKey('26BGWvo49nvPaKP3V5bVcT65TPChPrKCh1M469722mj7'),
  noMint: new PublicKey('9gK6Y2wqSzK8Rh926PWgYdCBP5AwDSiXN7bAqnTKrRH5')
};

async function main() {
  console.log('====================================================');
  console.log('HEDGEHOUSE FRESH-WALLET TESTNET E2E VERIFICATION');
  console.log('====================================================\n');

  const connection = new Connection(TESTNET_RPC, 'confirmed');

  // Load deployer keypair strictly to fund gas fee and act as faucet
  const deployerKeyPath = path.resolve(__dirname, '../target/deploy/deployer-keypair.json');
  if (!fs.existsSync(deployerKeyPath)) {
    throw new Error('Deployer keypair not found at ' + deployerKeyPath);
  }
  const deployer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'))));
  console.log('Faucet / Gas Provider:', deployer.publicKey.toBase58());

  // Step 1: Generate a brand new, completely fresh non-admin wallet
  const freshUser = Keypair.generate();
  console.log('Fresh Non-Admin User Wallet:', freshUser.publicKey.toBase58());

  // Step 2: Verify initial balances are 0
  const initialSol = await connection.getBalance(freshUser.publicKey);
  console.log(`Initial SOL: ${initialSol / 1e9} SOL`);
  const freshUserUsdcAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, freshUser.publicKey);
  let initialUsdc = 0;
  try {
    const acc = await getAccount(connection, freshUserUsdcAta);
    initialUsdc = Number(acc.amount) / 1e6;
  } catch (e) {
    initialUsdc = 0;
  }
  console.log(`Initial testUSDC: ${initialUsdc} testUSDC`);
  if (initialUsdc !== 0) throw new Error('Expected fresh wallet testUSDC to be 0');

  // Step 3: Fund fresh wallet with 0.02 SOL for transaction fees
  console.log('\n--- Step 3: Funding fresh wallet with gas fees ---');
  const fundGasTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: deployer.publicKey,
      toPubkey: freshUser.publicKey,
      lamports: 20_000_000 // 0.02 SOL
    })
  );
  const fundGasSig = await sendAndConfirmTransaction(connection, fundGasTx, [deployer], { commitment: 'confirmed' });
  console.log('Gas Funding Tx:', fundGasSig);
  console.log('Explorer:', `https://explorer.solana.com/tx/${fundGasSig}?cluster=testnet`);

  const fundedSol = await connection.getBalance(freshUser.publicKey);
  console.log(`Fresh user SOL balance: ${fundedSol / 1e9} SOL`);

  // Step 4: Execute Faucet Claim (100 testUSDC)
  console.log('\n--- Step 4: Executing Faucet Claim (100 testUSDC) ---');
  const deployerUsdcAta = getAssociatedTokenAddressSync(TEST_USDC_MINT, deployer.publicKey);
  const faucetTx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      deployer.publicKey,
      freshUserUsdcAta,
      freshUser.publicKey,
      TEST_USDC_MINT
    ),
    createTransferInstruction(
      deployerUsdcAta,
      freshUserUsdcAta,
      deployer.publicKey,
      100_000_000n // 100 testUSDC
    )
  );
  const faucetSig = await sendAndConfirmTransaction(connection, faucetTx, [deployer], { commitment: 'confirmed' });
  console.log('Faucet Distribution Tx:', faucetSig);
  console.log('Explorer:', `https://explorer.solana.com/tx/${faucetSig}?cluster=testnet`);

  // Verify fresh user received 100 testUSDC
  const postFaucetAcc = await getAccount(connection, freshUserUsdcAta);
  const postFaucetUsdc = Number(postFaucetAcc.amount) / 1e6;
  console.log(`Post-Faucet testUSDC Balance: ${postFaucetUsdc} testUSDC`);
  if (postFaucetUsdc !== 100) throw new Error('Expected exactly 100 testUSDC after faucet claim');

  // Setup Anchor Program with Fresh User Wallet Provider
  const idlPath = path.resolve(__dirname, '../apps/web/lib/solana/idl.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

  const freshUserWallet = {
    publicKey: freshUser.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(freshUser);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach((tx) => tx.partialSign(freshUser));
      return txs;
    }
  };

  const freshUserProvider = new AnchorProvider(connection, freshUserWallet, { commitment: 'confirmed' });
  const program = new Program(idl, freshUserProvider);

  // Step 5: User deposits 10 testUSDC into Miami Market
  console.log('\n--- Step 5: Fresh User Deposits 10 testUSDC into Miami Market ---');
  const freshUserYesAta = getAssociatedTokenAddressSync(MIAMI_SPEC.yesMint, freshUser.publicKey);
  const freshUserNoAta = getAssociatedTokenAddressSync(MIAMI_SPEC.noMint, freshUser.publicKey);

  const depositTx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      freshUser.publicKey,
      freshUserYesAta,
      freshUser.publicKey,
      MIAMI_SPEC.yesMint
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      freshUser.publicKey,
      freshUserNoAta,
      freshUser.publicKey,
      MIAMI_SPEC.noMint
    )
  );

  const depositIx = await program.methods
    .depositCollateral(new BN(10_000_000)) // 10 testUSDC
    .accounts({
      market: MIAMI_SPEC.marketPda,
      user: freshUser.publicKey,
      userCollateral: freshUserUsdcAta,
      collateralVault: MIAMI_SPEC.vaultPda,
      collateralMint: TEST_USDC_MINT,
      yesMint: MIAMI_SPEC.yesMint,
      noMint: MIAMI_SPEC.noMint,
      userYes: freshUserYesAta,
      userNo: freshUserNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  depositTx.add(depositIx);

  // Send transaction signed SOLELY by freshUser (No deployer signature!)
  const depositSig = await sendAndConfirmTransaction(connection, depositTx, [freshUser], { commitment: 'confirmed' });
  console.log('User Deposit Tx (Signed ONLY by Fresh Wallet):', depositSig);
  console.log('Explorer:', `https://explorer.solana.com/tx/${depositSig}?cluster=testnet`);

  // Verify balances after deposit
  const postDepositUsdc = Number((await getAccount(connection, freshUserUsdcAta)).amount) / 1e6;
  const postDepositYes = Number((await getAccount(connection, freshUserYesAta)).amount) / 1e6;
  const postDepositNo = Number((await getAccount(connection, freshUserNoAta)).amount) / 1e6;

  console.log(`Balances after 10 testUSDC deposit:`);
  console.log(`- testUSDC: ${postDepositUsdc} (expected 90)`);
  console.log(`- YES tokens: ${postDepositYes} (expected 10)`);
  console.log(`- NO tokens:  ${postDepositNo} (expected 10)`);

  if (postDepositUsdc !== 90 || postDepositYes !== 10 || postDepositNo !== 10) {
    throw new Error('Balance mismatch after deposit!');
  }

  // Step 6: Fresh User redeems 5 matched pairs (5 YES + 5 NO) from Miami Market
  console.log('\n--- Step 6: Fresh User Redeems 5 Matched Pairs ---');
  const redeemTx = new Transaction();
  const redeemIx = await program.methods
    .redeemPair(new BN(5_000_000)) // 5 pairs
    .accounts({
      market: MIAMI_SPEC.marketPda,
      user: freshUser.publicKey,
      userCollateral: freshUserUsdcAta,
      collateralVault: MIAMI_SPEC.vaultPda,
      yesMint: MIAMI_SPEC.yesMint,
      noMint: MIAMI_SPEC.noMint,
      userYes: freshUserYesAta,
      userNo: freshUserNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  redeemTx.add(redeemIx);

  // Send transaction signed SOLELY by freshUser (No deployer signature!)
  const redeemSig = await sendAndConfirmTransaction(connection, redeemTx, [freshUser], { commitment: 'confirmed' });
  console.log('User Redeem Tx (Signed ONLY by Fresh Wallet):', redeemSig);
  console.log('Explorer:', `https://explorer.solana.com/tx/${redeemSig}?cluster=testnet`);

  // Verify balances after redeem
  const postRedeemUsdc = Number((await getAccount(connection, freshUserUsdcAta)).amount) / 1e6;
  const postRedeemYes = Number((await getAccount(connection, freshUserYesAta)).amount) / 1e6;
  const postRedeemNo = Number((await getAccount(connection, freshUserNoAta)).amount) / 1e6;

  console.log(`Balances after 5 pair redemption:`);
  console.log(`- testUSDC: ${postRedeemUsdc} (expected 95)`);
  console.log(`- YES tokens: ${postRedeemYes} (expected 5)`);
  console.log(`- NO tokens:  ${postRedeemNo} (expected 5)`);

  if (postRedeemUsdc !== 95 || postRedeemYes !== 5 || postRedeemNo !== 5) {
    throw new Error('Balance mismatch after redeem!');
  }

  // Clean up: return remaining SOL back to deployer
  console.log('\n--- Step 7: Cleanup gas return ---');
  const remainingSol = await connection.getBalance(freshUser.publicKey);
  if (remainingSol > 10_000) {
    const returnTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: freshUser.publicKey,
        toPubkey: deployer.publicKey,
        lamports: remainingSol - 5000 // leave 5000 lamports for tx fee
      })
    );
    await sendAndConfirmTransaction(connection, returnTx, [freshUser], { commitment: 'confirmed' });
    console.log(`Returned ${(remainingSol - 5000) / 1e9} SOL back to deployer.`);
  }

  console.log('\n====================================================');
  console.log('FRESH-WALLET E2E SUCCESS SUMMARY');
  console.log('====================================================');
  console.log('Fresh User Pubkey:', freshUser.publicKey.toBase58());
  console.log('Gas Funding Tx:   ', fundGasSig);
  console.log('Faucet Claim Tx:  ', faucetSig);
  console.log('Deposit Tx:       ', depositSig);
  console.log('Redeem Tx:        ', redeemSig);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('\n[E2E ERROR]:', err);
  process.exit(1);
});
