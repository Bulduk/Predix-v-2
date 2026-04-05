import db from '../db';
import { Market, MarketPool } from '../types';

export class LiquidityService {
  /**
   * 8. AI LIQUIDITY ASSIST
   * Injects temporary liquidity to stabilize price swings or boost low-volume markets.
   */
  static injectAILiquidity(marketId: string, amount: number): void {
    db.transaction(() => {
      const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId) as Market;
      if (!market) throw new Error('Market not found');

      // AI rules: Max 30% of total liquidity
      const maxAILiquidity = market.total_liquidity * 0.30;
      if (market.ai_liquidity + amount > maxAILiquidity) {
        throw new Error('AI liquidity exceeds maximum allowed (30% of total)');
      }

      // Add AI liquidity equally to both pools to reduce spread without moving price
      const halfAmount = amount / 2;

      db.prepare('UPDATE market_pools SET yes_pool = yes_pool + ?, no_pool = no_pool + ? WHERE market_id = ?')
        .run(halfAmount, halfAmount, marketId);

      db.prepare('UPDATE markets SET ai_liquidity = ai_liquidity + ?, total_liquidity = total_liquidity + ? WHERE id = ?')
        .run(amount, amount, marketId);
    })();
  }
}
