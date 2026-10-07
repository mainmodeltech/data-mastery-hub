import { useMutation } from "@tanstack/react-query";

import {
  siteFormsService,
  type DiagnosticRequestPayload,
  type PartnerApplicationPayload,
} from "@/services/api/siteFormsService";

export function useSendDiagnostic() {
  return useMutation({ mutationFn: (p: DiagnosticRequestPayload) => siteFormsService.sendDiagnostic(p) });
}

export function useSendPartnerApplication() {
  return useMutation({ mutationFn: (p: PartnerApplicationPayload) => siteFormsService.sendPartnerApplication(p) });
}

export function useSubscribeNewsletter() {
  return useMutation({ mutationFn: ({ email, source }: { email: string; source?: string }) => siteFormsService.subscribeNewsletter(email, source) });
}

export function useConfirmNewsletter() {
  return useMutation({ mutationFn: (token: string) => siteFormsService.confirmNewsletter(token) });
}

export function useUnsubscribeNewsletter() {
  return useMutation({ mutationFn: (token: string) => siteFormsService.unsubscribeNewsletter(token) });
}
