import {
  loadOrders as serverLoadOrders,
  updateOrderStatus as serverUpdateOrderStatus,
  getConfirmationSetting as serverGetConfirmationSetting,
  toggleConfirmation as serverToggleConfirmation,
  fetchAllMedications as serverFetchAllMedications,
  createMedication as serverCreateMedication,
  updateMedication as serverUpdateMedication,
} from "@/server/api/admin";

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

/** Loads orders from the server with optional status filter and pagination. */
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

/** Updates the status of a specific order (e.g. "processing", "shipped"). */
export async function updateOrderStatus(id: string, status: string) {
  return await (
    serverUpdateOrderStatus as unknown as ServerFn<{ id: string; status: string }, void>
  )({
    data: { id, status },
  });
}

/** Gets the admin toggle value for whether email confirmation is required. */
export async function getConfirmationSetting(): Promise<boolean> {
  return await (serverGetConfirmationSetting as unknown as () => Promise<boolean>)();
}

/** Sets the email-confirmation requirement toggle on the server. */
export async function toggleConfirmation(checked: boolean) {
  return await (serverToggleConfirmation as unknown as ServerFn<boolean, void>)({ data: checked });
}

/** Fetches all medications (active and inactive) for the admin catalogue editor. */
export async function fetchAllMedications() {
  return await (serverFetchAllMedications as unknown as () => Promise<Record<string, unknown>[]>)();
}

/** Creates a new medication record on the server. */
export async function createMedication(data: Record<string, unknown>) {
  return await (serverCreateMedication as unknown as ServerFn<Record<string, unknown>, void>)({
    data,
  });
}

/** Updates an existing medication record by its ID. */
export async function updateMedication(id: string, data: Record<string, unknown>) {
  return await (
    serverUpdateMedication as unknown as ServerFn<{ id: string } & Record<string, unknown>, void>
  )({
    data: { id, ...data },
  });
}
