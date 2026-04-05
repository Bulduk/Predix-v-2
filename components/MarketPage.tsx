"use client";

import { useState } from "react";
import { useMarkets } from "@/hooks/useMarkets";
import MarketCardItem from "./MarketCardItem";
import { Search, Loader2, TrendingUp, Users, Activity, BarChart2 } from "lucide-react";
import Image from "next/image";
import { useMarketStore } from "@/store/marketStore";

const CATEGORIES = [
  "Trending",
  "New",
  "Politics",
  "Crypto",
  "Sports",
  "Economy",
  "Tech",
];

export default function MarketPage() {
  const { markets, loading, error } = useMarkets();
  const [activeCategory, setActiveCategory] = useState("Trending");
  const { openMarket } = useMarketStore();

  return (
    <div className="h-full bg-bg-base text-text-primary flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,1.5rem)] pb-3 bg-nav-bg backdrop-blur-md shrink-0 z-30 border-b border-border-color">
        {/* LOGO */}
        <div className="font-black text-xl tracking-tighter text-theme-primary">
          PRDX
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search markets..."
              className="w-full bg-bg-surface border border-border-color rounded-full py-1.5 pl-9 pr-4 text-sm text-text-primary outline-none focus:border-theme-primary transition-colors"
            />
          </div>
        </div>

        {/* PROFILE AVATAR */}
        <div className="w-8 h-8 rounded-full bg-theme-primary overflow-hidden border border-border-color flex-shrink-0">
          <Image
            src="https://picsum.photos/seed/jordan/100/100"
            alt="Profile"
            width={32}
            height={32}
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* STATS DASHBOARD */}
        <div className="px-4 py-4 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
          <div className="bg-bg-surface border border-border-color rounded-xl p-3 min-w-[120px] flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">24h Vol</span>
            </div>
            <span className="text-lg font-black">$12.4M</span>
          </div>
          <div className="bg-bg-surface border border-border-color rounded-xl p-3 min-w-[120px] flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Markets</span>
            </div>
            <span className="text-lg font-black">1,432</span>
          </div>
          <div className="bg-bg-surface border border-border-color rounded-xl p-3 min-w-[120px] flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Traders</span>
            </div>
            <span className="text-lg font-black">45.2k</span>
          </div>
          <div className="bg-bg-surface border border-border-color rounded-xl p-3 min-w-[120px] flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Trending</span>
            </div>
            <span className="text-lg font-black text-theme-primary">Crypto</span>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="px-4 py-2 overflow-x-auto no-scrollbar flex gap-2 shrink-0 border-b border-border-color mb-4 sticky top-0 bg-bg-base/90 backdrop-blur-md z-20">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? "bg-theme-primary text-white"
                  : "bg-bg-surface text-text-secondary border border-border-color hover:text-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* MARKET LIST */}
        <div className="px-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-theme-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-trade-down py-10 text-sm">
              Failed to load markets.
            </div>
          ) : (
            markets.map((market) => (
              <MarketCardItem
                key={market.id}
                market={market}
                onClick={() => openMarket(market)}
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
}
