/**
 * simulatorLearner.type.ts — espace apprenant du simulateur de certification.
 * Contrat : modeltech-backend LearnerSimulatorController (/learner/simulator). Règle de sécurité : pendant une tentative le
 * serveur n'envoie JAMAIS de corrigé (QuestionView) ; il n'apparaît que dans Feedback (mode étude) et QuestionReport (tentative terminée).
 */
import type { PlanCode } from "@/types/simulator.type";

export type AttemptMode = "EXAM" | "STUDY";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";
export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "YES_NO_SERIES";

export interface AccessView {
  certification: string; planCode: PlanCode; startsAt: string; expiresAt: string;
  examAttemptsTotal: number; examAttemptsRemaining: number;
}

export interface DomainInfo { code: string; name: string; weightMin: number; weightMax: number; publishedQuestions: number }

export interface CatalogView {
  certification: string; name: string; blueprintLabel: string; durationMinutes: number; examQuestions: number;
  passScore: number; domains: DomainInfo[]; access: AccessView[]; examInProgress: boolean;
  /** Vrai tant que le seul accès est l'essai gratuit (mini-test, pas d'entraînement libre). */
  trial: boolean; trialCorrections: number;
}

export interface StartRequest { mode: AttemptMode; domain?: string; skill?: string; count?: number }

/** Réponse enregistrée : `{ selected: ["A"] }` (choix) ou `{ answers: { S1: true } }` (série Oui/Non). */
export type AnswerValue = { selected?: string[]; answers?: Record<string, boolean> };

export interface QuestionPayload {
  choices?: { id: string; text: string }[];
  statements?: { id: string; text: string }[];
  selectCount?: number;
}

export interface QuestionView {
  ref: string; position: number; type: QuestionType; stem: string; payload: QuestionPayload;
  answer: AnswerValue | null; flagged: boolean;
}

export interface AttemptView {
  id: string; mode: AttemptMode; status: AttemptStatus; startedAt: string; deadlineAt: string | null; serverNow: string;
  totalQuestions: number; answered: number; questions: QuestionView[]; trial: boolean;
}

export interface AnswerRequest { answer?: AnswerValue | null; flagged?: boolean; timeSpentSeconds?: number }
export interface Feedback { score: number; correctAnswer: AnswerValue; explanationFr: string | null }
export interface AnswerResult { saved: boolean; feedback: Feedback | null }

export interface AttemptSummary {
  id: string; mode: AttemptMode; status: AttemptStatus; startedAt: string; finishedAt: string | null; totalQuestions: number;
  scorePercent: number | null; scaledScore: number | null; passed: boolean | null;
}

export interface ScoreBucket { code: string; name: string; questions: number; points: number; percent: number }

export interface QuestionReport {
  position: number; domainCode: string; skillCode: string; itemCode: string; type: QuestionType; stem: string;
  payload: QuestionPayload; yourAnswer: AnswerValue | null;
  /** Essai gratuit : `locked` = correction non offerte ; le serveur n'envoie alors ni corrigé, ni explication, ni note. */
  correctAnswer: AnswerValue | null; score: number | null;
  explanationFr: string | null; timeSpentSeconds: number; locked: boolean;
}

export interface ReportView {
  summary: AttemptSummary; passScore: number; estimated: boolean; domains: ScoreBucket[]; skills: ScoreBucket[]; questions: QuestionReport[];
  trial: boolean; lockedCount: number;
}

export const MODE_LABELS: Record<AttemptMode, string> = { EXAM: "Examen blanc", STUDY: "Étude" };
export const STATUS_LABELS: Record<AttemptStatus, string> = { IN_PROGRESS: "En cours", SUBMITTED: "Remise", EXPIRED: "Temps écoulé" };
