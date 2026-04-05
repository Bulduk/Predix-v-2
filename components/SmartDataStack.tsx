'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Brain, TrendingUp, Zap } from 'lucide-react';
import { SignalType } from './SignalDetailModal';

interface SmartDataStackProps {
  aiConfidence: number;
  momentum?: string;
  whaleActivity?: string;
  onOpenSignal: (type: SignalType) => void;
}

export default function SmartDataStack({ aiConfidence, momentum, whaleActivity, onOpenSignal }: SmartDataStackProps) {
  const [whalePulse, setWhalePulse] = useState<'YES' | 'NO' | null>(null);
  const [whaleCount, setWhaleCount] = useState({ yes: 2, no: 1 }); // Mock data

  // Simulate real-time whale trades
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const side = Math.random() > 0.5 ? 'YES' : 'NO';
        setWhalePulse(side);
        setWhaleCount(prev => ({
          ...prev,
          [side.toLowerCase()]: prev[side.toLowerCase() as 'yes' | 'no'] + 1
        }));
        
        setTimeout(() => setWhalePulse(null), 1000);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent, type: SignalType) => {
    e.stopPropagation();
    onOpenSignal(type);
  };

  const stopProp = (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="flex flex-row items-center justify-end gap-2"
      onPointerDown={stopProp}
      onPointerUp={stopProp}
      onClick={stopProp}
    >
      
      {/* Flow Indicator */}
      <motion.div 
        whileTap={{ scale: 0.9 }} 
        onClick={(e) => handleInteraction(e, 'HIGH_FLOW')} 
        className="relative cursor-pointer"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-bg-surface/80 backdrop-blur-md border border-border-color overflow-hidden">
          <Activity className="w-4 h-4 text-blue-400 relative z-10" />
          {/* Animated Flow Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* Whale Activity */}
      {whaleActivity && (
        <motion.div 
          whileTap={{ scale: 0.9 }} 
          animate={whalePulse ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.2 }}
          onClick={(e) => handleInteraction(e, 'HEAVY_BUYING')} 
          className="relative cursor-pointer"
        >
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
            whalePulse === 'YES' 
              ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] bg-emerald-500/20' 
              : whalePulse === 'NO' 
                ? 'border-rose-500 shadow-[0_0_20px_rgba(243,64,64,0.6)] bg-rose-500/20' 
                : 'border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] bg-bg-surface/80'
          }`}>
            <motion.div
              animate={
                whalePulse 
                  ? { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] } 
                  : { opacity: [0.6, 1, 0.6], scale: [0.95, 1.1, 0.95] }
              }
              transition={
                whalePulse 
                  ? { duration: 0.3, repeat: 2 } 
                  : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Zap className={`w-4 h-4 transition-colors duration-300 ${
                whalePulse === 'YES' ? 'text-emerald-400 fill-emerald-400' : 
                whalePulse === 'NO' ? 'text-rose-400 fill-rose-400' : 
                'text-amber-400 fill-amber-400/30'
              }`} />
            </motion.div>
            
            {/* Whale Counter */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className={`transition-colors duration-300 ${whalePulse === 'YES' ? 'text-emerald-300' : 'text-emerald-500/70'}`}>+{whaleCount.yes}</span>
              <span className="text-text-secondary/50">|</span>
              <span className={`transition-colors duration-300 ${whalePulse === 'NO' ? 'text-rose-300' : 'text-rose-500/70'}`}>-{whaleCount.no}</span>
            </div>
          </div>
          
          {/* Ripple Effect */}
          <AnimatePresence>
            {whalePulse && (
              <motion.div
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`absolute inset-0 rounded-full z-[-1] ${whalePulse === 'YES' ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Momentum Indicator */}
      {momentum && (
        <motion.div 
          whileTap={{ scale: 0.9 }} 
          onClick={(e) => handleInteraction(e, 'TREND_SURGE')} 
          className="relative cursor-pointer"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-bg-surface/80 backdrop-blur-md border border-border-color">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
        </motion.div>
      )}

      {/* AI Confidence Pulse */}
      <motion.div 
        whileTap={{ scale: 0.9 }} 
        onClick={(e) => handleInteraction(e, 'AI_SIGNAL')} 
        className="relative cursor-pointer"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-bg-surface/80 backdrop-blur-md border border-theme-accent/50 shadow-[0_0_10px_rgba(var(--color-theme-accent),0.3)]">
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-border-color"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-theme-accent"
                strokeWidth="4"
                strokeDasharray={`${aiConfidence}, 100`}
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${aiConfidence}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Brain className="w-2.5 h-2.5 text-theme-accent absolute" />
          </div>
          <span className="text-xs font-bold text-theme-accent">{aiConfidence}%</span>
        </div>
      </motion.div>

    </div>
  );
}
