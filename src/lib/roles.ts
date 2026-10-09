/**
 * Rôles applicatifs (docs/design/README.md §3) et redirection après connexion.
 * Le JWT expose `roles` (ex. "ADMIN" ou "ROLE_ADMIN") : on normalise le préfixe.
 *
 * Les groupes ci-dessous reprennent la matrice de sécurité du backend (SecurityConfig) :
 * ils servent à la fois aux routes (ProtectedRoute) et au menu du back-office, pour qu'un compte
 * ne voie que ce que l'API lui autorise (sinon : pages « vides » sur 403).
 */
export const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export const LEARNER_ROLES = ["LEARNER"] as const;

export const ROLE_GROUPS = {
  /** Super administrateur uniquement (comptes back-office) */
  SUPER: ["SUPER_ADMIN"],
  /** Administration : candidatures, paiements, apprenants, statistiques… */
  ADMINS: ["SUPER_ADMIN", "ADMIN"],
  /** Contenus du site et catalogue */
  CONTENT: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  /** Éditeur de programme : le personnel et les partenaires (pour leurs formations) */
  PROGRAM: ["SUPER_ADMIN", "ADMIN", "EDITOR", "PARTNER"],
  /** Suivi de session : équipe pédagogique et formateurs (pour leurs sessions) */
  PEDAGOGY: ["SUPER_ADMIN", "ADMIN", "TRAINER"],
  /** Tout compte du back-office */
  BACKOFFICE: ["SUPER_ADMIN", "ADMIN", "EDITOR", "TRAINER", "PARTNER"],
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  EDITOR: "Éditeur",
  TRAINER: "Formateur",
  PARTNER: "Partenaire",
  LEARNER: "Apprenant",
};

export function normalizeRoles(roles: string[] | undefined): string[] {
  return (roles ?? []).map((r) => r.replace(/^ROLE_/, "").toUpperCase());
}

export function hasAnyRole(userRoles: string[] | undefined, allowed: readonly string[]): boolean {
  const normalized = normalizeRoles(userRoles);
  // Jetons antérieurs à l'introduction des rôles : seuls des comptes admin existaient.
  if (normalized.length === 0) return allowed.some((r) => (STAFF_ROLES as readonly string[]).includes(r));
  return normalized.some((r) => allowed.includes(r));
}

/** Libellé du rôle principal (le plus élevé) pour l'affichage. */
export function primaryRoleLabel(roles: string[] | undefined): string {
  const normalized = normalizeRoles(roles);
  const order = ["SUPER_ADMIN", "ADMIN", "EDITOR", "TRAINER", "PARTNER", "LEARNER"];
  const main = order.find((r) => normalized.includes(r));
  return main ? ROLE_LABELS[main] : "Utilisateur";
}

/** Première page utile du back-office selon les rôles (statistiques réservées à l'administration). */
export function backOfficeHome(roles: string[] | undefined): string {
  if (hasAnyRole(roles, ROLE_GROUPS.ADMINS)) return "/admin";
  if (hasAnyRole(roles, ["EDITOR"])) return "/admin/bootcamps";
  return "/admin/espace";
}

export function homePathForRoles(roles: string[] | undefined): string {
  if (hasAnyRole(roles, ROLE_GROUPS.BACKOFFICE)) return backOfficeHome(roles);
  if (hasAnyRole(roles, LEARNER_ROLES)) return "/espace";
  return "/";
}
