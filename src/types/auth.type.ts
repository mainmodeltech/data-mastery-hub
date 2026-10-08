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
 * (/auth/passwordless/verify) et Google (/auth/google) renvoient exactement le même objet.
 */
export interface AuthResponse {
    accessToken: string;
    tokenType: string;     // "Bearer"
    expiresIn: number;     // ms (86400000 = 24h)
    user: AuthUser;
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

/** État global du contexte d'auth */
export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
