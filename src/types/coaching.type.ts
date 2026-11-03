/**
 * coaching.type.ts — demandes de coaching et leur paiement.
 * Contrat : modeltech-backend PublicCoachingController (/coaching-requests, /coaching/payments/{jeton}) et AdminCoachingController
 * (/admin/coaching-requests). Les montants sont en francs CFA (XOF, entiers) ; le prix est fixé par l'équipe à la validation.
 */
import type { ManualMethod, OrderChannel } from "@/types/simulatorShop.type";

export type CoachingStatus = "NEW" | "IN_REVIEW" | "AWAITING_PAYMENT" | "PAYMENT_DECLARED" | "PAID" | "DECLINED" | "CANCELLED" | "EXPIRED";

export const COACHING_STATUS_LABELS: Record<CoachingStatus, string> = {
  NEW: "Nouvelle",
  IN_REVIEW: "En analyse",
  AWAITING_PAYMENT: "En attente de paiement",
  PAYMENT_DECLARED: "Paiement à vérifier",
  PAID: "Payée",
  DECLINED: "Refusée",
  CANCELLED: "Annulée",
  EXPIRED: "Lien expiré",
};

// ── Public ──────────────────────────────────────────────────────────────

export interface CoachingRequestForm {
  firstName: string; lastName?: string; email: string; phone?: string; company?: string;
  tier?: string; slot?: string; message?: string; acceptTerms: boolean;
}

/** `bookingUrl` : lien de réservation d'un échange de présentation (15 à 20 minutes), absent s'il n'est pas configuré. */
export interface CoachingRequestReceipt { message: string; bookingUrl: string | null }

export interface CoachingPayOptions { online: boolean; manual: boolean; fallback: boolean; reason: string | null; onlineFeeXof: number; onlineTotalXof: number }

/** Ce que voit le détenteur du lien de paiement : jamais d'e-mail, de téléphone ni de note interne. */
export interface CoachingPayView {
  firstName: string; offerLabel: string; trainerName: string; status: CoachingStatus; amountXof: number; options: CoachingPayOptions;
  declaredMethod: ManualMethod | null; proofUploaded: boolean; rejectNote: string | null; paidChannel: OrderChannel | null; receiptUrl: string | null;
  bookingUrl: string | null; expiresAt: string | null;
}

export interface CoachingStartResponse { checkoutRef: string; checkoutUrl: string }

export interface CoachingCheckoutView { ref: string; status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED"; chargedXof: number; receiptUrl: string | null }

// ── Administration ──────────────────────────────────────────────────────

export interface CoachingRequestView {
  id: string; firstName: string; lastName: string | null; email: string; phone: string | null; company: string | null; tier: string | null; slot: string | null;
  message: string | null; termsAcceptedAt: string; status: CoachingStatus; assignedTo: string | null; trainerEmail: string | null; trainerName: string | null;
  internalNotes: string | null; closingReason: string | null; offerLabel: string | null; amountXof: number | null; validatedBy: string | null; validatedAt: string | null;
  paymentLink: string | null; tokenExpiresAt: string | null; manualMethod: ManualMethod | null; manualReference: string | null; declaredAt: string | null;
  proofUploaded: boolean; rejectNote: string | null; confirmedBy: string | null; confirmedAt: string | null; paidAt: string | null;
  paidAmountXof: number | null; paidChannel: OrderChannel | null; createdAt: string;
}

export interface CoachingReviewUpdate { trainerEmail?: string; trainerName?: string; internalNotes?: string }

export interface CoachingValidatePayload {
  offerLabel: string; amountXof: number; trainerName: string; trainerEmail?: string; internalNotes?: string; trainerConfirmed: boolean;
}

export type CoachingSummary = { counts: Record<CoachingStatus, number> };
