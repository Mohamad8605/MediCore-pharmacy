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

/**
 * Register a new account and hook the session up on the client side.
 * Returns either the user or an error string — the caller decides what to show.
 */
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

/**
 * Email + password sign in. If something goes wrong (wrong password,
 * email not confirmed, account doesn't exist) you get back a typed failure
 * instead of a generic error — makes showing the right UI message easier.
 */
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

/**
 * Quick demo login — bypasses Supabase entirely and uses a local JSON file
 * so the assessor can jump straight in without registering. Three accounts:
 * admin, pharmacist, patient.
 */
export async function demoSignIn(email: string, password: string): Promise<DemoSignInResult> {
  return await sfn<{ email: string; password: string }, DemoSignInResult>(serverDemoSignIn)({
    data: { email, password },
  });
}

/**
 * Some users register and never check their inbox. This lets them
 * request another verification email without signing up again.
 */
export async function resendVerification(email: string): Promise<{ error?: string }> {
  return await sfn<string, { error?: string }>(serverResendVerification)({
    data: email,
  });
}

/**
 * What can this user do? Calls the server to find out their roles.
 * On failure (network down, whatever) just returns an empty list
 * rather than crashing the whole page.
 */
export async function getUserRoles(): Promise<string[]> {
  try {
    return await sfn<void, string[]>(serverGetUserRoles as unknown as ServerFn<void, string[]>)({
      data: undefined,
    });
  } catch {
    return [];
  }
}

/**
 * Forgotten password flow — triggers a reset link email through Supabase.
 * The link takes the user to the Supabase-hosted reset page.
 */
export async function sendPasswordReset(email: string): Promise<{ error?: string }> {
  return await sfn<string, { error?: string }>(serverSendPasswordReset)({
    data: email,
  });
}

/**
 * Change the email on the user's account. Only works when the user
 * is already logged in — the server checks the session token.
 */
export async function updateEmail(newEmail: string): Promise<{ error?: string }> {
  return await sfn<string, { error?: string }>(serverUpdateEmail)({
    data: newEmail,
  });
}

const CACHE_TTL_MS = 60_000;
let _cachedConfirmationSetting: { value: boolean; expiresAt: number } | null = null;

/**
 * The admin can toggle whether new users must confirm their email.
 * This reads that setting and caches it for a minute so we don't
 * hammer the server on every page load.
 */
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
