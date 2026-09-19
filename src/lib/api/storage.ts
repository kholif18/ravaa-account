import { apiRequest } from "./client";

export type StorageLocation = {
  id: string;
  path: string;
  enabled: boolean;
  total?: number;
  free?: number;
  used?: number;
  percentUsed?: number;
  exists?: boolean;
  writable?: boolean;
};

export async function listStorage(): Promise<{ locations: StorageLocation[]; mounts: any[] }> {
  const data = await apiRequest<{ locations: StorageLocation[]; mounts: any[] }>("/api/v1/admin/storage/locations");
  return data as any;
}

export async function addStorage(path: string): Promise<{ location: StorageLocation }> {
  return apiRequest<{ location: StorageLocation }>("/api/v1/admin/storage/locations", {
    method: "POST",
    body: JSON.stringify({ path }),
  }) as any;
}

export async function removeStorage(id: string): Promise<void> {
  return apiRequest<void>("/api/v1/admin/storage/locations", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}
