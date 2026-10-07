/**
 * evaluationService.ts — quiz, projet final et suivi de session (Lot 6).
 * Endpoints proposés : voir src/types/evaluation.type.ts.
 *
 * Données de démonstration : uniquement si l'endpoint est absent (404/501) ET que
 * l'environnement l'autorise (voir ./demoFallback). Les actions d'écriture (tentative,
 * dépôt de fichier, appel) basculent en démonstration sous les mêmes conditions.
 */
import { httpClient } from "./httpClient";
import { DEMO_ALLOWED, endpointMissing, withDemo } from "./demoFallback";
import type {
  AttendanceUpdate,
  EvaluationsOverview,
  ProjectOverview,
  QuizAttemptResult,
  QuizAttemptStart,
  QuizSubmission,
  SessionLive,
  SessionTracking,
} from "@/types/evaluation.type";
import {
  addDemoProjectFile,
  buildDemoOverview,
  buildDemoTracking,
  removeDemoProjectFile,
  startDemoAttempt,
  submitDemoAttempt,
  updateDemoAttendance,
} from "@/config/demoEvaluations";

/** Exécute l'appel réel ; en cas d'endpoint absent (et démo autorisée), exécute la version démo. */
async function writeOrDemo<T>(real: () => Promise<T>, demo: () => T): Promise<T> {
  try {
    return await real();
  } catch (e) {
    if (DEMO_ALLOWED && endpointMissing(e)) return demo();
    throw e;
  }
}

export const evaluationService = {
  getOverview: (formationId: string) =>
    withDemo(
      () => httpClient.get<EvaluationsOverview>(`/learner/formations/${formationId}/evaluations`),
      () => buildDemoOverview(formationId)
    ),

  startAttempt: (quizId: string) =>
    writeOrDemo(
      () => httpClient.post<QuizAttemptStart>(`/learner/quizzes/${quizId}/attempts`),
      () => startDemoAttempt(quizId)
    ),

  submitAttempt: (attemptId: string, submission: QuizSubmission) =>
    writeOrDemo(
      () => httpClient.post<QuizAttemptResult>(`/learner/quiz-attempts/${attemptId}/submit`, submission),
      () => submitDemoAttempt(attemptId, submission)
    ),

  uploadProjectFile: (formationId: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return writeOrDemo(
      () => httpClient.post<ProjectOverview>(`/learner/formations/${formationId}/project/files`, body),
      () => {
        addDemoProjectFile(file);
        return buildDemoOverview(formationId).project as ProjectOverview;
      }
    );
  },

  deleteProjectFile: (formationId: string, fileId: string) =>
    writeOrDemo(
      () => httpClient.delete<ProjectOverview>(`/learner/formations/${formationId}/project/files/${fileId}`),
      () => {
        removeDemoProjectFile(fileId);
        return buildDemoOverview(formationId).project as ProjectOverview;
      }
    ),

  getSessionTracking: (sessionId: string) =>
    withDemo(
      () => httpClient.get<SessionTracking>(`/admin/sessions/${sessionId}/tracking`),
      () => buildDemoTracking(sessionId)
    ),

  saveAttendance: (sessionId: string, liveId: string, update: AttendanceUpdate) =>
    writeOrDemo(
      () => httpClient.put<SessionLive>(`/admin/sessions/${sessionId}/lives/${liveId}/attendance`, update),
      () => {
        updateDemoAttendance(liveId, update);
        const live = buildDemoTracking(sessionId).lives.find((l) => l.id === liveId);
        return live as SessionLive;
      }
    ),
};
