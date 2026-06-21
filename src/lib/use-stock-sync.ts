import { useEffect, useRef, useState } from "react";
import { fetchMedicationStock } from "./order-service";

export function useStockSync(ids: string[], intervalMs = 30_000) {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const idsRef = useRef(ids);
  idsRef.current = ids;

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      const currentIds = idsRef.current.filter(Boolean);
      if (!currentIds.length) return;
      try {
        const rows = await fetchMedicationStock(currentIds);
        if (!mounted) return;
        const map: Record<string, number> = {};
        for (const row of rows) {
          map[row.id] = row.stock;
        }
        setStockMap(map);
      } catch {
      }
    };

    fetch();
    const id = setInterval(fetch, intervalMs);

    const onFocus = () => {
      fetch();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [intervalMs]);

  return stockMap;
}
