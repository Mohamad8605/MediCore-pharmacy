import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  signUp as serverSignUp,
  signIn as serverSignIn,
  resendVerification as serverResendVerification,
  sendPasswordReset as serverSendPasswordReset,
  updateEmail as serverUpdateEmail,
  getUserRoles as serverGetUserRoles,
} from "@/server/api/auth";
import { demoSignIn as serverDemoSignIn } from "@/server/api/demo-auth";
import { getConfirmationSetting as serverGetConfirmationSetting } from "@/server/api/admin";
import { categorizeAuthError, type AuthFailure, type AuthFailureKind } from "./auth-types";
export type { AuthFailure, AuthFailureKind };
export { categorizeAuthError };

type ServerFn<TInput, TOutput> = (args: { data: TInput }) => Promise<TOutput>;

type SignUpInput = {
  email: string;
  password: string;
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, string>;
  };
};

type AuthResult = {
  user?: User;
  session?: unknown;
  error?: string;
  failure?: AuthFailure;
};

export async function signUp(
  email: string,
  password: string,
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, string>;
  },
): Promise<{ user?: User; error?: string }> {
  const result = await (serverSignUp as unknown as ServerFn<SignUpInput, AuthResult>)({
    data: {
      email,
      password,
      options: {
        emailRedirectTo: options?.emailRedirectTo ?? `${window.location.origin}/`,
        data: options?.data,
      },
    },
  });
  if (result.error) return { error: result.error };
  if (result.session) {
    await supabase.auth.setSession(
      result.session as Parameters<typeof supabase.auth.setSession>[0],
    );
  }
  return { user: result.user };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user?: User; failure?: AuthFailure }> {
  const result = await (
    serverSignIn as unknown as ServerFn<{ email: string; password: string }, AuthResult>
  )({
    data: { email, password },
  });

  if (result.failure) {
    return { failure: result.failure };
  }

  if (result.session) {
    await supabase.auth.setSession(
      result.session as Parameters<typeof supabase.auth.setSession>[0],
    );
  }

  return { user: result.user };
}

export async function demoSignIn(
  email: string,
  password: string,
): Promise<{ user?: User; roles?: string[]; failure?: AuthFailure }> {
  return await (serverDemoSignIn as unknown as ServerFn<{ email: string; password: string }, any>)({
    data: { email, password },
  });
}

export async function resendVerification(email: string): Promise<{ error?: string }> {
  return await (serverResendVerification as unknown as ServerFn<string, { error?: string }>)({
    data: email,
  });
}

export async function getUserRoles(): Promise<string[]> {
  try {
    return await (serverGetUserRoles as unknown as () => Promise<string[]>)();
  } catch {
    return [];
  }
}

export async function sendPasswordReset(email: string): Promise<{ error?: string }> {
  return await (serverSendPasswordReset as unknown as ServerFn<string, { error?: string }>)({
    data: email,
  });
}

export async function updateEmail(newEmail: string): Promise<{ error?: string }> {
  return await (serverUpdateEmail as unknown as ServerFn<string, { error?: string }>)({
    data: newEmail,
  });
}

const CACHE_TTL_MS = 60_000;
let _cachedConfirmationSetting: { value: boolean; expiresAt: number } | null = null;

export async function isEmailConfirmationRequired(): Promise<boolean> {
  if (_cachedConfirmationSetting && Date.now() < _cachedConfirmationSetting.expiresAt) {
    return _cachedConfirmationSetting.value;
  }
  try {
    const value = await (serverGetConfirmationSetting as unknown as () => Promise<boolean>)();
    _cachedConfirmationSetting = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch {
    _cachedConfirmationSetting = { value: true, expiresAt: Date.now() + CACHE_TTL_MS };
    return true;
  }
}
