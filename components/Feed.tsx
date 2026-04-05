'use client';

import { useState } from 'react';
import { MOCK_MARKETS } from '@/lib/data';
import FeedCard from './FeedCard';
import TradeBottomSheet from './TradeBottomSheet';
import Header from './Header';
import { PredictionMarket } from '@/lib/data';
import SignalDetailModal, { SignalType } from './SignalDetailModal';
import CopyTradeSheet from './CopyTradeSheet';
import { CopyTradeEvent } from './CopyTradeOverlay';
import CreatorProfileModal from './CreatorProfileModal';
import MarketOverlay from './MarketOverlay';
import { useMarketStore } from '@/store/marketStore';

export default function Feed() {
  const { openMarket } = useMarketStore();
  
  const [quickTradeMarket, setQuickTradeMarket] = useState<PredictionMarket | null>(null);
  const [activeSignal, setActiveSignal] = useState<{type: SignalType, market: PredictionMarket} | null>(null);
  const [copyTradeEvent, setCopyTradeEvent] = useState<CopyTradeEvent | null>(null);
  const [activeCreatorProfile, setActiveCreatorProfile] = useState<NonNullable<PredictionMarket['creator']> | null>(null);

  return (
    <div className="relative h-full w-full">
      <Header />
      
      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {MOCK_MARKETS.map((market, index) => (
          <FeedCard 
            key={market.id} 
            market={market} 
            index={index}
            onExpand={() => openMarket(market)}
            onQuickTrade={() => setQuickTradeMarket(market)}
            onOpenSignal={(type) => setActiveSignal({ type, market })}
            onCopyTrade={(event) => setCopyTradeEvent(event)}
            onOpenCreatorProfile={(creator) => setActiveCreatorProfile(creator)}
          />
        ))}
      </div>

      {quickTradeMarket && (
        <TradeBottomSheet 
          market={quickTradeMarket} 
          onClose={() => setQuickTradeMarket(null)} 
        />
      )}

      {activeSignal && (
        <SignalDetailModal 
          type={activeSignal.type}
          market={activeSignal.market}
          onClose={() => setActiveSignal(null)}
        />
      )}

      <CopyTradeSheet 
        isOpen={!!copyTradeEvent}
        onClose={() => setCopyTradeEvent(null)}
        event={copyTradeEvent}
      />

      {activeCreatorProfile && (
        <CreatorProfileModal 
          creator={activeCreatorProfile}
          onClose={() => setActiveCreatorProfile(null)}
        />
      )}

      {/* OVERLAY */}
      <MarketOverlay />
    </div>
  );
}
