/**
 * siteFormsService.ts — formulaires publics du site (diagnostic entreprise, candidature partenaire,
 * newsletter). Contrat : modeltech-backend PublicDiagnosticRequestController (/diagnostic-requests),
 * PublicPartnerApplicationController (/partner-applications) et PublicNewsletterController
 * (/newsletter/subscriptions). Le backend attend des CODES (pas les libellés) pour peopleCount/need/domain.
 * Limite : 10 envois par heure et par IP (429).
 */
import { httpClient } from "@/services/httpClient";

export const PEOPLE_COUNTS = [
  { code: "RANGE_1_5", label: "1 à 5" },
  { code: "RANGE_6_15", label: "6 à 15" },
  { code: "RANGE_16_50", label: "16 à 50" },
  { code: "OVER_50", label: "Plus de 50" },
] as const;

export const TRAINING_NEEDS = [
  { code: "EXCEL_UPGRADE", label: "Mise à niveau Excel" },
  { code: "POWER_BI_CUSTOM", label: "Power BI sur mesure" },
  { code: "DATA_PATH_CUSTOM", label: "Parcours data sur mesure" },
  { code: "UNDECIDED", label: "Je ne sais pas encore" },
] as const;

export const PARTNER_DOMAINS = [
  { code: "PROJECT_AGILE", label: "Gestion de projet & Agile" },
  { code: "APPLIED_AI", label: "IA appliquée" },
  { code: "FINANCE_CONTROL", label: "Finance & contrôle de gestion" },
  { code: "CYBERSECURITY", label: "Cybersécurité" },
  { code: "COMMUNICATION_LEADERSHIP", label: "Communication & leadership" },
  { code: "OTHER", label: "Autre domaine" },
] as const;

/** Sépare « Prénom Nom » ; le nom de famille est facultatif côté backend. */
export function splitName(fullName: string): { firstName: string; lastName?: string } {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: first || fullName.trim(), lastName: rest.length ? rest.join(" ") : undefined };
}

export interface DiagnosticRequestPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  peopleCount: (typeof PEOPLE_COUNTS)[number]["code"];
  need: (typeof TRAINING_NEEDS)[number]["code"];
  context?: string;
}

export interface PartnerApplicationPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  organization?: string;
  domain: (typeof PARTNER_DOMAINS)[number]["code"];
  linkedinUrl?: string;
  proposal: string;
  references?: string;
}

export const siteFormsService = {
  sendDiagnostic: (payload: DiagnosticRequestPayload) =>
    httpClient.post<unknown>("/diagnostic-requests", payload, { skipAuth: true }),

  sendPartnerApplication: (payload: PartnerApplicationPayload) =>
    httpClient.post<unknown>("/partner-applications", payload, { skipAuth: true }),

  subscribeNewsletter: (email: string, source?: string) =>
    httpClient.post<unknown>("/newsletter/subscriptions", { email, source }, { skipAuth: true }),

  confirmNewsletter: (token: string) =>
    httpClient.post<unknown>("/newsletter/subscriptions/confirm", { token }, { skipAuth: true }),

  unsubscribeNewsletter: (token: string) =>
    httpClient.post<unknown>("/newsletter/subscriptions/unsubscribe", { token }, { skipAuth: true }),
};
