/**
 * paymentSettingsService.ts — réglages de paiement (administration, droit PAYMENT_SETTINGS_MANAGE : Direction seulement).
 */
import { httpClient } from "@/services/httpClient";
import type { PaymentSettings, PaymentSettingsUpdate } from "@/types/paymentSettings.type";

interface ApiResponse<T> { success: boolean; message: string; data: T }

const base = "/admin/payment-settings";

export const paymentSettingsService = {
  get: async (): Promise<PaymentSettings> => (await httpClient.get<ApiResponse<PaymentSettings>>(base)).data,

  update: async (body: PaymentSettingsUpdate): Promise<PaymentSettings> => (await httpClient.put<ApiResponse<PaymentSettings>>(base, body)).data,

  /** Remet la passerelle « en service » après une panne détectée (le prochain paiement en ligne retente). */
  resetGateway: async (): Promise<PaymentSettings> => (await httpClient.post<ApiResponse<PaymentSettings>>(`${base}/gateway/reset`)).data,
};
