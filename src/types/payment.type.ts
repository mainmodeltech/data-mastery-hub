/**
 * payment.type.ts — acceptation des candidatures, échéances et lien de paiement.
 * Contrat : modeltech-backend AdminRegistrationController (/admin/registrations/{id}/accept|reject|payments),
 * AdminPaymentController (/admin/payments, /admin/enrollments) et PublicPaymentController (/payments/{token}).
 * Ces endpoints répondent en ApiResponse<T>.
 */

export type PaymentStatus = "PENDING" | "DECLARED" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type PaymentMethod = "WAVE" | "ORANGE_MONEY" | "VIREMENT" | "ENTREPRISE" | "ESPECES";
export type PayerType = "INDIVIDUAL" | "COMPANY";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  VIREMENT: "Virement bancaire",
  ENTREPRISE: "Facture entreprise",
  ESPECES: "Espèces",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "À payer",
  DECLARED: "À confirmer",
  CONFIRMED: "Confirmé",
  REJECTED: "Refusé",
  CANCELLED: "Annulé",
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
  totalAmount: number;
  schedule: { installmentNumber: number; amount: number; dueDate: string | null; status: PaymentStatus }[];
  payTo: { phone: string | null; methods: PaymentMethod[] };
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
