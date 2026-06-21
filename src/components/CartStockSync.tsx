import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { fetchMedicationStock } from "@/lib/order-service";

export function CartStockSync() {
  const items = useCart((s) => s.items);
  const revalidateStock = useCart((s) => s.revalidateStock);

  useEffect(() => {
    if (!items.length) return;
    let cancelled = false;
    const ids = items.map((i) => i.medication.id);
    fetchMedicationStock(ids).then((rows) => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      for (const row of rows) {
        map[row.id] = row.stock;
      }
      revalidateStock(map);
    });
    return () => {
      cancelled = true;
    };
  }, [items, revalidateStock]);

  return null;
}
