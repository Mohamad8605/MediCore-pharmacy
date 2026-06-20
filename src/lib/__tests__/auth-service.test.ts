import { describe, it, expect } from "vitest";
import { categorizeAuthError } from "@/lib/auth-types";
import type { AuthError } from "@supabase/supabase-js";

function makeAuthError(message: string, status?: number): AuthError {
  return { name: "AuthError", message, status: status ?? 400 } as AuthError;
}

describe("categorizeAuthError", () => {
  it("returns email_not_confirmed when message includes 'email not confirmed'", () => {
    const result = categorizeAuthError(makeAuthError("email not confirmed"), "a@b.com");
    expect(result.kind).toBe("email_not_confirmed");
  });

  it("returns email_not_confirmed when message includes 'email not verified'", () => {
    const result = categorizeAuthError(makeAuthError("email not verified"), "a@b.com");
    expect(result.kind).toBe("email_not_confirmed");
  });

  it("returns invalid_password when message includes 'invalid login credentials'", () => {
    const result = categorizeAuthError(makeAuthError("invalid login credentials"), "a@b.com");
    expect(result.kind).toBe("invalid_password");
  });

  it("returns rate_limited when message includes 'rate limit'", () => {
    const result = categorizeAuthError(makeAuthError("rate limit exceeded"));
    expect(result.kind).toBe("rate_limited");
  });

  it("returns rate_limited when status is 429", () => {
    const result = categorizeAuthError(makeAuthError("Too many requests", 429));
    expect(result.kind).toBe("rate_limited");
  });

  it("returns suspended when message includes 'suspended'", () => {
    const result = categorizeAuthError(makeAuthError("account suspended"));
    expect(result.kind).toBe("suspended");
  });

  it("returns suspended when message includes 'disabled'", () => {
    const result = categorizeAuthError(makeAuthError("account disabled"));
    expect(result.kind).toBe("suspended");
  });

  it("returns suspended when message includes 'locked'", () => {
    const result = categorizeAuthError(makeAuthError("account locked"));
    expect(result.kind).toBe("suspended");
  });

  it("returns unknown for unrecognized error", () => {
    const result = categorizeAuthError(makeAuthError("some random error"));
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("some random error");
  });

  it("returns user-facing message for known failures", () => {
    const result = categorizeAuthError(makeAuthError("invalid login credentials"));
    expect(result.message).toContain("Incorrect email or password");
  });
});
