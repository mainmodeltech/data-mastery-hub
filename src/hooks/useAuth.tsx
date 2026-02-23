/**
 * Hook d'authentification base sur JWT pour Spring Boot.
 *
 * Remplace l'ancien hook Supabase Auth.
 * Gere : login, logout, refresh token, persistence de session.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
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
  signOut: () => Promise<void>;
}

// ============================================================
// Contexte
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verifier si un token existe au demarrage et recuperer l'utilisateur.
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
        // Token invalide ou expire -> nettoyer
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Connexion avec email/mot de passe.
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: authUser } = await authService.login({ email, password });
      setUser(authUser);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Erreur de connexion') };
    }
  }, []);

  /**
   * Deconnexion.
   */
  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Meme en cas d'erreur, on deconnecte cote client
    } finally {
      setUser(null);
      tokenStorage.clearTokens();
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, signIn, signOut }}>
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
    throw new Error('useAuth doit etre utilise dans un AuthProvider');
  }
  return context;
};
