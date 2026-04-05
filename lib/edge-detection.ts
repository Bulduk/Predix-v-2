export interface TradeData {
  price: number;
  size: number;
  timestamp: number;
  side: 'YES' | 'NO';
}

export interface EdgeSignal {
  edge_score: number; // 0-100
  confidence_score: number; // 0-100
  direction: 'YES' | 'NO' | 'NEUTRAL';
  reasoning: string;
  badges: string[];
}

export interface MarketContext {
  currentPrice: number; // 1-99
  liquidity: number; // total liquidity
  volume24h: number;
  recentTrades: TradeData[];
  ohlcv: { open: number; high: number; low: number; close: number; volume: number }[];
}

export function calculateEdge(context: MarketContext): EdgeSignal {
  const { currentPrice, liquidity, volume24h, recentTrades, ohlcv } = context;

  // Validation: Prevent false signals in low liquidity
  if (liquidity < 1000 || ohlcv.length < 5) {
    return {
      edge_score: 0,
      confidence_score: 0,
      direction: 'NEUTRAL',
      reasoning: 'Insufficient liquidity or data to determine edge.',
      badges: []
    };
  }

  let edgeScore = 50; // Base score
  let confidence = 50;
  let directionBias = 0; // Negative for NO, Positive for YES
  const badges: string[] = [];
  const reasons: string[] = [];

  // 1. Momentum (Price change over time)
  const recentCloses = ohlcv.slice(-5).map(c => c.close);
  const momentum = recentCloses[recentCloses.length - 1] - recentCloses[0];
  
  if (Math.abs(momentum) > 5) {
    directionBias += momentum > 0 ? 15 : -15;
    confidence += 10;
    reasons.push(momentum > 0 ? 'Strong upward momentum' : 'Strong downward momentum');
  }

  // 2. Volatility (Standard deviation of price)
  const mean = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length;
  const variance = recentCloses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentCloses.length;
  const volatility = Math.sqrt(variance);

  if (volatility > 10) {
    confidence -= 15; // High volatility reduces confidence
    reasons.push('High volatility detected');
  }

  // 3. Whale Activity (Detect large trades)
  const avgTradeSize = recentTrades.length > 0 
    ? recentTrades.reduce((acc, t) => acc + t.size, 0) / recentTrades.length 
    : 0;
  
  const whaleTrades = recentTrades.filter(t => t.size > avgTradeSize * 3 && t.size > 5000);
  
  if (whaleTrades.length > 0) {
    const whaleYes = whaleTrades.filter(t => t.side === 'YES').length;
    const whaleNo = whaleTrades.filter(t => t.side === 'NO').length;
    
    if (whaleYes > whaleNo) {
      directionBias += 20;
      badges.push('Whale Active');
      reasons.push('Whale accumulation on YES');
    } else if (whaleNo > whaleYes) {
      directionBias -= 20;
      badges.push('Whale Active');
      reasons.push('Whale accumulation on NO');
    }
  }

  // 4. Mispricing (Imbalance between demand and price)
  // Proxy: High volume but price moving opposite to order flow, or high order flow imbalance
  const recentYesVolume = recentTrades.filter(t => t.side === 'YES').reduce((a, b) => a + b.size, 0);
  const recentNoVolume = recentTrades.filter(t => t.side === 'NO').reduce((a, b) => a + b.size, 0);
  const totalRecentVolume = recentYesVolume + recentNoVolume;

  if (totalRecentVolume > 0) {
    const yesRatio = recentYesVolume / totalRecentVolume;
    // If YES ratio is very high (>70%) but price is low (<40%)
    if (yesRatio > 0.7 && currentPrice < 40) {
      directionBias += 25;
      confidence += 15;
      badges.push('Mispriced');
      reasons.push('Price lagging behind heavy YES demand');
    } 
    // If NO ratio is very high (>70%) but price is high (>60%)
    else if (yesRatio < 0.3 && currentPrice > 60) {
      directionBias -= 25;
      confidence += 15;
      badges.push('Mispriced');
      reasons.push('Price lagging behind heavy NO demand');
    }
  }

  // 5. Reversal Signals (Trend exhaustion)
  // E.g., Price went up fast, but last candle is red with high volume
  const lastCandle = ohlcv[ohlcv.length - 1];
  const prevCandle = ohlcv[ohlcv.length - 2];
  const avgVolume = ohlcv.reduce((a, b) => a + b.volume, 0) / ohlcv.length;

  if (momentum > 10 && lastCandle.close < lastCandle.open && lastCandle.volume > avgVolume * 1.5) {
    directionBias -= 20; // Reversal to NO
    reasons.push('Trend exhaustion: High volume rejection at top');
  } else if (momentum < -10 && lastCandle.close > lastCandle.open && lastCandle.volume > avgVolume * 1.5) {
    directionBias += 20; // Reversal to YES
    reasons.push('Trend exhaustion: High volume rejection at bottom');
  }

  // Calculate final score
  edgeScore = Math.max(0, Math.min(100, 50 + Math.abs(directionBias)));
  confidence = Math.max(0, Math.min(100, confidence));
  
  let direction: 'YES' | 'NO' | 'NEUTRAL' = 'NEUTRAL';
  if (directionBias > 10) direction = 'YES';
  if (directionBias < -10) direction = 'NO';

  if (edgeScore > 75) {
    badges.push('High Edge');
  }

  // Construct reasoning string
  let finalReasoning = reasons.length > 0 
    ? `Edge detected due to ${reasons.join(' and ').toLowerCase()}.`
    : 'Market is currently balanced. No clear edge.';

  if (edgeScore < 60) {
    finalReasoning = 'Market is currently balanced. No clear edge.';
    badges.length = 0; // Clear badges if edge is low
  }

  return {
    edge_score: Math.round(edgeScore),
    confidence_score: Math.round(confidence),
    direction,
    reasoning: finalReasoning,
    badges: [...new Set(badges)] // Unique badges
  };
}
