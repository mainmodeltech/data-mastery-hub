/**
 * masterclassService.ts — masterclass : événements (public) et gestion par l'équipe.
 * Public : GET /masterclass/upcoming (jamais de lien de connexion). Équipe : /admin/masterclasses (ApiResponse<T>).
 */
import { httpClient } from "@/services/httpClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; size: number; totalElements: number; totalPages: number };
}

export type MasterclassFormat = "ONLINE" | "ONSITE" | "HYBRID";
export type MasterclassStatus = "DRAFT" | "OPEN" | "CLOSED" | "DONE";
export type Attendance = "REGISTERED" | "ATTENDED" | "ABSENT";

export const FORMAT_LABELS: Record<MasterclassFormat, string> = { ONLINE: "En ligne", ONSITE: "Sur place", HYBRID: "Hybride" };
export const STATUS_LABELS: Record<MasterclassStatus, string> = { DRAFT: "Non publiée", OPEN: "Inscriptions ouvertes", CLOSED: "Inscriptions closes", DONE: "Terminée" };
export const ATTENDANCE_LABELS: Record<Attendance, string> = { REGISTERED: "Inscrit", ATTENDED: "Présent", ABSENT: "Absent" };

export interface PublicMasterclass {
  code: string;
  title: string;
  description: string | null;
  /** Heure locale du serveur, sans fuseau (ex. 2026-11-20T18:00:00) */
  startsAt: string;
  durationMinutes: number;
  format: MasterclassFormat;
  place: string | null;
  spotsLeft: number | null;
  full: boolean;
  registrationOpen: boolean;
}

export interface AdminMasterclass {
  id: string;
  code: string;
  title: string;
  description: string | null;
  startsAt: string;
  durationMinutes: number;
  format: MasterclassFormat;
  place: string | null;
  joinUrl: string | null;
  capacity: number | null;
  published: boolean;
  registrationsClosed: boolean;
  registered: number;
  attended: number;
  status: MasterclassStatus;
}

export interface MasterclassPayload {
  title: string;
  description: string;
  startsAt: string;
  durationMinutes: number;
  format: MasterclassFormat;
  place: string;
  joinUrl: string;
  capacity: number | null;
  published: boolean;
  registrationsClosed: boolean;
}

export interface MasterclassRegistrant {
  id: string;
  masterclassId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profile: string | null;
  company: string | null;
  emailSent: boolean;
  attendance: Attendance;
  createdAt: string;
}

export const masterclassService = {
  upcoming: async (limit = 1): Promise<PublicMasterclass[]> =>
    (await httpClient.get<ApiResponse<PublicMasterclass[]>>("/masterclass/upcoming", { params: { limit }, skipAuth: true })).data ?? [],

  list: async (): Promise<AdminMasterclass[]> => (await httpClient.get<ApiResponse<AdminMasterclass[]>>("/admin/masterclasses")).data ?? [],
  create: async (payload: MasterclassPayload): Promise<AdminMasterclass> =>
    (await httpClient.post<ApiResponse<AdminMasterclass>>("/admin/masterclasses", payload)).data,
  update: async (id: string, payload: MasterclassPayload): Promise<AdminMasterclass> =>
    (await httpClient.put<ApiResponse<AdminMasterclass>>(`/admin/masterclasses/${id}`, payload)).data,
  remove: async (id: string): Promise<void> => { await httpClient.delete<ApiResponse<null>>(`/admin/masterclasses/${id}`); },

  registrants: async (id: string, page = 0, size = 200): Promise<{ items: MasterclassRegistrant[]; total: number }> => {
    const res = await httpClient.get<ApiResponse<MasterclassRegistrant[]>>(`/admin/masterclasses/${id}/registrations`, { params: { page, size } });
    return { items: res.data ?? [], total: res.pagination?.totalElements ?? res.data?.length ?? 0 };
  },
  setAttendance: async (id: string, registrationId: string, attendance: Attendance): Promise<MasterclassRegistrant> =>
    (await httpClient.patch<ApiResponse<MasterclassRegistrant>>(`/admin/masterclasses/${id}/registrations/${registrationId}/attendance`, { attendance })).data,
  message: async (id: string, payload: { subject: string; body: string; audience: "ALL" | "ATTENDED" | "ABSENT" }): Promise<number> =>
    (await httpClient.post<ApiResponse<{ recipients: number }>>(`/admin/masterclasses/${id}/message`, payload)).data.recipients,
};
