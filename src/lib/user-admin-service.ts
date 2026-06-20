import {
  getAllUsers as serverGetAllUsers,
  updateUserRole as serverUpdateUserRole,
} from "@/server/api/admin";

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

type UserRoleInput = {
  userId: string;
  role: "admin" | "pharmacist" | "patient";
  action: "add" | "remove";
};

export async function getAllUsers() {
  return await (serverGetAllUsers as unknown as () => Promise<Record<string, unknown>[]>)();
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "pharmacist" | "patient",
  action: "add" | "remove",
) {
  return await (serverUpdateUserRole as unknown as ServerFn<UserRoleInput, void>)({
    data: { userId, role, action },
  });
}
