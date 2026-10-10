import { useCallback, useEffect, useRef, useState } from "react";

import { OFFLINE_CACHE_NAME, removeOfflineMeta, saveOfflineMeta } from "@/lib/offlineLibrary";

/**
 * Vidéos disponibles hors ligne : le fichier d'une vidéo hébergée directement (champ `videoUrl`) est copié dans le
 * stockage du navigateur (Cache Storage) à la demande de l'apprenant, puis lu depuis cette copie.
 * Limite assumée : les vidéos intégrées depuis Vimeo / YouTube ne sont pas téléchargeables.
 */
const CACHE_NAME = OFFLINE_CACHE_NAME;

type OfflineState = "unsupported" | "checking" | "none" | "downloading" | "ready" | "error";

export function useOfflineVideo(url: string | null | undefined, meta?: { title: string; formationTitle: string }) {
  const supported = typeof window !== "undefined" && "caches" in window;
  const [state, setState] = useState<OfflineState>(supported ? "checking" : "unsupported");
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [sizeLabel, setSizeLabel] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);

  const release = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  };

  const load = useCallback(async () => {
    if (!supported || !url) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(url);
      if (hit) {
        const blob = await hit.blob();
        release();
        objectUrl.current = URL.createObjectURL(blob);
        setLocalUrl(objectUrl.current);
        setSizeLabel(`${(blob.size / (1024 * 1024)).toFixed(1)} Mo`);
        setState("ready");
      } else {
        setLocalUrl(null);
        setState("none");
      }
    } catch {
      setState("error");
    }
  }, [supported, url]);

  useEffect(() => {
    if (supported && url) { setState("checking"); void load(); }
    return release;
  }, [supported, url, load]);

  const download = useCallback(async () => {
    if (!supported || !url) return;
    setState("downloading");
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response);
      if (meta) saveOfflineMeta({ url, title: meta.title, formationTitle: meta.formationTitle });
      await load();
    } catch {
      setState("error");
    }
  }, [supported, url, load, meta?.title, meta?.formationTitle]);

  const remove = useCallback(async () => {
    if (!supported || !url) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);
    } finally {
      removeOfflineMeta(url);
      release();
      setLocalUrl(null);
      setSizeLabel(null);
      setState("none");
    }
  }, [supported, url]);

  return { state, localUrl, sizeLabel, download, remove };
}
