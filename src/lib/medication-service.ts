import {
  fetchActiveMedications as serverFetchActiveMedications,
  fetchMedicationById as serverFetchMedicationById,
} from "@/server/api/medications";
import type { Database } from "@/integrations/supabase/types";

type Medication = Database["public"]["Tables"]["medications"]["Row"];
type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

/**
 * The customer-facing catalogue — only returns products marked active
 * so discontinued or hidden items never show up on the storefront.
 */
export async function fetchActiveMedications(): Promise<Medication[]> {
  return await (serverFetchActiveMedications as unknown as () => Promise<Medication[]>)();
}

/**
 * Look up one product by ID — used on the detail page and when
 * the cart needs to re-verify pricing or availability.
 */
export async function fetchMedicationById(id: string): Promise<Medication | null> {
  return await (serverFetchMedicationById as unknown as ServerFn<string, Medication | null>)({
    data: id,
  });
}
