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
const DEVNET_RPC = 'https://api.devnet.solana.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('====================================================');
  console.log('HEDGEHOUSE — FAST DEVNET DEPLOYMENT');
  console.log('====================================================');

  const connection = new Connection(DEVNET_RPC, {
    commitment: 'confirmed',
    wsEndpoint: null
  });

  const deployerKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/deployer-keypair.json'), 'utf8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  console.log('Deployer Pubkey:', deployer.publicKey.toBase58());

  const programKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/hedgehouse-keypair.json'), 'utf8'));
  const program = Keypair.fromSecretKey(Uint8Array.from(programKey));
  console.log('Program Pubkey: ', program.publicKey.toBase58());

  const bufferKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/buffer-keypair.json'), 'utf8'));
  const bufferKeypair = Keypair.fromSecretKey(Uint8Array.from(bufferKey));
  console.log('Buffer Pubkey:  ', bufferKeypair.publicKey.toBase58());

  const soPath = path.resolve(__dirname, '../../target/deploy/hedgehouse.so');
  const elf = fs.readFileSync(soPath);
  console.log(`Bytecode size: ${elf.length} bytes`);

  const numChunks = Math.ceil(elf.length / CHUNK_SIZE);
  console.log(`Total chunks: ${numChunks} (${CHUNK_SIZE} bytes/chunk)`);

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

  // Pre-build all chunk transactions
  console.log('Building all chunk transactions...');
  const chunkTxs = [];
  for (let chunkIdx = 0; chunkIdx < numChunks; chunkIdx++) {
    const offset = chunkIdx * CHUNK_SIZE;
    const end = Math.min(offset + CHUNK_SIZE, elf.length);
    const chunkBytes = elf.slice(offset, end);

    const writeData = Buffer.alloc(4 + 4 + 8 + chunkBytes.length);
    writeData.writeUInt32LE(1, 0); // Write instruction = 1
    writeData.writeUInt32LE(offset, 4);
    writeData.writeBigUInt64LE(BigInt(chunkBytes.length), 8);
    chunkBytes.copy(writeData, 16);

    const ix = new TransactionInstruction({
      programId: BPF_LOADER_UPGRADEABLE_PID,
      keys: [
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: deployer.publicKey, isSigner: true, isWritable: false }
      ],
      data: writeData
    });

    chunkTxs.push(ix);
  }

  // PASS 1: Stream all chunks with rate-limit pacing
  console.log('\n--- PASS 1: Streaming all 432 chunks to Devnet buffer ---');
  let blockhash = await getFreshBlockhash();
  let blockhashTime = Date.now();

  for (let i = 0; i < numChunks; i++) {
    if (Date.now() - blockhashTime > 30000) {
      blockhash = await getFreshBlockhash();
      blockhashTime = Date.now();
    }

    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }),
      chunkTxs[i]
    );
    tx.recentBlockhash = blockhash;
    tx.feePayer = deployer.publicKey;
    tx.sign(deployer);

    let sent = false;
    for (let retry = 0; retry < 5 && !sent; retry++) {
      try {
        await connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: true,
          maxRetries: 5
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

    const pct = (((i + 1) / numChunks) * 100).toFixed(1);
    process.stdout.write(`\rPass 1: Sent chunk ${i + 1}/${numChunks} (${pct}%)`);
    await sleep(150); // 150ms delay between chunks stays well within limits
  }

  console.log('\nPass 1 complete. Pausing 10s for network propagation...');
  await sleep(10000);

  // PASS 2: Quick reinforcement pass for any dropped UDP/RPC packets
  console.log('\n--- PASS 2: Quick reinforcement pass for complete coverage ---');
  blockhash = await getFreshBlockhash();
  blockhashTime = Date.now();

  for (let i = 0; i < numChunks; i += 2) { // sample and send every other chunk
    if (Date.now() - blockhashTime > 30000) {
      blockhash = await getFreshBlockhash();
      blockhashTime = Date.now();
    }

    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 150000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }),
      chunkTxs[i]
    );
    tx.recentBlockhash = blockhash;
    tx.feePayer = deployer.publicKey;
    tx.sign(deployer);

    try {
      await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
        maxRetries: 5
      });
    } catch (e) {}

    const pct = (((i + 1) / numChunks) * 100).toFixed(1);
    process.stdout.write(`\rPass 2: Reinforced chunk ${i + 1}/${numChunks} (${pct}%)`);
    await sleep(120);
  }

  console.log('\nPass 2 complete. Pausing 10s before deploy execution...');
  await sleep(10000);

  // STEP 3: DeployWithMaxDataLen
  console.log('\n--- EXECUTING PROGRAM DEPLOYMENT ---');
  const [programData] = PublicKey.findProgramAddressSync(
    [program.publicKey.toBuffer()],
    BPF_LOADER_UPGRADEABLE_PID
  );
  console.log('Derived ProgramData PDA:', programData.toBase58());

  const deployData = Buffer.alloc(4 + 8);
  deployData.writeUInt32LE(2, 0); // DeployWithMaxDataLen = 2
  deployData.writeBigUInt64LE(BigInt(elf.length), 4);

  const freshBlockhash = await getFreshBlockhash();

  const deployTx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
    new TransactionInstruction({
      programId: BPF_LOADER_UPGRADEABLE_PID,
      keys: [
        { pubkey: deployer.publicKey, isSigner: true, isWritable: true },
        { pubkey: programData, isSigner: false, isWritable: true },
        { pubkey: program.publicKey, isSigner: true, isWritable: true },
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: deployer.publicKey, isSigner: true, isWritable: false }
      ],
      data: deployData
    })
  );
  deployTx.recentBlockhash = freshBlockhash;
  deployTx.feePayer = deployer.publicKey;
  deployTx.sign(deployer, program);

  console.log('Submitting DeployWithMaxDataLen to Solana Devnet...');
  const deploySig = await connection.sendRawTransaction(deployTx.serialize(), {
    skipPreflight: false,
    maxRetries: 5
  });

  console.log('Waiting for Deploy confirmation. Signature:', deploySig);
  let confirmed = false;
  for (let w = 0; w < 30; w++) {
    await sleep(2000);
    try {
      const st = await connection.getSignatureStatus(deploySig);
      if (st && st.value && (st.value.confirmationStatus === 'confirmed' || st.value.confirmationStatus === 'finalized')) {
        if (st.value.err) {
          throw new Error(`Deploy failed on-chain: ${JSON.stringify(st.value.err)}`);
        }
        confirmed = true;
        break;
      }
    } catch (e) {
      if (e.message && e.message.includes('Deploy failed on-chain')) throw e;
    }
  }

  console.log('\n====================================================');
  console.log('HEDGEHOUSE PROGRAM SUCCESSFULLY DEPLOYED TO DEVNET!');
  console.log('====================================================');
  console.log('Program ID:       ', program.publicKey.toBase58());
  console.log('ProgramData PDA:  ', programData.toBase58());
  console.log('Deploy Signature: ', deploySig);
  console.log('Solana Explorer:');
  console.log(`https://explorer.solana.com/address/${program.publicKey.toBase58()}?cluster=devnet`);
  console.log(`https://explorer.solana.com/tx/${deploySig}?cluster=devnet`);
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});
