pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4gcFVNzdA4yjWsQvCh95tga3GUwHVLvPn1k1EM8dvUpn");

#[program]
pub mod swap {

    use super::*;

    pub fn make_offer(
        mut ctx: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
    ) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault(&ctx, token_a_offered_amount)?;
        instructions::make_offer::save_offer(&mut ctx, id, token_b_wanted_amount)
    }
}
