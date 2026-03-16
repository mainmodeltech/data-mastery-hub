/**
 * useAuth.tsx
 *
 * Contexte d'authentification branché sur le backend Spring Boot JWT.
 * Remplace l'ancien useAuth basé sur Supabase.
 *
 * Contrat :
 *   - signIn()  → POST /api/v1/auth/login, stocke le JWT dans localStorage
 *   - signOut() → supprime le JWT du localStorage
 *   - user      → payload décodé du JWT (email, roles, etc.)
 *   - token     → le JWT brut (utilisé par httpClient)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { httpClient } from "@/services/httpClient";

// ─── Clé de stockage ──────────────────────────────────────────────────────────
// Doit correspondre à TOKEN_KEY dans httpClient.ts
export const JWT_STORAGE_KEY = "access_token";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string;        // email de l'utilisateur
  roles?: string[];
  exp?: number;       // timestamp d'expiration (secondes)
  iat?: number;
}

interface AuthUser {
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Décode la partie payload d'un JWT (sans vérification de signature côté client) */
function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Vérifie si un JWT est encore valide (non expiré) */
function isTokenValid(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

function payloadToUser(payload: JwtPayload): AuthUser {
  return {
    email: payload.sub,
    roles: payload.roles ?? [],
  };
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialisation : lit le token du localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(JWT_STORAGE_KEY);
    if (stored && isTokenValid(stored)) {
      setToken(stored);
    } else {
      // Token absent ou expiré → nettoyer
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  // Dérive l'objet user depuis le token JWT
  const user = useMemo<AuthUser | null>(() => {
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload ? payloadToUser(payload) : null;
  }, [token]);

  const signIn = useCallback(
      async (email: string, password: string): Promise<{ error: string | null }> => {
        try {
          const response = await httpClient.post<{
            accessToken: string;
            tokenType: string;
            expiresIn: number;
          }>(
              "/auth/login",
              { email, password },
              { skipAuth: true }
          );

          const jwt = response.accessToken;
          localStorage.setItem(JWT_STORAGE_KEY, jwt);
          setToken(jwt);
          return { error: null };
        } catch (err: unknown) {
          const message =
              (err as { message?: string })?.message ?? "Identifiants incorrects.";
          return { error: message };
        }
      },
      []
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(JWT_STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextType>(
      () => ({ user, token, loading, signIn, signOut }),
      [user, token, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
