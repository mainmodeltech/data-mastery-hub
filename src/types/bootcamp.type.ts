// src/types/bootcamp.types.ts
// Types alignés sur les réponses du backend Spring Boot

export type SessionStatus =
    | "DRAFT"
    | "UPCOMING"
    | "OPEN"
    | "CLOSED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type SessionFormat = "PRESENTIEL" | "REMOTE" | "HYBRID";

export interface BootcampSession {
    id: string;
    bootcampId: string;
    sessionName: string | null;
    cohortNumber: number | null;
    year: number | null;
    startDate: string | null;        // ISO date: "2025-03-10"
    endDate: string | null;
    registrationDeadline: string | null;
    maxParticipants: number;
    currentParticipants: number;
    isFull: boolean;
    schedule: string;
    status: SessionStatus;
    format: SessionFormat;
    location: string | null;
    price: string | null;            // priceOverride si défini, sinon prix du bootcamp
    earlyBirdPrice: string | null;
    earlyBirdDeadline: string | null;
    isFeatured: boolean;
    published: boolean;
    spotsRemaining: number | null;
}

export interface Bootcamp {
    id: string;
    title: string;
    description: string | null;
    duration: string | null;
    audience: string | null;
    prerequisites: string | null;
    price: string | null;
    benefits: string[];
    category: string;
    tag: string | null;
    iconName: string | null;
    featured: boolean;
    published: boolean;
    displayOrder: number;
    nextSession: BootcampSession | null;
    sessions?: BootcampSession[];    // chargé uniquement sur la page détail
    createdAt: string;
    updatedAt: string;

    // ── Contenu entièrement configurable par formation ──────────────────────
    // Objectif : que chaque formation ajoutée (5, 10, N...) porte son propre
    // contenu au lieu de dépendre d'un mapping figé par catégorie côté
    // frontend (voir src/config/bootcamps.config.ts, conservé en fallback
    // pour les formations qui n'ont pas encore ces champs renseignés).
    // Champs backend à ajouter — voir docs/redesign-diagnostic.md §8.
    tagline?: string | null;
    colorKey?: "accent" | "primary" | null;
    profiles?: BootcampProfile[];
    tools?: BootcampTool[];
    curriculum?: BootcampCurriculumWeek[];
    outcomes?: BootcampOutcome[];
    testimonial?: BootcampTestimonial | null;
    certification?: BootcampCertification | null;
}

export interface BootcampProfile {
    icon: string;
    label: string;
}

export interface BootcampTool {
    name: string;
    level: number; // 0–100
}

export interface BootcampCurriculumWeek {
    week: string;
    title: string;
    hours: string;
    topics: string[];
    project: string;
}

export interface BootcampOutcome {
    stat: string;
    label: string;
}

export interface BootcampTestimonial {
    name: string;
    role: string;
    company: string;
    content: string;
    initials: string;
}

export interface BootcampCertification {
    name: string;
    logo: string;
    description: string;
}

export interface CreateBootcampPayload {
    title: string;
    description?: string;
    duration?: string;
    audience?: string;
    prerequisites?: string;
    price?: string;
    benefits?: string[];
    category?: string;
    tag?: string;
    iconName?: string;
    featured?: boolean;
    published?: boolean;
    displayOrder?: number;
}

export interface UpdateBootcampPayload extends Partial<CreateBootcampPayload> {}

export interface CreateSessionPayload {
    sessionName?: string;
    cohortNumber?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
    registrationDeadline?: string;
    maxParticipants?: number;
    status?: SessionStatus;
    format?: SessionFormat;
    location?: string;
    priceOverride?: string;
    earlyBirdPrice?: string;
    earlyBirdDeadline?: string;
    isFeatured?: boolean;
    published?: boolean;
}

export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
    currentParticipants?: number;
    isFull?: boolean;
}
