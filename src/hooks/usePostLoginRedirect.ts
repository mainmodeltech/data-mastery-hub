import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { hasAnyRole, homePathForRoles, LEARNER_ROLES, STAFF_ROLES } from "@/lib/roles";

/**
 * Une fois la session ouverte (quel que soit le mode de connexion), redirige vers la page
 * demandée au départ si le rôle l'autorise, sinon vers l'espace du rôle (apprenant → /espace,
 * back-office → /admin).
 */
export function usePostLoginRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    const canReturn =
      from &&
      ((from.startsWith("/admin") && hasAnyRole(user.roles, STAFF_ROLES)) ||
        (from.startsWith("/espace") && hasAnyRole(user.roles, LEARNER_ROLES)));
    const target = canReturn ? from : homePathForRoles(user.roles);
    // Espaces privés : chargement complet de la page (la session est relue depuis le stockage du
    // navigateur) pour qu'aucun script tiers chargé sur le site public ne reste présent dans l'espace.
    if (target.startsWith("/admin") || target.startsWith("/espace")) window.location.replace(target);
    else navigate(target, { replace: true });
  }, [user, location.state, navigate]);
}
