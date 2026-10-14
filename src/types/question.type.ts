/**
 * question.type.ts — questions de l'apprenant à l'équipe pédagogique (JSON brut).
 * Contrat : api-contract.md §3.D octies.
 *   POST /learner/lessons/{lessonId}/questions {question 5–5000} -> 201 LearnerQuestion
 *        409 au-delà de 5 questions sans réponse sur la leçon ; 403 sans accès à la formation
 *   GET  /learner/lessons/{lessonId}/questions                   -> LearnerQuestion[]
 */

export interface LearnerQuestion {
  id: string;
  lessonId: string;
  question: string;
  askedAt: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
}

export const QUESTION_MIN = 5;
export const QUESTION_MAX = 5000;
