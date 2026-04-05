'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'motion/react';
import { PredictionMarket } from '@/lib/data';
import { Sparkles, Users, Activity, TrendingUp, AlertCircle, Zap, Bot } from 'lucide-react';
import MiniCandlestickChart from './MiniCandlestickChart';
import TradingBar from './TradingBar';
import SmartDataStack from './SmartDataStack';
import CopyTradeOverlay, { CopyTradeEvent } from './CopyTradeOverlay';

import { SignalType } from './SignalDetailModal';
import { tradingEngine } from '@/lib/trading-engine';
import { EdgeSignal } from '@/lib/edge-detection';
import { MispricingSignal } from '@/lib/mispricing-detection';

interface FeedCardProps {
  market: PredictionMarket;
  index: number;
  onExpand: () => void;
  onQuickTrade: () => void;
  onOpenSignal: (type: SignalType) => void;
  onCopyTrade?: (event: CopyTradeEvent) => void;
  onOpenCreatorProfile?: (creator: NonNullable<PredictionMarket['creator']>) => void;
}

export default function FeedCard({ market, index, onExpand, onQuickTrade, onOpenSignal, onCopyTrade, onOpenCreatorProfile }: FeedCardProps) {
  const controls = useAnimation();
  const isDraggingRef = useRef(false);
  const [copyEvent, setCopyEvent] = useState<CopyTradeEvent | null>(null);
  const [isFollowing, setIsFollowing] = useState(market.creator?.isFollowing || false);
  
  const [currentYesPrice, setCurrentYesPrice] = useState(() => {
    const context = tradingEngine.getMarketContext(market.id);
    return context ? context.currentPrice : market.yesProb;
  });
  const [edgeSignal, setEdgeSignal] = useState<EdgeSignal | null>(null);
  const [mispricingSignal, setMispricingSignal] = useState<MispricingSignal | null>(null);

  // Subscribe to real-time updates from the trading engine
  useEffect(() => {
    // Sync state if context exists but hasn't been picked up by initial state
    setTimeout(() => {
      const context = tradingEngine.getMarketContext(market.id);
      if (context) {
        setCurrentYesPrice(context.currentPrice);
      }
    }, 0);

    const handlePrice = (data: any) => {
      if (data.marketId === market.id) {
        setCurrentYesPrice(data.newPrice);
      }
    };

    const handleAnalysis = (data: any) => {
      if (data.marketId === market.id) {
        setEdgeSignal(data.edgeSignal);
        setMispricingSignal(data.mispricingSignal);
      }
    };

    tradingEngine.on('price_update', handlePrice);
    tradingEngine.on('analysis_update', handleAnalysis);

    return () => {
      tradingEngine.off('price_update', handlePrice);
      tradingEngine.off('analysis_update', handleAnalysis);
    };
  }, [market.id]);

  // Simulate random whale trades for the overlay
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance every 5 seconds to show a whale trade overlay
      if (Math.random() > 0.9 && !copyEvent) {
        const side = Math.random() > 0.5 ? 'YES' : 'NO';
        const amount = Math.floor(Math.random() * 50000) + 10000;
        const names = ['Jordan Lee', 'Alex_Whale', 'CryptoKing', 'MacroSniper'];
        const traderName = names[Math.floor(Math.random() * names.length)];
        
        setCopyEvent({
          id: Date.now().toString(),
          traderName,
          side,
          amount
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [copyEvent]);

  const handlePointerDown = () => {
    isDraggingRef.current = false;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) return;
    // Don't expand if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('.pointer-events-auto')) return;
    onExpand();
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDraggingRef.current = true;

    const SWIPE_THRESHOLD = 100;
    if (info.offset.x > SWIPE_THRESHOLD) {
      // Swipe Right -> Skip (visual feedback)
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      // Swipe Left -> Save
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div 
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-bg-base"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      animate={controls}
      whileHover={{ scale: 1.01, boxShadow: "0px 0px 40px rgba(0,0,0,0.05)", zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-between pb-24 pt-24 px-4 sm:px-6 pointer-events-none">
        
        <div className="flex flex-col">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                {market.category}
              </span>
              {market.isLive && (
                <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-trade-down bg-trade-down/10 rounded border border-trade-down/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-trade-down animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            
            {/* Social Badges */}
            <div className="flex items-center gap-2">
              {market.whaleActivity && (
                <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 rounded border border-amber-500/20">
                  🐋 Whale active
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 rounded border border-blue-500/20">
                👥 124 copying
              </span>
            </div>
          </div>

          {/* Main Question */}
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 leading-tight max-w-[90%]">
            {market.question}
          </h2>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-text-primary tracking-tighter">
              {(currentYesPrice / 100).toFixed(2)}
            </span>
            <span className={`text-sm font-bold ${market.chartData.length > 0 && market.chartData[market.chartData.length - 1].close >= market.chartData[0].open ? 'text-trade-up' : 'text-trade-down'}`}>
              {market.chartData.length > 0 && market.chartData[market.chartData.length - 1].close >= market.chartData[0].open ? '+' : ''}
              {market.chartData.length > 0 ? ((market.chartData[market.chartData.length - 1].close - market.chartData[0].open) / market.chartData[0].open * 100).toFixed(2) : '0.00'}% 24h
            </span>
          </div>

          {/* Creator Info */}
          {market.creator && (
            <div 
              className="flex items-center gap-3 mb-6 pointer-events-auto cursor-pointer hover:bg-bg-surface p-2 -ml-2 rounded-xl transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCreatorProfile) onOpenCreatorProfile(market.creator!);
              }}
            >
              <img src={market.creator.avatar} alt={market.creator.name} className="w-8 h-8 rounded-full border border-border-color" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">Created by</span>
                <span className="text-sm font-bold text-text-primary">{market.creator.name}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFollowing(!isFollowing);
                }}
                className={`ml-auto px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                  isFollowing 
                    ? 'bg-bg-surface text-text-primary border-border-color hover:bg-bg-surface-solid' 
                    : 'bg-theme-primary text-white border-theme-primary hover:bg-theme-primary/90'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )}

          {/* Signal Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {edgeSignal && edgeSignal.edge_score > 60 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Edge: {edgeSignal.edge_score}</span>
              </div>
            )}
            {mispricingSignal && mispricingSignal.mispricing_score > 60 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/30">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-blue-400">Mispriced</span>
              </div>
            )}
            {!edgeSignal && !mispricingSignal && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-theme-primary/10 border border-theme-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-theme-primary" />
                <span className="text-xs font-bold text-theme-primary">{market.aiPrediction}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-bg-surface border border-border-color">
              <Users className="w-3.5 h-3.5 text-text-secondary" />
              <span className="text-xs font-bold text-text-primary">{market.crowdSentiment}</span>
            </div>
            <div className="text-xs font-bold text-text-secondary bg-bg-surface px-3 py-1.5 rounded border border-border-color">
              {market.timeLeft}
            </div>
          </div>

          {/* AI Insight Box */}
          {(mispricingSignal?.mispricing_score! > 60 || edgeSignal?.edge_score! > 60) && (
            <div className="mb-6 bg-theme-primary/5 border border-theme-primary/20 rounded-xl p-3 flex items-start gap-3">
              <Bot className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary leading-snug">
                {mispricingSignal?.mispricing_score! > 60 
                  ? mispricingSignal?.explanation 
                  : `High edge detected for ${edgeSignal?.direction}. Momentum and volume suggest a potential breakout.`}
              </p>
            </div>
          )}

          {/* Mini Chart */}
          <div className="h-24 w-full mb-6 relative">
            <MiniCandlestickChart data={market.chartData} />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base to-transparent pointer-events-none opacity-20" />
          </div>
        </div>

        {/* Smart Data Stack (Icons above Trading Bar) */}
        <div className="w-full flex justify-end mb-3 pointer-events-auto">
          <SmartDataStack 
            aiConfidence={market.aiConfidence}
            momentum={market.momentum}
            whaleActivity={market.whaleActivity}
            onOpenSignal={onOpenSignal}
          />
        </div>

        {/* Trading Bar */}
        <div className="pointer-events-auto">
          <TradingBar 
            yesProb={currentYesPrice} 
            noProb={100 - currentYesPrice} 
            onTrade={() => onQuickTrade()} 
            onLongPress={() => onExpand()}
          />
        </div>
      </div>

      {/* Copy Trade Overlay */}
      <div className="pointer-events-auto">
        <CopyTradeOverlay 
          event={copyEvent} 
          onDismiss={() => setCopyEvent(null)}
          onCopy={(event) => {
            if (onCopyTrade) onCopyTrade(event);
            setCopyEvent(null);
          }}
        />
      </div>
    </motion.div>
  );
}

