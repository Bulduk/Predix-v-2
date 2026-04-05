'use client';

import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { PredictionMarket } from '@/lib/data';
import { X } from 'lucide-react';
import { useState } from 'react';

interface QuickTradeModalProps {
  market: PredictionMarket;
  onClose: () => void;
}

export default function QuickTradeModal({ market, onClose }: QuickTradeModalProps) {
  const [amount, setAmount] = useState<number>(100);
  const [side, setSide] = useState<'YES' | 'NO'>('YES');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      setIsExpanded(true);
    } else if (info.offset.y > 50) {
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0, height: isExpanded ? '90dvh' : '50dvh' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="relative w-full max-w-md bg-bg-base border border-border-color rounded-t-3xl p-6 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Drag Handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-border-color rounded-full cursor-grab active:cursor-grabbing" />
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-primary to-theme-accent" />
          
          <div className="flex justify-between items-start mb-6 mt-2">
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-1">Quick Trade</h3>
              <p className="text-sm text-text-secondary line-clamp-1">{market.question}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-bg-surface hover:bg-bg-surface-hover transition-colors">
              <X className="w-5 h-5 text-text-primary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="flex gap-2 mb-6 p-1 bg-bg-surface rounded-xl border border-border-color">
              <button 
                onClick={() => setSide('YES')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${side === 'YES' ? 'bg-trade-up/20 text-trade-up border border-trade-up/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`}
              >
                YES {market.yesProb}%
              </button>
              <button 
                onClick={() => setSide('NO')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${side === 'NO' ? 'bg-trade-down/20 text-trade-down border border-trade-down/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`}
              >
                NO {market.noProb}%
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>Amount</span>
                <span>Balance: $1,240.50</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-bg-surface border border-border-color rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-text-primary focus:outline-none focus:border-theme-primary transition-colors"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {[10, 50, 100, 500].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className="flex-1 py-2 rounded-lg bg-bg-surface hover:bg-bg-surface-hover text-sm font-medium text-text-primary transition-colors border border-border-color"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm mb-6 p-4 bg-bg-surface rounded-xl border border-border-color">
              <div className="flex flex-col gap-1">
                <span className="text-text-secondary">Est. Payout</span>
                <span className="text-lg font-bold text-theme-accent">
                  ${(amount * (100 / (side === 'YES' ? market.yesProb : market.noProb))).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-text-secondary">Potential ROI</span>
                <span className="text-lg font-bold text-trade-up">
                  +{((100 / (side === 'YES' ? market.yesProb : market.noProb) - 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <button className="w-full py-4 mt-auto rounded-xl bg-theme-primary hover:bg-theme-secondary text-white font-bold text-lg transition-colors shadow-[0_0_20px_var(--theme-primary)] opacity-90 hover:opacity-100 shrink-0">
            Confirm Trade
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

