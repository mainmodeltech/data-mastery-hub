/**
 * ProtectedRoute.tsx
 *
 * Guard de route admin — vérifie que l'utilisateur est authentifié
 * via le JWT Spring Boot (nouveau useAuth).
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
        <Navigate to="/admin/login" state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
