use anchor_lang::prelude::*;

#[error_code]
pub enum HedgeHouseError {
    #[msg("Market is not in Open status.")]
    MarketNotOpen,

    #[msg("Market has already been resolved.")]
    MarketAlreadyResolved,

    #[msg("Market is not yet resolved.")]
    MarketNotResolved,

    #[msg("Market has been cancelled.")]
    MarketCancelled,

    #[msg("Invalid resolution outcome provided. Must be Yes (1) or No (2).")]
    InvalidOutcome,

    #[msg("Signer is not the authorized resolver authority.")]
    UnauthorizedResolver,

    #[msg("Invalid periods: baseline and target period cannot be identical.")]
    InvalidPeriods,

    #[msg("Resolution deadline must be set to a future timestamp.")]
    InvalidResolutionDeadline,

    #[msg("Invalid comparison type specified.")]
    InvalidComparisonType,

    #[msg("Transaction amount must be strictly greater than zero.")]
    ZeroAmount,

    #[msg("Insufficient collateral in vault for requested operation.")]
    InsufficientCollateral,

    #[msg("Math operation resulted in an arithmetic overflow or underflow.")]
    ArithmeticOverflow,

    #[msg("The submitted token mint does not match the winning outcome.")]
    InvalidWinningToken,

    #[msg("Submitted token mint does not match the market position mint.")]
    InvalidTokenMint,

    #[msg("Submitted vault does not match the market collateral vault.")]
    InvalidVault,

    #[msg("Submitted collateral mint does not match market collateral mint.")]
    MismatchedCollateralMint,

    #[msg("Required market identifier or metadata field cannot be empty.")]
    EmptyMetadata,

    #[msg("Resolution cannot occur before the resolution deadline.")]
    ResolutionBeforeDeadline,
}
