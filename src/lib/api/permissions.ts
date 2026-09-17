/**
 * DEPRECATED di HOME mode (ADR 2026-09-17)
 * RBAC Enterprise (resource:action + grant/revoke) — overkill untuk pribadi/keluarga/toko.
 * Untuk HOME, share file pakai ShareLink di Ravaa-Drive (LINK + token aman + password), bukan via service RBAC.
 * File ini tetap ada untuk business mode (VITE_HOME_HIDE_ADMIN=false), tapi tidak dipakai di HOME.
 * Jangan hapus — bisa diaktifkan lagi jika go business/SaaS.
 */

import { apiRequest } from "./client";
import type { Permission, ResourcePermission } from "../../types";

export async function listPermissions(): Promise<{ permissions: Permission[] }> {
  return apiRequest<{ permissions: Permission[] }>("/api/v1/permissions");
}

export async function getPermission(id: string): Promise<{ permission: Permission }> {
  return apiRequest<{ permission: Permission }>(`/api/v1/permissions/${id}`);
}

export async function createPermission(
  resource: string,
  action: string,
  description?: string,
): Promise<{ permission: Permission }> {
  return apiRequest<{ permission: Permission }>("/api/v1/permissions", {
    method: "POST",
    body: JSON.stringify({ resource, action, description }),
  });
}

export async function deletePermission(id: string): Promise<void> {
  return apiRequest<void>(`/api/v1/permissions/${id}`, {
    method: "DELETE",
  });
}

export async function grantResourcePermission(
  resourceType: string,
  resourceId: string,
  principalType: string,
  principalId: string,
  permissionId: string,
  expiresAt?: string,
): Promise<{ permission: ResourcePermission }> {
  return apiRequest<{ permission: ResourcePermission }>("/api/v1/permissions/grant", {
    method: "POST",
    body: JSON.stringify({
      resourceType,
      resourceId,
      principalType,
      principalId,
      permissionId,
      expiresAt,
    }),
  });
}

export async function revokeResourcePermission(
  resourceType: string,
  resourceId: string,
  principalType: string,
  principalId: string,
  permissionId: string,
): Promise<{ revoked: boolean }> {
  return apiRequest<{ revoked: boolean }>("/api/v1/permissions/revoke", {
    method: "POST",
    body: JSON.stringify({
      resourceType,
      resourceId,
      principalType,
      principalId,
      permissionId,
    }),
  });
}

export async function listResourcePermissions(
  resourceType: string,
  resourceId: string,
): Promise<{ permissions: ResourcePermission[] }> {
  return apiRequest<{ permissions: ResourcePermission[] }>(
    `/api/v1/permissions/resource/${resourceType}/${resourceId}`,
  );
}

export async function listPrincipalPermissions(
  principalType: string,
  principalId: string,
): Promise<{ permissions: ResourcePermission[] }> {
  return apiRequest<{ permissions: ResourcePermission[] }>(
    `/api/v1/permissions/principal/${principalType}/${principalId}`,
  );
}
