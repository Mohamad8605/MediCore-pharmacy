import type { Database } from "@/integrations/supabase/types";
import {
  fetchUserOrders as serverFetchUserOrders,
  fetchOrderById as serverFetchOrderById,
  createOrder as serverCreateOrder,
  createOrderItems as serverCreateOrderItems,
  uploadPrescription as serverUploadPrescription,
  cancelOrder as serverCancelOrder,
  deleteOrder as serverDeleteOrder,
  getPrescriptionSignedUrl as serverGetPrescriptionSignedUrl,
  checkMedicationStock as serverCheckMedicationStock,
  fetchMedicationStock as serverFetchMedicationStock,
  getMedicationsByIds as serverGetMedicationsByIds,
  validateStock as serverValidateStock,
  reserveStock as serverReserveStock,
  releaseStock as serverReleaseStock,
  checkAndReserveStock as serverCheckAndReserveStock,
  updateOrder as serverUpdateOrder,
} from "@/server/api/orders";

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;
// TODO: add cursor-based pagination to fetchUserOrders — the admin
// dashboard loads all orders at once which gets slow past ~200 rows.

type OrderInput = {
  total_price: number;
  delivery_method: "pickup" | "delivery";
  street: string | null;
  city: string | null;
  postcode: string | null;
  notes: string | null;
  prescription_path: string | null;
};

type OrderItemInput = Array<{
  order_id: string;
  medication_id: string;
  quantity: number;
  unit_price: number;
}>;

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

/**
 * Pull every order this user has ever placed. The server filters by
 * their user ID so customers only see their own stuff.
 */
export async function fetchUserOrders() {
  return await (serverFetchUserOrders as unknown as () => Promise<Record<string, unknown>[]>)();
}

/**
 * Get the full details for one order — items, status, timestamps.
 * Null means it doesn't exist or you don't have access.
 */
export async function fetchOrderById(orderId: string) {
  return await (
    serverFetchOrderById as unknown as ServerFn<string, Record<string, unknown> | null>
  )({
    data: orderId,
  });
}

/**
 * Place an order — address, delivery method, any notes attached.
 * Stock is already reserved when items hit the cart, so this just
 * saves the header record.
 */
export async function createOrder(order: OrderInput) {
  return await (serverCreateOrder as unknown as ServerFn<OrderInput, OrderRow>)({
    data: order,
  });
}

/**
 * Insert each medication as a line item under the order header.
 * Stock was already reserved when each item entered the cart, so
 * there's no double-deduction here — just record-keeping.
 */
export async function createOrderItems(items: OrderItemInput) {
  return await (serverCreateOrderItems as unknown as ServerFn<OrderItemInput, void>)({
    data: items,
  });
}

/**
 * Takes a file from the user (photo of a paper prescription or a PDF),
 * converts it to base64 so the server function can stash it in the
 * private Supabase storage bucket. Returns the path for later reference.
 */
export async function uploadPrescription(
  file: File,
): Promise<{ path: string | null; error?: string }> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  type UploadInput = { fileName: string; fileBase64: string };
  return await (
    serverUploadPrescription as unknown as ServerFn<
      UploadInput,
      { path: string | null; error?: string }
    >
  )({
    data: { fileName: file.name, fileBase64: base64 },
  });
}

/**
 * Quick stock lookup before adding something to the cart.
 * The server returns the live count — null means the product vanished.
 */
export async function checkMedicationStock(medicationId: string) {
  return await (
    serverCheckMedicationStock as unknown as ServerFn<
      { medicationId: string },
      { id: string; stock: number; name: string } | null
    >
  )({ data: { medicationId } });
}

type StockCheckInput = Array<{ medication_id: string; quantity: number }>;

/**
 * Batch stock check — pass an array of IDs, get back their current
 * inventory. The cart uses this periodically so it can warn you if
 * something went out of stock while you were browsing.
 */
export async function fetchMedicationStock(ids: string[]) {
  return await (
    serverFetchMedicationStock as unknown as ServerFn<
      string[],
      Array<{ id: string; stock: number }>
    >
  )({ data: ids });
}

type CartMedicationData = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  requires_prescription: boolean;
};

/**
 * Fetch full medication records for a batch of IDs — used when
 * rebuilding the cart from an existing order (edit order flow).
 */
export async function getMedicationsByIds(ids: string[]) {
  return await (serverGetMedicationsByIds as unknown as ServerFn<string[], CartMedicationData[]>)({
    data: ids,
  });
}

/**
 * Final sanity check before the order goes through — makes sure
 * every item still has enough stock. If not, the server throws
 * and the checkout shows the user what changed.
 */
export async function validateStock(items: StockCheckInput) {
  return await (serverValidateStock as unknown as ServerFn<StockCheckInput, void>)({
    data: items,
  });
}

/**
 * When someone adds an item to their cart we immediately set that
 * stock aside so nobody else can buy it while they're browsing.
 */
export async function reserveStock(medicationId: string, quantity: number) {
  return await (
    serverReserveStock as unknown as ServerFn<{ medicationId: string; quantity: number }, void>
  )({ data: { medicationId, quantity } });
}

/**
 * If the item gets removed from the cart (or the quantity goes down),
 * the reserved stock goes back into the pool so someone else can buy it.
 */
export async function releaseStock(medicationId: string, quantity: number) {
  return await (
    serverReleaseStock as unknown as ServerFn<{ medicationId: string; quantity: number }, void>
  )({ data: { medicationId, quantity } });
}

type CheckAndReserveResult = {
  error?: string;
  remaining: number;
};

/**
 * Check stock and reserve it in a single atomic call.
 * Returns { remaining } on success or { error } on failure.
 */
export async function checkAndReserveStock(medicationId: string, quantity: number) {
  return await (
    serverCheckAndReserveStock as unknown as ServerFn<
      { medicationId: string; quantity: number },
      CheckAndReserveResult
    >
  )({ data: { medicationId, quantity } });
}

/**
 * Cancel while you still can — only works for pending orders.
 * Once a pharmacist starts preparing it you'd have to call them.
 */
export async function cancelOrder(orderId: string) {
  return await (serverCancelOrder as unknown as ServerFn<string, boolean>)({ data: orderId });
}

/**
 * Hard delete — wipes the order from the database entirely.
 * Same restriction as cancel: only pending orders can be removed.
 */
export async function deleteOrder(orderId: string) {
  return await (serverDeleteOrder as unknown as ServerFn<string, boolean>)({ data: orderId });
}

type UpdateOrderInput = {
  orderId: string;
  items: Array<{ medication_id: string; quantity: number; unit_price: number }>;
  total_price: number;
  delivery_method: "pickup" | "delivery";
  street: string | null;
  city: string | null;
  postcode: string | null;
  notes: string | null;
};

/**
 * Edit a pending order — replaces items, adjusts stock, and updates
 * delivery info. Only works while the order is still pending.
 */
export async function updateOrder(input: UpdateOrderInput) {
  return await (serverUpdateOrder as unknown as ServerFn<UpdateOrderInput, void>)({ data: input });
}

/**
 * Prescription files live in a private bucket. This generates a
 * time-limited link so the browser can display the image without
 * making the bucket publicly accessible.
 */
export async function getPrescriptionSignedUrl(path: string) {
  return await (serverGetPrescriptionSignedUrl as unknown as ServerFn<string, string | null>)({
    data: path,
  });
}
