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

// Uses userId from the session, not from the request body — prevents impersonation
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

export const createOrderItems = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const items = ctx.data as unknown as OrderItemInput;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    // Look up medication names for the detail page
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
    return;
  }

  const { error } = await supabaseAdmin.from("order_items").insert(items);
  if (error) throw error;
});

type UploadInput = {
  fileName: string;
  fileBase64: string;
};

// Validates size, extension AND magic bytes so someone cant rename a .exe to .pdf
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const MAX_PRESCRIPTION_SIZE = 5 * 1024 * 1024; // 5 MB

// Magic bytes to catch renamed files (e.g. .exe -> .pdf)
const MAGIC_BYTES: Record<string, Uint8Array> = {
  "\xff\xd8\xff": new Uint8Array([0xff, 0xd8, 0xff]), // JPEG
  "\x89PNG\r\n\x1a\n": new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG
  "%PDF": new Uint8Array([0x25, 0x50, 0x44, 0x46]), // PDF
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

  // Demo users: skip storage upload, just return a synthetic path
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
  // Demo paths are synthetic, not stored in Supabase Storage
  if (isDemoRequest() || path.startsWith("demo/")) return null;
  const { data } = await supabaseAdmin.storage.from("prescriptions").createSignedUrl(path, 3600);

  return data?.signedUrl ?? null;
});

// Ownership + status check happens server-side — cant cancel someone elses order or a shipped one
export const cancelOrder = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const orderId = ctx.data as unknown as string;
  const userId = await requireAuthUserId();

  if (isDemoRequest()) {
    const existing = getDemoOrders().get(userId) ?? [];
    const entry = existing.find((e) => e.order.id === orderId);
    if (!entry) throw new Error("Order not found");
    if (entry.order.user_id !== userId) throw new Error("You can only cancel your own orders");
    if (entry.order.status !== "pending") throw new Error("Only pending orders can be cancelled");
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

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) throw error;
  return true;
});
