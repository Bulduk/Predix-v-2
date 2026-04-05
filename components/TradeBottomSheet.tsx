'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2 } from 'lucide-react';
import MicroChart from './MicroChart';
import { tradingEngine } from '@/lib/trading-engine';

interface TradeBottomSheetProps {
  market: any;
  initialSide?: 'YES' | 'NO';
  initialAmount?: number;
  onClose: () => void;
}

export default function TradeBottomSheet({ market, initialSide = 'YES', initialAmount = 100, onClose }: TradeBottomSheetProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [side, setSide] = useState<'YES' | 'NO'>(initialSide);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentYesPrice, setCurrentYesPrice] = useState(() => {
    const context = tradingEngine.getMarketContext(market.id);
    return context ? context.currentPrice : market.yesProb;
  });

  useEffect(() => {
    setTimeout(() => {
      const context = tradingEngine.getMarketContext(market.id);
      if (context) {
        setCurrentYesPrice(context.currentPrice);
      }
    }, 0);

    const handlePrice = (data: any) => {
      if (data.marketId === market.id) {
        setCurrentYesPrice(data.newPrice);
      }
    };

    tradingEngine.on('price_update', handlePrice);
    return () => {
      tradingEngine.off('price_update', handlePrice);
    };
  }, [market.id]);

  // Haptic feedback helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (type === 'light') window.navigator.vibrate(10);
      if (type === 'medium') window.navigator.vibrate(20);
      if (type === 'heavy') window.navigator.vibrate(30);
    }
  };

  const handleConfirm = async () => {
    if (amount <= 0) return;
    triggerHaptic('medium');
    setIsSubmitting(true);
    try {
      // Execute trade via trading engine
      tradingEngine.placeOrder({
        id: Math.random().toString(36).substring(7),
        userId: 'user_local',
        marketId: market.id,
        side: side,
        price: side === 'YES' ? currentYesPrice : 100 - currentYesPrice,
        amount: amount,
        timestamp: Date.now()
      });
      
      // Simulate slight network delay for UX
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setSuccess(true);
      triggerHaptic('heavy');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const prob = side === 'YES' ? currentYesPrice : (100 - currentYesPrice);
  const potentialReturn = (amount * (100 / prob)).toFixed(2);
  const roi = (((Number(potentialReturn) - amount) / amount) * 100).toFixed(0);

  // Mock Order Book Data
  const yesOrders = [
    { price: currentYesPrice || 68, amount: 690 },
    { price: (currentYesPrice || 68) - 1, amount: 4030 },
    { price: (currentYesPrice || 68) - 2, amount: 1200 },
    { price: (currentYesPrice || 68) - 3, amount: 800 },
    { price: (currentYesPrice || 68) - 4, amount: 300 },
  ];
  const noOrders = [
    { price: (100 - currentYesPrice) || 32, amount: 4711 },
    { price: ((100 - currentYesPrice) || 32) - 1, amount: 1060 },
    { price: ((100 - currentYesPrice) || 32) - 2, amount: 800 },
    { price: ((100 - currentYesPrice) || 32) - 3, amount: 500 },
    { price: ((100 - currentYesPrice) || 32) - 4, amount: 200 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
          onClick={() => { triggerHaptic('light'); onClose(); }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-bg-base border-t border-border-color rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {success ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Order Filled</h3>
              <p className="text-text-secondary">
                Bought <span className="font-bold text-text-primary">${amount}</span> of {side} at {prob}¢
              </p>
            </div>
          ) : (
            <>
              {/* 1. HEADER */}
              <div className="flex items-center justify-between p-4 border-b border-border-color shrink-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-secondary tracking-wider uppercase">{market.category || 'CRYPTO'}</span>
                  <span className="text-xs text-text-secondary">Vol: $12.4M</span>
                </div>
                <button onClick={() => { triggerHaptic('light'); onClose(); }} className="p-2 rounded-full bg-bg-surface hover:bg-bg-surface-hover transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* 2. MICRO CHART */}
              <div className="relative h-20 w-full bg-gradient-to-b from-bg-surface to-transparent border-b border-border-color shrink-0 overflow-hidden">
                <div className="absolute top-2 left-4 z-10">
                  <motion.div 
                    key={prob}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold text-text-primary"
                  >
                    {prob}¢
                  </motion.div>
                  <div className="text-xs font-medium text-emerald-400">+2.3%</div>
                </div>
                <div className="absolute inset-0 pt-6 opacity-60">
                  <MicroChart data={market.chartData} />
                </div>
              </div>

              {/* 3. ORDER BOOK (compact) */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                <div className="flex text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 px-1">
                  <div className="flex-1">YES SIDE</div>
                  <div className="flex-1 text-right">NO SIDE</div>
                </div>
                
                <div className="flex gap-3">
                  {/* YES SIDE */}
                  <div className="flex-1 flex flex-col gap-1">
                    {yesOrders.map((order, i) => (
                      <div key={i} className="relative flex items-center justify-between text-xs py-1.5 px-2 group">
                        <motion.div 
                          className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 rounded-sm"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((order.amount / 5000) * 100, 100)}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                        <span className={`font-bold relative z-10 ${i === 0 ? 'text-trade-up' : 'text-trade-up/80'}`}>{order.price}¢</span>
                        <span className="text-text-secondary relative z-10">${order.amount}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px bg-border-color my-1" />
                  
                  {/* NO SIDE */}
                  <div className="flex-1 flex flex-col gap-1">
                    {noOrders.map((order, i) => (
                      <div key={i} className="relative flex items-center justify-between text-xs py-1.5 px-2 group">
                        <motion.div 
                          className="absolute left-0 top-0 bottom-0 bg-trade-down/10 rounded-sm"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((order.amount / 5000) * 100, 100)}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                        <span className="text-text-secondary relative z-10">${order.amount}</span>
                        <span className={`font-bold relative z-10 ${i === 0 ? 'text-trade-down' : 'text-trade-down/80'}`}>{order.price}¢</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. TRADE PANEL (sticky bottom) */}
              <div className="p-4 bg-bg-base border-t border-border-color mt-auto shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {/* Side Selector */}
                <div className="flex gap-2 mb-4 p-1 bg-bg-surface rounded-xl">
                  <button 
                    onClick={() => { triggerHaptic('light'); setSide('YES'); }}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all relative ${side === 'YES' ? 'text-trade-up' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {side === 'YES' && (
                      <motion.div layoutId="activeSide" className="absolute inset-0 bg-trade-up/10 rounded-lg border border-trade-up/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
                    )}
                    <span className="relative z-10">YES {currentYesPrice}¢</span>
                  </button>
                  <button 
                    onClick={() => { triggerHaptic('light'); setSide('NO'); }}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all relative ${side === 'NO' ? 'text-trade-down' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {side === 'NO' && (
                      <motion.div layoutId="activeSide" className="absolute inset-0 bg-trade-down/10 rounded-lg border border-trade-down/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]" />
                    )}
                    <span className="relative z-10">NO {100 - currentYesPrice}¢</span>
                  </button>
                </div>

                {/* Price + Amount */}
                <div className="flex gap-3 mb-4">
                  <div className="w-1/3 bg-bg-surface rounded-xl p-3 flex flex-col justify-center border border-border-color">
                    <span className="text-[10px] text-text-secondary uppercase">Price</span>
                    <motion.span 
                      key={prob}
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-lg font-bold text-text-primary"
                    >
                      {prob}¢
                    </motion.span>
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
                    <input 
                      type="number" 
                      value={amount || ''}
                      onChange={(e) => {
                        setAmount(Number(e.target.value));
                      }}
                      className="w-full h-full bg-bg-surface border border-border-color rounded-xl py-3 pl-8 pr-4 text-xl font-bold text-text-primary focus:outline-none focus:border-theme-primary/50 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Quick Buttons */}
                <div className="flex gap-2 mb-4">
                  {[10, 50, 100, 500].map(val => (
                    <button 
                      key={val}
                      onClick={() => { triggerHaptic('light'); setAmount(val); }}
                      className="flex-1 py-2 rounded-lg bg-bg-surface hover:bg-bg-surface-hover text-xs font-bold text-text-secondary transition-colors border border-border-color"
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                {/* Live Feedback */}
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-secondary uppercase">Est. Payout</span>
                    <motion.span 
                      key={potentialReturn}
                      initial={{ opacity: 0.5, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-bold text-text-primary"
                    >
                      ${amount > 0 ? potentialReturn : '0.00'}
                    </motion.span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-secondary uppercase">Potential ROI</span>
                    <motion.span 
                      key={roi}
                      initial={{ opacity: 0.5, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-bold text-trade-up"
                    >
                      +{amount > 0 ? roi : '0'}%
                    </motion.span>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={isSubmitting || amount <= 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden ${
                    amount > 0 
                      ? 'bg-theme-primary hover:bg-theme-secondary text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                      : 'bg-bg-surface text-text-secondary cursor-not-allowed'
                  }`}
                >
                  {amount > 0 && !isSubmitting && (
                    <motion.div 
                      className="absolute inset-0 bg-white/20"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative z-10">
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </span>
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
