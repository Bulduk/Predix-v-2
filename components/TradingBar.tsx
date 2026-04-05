'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

interface TradingBarProps {
  yesProb: number;
  noProb: number;
  onTrade: () => void;
  onLongPress?: () => void;
}

interface Transaction {
  id: number;
  amount: number;
  side: 'YES' | 'NO';
  isWhale?: boolean;
}

export default function TradingBar({ yesProb, noProb, onTrade, onLongPress }: TradingBarProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [whaleRipple, setWhaleRipple] = useState<'YES' | 'NO' | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    if (onLongPress) {
      pressTimer.current = setTimeout(() => {
        onLongPress();
        pressTimer.current = null;
      }, 500); // 500ms for long press
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      onTrade();
    }
  };

  const handlePointerLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  // Simulate live money flow and whale trades
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const side: 'YES' | 'NO' = Math.random() > 0.5 ? 'YES' : 'NO';
        const isWhale = Math.random() > 0.85; // 15% chance of whale trade
        const amount = isWhale ? Math.floor(Math.random() * 20000) + 5000 : Math.floor(Math.random() * 900) + 100;
        const newTx: Transaction = { id: Date.now(), amount, side, isWhale };
        
        setTransactions(prev => [...prev, newTx].slice(-5)); // Keep last 5
        
        if (isWhale) {
          setWhaleRipple(side);
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50); // Small vibration on mobile
          }
          setTimeout(() => setWhaleRipple(null), 1000);
        }
        
        // Remove after animation
        setTimeout(() => {
          setTransactions(prev => prev.filter(tx => tx.id !== newTx.id));
        }, 1500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative w-full h-14 rounded-2xl bg-bg-surface border border-border-color overflow-hidden flex cursor-pointer group select-none shadow-sm"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      
      {/* Background Fills */}
      <motion.div 
        className="absolute left-0 top-0 bottom-0 bg-trade-up/20 origin-left"
        initial={{ width: 0 }}
        animate={{ width: `${yesProb}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute right-0 top-0 bottom-0 bg-trade-down/20 origin-right"
        initial={{ width: 0 }}
        animate={{ width: `${noProb}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Whale Ripple Effect */}
      <AnimatePresence>
        {whaleRipple && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.5, x: whaleRipple === 'YES' ? '-50%' : '50%' }}
            animate={{ opacity: 0, scale: 2, x: whaleRipple === 'YES' ? '0%' : '0%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute inset-0 z-0 ${whaleRipple === 'YES' ? 'bg-trade-up/30' : 'bg-trade-down/30'}`}
          />
        )}
      </AnimatePresence>

      {/* Center Divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-color -translate-x-1/2 z-10" />

      {/* Interactive Areas */}
      <div 
        className="relative z-20 flex-1 flex items-center justify-start px-5 hover:bg-bg-surface-solid transition-colors"
      >
        <div className="flex flex-col">
          <span className="text-trade-up font-bold text-lg leading-none">YES</span>
          <span className="text-text-secondary text-xs font-bold mt-0.5">{Math.round(yesProb)}%</span>
        </div>
      </div>

      <div 
        className="relative z-20 flex-1 flex items-center justify-end px-5 hover:bg-bg-surface-solid transition-colors text-right"
      >
        <div className="flex flex-col items-end">
          <span className="text-trade-down font-bold text-lg leading-none">NO</span>
          <span className="text-text-secondary text-xs font-bold mt-0.5">{Math.round(noProb)}%</span>
        </div>
      </div>

      {/* Live Money Flow Animations */}
      <AnimatePresence>
        {transactions.map(tx => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: tx.isWhale ? 1.2 : 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none z-30 flex items-center gap-1 ${
              tx.side === 'YES' 
                ? `left-1/4 ${tx.isWhale ? 'bg-trade-up text-white border-trade-up' : 'bg-trade-up/20 text-trade-up border-trade-up/30'} border` 
                : `right-1/4 ${tx.isWhale ? 'bg-trade-down text-white border-trade-down' : 'bg-trade-down/20 text-trade-down border-trade-down/30'} border`
            }`}
          >
            {tx.isWhale && <span>🐋</span>}
            +${tx.amount.toLocaleString('en-US')}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-trade-up/5 via-transparent to-trade-down/5 z-10" />
    </div>
  );
}


