/**
 * simulatorShopService.ts — forfaits et achat du simulateur (routes publiques, sans jeton).
 * En ligne : redirection vers la page de paiement du prestataire. Manuel (Wave, Orange Money, virement) : l'acheteur déclare son
 * paiement puis l'équipe le confirme. Dans les deux cas, l'accès ne s'ouvre qu'une fois le paiement confirmé côté serveur.
 */
import { httpClient } from "@/services/httpClient";
import type { DeclareRequest, OrderStatusView, PlansView, PurchaseRequest, PurchaseResponse } from "@/types/simulatorShop.type";

interface ApiResponse<T> { success: boolean; message: string; data: T }

export const simulatorShopService = {
  plans: async (): Promise<PlansView> => (await httpClient.get<ApiResponse<PlansView>>("/simulator/plans", { skipAuth: true })).data,

  order: async (body: PurchaseRequest): Promise<PurchaseResponse> =>
    (await httpClient.post<ApiResponse<PurchaseResponse>>("/simulator/orders", body, { skipAuth: true })).data,

  declare: async (ref: string, body: DeclareRequest): Promise<OrderStatusView> =>
    (await httpClient.post<ApiResponse<OrderStatusView>>(`/simulator/orders/${encodeURIComponent(ref)}/declare`, body, { skipAuth: true })).data,

  uploadProof: async (ref: string, file: File): Promise<OrderStatusView> => {
    const form = new FormData();
    form.append("file", file);
    return (await httpClient.post<ApiResponse<OrderStatusView>>(`/simulator/orders/${encodeURIComponent(ref)}/proof`, form, { skipAuth: true })).data;
  },

  status: async (ref: string): Promise<OrderStatusView> =>
    (await httpClient.get<ApiResponse<OrderStatusView>>(`/simulator/orders/${encodeURIComponent(ref)}`, { skipAuth: true })).data,
};
