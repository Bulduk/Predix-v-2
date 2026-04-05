import { EventEmitter } from 'events';
import { calculateEdge, MarketContext, TradeData } from './edge-detection';
import { detectMispricing } from './mispricing-detection';

export interface Order {
  id: string;
  userId: string;
  marketId: string;
  side: 'YES' | 'NO';
  price: number; // 1-99
  amount: number; // Number of shares
  timestamp: number;
}

export interface OrderBook {
  yesOrders: Order[]; // Sorted descending by price (highest bid first)
  noOrders: Order[];  // Sorted ascending by price (lowest ask first)
}

export interface AMMState {
  yesPool: number;
  noPool: number;
  k: number; // Constant product: yesPool * noPool = k
}

export interface Position {
  marketId: string;
  yesShares: number;
  noShares: number;
  avgPriceYes: number;
  avgPriceNo: number;
}

export interface UserPortfolio {
  userId: string;
  balance: number;
  positions: Map<string, Position>;
}

export class TradingEngine extends EventEmitter {
  private orderBooks: Map<string, OrderBook> = new Map();
  private amms: Map<string, AMMState> = new Map();
  private marketContexts: Map<string, MarketContext> = new Map();
  private portfolios: Map<string, UserPortfolio> = new Map();

  constructor() {
    super();
    // Initialize a mock user portfolio
    this.portfolios.set('user_local', {
      userId: 'user_local',
      balance: 10000,
      positions: new Map()
    });
  }

  public getUserPortfolio(userId: string): UserPortfolio | undefined {
    return this.portfolios.get(userId);
  }

  private updatePortfolio(userId: string, marketId: string, side: 'YES' | 'NO', amount: number, price: number) {
    let portfolio = this.portfolios.get(userId);
    if (!portfolio) {
      portfolio = { userId, balance: 10000, positions: new Map() };
      this.portfolios.set(userId, portfolio);
    }

    const cost = (amount * price) / 100; // Price is in cents (0-100)
    portfolio.balance -= cost;

    let position = portfolio.positions.get(marketId);
    if (!position) {
      position = { marketId, yesShares: 0, noShares: 0, avgPriceYes: 0, avgPriceNo: 0 };
      portfolio.positions.set(marketId, position);
    }

    if (side === 'YES') {
      const totalCost = (position.yesShares * position.avgPriceYes) + (amount * price);
      position.yesShares += amount;
      position.avgPriceYes = totalCost / position.yesShares;
    } else {
      const totalCost = (position.noShares * position.avgPriceNo) + (amount * price);
      position.noShares += amount;
      position.avgPriceNo = totalCost / position.noShares;
    }
    
    this.emit('portfolio_update', portfolio);
  }

  // Initialize a market with AMM liquidity and empty orderbook
  public initializeMarket(marketId: string, initialYesProb: number, initialLiquidity: number, initialContext: MarketContext) {
    const yesPool = initialLiquidity * (100 - initialYesProb) / 100;
    const noPool = initialLiquidity * initialYesProb / 100;
    
    this.amms.set(marketId, {
      yesPool,
      noPool,
      k: yesPool * noPool
    });

    this.orderBooks.set(marketId, { yesOrders: [], noOrders: [] });
    this.marketContexts.set(marketId, initialContext);
  }

  // Place a new order
  public placeOrder(order: Order) {
    this.emit('order_created', order);
    this.executeOrder(order);
  }

