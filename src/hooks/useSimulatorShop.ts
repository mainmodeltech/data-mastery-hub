import { useMutation, useQuery } from "@tanstack/react-query";

import { simulatorShopService } from "@/services/api/simulatorShopService";
import type { PurchaseRequest } from "@/types/simulatorShop.type";

/** Au-delà, on arrête de relancer le serveur : la commande reste « en attente » et le rapprochement automatique prend le relais. */
const MAX_POLLS = 60;

export function usePlans() {
  return useQuery({ queryKey: ["simulator", "plans"], queryFn: simulatorShopService.plans, staleTime: 60 * 1000, retry: 1 });
}

export function useCreateOrder() {
  return useMutation({ mutationFn: (body: PurchaseRequest) => simulatorShopService.order(body) });
}

/** Suit une commande : relancé toutes les 3 secondes tant qu'elle est en attente (le serveur relit alors le prestataire). */
export function useOrderStatus(ref: string | null) {
  return useQuery({
    queryKey: ["simulator", "order", ref],
    queryFn: () => simulatorShopService.status(ref as string),
    enabled: !!ref,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" && query.state.dataUpdateCount < MAX_POLLS ? 3000 : false),
  });
}
