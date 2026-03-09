/**
 * Hook d'authentification JWT — Spring Boot backend.
 *
 * Cycle de vie :
 * 1. Au mount   : si token en localStorage → GET /auth/me pour valider
 * 2. signIn     : POST /auth/login → stocke token + user en state
 * 3. signOut    : POST /auth/logout (révocation backend) + nettoyage local
 *
 * Déconnexion automatique :
 * - Sur 401/403 : httpClient émet authEvents('unauthorized') → signOut()
 * - Sur suppression manuelle du token dans DevTools : storage event → signOut()
 *
 * FIX : on ne redirige vers /admin/login QUE si l'utilisateur était connecté.
 * Un visiteur anonyme sur le site public ne doit jamais être redirigé.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';
import { tokenStorage } from '@/services/httpClient';
import { authEvents } from '@/services/api/authEvents';
import type { AuthUser } from '@/types';

// ============================================================
// Types
// ============================================================

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signingOut = useRef(false);
  // Ref pour lire la valeur fraîche de user dans les callbacks (évite stale closure)
  const userRef = useRef<AuthUser | null>(null);
  userRef.current = user;

  // ── Déconnexion interne ─────────────────────────────────────────────────
  const performSignOut = useCallback(async (skipBackend = false) => {
    if (signingOut.current) return;
    signingOut.current = true;

    // Capturer AVANT de vider le state
    const wasLoggedIn = userRef.current !== null;

    try {
      if (!skipBackend) {
        await authService.logout();
      }
    } catch {
      // backend injoignable ou token déjà expiré — on nettoie quand même
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      signingOut.current = false;

      // ✅ Rediriger UNIQUEMENT si l'utilisateur était connecté.
      // Les visiteurs anonymes du site public ne doivent jamais être
      // redirigés vers /admin/login suite à un 401 d'une API publique.
      if (wasLoggedIn) {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [navigate]);

  // ── Initialisation ──────────────────────────────────────────────────────
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
        // Token invalide / expiré — nettoyage silencieux (pas de redirect ici,
        // ProtectedRoute s'en chargera)
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ── Écoute des 401/403 émis par httpClient ──────────────────────────────
  useEffect(() => {
    const unsubscribe = authEvents.on('unauthorized', () => {
      // N'agir que si connecté — pas pour les visiteurs anonymes
      if (userRef.current !== null) {
        performSignOut(true);
      }
    });
    return unsubscribe;
  }, [performSignOut]);

  // ── Écoute de la suppression manuelle du token (DevTools, autre onglet) ─
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && e.newValue === null && userRef.current !== null) {
        // Token supprimé pendant une session active
        performSignOut(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, performSignOut]);

  // ── signIn ──────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Erreur de connexion') };
    }
  }, []);

  // ── signOut (action utilisateur) ────────────────────────────────────────
  const signOut = useCallback(async () => {
    await performSignOut(false);
  }, [performSignOut]);

  // ── forgotPassword ──────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authService.forgotPassword(email);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Erreur lors de la demande') };
    }
  }, []);

  // ── resetPassword ───────────────────────────────────────────────────────
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Token invalide ou expiré') };
    }
  }, []);

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated: !!user,
            loading,
            signIn,
            signOut,
            forgotPassword,
            resetPassword,
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
