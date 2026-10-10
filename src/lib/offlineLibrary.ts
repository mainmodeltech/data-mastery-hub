/**
 * Bibliothèque hors ligne : métadonnées (titre, formation, taille) des vidéos copiées dans le Cache Storage,
 * mémorisées sur l'appareil pour pouvoir les lister sans réseau.
 */
export const OFFLINE_CACHE_NAME = "mt-offline-v1";
const META_KEY = "mt-offline-meta";

export interface OfflineVideoMeta {
  url: string;
  title: string;
  formationTitle: string;
  savedAt: string;
}

export function readOfflineMeta(): OfflineVideoMeta[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as OfflineVideoMeta[]) : [];
  } catch {
    return [];
  }
}

function writeOfflineMeta(items: OfflineVideoMeta[]): void {
  try { localStorage.setItem(META_KEY, JSON.stringify(items)); } catch { /* stockage indisponible */ }
}

export function saveOfflineMeta(meta: Omit<OfflineVideoMeta, "savedAt">): void {
  const others = readOfflineMeta().filter((m) => m.url !== meta.url);
  writeOfflineMeta([{ ...meta, savedAt: new Date().toISOString() }, ...others]);
}

export function removeOfflineMeta(url: string): void {
  writeOfflineMeta(readOfflineMeta().filter((m) => m.url !== url));
}
