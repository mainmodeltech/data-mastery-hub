/**
 * simulator.type.ts — banque de questions du simulateur de certification (administration).
 * Contrat : modeltech-backend AdminSimulatorController (/admin/simulator). Ces vues contiennent les CORRIGÉS :
 * elles ne servent qu'au personnel habilité. Enveloppe ApiResponse<T>.
 */

export type ItemType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "YES_NO_SERIES" | "MATCHING" | "SHORT_ANSWER";
export type ItemStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "RETIRED";

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  SINGLE_CHOICE: "Choix unique",
  MULTIPLE_CHOICE: "Choix multiples",
  YES_NO_SERIES: "Série Oui/Non",
  MATCHING: "Correspondance (glisser-déposer)",
  SHORT_ANSWER: "Réponse libre (mots-clés)",
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  DRAFT: "Brouillon",
  IN_REVIEW: "En relecture",
  APPROVED: "Approuvée",
  PUBLISHED: "Publiée",
  RETIRED: "Retirée",
};

export const DIFFICULTY_LABELS: Record<number, string> = { 1: "Facile", 2: "Moyen", 3: "Difficile" };

export interface SimSkill { id: string; code: string; name: string; targetQuestions: number }
export interface SimDomain { code: string; name: string; weightMin: number; weightMax: number; skills: SimSkill[] }
export interface SimBlueprint {
  id: string; certification: string; versionDate: string; label: string;
  durationMinutes: number; questionsMin: number; questionsMax: number; passScore: number; domains: SimDomain[];
}

export interface CoverageRow {
  domainCode: string; skillCode: string; skillName: string; target: number;
  draft: number; inReview: number; approved: number; published: number;
}

export interface ItemSummary {
  code: string; versionNo: number; domainCode: string; skillCode: string; type: ItemType; difficulty: number;
  status: ItemStatus; author: string; stemPreview: string; updatedAt: string; trialSample: boolean;
}

export interface Choice { id: string; text: string; correct: boolean }
export interface Statement { id: string; text: string; answer: boolean }
export interface MatchElement { id: string; text: string }
export interface KeywordGroup { id: string; accept: string[] }
export interface ItemPayload {
  choices?: Choice[]; statements?: Statement[]; selectCount?: number;
  /** Correspondance : éléments (P1…), options (O1…, des leurres sont possibles) et option attendue pour chaque élément. */
  prompts?: MatchElement[]; options?: MatchElement[]; pairs?: Record<string, string>; reuse?: boolean;
  /** Réponse libre : chaque mot-clé accepte plusieurs formulations ; tous doivent être présents. */
  keywords?: KeywordGroup[]; partialCredit?: boolean; maxLength?: number;
}

export interface ItemVersion {
  code: string; versionNo: number; domainCode: string; skillCode: string; type: ItemType; difficulty: number;
  stemEn: string; payload: ItemPayload; explanationFr: string | null; status: ItemStatus; blueprintLabel: string;
  author: string; reviewer: string | null; reviewNote: string | null; verifiedBy: string | null; verifiedAt: string | null;
  publisher: string | null; createdAt: string; publishedAt: string | null; retiredAt: string | null; retireReason: string | null;
  versions: number[]; trialSample: boolean;
}

export interface ItemRequest {
  skillCode?: string;
  type: ItemType;
  difficulty: number;
  stemEn: string;
  payload: ItemPayload;
  explanationFr?: string;
}

export interface ItemFilters { status?: ItemStatus; domain?: string; skill?: string; type?: ItemType; q?: string; mine?: boolean; trialSample?: boolean }

export interface ImportResult { created: number; codes: string[]; errors: { index: number; message: string }[] }

// ── Droits d'usage (administration) ─────────────────────────────────────

export type PlanCode = "TRIAL" | "ESSENTIEL" | "PRO" | "PRO_COACHING" | "ENTREPRISE";
export type GrantStatus = "ACTIVE" | "REVOKED";

export const PLAN_LABELS: Record<PlanCode, string> = {
  TRIAL: "Essai",
  ESSENTIEL: "Essentiel",
  PRO: "Pro",
  PRO_COACHING: "Pro + coaching",
  ENTREPRISE: "Entreprise",
};

export interface GrantView {
  id: string; learnerEmail: string; learnerName: string; plan: PlanCode; startsAt: string; expiresAt: string;
  examAttemptsTotal: number; examAttemptsUsed: number; status: GrantStatus; grantedBy: string; reason: string;
  createdAt: string; revokedAt: string | null; revokeReason: string | null;
}

export interface GrantRequest { learnerEmail: string; plan: PlanCode; days: number; examAttempts: number; reason: string }
