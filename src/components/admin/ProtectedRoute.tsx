/**
 * ProtectedRoute.tsx
 *
 * Guard de route : authentification JWT + rôle. Par défaut réservé au personnel
 * (SUPER_ADMIN/ADMIN/EDITOR) pour les routes /admin ; passer `roles` pour d'autres
 * espaces (ex. LEARNER). Non connecté → /connexion ; mauvais rôle → son espace.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { STAFF_ROLES, hasAnyRole, homePathForRoles } from "@/lib/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: readonly string[];
}

const ProtectedRoute = ({ children, roles = STAFF_ROLES }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
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

  if (!hasAnyRole(user.roles, roles)) {
    return <Navigate to={homePathForRoles(user.roles)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
