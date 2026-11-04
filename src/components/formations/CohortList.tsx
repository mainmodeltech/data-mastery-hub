/**
 * CohortList — toutes les cohortes ouvertes, par date, pour qui choisit d'abord « quand ». Une liste de lignes (pas un tableau) : la même
 * disposition tient du téléphone au grand écran, et chaque ligne se termine par l'action.
 */
import { Link } from "react-router-dom";

import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { cohortPrice, isScarce, pluralSpots, spotsLabel, spotsLeft } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import type { FlatSession } from "@/types/formation.type";

interface Props {
  cohorts: FlatSession[];
  today: string;
  onApply: (s: FlatSession) => void;
}

export function CohortList({ cohorts, today, onApply }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {cohorts.map((s, i) => {
        const d = s.startDate ? new Date(s.startDate) : null;
        const { price, regular } = cohortPrice(s, today);
        return (
          <li
            key={s.id}
            style={{ ["--d" as string]: i * 70 }}
            className="reveal grid items-center gap-x-8 gap-y-4 rounded-2xl bg-surface-sand p-5 sm:grid-cols-[92px_1fr] lg:grid-cols-[92px_1fr_190px_170px_auto] lg:p-6"
          >
            <div className="flex items-baseline gap-2 sm:block sm:text-center">
              <p className="font-heading text-[40px] font-extrabold leading-none text-navy">{d ? d.getDate() : "—"}</p>
              <p className="text-base font-semibold text-ink-secondary">
                {d ? d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "Date à venir"}
              </p>
            </div>

            <div className="min-w-0">
              <Link to={`/formations/${s.formationSlug}`} className="font-heading text-lg font-bold text-navy hover:underline hover:decoration-cta hover:underline-offset-4">
                {s.formationTitle}
              </Link>
              <p className="mt-1 text-sm text-ink-secondary">
                {[s.domainName, s.schedule, s.location].filter(Boolean).join(" · ")}
              </p>
            </div>

            <p className={cn("text-base font-semibold text-navy", isScarce(s) && "text-cta")}>
              {isScarce(s) ? `Plus que ${spotsLabel(spotsLeft(s))}` : pluralSpots(spotsLeft(s))}
            </p>

            <p className="font-heading text-lg font-bold text-navy">
              {price ?? "—"}
              {regular && <span className="ml-2 text-sm font-medium text-ink-secondary line-through">{regular}</span>}
            </p>

            <Button variant="primary" shape="pill" onClick={() => onApply(s)} aria-label={`${UI.apply} : ${s.formationTitle}`} className="home-press sm:col-span-2 lg:col-span-1">
              {UI.apply}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
