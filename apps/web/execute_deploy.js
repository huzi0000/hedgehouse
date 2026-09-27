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
const DEVNET_RPC = 'https://api.devnet.solana.com';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Connecting to Solana Devnet...');
  const connection = new Connection(DEVNET_RPC, {
    commitment: 'confirmed',
    wsEndpoint: null
  });

  const deployerKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/deployer-keypair.json'), 'utf8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(deployerKey));
  console.log('Deployer Pubkey:    ', deployer.publicKey.toBase58());

  const programKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/hedgehouse-keypair.json'), 'utf8'));
  const program = Keypair.fromSecretKey(Uint8Array.from(programKey));
  console.log('Program Pubkey:     ', program.publicKey.toBase58());

  const bufferKey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../target/deploy/buffer-keypair.json'), 'utf8'));
  const bufferKeypair = Keypair.fromSecretKey(Uint8Array.from(bufferKey));
  console.log('Buffer Pubkey:      ', bufferKeypair.publicKey.toBase58());

  const soPath = path.resolve(__dirname, '../../target/deploy/hedgehouse.so');
  const elf = fs.readFileSync(soPath);
  console.log(`Bytecode size:      ${elf.length} bytes`);

  const [programData] = PublicKey.findProgramAddressSync(
    [program.publicKey.toBuffer()],
    BPF_LOADER_UPGRADEABLE_PID
  );
  console.log('ProgramData PDA:    ', programData.toBase58());

  // Check balance of deployer
  const balance = await connection.getBalance(deployer.publicKey, 'confirmed');
  console.log(`Deployer balance:   ${(balance / 1e9).toFixed(4)} SOL`);

  // Rent for program account (36 bytes)
  const programRent = await connection.getMinimumBalanceForRentExemption(36);
  console.log(`Program account rent: ${programRent} lamports (${(programRent / 1e9).toFixed(6)} SOL)`);

  const deployData = Buffer.alloc(4 + 8);
  deployData.writeUInt32LE(2, 0); // DeployWithMaxDataLen = 2
  deployData.writeBigUInt64LE(BigInt(elf.length), 4);

  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const tx = new Transaction();
  tx.add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 }),
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

  tx.recentBlockhash = blockhash;
  tx.feePayer = deployer.publicKey;
  tx.sign(deployer, program);

  console.log('\nSubmitting deploy transaction (createAccount + DeployWithMaxDataLen)...');
  const sig = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 5,
  });
  console.log('Deploy transaction submitted! Signature:', sig);
  console.log('Waiting for confirmation...');

  for (let w = 0; w < 60; w++) {
    await sleep(2000);
    try {
      const st = await connection.getSignatureStatus(sig);
      if (st && st.value && (st.value.confirmationStatus === 'confirmed' || st.value.confirmationStatus === 'finalized')) {
        if (st.value.err) {
          throw new Error(`Deploy failed on-chain: ${JSON.stringify(st.value.err)}`);
        }
        console.log(`\nTransaction confirmed! Status: ${st.value.confirmationStatus}`);
        break;
      }
    } catch (e) {
      if (e.message && e.message.includes('Deploy failed on-chain')) throw e;
    }
    process.stdout.write('.');
  }

  console.log('\n====================================================');
  console.log('HEDGEHOUSE PROGRAM SUCCESSFULLY DEPLOYED TO DEVNET!');
  console.log('====================================================');
  console.log('Program ID:       ', program.publicKey.toBase58());
  console.log('ProgramData PDA:  ', programData.toBase58());
  console.log('Deploy Signature: ', sig);
  console.log('Solana Explorer:');
  console.log(`https://explorer.solana.com/address/${program.publicKey.toBase58()}?cluster=devnet`);
  console.log(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});
