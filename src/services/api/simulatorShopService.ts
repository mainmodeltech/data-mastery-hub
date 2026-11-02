/**
 * simulatorShopService.ts — forfaits et achat en ligne du simulateur (routes publiques, sans jeton).
 * L'achat redirige vers la page de paiement du prestataire ; l'accès ne s'ouvre qu'une fois le paiement confirmé côté serveur.
 */
import { httpClient } from "@/services/httpClient";
import type { OrderStatusView, PlansView, PurchaseRequest, PurchaseResponse } from "@/types/simulatorShop.type";

interface ApiResponse<T> { success: boolean; message: string; data: T }

export const simulatorShopService = {
  plans: async (): Promise<PlansView> => (await httpClient.get<ApiResponse<PlansView>>("/simulator/plans", { skipAuth: true })).data,

  order: async (body: PurchaseRequest): Promise<PurchaseResponse> =>
    (await httpClient.post<ApiResponse<PurchaseResponse>>("/simulator/orders", body, { skipAuth: true })).data,

  status: async (ref: string): Promise<OrderStatusView> =>
    (await httpClient.get<ApiResponse<OrderStatusView>>(`/simulator/orders/${encodeURIComponent(ref)}`, { skipAuth: true })).data,
};
