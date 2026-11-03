/**
 * paymentSettings.type.ts — réglages de paiement du back-office (réservés à la Direction).
 * Contrat : modeltech-backend AdminPaymentSettingsController (/admin/payment-settings). Aucune clé secrète n'y transite.
 */

export type PayableService = "SIMULATOR" | "REGISTRATION" | "COACHING";
export type PaymentMode = "MANUAL_ONLY" | "ONLINE_AND_MANUAL" | "ONLINE_ONLY";

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  MANUAL_ONLY: "Manuel seulement (Wave, Orange Money, virement)",
  ONLINE_AND_MANUAL: "En ligne ou manuel, au choix du client",
  ONLINE_ONLY: "En ligne (le manuel prend le relais en cas de problème)",
};

export interface ServiceSetting { service: PayableService; label: string; mode: PaymentMode; modeLabel: string; updatedAt: string | null; updatedBy: string | null }

/** `degraded` : la passerelle est en panne détectée, le manuel est proposé automatiquement quelques minutes. */
export interface GatewayInfo { provider: string; configured: boolean; mode: string; degraded: boolean; notificationUrl: string }

/** Défini par les variables d'environnement PAYMENTS_FEES_* : affiché pour information, non modifiable ici. */
export interface FeesInfo { mode: "ABSORB" | "PASS_ON"; percent: number; fixedXof: number }

export interface PaymentSettings {
  onlineEnabled: boolean; updatedAt: string | null; updatedBy: string | null;
  services: ServiceSetting[]; gateway: GatewayInfo; fees: FeesInfo;
}

/** Seuls les services présents dans `modes` sont modifiés ; le motif est obligatoire (consigné dans le journal d'audit). */
export interface PaymentSettingsUpdate { onlineEnabled: boolean; modes: Partial<Record<PayableService, PaymentMode>>; reason: string }
