import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { paymentSettingsService } from "@/services/api/paymentSettingsService";
import type { PaymentSettingsUpdate } from "@/types/paymentSettings.type";

const KEY = ["payment-settings"] as const;

export function usePaymentSettings() {
  return useQuery({ queryKey: KEY, queryFn: paymentSettingsService.get, staleTime: 0, refetchInterval: 30_000 });
}

/** Un réglage change ce que voient aussitôt les visiteurs (boutons de paiement) : on rafraîchit aussi les forfaits publics. */
function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ["simulator", "plans"] });
  };
}

export function useUpdatePaymentSettings() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (body: PaymentSettingsUpdate) => paymentSettingsService.update(body), onSuccess: invalidate });
}

export function useResetGateway() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: () => paymentSettingsService.resetGateway(), onSuccess: invalidate });
}
