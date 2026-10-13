/**
 * useAuth.tsx
 *
 * Contexte d'authentification branché sur le backend Spring Boot.
 *
 * Session : jeton d'accès de 15 minutes gardé EN MÉMOIRE (httpClient) + cookie HttpOnly de rafraîchissement.
 * Au chargement de la page, la session est rouverte en silence par POST /auth/refresh ; aucun jeton n'est jamais
 * écrit dans localStorage.
 *
 * Contrat :
 *   - signIn()          → POST /api/v1/auth/login (mot de passe)
 *   - applySession()    → ouvre la session renvoyée par n'importe quel mode de connexion (mot de passe, lien/code, Google) ;
 *                         pour le personnel, la réponse n'est qu'un défi de double authentification (`pendingMfa`)
 *   - verifyMfa()       → code de l'application d'authentification ou code de secours
 *   - startMfaEnrollment() / confirmMfaEnrollment() → première configuration (obligatoire pour le personnel)
 *   - signOut()         → termine la session côté serveur (POST /auth/logout) puis localement
 *   - user              → contenu du jeton d'accès (email, roles, userType)
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
import { ApiError, refreshAccessToken, tokenStorage } from "@/services/httpClient";
import type { AuthResponse, MfaEnrollment, PendingMfa } from "@/types/auth.type";

/**
 * Indice (pas un secret) : une session a été ouverte sur ce navigateur. Sans lui, on évite l'appel de
 * rafraîchissement au chargement des pages publiques (il échouerait en 401 à chaque visite).
 */
const SESSION_HINT_KEY = "mt_has_session";

function setSessionHint(on: boolean) {
  try {
    if (on) localStorage.setItem(SESSION_HINT_KEY, "1");
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch { /* stockage indisponible */ }
}

function hasSessionHint(): boolean {
  try { return localStorage.getItem(SESSION_HINT_KEY) === "1"; } catch { return false; }
}

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
  /** Mot de passe accepté, mais un second facteur reste à valider (voir `pendingMfa`). */
  mfa?: boolean;
}

