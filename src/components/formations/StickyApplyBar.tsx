/**
 * StickyApplyBar — le bouton « Candidater » reste à portée de pouce (ou de souris, sur la fiche) une fois le haut de page passé, et s'efface
 * quand la page propose déjà la même action (bandeau de fin). Il annonce la cohorte la plus proche : date et places, données réelles de l'API.
 */
import type { RefObject } from "react";

import { StickyBar } from "@/components/formations/StickyBar";
import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { useStickyHidden } from "@/hooks/useStickyHidden";
import { pluralSpots, spotsLeft } from "@/lib/cohorts";
import type { FlatSession } from "@/types/formation.type";

interface Props {
  cohort: FlatSession | null;
  /** Éléments dont la visibilité masque la barre (le héros : il propose déjà l'action). */
  hideWhenVisible: RefObject<HTMLElement | null>[];
  /** Élément à partir duquel la barre disparaît pour de bon (bandeau de fin : visible ou déjà dépassé). */
  hideFrom: RefObject<HTMLElement | null>;
  onApply: (s: FlatSession) => void;
  /** Visible aussi sur grand écran (fiche formation) ; sinon seulement sur téléphone et tablette. */
  desktop?: boolean;
}

export function StickyApplyBar({ cohort, hideWhenVisible, hideFrom, onApply, desktop = false }: Props) {
  const hidden = useStickyHidden(hideWhenVisible, hideFrom);

  if (!cohort) return null;
  const start = cohort.startDate ? new Date(cohort.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : null;

  return (
    <StickyBar hidden={hidden} desktop={desktop}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-bold">
          {desktop && <span className="hidden lg:inline">{cohort.formationTitle} · </span>}
          {start ? `Démarre le ${start}` : cohort.formationTitle}
        </p>
        <p className="truncate text-sm text-white/85">{pluralSpots(spotsLeft(cohort))}</p>
      </div>
      <Button variant="primary" shape="pill" onClick={() => onApply(cohort)} className="home-press shrink-0">
        {UI.apply}
      </Button>
    </StickyBar>
  );
}
