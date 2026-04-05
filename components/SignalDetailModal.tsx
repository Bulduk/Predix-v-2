'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, Zap, TrendingUp, Brain, ArrowUpRight } from 'lucide-react';

export type SignalType = 'HIGH_FLOW' | 'HEAVY_BUYING' | 'TREND_SURGE' | 'AI_SIGNAL';

interface SignalDetailModalProps {
  type: SignalType;
  market: any;
  onClose: () => void;
}

export default function SignalDetailModal({ type, market, onClose }: SignalDetailModalProps) {
  const renderWhaleActivity = () => (
    <div className="bg-bg-surface rounded-xl p-4 border border-border-color mt-6">
      <div className="text-xs text-text-secondary mb-4 uppercase tracking-wider font-bold flex items-center justify-between">
        <span>Whale Activity</span>
        <span className="text-amber-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Live</span>
      </div>
      
      {/* YES vs NO whale dominance bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className="text-emerald-400">YES Whales (65%)</span>
          <span className="text-rose-400">NO Whales (35%)</span>
        </div>
        <div className="h-2 w-full bg-bg-surface rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-trade-up relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '35%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-trade-down"
          />
        </div>
      </div>

      {/* Largest Trade Highlight */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-trade-up/10 to-transparent border border-trade-up/20">
        <div className="text-[10px] text-trade-up/70 uppercase font-bold mb-1">Largest Active Position</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐋</span>
            <span className="font-black text-text-primary">$45,000</span>
          </div>
          <span className="px-2 py-1 rounded bg-trade-up/20 text-trade-up text-xs font-bold">YES</span>
        </div>
      </div>

      {/* Last 5 whale trades */}
      <div className="flex flex-col gap-2">
        {[
          { side: 'YES', amount: '$12,000', time: 'Just now', type: 'buy' },
          { side: 'NO', amount: '$8,500', time: '14s ago', type: 'buy' },
          { side: 'YES', amount: '$5,200', time: '45s ago', type: 'buy' },
          { side: 'YES', amount: '$15,000', time: '2m ago', type: 'buy' },
          { side: 'NO', amount: '$6,400', time: '5m ago', type: 'buy' },
        ].map((t, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex justify-between items-center text-sm border-b border-border-color pb-2 last:border-0 last:pb-0"
          >
            <span className={`font-black px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${t.side === 'YES' ? 'bg-trade-up/20 text-trade-up' : 'bg-trade-down/20 text-trade-down'}`}>
              {t.side}
            </span>
            <span className="text-text-primary font-bold text-sm">{t.amount}</span>
            <span className="text-text-secondary text-[10px]">{t.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'HIGH_FLOW':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">High Flow</h3>
                <p className="text-sm text-blue-400">Unusual volume detected</p>
              </div>
            </div>
            
            {/* Live Graph Mock */}
            <div className="h-32 bg-bg-surface rounded-xl border border-border-color relative overflow-hidden flex items-end justify-between px-2 pb-2 gap-1">
              {[40, 65, 45, 80, 55, 90, 70, 100, 85, 60].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`w-full rounded-t-sm ${i % 3 === 0 ? 'bg-rose-500/80' : 'bg-emerald-500/80'}`}
                />
              ))}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-surface rounded-xl p-4 border border-border-color">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-bold">Whale Inflow (YES)</div>
                <div className="text-xl font-black text-trade-up">+$2.4M</div>
              </div>
              <div className="bg-bg-surface rounded-xl p-4 border border-border-color">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-bold">Whale Outflow (NO)</div>
                <div className="text-xl font-black text-trade-down">-$1.1M</div>
              </div>
            </div>
          </div>
        );
      case 'HEAVY_BUYING':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <motion.div 
                  className="absolute inset-0 rounded-full border border-emerald-500/50"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <Zap className="w-6 h-6 text-emerald-400 relative z-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Heavy Buying</h3>
                <p className="text-sm text-emerald-400">Whales dominating YES</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/30 to-bg-base rounded-xl p-6 border border-emerald-500/20 flex flex-col items-center justify-center py-10">
              <div className="text-6xl font-black text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">85%</div>
              <div className="text-sm text-emerald-500/70 uppercase tracking-widest font-bold">Whale Buy Pressure</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-surface rounded-xl p-4 border border-border-color relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10" />
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-bold relative z-10">Whale Volume</div>
                <div className="text-xl font-black text-emerald-400 relative z-10">70%</div>
              </div>
              <div className="bg-bg-surface rounded-xl p-4 border border-border-color">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-bold">Retail Volume</div>
                <div className="text-xl font-black text-text-primary">30%</div>
              </div>
            </div>
          </div>
        );
      case 'TREND_SURGE':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Trend Surge</h3>
                <p className="text-sm text-amber-400">Whale-driven momentum</p>
              </div>
            </div>

            <div className="h-32 bg-gradient-to-br from-amber-900/20 to-bg-base rounded-xl border border-amber-500/20 relative overflow-hidden flex items-center justify-center">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 text-amber-400"
              >
                <ArrowUpRight className="w-12 h-12" />
                <ArrowUpRight className="w-16 h-16 opacity-50" />
                <ArrowUpRight className="w-20 h-20 opacity-20" />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-surface rounded-xl p-4 border border-border-color">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-bold">Whale Impact</div>
                <div className="text-xl font-black text-amber-400">High</div>
              </div>
              <div className="bg-bg-surface rounded-xl p-4 border border-border-color">
                <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-bold">Volatility</div>
                <div className="text-xl font-black text-rose-400">Extreme</div>
              </div>
            </div>
          </div>
        );
      case 'AI_SIGNAL':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12 rounded-full bg-theme-primary/20 flex items-center justify-center border border-theme-primary/30 shadow-[0_0_15px_rgba(var(--color-theme-primary),0.3)]">
                <Brain className="w-6 h-6 text-theme-primary relative z-10" />
                <motion.div 
                  className="absolute inset-0 rounded-full bg-theme-primary/20 blur-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">AI vs Whales</h3>
                <p className="text-sm text-theme-primary">Model prediction vs Smart Money</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-theme-primary/40 to-bg-base rounded-xl p-6 border border-theme-primary/20 flex flex-col items-center justify-center py-10">
              <div className="text-6xl font-black text-text-primary mb-2 drop-shadow-[0_0_15px_rgba(var(--color-theme-primary),0.5)]">{market.aiConfidence || 88}%</div>
              <div className="text-sm text-theme-primary/70 uppercase tracking-widest font-bold">AI Confidence (YES)</div>
            </div>

            <div className="bg-bg-surface rounded-xl p-5 border border-border-color">
              <div className="text-xs text-text-secondary mb-4 uppercase tracking-wider font-bold">Intelligence Alignment</div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-text-primary">AI Model</span>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">BULLISH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-text-primary">Whale Consensus</span>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">BULLISH</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border-color text-xs text-emerald-400 font-bold text-center">
                  Strong Alignment Detected
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-bg-base/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-bg-base border-t border-border-color rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 rounded-full bg-bg-surface hover:bg-bg-surface-hover transition-colors">
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto no-scrollbar">
            {renderContent()}
            {renderWhaleActivity()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
