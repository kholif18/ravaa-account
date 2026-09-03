import { apiRequest } from "./client";
import type { AuthResult, RefreshResult, User } from "../../types";

export async function login(
  identifier: string,
  password: string,
  deviceName?: string,
  deviceType?: string,
): Promise<AuthResult> {
  return apiRequest<AuthResult>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password, deviceName, deviceType }),
  });
}

export async function register(
  email: string,
  username: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  return apiRequest<AuthResult>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password, displayName }),
  });
}

export async function refreshViaCookie(): Promise<RefreshResult> {
  return apiRequest<RefreshResult>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// legacy: explicit token refresh (kept for compatibility, but prefer cookie)
export async function refresh(refreshToken: string): Promise<RefreshResult> {
  return apiRequest<RefreshResult>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logout(): Promise<void> {
  return apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>("/api/v1/me");
}

export async function verifyEmail(token: string): Promise<{ message: string; user: User }> {
  return apiRequest<{ message: string; user: User }>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/v1/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
