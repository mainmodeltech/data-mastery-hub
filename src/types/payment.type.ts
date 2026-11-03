/**
 * payment.type.ts — acceptation des candidatures, échéances et lien de paiement.
 * Contrat : modeltech-backend AdminRegistrationController (/admin/registrations/{id}/accept|reject|payments),
 * AdminPaymentController (/admin/payments, /admin/enrollments) et PublicPaymentController (/payments/{token}).
 * Ces endpoints répondent en ApiResponse<T>.
 */

export type PaymentStatus = "PENDING" | "DECLARED" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "REFUNDED";
/** PAYDUNYA : payé en ligne, posé par le serveur après relecture chez le prestataire (jamais saisi ni déclaré à la main). */
export type PaymentMethod = "WAVE" | "ORANGE_MONEY" | "VIREMENT" | "ENTREPRISE" | "ESPECES" | "PAYDUNYA";
export type PayerType = "INDIVIDUAL" | "COMPANY";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  VIREMENT: "Virement bancaire",
  ENTREPRISE: "Facture entreprise",
  ESPECES: "Espèces",
  PAYDUNYA: "Paiement en ligne",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "À payer",
  DECLARED: "À confirmer",
  CONFIRMED: "Confirmé",
  REJECTED: "Refusé",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};

export interface AdminPayment {
  id: string;
  registrationId: string;
  firstName: string;
  lastName: string;
  email: string;
  bootcampTitle: string | null;
  sessionName: string | null;
  amount: number;
  currency: string;
  installmentNumber: number;
  installmentCount: number;
  dueDate: string | null;
  status: PaymentStatus;
  method: PaymentMethod | null;
  reference: string | null;
  declaredAt: string | null;
  paidAt: string | null;
  confirmedAt: string | null;
  confirmedBy: string | null;
  rejectionReason: string | null;
  proofUrl: string | null;
  invoiceRef: string | null;
  purchaseOrderRef: string | null;
  notes: string | null;
  reminderCount: number;
  lastReminderAt: string | null;
  refundedAt?: string | null;
  refundReason?: string | null;
  /** Qui a saisi ce paiement reçu hors site (il ne le confirme pas lui-même s'il existe une autre personne habilitée). */
  recordedBy?: string | null;
  /** Confirmé par la personne qui l'avait saisi, faute d'une autre personne habilitée. */
  confirmedUnchecked?: boolean;
  /** Demande de remboursement en attente de validation par une autre personne. */
  refundRequestedAt?: string | null;
  refundRequestedBy?: string | null;
  refundRequestReason?: string | null;
  /** Remboursé sans second contrôle. */
  refundUnchecked?: boolean;
  /** Lien à communiquer au candidat */
  paymentLink: string | null;
  createdAt: string;
}

export interface AcceptInstallment {
  /** Absent : répartition égale */
  amount?: number;
  dueDate: string;
}

export interface AcceptRegistrationPayload {
  payerType?: PayerType;
  /** Absent : calculé depuis la formation/session ; obligatoire si aucun prix numérique n'existe */
  totalAmount?: number;
  installments?: AcceptInstallment[];
  invoiceRef?: string;
  purchaseOrderRef?: string;
}

export interface ManualPaymentPayload {
  installmentNumber?: number;
  method: PaymentMethod;
  reference?: string;
  invoiceRef?: string;
  purchaseOrderRef?: string;
  notes?: string;
}

export interface AdminEnrollment {
  id: string;
  learnerId: string;
  learnerEmail: string;
  learnerName: string;
  registrationId: string;
  sessionId: string;
  sessionName: string | null;
  bootcampTitle: string | null;
  status: "ACTIVE" | "SUSPENDED" | "COMPLETED" | "CANCELLED";
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  createdAt: string;
}

// ─── Lien de paiement public (/paiement/:token) ──────────────────────────────

export interface PublicPayment {
  firstName: string;
  bootcampTitle: string | null;
  sessionName: string | null;
  sessionStartDate: string | null;
  amount: number;
  currency: string;
  installmentNumber: number;
  installmentCount: number;
  dueDate: string | null;
  status: PaymentStatus;
  method: PaymentMethod | null;
  reference: string | null;
  hasProof: boolean | null;
  rejectionReason: string | null;
  /** true quand une facture en vigueur existe (GET /payments/{token}/invoice) */
  invoiceAvailable?: boolean;
  totalAmount: number;
  schedule: { installmentNumber: number; amount: number; dueDate: string | null; status: PaymentStatus }[];
  payTo: { phone: string | null; methods: PaymentMethod[] };
  /** Moyens proposés et montants (frais compris) d'une échéance et du solde ; absent si le serveur ne les renseigne pas. */
  online?: OnlineOptions;
}

/** `amount` : prix du catalogue ; `fee` : frais répercutés (0 si absorbés) ; `total` : montant encaissé en ligne ; `count` : échéances couvertes. */
export interface OnlineAmounts { amount: number; fee: number; total: number; count: number }

/**
 * `online` / `manual` : moyens proposés (au moins un est toujours vrai). `fallback` : le paiement en ligne est indisponible et le manuel le
 * remplace (`reason` est alors un message prêt à afficher). `installment` : cette échéance seule ; `balance` : tout le solde, seulement s'il
 * reste au moins deux échéances à régler.
 */
export interface OnlineOptions {
  online: boolean; manual: boolean; fallback: boolean; reason?: string;
  installment?: OnlineAmounts; balance?: OnlineAmounts;
}

export type CheckoutScope = "INSTALLMENT" | "BALANCE";
export type CheckoutStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";

export interface StartCheckoutResponse { checkoutRef: string; checkoutUrl: string }

/** Suivi d'une tentative de paiement en ligne au retour du prestataire. */
export interface CheckoutView {
  ref: string; status: CheckoutStatus; scope: CheckoutScope; amountXof: number; feeXof: number; chargedXof: number;
  installments: number; receiptUrl?: string;
}

export interface DeclarePaymentPayload {
  method: Extract<PaymentMethod, "WAVE" | "ORANGE_MONEY" | "VIREMENT">;
  reference: string;
}

export function formatAmount(amount: number | null | undefined, currency = "XOF"): string {
  if (amount == null) return "—";
  const unit = currency === "XOF" ? "FCFA" : currency;
  return `${new Intl.NumberFormat("fr-FR").format(amount).replace(/ | /g, " ")} ${unit}`;
}
