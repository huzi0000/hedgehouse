const anchor = require('@coral-xyz/anchor');
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  ComputeBudgetProgram
} = require('@solana/web3.js');
const {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  getAccount,
  transfer
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

const TESTNET_RPC = 'https://api.testnet.solana.com';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stringToU8Array(str, len) {
  const buf = Buffer.alloc(len, 0);
  buf.write(str, 0, len, 'utf8');
  return Array.from(buf);
}

function stringToBuffer(str, len) {
  const buf = Buffer.alloc(len, 0);
  buf.write(str, 0, len, 'utf8');
  return buf;
}

async function sendAndConfirmTx(connection, tx, signers, label = 'Tx') {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = signers[0].publicKey;
  tx.sign(...signers);

  const rawTx = tx.serialize();
  console.log(`Submitting [${label}]...`);
  const sig = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    maxRetries: 5
  });
  console.log(`  Signature: ${sig}`);

  let confirmed = false;
  for (let i = 0; i < 45; i++) {
    await sleep(2000);
    try {
      const st = await connection.getSignatureStatus(sig, { searchTransactionHistory: true });
      if (st && st.value && (st.value.confirmationStatus === 'confirmed' || st.value.confirmationStatus === 'finalized')) {
        if (st.value.err) {
          throw new Error(`On-chain transaction [${label}] failed: ${JSON.stringify(st.value.err)}`);
        }
        confirmed = true;
        console.log(`  ✓ [${label}] confirmed (${st.value.confirmationStatus})`);
        break;
      }
    } catch (e) {
      if (e.message && e.message.includes('On-chain transaction')) throw e;
    }
  }

  if (!confirmed) {
    throw new Error(`Transaction [${label}] (${sig}) timed out waiting for confirmation`);
  }
  return sig;
}

const MARKETS_CONFIG = [
  {
    key: 'miami',
    id: 'miami-fhfa-2027q2-decline',
    name: 'Miami',
    countryCode: 'US',
    regionId: '33124',
    providerId: 'FHFA',
    seriesId: 'HPI_ALL_TRANS',
    baselinePeriod: '2026-Q2',
    targetPeriod: '2027-Q2',
    comparisonType: 0,
    thresholdBps: 0,
    resolutionDeadline: 1819756800 // 2027-08-31
  },
  {
    key: 'london',
    id: 'london-ukhpi-202707-growth',
    name: 'London',
    countryCode: 'GB',
    regionId: 'E12000007',
    providerId: 'UKHPI',
    seriesId: 'MONTHLY_HPI',
    baselinePeriod: '2026-07',
    targetPeriod: '2027-07',
    comparisonType: 3,
    thresholdBps: 0,
    resolutionDeadline: 1822348800 // 2027-09-30
  },
  {
    key: 'singapore',
    id: 'singapore-ura-2027q2-rise-2pct',
    name: 'Singapore',
    countryCode: 'SG',
    regionId: 'SINGAPORE',
    providerId: 'URA',
    seriesId: 'PPI_ALL_TYPES',
    baselinePeriod: '2026-Q2',
    targetPeriod: '2027-Q2',
    comparisonType: 3,
    thresholdBps: 200,
    resolutionDeadline: 1817078400 // 2027-07-31
  },
  {
    key: 'sydney',
    id: 'sydney-abs-2027q2-exceed-1500k',
    name: 'Sydney',
    countryCode: 'AU',
    regionId: '1GSYD',
    providerId: 'ABS',
    seriesId: 'CAT_6432_MEDIAN',
    baselinePeriod: '2026-Q2',
    targetPeriod: '2027-Q2',
    comparisonType: 1,
    thresholdBps: 1500000,
    resolutionDeadline: 1822348800 // 2027-09-30
  }
];

