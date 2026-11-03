import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { simulatorShopService } from "@/services/api/simulatorShopService";
import type { DeclareRequest, PurchaseRequest } from "@/types/simulatorShop.type";

/** Au-delà, on arrête de relancer le serveur : la commande reste « en attente » et le rapprochement automatique prend le relais. */
const MAX_POLLS = 60;

export function usePlans() {
  return useQuery({ queryKey: ["simulator", "plans"], queryFn: simulatorShopService.plans, staleTime: 60 * 1000, retry: 1 });
}

export function useCreateOrder() {
  return useMutation({ mutationFn: (body: PurchaseRequest) => simulatorShopService.order(body) });
}

/** L'acheteur indique comment il a payé (moyen + référence de la transaction) ; l'équipe vérifie ensuite. */
export function useDeclareOrder(ref: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DeclareRequest) => simulatorShopService.declare(ref as string, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["simulator", "order", ref] }),
  });
}

export function useUploadProof(ref: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => simulatorShopService.uploadProof(ref as string, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["simulator", "order", ref] }),
  });
}

/**
 * Suit une commande. En ligne : relancé toutes les 3 secondes tant qu'elle est en attente (le serveur relit alors le prestataire).
 * Manuel déclaré : relancé toutes les 15 secondes en attendant la confirmation de l'équipe. Manuel non déclaré : aucune relance.
 */
export function useOrderStatus(ref: string | null) {
  return useQuery({
    queryKey: ["simulator", "order", ref],
    queryFn: () => simulatorShopService.status(ref as string),
    enabled: !!ref,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d || query.state.dataUpdateCount >= MAX_POLLS) return false;
      if (d.channel === "ONLINE") return d.status === "PENDING" ? 3000 : false;
      return d.status === "DECLARED" ? 15000 : false;
    },
  });
}
