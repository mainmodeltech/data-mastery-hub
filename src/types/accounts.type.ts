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

export type StaffRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "TRAINER" | "PARTNER";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  EDITOR: "Éditeur de contenu",
  TRAINER: "Formateur",
  PARTNER: "Partenaire",
};

export const STAFF_ROLE_HINTS: Record<StaffRole, string> = {
  SUPER_ADMIN: "Tout, y compris la gestion des comptes.",
  ADMIN: "Candidatures, paiements, catalogue et contenu.",
  EDITOR: "Contenu du site (témoignages, alumni, projets…).",
  TRAINER: "Suivi de ses sessions et contenu de cours.",
  PARTNER: "Ses propres formations (partenaire obligatoire).",
};

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
