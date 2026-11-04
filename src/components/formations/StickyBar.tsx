/**
 * StickyBar — la barre d'appel fixe en bas de l'écran, partagée par les pages de formations et la page entreprises : un texte court à gauche,
 * une action à droite. Cachée (hors écran, inerte, ignorée des lecteurs d'écran) tant que `useStickyHidden` ne l'autorise pas ; au bas de l'écran
 * en tenant compte de la zone sûre des téléphones.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface Props {
  hidden: boolean;
  /** Visible aussi sur grand écran ; sinon seulement sur téléphone et tablette. */
  desktop?: boolean;
  children: ReactNode;
}

export function StickyBar({ hidden, desktop = false, children }: Props) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-navy px-5 pt-3 text-white shadow-[0_-8px_24px_rgba(16,38,60,0.25)] transition-transform duration-300",
        desktop ? "lg:px-20" : "lg:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] motion-reduce:transition-none",
        hidden ? "pointer-events-none translate-y-full" : "translate-y-0",
      )}
      aria-hidden={hidden}
      {...(hidden ? ({ inert: "" } as object) : {})}
    >
      {children}
    </div>
  );
}
