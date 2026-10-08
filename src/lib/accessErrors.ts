import { ApiError } from "@/services/httpClient";

/**
 * Accès refusé (403) ou verrouillé (423) côté espace apprenant : le serveur explique pourquoi
 * (accès pas encore ouvert, expiré, quiz non réussi…). On affiche son message tel quel ; null si
 * l'erreur est d'une autre nature ou n'a pas de message exploitable.
 */
export function accessMessage(error: unknown): string | null {
  return error instanceof ApiError && (error.status === 403 || error.status === 423) && !/^Erreur \d+$/.test(error.message)
    ? error.message
    : null;
}
