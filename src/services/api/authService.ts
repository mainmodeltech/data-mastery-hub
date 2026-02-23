/**
 * Service API pour l'Authentification.
 * Gere le login, logout et refresh token via JWT (Spring Boot Security).
 */

import { httpClient, tokenStorage } from '@/services/httpClient';
import type { LoginCredentials, AuthTokens, AuthUser } from '@/types';

const BASE_PATH = '/auth';

export const authService = {
  /** Connexion avec email et mot de passe */
  login: async (credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
    const response = await httpClient.post<{ user: AuthUser; tokens: AuthTokens }>(
      `${BASE_PATH}/login`,
      credentials,
      { skipAuth: true },
    );

    // Stocker les tokens
    tokenStorage.setAccessToken(response.tokens.accessToken);
    tokenStorage.setRefreshToken(response.tokens.refreshToken);

    return response;
  },

  /** Deconnexion */
  logout: async (): Promise<void> => {
    try {
      await httpClient.post<void>(`${BASE_PATH}/logout`);
    } finally {
      tokenStorage.clearTokens();
    }
  },

  /** Rafraichir le token d'acces */
  refreshToken: async (): Promise<AuthTokens> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokens = await httpClient.post<AuthTokens>(
      `${BASE_PATH}/refresh`,
      { refreshToken },
      { skipAuth: true },
    );

    tokenStorage.setAccessToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);

    return tokens;
  },

  /** Recuperer les infos de l'utilisateur connecte */
  getCurrentUser: () =>
    httpClient.get<AuthUser>(`${BASE_PATH}/me`),
};
