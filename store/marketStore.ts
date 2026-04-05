import { create } from "zustand";

type State = {
  selectedMarket: any | null;
  openMarket: (market: any) => void;
  closeMarket: () => void;
};

export const useMarketStore = create<State>((set) => ({
  selectedMarket: null,
  openMarket: (market) => set({ selectedMarket: market }),
  closeMarket: () => set({ selectedMarket: null }),
}));
