import { create } from "zustand";

interface StockState {
  stockMap: Record<string, number>;
  epoch: number;
  setMultiple: (map: Record<string, number>) => void;
  refresh: () => void;
}

export const useStockStore = create<StockState>((set) => ({
  stockMap: {},
  epoch: 0,
  setMultiple: (map) => set((s) => ({ stockMap: { ...s.stockMap, ...map } })),
  refresh: () => set((s) => ({ epoch: s.epoch + 1 })),
}));
