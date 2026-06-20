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

/** Submits a contact form message to the server for storage. */
export async function submitContactMessage(message: ContactInput): Promise<ContactResult> {
  return await (serverSubmitContactMessage as unknown as ServerFn<ContactInput, ContactResult>)({
    data: message,
  });
}

/** Fetches all contact messages from the server (admin use). */
export async function getContactMessages(): Promise<ContactMessage[]> {
  return await (serverGetContactMessages as unknown as () => Promise<ContactMessage[]>)();
}
