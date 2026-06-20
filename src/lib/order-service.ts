import type { Database } from "@/integrations/supabase/types";
import {
  fetchUserOrders as serverFetchUserOrders,
  fetchOrderById as serverFetchOrderById,
  createOrder as serverCreateOrder,
  createOrderItems as serverCreateOrderItems,
  uploadPrescription as serverUploadPrescription,
  cancelOrder as serverCancelOrder,
  getPrescriptionSignedUrl as serverGetPrescriptionSignedUrl,
} from "@/server/api/orders";

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

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

/** Fetches all orders placed by the currently authenticated user. */
export async function fetchUserOrders() {
  return await (serverFetchUserOrders as unknown as () => Promise<Record<string, unknown>[]>)();
}

/** Fetches a single order by its ID. Returns null if the order does not exist or does not belong to the user. */
export async function fetchOrderById(orderId: string) {
  return await (
    serverFetchOrderById as unknown as ServerFn<string, Record<string, unknown> | null>
  )({
    data: orderId,
  });
}

/** Creates a new order record on the server. */
export async function createOrder(order: OrderInput) {
  return await (serverCreateOrder as unknown as ServerFn<OrderInput, OrderRow>)({
    data: order,
  });
}

/** Inserts order-item rows for a newly created order. */
export async function createOrderItems(items: OrderItemInput) {
  return await (serverCreateOrderItems as unknown as ServerFn<OrderItemInput, void>)({
    data: items,
  });
}

/** Converts a prescription file to base64 on the client, then sends it to the server for storage. */
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

/** Cancels an order by ID. Returns true if the cancellation was successful. */
export async function cancelOrder(orderId: string) {
  return await (serverCancelOrder as unknown as ServerFn<string, boolean>)({ data: orderId });
}

/** Gets a temporary signed URL for viewing a prescription file. Returns null if the path is empty. */
export async function getPrescriptionSignedUrl(path: string) {
  return await (serverGetPrescriptionSignedUrl as unknown as ServerFn<string, string | null>)({
    data: path,
  });
}
