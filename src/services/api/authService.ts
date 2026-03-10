/**
 * Service d'authentification — Spring Boot JWT.
 *
 * Endpoints :
 *   POST /api/v1/auth/login            → AuthResponse
 *   POST /api/v1/auth/logout           → révocation token
 *   GET  /api/v1/auth/me               → AuthUser
 *   POST /api/v1/auth/forgot-password  → déclenche l'email
 *   POST /api/v1/auth/reset-password   → réinitialise le mot de passe
 */

import { httpClient, tokenStorage } from '@/services/httpClient';
import type { LoginCredentials, AuthResponse, AuthUser } from '@/types/auth.type';

const BASE_PATH = '/auth';

export const authService = {

  /**
   * Connexion — stocke le JWT en localStorage.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>(
        `${BASE_PATH}/login`,
        credentials,
        { skipAuth: true },
    );
    tokenStorage.setAccessToken(response.accessToken);
    return response;
  },

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
