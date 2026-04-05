import { MarketContext } from './edge-detection';

export interface MispricingSignal {
  mispricing_score: number; // 0-100
  direction: 'YES' | 'NO' | 'NEUTRAL';
  confidence: number; // 0-100
  explanation: string;
}

export function detectMispricing(context: MarketContext): MispricingSignal {
  const { currentPrice, liquidity, recentTrades, ohlcv } = context;

  // 5. Liquidity Check & Low-Data Environment Check
  if (liquidity < 5000 || recentTrades.length < 10 || ohlcv.length < 5) {
    return {
      mispricing_score: 0,
      direction: 'NEUTRAL',
      confidence: 0,
      explanation: 'Insufficient liquidity or volume to detect mispricing reliably.'
    };
  }

  let mispricingScore = 0;
  let confidence = 50;
  let directionBias = 0; // Positive for YES mispriced (should be higher), Negative for NO mispriced (should be lower)
  const reasons: string[] = [];

  // 1. Order Flow Imbalance (Buy vs Sell pressure)
  const recentYesVolume = recentTrades.filter(t => t.side === 'YES').reduce((a, b) => a + b.size, 0);
  const recentNoVolume = recentTrades.filter(t => t.side === 'NO').reduce((a, b) => a + b.size, 0);
  const totalRecentVolume = recentYesVolume + recentNoVolume;

  // Require volume confirmation
  const avgCandleVolume = ohlcv.reduce((a, b) => a + b.volume, 0) / ohlcv.length;
  if (totalRecentVolume < avgCandleVolume * 0.5) {
    return {
      mispricing_score: 0,
      direction: 'NEUTRAL',
      confidence: 10,
      explanation: 'Low volume confirmation. Cannot determine mispricing.'
    };
  }

  const yesRatio = recentYesVolume / totalRecentVolume;
  
  if (yesRatio > 0.65) {
    directionBias += 30;
    reasons.push('heavy YES order flow imbalance');
  } else if (yesRatio < 0.35) {
    directionBias -= 30;
    reasons.push('heavy NO order flow imbalance');
  }

  // 2. Price Response Delay
  // Expected movement based on order flow vs actual movement
  const recentCloses = ohlcv.slice(-3).map(c => c.close);
  const priceChange = recentCloses[recentCloses.length - 1] - recentCloses[0];

  if (yesRatio > 0.7 && priceChange <= 1) {
    // High YES demand but price hasn't moved up
    directionBias += 40;
    confidence += 20;
    reasons.push('price failing to respond to buying pressure');
  } else if (yesRatio < 0.3 && priceChange >= -1) {
    // High NO demand but price hasn't moved down
    directionBias -= 40;
    confidence += 20;
    reasons.push('price failing to respond to selling pressure');
  }

  // 3. Whale Activity
  const avgTradeSize = totalRecentVolume / recentTrades.length;
  const whaleTrades = recentTrades.filter(t => t.size > avgTradeSize * 4 && t.size > 10000);
  
  if (whaleTrades.length > 0) {
    const whaleYes = whaleTrades.filter(t => t.side === 'YES').reduce((a, b) => a + b.size, 0);
    const whaleNo = whaleTrades.filter(t => t.side === 'NO').reduce((a, b) => a + b.size, 0);
    
    if (whaleYes > whaleNo * 2) {
      directionBias += 20;
      confidence += 10;
      reasons.push('significant whale accumulation on YES');
    } else if (whaleNo > whaleYes * 2) {
      directionBias -= 20;
      confidence += 10;
      reasons.push('significant whale accumulation on NO');
    }
  }

  // 4. Momentum Weakness (Trend without support)
  // Price is moving up, but volume is dropping and order flow doesn't support it
  if (priceChange > 5 && yesRatio < 0.4) {
    directionBias -= 30; // Price is artificially high
    confidence += 15;
    reasons.push('upward momentum lacks volume support');
  } else if (priceChange < -5 && yesRatio > 0.6) {
    directionBias += 30; // Price is artificially low
    confidence += 15;
    reasons.push('downward momentum lacks volume support');
  }

  // Calculate final scores
  mispricingScore = Math.min(100, Math.abs(directionBias));
  confidence = Math.max(0, Math.min(100, confidence));

  let direction: 'YES' | 'NO' | 'NEUTRAL' = 'NEUTRAL';
  if (directionBias > 20) direction = 'YES';
  if (directionBias < -20) direction = 'NO';

  let explanation = 'Market appears efficiently priced based on current order flow and volume.';
  if (mispricingScore > 40 && reasons.length > 0) {
    explanation = `Mispricing detected: ${direction} is undervalued due to ${reasons.join(', ')}.`;
  } else {
    mispricingScore = 0; // Reset if not significant
  }

  return {
    mispricing_score: Math.round(mispricingScore),
    direction,
    confidence: Math.round(confidence),
    explanation
  };
}
