import { checkMedicationStock } from "./order-service";
import { useCart, type CartMedication } from "./cart";
import { toast } from "sonner";

export async function addToCartWithCheck(
  med: CartMedication,
  qty: number = 1,
) {
  let liveStock = med.stock;
  try {
    const serverMed = await checkMedicationStock(med.id);
    if (!serverMed) {
      toast.error(`${med.name} is no longer available`);
      return;
    }
    liveStock = serverMed.stock;
    if (liveStock <= 0) {
      toast.error(`${med.name} is out of stock`);
      return;
    }
    if (liveStock < qty) {
      toast.error(`Only ${liveStock} of "${med.name}" in stock`);
      return;
    }
  } catch {
  }
  if (liveStock <= 0) {
    toast.error(`${med.name} is out of stock`);
    return;
  }
  const freshMed: CartMedication = { ...med, stock: liveStock };
  useCart.getState().add(freshMed, qty);
  toast.success(`${med.name} added to cart`);
}
