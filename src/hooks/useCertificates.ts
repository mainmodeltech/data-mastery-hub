import { useMutation, useQuery } from "@tanstack/react-query";

import { certificateService } from "@/services/api/certificateService";

export const CERTIFICATE_KEYS = {
  verify: (publicId: string) => ["certificate", "verify", publicId] as const,
  mine: ["learner", "certificates"] as const,
};

/** Vérification publique : pas de nouvelle tentative (404 = numéro inconnu). */
export function useVerifyCertificate(publicId: string | undefined) {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.verify(publicId ?? ""),
    queryFn: () => certificateService.verify(publicId as string),
    enabled: !!publicId,
    retry: false,
  });
}

export function useMyCertificates() {
  return useQuery({ queryKey: CERTIFICATE_KEYS.mine, queryFn: certificateService.listMine, staleTime: 60 * 1000 });
}

/** Télécharge le PDF (le blob n'est jamais mis en cache). */
export function useDownloadCertificatePdf() {
  return useMutation({ mutationFn: (publicId: string) => certificateService.downloadPdf(publicId) });
}
