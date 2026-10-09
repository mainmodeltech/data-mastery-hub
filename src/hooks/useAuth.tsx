/**
 * useAuth.tsx
 *
 * Contexte d'authentification branché sur le backend Spring Boot JWT.
 *
 * Contrat :
 *   - signIn()       → POST /api/v1/auth/login (mot de passe)
 *   - applySession() → stocke la session renvoyée par n'importe quel mode de connexion
 *                      (mot de passe, lien/code, Google : même réponse AuthResponse)
 *   - signOut()      → révoque le jeton côté serveur (POST /auth/logout) puis le supprime
 *   - user           → payload décodé du JWT (email, roles, userType)
 *   - token          → le JWT brut (utilisé par httpClient)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/services/api/authService";
import { authEvents } from "@/services/api/authEvents";
import { ApiError } from "@/services/httpClient";
import type { AuthResponse } from "@/types/auth.type";

// ─── Clé de stockage ──────────────────────────────────────────────────────────
// Doit correspondre à TOKEN_KEY dans httpClient.ts
export const JWT_STORAGE_KEY = "access_token";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JwtPayload {
  sub: string;        // email de l'utilisateur
  roles?: string[];
  /** Type de compte : ADMIN (back-office) ou LEARNER */
  uty?: "ADMIN" | "LEARNER";
  exp?: number;       // timestamp d'expiration (secondes)
  iat?: number;
}

interface AuthUser {
  email: string;
  roles: string[];
  userType?: "ADMIN" | "LEARNER";
}

export interface SignInResult {
  error: string | null;
  /** Statut HTTP de l'échec (ex. 401 identifiants, 429 trop d'échecs) */
  status?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  /** Ouvre la session à partir de la réponse d'un mode de connexion (lien, code, Google…) */
  applySession: (response: Pick<AuthResponse, "accessToken">) => void;
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
    userType: payload.uty,
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

  // Un 401 reçu par httpClient (jeton expiré/révoqué) déconnecte localement, sans appel serveur
  useEffect(
    () =>
      authEvents.on("unauthorized", () => {
        localStorage.removeItem(JWT_STORAGE_KEY);
        setToken(null);
      }),
    []
  );

  // Dérive l'objet user depuis le token JWT
  const user = useMemo<AuthUser | null>(() => {
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload ? payloadToUser(payload) : null;
  }, [token]);

  const applySession = useCallback((response: Pick<AuthResponse, "accessToken">) => {
    localStorage.setItem(JWT_STORAGE_KEY, response.accessToken);
    setToken(response.accessToken);
  }, []);

  const signIn = useCallback(
      async (email: string, password: string): Promise<SignInResult> => {
        try {
          const response = await authService.login({ email, password });
          applySession(response);
          return { error: null };
        } catch (err: unknown) {
          const status = err instanceof ApiError ? err.status : undefined;
          const message = (err as { message?: string })?.message;
          if (status === 429) {
            return { error: message ?? "Trop de tentatives. Réessayez dans quelques minutes.", status };
          }
          if (status === 401 || status === 400) {
            // Le serveur distingue identifiants invalides, compte désactivé et mot de passe non défini.
            return { error: message && !/^Erreur \d+$/.test(message) ? message : "E-mail ou mot de passe incorrect.", status };
          }
          return { error: "Connexion impossible pour le moment. Réessayez dans un instant.", status };
        }
      },
      [applySession]
  );

  const signOut = useCallback(() => {
    // Révocation côté serveur (liste noire du jeton) : best-effort, la déconnexion locale ne l'attend pas.
    // authService.logout() lit le jeton avant que nous le supprimions ci-dessous.
    if (localStorage.getItem(JWT_STORAGE_KEY)) {
      authService.logout().catch(() => undefined);
    }
    localStorage.removeItem(JWT_STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextType>(
      () => ({ user, token, loading, signIn, applySession, signOut }),
      [user, token, loading, signIn, applySession, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
