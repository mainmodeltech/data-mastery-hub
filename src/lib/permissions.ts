/**
 * Droits du back-office. Le serveur est la vraie protection (table AdminAccessRules côté backend) ; ces constantes servent à
 * n'afficher que ce que la personne peut réellement utiliser (menu, routes, boutons) et reprennent les mêmes noms.
 *
 * Un compte cumule les droits de tous ses profils. Chaque entrée de `ACCESS` liste les droits dont UN SEUL suffit.
 */

/** Droit implicite de tout compte du personnel (accès au back-office, « Mon espace », pastilles du menu). */
export const BACKOFFICE_ACCESS = "BACKOFFICE_ACCESS";

export const ACCESS = {
  /** Mon espace, pastilles : tout le personnel. */
  ESPACE: [BACKOFFICE_ACCESS],
  /** Tableau de bord : financier et/ou d'activité (les montants dépendent du droit financier). */
  DASHBOARD: ["DASHBOARD_FINANCE", "DASHBOARD_ACTIVITY"],
  CATALOG: ["CATALOG_VIEW"],
  PARTNERS: ["PARTNERS_VIEW"],
  APPLICATIONS: ["APPLICATIONS_VIEW"],
  PAYMENTS: ["PAYMENTS_VIEW"],
  INVOICES: ["INVOICES_VIEW"],
  CERTIFICATES: ["CERTIFICATES_VIEW"],
  PROMO: ["PROMO_VIEW"],
  MASTERCLASS: ["MASTERCLASS_VIEW"],
  LEARNERS: ["LEARNERS_VIEW"],
  MESSAGES: ["MESSAGES_MANAGE"],
  NEWSLETTER: ["NEWSLETTER_MANAGE"],
  /** Communauté : questions des apprenants (équipe de session) et modération de l'entraide. */
  COMMUNITY: ["COMMUNITY_MODERATE", "SESSIONS_VIEW"],
  EMAILS: ["EMAIL_LOGS_VIEW"],
  SITE_CONTENT: ["SITE_CONTENT_VIEW"],
  PROGRAM: ["PROGRAM_MANAGE"],
  SESSION_FOLLOW: ["SESSIONS_VIEW"],
  ACCOUNTS: ["ACCOUNTS_MANAGE"],
  PROFILES: ["PROFILES_MANAGE"],
  AUDIT: ["AUDIT_VIEW"],
  /** Formateur : proposer des modifications du programme de ses formations. */
  PROGRAM_PROPOSE: ["PROGRAM_PROPOSE"],
  /** Pédagogie : valider les propositions des formateurs. */
  PROPOSALS_REVIEW: ["PROGRAM_MANAGE"],
} as const satisfies Record<string, readonly string[]>;

export function hasAnyPermission(granted: readonly string[] | undefined, required: readonly string[]): boolean {
  if (!granted || granted.length === 0) return false;
  return required.some((p) => granted.includes(p));
}

/** Première page utile selon les droits (après connexion). */
export function backOfficeHomeFor(granted: readonly string[] | undefined): string {
  if (hasAnyPermission(granted, ACCESS.DASHBOARD)) return "/admin";
  if (hasAnyPermission(granted, ACCESS.APPLICATIONS)) return "/admin/candidatures";
  if (hasAnyPermission(granted, ACCESS.CATALOG)) return "/admin/bootcamps";
  if (hasAnyPermission(granted, ACCESS.SITE_CONTENT)) return "/admin/contenus";
  return "/admin/espace";
}
