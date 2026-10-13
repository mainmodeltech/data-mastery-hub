// ============================================================
// Types d'authentification — alignés sur l'API Spring Boot
// POST /api/v1/auth/login → AuthResponse
// GET  /api/v1/auth/me    → AuthUser
// ============================================================

export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Réponse du backend à toute ouverture de session : mot de passe (/auth/login), lien ou code
 * (/auth/passwordless/verify), Google (/auth/google), second facteur (/auth/mfa/*) et rafraîchissement
 * (/auth/refresh) renvoient le même objet.
 *
 * Personnel : tant que la double authentification n'est pas validée, la réponse ne contient AUCUN jeton d'accès,
 * seulement un défi (`mfaRequired` ou `mfaEnrollmentRequired` + `mfaToken`).
 */
export interface AuthResponse {
    /** Jeton d'accès de 15 minutes ; absent tant qu'un second facteur reste à valider. */
    accessToken?: string;
    tokenType: string;     // "Bearer"
    expiresIn?: number;    // ms (900000 = 15 min)
    user?: AuthUser;
    /** Le code de l'application d'authentification (ou un code de secours) est à saisir. */
    mfaRequired?: boolean;
    /** La double authentification est obligatoire et reste à configurer sur ce compte. */
    mfaEnrollmentRequired?: boolean;
    /** Défi à renvoyer avec le code (valable 5 minutes). */
    mfaToken?: string;
    /** Fin d'enrôlement : codes de secours, affichés une seule fois. */
    recoveryCodes?: string[];
    /** Connexion par code de secours : combien il en reste. */
    recoveryCodesRemaining?: number;
}

/** Second facteur en attente de validation. */
export interface PendingMfa {
    kind: 'verify' | 'enroll';
    token: string;
}

/** POST /auth/mfa/enroll/start */
export interface MfaEnrollment {
    /** Secret à saisir dans l'application d'authentification (Base32). */
    secret: string;
    /** Adresse otpauth:// (ouvre directement l'application sur mobile). */
    otpauthUri: string;
}

/** Utilisateur connecté (contrat : api-contract.md §3.A bis) */
export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    primaryRole: string;
    /** Noms stockés : ROLE_ADMIN, ROLE_LEARNER… */
    roles: string[];
    userType: 'ADMIN' | 'LEARNER';
    partnerId?: string | null;
    /** Personnel : la double authentification est activée. */
    mfaEnabled?: boolean;
}

/** GET /auth/options : modes de connexion actifs côté serveur */
export interface AuthOptions {
    password: boolean;
    passwordless: boolean;
    google: boolean;
    /** ID client OAuth Google (public) ; absent/null si Google n'est pas configuré */
    googleClientId?: string | null;
}

/** POST /auth/passwordless/verify : le lien envoie `token`, le code à 6 chiffres envoie `email` + `code` */
export type PasswordlessVerifyPayload = { token: string } | { email: string; code: string };
