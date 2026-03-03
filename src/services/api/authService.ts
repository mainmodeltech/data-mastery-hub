/**
 * Service API pour l'Authentification.
 * Gere le login, logout et refresh token via JWT (Spring Boot Security).
 */

/**
 * Service d'authentification — branché sur Spring Boot JWT.
 *
 * Endpoints consommés :
 *   POST /api/v1/auth/login   → AuthResponse (accessToken + user)
 *   GET  /api/v1/auth/me      → AuthUser
 *
 * Note : pas de refreshToken côté backend pour l'instant.
 * Le token expire après expiresIn ms — on déconnecte l'utilisateur à ce moment.
 */

import { httpClient, tokenStorage } from '@/services/httpClient';
import type { LoginCredentials, AuthResponse, AuthUser } from '@/types/auth.type';

const BASE_PATH = '/auth';

export const authService = {

  /**
   * Connexion avec email + mot de passe.
   * Stocke le token JWT dans localStorage.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>(
        `${BASE_PATH}/login`,
        credentials,
        { skipAuth: true },
    );

    // Stocker uniquement l'accessToken (pas de refreshToken côté backend)
    tokenStorage.setAccessToken(response.accessToken);

    return response;
  },

  /**
   * Déconnexion — nettoyage local uniquement.
   * Le backend Spring Boot est stateless (JWT), pas d'endpoint logout nécessaire.
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },

  /**
   * Récupérer le profil de l'utilisateur connecté.
   * Utilisé au démarrage pour vérifier que le token stocké est toujours valide.
   */
  getCurrentUser: (): Promise<AuthUser> =>
      httpClient.get<AuthUser>(`${BASE_PATH}/me`),
};
