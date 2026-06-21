import type { Database } from "@/integrations/supabase/types";
import {
  submitContactMessage as serverSubmitContactMessage,
  getContactMessages as serverGetContactMessages,
} from "@/server/api/contact";

type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ContactResult = { error: string | null };
type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

/**
 * Someone filled out the contact form — name, email, subject, message.
 * This saves it to the database so the pharmacy team can read it later.
 */
export async function submitContactMessage(message: ContactInput): Promise<ContactResult> {
  return await (serverSubmitContactMessage as unknown as ServerFn<ContactInput, ContactResult>)({
    data: message,
  });
}

/**
 * Load every message people have sent through the contact form.
 * Only admins and pharmacists can see these — patients get a 403.
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  return await (serverGetContactMessages as unknown as () => Promise<ContactMessage[]>)();
}
