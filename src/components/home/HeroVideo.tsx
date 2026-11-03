/**
 * HeroVideo — boucle vidéo « data » en fond du héros (histogramme qui monte, courbe de tendance), générée par scripts/make-hero-video.mjs.
 *
 * Bonnes pratiques appliquées :
 *  - la vidéo n'est chargée et lancée que si le visiteur le permet : pas de « mouvement réduit », pas d'économie de données, pas de
 *    connexion très lente ; sinon l'image d'attente reste seule (elle est déjà belle, et c'est elle qui compte pour l'affichage rapide) ;
 *  - muette, en boucle, `playsInline` (iPhone), décorative donc cachée aux lecteurs d'écran ;
 *  - mise en pause hors de l'écran et quand l'onglet est caché (batterie, processeur) ;
 *  - un bouton Pause/Lecture visible : un contenu qui bouge plus de 5 secondes doit pouvoir être arrêté (WCAG 2.2.2).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const POSTER = "/media/hero-data-poster.jpg";
const VIDEO = "/media/hero-data.webm";

interface NetworkInformation { saveData?: boolean; effectiveType?: string }

function mayPlay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return false;
  return true;
}

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => setAllowed(mayPlay()), []);

  // Lecture seulement quand la vidéo est visible, l'onglet actif et que le visiteur ne l'a pas mise en pause
  useEffect(() => {
    const v = ref.current;
    if (!v || !allowed) return;
    let visible = true;
    const sync = () => {
      if (paused || !visible || document.hidden) v.pause();
      else void v.play().catch(() => undefined);   // un refus du navigateur laisse simplement l'image d'attente
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.05 });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [allowed, paused]);

  const toggle = useCallback(() => setPaused((p) => !p), []);

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        width={1280}
        height={720}
        poster={POSTER}
        src={allowed ? VIDEO : undefined}
        muted
        loop
        playsInline
        preload={allowed ? "auto" : "none"}
        aria-hidden="true"
        tabIndex={-1}
      />
      {allowed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Reprendre l'animation de fond" : "Mettre en pause l'animation de fond"}
          className="absolute bottom-4 left-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:left-20"
        >
          {paused ? <Play className="h-5 w-5" aria-hidden="true" /> : <Pause className="h-5 w-5" aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
