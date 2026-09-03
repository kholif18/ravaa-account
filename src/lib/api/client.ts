import type { ApiError } from "../../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ─── Refresh concurrency guard ───────────────────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        setAccessToken(null);
        return null;
      }
      const data = (await res.json()) as { accessToken: string };
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
      setAccessToken(null);
      return null;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      // clear after current microtask so concurrent callers share the same promise
      const p = refreshPromise;
      // keep promise until awaiters resolved
      setTimeout(() => {
        if (refreshPromise === p) refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

export function clearRefreshState() {
  refreshPromise = null;
}

type ApiRequestOptions = RequestInit & { _retry?: boolean };

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const isRefreshRequest = path.includes("/auth/refresh");
  const { _retry, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  // 401 retry — one attempt, not for refresh itself
  if (
    response.status === 401 &&
    !isRefreshRequest &&
    !_retry &&
    !path.includes("/auth/login") &&
    !path.includes("/auth/register")
  ) {
    const newToken = await tryRefresh();
    if (newToken) {
      // retry original request once with new token
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(fetchOptions.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers: retryHeaders,
        credentials: "include",
      });
      if (retryRes.ok) {
        if (retryRes.status === 204) return undefined as T;
        return retryRes.json() as Promise<T>;
      }
      // retry also failed — fall through to error handling with retry response
      let errorData: ApiError;
      try {
        errorData = await retryRes.json();
      } catch {
        throw new ApiClientError(
          retryRes.status,
          "UNKNOWN_ERROR",
          "An unexpected error occurred",
        );
      }
      throw new ApiClientError(
        retryRes.status,
        errorData.error.code,
        errorData.error.message,
        errorData.error.details,
      );
    }
  }

  let errorData: ApiError;
  try {
    errorData = await response.json();
  } catch {
    throw new ApiClientError(
      response.status,
      "UNKNOWN_ERROR",
      "An unexpected error occurred",
    );
  }
  throw new ApiClientError(
    response.status,
    errorData.error.code,
    errorData.error.message,
    errorData.error.details,
  );
}

// Expose for AuthProvider refresh-on-boot
export async function refreshViaCookie(): Promise<string | null> {
  return tryRefresh();
}
