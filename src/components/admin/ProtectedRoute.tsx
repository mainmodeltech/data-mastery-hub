/**
 * Route protégée — redirige vers /admin/login si non authentifié.
 *
 * Protections :
 * 1. Vérifie user + loading (comportement existant)
 * 2. Vérifie la présence du token à chaque rendu (suppression localStorage)
 * 3. Vérifie la validité côté backend au focus de la fenêtre (reprise d'onglet)
 */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { tokenStorage } from '@/services/httpClient';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  // ── Vérification au focus : si l'onglet reprend le focus et que le token
  //    a été supprimé entre temps (autre onglet, DevTools), déconnecter. ──
  useEffect(() => {
    const handleFocus = () => {
      const token = tokenStorage.getAccessToken();
      if (!token && user) {
        signOut();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, signOut]);

  // ── Chargement initial ─────────────────────────────────────────────────
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Vérification de la session…</p>
          </div>
        </div>
    );
  }

  // ── Token absent (supprimé en DevTools avant que storage event soit émis) ─
  const token = tokenStorage.getAccessToken();
  if (!user || !token) {
    return (
        <Navigate
            to="/admin/login"
            state={{ from: location }}
            replace
        />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
