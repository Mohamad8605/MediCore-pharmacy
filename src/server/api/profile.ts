import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { requireAuthUserId, isDemoRequest } from "./auth-helpers";

// Profiles are auto-created via DB trigger on signup, so null means trigger failed
export const fetchProfile = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireAuthUserId();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile error:", error.message);
    return null;
  }

  // Demo users have no DB profile — return a synthetic one
  if (!data && isDemoRequest()) {
    return {
      id: userId,
      email: userId,
      first_name: "Demo",
      last_name: "User",
      role: null,
      created_at: new Date().toISOString(),
    };
  }

  return data;
});

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const updateProfile = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const updates = ctx.data as unknown as ProfileUpdate;
  const userId = await requireAuthUserId();
  if (isDemoRequest()) return { error: "Demo users cannot update profiles" };

  const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", userId);

  if (error) {
    console.error("updateProfile error:", error.message);
    return { error: error.message };
  }

  return { error: null };
});
