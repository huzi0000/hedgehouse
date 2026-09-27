import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function sighash(nameSpace: string, name: string): number[] {
  const preimage = `${nameSpace}:${name}`;
  const hash = crypto.createHash('sha256').update(preimage).digest();
  return Array.from(hash.subarray(0, 8));
}

const idl = {
  address: "J75RtYgFYkCk3wMbGwGrBSZVc8x3CeHFoKRnLBuoCNvi",
  metadata: {
    name: "hedgehouse",
    version: "0.1.0",
    spec: "0.1.0",
    description: "HedgeHouse Core Housing Risk Market Protocol on Solana"
  },
  instructions: [
    {
      name: "create_market",
      discriminator: sighash("global", "create_market"),
      accounts: [
        { name: "market", writable: true, signer: false },
        { name: "authority", writable: true, signer: true },
        { name: "collateral_mint", writable: false, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "yes_mint", writable: true, signer: false },
        { name: "no_mint", writable: true, signer: false },
        { name: "system_program", writable: false, signer: false, address: "11111111111111111111111111111111" },
        { name: "token_program", writable: false, signer: false, address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { name: "rent", writable: false, signer: false, address: "SysvarRent111111111111111111111111111111111" }
      ],
      args: [
        {
          name: "params",
          type: { defined: { name: "CreateMarketParams" } }
        }
      ]
    },
    {
      name: "deposit_collateral",
      discriminator: sighash("global", "deposit_collateral"),
      accounts: [
        { name: "market", writable: true, signer: false },
        { name: "user", writable: true, signer: true },
        { name: "user_collateral", writable: true, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "collateral_mint", writable: false, signer: false },
        { name: "yes_mint", writable: true, signer: false },
        { name: "no_mint", writable: true, signer: false },
        { name: "user_yes", writable: true, signer: false },
        { name: "user_no", writable: true, signer: false },
        { name: "token_program", writable: false, signer: false, address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }
      ],
      args: [
        { name: "amount", type: "u64" }
      ]
    },
    {
      name: "redeem_pair",
      discriminator: sighash("global", "redeem_pair"),
      accounts: [
        { name: "market", writable: true, signer: false },
        { name: "user", writable: true, signer: true },
        { name: "user_collateral", writable: true, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "yes_mint", writable: true, signer: false },
        { name: "no_mint", writable: true, signer: false },
        { name: "user_yes", writable: true, signer: false },
        { name: "user_no", writable: true, signer: false },
        { name: "token_program", writable: false, signer: false, address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }
      ],
      args: [
        { name: "amount", type: "u64" }
      ]
    },
    {
      name: "resolve_market",
      discriminator: sighash("global", "resolve_market"),
      accounts: [
        { name: "market", writable: true, signer: false },
        { name: "resolver_authority", writable: false, signer: true }
      ],
      args: [
        { name: "outcome", type: "u8" }
      ]
    },
    {
      name: "claim_winnings",
      discriminator: sighash("global", "claim_winnings"),
      accounts: [
        { name: "market", writable: true, signer: false },
        { name: "user", writable: true, signer: true },
        { name: "user_collateral", writable: true, signer: false },
        { name: "collateral_vault", writable: true, signer: false },
        { name: "collateral_mint", writable: false, signer: false },
        { name: "winning_mint", writable: true, signer: false },
        { name: "user_winning_token_account", writable: true, signer: false },
        { name: "token_program", writable: false, signer: false, address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }
      ],
      args: [
        { name: "amount", type: "u64" }
      ]
    }
  ],
  accounts: [
    {
      name: "Market",
      discriminator: sighash("account", "Market")
    }
  ],
  types: [
    {
      name: "CreateMarketParams",
      type: {
        kind: "struct",
        fields: [
          { name: "market_id", type: { array: ["u8", 32] } },
          { name: "country_code", type: { array: ["u8", 4] } },
          { name: "region_id", type: { array: ["u8", 32] } },
          { name: "provider_id", type: { array: ["u8", 16] } },
          { name: "series_id", type: { array: ["u8", 32] } },
          { name: "baseline_period", type: { array: ["u8", 16] } },
          { name: "target_period", type: { array: ["u8", 16] } },
          { name: "comparison_type", type: "u8" },
          { name: "threshold_bps", type: "i32" },
          { name: "resolution_deadline", type: "i64" },
          { name: "resolver_authority", type: "pubkey" }
        ]
      }
    },
    {
      name: "Market",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "pubkey" },
          { name: "market_id", type: { array: ["u8", 32] } },
          { name: "country_code", type: { array: ["u8", 4] } },
          { name: "region_id", type: { array: ["u8", 32] } },
          { name: "provider_id", type: { array: ["u8", 16] } },
          { name: "series_id", type: { array: ["u8", 32] } },
          { name: "baseline_period", type: { array: ["u8", 16] } },
          { name: "target_period", type: { array: ["u8", 16] } },
          { name: "comparison_type", type: "u8" },
          { name: "threshold_bps", type: "i32" },
          { name: "yes_mint", type: "pubkey" },
          { name: "no_mint", type: "pubkey" },
          { name: "collateral_mint", type: "pubkey" },
          { name: "collateral_vault", type: "pubkey" },
          { name: "total_collateral", type: "u64" },
          { name: "total_matched_pairs", type: "u64" },
          { name: "status", type: "u8" },
          { name: "outcome", type: "u8" },
          { name: "created_at", type: "i64" },
          { name: "resolution_deadline", type: "i64" },
          { name: "resolved_at", type: "i64" },
          { name: "resolver_authority", type: "pubkey" },
          { name: "bump", type: "u8" },
          { name: "vault_bump", type: "u8" },
          { name: "yes_mint_bump", type: "u8" },
          { name: "no_mint_bump", type: "u8" }
        ]
      }
    }
  ],
  errors: [
    { code: 6000, name: "MarketNotOpen", msg: "Market is not in Open status." },
    { code: 6001, name: "MarketAlreadyResolved", msg: "Market has already been resolved." },
    { code: 6002, name: "MarketNotResolved", msg: "Market is not yet resolved." },
    { code: 6003, name: "MarketCancelled", msg: "Market has been cancelled." },
    { code: 6004, name: "InvalidOutcome", msg: "Invalid resolution outcome provided. Must be Yes (1) or No (2)." },
    { code: 6005, name: "UnauthorizedResolver", msg: "Signer is not the authorized resolver authority." },
    { code: 6006, name: "InvalidPeriods", msg: "Invalid periods: baseline and target period cannot be identical." },
    { code: 6007, name: "InvalidResolutionDeadline", msg: "Resolution deadline must be set to a future timestamp." },
    { code: 6008, name: "InvalidComparisonType", msg: "Invalid comparison type specified." },
    { code: 6009, name: "ZeroAmount", msg: "Transaction amount must be strictly greater than zero." },
    { code: 6010, name: "InsufficientCollateral", msg: "Insufficient collateral in vault for requested operation." },
    { code: 6011, name: "ArithmeticOverflow", msg: "Math operation resulted in an arithmetic overflow or underflow." },
    { code: 6012, name: "InvalidWinningToken", msg: "The submitted token mint does not match the winning outcome." },
    { code: 6013, name: "InvalidTokenMint", msg: "Submitted token mint does not match the market position mint." },
    { code: 6014, name: "InvalidVault", msg: "Submitted vault does not match the market collateral vault." },
    { code: 6015, name: "MismatchedCollateralMint", msg: "Submitted collateral mint does not match market collateral mint." },
    { code: 6016, name: "EmptyMetadata", msg: "Required market identifier or metadata field cannot be empty." },
    { code: 6017, name: "ResolutionBeforeDeadline", msg: "Resolution cannot occur before the resolution deadline." }
  ]
};

const idlDir = path.resolve('target/idl');
if (!fs.existsSync(idlDir)) {
  fs.mkdirSync(idlDir, { recursive: true });
}

const idlPath = path.join(idlDir, 'hedgehouse.json');
fs.writeFileSync(idlPath, JSON.stringify(idl, null, 2));
console.log(`Generated IDL at: ${idlPath}`);
