/**
 * simulatorShop.type.ts — forfaits en vente, achat en ligne et suivi de commande du simulateur.
 * Contrat : modeltech-backend PublicSimulatorOrderController (/simulator/plans, /simulator/orders) et AdminSimulatorOrderController.
 * Les montants sont en francs CFA (XOF, entiers). Le prix facturé vient toujours du serveur.
 */
import type { PlanCode } from "@/types/simulator.type";

export type OrderStatus = "PENDING" | "DECLARED" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  DECLARED: "À vérifier",
  PAID: "Payée",
  FAILED: "Échec",
  CANCELLED: "Annulée",
  EXPIRED: "Abandonnée",
};

export type OrderChannel = "ONLINE" | "MANUAL";
export type ManualMethod = "WAVE" | "ORANGE_MONEY" | "VIREMENT";

export const MANUAL_METHOD_LABELS: Record<ManualMethod, string> = { WAVE: "Wave", ORANGE_MONEY: "Orange Money", VIREMENT: "Virement bancaire" };

/** `onlineFeeXof` : frais répercutés sur un paiement en ligne (0 s'ils sont absorbés) ; `onlineTotalXof` : montant encaissé en ligne. */
export interface ShopPlan {
  code: PlanCode; name: string; priceXof: number; durationDays: number; examAttempts: number; onlineFeeXof: number; onlineTotalXof: number;
}

/**
 * `online` / `manual` : moyens de paiement proposés. `fallback` : le paiement en ligne est indisponible (coupé ou en panne) et le
 * manuel le remplace ; `fallbackReason` est alors un message prêt à afficher. Au moins l'un des deux est toujours vrai.
 */
export interface PlansView { online: boolean; manual: boolean; fallback: boolean; fallbackReason: string | null; plans: ShopPlan[] }

export interface PurchaseRequest {
  plan: PlanCode; channel?: OrderChannel; firstName: string; lastName?: string; email: string; phone?: string; acceptTerms: boolean;
  /** Versions des textes légaux affichées (le serveur vérifie qu'elles sont en vigueur) ; absent tant que rien n'est publié. */
  acceptedDocuments?: string[];
}

/** `checkoutUrl` est nul pour un paiement manuel : l'acheteur est dirigé vers la page de suivi, qui affiche les consignes. */
export interface PurchaseResponse { orderRef: string; checkoutUrl: string | null; channel: OrderChannel }

export interface DeclareRequest { method: ManualMethod; reference: string }

/** Ce que voit l'acheteur à partir de la référence de sa commande : adresse e-mail masquée, jamais de jeton. */
export interface OrderStatusView {
  ref: string; status: OrderStatus; plan: PlanCode; planName: string; amountXof: number; chargedXof: number; feeXof: number;
  channel: OrderChannel; emailHint: string; receiptUrl: string | null;
  declaredMethod: ManualMethod | null; proofUploaded: boolean;
  /** Motif d'un refus de l'équipe (paiement manuel renvoyé à « en attente »). */
  note: string | null;
}

// ── Administration ──────────────────────────────────────────────────────

export interface AdminPlan {
  code: PlanCode; name: string; priceXof: number; durationDays: number; examAttempts: number; active: boolean;
  updatedAt: string | null; updatedBy: string | null;
}

export interface PlanUpdate { name: string; priceXof: number; durationDays: number; examAttempts: number; active: boolean }

export interface AdminOrder {
  id: string; ref: string; learnerEmail: string; learnerName: string; plan: PlanCode; planName: string;
  amountXof: number; feeXof: number; chargedXof: number; channel: OrderChannel;
  status: OrderStatus; provider: string; providerMode: string | null; providerToken: string | null; failureReason: string | null;
  manualMethod: ManualMethod | null; manualReference: string | null; declaredAt: string | null; proofUploaded: boolean; confirmedBy: string | null;
  grantId: string | null; createdAt: string; paidAt: string | null;
}

export interface GatewayStatus { provider: string; configured: boolean; mode: string; notificationUrl: string }
