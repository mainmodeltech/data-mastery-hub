/**
 * Bascule vers les données de démonstration quand un endpoint est absent côté backend.
 * Uniquement si l'endpoint renvoie 404/501 ET que l'environnement l'autorise (build dev ou
 * VITE_ENABLE_DEMO_DATA=true). Une panne réseau ou une 5xx n'affiche jamais de données fictives.
 */
import { ApiError } from "./httpClient";
import type { WithDemo } from "@/types/course.type";

export const DEMO_ALLOWED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_DATA === "true";

export function endpointMissing(e: unknown): boolean {
  return e instanceof ApiError && (e.status === 404 || e.status === 501);
}

export async function withDemo<T>(real: () => Promise<T>, demo: () => T): Promise<WithDemo<T>> {
  try {
    return { data: await real(), demo: false };
  } catch (e) {
    if (DEMO_ALLOWED && endpointMissing(e)) return { data: demo(), demo: true };
    throw e;
  }
}
