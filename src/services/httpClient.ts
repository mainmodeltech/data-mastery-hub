/**
 * httpClient.ts
 *
 * Client HTTP centralisé pour les appels vers le backend Spring Boot.
 *
 * Session :
 *   - le jeton d'accès (15 minutes) vit UNIQUEMENT en mémoire de la page : jamais dans localStorage, donc illisible
 *     par un script injecté qui fouillerait le stockage du navigateur ;
 *   - la session se prolonge par un cookie HttpOnly (jeton de rafraîchissement) que seul le navigateur envoie, vers
 *     /api/v1/auth/refresh ; un 401 déclenche un rafraîchissement silencieux (un seul à la fois), puis la requête est rejouée ;
 *   - si le rafraîchissement échoue, la session est terminée (événement 'unauthorized').
 *
 * Fonctionnalités :
 *   - Base URL configurée via VITE_API_BASE_URL (build-time)
 *   - Injection automatique du header Authorization: Bearer <token>
 *   - skipAuth: true pour les routes publiques (inscription, login, reCAPTCHA…)
 *   - Support des query params via l'option { params }
 *   - Support natif FormData : Content-Type NON forcé (boundary généré par le browser)
 *   - Erreurs enrichies avec le status HTTP
 */

import { authEvents } from "@/services/api/authEvents";

const BASE_URL   = import.meta.env.VITE_API_BASE_URL ?? "";
const API_PREFIX = "/api/v1";

/** Drapeau (sessionStorage) lu par la page de connexion pour expliquer la déconnexion. */
export const SESSION_EXPIRED_KEY = "session_expired";

/** Ancienne clé de stockage du jeton (avant le cookie de session) : retirée à chaque chargement. */
const LEGACY_TOKEN_KEY = "access_token";
try { localStorage.removeItem(LEGACY_TOKEN_KEY); } catch { /* stockage indisponible */ }

// ─── Jeton d'accès en mémoire ─────────────────────────────────────────────────

let accessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => accessToken,
  setAccessToken: (token: string): void => { accessToken = token; },
  clearTokens: (): void => { accessToken = null; },
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

// ─── Rafraîchissement silencieux (un seul à la fois) ──────────────────────────

let refreshing: Promise<string | null> | null = null;

/**
 * Échange le cookie de session contre un nouveau jeton d'accès. Renvoie le jeton, ou null si la session est
 * terminée. Appels simultanés (plusieurs requêtes en 401 en même temps) : un seul aller-retour réseau.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetch(`${BASE_URL}${API_PREFIX}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return null;
        const data = (await response.json()) as { accessToken?: string };
        if (!data.accessToken) return null;
        accessToken = data.accessToken;
        authEvents.emit("token", data.accessToken);
        return data.accessToken;
      } catch {
        return null;   // réseau indisponible : la session n'est pas pour autant terminée, l'appelant échouera normalement
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

/** Session terminée : jeton oublié, page de connexion informée (AuthProvider déconnecte et redirige). */
function endSession(): void {
  accessToken = null;
  try { sessionStorage.setItem(SESSION_EXPIRED_KEY, "1"); } catch { /* stockage indisponible */ }
  authEvents.emit("unauthorized");
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
    retried = false
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

  const sentToken = skipAuth ? null : accessToken;
  if (sentToken) headers["Authorization"] = `Bearer ${sentToken}`;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    credentials: "include",              // cookie de session pour /auth/* (ignoré ailleurs : limité à ce chemin)
    body: isFormData
        ? body                              // FormData passé tel quel
        : body !== undefined
            ? JSON.stringify(body)          // JSON sérialisé
            : undefined,
  });

  // Jeton d'accès expiré : rafraîchissement silencieux puis une seule nouvelle tentative
  if (response.status === 401 && sentToken && !retried) {
    const fresh = await refreshAccessToken();
    if (fresh) return request<T>(method, path, body, options, true);
    endSession();
    throw new ApiError(401, "Session expirée.");
  }

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
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

/**
 * Télécharge un fichier binaire (PDF…). Les erreurs JSON du serveur (404, 410…) sont converties
 * en ApiError avec leur message, comme pour `request`.
 */
async function requestBlob(path: string, options: RequestOptions = {}, retried = false): Promise<Blob> {
  const { skipAuth = false, params } = options;
  const headers: Record<string, string> = {};
  const sentToken = skipAuth ? null : accessToken;
  if (sentToken) headers["Authorization"] = `Bearer ${sentToken}`;
  const response = await fetch(buildUrl(path, params), { method: "GET", headers });
  if (response.status === 401 && sentToken && !retried) {
    const fresh = await refreshAccessToken();
    if (fresh) return requestBlob(path, options, true);
    endSession();
    throw new ApiError(401, "Session expirée.");
  }
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
