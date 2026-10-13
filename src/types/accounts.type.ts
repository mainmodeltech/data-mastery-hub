/**
 * accounts.type.ts — comptes apprenants et comptes back-office.
 * Contrat : modeltech-backend AdminLearnerController (/admin/learners, ADMIN) et
 * AdminUserController (/admin/users, SUPER_ADMIN uniquement). Réponses en ApiResponse<T>.
 */

export interface AdminLearner {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  country: string | null;
  active: boolean;
  /** false tant que l'apprenant n'a pas défini son mot de passe via l'invitation */
  passwordSet: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LearnerPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
}

/** Nom d'un profil sans préfixe (« FINANCE », « RESPONSABLE_PARTENARIATS »). Les profils sont gérés dans « Profils & droits ». */
export type StaffRole = string;

/** Profil qui exige un partenaire rattaché (les droits de ce profil ne portent que sur les formations du partenaire). */
export const PARTNER_PROFILE = "PARTNER";

export interface AdminUserAccount {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  /** Double authentification activée sur ce compte. */
  mfaEnabled?: boolean;
  partnerId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserCreatePayload {
  email: string;
  fullName: string;
  roles: StaffRole[];
  partnerId?: string | null;
}

export interface UserUpdatePayload {
  fullName?: string;
  roles?: StaffRole[];
  partnerId?: string | null;
  active?: boolean;
}

/** « ROLE_ADMIN » → « ADMIN » */
export function plainRole(role: string): string {
  return role.replace(/^ROLE_/, "").toUpperCase();
}
