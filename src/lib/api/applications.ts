import { apiRequest } from "./client";
import type { Application, ApplicationScope, UserApplicationAccess } from "../../types";

export async function listApplications(): Promise<{ applications: Application[] }> {
  return apiRequest<{ applications: Application[] }>("/api/v1/applications");
}

export async function getApplication(id: string): Promise<{ application: Application }> {
  return apiRequest<{ application: Application }>(`/api/v1/applications/${id}`);
}

export async function createApplication(
  name: string,
  slug: string,
  redirectUris?: string[],
): Promise<{ application: Application; clientSecret: string }> {
  return apiRequest<{ application: Application; clientSecret: string }>(
    "/api/v1/applications",
    {
      method: "POST",
      body: JSON.stringify({ name, slug, redirectUris }),
    },
  );
}

export async function updateApplication(
  id: string,
  data: { name?: string; redirectUris?: string[]; status?: string },
): Promise<{ application: Application }> {
  return apiRequest<{ application: Application }>(`/api/v1/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  return apiRequest<void>(`/api/v1/applications/${id}`, {
    method: "DELETE",
  });
}

export async function rotateSecret(id: string): Promise<{ clientSecret: string }> {
  return apiRequest<{ clientSecret: string }>(
    `/api/v1/applications/${id}/rotate-secret`,
    { method: "POST" },
  );
}

export async function listApplicationScopes(
  applicationId: string,
): Promise<{ scopes: ApplicationScope[] }> {
  return apiRequest<{ scopes: ApplicationScope[] }>(
    `/api/v1/applications/${applicationId}/scopes`,
  );
}

export async function createApplicationScope(
  applicationId: string,
  scope: string,
  description?: string,
): Promise<{ scope: ApplicationScope }> {
  return apiRequest<{ scope: ApplicationScope }>(
    `/api/v1/applications/${applicationId}/scopes`,
    {
      method: "POST",
      body: JSON.stringify({ scope, description }),
    },
  );
}

export async function deleteApplicationScope(
  applicationId: string,
  scopeId: string,
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/applications/${applicationId}/scopes/${scopeId}`,
    { method: "DELETE" },
  );
}

export async function listApplicationAccess(
  applicationId: string,
): Promise<{ access: UserApplicationAccess[] }> {
  return apiRequest<{ access: UserApplicationAccess[] }>(
    `/api/v1/applications/${applicationId}/access`,
  );
}

export async function grantApplicationAccess(
  applicationId: string,
  userId: string,
  scopes: string[],
): Promise<{ access: UserApplicationAccess }> {
  return apiRequest<{ access: UserApplicationAccess }>(
    `/api/v1/applications/${applicationId}/access`,
    {
      method: "POST",
      body: JSON.stringify({ userId, scopes }),
    },
  );
}

export async function revokeApplicationAccess(
  applicationId: string,
  accessId: string,
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/applications/${applicationId}/access/${accessId}`,
    { method: "DELETE" },
  );
}
