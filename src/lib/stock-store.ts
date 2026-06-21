import { create } from "zustand";

interface StockState {
  stockMap: Record<string, number>;
  epoch: number;
  setMultiple: (map: Record<string, number>) => void;
  refresh: () => void;
}

/**
 * Holds the latest stock numbers. Separate from the cart store
 * because stock updates on a timer and comes from a different endpoint.
 * Bumping the epoch triggers useStockSync to re-fetch.
 */
export const useStockStore = create<StockState>((set) => ({
  stockMap: {},
  epoch: 0,
  setMultiple: (map) => set((s) => ({ stockMap: { ...s.stockMap, ...map } })),
  refresh: () => set((s) => ({ epoch: s.epoch + 1 })),
}));
