import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { legalAdminService, legalLearnerService, legalPublicService } from "@/services/api/legalService";
import type { LegalCode, LegalContext, LegalPublish, LegalSaveDraft } from "@/types/legal.type";

// ── Public ──────────────────────────────────────────────────────────────

export function useLegalDocument(code: LegalCode) {
  return useQuery({ queryKey: ["legal", "document", code], queryFn: () => legalPublicService.document(code), retry: false, staleTime: 5 * 60 * 1000 });
}

/**
 * Textes publiés à accepter pour un acte. Toujours relus à l'ouverture du formulaire : une version publiée entre-temps doit être celle que le
 * client voit (le serveur refuse de toute façon une version périmée).
 */
export function useLegalRequirements(context: LegalContext) {
  return useQuery({
    queryKey: ["legal", "requirements", context], queryFn: () => legalPublicService.requirements(context),
    staleTime: 0, refetchOnMount: "always", refetchOnWindowFocus: true, retry: 1,
  });
}

/** Identifiants des versions affichées : à joindre à la soumission (`acceptedDocuments`). Vide tant que rien n'est publié. */
export function useLegalAcceptedIds(context: LegalContext): string[] | undefined {
  const { data } = useLegalRequirements(context);
  return data && data.documents.length > 0 ? data.documents.map((d) => d.id) : undefined;
}

// ── Apprenant ───────────────────────────────────────────────────────────

const PENDING_KEY = ["legal", "learner", "pending"] as const;

export function useLearnerLegalPending(enabled: boolean) {
  return useQuery({ queryKey: PENDING_KEY, queryFn: legalLearnerService.pending, enabled, staleTime: 0, retry: 1 });
}

export function useAcceptLearnerLegal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documents: string[]) => legalLearnerService.accept(documents),
    onSuccess: (remaining) => qc.setQueryData(PENDING_KEY, remaining),
  });
}

// ── Administration ──────────────────────────────────────────────────────

const ADMIN = ["admin", "legal"] as const;

export function useLegalOverview() {
  return useQuery({ queryKey: [...ADMIN, "overview"], queryFn: legalAdminService.overview, staleTime: 0 });
}

function useAdminMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN });
      qc.invalidateQueries({ queryKey: ["legal"] });   // les pages publiques et les cases d'acceptation relisent la version en vigueur
    },
  });
}

export const useSaveLegalDraft = () => useAdminMutation(({ code, body }: { code: LegalCode; body: LegalSaveDraft }) => legalAdminService.saveDraft(code, body));
export const useDiscardLegalDraft = () => useAdminMutation((code: LegalCode) => legalAdminService.discardDraft(code));
export const usePublishLegal = () => useAdminMutation(({ code, body }: { code: LegalCode; body: LegalPublish }) => legalAdminService.publish(code, body));

export function useLegalAcceptances(email: string | undefined, code: LegalCode | undefined, page: number) {
  return useQuery({
    queryKey: [...ADMIN, "acceptances", email ?? "", code ?? "all", page], queryFn: () => legalAdminService.acceptances(email, code, page),
    placeholderData: (prev) => prev, staleTime: 0,
  });
}
