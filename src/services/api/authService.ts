/**
 * Service d'authentification — Spring Boot JWT.
 *
 * Endpoints :
 *   POST /api/v1/auth/login            → AuthResponse
 *   POST /api/v1/auth/logout           → révocation token
 *   GET  /api/v1/auth/me               → AuthUser
 *   PUT  /api/v1/auth/change-password  → 204 (compte connecté)
 *   POST /api/v1/auth/forgot-password  → déclenche l'email
 *   POST /api/v1/auth/reset-password   → réinitialise le mot de passe
 *   GET  /api/v1/auth/options          → modes de connexion actifs
 *   POST /api/v1/auth/passwordless/request | verify → lien / code à 6 chiffres
 *   POST /api/v1/auth/google           → connexion Google (ID token)
 *
 * Les méthodes de connexion ne stockent rien : le stockage de la session (JWT) est fait par
 * useAuth().applySession() pour qu'un seul chemin existe quel que soit le mode de connexion.
 */

import { httpClient, tokenStorage } from '@/services/httpClient';
import type {
  LoginCredentials, AuthResponse, AuthUser, AuthOptions, PasswordlessVerifyPayload,
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

  /**
   * Déconnexion — révoque le token côté backend (blacklist JWT).
   * Le nettoyage du localStorage est fait dans useAuth.signOut().
   */
  logout: async (): Promise<void> => {
    await httpClient.post<void>(`${BASE_PATH}/logout`, {});
    tokenStorage.clearTokens();
  },

  /**
   * Profil de l'utilisateur connecté.
   * Utilisé au démarrage pour valider le token stocké.
   */
  getCurrentUser: (): Promise<AuthUser> =>
      httpClient.get<AuthUser>(`${BASE_PATH}/me`),

  /** Changement de mot de passe du compte connecté. 400 : mot de passe actuel incorrect. */
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
