/**
 * Rôles applicatifs (docs/design/README.md §3) et redirection après connexion.
 * Le JWT expose `roles` (ex. "ADMIN" ou "ROLE_ADMIN") : on normalise le préfixe.
 */
export const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export const LEARNER_ROLES = ["LEARNER"] as const;

export function normalizeRoles(roles: string[] | undefined): string[] {
  return (roles ?? []).map((r) => r.replace(/^ROLE_/, "").toUpperCase());
}

export function hasAnyRole(userRoles: string[] | undefined, allowed: readonly string[]): boolean {
  const normalized = normalizeRoles(userRoles);
  // Jetons antérieurs à l'introduction des rôles : seuls des comptes admin existaient.
  if (normalized.length === 0) return allowed.some((r) => (STAFF_ROLES as readonly string[]).includes(r));
  return normalized.some((r) => allowed.includes(r));
}

export function homePathForRoles(roles: string[] | undefined): string {
  if (hasAnyRole(roles, STAFF_ROLES)) return "/admin";
  if (hasAnyRole(roles, LEARNER_ROLES)) return "/espace";
  return "/";
}
