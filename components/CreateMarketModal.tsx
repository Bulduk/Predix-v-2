'use client';

import { motion } from 'motion/react';
import { X, PenTool, Image as ImageIcon, Calendar, DollarSign } from 'lucide-react';

interface CreateMarketModalProps {
  onClose: () => void;
}

export default function CreateMarketModal({ onClose }: CreateMarketModalProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end bg-bg-base/80 backdrop-blur-sm sm:justify-center sm:p-4"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div 
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full bg-bg-surface-solid border-t border-border-color rounded-t-3xl sm:rounded-3xl sm:border overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary font-bold text-xl">
              <PenTool size={20} className="text-cyan-400" />
              Create Market
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-bg-surface hover:bg-bg-surface-hover rounded-full text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Question</label>
              <textarea 
                placeholder="e.g. Will Bitcoin reach $100k before 2025?"
                className="w-full bg-bg-surface border border-border-color rounded-xl p-4 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-theme-primary/50 resize-none h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Category</label>
                <select className="w-full bg-bg-surface border border-border-color rounded-xl p-3 text-text-primary focus:outline-none focus:border-theme-primary/50 appearance-none">
                  <option>Crypto</option>
                  <option>AI / Tech</option>
                  <option>Politics</option>
                  <option>Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">End Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                  <input 
                    type="date"
                    className="w-full bg-bg-surface border border-border-color rounded-xl p-3 pl-10 text-text-primary focus:outline-none focus:border-theme-primary/50 appearance-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Initial Liquidity</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
                <input 
                  type="number"
                  placeholder="1000"
                  className="w-full bg-bg-surface border border-border-color rounded-xl p-3 pl-10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-theme-primary/50"
                />
              </div>
            </div>

            <button className="w-full py-4 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold text-lg hover:bg-cyan-500/30 transition-colors mt-4">
              Launch Market
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
