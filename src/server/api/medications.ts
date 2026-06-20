import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type Medication = Database["public"]["Tables"]["medications"]["Row"];

const LIST_FIELDS =
  "id,name,description,category,price,stock,image_url,requires_prescription" as const;

export const fetchActiveMedications = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("medications")
    .select(LIST_FIELDS)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return (data ?? []) as Medication[];
});

export const fetchMedicationById = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const id = ctx.data as unknown as string;
  const { data, error } = await supabaseAdmin
    .from("medications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchMedicationById error:", error.message);
    return null;
  }

  return data as Medication | null;
});
