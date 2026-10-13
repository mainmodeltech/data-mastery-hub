import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { homePathFor } from "@/lib/roles";

/**
 * Une fois la session ouverte (quel que soit le mode de connexion), redirige vers la page
 * demandée au départ si le rôle l'autorise, sinon vers l'espace du rôle (apprenant → /espace,
 * back-office → /admin).
 */
export function usePostLoginRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || loading) return;   // pour le personnel, `loading` dure jusqu'à la lecture de ses droits
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    const canReturn =
      from &&
      ((from.startsWith("/admin") && user.isStaff) ||
        (from.startsWith("/espace") && user.userType === "LEARNER"));
    const target = canReturn ? from : homePathFor(user);
    // Espaces privés : chargement complet de la page (la session est relue depuis le stockage du
    // navigateur) pour qu'aucun script tiers chargé sur le site public ne reste présent dans l'espace.
    if (target.startsWith("/admin") || target.startsWith("/espace")) window.location.replace(target);
    else navigate(target, { replace: true });
  }, [user, loading, location.state, navigate]);
}
