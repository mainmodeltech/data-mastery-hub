/**
 * simulatorShop.type.ts — forfaits en vente, achat en ligne et suivi de commande du simulateur.
 * Contrat : modeltech-backend PublicSimulatorOrderController (/simulator/plans, /simulator/orders) et AdminSimulatorOrderController.
 * Les montants sont en francs CFA (XOF, entiers). Le prix facturé vient toujours du serveur.
 */
import type { PlanCode } from "@/types/simulator.type";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  FAILED: "Échec",
  CANCELLED: "Annulée",
  EXPIRED: "Abandonnée",
};

export interface ShopPlan { code: PlanCode; name: string; priceXof: number; durationDays: number; examAttempts: number }

/** `paymentsEnabled` est faux tant que la passerelle n'est pas configurée : la page n'affiche alors pas de bouton « Acheter ». */
export interface PlansView { paymentsEnabled: boolean; plans: ShopPlan[] }

export interface PurchaseRequest {
  plan: PlanCode; firstName: string; lastName?: string; email: string; phone?: string; acceptTerms: boolean;
}

export interface PurchaseResponse { orderRef: string; checkoutUrl: string }

/** Ce que voit l'acheteur à partir de la référence de sa commande : adresse e-mail masquée, jamais de jeton. */
export interface OrderStatusView {
  ref: string; status: OrderStatus; plan: PlanCode; planName: string; amountXof: number; emailHint: string; receiptUrl: string | null;
}

// ── Administration ──────────────────────────────────────────────────────

export interface AdminPlan {
  code: PlanCode; name: string; priceXof: number; durationDays: number; examAttempts: number; active: boolean;
  updatedAt: string | null; updatedBy: string | null;
}

export interface PlanUpdate { name: string; priceXof: number; durationDays: number; examAttempts: number; active: boolean }

export interface AdminOrder {
  id: string; ref: string; learnerEmail: string; learnerName: string; plan: PlanCode; planName: string; amountXof: number;
  status: OrderStatus; provider: string; providerMode: string | null; providerToken: string | null; failureReason: string | null;
  grantId: string | null; createdAt: string; paidAt: string | null;
}

export interface GatewayStatus { provider: string; configured: boolean; mode: string; notificationUrl: string }
