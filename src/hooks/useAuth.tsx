/**
 * Hook d'authentification JWT — Spring Boot backend.
 *
 * Cycle de vie :
 * 1. Au mount : si token en localStorage → GET /auth/me pour valider
 * 2. signIn   : POST /auth/login → stocke token + user en state
 * 3. signOut  : nettoyage local (backend stateless, pas d'appel réseau)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services/api';
import { tokenStorage } from '@/services/httpClient';
import type { AuthUser } from '@/types';

// ============================================================
// Types du contexte
// ============================================================

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

// ============================================================
// Contexte
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialisation : vérifier le token stocké au démarrage.
   * Si le token est expiré, le backend renvoie 401 → on nettoie.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        // Token invalide ou expiré → nettoyage silencieux
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Connexion.
   * Le backend retourne { accessToken, tokenType, expiresIn, user }.
   * authService.login() stocke le token et retourne l'AuthResponse.
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Erreur de connexion') };
    }
  }, []);

  /**
   * Déconnexion — synchrone, pas d'appel réseau.
   * Le backend Spring Boot est stateless (JWT).
   */
  const signOut = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated: !!user,
            loading,
            signIn,
            signOut,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

// ============================================================
// Hook
// ============================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
