/**
 * legal.type.ts — textes légaux (CGU, CGV, confidentialité, mentions) et acceptation.
 * Contrat : modeltech-backend PublicLegalController (/legal), LearnerLegalController (/learner/legal), AdminLegalController (/admin/legal).
 * Seuls les textes publiés (validés par le conseil juridique) sont exigés : tant que rien n'est publié, rien ne bloque.
 */

export type LegalCode = "CGU" | "CGV" | "PRIVACY" | "MENTIONS";

export const LEGAL_CODES: LegalCode[] = ["CGU", "CGV", "PRIVACY", "MENTIONS"];

/** Adresse publique de chaque texte. */
export const LEGAL_PATHS: Record<LegalCode, string> = { CGU: "/cgu", CGV: "/cgv", PRIVACY: "/confidentialite", MENTIONS: "/mentions-legales" };

/** Les moments où l'acceptation est exigée (mêmes noms que le serveur). */
export type LegalContext = "SIMULATOR_ORDER" | "REGISTRATION" | "COACHING_REQUEST" | "COACHING_PAYMENT" | "LEARNER_ACCESS";

export interface LegalDocumentRef { id: string; code: LegalCode; title: string; version: number; publishedAt: string; path: string }

export interface LegalPublicDocument { document: LegalDocumentRef; body: string }

/** Textes publiés à accepter pour un acte ; `documents` vide = rien à accepter pour l'instant. */
export interface LegalRequirements { context: LegalContext; documents: LegalDocumentRef[] }

// ── Administration ──────────────────────────────────────────────────────

export type LegalStatus = "DRAFT" | "PUBLISHED" | "SUPERSEDED";

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = { DRAFT: "Brouillon", PUBLISHED: "En vigueur", SUPERSEDED: "Ancienne version" };

export interface LegalAdminDocument {
  id: string; code: LegalCode; title: string; version: number; status: LegalStatus; body: string; changeSummary: string | null;
  counselValidatedBy: string | null; counselValidatedOn: string | null; publishedAt: string | null; publishedBy: string | null;
  createdAt: string; updatedAt: string | null;
  /** Le texte contient encore des champs « [À COMPLÉTER] » : la publication est bloquée. */
  hasPlaceholders: boolean;
}

export interface LegalAdminOverview {
  code: LegalCode; label: string; path: string; published: LegalAdminDocument | null; draft: LegalAdminDocument | null; history: LegalAdminDocument[];
}

export interface LegalSaveDraft { title: string; body: string; changeSummary?: string }

export interface LegalPublish { counselValidatedBy: string; counselValidatedOn: string; changeSummary: string }

export interface LegalAcceptanceView {
  id: string; code: LegalCode; version: number; contentHash: string; context: string; subjectType: string; subjectRef: string;
  email: string; fullName: string | null; acceptedAt: string; ipAddress: string | null;
}

export const LEGAL_CONTEXT_LABELS: Record<string, string> = {
  SIMULATOR_ORDER: "Achat simulateur", REGISTRATION: "Candidature", COACHING_REQUEST: "Demande de coaching",
  COACHING_PAYMENT: "Paiement coaching", LEARNER_ACCESS: "Accès apprenant",
};
