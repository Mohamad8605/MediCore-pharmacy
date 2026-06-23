import {
  getAllUsers as serverGetAllUsers,
  updateUserRole as serverUpdateUserRole,
  createUser as serverCreateUser,
  deleteUser as serverDeleteUser,
} from "@/server/api/admin";

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

type UserRoleInput = {
  userId: string;
  role: "admin" | "pharmacist" | "patient";
  action: "add" | "remove";
};

/**
 * Returns every registered user with their roles. Admin-only.
 */
export async function getAllUsers() {
  return await (serverGetAllUsers as unknown as () => Promise<Record<string, unknown>[]>)();
}

/**
 * Grant or revoke a role. The server rejects self-demotion.
 */
export async function updateUserRole(
  userId: string,
  role: "admin" | "pharmacist" | "patient",
  action: "add" | "remove",
) {
  return await (serverUpdateUserRole as unknown as ServerFn<UserRoleInput, void>)({
    data: { userId, role, action },
  });
}

type CreateUserInput = { email: string; password: string; role: string };
type DeleteUserInput = { userId: string };

export async function createUser(email: string, password: string, role: string) {
  return await (serverCreateUser as unknown as ServerFn<CreateUserInput, Record<string, unknown>>)({
    data: { email, password, role },
  });
}

export async function deleteUser(userId: string) {
  return await (serverDeleteUser as unknown as ServerFn<DeleteUserInput, void>)({
    data: { userId },
  });
}
