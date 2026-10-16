/**
 * sessionOpsService.ts — actions de suivi d'une session (équipe pédagogique) : messages aux apprenants,
 * questions des leçons, correction du projet final, affectation du formateur.
 * Contrats : modeltech-backend AdminMessagingController, AdminEvaluationController, AdminBootcampController,
 * AdminTrainerController. Messagerie/formateurs : ApiResponse<T> ; correction du projet : JSON brut.
 */
import { httpClient } from "@/services/httpClient";
import type { QuizSummary } from "@/types/evaluation.type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SessionMessage {
  id: string;
  subject: string;
  body: string;
  sentBy: string;
  recipientCount: number;
  deliveredCount: number | null;
  sentAt: string;
}

export interface SessionQuestion {
  id: string;
  learnerId: string;
  learnerName: string;
  lessonId: string;
  lessonTitle: string;
  question: string;
  askedAt: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
}

/** Question de la boîte de réception (toutes sessions) : comme SessionQuestion, avec sa session et sa formation. */
export interface InboxQuestion extends SessionQuestion {
  sessionId: string;
  sessionName: string | null;
  formationTitle: string;
}

export type QuestionStatus = "OPEN" | "ANSWERED" | "ALL";

export interface InboxPage {
  items: InboxQuestion[];
  totalElements: number;
  totalPages: number;
}

export interface ProjectFileLink {
  id: string;
  name: string;
  sizeLabel: string;
  /** Lien temporaire (15 minutes). */
  downloadUrl: string;
  uploadedAt: string | null;
}

export type ProjectDecision = "VALIDATED" | "CHANGES_REQUESTED";

export interface Trainer {
  id: string;
  email: string;
  fullName: string;
}

export const sessionOpsService = {
  /** Boîte de réception des questions, toutes sessions confondues (filtrée côté serveur). */
  inbox: async (params: { status: QuestionStatus; q?: string; page: number; size: number }): Promise<InboxPage> => {
    const res = await httpClient.get<ApiResponse<InboxQuestion[]> & { pagination?: { totalElements: number; totalPages: number } }>(
      "/admin/questions", { params });
    return { items: res.data ?? [], totalElements: res.pagination?.totalElements ?? res.data?.length ?? 0, totalPages: res.pagination?.totalPages ?? 1 };
  },

  /** Les quiz d'un apprenant : tentatives utilisées, limite effective, tentatives accordées. */
  learnerQuizzes: (sessionId: string, learnerId: string) =>
    httpClient.get<QuizSummary[]>(`/admin/sessions/${sessionId}/learners/${learnerId}/quizzes`),

  /** Accorde des tentatives supplémentaires à un apprenant sur un quiz (motif obligatoire). */
  grantAttempts: (sessionId: string, learnerId: string, quizId: string, extraAttempts: number, reason: string) =>
    httpClient.post<QuizSummary>(`/admin/sessions/${sessionId}/learners/${learnerId}/quizzes/${quizId}/attempts`, { extraAttempts, reason }),

  sendMessage: async (sessionId: string, payload: { subject: string; body: string; learnerIds?: string[] }): Promise<SessionMessage> =>
    (await httpClient.post<ApiResponse<SessionMessage>>(`/admin/sessions/${sessionId}/messages`, payload)).data,

  messageHistory: async (sessionId: string): Promise<SessionMessage[]> =>
    (await httpClient.get<ApiResponse<SessionMessage[]>>(`/admin/sessions/${sessionId}/messages`)).data ?? [],

  questions: async (sessionId: string, openOnly = false): Promise<SessionQuestion[]> =>
    (await httpClient.get<ApiResponse<SessionQuestion[]>>(`/admin/sessions/${sessionId}/questions`, { params: { open: openOnly } })).data ?? [],

  answer: async (sessionId: string, questionId: string, answer: string): Promise<SessionQuestion> =>
    (await httpClient.post<ApiResponse<SessionQuestion>>(`/admin/sessions/${sessionId}/questions/${questionId}/answer`, { answer })).data,

  projectFiles: async (sessionId: string, learnerId: string): Promise<ProjectFileLink[]> =>
    (await httpClient.get<ProjectFileLink[]>(`/admin/sessions/${sessionId}/learners/${learnerId}/project/files`)) ?? [],

  reviewProject: async (sessionId: string, learnerId: string, review: { status: ProjectDecision; message?: string }): Promise<void> => {
    await httpClient.post<unknown>(`/admin/sessions/${sessionId}/learners/${learnerId}/project/review`, review);
  },

  trainers: async (): Promise<Trainer[]> =>
    (await httpClient.get<ApiResponse<Trainer[]>>("/admin/trainers")).data ?? [],

  assignTrainer: async (sessionId: string, trainerId: string | null): Promise<void> => {
    await httpClient.put<unknown>(`/admin/bootcamps/sessions/${sessionId}/trainer`, { trainerId });
  },
};
