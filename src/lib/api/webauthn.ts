import { apiRequest } from "./client";

export async function getRegisterOptions(): Promise<any> {
  return apiRequest<any>("/api/v1/webauthn/register/options", { method: "POST" });
}
export async function verifyRegister(credential: any, deviceName?: string): Promise<any> {
  return apiRequest<any>("/api/v1/webauthn/register/verify", { method: "POST", body: JSON.stringify({ ...credential, deviceName }) });
}
export async function listCredentials(): Promise<{ credentials: any[] }> {
  return apiRequest<{ credentials: any[] }>("/api/v1/webauthn/credentials");
}
export async function deleteCredential(id: string): Promise<void> {
  return apiRequest<void>(`/api/v1/webauthn/credentials/${id}`, { method: "DELETE" });
}
export async function getLoginOptions(identifier?: string): Promise<any> {
  return apiRequest<any>("/api/v1/webauthn/login/options", { method: "POST", body: JSON.stringify({ identifier }) });
}
export async function verifyLogin(identifier: string, credential: any): Promise<any> {
  return apiRequest<any>("/api/v1/webauthn/login/verify", { method: "POST", body: JSON.stringify({ identifier, credential }) });
}
