import db from '../db';
import { User, Wallet, Market } from '../types';
import { TrustService } from './TrustService';

export class MarketService {
  /**
   * 1. MARKET CREATION (CRITICAL)
   */
  static createMarket(
    creatorId: string,
    title: string,
    category: string,
    endTime: string
  ): Market {
    return db.transaction(() => {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(creatorId) as User;
      if (!user) throw new Error('Creator not found');

      const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(creatorId) as Wallet;
      if (!wallet) throw new Error('Wallet not found');

      // 1. Calculate required stake based on trust_score
      const requiredStake = TrustService.calculateRequiredStake(user.trust_score);

      if (wallet.balance < requiredStake) {
        throw new Error(`Insufficient balance. Required stake: $${requiredStake}`);
      }

      // 2. Lock creator stake
      db.prepare('UPDATE wallets SET balance = balance - ?, locked_balance = locked_balance + ? WHERE user_id = ?')
        .run(requiredStake, requiredStake, creatorId);

      // 3. Add system liquidity (system_liquidity = creator_stake * 2)
      const systemLiquidity = requiredStake * 2;
      const totalLiquidity = requiredStake + systemLiquidity;

      const marketId = crypto.randomUUID();

      // Save market
      db.prepare(`
        INSERT INTO markets (id, creator_id, title, category, end_time, creator_stake, system_liquidity, total_liquidity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(marketId, creatorId, title, category, endTime, requiredStake, systemLiquidity, totalLiquidity);

      // 4. Initialize pools (yes_pool = total_liquidity / 2, no_pool = total_liquidity / 2)
      const initialPool = totalLiquidity / 2;
      db.prepare(`
        INSERT INTO market_pools (id, market_id, yes_pool, no_pool)
        VALUES (?, ?, ?, ?)
      `).run(crypto.randomUUID(), marketId, initialPool, initialPool);

      // Save creator stake record
      db.prepare(`
        INSERT INTO creator_stakes (id, market_id, user_id, amount, status)
        VALUES (?, ?, ?, ?, 'locked')
      `).run(crypto.randomUUID(), marketId, creatorId, requiredStake);

      // Update user stats
      db.prepare('UPDATE users SET total_markets_created = total_markets_created + 1 WHERE id = ?').run(creatorId);

      return db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId) as Market;
    })();
  }

  /**
   * 4. MARKET RESOLUTION
   */
  static resolveMarket(marketId: string, outcome: 'YES' | 'NO', isBadMarket: boolean = false): void {
    db.transaction(() => {
      const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId) as Market;
      if (!market) throw new Error('Market not found');
      if (market.status !== 'open') throw new Error('Market is not open');

      // Update market status
      db.prepare('UPDATE markets SET status = ?, outcome = ? WHERE id = ?')
        .run('resolved', outcome, marketId);

      const creatorStake = db.prepare('SELECT * FROM creator_stakes WHERE market_id = ?').get(marketId) as any;

      if (isBadMarket) {
        // 6. SLASHING (PENALTY SYSTEM)
        // Slash 50% of creator stake as penalty
        const slashAmount = creatorStake.amount * 0.5;
        const returnAmount = creatorStake.amount - slashAmount;

        db.prepare('UPDATE creator_stakes SET status = ? WHERE id = ?').run('slashed', creatorStake.id);
        
        // Return remaining stake to creator
        db.prepare('UPDATE wallets SET locked_balance = locked_balance - ?, balance = balance + ? WHERE user_id = ?')
          .run(creatorStake.amount, returnAmount, market.creator_id);

        TrustService.updateTrustScore(market.creator_id, false, 0, 20); // Penalty of 20
      } else {
        // 5. CREATOR REWARD SYSTEM
        db.prepare('UPDATE creator_stakes SET status = ? WHERE id = ?').run('released', creatorStake.id);
        
        // Unlock full stake + reward (e.g., 10% of total liquidity as fee reward)
        const reward = market.total_liquidity * 0.10;
        const totalReturn = creatorStake.amount + reward;

        db.prepare('UPDATE wallets SET locked_balance = locked_balance - ?, balance = balance + ? WHERE user_id = ?')
          .run(creatorStake.amount, totalReturn, market.creator_id);

        TrustService.updateTrustScore(market.creator_id, true, 5, 0); // Success + volume bonus
      }

      // Calculate and distribute payouts to traders
      const winningTrades = db.prepare('SELECT * FROM trades WHERE market_id = ? AND position = ?').all(marketId, outcome) as any[];
      
      for (const trade of winningTrades) {
        // Payout = amount / price (simplified LMSR payout)
        const payout = trade.amount / trade.price;
        db.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').run(payout, trade.user_id);
      }
    })();
  }
}
