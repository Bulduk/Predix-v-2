export interface User {
  id: string;
  username: string;
  trust_score: number;
  total_markets_created: number;
  successful_markets: number;
  failed_markets: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  locked_balance: number;
}

export interface Market {
  id: string;
  creator_id: string;
  title: string;
  category: string;
  end_time: string;
  status: 'open' | 'closed' | 'resolved';
  creator_stake: number;
  system_liquidity: number;
  ai_liquidity: number;
  user_liquidity: number;
  total_liquidity: number;
  outcome: 'YES' | 'NO' | null;
  created_at: string;
}

export interface MarketPool {
  id: string;
  market_id: string;
  yes_pool: number;
  no_pool: number;
  fee_pool: number;
}

export interface LiquidityProvider {
  id: string;
  market_id: string;
  user_id: string;
  shares: number;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  market_id: string;
  position: 'YES' | 'NO';
  amount: number;
  fee: number;
  price: number;
  slippage: number;
  created_at: string;
}

export interface CreatorStake {
  id: string;
  market_id: string;
  user_id: string;
  amount: number;
  locked_until: string | null;
  status: 'locked' | 'released' | 'slashed';
}

export interface ReputationLog {
  id: string;
  user_id: string;
  change: number;
  reason: string;
  created_at: string;
}
