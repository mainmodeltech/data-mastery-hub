import { backOfficeHomeFor } from "./permissions.ts";

/**
 * Profils et redirection après connexion.
 *
 * Le back-office ne raisonne plus en « rôles » mais en droits (lib/permissions.ts) : un compte cumule les droits de ses
 * profils, et la direction peut créer des profils sur mesure. Ici ne restent que le nom des profils à afficher et la
 * page d'accueil de chaque compte.
 */

/** Nom affichable du ou des profils d'un compte (« Finance · Admissions »). */
export function profileTitle(user: { profileLabels: readonly string[]; userType?: string } | null | undefined): string {
  if (!user) return "Utilisateur";
  if (user.profileLabels.length > 0) return user.profileLabels.join(" · ");
  return user.userType === "LEARNER" ? "Apprenant" : "Utilisateur";
}

/** Où envoyer un compte : apprenant → son espace ; personnel → la première page que ses droits ouvrent ; sinon l'accueil. */
export function homePathFor(user: { isStaff: boolean; userType?: string; permissions: readonly string[] } | null | undefined): string {
  if (!user) return "/";
  if (user.isStaff) return backOfficeHomeFor(user.permissions);
  if (user.userType === "LEARNER") return "/espace";
  return "/";
}
