'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Activity, Bot, MessageCircle, Heart, Share2, Bookmark, Droplets, Users } from 'lucide-react';
import FullCandlestickChart from './FullCandlestickChart';

interface MarketDetailScreenProps {
  market: any;
  onClose: () => void;
  onTrade: (market: any, side: string, amount?: number) => void;
}

export default function MarketDetailScreen({ market, onClose, onTrade }: MarketDetailScreenProps) {
  const [tradeSide, setTradeSide] = useState<string | null>(null);
  const [amount, setAmount] = useState(50);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (type === 'light') window.navigator.vibrate(10);
      if (type === 'medium') window.navigator.vibrate(20);
      if (type === 'heavy') window.navigator.vibrate(30);
    }
  };

  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.y > 100) {
      triggerHaptic('light');
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      onDragEnd={handleDragEnd}
      className="fixed inset-0 z-50 bg-bg-base flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-[env(safe-area-inset-top,1rem)] bg-bg-surface border-b border-border-color shrink-0">
        <button onClick={() => { triggerHaptic('light'); onClose(); }} className="p-2 bg-bg-base rounded-full text-text-primary hover:bg-bg-surface-solid transition-colors border border-border-color">
          <ChevronDown size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-theme-primary/10 text-theme-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            {market.category}
          </span>
          {market.isLive && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-trade-down bg-trade-down/10 rounded border border-trade-down/20">
              <span className="w-1.5 h-1.5 rounded-full bg-trade-down animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setLiked(!liked); triggerHaptic('light'); }} className={`p-2 bg-bg-base rounded-full text-text-primary hover:bg-bg-surface-solid transition-colors border border-border-color ${liked ? 'text-rose-500' : ''}`}>
            <Heart size={18} className={liked ? 'fill-current' : ''} />
          </button>
          <button onClick={() => { setSaved(!saved); triggerHaptic('light'); }} className={`p-2 bg-bg-base rounded-full text-text-primary hover:bg-bg-surface-solid transition-colors border border-border-color ${saved ? 'text-amber-500' : ''}`}>
            <Bookmark size={18} className={saved ? 'fill-current' : ''} />
          </button>
          <button className="p-2 bg-bg-base rounded-full text-text-primary hover:bg-bg-surface-solid transition-colors border border-border-color">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-4 pt-4">
        
        {/* Title & Price */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight mb-2">
            {market.title || market.question}
          </h1>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-text-primary tracking-tighter">
              {(market.probYes / 100).toFixed(2)}
            </span>
            <span className={`text-sm font-bold ${market.change24h >= 0 ? 'text-trade-up' : 'text-trade-down'}`}>
              {market.change24h >= 0 ? '+' : ''}{market.change24h}% 24h
            </span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-64 mb-6">
          <FullCandlestickChart data={market.chartData} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg-surface border border-border-color p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <Activity className="w-4 h-4 text-text-secondary mb-1" />
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Volume</span>
            <span className="text-sm font-bold text-text-primary">${(market.volume / 1000000).toFixed(1)}M</span>
          </div>
          <div className="bg-bg-surface border border-border-color p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <Droplets className="w-4 h-4 text-text-secondary mb-1" />
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Liquidity</span>
            <span className="text-sm font-bold text-text-primary">${(market.liquidity / 1000).toFixed(0)}k</span>
          </div>
          <div className="bg-bg-surface border border-border-color p-3 rounded-xl flex flex-col items-center justify-center text-center">
            <Users className="w-4 h-4 text-text-secondary mb-1" />
            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Traders</span>
            <span className="text-sm font-bold text-text-primary">{market.participants || 1240}</span>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-bg-surface border border-border-color rounded-xl p-4 mb-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-theme-primary" />
          <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
            <Bot size={16} className="text-theme-primary" /> AI Insight
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {market.aiReasoning || "Based on recent volume spikes and order book imbalance, the model detects strong accumulation on the YES side. Momentum is building."}
          </p>
          <div className="mt-3 flex items-center gap-4 border-t border-border-color pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-text-secondary">Sentiment:</span>
              <span className={`text-xs font-bold ${market.aiSentiment === 'Bullish' ? 'text-trade-up' : market.aiSentiment === 'Bearish' ? 'text-trade-down' : 'text-text-secondary'}`}>
                {market.aiSentiment || 'Bullish'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Trade Panel (Always Visible) */}
      <div className="absolute bottom-0 left-0 w-full bg-bg-base/90 backdrop-blur-xl border-t border-border-color p-4 pb-[env(safe-area-inset-bottom,1rem)] z-20">
        {!tradeSide ? (
          <div className="flex gap-3">
            <button 
              onClick={() => { triggerHaptic('medium'); setTradeSide('YES'); }}
              className="flex-1 py-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 font-bold bg-trade-up/10 border border-trade-up/30 text-trade-up hover:bg-trade-up/20"
            >
              <span className="text-lg">Buy YES</span>
              <span className="text-xs opacity-80">@ {(market.probYes / 100).toFixed(2)}</span>
            </button>
            <button 
              onClick={() => { triggerHaptic('medium'); setTradeSide('NO'); }}
              className="flex-1 py-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 font-bold bg-trade-down/10 border border-trade-down/30 text-trade-down hover:bg-trade-down/20"
            >
              <span className="text-lg">Buy NO</span>
              <span className="text-xs opacity-80">@ {(market.probNo / 100).toFixed(2)}</span>
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 bg-bg-surface p-4 rounded-xl border border-border-color shadow-xl"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-secondary">Amount</span>
                <span className="text-[10px] text-text-secondary font-medium">Balance: $1,240.50</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tradeSide === 'YES' ? 'bg-trade-up/20 text-trade-up' : 'bg-trade-down/20 text-trade-down'}`}>
                  {tradeSide}
                </span>
                <span className="text-2xl font-black text-text-primary tracking-tighter">${amount}</span>
              </div>
            </div>
            <input 
              type="range" min="5" max="1000" step="5" value={amount} 
              onChange={(e) => {
                setAmount(Number(e.target.value));
                if (Number(e.target.value) % 50 === 0) triggerHaptic('light');
              }}
              className="w-full h-2 bg-bg-surface-solid rounded-lg appearance-none cursor-pointer accent-theme-primary"
            />
            <div className="flex gap-3 mt-2">
              <button onClick={() => { triggerHaptic('light'); setTradeSide(null); }} className="px-5 py-3.5 rounded-xl bg-bg-surface-solid border border-border-color text-text-secondary font-bold hover:text-text-primary transition-colors">
                Cancel
              </button>
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic('heavy');
                  onTrade(market, tradeSide, amount);
                  onClose();
                }}
                className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
                  tradeSide === 'YES' ? 'bg-trade-up hover:bg-trade-up/90' : 'bg-trade-down hover:bg-trade-down/90'
                }`}
              >
                Place Order
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
