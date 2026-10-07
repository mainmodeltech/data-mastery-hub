import { ApiError } from "@/services/httpClient";

/** Message lisible pour un échec d'envoi de formulaire public (429, validation, réseau…). */
export function submitErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "Trop de tentatives. Réessayez dans une heure ou écrivez-nous sur WhatsApp.";
    if (err.status === 400) {
      const fields = (err.body as { validationErrors?: Record<string, string> } | undefined)?.validationErrors;
      const first = fields ? Object.values(fields)[0] : undefined;
      return first ?? (err.message && !/^Erreur \d+$/.test(err.message) ? err.message : "Certaines informations sont invalides. Vérifiez le formulaire.");
    }
    if (err.status >= 500) return "Le service est momentanément indisponible. Réessayez dans quelques instants.";
  }
  return "Envoi impossible. Vérifiez votre connexion et réessayez.";
}