async function main() {
  console.log('======================================================================');
  console.log('HEDGEHOUSE — SOLANA TESTNET MARKETS INITIALIZATION & E2E VERIFICATION');
  console.log('======================================================================');

  const connection = new Connection(TESTNET_RPC, { commitment: 'confirmed' });

  // 1. Load keys and check balances
  const deployerKeyPath = path.resolve(__dirname, '../../target/deploy/deployer-keypair.json');
  const deployerKey = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  console.log('Deployer Wallet Address:  ', deployer.publicKey.toBase58());

  const solBal = await connection.getBalance(deployer.publicKey);
  console.log(`Current Testnet SOL:      ${solBal / 1e9} SOL (${solBal} lamports)`);

  const mintMetaPath = path.resolve(__dirname, '../../target/deploy/testnet-collateral-metadata.json');
  const mintMeta = JSON.parse(fs.readFileSync(mintMetaPath, 'utf8'));
  const collateralMint = new PublicKey(mintMeta.mint);
  const deployerCollateralAta = new PublicKey(mintMeta.deployerAta);
  console.log('Shared testUSDC Mint:     ', collateralMint.toBase58());
  console.log('Deployer testUSDC ATA:    ', deployerCollateralAta.toBase58());

  const idlPath = path.resolve(__dirname, 'lib/solana/idl.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const dummyWallet = new anchor.Wallet(deployer);
  const provider = new anchor.AnchorProvider(connection, dummyWallet, {});
  const program = new anchor.Program(idl, provider);
  console.log('HedgeHouse Program ID:    ', program.programId.toBase58());

  const results = {};

  // 2. Iterate through all 4 markets
  for (const m of MARKETS_CONFIG) {
    console.log(`\n----------------------------------------------------------------------`);
    console.log(`MARKET: ${m.name.toUpperCase()} (${m.id})`);
    console.log(`----------------------------------------------------------------------`);

    const marketIdBuf = stringToBuffer(m.id, 32);
    const [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('market'), marketIdBuf],
      program.programId
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), marketPda.toBuffer()],
      program.programId
    );
    const [yesMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('yes_mint'), marketPda.toBuffer()],
      program.programId
    );
    const [noMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('no_mint'), marketPda.toBuffer()],
      program.programId
    );

    console.log('  Market PDA:    ', marketPda.toBase58());
    console.log('  Vault PDA:     ', vaultPda.toBase58());
    console.log('  YES Mint PDA:  ', yesMintPda.toBase58());
    console.log('  NO Mint PDA:   ', noMintPda.toBase58());

    let createMarketSig = null;

    // Check if market account already exists
    const marketAccountInfo = await connection.getAccountInfo(marketPda, 'confirmed');
    if (marketAccountInfo) {
      console.log('  Market account already initialized on Testnet.');
    } else {
      console.log('  Creating market on Testnet...');
      const params = {
        marketId: stringToU8Array(m.id, 32),
        countryCode: stringToU8Array(m.countryCode, 4),
        regionId: stringToU8Array(m.regionId, 32),
        providerId: stringToU8Array(m.providerId, 16),
        seriesId: stringToU8Array(m.seriesId, 32),
        baselinePeriod: stringToU8Array(m.baselinePeriod, 16),
        targetPeriod: stringToU8Array(m.targetPeriod, 16),
        comparisonType: m.comparisonType,
        thresholdBps: m.thresholdBps,
        resolutionDeadline: new anchor.BN(m.resolutionDeadline),
        resolverAuthority: deployer.publicKey
      };

      const createIx = await program.methods
        .createMarket(params)
        .accounts({
          market: marketPda,
          authority: deployer.publicKey,
          collateralMint: collateralMint,
          collateralVault: vaultPda,
          yesMint: yesMintPda,
          noMint: noMintPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY
        })
        .instruction();

      const tx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
        createIx
      );

      createMarketSig = await sendAndConfirmTx(
        connection,
        tx,
        [deployer],
        `Create Market ${m.name}`
      );
    }

    // Verify on-chain market data directly
    const fetchedMarket = await program.account.market.fetch(marketPda);
    console.log('  On-Chain Verification:');
    console.log('    Authority:            ', fetchedMarket.authority.toBase58());
    console.log('    Status:               ', fetchedMarket.status, '(0 = Open)');
    console.log('    Outcome:              ', fetchedMarket.outcome, '(0 = Unresolved)');
    console.log('    Total Collateral:     ', fetchedMarket.totalCollateral.toString());
    console.log('    Total Matched Pairs:  ', fetchedMarket.totalMatchedPairs.toString());
    console.log('    Collateral Mint:      ', fetchedMarket.collateralMint.toBase58());

    if (fetchedMarket.collateralMint.toBase58() !== collateralMint.toBase58()) {
      throw new Error(`Collateral mint mismatch on market ${m.id}`);
    }

    // -------------------------------------------------------------
    // REAL TESTNET E2E: DEPOSIT & REDEEM
    // -------------------------------------------------------------
    console.log(`\n  Executing Real Testnet E2E Flow on ${m.name}...`);
    const userYesAta = getAssociatedTokenAddressSync(yesMintPda, deployer.publicKey);
    const userNoAta = getAssociatedTokenAddressSync(noMintPda, deployer.publicKey);

    // E2E Deposit: 15.000000 testUSDC
    const depositAmountUsdc = 15;
    const depositBaseUnits = BigInt(depositAmountUsdc * 1e6); // 15_000_000n

    const depositIx = await program.methods
      .depositCollateral(new anchor.BN(depositBaseUnits.toString()))
      .accounts({
        market: marketPda,
        user: deployer.publicKey,
        userCollateral: deployerCollateralAta,
        collateralVault: vaultPda,
        collateralMint: collateralMint,
        yesMint: yesMintPda,
        noMint: noMintPda,
        userYes: userYesAta,
        userNo: userNoAta,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    const depositTx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
      createAssociatedTokenAccountIdempotentInstruction(
        deployer.publicKey,
        userYesAta,
        deployer.publicKey,
        yesMintPda
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        deployer.publicKey,
        userNoAta,
        deployer.publicKey,
        noMintPda
      ),
      depositIx
    );

    const depositSig = await sendAndConfirmTx(
      connection,
      depositTx,
      [deployer],
      `Deposit 15 testUSDC on ${m.name}`
    );

    // Check post-deposit balances
    const postDepYes = await connection.getTokenAccountBalance(userYesAta);
    const postDepNo = await connection.getTokenAccountBalance(userNoAta);
    console.log(`  Post-Deposit YES tokens: ${postDepYes.value.uiAmountString}`);
    console.log(`  Post-Deposit NO tokens:  ${postDepNo.value.uiAmountString}`);

    // E2E Redeem: 5.000000 pairs (5 YES + 5 NO -> 5 testUSDC returned)
    const redeemAmountUsdc = 5;
    const redeemBaseUnits = BigInt(redeemAmountUsdc * 1e6); // 5_000_000n

    const redeemIx = await program.methods
      .redeemPair(new anchor.BN(redeemBaseUnits.toString()))
      .accounts({
        market: marketPda,
        user: deployer.publicKey,
        userCollateral: deployerCollateralAta,
        collateralVault: vaultPda,
        yesMint: yesMintPda,
        noMint: noMintPda,
        userYes: userYesAta,
        userNo: userNoAta,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    const redeemTx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
      redeemIx
    );

    const redeemSig = await sendAndConfirmTx(
      connection,
      redeemTx,
      [deployer],
      `Redeem 5 pairs on ${m.name}`
    );

    const postRedeemYes = await connection.getTokenAccountBalance(userYesAta);
    const postRedeemNo = await connection.getTokenAccountBalance(userNoAta);
    console.log(`  Post-Redeem YES tokens:  ${postRedeemYes.value.uiAmountString}`);
    console.log(`  Post-Redeem NO tokens:   ${postRedeemNo.value.uiAmountString}`);

    results[m.id] = {
      name: m.name,
      id: m.id,
      marketPda: marketPda.toBase58(),
      vaultPda: vaultPda.toBase58(),
      yesMint: yesMintPda.toBase58(),
      noMint: noMintPda.toBase58(),
      createMarketSignature: createMarketSig || 'EXISTING',
      depositTxSignature: depositSig,
      redeemTxSignature: redeemSig,
      status: 'TESTNET ACTIVE'
    };
  }

  // -------------------------------------------------------------
  // STEP 4: PERMISSIONLESS FLOW PROOF
  // -------------------------------------------------------------
  console.log(`\n======================================================================`);
  console.log(`STEP 4: VERIFYING PERMISSIONLESS USER FLOW WITH A SEPARATE WALLET`);
  console.log(`======================================================================`);

  const externalUser = Keypair.generate();
  console.log('Generated External Test User: ', externalUser.publicKey.toBase58());

  // Transfer 0.05 SOL to external user for gas fees
  const fundSolTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: deployer.publicKey,
      toPubkey: externalUser.publicKey,
      lamports: 50_000_000 // 0.05 SOL
    })
  );
  await sendAndConfirmTx(connection, fundSolTx, [deployer], 'Fund External User SOL');

  // Create external user's testUSDC ATA and transfer 50 testUSDC from deployer
  const externalUserCollateralAta = getAssociatedTokenAddressSync(collateralMint, externalUser.publicKey);
  const fundUsdcTx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      deployer.publicKey,
      externalUserCollateralAta,
      externalUser.publicKey,
      collateralMint
    )
  );
  await sendAndConfirmTx(connection, fundUsdcTx, [deployer], 'Create External User testUSDC ATA');

  // Transfer 50 testUSDC (50_000_000 units) from deployer to external user
  const splToken = require('@solana/spl-token');
  const transferIx = splToken.createTransferInstruction(
    deployerCollateralAta,
    externalUserCollateralAta,
    deployer.publicKey,
    50_000_000n
  );
  const transferTx = new Transaction().add(transferIx);
  await sendAndConfirmTx(connection, transferTx, [deployer], 'Transfer 50 testUSDC to External User');

  // External user deposits 20 testUSDC on Miami without ANY admin/deployer signature!
  console.log('Testing External User deposit (NO ADMIN SIGNATURE REQUIRED)...');
  const miamiResult = results['miami-fhfa-2027q2-decline'];
  const miamiMarketPda = new PublicKey(miamiResult.marketPda);
  const miamiVaultPda = new PublicKey(miamiResult.vaultPda);
  const miamiYesMint = new PublicKey(miamiResult.yesMint);
  const miamiNoMint = new PublicKey(miamiResult.noMint);

  const extYesAta = getAssociatedTokenAddressSync(miamiYesMint, externalUser.publicKey);
  const extNoAta = getAssociatedTokenAddressSync(miamiNoMint, externalUser.publicKey);

  const extDepositIx = await program.methods
    .depositCollateral(new anchor.BN('20000000'))
    .accounts({
      market: miamiMarketPda,
      user: externalUser.publicKey,
      userCollateral: externalUserCollateralAta,
      collateralVault: miamiVaultPda,
      collateralMint: collateralMint,
      yesMint: miamiYesMint,
      noMint: miamiNoMint,
      userYes: extYesAta,
      userNo: extNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  const extDepositTx = new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      externalUser.publicKey,
      extYesAta,
      externalUser.publicKey,
      miamiYesMint
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      externalUser.publicKey,
      extNoAta,
      externalUser.publicKey,
      miamiNoMint
    ),
    extDepositIx
  );

  // NOTE: ONLY externalUser signs! Deployer DOES NOT sign!
  const extDepositSig = await sendAndConfirmTx(
    connection,
    extDepositTx,
    [externalUser],
    'External User Autonomous Deposit'
  );
  console.log('  ✓ External User deposit succeeded permissionlessly! Sig:', extDepositSig);

  // External user redeems 10 pairs
  const extRedeemIx = await program.methods
    .redeemPair(new anchor.BN('10000000'))
    .accounts({
      market: miamiMarketPda,
      user: externalUser.publicKey,
      userCollateral: externalUserCollateralAta,
      collateralVault: miamiVaultPda,
      yesMint: miamiYesMint,
      noMint: miamiNoMint,
      userYes: extYesAta,
      userNo: extNoAta,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .instruction();

  const extRedeemTx = new Transaction().add(extRedeemIx);
  const extRedeemSig = await sendAndConfirmTx(
    connection,
    extRedeemTx,
    [externalUser],
    'External User Autonomous Redeem'
  );
  console.log('  ✓ External User redeem succeeded permissionlessly! Sig:', extRedeemSig);

  // Save all results to disk
  const outputPath = path.resolve(__dirname, '../../target/deploy/testnet-markets-metadata.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        cluster: 'testnet',
        programId: program.programId.toBase58(),
        collateralMint: collateralMint.toBase58(),
        markets: results,
        permissionlessVerification: {
          testWallet: externalUser.publicKey.toBase58(),
          depositSignature: extDepositSig,
          redeemSignature: extRedeemSig
        }
      },
      null,
      2
    )
  );

  console.log('\n======================================================================');
  console.log('ALL 4 TESTNET MARKETS INITIALIZED & E2E VERIFIED SUCCESSFULLY!');
  console.log('Metadata written to:', outputPath);
  console.log('======================================================================');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR IN TESTNET RUN]:', err);
  process.exit(1);
});
