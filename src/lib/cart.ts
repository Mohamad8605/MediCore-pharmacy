import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartMedication {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  requires_prescription: boolean;
}

export interface CartItem {
  medication: CartMedication;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (med: CartMedication, qty?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
  needsPrescription: () => boolean;
}

/**
 * Zustand store for the shopping cart, persisted to localStorage.
 * Quantities are always clamped between 1 and the medication's stock level.
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (med, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.medication.id === med.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.medication.id === med.id
                  ? { ...i, quantity: Math.min(med.stock, i.quantity + qty) }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { medication: med, quantity: Math.min(med.stock, qty) }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.medication.id !== id) })),
      setQuantity: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.medication.id === id
              ? { ...i, quantity: Math.max(1, Math.min(i.medication.stock, qty)) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.medication.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      needsPrescription: () => get().items.some((i) => i.medication.requires_prescription),
    }),
    { name: "mohamads-medicore-cart" },
  ),
);
