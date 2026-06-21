import type { Json } from "@/integrations/supabase/types";
import {
  loadOrders as serverLoadOrders,
  updateOrderStatus as serverUpdateOrderStatus,
  getConfirmationSetting as serverGetConfirmationSetting,
  toggleConfirmation as serverToggleConfirmation,
  fetchAllMedications as serverFetchAllMedications,
  createMedication as serverCreateMedication,
  updateMedication as serverUpdateMedication,
  getAllSettings as serverGetAllSettings,
  updateSetting as serverUpdateSetting,
  getPublicSettings as serverGetPublicSettings,
} from "@/server/api/admin";

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

/**
 * Admin order dashboard — paginated, filterable by status.
 * Staff only. Each page gives you a slice of orders plus the total
 * count so the UI can show "page 3 of 12".
 */
export async function loadOrders(filter: string, page = 1, pageSize = 10) {
  return await (
    serverLoadOrders as unknown as ServerFn<
      { filter: string; page: number; pageSize: number },
      { orders: Record<string, unknown>[]; total: number }
    >
  )({
    data: { filter, page, pageSize },
  });
}

/**
 * Move an order through the pipeline — confirm it, mark it as being
 * prepared, ready for pickup, completed, or cancelled. The server
 * rejects transitions that don't make sense (e.g. completed → pending).
 */
export async function updateOrderStatus(id: string, status: string) {
  return await (
    serverUpdateOrderStatus as unknown as ServerFn<{ id: string; status: string }, void>
  )({
    data: { id, status },
  });
}

/**
 * Is email verification enforced right now? Controlled from the
 * admin settings panel — some deployments want it on, others off.
 */
export async function getConfirmationSetting(): Promise<boolean> {
  return await (serverGetConfirmationSetting as unknown as () => Promise<boolean>)();
}

/**
 * Flip the email confirmation requirement. Off means users can log
 * straight in after registration without clicking a verification link.
 */
export async function toggleConfirmation(checked: boolean) {
  return await (serverToggleConfirmation as unknown as ServerFn<boolean, void>)({ data: checked });
}

/**
 * Admin-only product list — includes inactive/hidden medications
 * so staff can edit or re-enable them. Regular customers never see this.
 */
export async function fetchAllMedications() {
  return await (serverFetchAllMedications as unknown as () => Promise<Record<string, unknown>[]>)();
}

/**
 * Add a new product to the catalogue — name, price, stock, category,
 * prescription flag, the works. The server checks required fields.
 */
export async function createMedication(data: Record<string, unknown>) {
  return await (serverCreateMedication as unknown as ServerFn<Record<string, unknown>, void>)({
    data,
  });
}

/**
 * Edit an existing medication — price changes, stock corrections,
 * category re-assignments. Only the fields you pass get updated.
 */
export async function updateMedication(id: string, data: Record<string, unknown>) {
  return await (
    serverUpdateMedication as unknown as ServerFn<{ id: string } & Record<string, unknown>, void>
  )({
    data: { id, ...data },
  });
}

/**
 * Pull every config key from the database — opening hours, shipping
 * threshold, announcement banner content, low-stock alerts, all of it.
 */
export async function getAllSettings(): Promise<Record<string, Json>> {
  return await (serverGetAllSettings as unknown as () => Promise<Record<string, Json>>)();
}

/**
 * Save one setting — the admin panel calls this whenever the user
 * changes a field (e.g. toggles free shipping, edits opening hours).
 */
export async function updateSetting(key: string, value: Json) {
  return await (serverUpdateSetting as unknown as ServerFn<{ key: string; value: Json }, void>)({
    data: { key, value },
  });
}

/**
 * A subset of settings safe for unauthenticated requests —
 * things like the store's opening hours and any active announcement
 * banner. Called on every page load for the footer and banner.
 */
export async function getPublicSettings(): Promise<Record<string, Json>> {
  return await (serverGetPublicSettings as unknown as () => Promise<Record<string, Json>>)();
}
