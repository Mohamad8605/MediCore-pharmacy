import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { requireAuthUserId, isDemoRequest } from "./auth-helpers";
import { getDemoOrders, getDemoProfiles, saveDemoOrders, saveDemoProfiles } from "./demo-store";
import type { DemoItem } from "./demo-store";

function fmtDemoOrderSummary(o: {
  order: Database["public"]["Tables"]["orders"]["Row"];
  items: DemoItem[];
}) {
  return {
    id: o.order.id,
    total_price: o.order.total_price,
    status: o.order.status,
    delivery_method: o.order.delivery_method,
    created_at: o.order.created_at,
    order_items: o.items.map((i) => ({ quantity: i.quantity })),
  };
}

export const fetchUserOrders = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    return (getDemoOrders().get(userId) ?? []).map(fmtDemoOrderSummary);
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, total_price, status, delivery_method, created_at, order_items(quantity)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchUserOrders failed:", error.message);
    return [];
  }

  return data ?? [];
});

export const fetchOrderById = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const orderId = ctx.data as unknown as string;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    const entry = (getDemoOrders().get(userId) ?? []).find((e) => e.order.id === orderId);
    if (!entry) return null;
    return {
      ...entry.order,
      order_items: entry.items.map((i) => ({
        quantity: i.quantity,
        unit_price: i.unit_price,
        medications: { name: i.medication_name },
      })),
    };
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(quantity, unit_price, medications(name))")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("fetchOrderById failed:", error.message);
    return null;
  }

  return data;
});

type OrderInput = {
  total_price: number;
  delivery_method: "pickup" | "delivery";
  street: string | null;
  city: string | null;
  postcode: string | null;
  notes: string | null;
  prescription_path: string | null;
};

export const createOrder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { total_price, delivery_method, street, city, postcode, notes, prescription_path } =
    ctx.data as unknown as OrderInput;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    if (!getDemoProfiles().has(userId)) {
      const req = getRequest();
      const raw = req?.headers?.get("authorization")?.replace("Demo ", "");
      let first = "Demo",
        last = "User";
      if (raw)
        try {
          const s = JSON.parse(raw);
          const m = s?.user?.user_metadata;
          if (m?.first_name) first = m.first_name;
          if (m?.last_name) last = m.last_name;
        } catch {
          /* ignore parse errors */
        }
      getDemoProfiles().set(userId, { id: userId, first_name: first, last_name: last });
      saveDemoProfiles();
    }

    const order: Database["public"]["Tables"]["orders"]["Row"] & {
      pharmacist_notes: string | null;
    } = {
      id: crypto.randomUUID(),
      user_id: userId,
      total_price,
      status: "pending" as const,
      delivery_method,
      street,
      city,
      postcode,
      notes,
      prescription_path,
      pharmacist_notes: null,
      completed_at: null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    const existing = getDemoOrders().get(userId) ?? [];
    existing.push({ order, items: [] });
    getDemoOrders().set(userId, existing);
    saveDemoOrders();
    return order;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      total_price,
      delivery_method,
      street,
      city,
      postcode,
      notes,
      prescription_path,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
});

type OrderItemInput = Array<{
  order_id: string;
  medication_id: string;
  quantity: number;
  unit_price: number;
}>;

async function decrementStockAtomic(id: string, quantity: number) {
  const { data: med, error: fetchErr } = await supabaseAdmin
    .from("medications")
    .select("stock")
    .eq("id", id)
    .single();

  if (fetchErr || !med) throw new Error(`Medication ${id} not found`);
  if (med.stock < quantity) throw new Error(`Insufficient stock for medication ${id}: ${med.stock} < ${quantity}`);

  const newStock = med.stock - quantity;
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("medications")
    .update({ stock: newStock })
    .eq("id", id)
    .eq("stock", med.stock)
    .select();

  if (updateErr) throw updateErr;
  if (!updated || updated.length === 0)
    throw new Error(`Race condition: stock changed for ${id}, please retry`);
}

async function incrementStockAtomic(id: string, quantity: number) {
  const { data: med, error: fetchErr } = await supabaseAdmin
    .from("medications")
    .select("stock")
    .eq("id", id)
    .single();

  if (fetchErr || !med) throw new Error(`Medication ${id} not found`);

  const newStock = med.stock + quantity;
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("medications")
    .update({ stock: newStock })
    .eq("id", id)
    .eq("stock", med.stock)
    .select();

  if (updateErr) throw updateErr;
  if (!updated || updated.length === 0)
    throw new Error(`Race condition: stock changed for ${id}, please retry`);
}

export const createOrderItems = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const items = ctx.data as unknown as OrderItemInput;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    const ids = items.map((i) => i.medication_id);
    const { data: meds } = await supabaseAdmin.from("medications").select("id, name").in("id", ids);
    const nameMap = Object.fromEntries((meds ?? []).map((m) => [m.id, m.name]));
    const demoItems: DemoItem[] = items.map((i) => ({
      quantity: i.quantity,
      unit_price: i.unit_price,
      medication_id: i.medication_id,
      medication_name: nameMap[i.medication_id] ?? "Unknown",
    }));
    const existing = getDemoOrders().get(userId) ?? [];
    const entry = existing.find((e) => e.order.id === items[0]?.order_id);
    if (entry) {
      entry.items.push(...demoItems);
      saveDemoOrders();
    }
    for (const item of items) {
      await decrementStockAtomic(item.medication_id, item.quantity);
    }
    return;
  }

  const { error: insertError } = await supabaseAdmin.from("order_items").insert(items);
  if (insertError) throw insertError;

  for (const item of items) {
    await decrementStockAtomic(item.medication_id, item.quantity);
  }
});

