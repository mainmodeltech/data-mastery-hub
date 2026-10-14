import type { RegistrationStatus } from "@/types";
import type { RegistrationStage } from "@/services/api/registrationService";

export const STAGES: { key: RegistrationStage; label: string; empty: string }[] = [
  { key: "NEW", label: "Nouvelles", empty: "Aucune nouvelle candidature à examiner." },
  { key: "AWAITING_PAYMENT", label: "Paiement en attente", empty: "Aucun paiement en attente." },
  { key: "TO_CONFIRM", label: "À confirmer", empty: "Aucun paiement à vérifier." },
  { key: "ENROLLED", label: "Inscrits", empty: "Aucun inscrit pour le moment." },
  { key: "ARCHIVED", label: "Archives", empty: "Aucune candidature refusée ou annulée." },
];

export function stageLabel(stage: RegistrationStage): string {
  return STAGES.find((s) => s.key === stage)?.label ?? stage;
}

export function stageOf(status: RegistrationStatus): RegistrationStage {
  switch (status) {
    case "PENDING": return "NEW";
    case "PAYMENT_PENDING": return "AWAITING_PAYMENT";
    case "PAYMENT_TO_CONFIRM": return "TO_CONFIRM";
    case "CONFIRMED":
    case "COMPLETED": return "ENROLLED";
    default: return "ARCHIVED";
  }
}

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: "Nouvelle",
  PAYMENT_PENDING: "Paiement en attente",
  PAYMENT_TO_CONFIRM: "Paiement à confirmer",
  CONFIRMED: "Inscrit",
  COMPLETED: "Terminé",
  CANCELLED: "Annulée",
  REJECTED: "Refusée",
};
