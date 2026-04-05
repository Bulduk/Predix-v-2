'use client';

import { motion } from 'motion/react';
import { X, PlusCircle, Sparkles, Share2, Users, Clock, Activity } from 'lucide-react';

interface CenterModalProps {
  onClose: () => void;
}

export default function CenterModal({ onClose }: CenterModalProps) {
  // Mocking context from feed since we can only update CenterModal
  const feedContext = {
    type: 'prediction',
    title: 'Will ETH break $4,000 by end of this week?',
    category: 'Crypto',
    yesPercent: 65,
    noPercent: 35,
    volume: '$1.2M',
    participants: '4.2k',
    timeRemaining: '2d 14h',
    aiDirection: 'YES',
    aiConfidence: 78,
    aiRisk: 'Low Risk',
    bgImage: 'https://picsum.photos/seed/eth/400/200'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end bg-bg-base/80 backdrop-blur-sm sm:justify-center sm:p-4"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div 
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full bg-bg-surface-solid/90 backdrop-blur-2xl border-t border-border-color rounded-t-3xl sm:rounded-3xl sm:border overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom)]"
      >
        {/* Subtle blurred background preview */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url(${feedContext.bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-surface-solid/40 to-bg-surface-solid/95" />

        <div className="relative z-10 p-6 flex flex-col gap-6">
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-bg-surface hover:bg-bg-surface-hover rounded-full text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>

          {/* 1. CONTEXT (TOP) */}
          <div className="pr-8 mt-2">
            <div className="inline-block px-3 py-1 rounded-full bg-accent-from/20 border border-accent-from/30 text-accent-from text-[10px] font-bold uppercase tracking-wider mb-3">
              {feedContext.category}
            </div>
            <h2 className="text-xl font-bold text-text-primary leading-tight line-clamp-2">
              {feedContext.title}
            </h2>
          </div>

          {/* 2. MARKET SNAPSHOT */}
          {feedContext.type === 'prediction' && (
            <div className="flex flex-col gap-3">
              {/* Progress Bar */}
              <div className="h-2 w-full bg-rose-500/20 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${feedContext.yesPercent}%` }} 
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-500">YES {feedContext.yesPercent}%</span>
                  <span className="font-bold text-rose-500">NO {feedContext.noPercent}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-bg-surface rounded-xl p-3 border border-border-color/50">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Activity size={14} />
                  <span className="text-xs font-medium">{feedContext.volume} Vol</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Users size={14} />
                  <span className="text-xs font-medium">{feedContext.participants}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Clock size={14} />
                  <span className="text-xs font-medium">{feedContext.timeRemaining}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRIMARY ACTION */}
          <div className="flex flex-col items-center">
            <motion.button 
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-gradient-to-r from-accent-from to-accent-to rounded-2xl text-white font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col items-center justify-center gap-1"
            >
              <span>Join Market</span>
              <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">from $5 entry</span>
            </motion.button>
          </div>

          {/* 4. AI INSIGHT */}
          <div className="bg-bg-surface border border-border-color/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${feedContext.aiDirection === 'YES' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                <Sparkles size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">
                  AI Suggests <span className={feedContext.aiDirection === 'YES' ? 'text-emerald-500' : 'text-rose-500'}>{feedContext.aiDirection}</span>
                </div>
                <div className="text-xs text-text-secondary">
                  {feedContext.aiConfidence}% Confidence
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${feedContext.aiRisk === 'Low Risk' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              {feedContext.aiRisk}
            </div>
          </div>

          {/* 5. MICRO ACTIONS */}
          <div className="flex items-center justify-center gap-8 pt-2 border-t border-border-color/30">
            <button className="flex flex-col items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
              <div className="p-2 bg-bg-surface rounded-full">
                <PlusCircle size={18} />
              </div>
              <span className="text-[10px] font-medium">Create</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
              <div className="p-2 bg-bg-surface rounded-full">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] font-medium">Analyze</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors">
              <div className="p-2 bg-bg-surface rounded-full">
                <Share2 size={18} />
              </div>
              <span className="text-[10px] font-medium">Share</span>
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
