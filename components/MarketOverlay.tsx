"use client";

import { useMarketStore } from "@/store/marketStore";
import { AnimatePresence } from "motion/react";
import DetailModal from "./DetailModal";

export default function MarketOverlay() {
  const { selectedMarket, closeMarket } = useMarketStore();

  return (
    <AnimatePresence>
      {selectedMarket && (
        <DetailModal 
          market={selectedMarket} 
          onClose={closeMarket} 
        />
      )}
    </AnimatePresence>
  );
}
