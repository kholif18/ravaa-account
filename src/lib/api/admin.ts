import { apiRequest } from "./client";
import type { User } from "../../types";

export async function listUsers(): Promise<{ users: (User & { storageLimit?: number })[] }> {
  return apiRequest<{ users: (User & { storageLimit?: number })[] }>("/api/v1/admin/users");
}

export async function updateUserStorage(userId: string, storageLimit: number): Promise<{ user: User & { storageLimit?: number } }> {
  return apiRequest<{ user: User & { storageLimit?: number } }>(`/api/v1/admin/users/${userId}/storage`, {
    method: "PATCH",
    body: JSON.stringify({ storageLimit }),
  });
}
