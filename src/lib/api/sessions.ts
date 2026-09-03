import { apiRequest } from "./client";
import type { Session } from "../../types";

export async function listSessions(): Promise<{ sessions: Session[] }> {
  return apiRequest<{ sessions: Session[] }>("/api/v1/sessions");
}

export async function revokeSession(sessionId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function revokeAllSessions(): Promise<void> {
  return apiRequest<void>("/api/v1/sessions", {
    method: "DELETE",
  });
}