export const checkMedicationStock = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const { medicationId } = ctx.data as unknown as { medicationId: string };
  const { data, error } = await supabaseAdmin
    .from("medications")
    .select("id, stock, name")
    .eq("id", medicationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Medication not found");
  return data;
});

export const fetchMedicationStock = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const ids = ctx.data as unknown as string[];
  if (!ids.length) return [];
  const { data, error } = await supabaseAdmin
    .from("medications")
    .select("id, stock")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
});

export const validateStock = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const items = ctx.data as unknown as Array<{ medication_id: string; quantity: number }>;
  await requireAuthUserId();

  if (isDemoRequest()) return;

  const ids = items.map((i) => i.medication_id);
  const { data: meds, error } = await supabaseAdmin
    .from("medications")
    .select("id, name, stock")
    .in("id", ids);

  if (error) throw error;

  const map = Object.fromEntries((meds ?? []).map((m) => [m.id, m]));
  const shortages: string[] = [];

  for (const item of items) {
    const med = map[item.medication_id];
    if (!med) {
      shortages.push(`Medication ${item.medication_id} not found`);
    } else if (med.stock < item.quantity) {
      shortages.push(`"${med.name}" only ${med.stock} in stock, requested ${item.quantity}`);
    }
  }

  if (shortages.length > 0) {
    throw new Error(`Insufficient stock:\n${shortages.join("\n")}`);
  }
});

type UploadInput = {
  fileName: string;
  fileBase64: string;
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const MAX_PRESCRIPTION_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES: Record<string, Uint8Array> = {
  "\xff\xd8\xff": new Uint8Array([0xff, 0xd8, 0xff]),
  "\x89PNG\r\n\x1a\n": new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "%PDF": new Uint8Array([0x25, 0x50, 0x44, 0x46]),
};

export const uploadPrescription = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { fileName, fileBase64 } = ctx.data as unknown as UploadInput;
  const userId = await requireAuthUserId();
  const ext = fileName.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(fileBase64, "base64");

  if (buffer.length > MAX_PRESCRIPTION_SIZE) {
    return { path: null, error: "File size exceeds the 5 MB limit" };
  }

  const extLower = `.${ext?.toLowerCase() ?? ""}`;
  if (!ALLOWED_EXTENSIONS.includes(extLower)) {
    return { path: null, error: "Only JPG, PNG and PDF files are allowed" };
  }

  const header = new Uint8Array(buffer.subarray(0, 8));
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;
  const isPdf =
    header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;

  if (!isJpeg && !isPng && !isPdf) {
    return { path: null, error: "File content does not match any allowed format (JPG, PNG, PDF)" };
  }
  if (isDemoRequest()) {
    return { path: `demo/${path}` };
  }

  const { error } = await supabaseAdmin.storage
    .from("prescriptions")
    .upload(path, buffer, { contentType: "application/octet-stream" });

  if (error) return { path: null, error: error.message };
  return { path };
});

export const getPrescriptionSignedUrl = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const path = ctx.data as unknown as string;
  await requireAuthUserId();
  if (isDemoRequest() || path.startsWith("demo/")) return null;
  const { data } = await supabaseAdmin.storage.from("prescriptions").createSignedUrl(path, 3600);

  return data?.signedUrl ?? null;
});

export const cancelOrder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const orderId = ctx.data as unknown as string;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    const existing = getDemoOrders().get(userId) ?? [];
    const entry = existing.find((e) => e.order.id === orderId);
    if (!entry) throw new Error("Order not found");
    if (entry.order.user_id !== userId) throw new Error("You can only cancel your own orders");
    if (entry.order.status !== "pending") throw new Error("Only pending orders can be cancelled");

    for (const item of entry.items) {
      await incrementStockAtomic(item.medication_id, item.quantity);
    }

    entry.order.status = "cancelled";
    saveDemoOrders();
    return true;
  }

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !order) throw new Error("Order not found");
  if (order.user_id !== userId) throw new Error("You can only cancel your own orders");
  if (order.status !== "pending") throw new Error("Only pending orders can be cancelled");

  const { data: orderItems, error: itemsErr } = await supabaseAdmin
    .from("order_items")
    .select("medication_id, quantity")
    .eq("order_id", orderId);

  if (itemsErr) throw itemsErr;

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) throw error;

  for (const item of orderItems ?? []) {
    await incrementStockAtomic(item.medication_id, item.quantity);
  }

  return true;
});

export const deleteOrder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const orderId = ctx.data as unknown as string;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    const existing = getDemoOrders().get(userId) ?? [];
    const entry = existing.find((e) => e.order.id === orderId);
    if (!entry) throw new Error("Order not found");
    if (entry.order.user_id !== userId) throw new Error("You can only delete your own orders");
    if (entry.order.status !== "cancelled") throw new Error("Only cancelled orders can be deleted");

    const updated = existing.filter((e) => e.order.id !== orderId);
    getDemoOrders().set(userId, updated);
    saveDemoOrders();
    return true;
  }

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !order) throw new Error("Order not found");
  if (order.user_id !== userId) throw new Error("You can only delete your own orders");
  if (order.status !== "cancelled") throw new Error("Only cancelled orders can be deleted");

  const { error } = await supabaseAdmin.from("orders").delete().eq("id", orderId);
  if (error) throw error;
  return true;
});
