'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PnLIndicatorProps {
  initialPnl: number;
  isPercentage?: boolean;
}

export default function PnLIndicator({ initialPnl, isPercentage = false }: PnLIndicatorProps) {
  const [pnl, setPnl] = useState(initialPnl);
  const [prevPnl, setPrevPnl] = useState(initialPnl);
  const [tick, setTick] = useState<'up' | 'down' | null>(null);

  // Simulate real-time PnL changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const change = (Math.random() * 10) - 4; // Bias slightly positive
        setPnl(prev => {
          setPrevPnl(prev);
          const next = prev + change;
          setTick(next > prev ? 'up' : 'down');
          setTimeout(() => setTick(null), 1000);
          return next;
        });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const isPositive = pnl >= 0;
  const formattedPnl = isPercentage 
    ? `${isPositive ? '+' : ''}${pnl.toFixed(2)}%`
    : `${isPositive ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}`;

  const diff = pnl - prevPnl;
  const formattedDiff = isPercentage
    ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`
    : `${diff >= 0 ? '+' : '-'}$${Math.abs(diff).toFixed(2)}`;

  return (
    <div className="relative inline-flex items-center">
      <motion.span
        animate={
          tick === 'up' ? { scale: [1, 1.1, 1], color: '#10b981' } :
          tick === 'down' ? { scale: [1, 0.95, 1], x: [-2, 2, -2, 2, 0], color: '#f43f5e' } :
          { scale: 1, color: isPositive ? '#10b981' : '#f43f5e' }
        }
        transition={{ duration: 0.3 }}
        className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}
        style={{
          textShadow: tick === 'up' ? '0 0 10px rgba(16,185,129,0.5)' : 
                      tick === 'down' ? '0 0 10px rgba(244,63,94,0.5)' : 'none'
        }}
      >
        {formattedPnl}
      </motion.span>

      <AnimatePresence>
        {tick && (
          <motion.div
            initial={{ opacity: 0, y: tick === 'up' ? 10 : -10, scale: 0.8 }}
            animate={{ opacity: 1, y: tick === 'up' ? -20 : 20, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute left-full ml-2 text-xs font-bold pointer-events-none ${
              tick === 'up' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formattedDiff}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
