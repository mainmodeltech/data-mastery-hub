/**
 * Client HTTP — fetch natif avec gestion JWT.
 *
 * Sur 401 ou 403 : émet un événement global `unauthorized`
 * que AuthProvider écoute pour déclencher la déconnexion automatique.
 */
import {authEvents} from "@/services/api/authEvents.ts";


const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-staging.model-technologie.com/api';

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'access_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clearTokens: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Options de requête ───────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

// ─── Client HTTP ──────────────────────────────────────────────────────────────

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Injecter le JWT si présent et non ignoré
  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...fetchOptions,
  });

  // ── Gestion des erreurs d'authentification ────────────────────────────────
  if (response.status === 401 || response.status === 403) {
    // Nettoyer le token invalide
    tokenStorage.clearTokens();
    // Notifier AuthProvider → déconnexion + redirect login
    authEvents.emit('unauthorized');
    throw new Error(`HTTP ${response.status}`);
  }

  if (!response.ok) {
    // Essayer de parser le message d'erreur du backend
    let message = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.message ?? errorData.error ?? message;
    } catch {
      // pas de JSON dans la réponse d'erreur
    }
    throw new Error(message);
  }

  // 204 No Content → pas de corps JSON
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Interface publique ───────────────────────────────────────────────────────

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
      request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>('POST', path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>('PUT', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>('PATCH', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
      request<T>('DELETE', path, undefined, options),

  // Utilitaire à ajouter dans httpClient.ts
  buildUrl: (path: string, params?: Record<string, unknown>): string => {
    if (!params) return path;
    const qs = new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)])
    ).toString();
    return qs ? `${path}?${qs}` : path;
  },
};


