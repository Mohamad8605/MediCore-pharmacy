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
  validateStock as serverValidateStock,
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

export async function fetchUserOrders() {
  return await (serverFetchUserOrders as unknown as () => Promise<Record<string, unknown>[]>)();
}

export async function fetchOrderById(orderId: string) {
  return await (
    serverFetchOrderById as unknown as ServerFn<string, Record<string, unknown> | null>
  )({
    data: orderId,
  });
}

export async function createOrder(order: OrderInput) {
  return await (serverCreateOrder as unknown as ServerFn<OrderInput, OrderRow>)({
    data: order,
  });
}

export async function createOrderItems(items: OrderItemInput) {
  return await (serverCreateOrderItems as unknown as ServerFn<OrderItemInput, void>)({
    data: items,
  });
}

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

export async function checkMedicationStock(medicationId: string) {
  return await (
    serverCheckMedicationStock as unknown as ServerFn<
      { medicationId: string },
      { id: string; stock: number; name: string } | null
    >
  )({ data: { medicationId } });
}

type StockCheckInput = Array<{ medication_id: string; quantity: number }>;

export async function fetchMedicationStock(ids: string[]) {
  return await (
    serverFetchMedicationStock as unknown as ServerFn<string[], Array<{ id: string; stock: number }>>
  )({ data: ids });
}


export async function validateStock(items: StockCheckInput) {
  return await (serverValidateStock as unknown as ServerFn<StockCheckInput, void>)({
    data: items,
  });
}

export async function cancelOrder(orderId: string) {
  return await (serverCancelOrder as unknown as ServerFn<string, boolean>)({ data: orderId });
}

export async function deleteOrder(orderId: string) {
  return await (serverDeleteOrder as unknown as ServerFn<string, boolean>)({ data: orderId });
}

export async function getPrescriptionSignedUrl(path: string) {
  return await (serverGetPrescriptionSignedUrl as unknown as ServerFn<string, string | null>)({
    data: path,
  });
}
