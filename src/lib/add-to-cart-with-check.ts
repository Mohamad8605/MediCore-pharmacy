import { checkAndReserveStock } from "./order-service";
import { useCart, type CartMedication } from "./cart";
import { useStockStore } from "./stock-store";
import { toast } from "sonner";

/**
 * Before dropping something in the cart, ask the server what the real
 * stock count is. If the server is down we fall back to whatever the
 * product card showed. Shows a toast if there's not enough.
 */
export async function addToCartWithCheck(med: CartMedication, qty: number = 1) {
  try {
    const result = await checkAndReserveStock(med.id, qty);
    if (!result) {
      toast.error(`${med.name} is no longer available`);
      return;
    }
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const freshMed: CartMedication = { ...med, stock: result.remaining };
    useCart.getState().add(freshMed, qty);
    useStockStore.getState().refresh();
    toast.success(`${med.name} added to cart`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    toast.error(`Could not reserve stock: ${msg}`);
  }
}
