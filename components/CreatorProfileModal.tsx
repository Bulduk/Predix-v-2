'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Activity, TrendingUp, Award } from 'lucide-react';
import { PredictionMarket } from '@/lib/data';

interface CreatorProfileModalProps {
  creator: NonNullable<PredictionMarket['creator']>;
  onClose: () => void;
}

export default function CreatorProfileModal({ creator, onClose }: CreatorProfileModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-bg-surface-solid border border-border-color rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-color">
            <div className="flex items-center gap-2 text-text-primary font-bold">
              <Users size={18} className="text-accent-from" />
              Creator Profile
            </div>
            <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-bg-surface">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col items-center">
            <img src={creator.avatar} alt={creator.name} className="w-24 h-24 rounded-full border-4 border-border-color mb-4" />
            <h3 className="text-2xl font-bold text-text-primary mb-1">{creator.name}</h3>
            <p className="text-sm text-text-secondary mb-6">Prediction Market Creator</p>

            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="bg-bg-surface border border-border-color rounded-2xl p-4 flex flex-col items-center text-center">
                <Activity className="w-6 h-6 text-trade-up mb-2" />
                <span className="text-2xl font-bold text-text-primary">42</span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">Markets</span>
              </div>
              <div className="bg-bg-surface border border-border-color rounded-2xl p-4 flex flex-col items-center text-center">
                <TrendingUp className="w-6 h-6 text-theme-primary mb-2" />
                <span className="text-2xl font-bold text-text-primary">85%</span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">Accuracy</span>
              </div>
              <div className="bg-bg-surface border border-border-color rounded-2xl p-4 flex flex-col items-center text-center col-span-2">
                <Award className="w-6 h-6 text-amber-400 mb-2" />
                <span className="text-2xl font-bold text-text-primary">Top 5%</span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">Global Rank</span>
              </div>
            </div>

            <button 
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                creator.isFollowing 
                  ? 'bg-bg-surface text-text-primary border-border-color hover:bg-bg-surface-hover' 
                  : 'bg-theme-primary text-white border-theme-primary hover:bg-theme-secondary shadow-lg shadow-theme-primary/25'
              }`}
            >
              {creator.isFollowing ? 'Following' : 'Follow Creator'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
