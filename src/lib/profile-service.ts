import {
  fetchProfile as serverFetchProfile,
  updateProfile as serverUpdateProfile,
} from "@/server/api/profile";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

/** Fetches the current user's profile from the server. Returns null if not yet created. */
export async function fetchProfile(): Promise<Profile | null> {
  return await (serverFetchProfile as unknown as () => Promise<Profile | null>)();
}

/** Updates the current user's profile fields. Returns an error message if the update fails. */
export async function updateProfile(updates: ProfileUpdate): Promise<{ error: string | null }> {
  return await (
    serverUpdateProfile as unknown as ServerFn<ProfileUpdate, { error: string | null }>
  )({
    data: updates,
  });
}
