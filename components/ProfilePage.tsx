"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings, Wallet, Edit3, UserPlus, Copy, MessageSquare, 
  Briefcase, LineChart, Activity, Star, History, Brain, 
  CheckCircle2, TrendingUp, Zap, ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { tradingEngine, UserPortfolio } from "@/lib/trading-engine";
import { MOCK_MARKETS } from "@/lib/data";

type Mode = "guest" | "own" | "other";

export default function ProfilePage({ theme, setTheme }: any) {
  const [mode, setMode] = useState<Mode>("own");
  const [activeTab, setActiveTab] = useState("portfolio");

  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  const [portfolio, setPortfolio] = useState<UserPortfolio | undefined>(() => {
    return tradingEngine.getUserPortfolio('user_local');
  });

  useEffect(() => {
    // Sync state if context exists but hasn't been picked up by initial state
    setTimeout(() => {
      setPortfolio(tradingEngine.getUserPortfolio('user_local'));
    }, 0);

    const handlePortfolioUpdate = (updatedPortfolio: UserPortfolio) => {
      if (updatedPortfolio.userId === 'user_local') {
        setPortfolio({...updatedPortfolio});
      }
    };

    tradingEngine.on('portfolio_update', handlePortfolioUpdate);
    return () => {
      tradingEngine.off('portfolio_update', handlePortfolioUpdate);
    };
  }, []);

  const user = {
    name: "Jordan Lee",
    username: "@jordan_trades",
    verified: true,
    trust: 87,
    level: 22,
    bio: "Momentum trader • AI believer",
    pnl: portfolio ? (portfolio.balance - 10000) : 0, // 10000 is starting balance
    winrate: 68,
    trades: portfolio ? Array.from(portfolio.positions.values()).length : 0,
    followers: 1847,
    avatar: "https://picsum.photos/seed/jordan/150/150"
  };

  const signals = [
    { id: 1, asset: "BTC/USD", type: "LONG", entry: "$64,200", target: "$68,000", confidence: 92, winrate: 74, status: "Active" },
    { id: 2, asset: "ETH/USD", type: "SHORT", entry: "$3,450", target: "$3,200", confidence: 85, winrate: 68, status: "Active" },
  ];

  return (
    <div className="h-full bg-bg-base text-text-primary flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 pt-[env(safe-area-inset-top,1.5rem)] pb-3 bg-bg-base/90 backdrop-blur-md shrink-0 z-30">
        <button className="text-text-secondary hover:text-text-primary transition-colors">←</button>
        <h1 className="text-sm font-medium text-text-primary">Profile</h1>
        <button 
          onClick={() => setMode(mode === 'own' ? 'other' : 'own')}
          className="text-[10px] bg-bg-surface hover:bg-bg-surface-hover px-2 py-1 rounded text-text-secondary transition-colors"
        >
          View as: {mode === 'own' ? 'Self' : 'Other'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* HERO */}
        <div className="px-4 mb-6 mt-2">
          <div className="flex items-center gap-5">
            {/* AVATAR WITH GLOW AND LEVEL */}
            <div className="relative">
              <div className="absolute inset-0 bg-theme-primary/30 blur-xl rounded-full" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-theme-primary/50 overflow-hidden bg-theme-primary/20">
                <Image src={user.avatar} alt={user.name} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              {user.verified && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] p-0.5 rounded-full border-2 border-bg-base">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-theme-primary to-theme-accent text-[10px] font-bold px-2 py-0.5 rounded-full border border-bg-base whitespace-nowrap shadow-lg text-white">
                LVL {user.level}
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg sm:text-xl font-bold">{user.name}</h2>
                {/* TRUST SCORE BADGE */}
                <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-bold text-green-400">{user.trust}</span>
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-2">{user.username}</p>
              <p className="text-xs text-text-secondary leading-relaxed">{user.bio}</p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="flex justify-between text-center text-sm mb-6 px-4">
          <div className="bg-bg-surface rounded-xl p-3 flex-1 mx-1 border border-border-color">
            <p className="text-trade-up font-bold text-lg">+${user.pnl.toLocaleString('en-US')}</p>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">PnL</span>
          </div>
          <div className="bg-bg-surface rounded-xl p-3 flex-1 mx-1 border border-border-color">
            <p className="font-bold text-lg text-text-primary">{user.winrate}%</p>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Winrate</span>
          </div>
          <div className="bg-bg-surface rounded-xl p-3 flex-1 mx-1 border border-border-color">
            <p className="font-bold text-lg text-text-primary">{user.trades}</p>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Trades</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mb-6 px-4">
          {mode === "own" && (
            <>
              <button
                onClick={() => setShowEdit(true)}
                className="flex-1 bg-bg-surface hover:bg-bg-surface-hover border border-border-color py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => setShowWallet(true)}
                className="flex-1 bg-bg-surface hover:bg-bg-surface-hover border border-border-color py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                <Wallet className="w-4 h-4" /> Wallet
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-12 bg-bg-surface hover:bg-bg-surface-hover border border-border-color rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}

          {mode === "other" && (
            <>
              <button className="flex-1 bg-bg-surface hover:bg-bg-surface-hover border border-border-color py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                <UserPlus className="w-4 h-4" /> Follow
              </button>
              <button className="flex-[1.5] bg-gradient-to-r from-theme-primary to-theme-accent hover:opacity-90 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(var(--color-theme-primary),0.4)] transition-all text-white">
                <Copy className="w-4 h-4" /> Copy Trade
              </button>
              <button className="w-12 bg-bg-surface hover:bg-bg-surface-hover border border-border-color rounded-xl flex items-center justify-center transition-colors shrink-0">
                <MessageSquare className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* QUICK ACCESS BAR */}
        <div className="px-4 mb-6">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {[
              { id: "portfolio", icon: Briefcase, label: "Portfolio" },
              { id: "trades", icon: LineChart, label: "Trades" },
              { id: "signals", icon: Activity, label: "Signals" },
              { id: "favorites", icon: Star, label: "Favorites" },
              { id: "history", icon: History, label: "History" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-[72px] p-2 rounded-xl transition-colors ${
                    isActive ? "bg-theme-primary/20 text-theme-primary border border-theme-primary/30" : "bg-bg-surface text-text-secondary border border-transparent hover:bg-bg-surface-hover"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-theme-primary" : "text-text-secondary"}`} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI PROFILE SECTION */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-br from-theme-primary/20 to-cyan-900/20 border border-theme-primary/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-theme-primary/20 blur-2xl rounded-full" />
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-theme-primary" />
              <h3 className="text-sm font-bold text-text-primary">AI Profile Analysis</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-text-secondary">
                <Zap className="w-3.5 h-3.5 text-yellow-400" /> Momentum Trader
              </li>
              <li className="flex items-center gap-2 text-xs text-text-secondary">
                <TrendingUp className="w-3.5 h-3.5 text-trade-down" /> High Risk Appetite
              </li>
              <li className="flex items-center gap-2 text-xs text-text-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-trade-up" /> Consistent Macro Wins
              </li>
            </ul>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-4">
          {activeTab === "signals" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text-primary">Active Signals</h3>
                <span className="text-[10px] text-text-secondary bg-bg-surface px-2 py-1 rounded-lg">Real-time</span>
              </div>
              {signals.map((signal) => (
                <div key={signal.id} className="bg-bg-surface border border-border-color rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-[10px] font-bold ${signal.type === 'LONG' ? 'bg-trade-up/20 text-trade-up' : 'bg-trade-down/20 text-trade-down'}`}>
                        {signal.type}
                      </div>
                      <span className="font-bold text-sm">{signal.asset}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-text-secondary">Confidence</span>
                      <span className="text-cyan-400 font-bold text-sm">{signal.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-bg-base rounded-lg p-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-secondary">Entry</span>
                      <span className="text-xs font-medium">{signal.entry}</span>
                    </div>
                    <div className="w-8 border-t border-dashed border-border-color" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-text-secondary">Target</span>
                      <span className="text-xs font-medium">{signal.target}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-theme-primary" />
                      <span className="text-[10px] text-text-secondary">Hist. Winrate: <span className="text-text-primary font-medium">{signal.winrate}%</span></span>
                    </div>
                    <button className="text-[10px] bg-theme-primary hover:bg-theme-secondary text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                      Copy Signal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "portfolio" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-theme-primary/20 to-cyan-900/20 border border-theme-primary/20 rounded-xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary text-sm">Available Balance</span>
                  <Wallet className="w-5 h-5 text-theme-primary" />
                </div>
                <div className="text-3xl font-bold text-text-primary">
                  ${portfolio ? portfolio.balance.toFixed(2) : "10,000.00"}
                </div>
              </div>

              <h3 className="text-sm font-bold text-text-primary mt-6 mb-2">Open Positions</h3>
              
              {!portfolio || portfolio.positions.size === 0 ? (
                <div className="bg-bg-surface border border-border-color rounded-xl p-6 text-center">
                  <Briefcase className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No active positions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(portfolio.positions.values()).map(pos => {
                    const market = MOCK_MARKETS.find(m => m.id === pos.marketId);
                    if (!market) return (
                      <div key={pos.marketId} className="bg-bg-surface border border-border-color rounded-xl p-4 flex flex-col gap-3 animate-pulse">
                        <div className="h-4 bg-border-color rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-border-color rounded w-3/4"></div>
                      </div>
                    );
                    
                    const hasYes = pos.yesShares > 0;
                    const hasNo = pos.noShares > 0;
                    
                    return (
                      <div key={pos.marketId} className="bg-bg-surface border border-border-color rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-theme-primary font-bold mb-1">{market.category}</span>
                            <span className="font-bold text-sm leading-tight">{market.question}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          {hasYes && (
                            <div className="flex-1 bg-trade-up/10 border border-trade-up/20 rounded-lg p-2">
                              <div className="text-[10px] text-trade-up/70 uppercase mb-1">YES Position</div>
                              <div className="flex justify-between items-end">
                                <span className="font-bold text-trade-up">{pos.yesShares.toFixed(0)} shares</span>
                                <span className="text-xs text-text-secondary">avg {pos.avgPriceYes.toFixed(1)}¢</span>
                              </div>
                            </div>
                          )}
                          {hasNo && (
                            <div className="flex-1 bg-trade-down/10 border border-trade-down/20 rounded-lg p-2">
                              <div className="text-[10px] text-trade-down/70 uppercase mb-1">NO Position</div>
                              <div className="flex justify-between items-end">
                                <span className="font-bold text-trade-down">{pos.noShares.toFixed(0)} shares</span>
                                <span className="text-xs text-text-secondary">avg {pos.avgPriceNo.toFixed(1)}¢</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {activeTab === "trades" && (
            <div className="bg-bg-surface border border-border-color rounded-xl p-6 text-center">
              <LineChart className="w-8 h-8 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Recent trades will appear here.</p>
            </div>
          )}
          {activeTab === "favorites" && (
            <div className="bg-bg-surface border border-border-color rounded-xl p-6 text-center">
              <Star className="w-8 h-8 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No favorite markets yet.</p>
            </div>
          )}
          {activeTab === "history" && (
            <div className="bg-bg-surface border border-border-color rounded-xl p-6 text-center">
              <History className="w-8 h-8 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">Trading history is empty.</p>
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettings && (
          <Modal title="Settings" onClose={() => setShowSettings(false)}>
            <div className="space-y-2">
              <div className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface rounded-xl text-sm transition-colors">
                <span>Pro Mode (Advanced Stats)</span>
                <button 
                  onClick={() => {
                    const isPro = localStorage.getItem('proMode') === 'true';
                    localStorage.setItem('proMode', (!isPro).toString());
                    // Force a re-render or state update if needed, but simple reload works for now
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
                    typeof window !== 'undefined' && localStorage.getItem('proMode') === 'true' 
                      ? 'bg-theme-primary justify-end' 
                      : 'bg-border-color justify-start'
                  }`}
                >
                  <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              <button className="w-full text-left px-4 py-3 bg-bg-surface hover:bg-bg-surface-hover rounded-xl text-sm transition-colors">Theme Preferences</button>
              <button className="w-full text-left px-4 py-3 bg-bg-surface hover:bg-bg-surface-hover rounded-xl text-sm transition-colors">Security & Privacy</button>
              <button className="w-full text-left px-4 py-3 bg-trade-down/10 text-trade-down hover:bg-trade-down/20 rounded-xl text-sm transition-colors mt-4">Log Out</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* WALLET MODAL */}
      <AnimatePresence>
        {showWallet && (
          <Modal title="Wallet" onClose={() => setShowWallet(false)}>
            <div className="bg-bg-surface border border-border-color rounded-xl p-4 mb-4">
              <p className="text-xs text-text-secondary mb-1">Total Balance</p>
              <p className="text-2xl font-bold">$12,400.00</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-theme-primary hover:bg-theme-secondary text-white py-3 rounded-xl text-sm font-medium transition-colors">
                Deposit
              </button>
              <button className="flex-1 bg-bg-surface hover:bg-bg-surface-hover py-3 rounded-xl text-sm font-medium transition-colors">
                Withdraw
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE */}
      <AnimatePresence>
        {showEdit && (
          <Modal title="Edit Profile" onClose={() => setShowEdit(false)}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Display Name</label>
                <input
                  defaultValue={user.name}
                  className="w-full px-3 py-2.5 bg-bg-base border border-border-color rounded-xl text-sm text-text-primary outline-none focus:border-theme-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Bio</label>
                <textarea
                  defaultValue={user.bio}
                  className="w-full px-3 py-2.5 bg-bg-base border border-border-color rounded-xl text-sm text-text-primary outline-none focus:border-theme-primary/50 transition-colors resize-none h-20"
                />
              </div>
              <button 
                onClick={() => setShowEdit(false)}
                className="w-full mt-2 bg-theme-primary hover:bg-theme-secondary text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
}

/* 🔥 REUSABLE MODAL */
function Modal({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-bg-base/80 flex items-end z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-bg-base border-t border-border-color p-4 rounded-t-3xl pb-[env(safe-area-inset-bottom,2rem)]"
      >
        <div className="w-12 h-1.5 bg-border-color rounded-full mx-auto mb-4" />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-bg-surface rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors">✕</button>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}
