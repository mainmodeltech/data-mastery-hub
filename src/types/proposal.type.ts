/**
 * proposal.type.ts — propositions de modification du programme (formateur -> pédagogie).
 * Réponses en JSON brut (sans enveloppe).
 *   Formateur (PROGRAM_PROPOSE) : /admin/program-proposals/mine/**
 *   Pédagogie (PROGRAM_MANAGE + SCOPE_ALL_FORMATIONS) : /admin/program-proposals/**
 */
import type { CourseContent } from "@/types/course.type";
import type { QuizQuestionEdit } from "@/types/authoring.type";

export type ProposalStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED";

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumise",
  CHANGES_REQUESTED: "Modifications demandées",
  APPROVED: "Validée",
  REJECTED: "Refusée",
};

/** Statuts dans lesquels l'auteur peut modifier sa proposition (null = pas encore enregistrée). */
export const PROPOSAL_EDITABLE: readonly (ProposalStatus | null)[] = [null, "DRAFT", "CHANGES_REQUESTED"];

export interface QuizBankDraft {
  /** lesson.id si la leçon existe en ligne, sinon lesson.clientKey */
  lessonRef: string;
  questions: QuizQuestionEdit[];
}

export interface ProposalBody {
  content: CourseContent;
  quizBanks: QuizBankDraft[];
}

export interface ProposalPayload {
  id: string | null;
  formationId: string;
  formationTitle: string;
  status: ProposalStatus | null;
  authorName: string | null;
  reviewerName: string | null;
  reviewComment: string | null;
  baseContentUpdatedAt: string | null;
  liveContentUpdatedAt: string | null;
  stale: boolean;
  /** L'utilisateur connecté est l'auteur de la proposition. */
  own: boolean;
  /** id de leçon en ligne -> statut en ligne */
  liveLessonStatuses: Record<string, "PUBLISHED" | "SCHEDULED" | "DRAFT">;
  submittedAt: string | null;
  reviewedAt: string | null;
  updatedAt: string | null;
  content: CourseContent;
  quizBanks: QuizBankDraft[];
}

export interface ProposalDetail extends ProposalPayload {
  live: ProposalBody;
}

export interface ProposableFormation {
  formationId: string;
  formationTitle: string;
  proposal: { id: string; status: ProposalStatus; updatedAt: string } | null;
}

export interface ProposalSummary {
  id: string;
  formationId: string;
  formationTitle: string;
  authorName: string;
  status: ProposalStatus;
  submittedAt: string | null;
  updatedAt: string;
  stale: boolean;
}

export interface ApproveProposalBody { publishNewLessons?: boolean; comment?: string }
