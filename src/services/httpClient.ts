

/**
 * httpClient.ts
 *
 * Client HTTP centralisé pour les appels vers le backend Spring Boot.
 *
 * Fonctionnalités :
 *   - Base URL configurée via VITE_API_URL (build-time)
 *   - Injection automatique du header Authorization: Bearer <token>
 *   - skipAuth: true pour les routes publiques (inscription, login, reCAPTCHA…)
 *   - Support des query params via l'option { params }
 *   - Support natif FormData : Content-Type NON forcé (boundary généré par le browser)
 *   - Erreurs enrichies avec le status HTTP
 */

import { authEvents } from "@/services/api/authEvents";

const BASE_URL   = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PREFIX = "/api/v1";

// ─── Clé de stockage ──────────────────────────────────────────────────────────
export const TOKEN_KEY = "access_token";
/** Drapeau (sessionStorage) lu par la page de connexion pour expliquer la déconnexion. */
export const SESSION_EXPIRED_KEY = "session_expired";


export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clearTokens: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestOptions {
  /** Si true, n'envoie PAS le header Authorization (routes publiques) */
  skipAuth?: boolean;
  /** Query params ajoutés à l'URL */
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
      public readonly status: number,
      message: string,
      public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = `${BASE_URL}${API_PREFIX}${path}`;
  if (!params) return url;

  const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");

  return qs ? `${url}?${qs}` : url;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, params, headers: extraHeaders = {} } = options;

  const isFormData = body instanceof FormData;

  // Pour FormData, on NE SET PAS Content-Type manuellement.
  // Le browser génère automatiquement "multipart/form-data; boundary=xxxx".
  // Forcer ce header supprime le boundary → Spring Boot "Failed to parse multipart".
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...extraHeaders,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    method,
    headers,
    body: isFormData
        ? body                              // FormData passé tel quel
        : body !== undefined
            ? JSON.stringify(body)          // JSON sérialisé
            : undefined,
  });

  // Pas de contenu (ex: DELETE 204)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
        (data as { message?: string })?.message ??
        `Erreur ${response.status}`;
    // Jeton expiré ou révoqué : on le retire et on prévient AuthProvider (qui déconnecte et renvoie à /connexion).
    // Les routes publiques (skipAuth) et les échecs de connexion n'ont pas de jeton à retirer.
    if (response.status === 401 && !skipAuth && getToken()) {
      localStorage.removeItem(TOKEN_KEY);
      try { sessionStorage.setItem(SESSION_EXPIRED_KEY, "1"); } catch { /* stockage indisponible */ }
      authEvents.emit("unauthorized");
    }
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

/**
 * Télécharge un fichier binaire (PDF…). Les erreurs JSON du serveur (404, 410…) sont converties
 * en ApiError avec leur message, comme pour `request`.
 */
async function requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const { skipAuth = false, params } = options;
  const headers: Record<string, string> = {};
  if (!skipAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(buildUrl(path, params), { method: "GET", headers });
  if (!response.ok) {
    let message = `Erreur ${response.status}`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch { /* corps non JSON */ }
    throw new ApiError(response.status, message);
  }
  return response.blob();
}

// ─── Interface publique ───────────────────────────────────────────────────────

export const httpClient = {
  getBlob: (path: string, options?: RequestOptions) => requestBlob(path, options),

  get: <T>(path: string, options?: RequestOptions) =>
      request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("PATCH", path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
      request<T>("DELETE", path, undefined, options),
};

export { ApiError };
