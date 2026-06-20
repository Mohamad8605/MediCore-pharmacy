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

/** Wraps an imported server function with the expected type signature. */
function sfn<TInput, TOutput>(fn: unknown): ServerFn<TInput, TOutput> {
  return fn as ServerFn<TInput, TOutput>;
}

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

/** Creates a new user account via the server function and sets the session on success. */
export async function signUp(
  email: string,
  password: string,
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, string>;
  },
): Promise<{ user?: User; error?: string }> {
  const result = await sfn<SignUpInput, AuthResult>(serverSignUp)({
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

/** Authenticates a user with email and password. Returns the user or a typed failure reason. */
export async function signIn(
  email: string,
  password: string,
): Promise<{ user?: User; failure?: AuthFailure }> {
  const result = await sfn<{ email: string; password: string }, AuthResult>(serverSignIn)({
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

type DemoSignInResult = {
  user?: User;
  roles?: string[];
  failure?: AuthFailure;
  demo?: boolean;
};

/** Signs in using the demo account. Returns user, roles, and a demo flag. */
export async function demoSignIn(email: string, password: string): Promise<DemoSignInResult> {
  return await sfn<{ email: string; password: string }, DemoSignInResult>(serverDemoSignIn)({
    data: { email, password },
  });
}

/** Re-sends the email verification link for a given email address. */
export async function resendVerification(email: string): Promise<{ error?: string }> {
  return await sfn<string, { error?: string }>(serverResendVerification)({
    data: email,
  });
}

/** Fetches the current user's roles from the server. Returns an empty array on failure. */
export async function getUserRoles(): Promise<string[]> {
  try {
    return await sfn<void, string[]>(serverGetUserRoles as unknown as ServerFn<void, string[]>)({
      data: undefined,
    });
  } catch {
    return [];
  }
}

/** Sends a password-reset email to the given address. */
export async function sendPasswordReset(email: string): Promise<{ error?: string }> {
  return await sfn<string, { error?: string }>(serverSendPasswordReset)({
    data: email,
  });
}

/** Updates the current user's email address via the server function. */
export async function updateEmail(newEmail: string): Promise<{ error?: string }> {
  return await sfn<string, { error?: string }>(serverUpdateEmail)({
    data: newEmail,
  });
}

const CACHE_TTL_MS = 60_000;
let _cachedConfirmationSetting: { value: boolean; expiresAt: number } | null = null;

/** Checks whether email confirmation is required before login. Caches the result for 60 seconds. */
export async function isEmailConfirmationRequired(): Promise<boolean> {
  if (_cachedConfirmationSetting && Date.now() < _cachedConfirmationSetting.expiresAt) {
    return _cachedConfirmationSetting.value;
  }
  try {
    const value = await sfn<void, boolean>(
      serverGetConfirmationSetting as unknown as ServerFn<void, boolean>,
    )({ data: undefined });
    _cachedConfirmationSetting = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  } catch {
    _cachedConfirmationSetting = { value: true, expiresAt: Date.now() + CACHE_TTL_MS };
    return true;
  }
}
