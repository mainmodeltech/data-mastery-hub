/**
 * simulatorLearnerService.ts — espace apprenant du simulateur. Le serveur est autoritaire (temps, quota, notation) ;
 * toutes les routes exigent un compte apprenant disposant d'un droit d'usage actif.
 */
import { httpClient } from "@/services/httpClient";
import type {
  AnswerRequest, AnswerResult, AttemptSummary, AttemptView, CatalogView, ReportView, StartRequest,
} from "@/types/simulatorLearner.type";

interface ApiResponse<T> { success: boolean; message: string; data: T }

const base = "/learner/simulator";

export const simulatorLearnerService = {
  catalog: async (): Promise<CatalogView> => (await httpClient.get<ApiResponse<CatalogView>>(`${base}/catalog`)).data,

  attempts: async (): Promise<AttemptSummary[]> => (await httpClient.get<ApiResponse<AttemptSummary[]>>(`${base}/attempts`)).data ?? [],

  start: async (body: StartRequest): Promise<AttemptView> => (await httpClient.post<ApiResponse<AttemptView>>(`${base}/attempts`, body)).data,

  attempt: async (id: string): Promise<AttemptView> => (await httpClient.get<ApiResponse<AttemptView>>(`${base}/attempts/${id}`)).data,

  answer: async (attemptId: string, ref: string, body: AnswerRequest): Promise<AnswerResult> =>
    (await httpClient.put<ApiResponse<AnswerResult>>(`${base}/attempts/${attemptId}/answers/${ref}`, body)).data,

  submit: async (id: string): Promise<ReportView> => (await httpClient.post<ApiResponse<ReportView>>(`${base}/attempts/${id}/submit`)).data,

  report: async (id: string): Promise<ReportView> => (await httpClient.get<ApiResponse<ReportView>>(`${base}/attempts/${id}/report`)).data,
};
