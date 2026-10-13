/**
 * ProtectedRoute.tsx
 *
 * Guard de route : session + droits.
 *  - par défaut : réservé au personnel (n'importe quel profil du back-office) ;
 *  - `permissions` : il faut au moins un de ces droits (cumul des profils du compte) ;
 *  - `learnerArea` : espace apprenant (apprenants, et personnel pour prévisualiser).
 * Non connecté → /connexion ; droits insuffisants → la première page utile du compte.
 * Le serveur reste la vraie protection : ce garde évite surtout des pages « vides » sur 403.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { homePathFor } from "@/lib/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Au moins un de ces droits (voir lib/permissions.ts → ACCESS). */
  permissions?: readonly string[];
  /** Espace apprenant : ouvert aux apprenants et au personnel. */
  learnerArea?: boolean;
}

const ProtectedRoute = ({ children, permissions, learnerArea = false }: ProtectedRouteProps) => {
  const { user, loading, can } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
  }

  if (!user) {
    return (
        <Navigate to="/connexion" state={{ from: location }} replace />
    );
  }

  const allowed = learnerArea
    ? user.isStaff || user.userType === "LEARNER"
    : user.isStaff && (!permissions || can(...permissions));

  if (!allowed) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
