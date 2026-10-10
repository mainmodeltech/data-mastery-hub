/**
 * /espace/hors-ligne — vidéos téléchargées sur cet appareil, lisibles sans connexion.
 * La page ne dépend d'aucun appel à l'API : elle lit le Cache Storage du navigateur.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Trash2, WifiOff } from "lucide-react";

import { Button, Card } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { OFFLINE_CACHE_NAME, readOfflineMeta, removeOfflineMeta, type OfflineVideoMeta } from "@/lib/offlineLibrary";

interface Entry extends OfflineVideoMeta {
  objectUrl: string;
  sizeLabel: string;
}

export default function EspaceHorsLigne() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const urls = useRef<string[]>([]);

  const load = useCallback(async () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    const out: Entry[] = [];
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      for (const meta of readOfflineMeta()) {
        const hit = await cache.match(meta.url);
        if (!hit) { removeOfflineMeta(meta.url); continue; }
        const blob = await hit.blob();
        const objectUrl = URL.createObjectURL(blob);
        urls.current.push(objectUrl);
        out.push({ ...meta, objectUrl, sizeLabel: `${(blob.size / (1024 * 1024)).toFixed(1)} Mo` });
      }
    } catch {
      /* Cache Storage indisponible : liste vide */
    }
    setEntries(out);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [load]);

  const remove = async (entry: Entry) => {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await cache.delete(entry.url);
    } finally {
      removeOfflineMeta(entry.url);
      await load();
    }
  };

  return (
    <LearnerShell title="Hors ligne" description="Vos vidéos téléchargées sur cet appareil">
      <div className="flex max-w-3xl flex-col gap-6">
        {!online && (
          <div role="status" className="flex items-center gap-2 rounded-card bg-warning-bg px-5 py-3 text-sm text-warning">
            <WifiOff className="h-4 w-4" aria-hidden="true" /> Vous êtes hors connexion : seules ces vidéos sont disponibles.
          </div>
        )}
        {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}

        {!loading && entries.length === 0 && (
          <Card radius="stat" variant="sand" className="flex flex-col gap-2 p-8">
            <p className="font-heading text-lg font-bold text-navy">Aucune vidéo téléchargée</p>
            <p className="text-sm text-ink-secondary">
              Dans une leçon, choisissez « Télécharger pour regarder hors ligne » : la vidéo reste disponible ici sans connexion.
              Les vidéos intégrées depuis Vimeo ou YouTube ne peuvent pas être téléchargées.
            </p>
          </Card>
        )}

        {entries.map((e) => (
          <Card key={e.url} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-navy">{e.title}</h2>
                <p className="text-xs text-ink-secondary">{e.formationTitle} · {e.sizeLabel} · téléchargée le {format(parseISO(e.savedAt), "d MMM yyyy", { locale: fr })}</p>
              </div>
              <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => void remove(e)}>
                <Trash2 />Retirer
              </Button>
            </div>
            <video src={e.objectUrl} controls playsInline preload="metadata" className="aspect-video w-full rounded-[18px] bg-navy-dark" />
          </Card>
        ))}
      </div>
    </LearnerShell>
  );
}
