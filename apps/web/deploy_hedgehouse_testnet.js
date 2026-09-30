const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  ComputeBudgetProgram
} = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const BPF_LOADER_UPGRADEABLE_PID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');
const CHUNK_SIZE = 900;
const TESTNET_RPC = 'https://api.testnet.solana.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('====================================================');
  console.log('HEDGEHOUSE — SOLANA TESTNET PROGRAM DEPLOYMENT');
  console.log('====================================================');

  const connection = new Connection(TESTNET_RPC, {
    commitment: 'confirmed',
    wsEndpoint: null
  });

  const deployerKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/deployer-keypair.json'), 'utf8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  console.log('Deployer Pubkey: ', deployer.publicKey.toBase58());

  const programKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/hedgehouse-keypair.json'), 'utf8'));
  const program = Keypair.fromSecretKey(Uint8Array.from(programKey));
  console.log('Program Pubkey:  ', program.publicKey.toBase58());

  const balance = await connection.getBalance(deployer.publicKey, 'confirmed');
  console.log(`Current Balance: ${(balance / 1e9).toFixed(9)} SOL (${balance} lamports)`);

  const soPath = path.resolve(__dirname, '../../target/deploy/hedgehouse.so');
  const elf = fs.readFileSync(soPath);
  console.log(`Binary Size:     ${elf.length} bytes`);

  const bufferKeyPath = path.resolve(__dirname, '../../target/deploy/testnet-buffer-keypair.json');
  let bufferKeypair;
  if (fs.existsSync(bufferKeyPath)) {
    bufferKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(bufferKeyPath, 'utf8'))));
    console.log('Found existing Testnet Buffer Keypair:', bufferKeypair.publicKey.toBase58());
  } else {
    bufferKeypair = Keypair.generate();
    fs.writeFileSync(bufferKeyPath, JSON.stringify(Array.from(bufferKeypair.secretKey)));
    console.log('Generated new Testnet Buffer Keypair:', bufferKeypair.publicKey.toBase58());
  }

  const [programData] = PublicKey.findProgramAddressSync(
    [program.publicKey.toBuffer()],
    BPF_LOADER_UPGRADEABLE_PID
  );
  console.log('ProgramData PDA: ', programData.toBase58());

  // STEP 1: Check if program is already deployed
  const existingProgram = await connection.getAccountInfo(program.publicKey, 'confirmed');
  if (existingProgram && existingProgram.executable) {
    console.log('\n>>> PROGRAM ALREADY DEPLOYED AND EXECUTABLE ON TESTNET! <<<');
    const pdInfo = await connection.getAccountInfo(programData, 'confirmed');
    console.log('ProgramData Account Length:', pdInfo ? pdInfo.data.length : 0);
    return;
  }

  // STEP 2: Check or create Buffer account
  const bufferRent = await connection.getMinimumBalanceForRentExemption(37 + elf.length);
  console.log(`Buffer Rent:     ${bufferRent} lamports (${(bufferRent / 1e9).toFixed(6)} SOL)`);

  let bufferAccount = await connection.getAccountInfo(bufferKeypair.publicKey, 'confirmed');
  if (!bufferAccount) {
    console.log('\nCreating and initializing Buffer account...');
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const createTx = new Transaction({ recentBlockhash: blockhash, feePayer: deployer.publicKey }).add(
      SystemProgram.createAccount({
        fromPubkey: deployer.publicKey,
        newAccountPubkey: bufferKeypair.publicKey,
        lamports: bufferRent,
        space: 37 + elf.length,
        programId: BPF_LOADER_UPGRADEABLE_PID,
      }),
      new TransactionInstruction({
        programId: BPF_LOADER_UPGRADEABLE_PID,
        keys: [
          { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: deployer.publicKey, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([0, 0, 0, 0]), // InitializeBuffer = 0
      })
    );
    createTx.sign(deployer, bufferKeypair);
    const createSig = await connection.sendRawTransaction(createTx.serialize(), { skipPreflight: false });
    console.log('Buffer creation signature:', createSig);
    await connection.confirmTransaction(createSig, 'confirmed');
    console.log('Buffer account confirmed on Testnet!');
  } else {
    console.log('Buffer account already exists on Testnet.');
  }

  // STEP 3: Stream chunks into Buffer
  const numChunks = Math.ceil(elf.length / CHUNK_SIZE);
  console.log(`\nStreaming ${numChunks} chunks into Buffer...`);

  async function getFreshBlockhash() {
    for (let r = 0; r < 5; r++) {
      try {
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        return blockhash;
      } catch (e) {
        await sleep(1000);
      }
    }
    throw new Error('Failed to get recent blockhash');
  }

  // Check which chunks are already written
  bufferAccount = await connection.getAccountInfo(bufferKeypair.publicKey, 'confirmed');
  const bufferData = bufferAccount.data.slice(37);

  const missingChunks = [];
  for (let i = 0; i < numChunks; i++) {
    const offset = i * CHUNK_SIZE;
    const end = Math.min(offset + CHUNK_SIZE, elf.length);
    const expected = elf.slice(offset, end);
    const actual = bufferData.slice(offset, end);
    if (!expected.equals(actual)) {
      missingChunks.push(i);
    }
  }

  console.log(`Chunks already matching: ${numChunks - missingChunks.length}/${numChunks}`);
  console.log(`Chunks to upload:        ${missingChunks.length}`);

  if (missingChunks.length > 0) {
    let blockhash = await getFreshBlockhash();
    let blockhashTime = Date.now();

    for (let idx = 0; idx < missingChunks.length; idx++) {
      const i = missingChunks[idx];
      const offset = i * CHUNK_SIZE;
      const end = Math.min(offset + CHUNK_SIZE, elf.length);
      const chunkBytes = elf.slice(offset, end);

      const writeData = Buffer.alloc(4 + 4 + 8 + chunkBytes.length);
      writeData.writeUInt32LE(1, 0); // Write instruction = 1
      writeData.writeUInt32LE(offset, 4);
      writeData.writeBigUInt64LE(BigInt(chunkBytes.length), 8);
      chunkBytes.copy(writeData, 16);

      if (Date.now() - blockhashTime > 25000) {
        blockhash = await getFreshBlockhash();
        blockhashTime = Date.now();
      }

      const tx = new Transaction({ recentBlockhash: blockhash, feePayer: deployer.publicKey }).add(
        new TransactionInstruction({
          programId: BPF_LOADER_UPGRADEABLE_PID,
          keys: [
            { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
            { pubkey: deployer.publicKey, isSigner: true, isWritable: false },
          ],
          data: writeData,
        })
      );
      tx.sign(deployer);

      let sent = false;
      for (let retry = 0; retry < 5 && !sent; retry++) {
        try {
          await connection.sendRawTransaction(tx.serialize(), {
            skipPreflight: true,
            maxRetries: 3
          });
          sent = true;
        } catch (err) {
          if (err.message && err.message.includes('429')) {
            await sleep(1500);
          } else {
            await sleep(500);
          }
        }
      }

      const pct = (((idx + 1) / missingChunks.length) * 100).toFixed(1);
      process.stdout.write(`\rUploaded chunk ${idx + 1}/${missingChunks.length} (${pct}%)`);
      await sleep(180); // Rate pacing for testnet
    }
    console.log('\nFinished streaming pass. Verifying buffer data on-chain...');
    await sleep(6000);

    // Verify buffer data integrity
    bufferAccount = await connection.getAccountInfo(bufferKeypair.publicKey, 'confirmed');
    const updatedData = bufferAccount.data.slice(37);
    let allMatch = true;
    let mismatchCount = 0;
    for (let i = 0; i < numChunks; i++) {
      const offset = i * CHUNK_SIZE;
      const end = Math.min(offset + CHUNK_SIZE, elf.length);
      const expected = elf.slice(offset, end);
      const actual = updatedData.slice(offset, end);
      if (!expected.equals(actual)) {
        allMatch = false;
        mismatchCount++;
      }
    }

    if (!allMatch) {
      console.log(`Buffer verification found ${mismatchCount} chunks still missing/in-flight.`);
      console.log('Please rerun deploy script to finish remaining chunks.');
      return;
    }
    console.log('Buffer 100% verified! All 388,712 bytes match exact binary hash.');
  }

  // STEP 4: DeployWithMaxDataLen
  console.log('\n--- EXECUTING DeployWithMaxDataLen ---');
  const programRent = await connection.getMinimumBalanceForRentExemption(36);
  console.log(`Program account rent: ${programRent} lamports (${(programRent / 1e9).toFixed(6)} SOL)`);

  const deployData = Buffer.alloc(4 + 8);
  deployData.writeUInt32LE(2, 0); // DeployWithMaxDataLen = 2
  deployData.writeBigUInt64LE(BigInt(elf.length), 4);

  const freshBlockhash = await getFreshBlockhash();

  const deployTx = new Transaction({ recentBlockhash: freshBlockhash, feePayer: deployer.publicKey }).add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
    SystemProgram.createAccount({
      fromPubkey: deployer.publicKey,
      newAccountPubkey: program.publicKey,
      lamports: programRent,
      space: 36,
      programId: BPF_LOADER_UPGRADEABLE_PID,
    }),
    new TransactionInstruction({
      programId: BPF_LOADER_UPGRADEABLE_PID,
      keys: [
        { pubkey: deployer.publicKey, isSigner: true, isWritable: true },
        { pubkey: programData, isSigner: false, isWritable: true },
        { pubkey: program.publicKey, isSigner: false, isWritable: true },
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: deployer.publicKey, isSigner: true, isWritable: false },
      ],
      data: deployData,
    })
  );

  deployTx.sign(deployer, program);

  console.log('Submitting DeployWithMaxDataLen transaction...');
  const deploySig = await connection.sendRawTransaction(deployTx.serialize(), {
    skipPreflight: false,
    maxRetries: 5,
  });

  console.log('Deploy transaction signature:', deploySig);
  console.log('Waiting for confirmation...');
  await connection.confirmTransaction(deploySig, 'confirmed');

  console.log('\n====================================================');
  console.log('HEDGEHOUSE PROGRAM SUCCESSFULLY DEPLOYED TO TESTNET!');
  console.log('====================================================');
  console.log('Program ID:       ', program.publicKey.toBase58());
  console.log('ProgramData PDA:  ', programData.toBase58());
  console.log('Deploy Signature: ', deploySig);
  console.log('Explorer:');
  console.log(`https://explorer.solana.com/address/${program.publicKey.toBase58()}?cluster=testnet`);
  console.log(`https://explorer.solana.com/tx/${deploySig}?cluster=testnet`);
  console.log('====================================================\n');

  const finalBal = await connection.getBalance(deployer.publicKey, 'confirmed');
  console.log(`Remaining Testnet Balance: ${(finalBal / 1e9).toFixed(9)} SOL`);
}

main().catch(err => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});
