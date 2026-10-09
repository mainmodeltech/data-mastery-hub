/**
 * adminMeService.ts — « Mon espace » du back-office : sessions et formations visibles par le compte connecté
 * (GET /admin/me/sessions et /admin/me/formations, enveloppe ApiResponse).
 *  - administration : toutes les sessions ; formateur : celles qui lui sont confiées ;
 *  - administration et éditeur : toutes les formations ; partenaire : les siennes.
 */
import { httpClient } from "@/services/httpClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MySession {
  sessionId: string;
  sessionName: string | null;
  formationId: string;
  formationTitle: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  capacity: number | null;
  participants: number | null;
  trainerName: string | null;
}

export interface MyFormation {
  id: string;
  title: string;
  slug: string | null;
  published: boolean;
  domainName: string | null;
  deliveredBy: string;
  partnerName: string | null;
  sessionCount: number;
}

export const adminMeService = {
  sessions: async (): Promise<MySession[]> =>
    (await httpClient.get<ApiResponse<MySession[]>>("/admin/me/sessions")).data ?? [],

  formations: async (): Promise<MyFormation[]> =>
    (await httpClient.get<ApiResponse<MyFormation[]>>("/admin/me/formations")).data ?? [],
};
