/**
 * CohortBars — le panneau du héros : les prochaines cohortes ouvertes, une barre chacune. La hauteur de la barre suit le remplissage de la
 * cohorte (plus elle se remplit, plus elle monte) ; la plus proche est en couleur d'appel. Chaque barre porte sa date, son prix, ses places et
 * son bouton « Candidater » : on peut candidater sans quitter l'écran d'arrivée.
 */
import { Link } from "react-router-dom";

import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { cohortPrice, fillRate, isScarce, pluralSpots, spotsLabel, spotsLeft } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import type { FlatSession } from "@/types/formation.type";

export const TOP = "rounded-t-[56px]";

const dateShort = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "Date à venir";

interface Props {
  cohorts: FlatSession[];
  today: string;
  onApply: (s: FlatSession) => void;
}

export function CohortBars({ cohorts, today, onApply }: Props) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-white">{UI.cohortsTitle}</h2>
      {cohorts.length > 0 && <p className="mt-1 text-base text-white/85">{UI.cohortsHint}</p>}

      {cohorts.length === 0 ? (
        <div className={cn(TOP, "mt-4 bg-surface-sand p-8 pt-14 text-navy")}>
          <p className="font-heading text-xl font-bold">{UI.noCohort}</p>
          <p className="mt-2 text-base text-ink-secondary">{UI.noCohortAction}</p>
          <Button asChild variant="primary" shape="pill" size="lg" className="mt-6">
            <Link to="/contact">{UI.notify}</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3 lg:h-[420px] lg:flex-row lg:items-end lg:justify-end lg:gap-3">
          {cohorts.map((s, i) => {
            const lead = i === 0;
            const { price, regular } = cohortPrice(s, today);
            const n = spotsLeft(s);
            return (
              <li
                key={s.id}
                // hauteur = remplissage : de 72 % (cohorte vide) à 100 % (presque complète) de la place disponible
                style={{ ["--h" as string]: `${Math.round(72 + fillRate(s) * 28)}%` }}
                className={cn(
                  TOP,
                  "home-bar flex min-w-0 flex-1 flex-col p-5 pt-12 lg:h-[var(--h)] lg:max-w-[300px]",
                  lead ? "bg-cta text-white" : "bg-surface-sand text-navy",
                )}
              >
                <p className="font-heading text-[40px] font-extrabold leading-none">{dateShort(s.startDate)}</p>
                <p className="mt-3 line-clamp-3 font-heading text-base font-bold leading-snug">{s.formationTitle}</p>
                <p className={cn("mt-2 text-sm", lead ? "text-white/90" : "text-ink-secondary")}>{s.schedule}</p>

                <div className="mt-auto flex flex-col gap-3 pt-5">
                  {price && (
                    <p className="font-heading text-xl font-bold">
                      {price}
                      {regular && <span className={cn("ml-2 text-sm font-medium line-through", lead ? "text-white/80" : "text-ink-secondary")}>{regular}</span>}
                    </p>
                  )}
                  <p className={cn("text-sm font-semibold", isScarce(s) && !lead && "text-cta")}>
                    {isScarce(s) ? `Plus que ${spotsLabel(n)}` : pluralSpots(n)}
                  </p>
                  <Button
                    variant={lead ? "navy" : "primary"}
                    shape="pill"
                    onClick={() => onApply(s)}
                    aria-label={`${UI.apply} : ${s.formationTitle}, ${dateShort(s.startDate)}`}
                    className="home-press w-full"
                  >
                    {UI.apply}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
