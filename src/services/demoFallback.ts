/**
 * Bascule vers les données de démonstration quand un endpoint est absent côté backend.
 * Uniquement si l'endpoint renvoie 404/501 ET que l'environnement l'autorise (build dev ou
 * VITE_ENABLE_DEMO_DATA=true). Une panne réseau ou une 5xx n'affiche jamais de données fictives.
 */
import { ApiError } from "./httpClient";
import type { WithDemo } from "@/types/course.type";

export const DEMO_ALLOWED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_DATA === "true";

/**
 * Endpoint absent : 404/501, ou le 500 que le backend Spring renvoie pour une route inexistante
 * (NoResourceFoundException rattrapée par le handler global : « No static resource … »).
 * Toute autre 5xx reste une vraie panne et n'affiche jamais de données fictives.
 */
export function endpointMissing(e: unknown): boolean {
  if (!(e instanceof ApiError)) return false;
  if (e.status === 404 || e.status === 501) return true;
  return e.status === 500 && /^No (static resource|endpoint)/i.test(e.message);
}

export async function withDemo<T>(real: () => Promise<T>, demo: () => T): Promise<WithDemo<T>> {
  try {
    return { data: await real(), demo: false };
  } catch (e) {
    if (DEMO_ALLOWED && endpointMissing(e)) return { data: demo(), demo: true };
    throw e;
  }
}
