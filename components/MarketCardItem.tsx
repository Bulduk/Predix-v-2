import { memo } from 'react';
import { motion } from 'motion/react';
import { MarketData } from '@/hooks/useMarkets';
import { TrendingUp, TrendingDown, Minus, Activity, Droplets } from 'lucide-react';
import MiniCandlestickChart from './MiniCandlestickChart';

interface MarketCardItemProps {
  market: MarketData;
  onClick: () => void;
}

const MarketCardItem = memo(({ market, onClick }: MarketCardItemProps) => {
  const handleTradeClick = (e: React.MouseEvent, side: 'YES' | 'NO') => {
    e.stopPropagation();
    onClick();
  };

  const SentimentIcon = market.aiSentiment === 'Bullish' ? TrendingUp : market.aiSentiment === 'Bearish' ? TrendingDown : Minus;
  const sentimentColor = market.aiSentiment === 'Bullish' ? 'text-trade-up bg-trade-up/10 border-trade-up/20' : market.aiSentiment === 'Bearish' ? 'text-trade-down bg-trade-down/10 border-trade-down/20' : 'text-text-secondary bg-text-secondary/10 border-text-secondary/20';

  return (
    <motion.div
      whileHover={{ scale: 0.995 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-bg-surface hover:bg-bg-surface-solid border border-border-color rounded-xl p-4 mb-3 cursor-pointer flex flex-col gap-3 shadow-sm transition-colors"
    >
      {/* HEADER: Live Indicator & AI Sentiment */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {market.isLive ? (
            <span className="text-[10px] text-trade-down font-bold flex items-center gap-1 bg-trade-down/10 border border-trade-down/20 px-2 py-0.5 rounded-md">
              <div className="w-1.5 h-1.5 bg-trade-down rounded-full animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="text-[10px] text-text-secondary font-medium bg-bg-base border border-border-color px-2 py-0.5 rounded-md">
              {market.endsAt.split('T')[0]}
            </span>
          )}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${sentimentColor}`}>
            <SentimentIcon className="w-3 h-3" />
            {market.aiSentiment}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>${(market.volume / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            <span>${(market.liquidity / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      {/* TITLE & PRICE */}
      <div className="flex justify-between items-start gap-4">
        <h2 className="text-[15px] font-bold text-text-primary leading-snug flex-1">
          {market.title}
        </h2>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xl font-black text-text-primary tracking-tighter">
            {(market.probYes / 100).toFixed(2)}
          </span>
          <span className={`text-[10px] font-bold ${market.change24h >= 0 ? 'text-trade-up' : 'text-trade-down'}`}>
            {market.change24h >= 0 ? '+' : ''}{market.change24h}% 24h
          </span>
        </div>
      </div>

      {/* MINI CHART */}
      <div className="w-full h-12 my-1">
        <MiniCandlestickChart data={market.chartData} />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={(e) => handleTradeClick(e, 'YES')}
          className="flex-1 bg-trade-up/10 hover:bg-trade-up/20 border border-trade-up/30 text-trade-up font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          Buy YES <span className="text-xs opacity-80">@ {(market.probYes / 100).toFixed(2)}</span>
        </button>
        <button
          onClick={(e) => handleTradeClick(e, 'NO')}
          className="flex-1 bg-trade-down/10 hover:bg-trade-down/20 border border-trade-down/30 text-trade-down font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          Buy NO <span className="text-xs opacity-80">@ {(market.probNo / 100).toFixed(2)}</span>
        </button>
      </div>
    </motion.div>
  );
});

MarketCardItem.displayName = 'MarketCardItem';

export default MarketCardItem;
