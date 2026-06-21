import { supabase } from "@/integrations/supabase/client";

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (err && typeof err === "object" && "message" in err)
    return new Error(String((err as { message: unknown }).message));
  return new Error(String(err));
}

/**
 * Lower stock by a given amount. Uses .gte("stock", quantity) to
 * prevent overselling if someone else bought the last unit between
 * the read and the write.
 */
export async function reserveStockRPC(medicationId: string, quantity: number) {
  const { data: med, error: readErr } = await supabase
    .from("medications")
    .select("stock")
    .eq("id", medicationId)
    .single();

  if (readErr) throw toError(readErr);
  if (!med) throw new Error("Medication not found");
  if (med.stock < quantity)
    throw new Error(`Insufficient stock: only ${med.stock} available, requested ${quantity}`);

  const newStock = med.stock - quantity;
  const { error: updateErr } = await supabase
    .from("medications")
    .update({ stock: newStock })
    .eq("id", medicationId)
    .gte("stock", quantity);

  if (updateErr) throw toError(updateErr);
}

/**
 * The reverse of reserveStockRPC — adds stock back when someone
 * removes an item from their cart or an order gets cancelled.
 * No upper-bound check here because stock shouldn't really have
 * a maximum (we can always order more from the supplier).
 */
export async function releaseStockRPC(medicationId: string, quantity: number) {
  const { data: med, error: readErr } = await supabase
    .from("medications")
    .select("stock")
    .eq("id", medicationId)
    .single();

  if (readErr) throw toError(readErr);
  if (!med) throw new Error("Medication not found");

  const newStock = med.stock + quantity;
  const { error: updateErr } = await supabase
    .from("medications")
    .update({ stock: newStock })
    .eq("id", medicationId);

  if (updateErr) throw toError(updateErr);
}
