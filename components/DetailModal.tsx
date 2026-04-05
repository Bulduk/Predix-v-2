'use client';

import { motion, AnimatePresence } from 'motion/react';
import { PredictionMarket } from '@/lib/data';
import { X, TrendingUp, ArrowDownRight, ArrowUpRight, Activity, Gavel, Terminal } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import EdgePanel from './EdgePanel';
import MispricingPanel from './MispricingPanel';
import { calculateEdge, MarketContext, EdgeSignal } from '@/lib/edge-detection';
import { detectMispricing, MispricingSignal } from '@/lib/mispricing-detection';
import { tradingEngine } from '@/lib/trading-engine';

interface DetailModalProps {
  market: PredictionMarket;
  onClose: () => void;
  onResolve?: (market: PredictionMarket) => void;
}

const pseudoRandom = (seed: number) => {
  let state = seed * 74283 + 12345;
  state = (state ^ (state >> 13)) * 12345;
  return ((state & 0x7fffffff) / 0x7fffffff);
};

export default function DetailModal({ market, onClose, onResolve }: DetailModalProps) {
  console.log("marketData", market);
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [tradeSide, setTradeSide] = useState<'YES' | 'NO'>('YES');

  const [detailedChartData] = useState(() => market.chartData.map((d, i) => ({
    ...d,
    time: `${i}:00`,
    volume: pseudoRandom(i) * 1000 + 500,
    value: d.close // Ensure value exists for AreaChart
  })));

  const [orderBookYes] = useState(() => [...Array(5)].map((_, i) => ({
    width: pseudoRandom(i + 10) * 80 + 20,
    price: market.yesProb - i,
    volume: pseudoRandom(i + 20) * 5000
  })));

  const [orderBookNo] = useState(() => [...Array(5)].map((_, i) => ({
    width: pseudoRandom(i + 30) * 80 + 20,
    price: market.noProb - i,
    volume: pseudoRandom(i + 40) * 5000
  })));

  const [edgeSignal, setEdgeSignal] = useState<EdgeSignal | null>(() => {
    const context = tradingEngine.getMarketContext(market.id);
    return context ? calculateEdge(context) : null;
  });
  const [mispricingSignal, setMispricingSignal] = useState<MispricingSignal | null>(() => {
    const context = tradingEngine.getMarketContext(market.id);
    return context ? detectMispricing(context) : null;
  });
  const [tradeLogs, setTradeLogs] = useState<{id: string, msg: string, type: 'amm'|'book'}[]>([]);
  const [currentYesPrice, setCurrentYesPrice] = useState(() => {
    const context = tradingEngine.getMarketContext(market.id);
    return context ? context.currentPrice : market.yesProb;
  });

  useEffect(() => {
    const baseTime = Date.now();
    if (!tradingEngine.getMarketContext(market.id)) {
      tradingEngine.initializeMarket(market.id, market.yesProb, 50000, {
        currentPrice: market.yesProb,
        liquidity: 50000,
        volume24h: 150000,
        recentTrades: [
          { price: market.yesProb, size: 12000, timestamp: baseTime - 1000, side: market.yesProb > 50 ? 'YES' : 'NO' },
          { price: market.yesProb - 1, size: 500, timestamp: baseTime - 5000, side: 'NO' },
          { price: market.yesProb + 1, size: 15000, timestamp: baseTime - 10000, side: 'YES' }
        ],
        ohlcv: detailedChartData
      });
      
      // Update state if we just initialized it via a timeout to avoid synchronous setState in effect
      setTimeout(() => {
        const newContext = tradingEngine.getMarketContext(market.id);
        if (newContext) {
          setEdgeSignal(calculateEdge(newContext));
          setMispricingSignal(detectMispricing(newContext));
          setCurrentYesPrice(newContext.currentPrice);
        }
      }, 0);
    }

    const handleAnalysis = (data: any) => {
      if (data.marketId === market.id) {
        setEdgeSignal(data.edgeSignal);
        setMispricingSignal(data.mispricingSignal);
      }
    };

    const handlePrice = (data: any) => {
      if (data.marketId === market.id) {
        setCurrentYesPrice(data.newPrice);
      }
    };

    const handleOrderMatched = (data: any) => {
      setTradeLogs(prev => [{ id: Math.random().toString(), msg: `Matched on Orderbook: ${data.amount.toFixed(0)} shares @ ${data.price.toFixed(1)}¢`, type: 'book' as const }, ...prev].slice(0, 3));
    };

    const handleAmmTrade = (data: any) => {
      setTradeLogs(prev => [{ id: Math.random().toString(), msg: `Executed via AMM: ${data.amount.toFixed(0)} shares @ ${data.price.toFixed(1)}¢`, type: 'amm' as const }, ...prev].slice(0, 3));
    };

    tradingEngine.on('analysis_update', handleAnalysis);
    tradingEngine.on('price_update', handlePrice);
    tradingEngine.on('order_matched', handleOrderMatched);
    tradingEngine.on('amm_trade', handleAmmTrade);

    return () => {
      tradingEngine.off('analysis_update', handleAnalysis);
      tradingEngine.off('price_update', handlePrice);
      tradingEngine.off('order_matched', handleOrderMatched);
      tradingEngine.off('amm_trade', handleAmmTrade);
    };
  }, [market.id, market.yesProb, detailedChartData]);

  const handleTrade = () => {
    tradingEngine.placeOrder({
      id: Math.random().toString(36).substring(7),
      userId: 'user_local',
      marketId: market.id,
      side: tradeSide,
      price: tradeSide === 'YES' ? currentYesPrice : 100 - currentYesPrice,
      amount: tradeAmount,
      timestamp: Date.now()
    });
  };

  const isUp = detailedChartData.length > 0 ? detailedChartData[detailedChartData.length - 1].value >= detailedChartData[0].value : true;
  const strokeColor = isUp ? '#10b981' : '#ef4444';
  const fillColor = isUp ? 'url(#colorUp)' : 'url(#colorDown)';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-theme-bg-start pointer-events-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color bg-bg-base/80 backdrop-blur-md z-10">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-theme-accent tracking-wider">{market.category}</span>
            <span className="text-sm text-text-secondary">Vol: {market.volume}</span>
          </div>
          <div className="flex items-center gap-2">
            {onResolve && (
              <button 
                onClick={() => onResolve(market)} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-primary/20 text-theme-primary hover:bg-theme-primary/30 transition-colors text-xs font-bold border border-theme-primary/30"
              >
                <Gavel size={14} /> Resolve
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full bg-bg-surface hover:bg-bg-surface-hover transition-colors">
              <X className="w-6 h-6 text-text-primary" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-48">
          {/* Question */}
          <div className="p-6 pb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight mb-4">
              {market.question}
            </h2>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-trade-up">{currentYesPrice.toFixed(1)}%</span>
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Yes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-trade-down">{(100 - currentYesPrice).toFixed(1)}%</span>
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">No</span>
              </div>
            </div>
          </div>

          {/* Edge Detection & Mispricing Panels */}
          <div className="px-6 mt-4">
            <EdgePanel signal={edgeSignal} />
            <MispricingPanel signal={mispricingSignal} />
          </div>

          {/* Large Chart */}
          <div className="h-64 w-full px-2 mb-6">
            {detailedChartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detailedChartData}>
                  <defs>
                    <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={strokeColor} 
                    fillOpacity={1} 
                    fill={fillColor} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Order Book (Simplified) */}
          <div className="px-6 mb-8">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Order Book
            </h3>
            <div className="flex gap-4">
              {/* YES Side */}
              <div className="flex-1 flex flex-col gap-1">
                {orderBookYes.map((item, i) => (
                  <div key={`yes-${i}`} className="relative h-8 flex items-center justify-between px-2 text-xs font-medium">
                    <div className="absolute right-0 top-0 bottom-0 bg-trade-up/20" style={{ width: `${item.width}%` }} />
                    <span className="relative z-10 text-trade-up">{item.price}¢</span>
                    <span className="relative z-10 text-text-secondary">${item.volume.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              {/* NO Side */}
              <div className="flex-1 flex flex-col gap-1">
                {orderBookNo.map((item, i) => (
                  <div key={`no-${i}`} className="relative h-8 flex items-center justify-between px-2 text-xs font-medium">
                    <div className="absolute left-0 top-0 bottom-0 bg-trade-down/20" style={{ width: `${item.width}%` }} />
                    <span className="relative z-10 text-text-secondary">${item.volume.toFixed(0)}</span>
                    <span className="relative z-10 text-trade-down">{item.price}¢</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trade Execution Fixed */}
        <div className="absolute bottom-0 left-0 w-full bg-bg-base border-t border-border-color p-6 pb-8">
          
          <div className="flex gap-2 mb-4 p-1 bg-bg-surface rounded-xl border border-border-color">
            <button 
              onClick={() => setTradeSide('YES')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${tradeSide === 'YES' ? 'bg-trade-up/20 text-trade-up border border-trade-up/50' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`}
            >
              Buy YES
            </button>
            <button 
              onClick={() => setTradeSide('NO')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${tradeSide === 'NO' ? 'bg-trade-down/20 text-trade-down border border-trade-down/50' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`}
            >
              Buy NO
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <input 
              type="range" 
              min="10" 
              max="1000" 
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value))}
              className="flex-1 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-theme-primary"
            />
            <div className="w-24 bg-bg-surface border border-border-color rounded-lg py-2 px-3 text-center">
              <span className="text-text-primary font-bold">${tradeAmount}</span>
            </div>
          </div>

          <button 
            onClick={handleTrade}
            className="w-full py-4 rounded-xl bg-theme-primary hover:bg-theme-secondary text-white font-bold text-lg transition-colors shadow-[0_0_20px_var(--theme-primary)] opacity-90 hover:opacity-100"
          >
            Submit Order
          </button>
          
          {tradeLogs.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3" /> Execution Logs
              </h4>
              <div className="bg-bg-surface rounded-lg p-3 border border-border-color font-mono text-xs space-y-1">
                {tradeLogs.map(log => (
                  <div key={log.id} className={log.type === 'amm' ? 'text-blue-400' : 'text-trade-up'}>
                    &gt; {log.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </AnimatePresence>
  );
}


