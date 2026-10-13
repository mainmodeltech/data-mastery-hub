/**
 * profiles.type.ts — profils et droits du back-office.
 * Contrat : modeltech-backend AdminProfileController (/admin/profiles), réponses en ApiResponse<T>.
 * Un compte cumule les droits de tous ses profils ; la direction règle les droits de chaque profil.
 */

export interface StaffProfile {
  id: string;
  /** Nom technique (ROLE_FINANCE, ROLE_RESPONSABLE_PARTENARIATS…) */
  name: string;
  /** Nom affiché (« Finance ») */
  label: string;
  description: string | null;
  /** Profil livré avec la plateforme : modifiable, jamais supprimable */
  system: boolean;
  /** Direction : tous les droits, y compris ceux ajoutés plus tard (non modifiable) */
  allPermissions: boolean;
  permissions: string[];
  /** Comptes actifs qui ont ce profil */
  activeUsers: number;
}

export interface PermissionDef {
  code: string;
  /** Domaine (Argent, Admissions, Pédagogie…) */
  group: string;
  label: string;
}

export interface ProfilePayload {
  label?: string;
  description?: string;
  permissions?: string[];
}
