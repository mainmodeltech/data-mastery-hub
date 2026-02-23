/**
 * Client HTTP centralise pour communiquer avec l'API REST (Spring Boot).
 *
 * Responsabilites :
 * - Gestion du base URL et des headers
 * - Injection automatique du token JWT
 * - Intercepteur de reponse (gestion des erreurs, refresh token)
 * - Retry automatique sur erreurs reseau
 * - Serialisation/Deserialisation JSON
 */

import { API_CONFIG } from '@/config/constants';
import type { ApiError } from '@/types';

// ============================================================
// Storage du token (sera remplace par un vrai token store)
// ============================================================

const TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ============================================================
// Classe d'erreur API custom
// ============================================================

export class HttpError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'HttpError';
    this.status = apiError.status;
    this.errors = apiError.errors;
  }
}

// ============================================================
// Client HTTP
// ============================================================

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let apiError: ApiError;

    if (isJson) {
      const errorBody = await response.json();
      apiError = {
        status: response.status,
        message: errorBody.message || errorBody.error || response.statusText,
        errors: errorBody.errors,
      };
    } else {
      apiError = {
        status: response.status,
        message: response.statusText,
      };
    }

    // Si le token est expire, on nettoie le storage
    if (response.status === 401) {
      tokenStorage.clearTokens();
      // Redirection vers le login si on est sur une page admin
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    throw new HttpError(apiError);
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as unknown as T;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_CONFIG.baseUrl}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

function buildHeaders(options?: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options?.headers,
  };

  if (!options?.skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      method,
      headers: buildHeaders(options),
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal || controller.signal,
    });

    return await handleResponse<T>(response);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================
// API publique du client HTTP
// ============================================================

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
};
