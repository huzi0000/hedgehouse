use crate::errors::HedgeHouseError;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(
        mut,
        seeds = [MARKET_SEED, market.market_id.as_ref()],
        bump = market.bump,
        has_one = collateral_vault @ HedgeHouseError::InvalidVault,
        has_one = collateral_mint @ HedgeHouseError::MismatchedCollateralMint,
    )]
    pub market: Account<'info, Market>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_collateral.mint == market.collateral_mint @ HedgeHouseError::MismatchedCollateralMint,
        constraint = user_collateral.owner == user.key()
    )]
    pub user_collateral: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = collateral_vault.key() == market.collateral_vault @ HedgeHouseError::InvalidVault,
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    pub collateral_mint: Account<'info, Mint>,

    /// The winning token mint (must match market.yes_mint or market.no_mint depending on outcome)
    #[account(mut)]
    pub winning_mint: Account<'info, Mint>,

    /// User's token account for the winning token
    #[account(
        mut,
        constraint = user_winning_token_account.mint == winning_mint.key() @ HedgeHouseError::InvalidWinningToken,
        constraint = user_winning_token_account.owner == user.key()
    )]
    pub user_winning_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn process_claim_winnings(ctx: Context<ClaimWinnings>, amount: u64) -> Result<()> {
    require!(amount > 0, HedgeHouseError::ZeroAmount);

    let market = &mut ctx.accounts.market;

    // Market must be in Resolved state
    require!(
        market.status == MarketStatus::Resolved as u8,
        HedgeHouseError::MarketNotResolved
    );

    // Verify submitted winning mint matches actual resolution outcome
    if market.outcome == MarketOutcome::Yes as u8 {
        require!(
            ctx.accounts.winning_mint.key() == market.yes_mint,
            HedgeHouseError::InvalidWinningToken
        );
    } else if market.outcome == MarketOutcome::No as u8 {
        require!(
            ctx.accounts.winning_mint.key() == market.no_mint,
            HedgeHouseError::InvalidWinningToken
        );
    } else {
        return err!(HedgeHouseError::InvalidOutcome);
    }

    // Vault solvency check
    require!(
        market.total_collateral >= amount,
        HedgeHouseError::InsufficientCollateral
    );

    // 1. Burn winning position tokens from user
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.winning_mint.to_account_info(),
            from: ctx.accounts.user_winning_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::burn(burn_ctx, amount)?;

    // 2. Transfer collateral payout from vault to user (signed by Market PDA)
    let market_id = market.market_id;
    let bump = market.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[MARKET_SEED, market_id.as_ref(), &[bump]]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.collateral_vault.to_account_info(),
            to: ctx.accounts.user_collateral.to_account_info(),
            authority: market.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, amount)?;

    // 3. Update accounting safely
    market.total_collateral = market
        .total_collateral
        .checked_sub(amount)
        .ok_or(HedgeHouseError::ArithmeticOverflow)?;

    msg!(
        "Claimed {} collateral by burning winning tokens. Remaining vault collateral: {}",
        amount,
        market.total_collateral
    );

    Ok(())
}
