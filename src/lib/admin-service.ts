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


export async function updateOrderStatus(id: string, status: string) {
  return await (
    serverUpdateOrderStatus as unknown as ServerFn<{ id: string; status: string }, void>
  )({
    data: { id, status },
  });
}

export async function getConfirmationSetting(): Promise<boolean> {
  return await (serverGetConfirmationSetting as unknown as () => Promise<boolean>)();
}

export async function toggleConfirmation(checked: boolean) {
  return await (serverToggleConfirmation as unknown as ServerFn<boolean, void>)({ data: checked });
}

export async function fetchAllMedications() {
  return await (serverFetchAllMedications as unknown as () => Promise<Record<string, unknown>[]>)();
}

export async function createMedication(data: Record<string, unknown>) {
  return await (serverCreateMedication as unknown as ServerFn<Record<string, unknown>, void>)({
    data,
  });
}

export async function updateMedication(id: string, data: Record<string, unknown>) {
  return await (
    serverUpdateMedication as unknown as ServerFn<{ id: string } & Record<string, unknown>, void>
  )({
    data: { id, ...data },
  });
}
