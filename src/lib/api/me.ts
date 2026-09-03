import { apiRequest } from "./client";
import type { User, SecurityInfo, MyApplicationAccess, DataExport } from "../../types";

export async function updateProfile(data: {
  displayName?: string | null;
  username?: string;
  avatarUrl?: string | null;
}): Promise<{ user: User }> {
  return apiRequest<{ user: User }>("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/v1/me/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getSecurity(): Promise<{ security: SecurityInfo }> {
  return apiRequest<{ security: SecurityInfo }>("/api/v1/me/security");
}

export async function setup2FA(): Promise<{
  secret: string;
  otpauthUrl: string;
  backupCodes: string[];
}> {
  return apiRequest<{ secret: string; otpauthUrl: string; backupCodes: string[] }>(
    "/api/v1/me/security/2fa/setup",
    { method: "POST" },
  );
}

export async function confirm2FA(code: string): Promise<{ message: string; backupCodes: string[] }> {
  return apiRequest<{ message: string; backupCodes: string[] }>("/api/v1/me/security/2fa/confirm", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function disable2FA(password: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/v1/me/security/2fa/disable", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function updateRecovery(data: {
  recoveryEmail?: string | null;
  recoveryPhone?: string | null;
}): Promise<{ user: User; message: string }> {
  return apiRequest<{ user: User; message: string }>("/api/v1/me/security/recovery", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function listMyApplications(): Promise<{
  accesses: MyApplicationAccess[];
  applications: MyApplicationAccess[];
}> {
  return apiRequest<{ accesses: MyApplicationAccess[]; applications: MyApplicationAccess[] }>(
    "/api/v1/me/applications",
  );
}

export async function revokeMyApplicationAccess(accessId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/v1/me/applications/${accessId}`, {
    method: "DELETE",
  });
}

export async function exportData(): Promise<DataExport> {
  return apiRequest<DataExport>("/api/v1/me/export");
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/v1/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}
