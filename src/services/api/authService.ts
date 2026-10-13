/**
 * Service d'authentification — Spring Boot JWT.
 *
 * Endpoints :
 *   POST /api/v1/auth/login            → AuthResponse (ou défi de double authentification pour le personnel)
 *   POST /api/v1/auth/refresh          → nouveau jeton d'accès (cookie de session HttpOnly)
 *   POST /api/v1/auth/logout           → fin de session + révocation du jeton
 *   POST /api/v1/auth/mfa/verify       → code de l'application d'authentification (ou de secours)
 *   POST /api/v1/auth/mfa/enroll/start | confirm → première configuration de la double authentification
 *   GET  /api/v1/auth/me               → AuthUser
 *   PUT  /api/v1/auth/change-password  → 204 (compte connecté ; toutes les sessions sont terminées)
 *   POST /api/v1/auth/forgot-password  → déclenche l'email
 *   POST /api/v1/auth/reset-password   → réinitialise le mot de passe
 *   GET  /api/v1/auth/options          → modes de connexion actifs
 *   POST /api/v1/auth/passwordless/request | verify → lien / code à 6 chiffres
 *   POST /api/v1/auth/google           → connexion Google (ID token)
 *
 * Les méthodes de connexion ne stockent rien : la session (jeton en mémoire) est ouverte par
 * useAuth().applySession() pour qu'un seul chemin existe quel que soit le mode de connexion.
 */

import { httpClient, tokenStorage } from '@/services/httpClient';
import type {
  LoginCredentials, AuthResponse, AuthUser, AuthOptions, PasswordlessVerifyPayload, MfaEnrollment,
} from '@/types/auth.type';

const BASE_PATH = '/auth';

export const authService = {

  /** Connexion par mot de passe. 401 : identifiants invalides ; 429 : trop d'échecs (15 min). */
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    httpClient.post<AuthResponse>(`${BASE_PATH}/login`, credentials, { skipAuth: true }),

  /** Modes de connexion actifs (mot de passe, lien/code, Google) et ID client Google. */
  getOptions: (): Promise<AuthOptions> =>
    httpClient.get<AuthOptions>(`${BASE_PATH}/options`, { skipAuth: true }),

  /** Envoie un lien + un code à 6 chiffres (10 min). Répond toujours 200, que le compte existe ou non. */
  requestLoginLink: (email: string): Promise<{ message?: string }> =>
    httpClient.post<{ message?: string }>(`${BASE_PATH}/passwordless/request`, { email }, { skipAuth: true }),

  /** Vérifie un lien (`token`) ou un code (`email` + `code`). 400 : invalide, expiré ou déjà utilisé. */
  verifyLogin: (payload: PasswordlessVerifyPayload): Promise<AuthResponse> =>
    httpClient.post<AuthResponse>(`${BASE_PATH}/passwordless/verify`, payload, { skipAuth: true }),

  /** Connexion Google. 401 : jeton refusé ou aucun compte ; 404 : Google non configuré. */
  loginWithGoogle: (credential: string): Promise<AuthResponse> =>
    httpClient.post<AuthResponse>(`${BASE_PATH}/google`, { credential }, { skipAuth: true }),

  // ── Double authentification (personnel) ───────────────────────────

  /** Valide le code de l'application (6 chiffres) ou un code de secours. 401 : code incorrect ; 429 : trop d'essais. */
  verifyMfa: (mfaToken: string, code: string): Promise<AuthResponse> =>
    httpClient.post<AuthResponse>(`${BASE_PATH}/mfa/verify`, { mfaToken, code }, { skipAuth: true }),

  /** Première connexion : secret à enregistrer dans l'application d'authentification. */
  startMfaEnrollment: (mfaToken: string): Promise<MfaEnrollment> =>
    httpClient.post<MfaEnrollment>(`${BASE_PATH}/mfa/enroll/start`, { mfaToken }, { skipAuth: true }),

  /** Active la double authentification avec un premier code ; ouvre la session et renvoie les codes de secours. */
  confirmMfaEnrollment: (mfaToken: string, code: string): Promise<AuthResponse> =>
    httpClient.post<AuthResponse>(`${BASE_PATH}/mfa/enroll/confirm`, { mfaToken, code }, { skipAuth: true }),

  // ── Session ───────────────────────────────────────────────────────

  /**
   * Déconnexion : met fin à la session (cookie) et révoque le jeton d'accès. Fonctionne même si le jeton d'accès
   * a expiré (le cookie suffit) ; la déconnexion locale est faite par useAuth.signOut().
   */
  logout: async (): Promise<void> => {
    const token = tokenStorage.getAccessToken();
    await httpClient.post<void>(`${BASE_PATH}/logout`, {}, {
      skipAuth: true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  /**
   * Profil de l'utilisateur connecté.
   */
  getCurrentUser: (): Promise<AuthUser> =>
      httpClient.get<AuthUser>(`${BASE_PATH}/me`),

  /** Changement de mot de passe du compte connecté. 400 : mot de passe actuel incorrect ou nouveau mot de passe refusé. */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await httpClient.put<void>(`${BASE_PATH}/change-password`, { currentPassword, newPassword });
  },

  /**
   * Demande de réinitialisation du mot de passe.
   * Le backend envoie un email avec un lien contenant un token.
   */
  forgotPassword: async (email: string): Promise<void> => {
    await httpClient.post<void>(
        `${BASE_PATH}/forgot-password`,
        { email },
        { skipAuth: true },
    );
  },

  /**
   * Réinitialisation du mot de passe avec le token reçu par email.
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await httpClient.post<void>(
        `${BASE_PATH}/reset-password`,
        { token, newPassword },
        { skipAuth: true },
    );
  },
};
