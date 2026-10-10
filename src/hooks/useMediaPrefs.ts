import { useCallback, useEffect, useState } from "react";

/**
 * Préférences de lecture (mode économie de données, audio seul), mémorisées sur l'appareil.
 * Économie de données : la vidéo ne se charge qu'à la demande et en basse qualité quand le lecteur le permet.
 * Audio seul : le lecteur est réduit à sa barre de contrôle (lecture du son sans afficher l'image).
 */
const KEY = "mt-media-prefs";

interface MediaPrefs {
  dataSaver: boolean;
  audioOnly: boolean;
}

const DEFAULTS: MediaPrefs = { dataSaver: false, audioOnly: false };

function read(): MediaPrefs {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<MediaPrefs>) };
  } catch {
    return DEFAULTS;
  }
}

export function useMediaPrefs() {
  const [prefs, setPrefs] = useState<MediaPrefs>(read);

  // Synchronise plusieurs composants / onglets
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setPrefs(read()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((patch: Partial<MediaPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
      return next;
    });
  }, []);

  return { ...prefs, setDataSaver: (v: boolean) => update({ dataSaver: v }), setAudioOnly: (v: boolean) => update({ audioOnly: v }) };
}

/** Demande la plus basse qualité au lecteur Vimeo (les autres lecteurs l'ignorent). */
export function lowQualityEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("vimeo.com")) u.searchParams.set("quality", "360p");
    return u.toString();
  } catch {
    return url;
  }
}
