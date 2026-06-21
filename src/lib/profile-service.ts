import {
  fetchProfile as serverFetchProfile,
  updateProfile as serverUpdateProfile,
} from "@/server/api/profile";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

/**
 * Grab the logged-in user's profile — name, address, phone, that sort
 * of thing. The profile row is auto-created when they first sign up.
 */
export async function fetchProfile(): Promise<Profile | null> {
  return await (serverFetchProfile as unknown as () => Promise<Profile | null>)();
}

/**
 * Save profile changes — name, address, contact info. The server
 * validates the fields and returns null under "error" if it went through.
 */
export async function updateProfile(updates: ProfileUpdate): Promise<{ error: string | null }> {
  return await (
    serverUpdateProfile as unknown as ServerFn<ProfileUpdate, { error: string | null }>
  )({
    data: updates,
  });
}
