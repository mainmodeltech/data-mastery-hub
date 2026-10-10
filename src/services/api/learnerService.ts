/**
 * learnerService.ts — espace apprenant : profil, paiements et reçus, inscriptions et attestations,
 * calendrier et bibliothèque de ressources. Contrats : modeltech-backend LearnerProfileController,
 * LearnerBillingController, LearnerController (réponses en JSON brut, comme /learner/**).
 */
import { httpClient } from "@/services/httpClient";

export interface LearnerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  country: string | null;
  emailVerified: boolean;
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface UpdateLearnerProfile {
  firstName: string;
  lastName?: string;
  phone?: string;
  country?: string;
}

export type LearnerPaymentStatus = "PENDING" | "DECLARED" | "CONFIRMED" | "REFUNDED" | string;

export interface LearnerPayment {
  id: string;
  registrationId: string;
  formationTitle: string;
  sessionName: string | null;
  installmentNumber: number;
  installmentCount: number;
  amount: number;
  currency: string;
  totalAmount: number | null;
  dueDate: string | null;
  status: LearnerPaymentStatus;
  method: string | null;
  confirmedAt: string | null;
  /** Page de paiement : seulement tant que l'échéance est à régler ou à vérifier. */
  payUrl: string | null;
  /** Chemin du reçu PDF : seulement pour une échéance confirmée. */
  receiptUrl: string | null;
}

export interface LearnerEnrollment {
  formationId: string;
  title: string;
  sessionName: string | null;
  status: "ACTIVE" | "COMPLETED" | string;
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  trainerName: string | null;
  attestationUrl: string | null;
}

export interface CalendarItem {
  id: string;
  formationId: string;
  formationTitle: string;
  title: string;
  /** Heure locale du site (ex. 2026-11-14T18:00:00). */
  startsAt: string;
  timeLabel: string;
  place: string | null;
  joinUrl: string | null;
  past: boolean;
}

export interface ResourceEntry {
  id: string;
  name: string;
  fileType: string;
  sizeLabel: string | null;
  note: string | null;
  /** Nul tant que la ressource est verrouillée. */
  url: string | null;
  locked: boolean;
  formationId: string;
  formationTitle: string;
  moduleTitle: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
}

export const learnerService = {
  profile: (): Promise<LearnerProfile> => httpClient.get<LearnerProfile>("/learner/profile"),

  updateProfile: (payload: UpdateLearnerProfile): Promise<LearnerProfile> =>
    httpClient.put<LearnerProfile>("/learner/profile", payload),

  /** Premier mot de passe d'un compte qui n'en a pas (409 s'il en existe déjà un). */
  setFirstPassword: async (newPassword: string): Promise<void> => {
    await httpClient.put<void>("/learner/password", { newPassword });
  },

  payments: async (): Promise<LearnerPayment[]> => (await httpClient.get<LearnerPayment[]>("/learner/payments")) ?? [],

  receipt: (paymentId: string): Promise<Blob> => httpClient.getBlob(`/learner/payments/${paymentId}/receipt`),

  enrollments: async (): Promise<LearnerEnrollment[]> => (await httpClient.get<LearnerEnrollment[]>("/learner/enrollments")) ?? [],

  attestation: (formationId: string): Promise<Blob> => httpClient.getBlob(`/learner/enrollments/${formationId}/attestation`),

  calendar: async (): Promise<CalendarItem[]> => (await httpClient.get<CalendarItem[]>("/learner/calendar")) ?? [],

  resources: async (): Promise<ResourceEntry[]> => (await httpClient.get<ResourceEntry[]>("/learner/resources")) ?? [],
};
