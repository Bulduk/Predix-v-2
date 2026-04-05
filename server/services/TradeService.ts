import db from '../db';
import { Wallet, Market, MarketPool, Trade } from '../types';

export class TradeService {
  /**
   * Calculates the dynamic spread based on total liquidity.
   * Low liquidity -> higher spread (up to 10%)
   * High liquidity -> tighter spread (down to 1%)
   */
  static calculateSpread(totalLiquidity: number): number {
    const baseSpread = 0.01; // 1% base fee
    const dynamicSpread = Math.min(0.09, 1000 / (totalLiquidity || 1));
    return baseSpread + dynamicSpread;
  }

  /**
   * 2. PRICING ENGINE (LMSR SIMPLIFIED)
   */
  static getPrices(marketId: string): { priceYes: number, priceNo: number, spread: number } {
    const pool = db.prepare('SELECT * FROM market_pools WHERE market_id = ?').get(marketId) as MarketPool;
    if (!pool) throw new Error('Pool not found');

    const totalLiquidity = pool.yes_pool + pool.no_pool;
    const priceYes = pool.yes_pool / totalLiquidity;
    const priceNo = 1 - priceYes;
    const spread = this.calculateSpread(totalLiquidity);

    return { priceYes, priceNo, spread };
  }

  /**
   * Get a quote for a trade, factoring in spread and slippage (whale impact).
   */
  static getQuote(marketId: string, position: 'YES' | 'NO', amount: number) {
    const pool = db.prepare('SELECT * FROM market_pools WHERE market_id = ?').get(marketId) as MarketPool;
    if (!pool) throw new Error('Pool not found');

    const totalLiquidity = pool.yes_pool + pool.no_pool;
    const spread = this.calculateSpread(totalLiquidity);
    
    // Deduct fee
    const fee = amount * spread;
    const netAmount = amount - fee;

    // Current price
    const currentPriceYes = pool.yes_pool / totalLiquidity;
    const currentPriceNo = pool.no_pool / totalLiquidity;
    const startPrice = position === 'YES' ? currentPriceYes : currentPriceNo;

    // Price after trade (Whale impact / Slippage)
    const newTotal = totalLiquidity + netAmount;
    const newPriceYes = (pool.yes_pool + (position === 'YES' ? netAmount : 0)) / newTotal;
    const newPriceNo = (pool.no_pool + (position === 'NO' ? netAmount : 0)) / newTotal;
    const endPrice = position === 'YES' ? newPriceYes : newPriceNo;

    // Average execution price
    const executionPrice = (startPrice + endPrice) / 2;
    const slippage = Math.abs(endPrice - startPrice);

    return { fee, netAmount, startPrice, endPrice, executionPrice, slippage, spread };
  }

  /**
   * 3. TRADE EXECUTION
   */
  static executeTrade(userId: string, marketId: string, position: 'YES' | 'NO', amount: number): Trade {
    return db.transaction(() => {
      const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId) as Market;
      if (!market) throw new Error('Market not found');
      if (market.status !== 'open') throw new Error('Market is not open');

      const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId) as Wallet;
      if (!wallet) throw new Error('Wallet not found');

      // Validate balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get quote with spread and slippage
      const quote = this.getQuote(marketId, position, amount);

      // Deduct total amount from user
      db.prepare('UPDATE wallets SET balance = balance - ? WHERE user_id = ?').run(amount, userId);

      // Update pools with net amount and add fee to fee_pool
      if (position === 'YES') {
        db.prepare('UPDATE market_pools SET yes_pool = yes_pool + ?, fee_pool = fee_pool + ? WHERE market_id = ?')
          .run(quote.netAmount, quote.fee, marketId);
      } else {
        db.prepare('UPDATE market_pools SET no_pool = no_pool + ?, fee_pool = fee_pool + ? WHERE market_id = ?')
          .run(quote.netAmount, quote.fee, marketId);
      }

      // Update total liquidity in market
      db.prepare('UPDATE markets SET total_liquidity = total_liquidity + ? WHERE id = ?').run(quote.netAmount, marketId);

      // Save trade
      const tradeId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO trades (id, user_id, market_id, position, amount, fee, price, slippage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(tradeId, userId, marketId, position, amount, quote.fee, quote.executionPrice, quote.slippage);

      return db.prepare('SELECT * FROM trades WHERE id = ?').get(tradeId) as Trade;
    })();
  }
}
