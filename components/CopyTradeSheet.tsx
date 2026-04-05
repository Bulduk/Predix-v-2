'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ShieldAlert, Settings2, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { CopyTradeEvent } from './CopyTradeOverlay';

interface CopyTradeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CopyTradeEvent | null;
}

export default function CopyTradeSheet({ isOpen, onClose, event }: CopyTradeSheetProps) {
  const [allocation, setAllocation] = useState(10);
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [autoCopy, setAutoCopy] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recentLoss, setRecentLoss] = useState(true); // Simulate a recent loss for psychology

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  const traderName = event?.traderName || 'Jordan Lee';
  const tradeSide = event?.side || 'YES';
  const tradeAmount = event?.amount || 12000;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full bg-bg-base border-t border-border-color rounded-t-3xl z-50 p-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-12 h-1.5 bg-border-color rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Copy className="text-accent-from" /> Copy Trade
              </h2>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }} 
                className="p-2 bg-bg-surface rounded-full text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Zap className="text-emerald-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-500 mb-2">Copied Successfully!</h3>
                <p className="text-text-secondary text-sm mb-4">You are now mirroring {traderName}.</p>
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <TrendingUp size={16} /> +$145 potential gain
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                
                {/* Trade Details Card */}
                <div className="bg-bg-surface border border-border-color rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Target Trade</p>
                    <p className="text-sm font-bold text-text-primary">{traderName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${tradeSide === 'YES' ? 'bg-trade-up/20 text-trade-up' : 'bg-trade-down/20 text-trade-down'}`}>
                      {tradeSide}
                    </span>
                    <p className="text-sm font-bold text-text-primary mt-1">${tradeAmount.toLocaleString('en-US')}</p>
                  </div>
                </div>

                {/* Loss Psychology (if recent loss) */}
                {recentLoss && (
                  <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                    <AlertCircle className="text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-bold text-indigo-400">You&apos;re close to recovery</p>
                      <p className="text-xs text-text-secondary mt-0.5">This move could flip your recent -$45. Let the pros handle it.</p>
                    </div>
                  </div>
                )}

                {/* Allocation */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-text-primary">Portfolio Allocation</label>
                    <span className="text-sm font-bold text-accent-from">{allocation}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={allocation} 
                    onChange={(e) => setAllocation(Number(e.target.value))}
                    className="w-full accent-accent-from h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-text-secondary mt-2">Copy amount: ${(24592.45 * (allocation/100)).toFixed(2)}</p>
                </div>

                {/* Auto Copy Toggle */}
                <div className="flex items-center justify-between bg-bg-surface border border-border-color p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Settings2 className="text-text-secondary" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Follow Trader</h4>
                      <p className="text-xs text-text-secondary">Automatically copy future trades</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAutoCopy(!autoCopy)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${autoCopy ? 'bg-emerald-500' : 'bg-border-color'}`}
                  >
                    <motion.div 
                      layout
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                      animate={{ left: autoCopy ? '26px' : '2px' }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Confirm Button */}
                <button 
                  onClick={handleConfirm}
                  className="w-full py-4 bg-accent-from text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(var(--color-accent-from),0.3)] hover:opacity-90 transition-opacity"
                >
                  Copy Now
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