  private executeOrder(order: Order) {
    const orderBook = this.orderBooks.get(order.marketId);
    const amm = this.amms.get(order.marketId);
    const context = this.marketContexts.get(order.marketId);

    if (!orderBook || !amm || !context) {
      throw new Error('Market not initialized');
    }

    let remainingAmount = order.amount;
    let totalCost = 0;

    // 1. Check Orderbook (Price Priority)
    const oppositeOrders = order.side === 'YES' ? orderBook.noOrders : orderBook.yesOrders;
    
    // Sort opposite orders: if buying YES, we want lowest NO price (which implies lowest YES cost: 100 - noPrice)
    // Actually, standard orderbook: 
    // YES orders are bids for YES. NO orders are bids for NO.
    // If I want to buy YES at price P, I can match with a NO order at price 100 - P.
    
    // For simplicity in this hybrid model:
    // If I am buying YES at market price, I look for NO limit orders.
    // Let's assume order.price is the max price the user is willing to pay.
    
    while (remainingAmount > 0 && oppositeOrders.length > 0) {
      const bestOpposite = oppositeOrders[0];
      const impliedPrice = 100 - bestOpposite.price;

      if (order.price >= impliedPrice) {
        // Match found!
        const matchAmount = Math.min(remainingAmount, bestOpposite.amount);
        
        remainingAmount -= matchAmount;
        bestOpposite.amount -= matchAmount;
        totalCost += matchAmount * impliedPrice;

        this.emit('order_matched', {
          makerOrderId: bestOpposite.id,
          takerOrderId: order.id,
          price: impliedPrice,
          amount: matchAmount,
          timestamp: Date.now()
        });

        this.recordTrade(order.marketId, {
          price: impliedPrice,
          size: matchAmount,
          timestamp: Date.now(),
          side: order.side
        });
        
        this.updatePortfolio(order.userId, order.marketId, order.side, matchAmount, impliedPrice);
        this.updatePortfolio(bestOpposite.userId, bestOpposite.marketId, bestOpposite.side, matchAmount, bestOpposite.price);

        if (bestOpposite.amount === 0) {
          oppositeOrders.shift(); // Remove filled order
        }
      } else {
        break; // Best opposite price is too expensive
      }
    }

    // 2. If no match (or partial match), execute via AMM (Fallback Liquidity)
    if (remainingAmount > 0) {
      // Calculate AMM execution price and slippage
      // Using Constant Product Formula: x * y = k
      // If buying YES, we add to yesPool and remove from noPool?
      // Actually, standard prediction market AMM (LMSR or CPMM):
      // Cost to buy `dy` YES shares = current_yes_price * dy (simplified, ignoring slippage for a moment)
      // Let's use a simplified CPMM execution:
      
      const priceBefore = amm.noPool / (amm.yesPool + amm.noPool) * 100; // Price of YES
      
      // Simulate slippage impact (simplified)
      const slippageFactor = remainingAmount / (amm.yesPool + amm.noPool);
      if (slippageFactor > 0.1) {
        // Prevent extreme slippage (>10% pool size)
        this.emit('order_failed', { orderId: order.id, reason: 'Extreme slippage prevented' });
        return;
      }

      // Execute AMM Trade
      // Adjust pools (simplified mechanism for demonstration)
      if (order.side === 'YES') {
        amm.yesPool += remainingAmount;
        amm.noPool -= remainingAmount * (priceBefore / 100);
      } else {
        amm.noPool += remainingAmount;
        amm.yesPool -= remainingAmount * ((100 - priceBefore) / 100);
      }

      const priceAfter = amm.noPool / (amm.yesPool + amm.noPool) * 100;
      const avgExecutionPrice = (priceBefore + priceAfter) / 2;

      if (order.price >= avgExecutionPrice) {
        totalCost += remainingAmount * avgExecutionPrice;
        
        this.emit('amm_trade', {
          orderId: order.id,
          price: avgExecutionPrice,
          amount: remainingAmount,
          timestamp: Date.now()
        });

        this.recordTrade(order.marketId, {
          price: avgExecutionPrice,
          size: remainingAmount,
          timestamp: Date.now(),
          side: order.side
        });
        
        this.updatePortfolio(order.userId, order.marketId, order.side, remainingAmount, avgExecutionPrice);

        this.emit('price_update', {
          marketId: order.marketId,
          newPrice: priceAfter
        });

      } else {
        // Add remaining to orderbook as a limit order
        const targetList = order.side === 'YES' ? orderBook.yesOrders : orderBook.noOrders;
        targetList.push({ ...order, amount: remainingAmount });
        
        // Sort orderbook
        if (order.side === 'YES') {
          targetList.sort((a, b) => b.price - a.price); // Highest bid first
        } else {
          targetList.sort((a, b) => a.price - b.price); // Lowest ask first
        }
      }
    }

    // 3. Integrate with Edge & Mispricing Engines
    this.runAnalysis(order.marketId);
  }

  private recordTrade(marketId: string, trade: TradeData) {
    const context = this.marketContexts.get(marketId);
    if (context) {
      context.recentTrades.push(trade);
      // Keep only recent trades
      if (context.recentTrades.length > 100) {
        context.recentTrades.shift();
      }
      context.currentPrice = trade.price;
    }
  }

  private runAnalysis(marketId: string) {
    const context = this.marketContexts.get(marketId);
    if (!context) return;

    const edgeSignal = calculateEdge(context);
    const mispricingSignal = detectMispricing(context);

    this.emit('analysis_update', {
      marketId,
      edgeSignal,
      mispricingSignal
    });
  }

  public getMarketContext(marketId: string) {
    return this.marketContexts.get(marketId);
  }
}

// Singleton instance for the application
export const tradingEngine = new TradingEngine();
