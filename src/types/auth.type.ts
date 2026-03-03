// ============================================================
// Types d'authentification — alignés sur l'API Spring Boot
// POST /api/v1/auth/login → AuthResponse
// GET  /api/v1/auth/me    → AuthUser
// ============================================================

export interface LoginCredentials {
    email: string;
    password: string;
}

/** Réponse du backend au login */
export interface AuthResponse {
    accessToken: string;
    tokenType: string;     // "Bearer"
    expiresIn: number;     // ms (86400000 = 24h)
    user: AuthUser;
}

/** Utilisateur connecté */
export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

/** État global du contexte d'auth */
export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
