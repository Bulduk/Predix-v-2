'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Copy, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CopyTradeEvent {
  id: string;
  traderName: string;
  side: 'YES' | 'NO';
  amount: number;
}

interface CopyTradeOverlayProps {
  event: CopyTradeEvent | null;
  onCopy: (event: CopyTradeEvent) => void;
  onDismiss: () => void;
}

export default function CopyTradeOverlay({ event, onCopy, onDismiss }: CopyTradeOverlayProps) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (event) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [event, onDismiss]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute bottom-24 left-4 right-4 z-40"
        >
          <div className="bg-bg-base/80 backdrop-blur-xl border border-border-color rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-text-primary truncate">
                  {event.traderName} just bought {event.side}
                </span>
                <span className={`text-xs font-bold ${event.side === 'YES' ? 'text-trade-up' : 'text-trade-down'}`}>
                  ${event.amount.toLocaleString('en-US')}
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCopy(event);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-theme-primary text-white rounded-full font-bold text-sm hover:bg-theme-secondary transition-colors flex-shrink-0 shadow-lg"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