/** Fin d'enrôlement : les codes de secours sont à montrer ; la session s'ouvre quand l'utilisateur les a notés. */
export interface EnrollmentResult {
  error: string | null;
  recoveryCodes?: string[];
  /** Ouvre la session (à appeler une fois les codes de secours acquittés). */
  complete?: () => void;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  /** Second facteur en attente (personnel) : la page de connexion affiche l'étape correspondante. */
  pendingMfa: PendingMfa | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  /** Ouvre la session à partir de la réponse d'un mode de connexion (lien, code, Google…) ; "mfa" si un second facteur est requis. */
  applySession: (response: AuthResponse) => "session" | "mfa";
  verifyMfa: (code: string) => Promise<string | null>;
  startMfaEnrollment: () => Promise<MfaEnrollment>;
  confirmMfaEnrollment: (code: string) => Promise<EnrollmentResult>;
  /** Abandonne l'étape de double authentification (retour à la connexion). */
  cancelMfa: () => void;
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

function payloadToUser(payload: JwtPayload): AuthUser {
  return {
    email: payload.sub,
    roles: payload.roles ?? [],
    userType: payload.uty,
  };
}

/** Message lisible d'un échec de l'étape de double authentification. */
function mfaErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return err.message || "Trop de codes incorrects. Réessayez dans quelques minutes.";
    if (err.status === 401) return err.message && !/^Erreur \d+$/.test(err.message) ? err.message : "Code incorrect.";
    if (err.status === 503) return err.message || "La double authentification n'est pas disponible. Contactez l'administrateur.";
    if (err.message && !/^Erreur \d+$/.test(err.message)) return err.message;
  }
  return "Vérification impossible pour le moment. Réessayez dans un instant.";
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingMfa, setPendingMfa] = useState<PendingMfa | null>(null);

  // Initialisation : rouvre la session à partir du cookie de rafraîchissement (si ce navigateur en a une)
  useEffect(() => {
    let cancelled = false;
    if (!hasSessionHint()) {
      setLoading(false);
      return;
    }
    refreshAccessToken().then((fresh) => {
      if (cancelled) return;
      if (fresh) setToken(fresh);
      else setSessionHint(false);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Nouveau jeton obtenu par rafraîchissement silencieux (httpClient) ; session terminée (rafraîchissement refusé)
  useEffect(() => {
    const offToken = authEvents.on("token", (fresh) => setToken(fresh));
    const offUnauthorized = authEvents.on("unauthorized", () => {
      tokenStorage.clearTokens();
      setSessionHint(false);
      setToken(null);
    });
    return () => { offToken(); offUnauthorized(); };
  }, []);

  // Dérive l'objet user depuis le token JWT
  const user = useMemo<AuthUser | null>(() => {
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload ? payloadToUser(payload) : null;
  }, [token]);

  const openSession = useCallback((accessToken: string) => {
    tokenStorage.setAccessToken(accessToken);
    setSessionHint(true);
    setPendingMfa(null);
    setToken(accessToken);
  }, []);

  const applySession = useCallback((response: AuthResponse): "session" | "mfa" => {
    if (response.accessToken) {
      openSession(response.accessToken);
      return "session";
    }
    if (response.mfaToken && (response.mfaRequired || response.mfaEnrollmentRequired)) {
      setPendingMfa({ kind: response.mfaRequired ? "verify" : "enroll", token: response.mfaToken });
      return "mfa";
    }
    throw new Error("Réponse de connexion inattendue.");
  }, [openSession]);

  const signIn = useCallback(
      async (email: string, password: string): Promise<SignInResult> => {
        try {
          const response = await authService.login({ email, password });
          const outcome = applySession(response);
          return { error: null, mfa: outcome === "mfa" };
        } catch (err: unknown) {
          const status = err instanceof ApiError ? err.status : undefined;
          const message = (err as { message?: string })?.message;
          if (status === 429) {
            return { error: message ?? "Trop de tentatives. Réessayez dans quelques minutes.", status };
          }
          if (status === 503) {
            return { error: message ?? "Connexion indisponible pour le moment. Contactez l'administrateur.", status };
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

  const verifyMfa = useCallback(async (code: string): Promise<string | null> => {
    if (!pendingMfa) return "La vérification a expiré. Reconnectez-vous.";
    try {
      const response = await authService.verifyMfa(pendingMfa.token, code);
      applySession(response);
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && /expiré|Reconnectez/i.test(err.message)) setPendingMfa(null);
      return mfaErrorMessage(err);
    }
  }, [pendingMfa, applySession]);

  const startMfaEnrollment = useCallback(async (): Promise<MfaEnrollment> => {
    if (!pendingMfa) throw new Error("La vérification a expiré. Reconnectez-vous.");
    try {
      return await authService.startMfaEnrollment(pendingMfa.token);
    } catch (err) {
      throw new Error(mfaErrorMessage(err));
    }
  }, [pendingMfa]);

  const confirmMfaEnrollment = useCallback(async (code: string): Promise<EnrollmentResult> => {
    if (!pendingMfa) return { error: "La vérification a expiré. Reconnectez-vous." };
    try {
      const response = await authService.confirmMfaEnrollment(pendingMfa.token, code);
      if (!response.accessToken) return { error: "Réponse inattendue du serveur. Reconnectez-vous." };
      const accessToken = response.accessToken;
      // La session n'est ouverte qu'une fois les codes de secours notés : ils ne seront plus jamais affichés
      return { error: null, recoveryCodes: response.recoveryCodes ?? [], complete: () => openSession(accessToken) };
    } catch (err) {
      return { error: mfaErrorMessage(err) };
    }
  }, [pendingMfa, openSession]);

  const cancelMfa = useCallback(() => setPendingMfa(null), []);

  const signOut = useCallback(() => {
    // Fin de session côté serveur (cookie + jeton) : best-effort, la déconnexion locale ne l'attend pas.
    authService.logout().catch(() => undefined);
    tokenStorage.clearTokens();
    setSessionHint(false);
    setPendingMfa(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextType>(
      () => ({ user, token, loading, pendingMfa, signIn, applySession, verifyMfa, startMfaEnrollment, confirmMfaEnrollment, cancelMfa, signOut }),
      [user, token, loading, pendingMfa, signIn, applySession, verifyMfa, startMfaEnrollment, confirmMfaEnrollment, cancelMfa, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
