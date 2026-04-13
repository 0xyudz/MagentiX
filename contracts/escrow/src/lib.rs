#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contract]
pub struct EscrowContract;

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub agent: Address,
    pub merchant: Address,
    pub amount: i128,
    pub released: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Payment(Symbol),
}

#[contractimpl]
impl EscrowContract {
    /// Agent deposit dana ke escrow
    pub fn create_payment(env: Env, payment_id: Symbol, agent: Address, merchant: Address, amount: i128) -> Symbol {
        agent.require_auth();
        
        let payment = Payment {
            agent: agent.clone(),
            merchant: merchant.clone(),
            amount,
            released: false,
        };
        
        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        env.events().publish(("payment_created", payment_id.clone()), (agent, merchant, amount));
        
        payment_id
    }

    /// Merchant release dana setelah service delivered
    pub fn release_payment(env: Env, payment_id: Symbol, merchant: Address) {
        merchant.require_auth();
        
        let mut payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone())) // ✅ FIX: Clone di sini
            .unwrap_or_else(|| panic!("Payment not found"));
        
        if payment.released {
            panic!("Already released");
        }
        
        if payment.merchant != merchant {
            panic!("Unauthorized");
        }
        
        payment.released = true;
        // ✅ FIX: Clone payment_id sebelum dipakai lagi di events
        env.storage().persistent().set(&DataKey::Payment(payment_id.clone()), &payment);
        env.events().publish(("payment_released", payment_id.clone()), merchant); // ✅ Clone di sini
    }

    /// Agent refund jika service gagal
    pub fn refund(env: Env, payment_id: Symbol, agent: Address) {
        agent.require_auth();
        
        let payment: Payment = env.storage().persistent()
            .get(&DataKey::Payment(payment_id.clone()))
            .unwrap_or_else(|| panic!("Payment not found"));
        
        if payment.released {
            panic!("Already released, cannot refund");
        }
        
        if payment.agent != agent {
            panic!("Unauthorized");
        }
        
        env.events().publish(("payment_refunded", payment_id.clone()), agent); // ✅ Clone di sini
    }
}