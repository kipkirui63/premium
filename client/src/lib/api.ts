const AUTH_EXPIRED_EVENT = "auth:expired";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
  suppressAuthRedirect?: boolean;
};

const getDefaultApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port, origin } = window.location;
    const isLocalHost = hostname === "127.0.0.1" || hostname === "localhost";

    // In local development the frontend commonly runs on :5000 or :5173
    // while the Django API runs on :8000.
    if (isLocalHost && port && port !== "8000") {
      return `${protocol}//${hostname}:8000/api`;
    }

    return `${origin}/api`;
  }

  return "/api";
};

export const API_BASE_URL = getDefaultApiBaseUrl();

export const getApiUrl = (path: string) =>
  path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getStoredAccessToken = () => localStorage.getItem("access_token");

export const getStoredRefreshToken = () => localStorage.getItem("refresh_token");

export const clearStoredAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const isTokenValid = (token?: string | null): boolean => {
  if (!token) return false;

  try {
    const [, payloadSegment] = token.split(".");
    const payload = JSON.parse(atob(payloadSegment));
    return typeof payload.exp === "number" && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const buildLoginRedirectUrl = (reason?: string) => {
  const params = new URLSearchParams({ auth: "login" });
  if (reason) {
    params.set("reason", reason);
  }
  return `/marketplace?${params.toString()}`;
};

export const dispatchAuthExpired = (
  message = "Your session has expired. Please sign in again.",
) => {
  window.dispatchEvent(
    new CustomEvent(AUTH_EXPIRED_EVENT, {
      detail: { message },
    }),
  );
};

export const subscribeToAuthExpired = (
  listener: (event: CustomEvent<{ message?: string }>) => void,
) => {
  const handler = (event: Event) => listener(event as CustomEvent<{ message?: string }>);
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
};

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const directMessage =
      (typeof record.detail === "string" && record.detail) ||
      (typeof record.error === "string" && record.error) ||
      (typeof record.message === "string" && record.message);
    if (directMessage) {
      return directMessage;
    }

    const fieldMessages = Object.entries(record)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((item) => `${field}: ${String(item)}`);
        }
        return typeof value === "string" ? [`${field}: ${value}`] : [];
      })
      .filter(Boolean);

    if (fieldMessages.length > 0) {
      return fieldMessages.join(" ");
    }
  }

  return fallback;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = false, suppressAuthRedirect = false, headers, ...rest } = options;
  const token = getStoredAccessToken();

  if (auth && !isTokenValid(token)) {
    if (!suppressAuthRedirect) {
      dispatchAuthExpired();
    }
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  const response = await fetch(getApiUrl(path), {
    ...rest,
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message = extractErrorMessage(payload, `Request failed with status ${response.status}.`);
    if (auth && response.status === 401 && !suppressAuthRedirect) {
      dispatchAuthExpired(message);
    }
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
