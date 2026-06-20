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

/** Fetches all users from the server (admin-only operation). */
export async function getAllUsers() {
  return await (serverGetAllUsers as unknown as () => Promise<Record<string, unknown>[]>)();
}

/** Adds or removes a role for a given user (admin-only operation). */
export async function updateUserRole(
  userId: string,
  role: "admin" | "pharmacist" | "patient",
  action: "add" | "remove",
) {
  return await (serverUpdateUserRole as unknown as ServerFn<UserRoleInput, void>)({
    data: { userId, role, action },
  });
}
