'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Bot, TrendingUp, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MARKETS } from '@/lib/data';
import { tradingEngine } from '@/lib/trading-engine';

type PulseEvent = {
  id: string;
  type: 'TRADE' | 'WHALE' | 'AI_SIGNAL' | 'MISPRICING' | 'RESOLUTION';
  marketId: string;
  marketTitle: string;
  message: string;
  timestamp: Date;
  metadata?: any;
};

export default function PulsePage() {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  useEffect(() => {
    const handleOrderMatched = (data: any) => {
      const market = MOCK_MARKETS.find(m => m.id === data.marketId);
      if (!market) return;
      
      const isWhale = data.amount > 10000;
      const newEvent: PulseEvent = {
        id: Math.random().toString(36).substring(7),
        type: isWhale ? 'WHALE' : 'TRADE',
        marketId: data.marketId,
        marketTitle: market.question,
        message: isWhale 
          ? `Whale alert: $${data.amount.toLocaleString('en-US')} on ${data.side || 'Orderbook'}`
          : `New trade: $${data.amount.toLocaleString('en-US')} on ${data.side || 'Orderbook'}`,
        timestamp: new Date(),
        metadata: { amount: data.amount, side: data.side }
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    };

    const handleAmmTrade = (data: any) => {
      const market = MOCK_MARKETS.find(m => m.id === data.marketId);
      if (!market) return;
      
      const isWhale = data.amount > 10000;
      const newEvent: PulseEvent = {
        id: Math.random().toString(36).substring(7),
        type: isWhale ? 'WHALE' : 'TRADE',
        marketId: data.marketId,
        marketTitle: market.question,
        message: isWhale 
          ? `Whale AMM swap: $${data.amount.toLocaleString('en-US')} on ${data.side || 'AMM'}`
          : `AMM swap: $${data.amount.toLocaleString('en-US')} on ${data.side || 'AMM'}`,
        timestamp: new Date(),
        metadata: { amount: data.amount, side: data.side }
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    };

    const handleAnalysisUpdate = (data: any) => {
      const market = MOCK_MARKETS.find(m => m.id === data.marketId);
      if (!market) return;

      if (data.edgeSignal && data.edgeSignal.edge_score > 75) {
        const newEvent: PulseEvent = {
          id: Math.random().toString(36).substring(7),
          type: 'AI_SIGNAL',
          marketId: data.marketId,
          marketTitle: market.question,
          message: `High Edge Detected: Score ${data.edgeSignal.edge_score}`,
          timestamp: new Date(),
          metadata: { score: data.edgeSignal.edge_score }
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
      }

      if (data.mispricingSignal && data.mispricingSignal.mispricing_score > 75) {
        const newEvent: PulseEvent = {
          id: Math.random().toString(36).substring(7),
          type: 'MISPRICING',
          marketId: data.marketId,
          marketTitle: market.question,
          message: `Mispricing Detected: ${data.mispricingSignal.direction} bias`,
          timestamp: new Date(),
          metadata: { score: data.mispricingSignal.mispricing_score }
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
      }
    };

    tradingEngine.on('order_matched', handleOrderMatched);
    tradingEngine.on('amm_trade', handleAmmTrade);
    tradingEngine.on('analysis_update', handleAnalysisUpdate);

    // Simulate some background noise events so it doesn't look empty
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const market = MOCK_MARKETS[Math.floor(Math.random() * MOCK_MARKETS.length)];
        const side = Math.random() > 0.5 ? 'YES' : 'NO';
        const amount = Math.floor(Math.random() * 500) + 50;
        const newEvent: PulseEvent = {
          id: Math.random().toString(36).substring(7),
          type: 'TRADE',
          marketId: market.id,
          marketTitle: market.question,
          message: `New trade: $${amount} on ${side}`,
          timestamp: new Date(),
          metadata: { side, amount }
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 50));
      }
    }, 4000);

    return () => {
      tradingEngine.off('order_matched', handleOrderMatched);
      tradingEngine.off('amm_trade', handleAmmTrade);
      tradingEngine.off('analysis_update', handleAnalysisUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full h-full bg-bg-base overflow-y-auto pb-28 hide-scrollbar">
      <div className="sticky top-0 z-30 bg-bg-base/80 backdrop-blur-2xl border-b border-border-color pt-[env(safe-area-inset-top,1rem)]">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="text-accent-from" /> Pulse
          </h1>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-bg-surface border border-border-color rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  event.type === 'WHALE' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  event.type === 'AI_SIGNAL' ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/20' :
                  event.type === 'MISPRICING' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {event.type === 'WHALE' && <Zap size={18} />}
                  {event.type === 'AI_SIGNAL' && <Bot size={18} />}
                  {event.type === 'MISPRICING' && <AlertCircle size={18} />}
                  {event.type === 'TRADE' && <TrendingUp size={18} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <Clock size={10} />
                      {event.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-text-primary mb-1 truncate">
                    {event.marketTitle}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold ${
                      event.metadata?.side === 'YES' ? 'text-emerald-500' :
                      event.metadata?.side === 'NO' ? 'text-rose-500' :
                      'text-text-primary'
                    }`}>
                      {event.message}
                    </p>
                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
