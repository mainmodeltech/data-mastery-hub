/**
 * simulator.type.ts — banque de questions du simulateur de certification (administration).
 * Contrat : modeltech-backend AdminSimulatorController (/admin/simulator). Ces vues contiennent les CORRIGÉS :
 * elles ne servent qu'au personnel habilité. Enveloppe ApiResponse<T>.
 */

export type ItemType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "YES_NO_SERIES";
export type ItemStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "RETIRED";

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  SINGLE_CHOICE: "Choix unique",
  MULTIPLE_CHOICE: "Choix multiples",
  YES_NO_SERIES: "Série Oui/Non",
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
  status: ItemStatus; author: string; stemPreview: string; updatedAt: string;
}

export interface Choice { id: string; text: string; correct: boolean }
export interface Statement { id: string; text: string; answer: boolean }
export interface ItemPayload { choices?: Choice[]; statements?: Statement[]; selectCount?: number }

export interface ItemVersion {
  code: string; versionNo: number; domainCode: string; skillCode: string; type: ItemType; difficulty: number;
  stemEn: string; payload: ItemPayload; explanationFr: string | null; status: ItemStatus; blueprintLabel: string;
  author: string; reviewer: string | null; reviewNote: string | null; verifiedBy: string | null; verifiedAt: string | null;
  publisher: string | null; createdAt: string; publishedAt: string | null; retiredAt: string | null; retireReason: string | null;
  versions: number[];
}

export interface ItemRequest {
  skillCode?: string;
  type: ItemType;
  difficulty: number;
  stemEn: string;
  payload: ItemPayload;
  explanationFr?: string;
}

export interface ItemFilters { status?: ItemStatus; domain?: string; skill?: string; type?: ItemType; q?: string; mine?: boolean }

export interface ImportResult { created: number; codes: string[]; errors: { index: number; message: string }[] }
