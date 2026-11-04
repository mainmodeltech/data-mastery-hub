/**
 * StickyApplyBar — sur téléphone, le bouton « Candidater » reste à portée de pouce une fois le héros passé, et s'efface quand la page propose
 * déjà la même action (bandeau de fin). Il annonce la cohorte la plus proche : date et places, données réelles de l'API.
 */
import { useEffect, useState, type RefObject } from "react";

import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { pluralSpots, spotsLeft } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import type { FlatSession } from "@/types/formation.type";

interface Props {
  cohort: FlatSession | null;
  /** Éléments dont la visibilité masque la barre (le héros : il propose déjà l'action). */
  hideWhenVisible: RefObject<HTMLElement | null>[];
  /** Élément à partir duquel la barre disparaît pour de bon (bandeau de fin : visible ou déjà dépassé). */
  hideFrom: RefObject<HTMLElement | null>;
  onApply: (s: FlatSession) => void;
}

export function StickyApplyBar({ cohort, hideWhenVisible, hideFrom, onApply }: Props) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const from = hideFrom.current;
    const els = [...hideWhenVisible.map((r) => r.current), from].filter((e): e is HTMLElement => e !== null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting || (e.target === from && e.boundingClientRect.top < 0));
      setHidden([...seen.values()].some(Boolean));
    });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [hideWhenVisible, hideFrom]);

  if (!cohort) return null;
  const start = cohort.startDate ? new Date(cohort.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-navy px-5 pt-3 text-white shadow-[0_-8px_24px_rgba(16,38,60,0.25)] transition-transform duration-300 lg:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-reduce:transition-none",
        hidden ? "pointer-events-none translate-y-full" : "translate-y-0",
      )}
      aria-hidden={hidden}
      {...(hidden ? ({ inert: "" } as object) : {})}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-bold">{start ? `Démarre le ${start}` : cohort.formationTitle}</p>
        <p className="truncate text-sm text-white/85">{pluralSpots(spotsLeft(cohort))}</p>
      </div>
      <Button variant="primary" shape="pill" onClick={() => onApply(cohort)} className="home-press shrink-0">
        {UI.apply}
      </Button>
    </div>
  );
}
