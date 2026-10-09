/**
 * authoring.type.ts — édition du contenu pédagogique côté back-office (JSON brut).
 * Contrat : api-contract.md §3.D quinquies.
 *   GET/PUT /admin/lessons/{lessonId}/quiz        -> QuizBank
 *        1 bonne réponse exactement, 2 à 8 choix par question ; `questionCount`, `passThreshold` et
 *        `maxAttempts` sont en lecture seule ici (ils se règlent dans le programme)
 *   GET/PUT/DELETE /admin/formations/{id}/project -> ProjectConfig (GET sans consigne : champs null)
 */

export interface QuizChoiceEdit {
  id?: string;
  label: string;
  correct: boolean;
}

export interface QuizQuestionEdit {
  id?: string;
  text: string;
  explanation?: string | null;
  choices: QuizChoiceEdit[];
}

export interface QuizBank {
  lessonId: string;
  title: string | null;
  questionCount: number | null;
  passThreshold: number | null;
  maxAttempts: number | null;
  questions: QuizQuestionEdit[];
}

export interface ProjectConfig {
  brief: string | null;
  deadlineLabel: string | null;
  acceptedExtensions: string[] | null;
  /** 1 à 50 */
  maxSizeMb: number | null;
}

export const MIN_CHOICES = 2;
export const MAX_CHOICES = 8;
export const MAX_PROJECT_SIZE_MB = 50;
