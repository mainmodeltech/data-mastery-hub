/**
 * CohortPicker — le cœur de la conversion sur la fiche : les cohortes ouvertes de cette formation à choisir d'un clic (date, rythme, lieu,
 * places, prix réel du jour), puis un seul bouton. Une cohorte par défaut est déjà sélectionnée : candidater prend un clic.
 * Boutons radio natifs (clavier, lecteurs d'écran), habillés en tuiles.
 */
import { useId, useState } from "react";
import { Link } from "react-router-dom";

import { TOP } from "@/components/formations/CohortBars";
import { Button } from "@/components/shared";
import { FICHE_UI, FORMATIONS_UI as UI } from "@/config/formationsPage";
import { cohortPrice, fillRate, isScarce, pluralSpots, spotsLabel, spotsLeft } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import type { FlatSession } from "@/types/formation.type";

const dateLong = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date à venir";

interface Props {
  cohorts: FlatSession[];
  today: string;
  /** Prix de la formation, quand une cohorte n'a pas le sien. */
  fallbackPrice: string | null;
  className?: string;
  onApply: (s: FlatSession) => void;
}

export function CohortPicker({ cohorts, today, fallbackPrice, className, onApply }: Props) {
  const name = useId();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosen = cohorts.find((c) => c.id === chosenId) ?? cohorts[0] ?? null;

  if (!chosen) {
    return (
      <div className={cn(TOP, "home-bar-in bg-surface-sand p-6 pt-14 text-navy lg:p-8 lg:pt-16", className)}>
        <p className="font-heading text-xl font-bold">{FICHE_UI.noCohortTitle}</p>
        <p className="mt-2 text-base text-ink-secondary">{UI.noCohortAction}</p>
        {fallbackPrice && <p className="mt-4 font-heading text-2xl font-extrabold">{fallbackPrice}</p>}
        <Button asChild variant="primary" shape="pill" size="lg" className="home-press mt-6">
          <Link to="/contact">{UI.notify}</Link>
        </Button>
      </div>
    );
  }

  const { price, regular, until } = cohortPrice(chosen, today, fallbackPrice);

  return (
    <div className={cn(TOP, "home-bar-in bg-surface-sand p-6 pt-14 text-navy lg:p-8 lg:pt-16", className)}>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-xl font-bold">{cohorts.length > 1 ? FICHE_UI.chooseDate : FICHE_UI.nextCohort}</legend>
        {cohorts.map((c) => {
          const on = c.id === chosen.id;
          const p = cohortPrice(c, today, fallbackPrice);
          return (
            <label
              key={c.id}
              className={cn(
                "home-press relative flex cursor-pointer flex-col gap-1 rounded-2xl p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy",
                on ? "bg-navy text-white" : "bg-white hover:bg-white/70",
              )}
            >
              <input type="radio" name={name} value={c.id} checked={on} onChange={() => setChosenId(c.id)} className="sr-only" />
              <span className="font-heading text-lg font-bold">{dateLong(c.startDate)}</span>
              <span className={cn("text-sm", on ? "text-white/85" : "text-ink-secondary")}>
                {[c.schedule, c.location].filter(Boolean).join(" · ")}
              </span>
              <span className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
                <span className={cn("font-semibold", isScarce(c) && (on ? "text-cta-on-navy" : "text-cta"))}>
                  {isScarce(c) ? `Plus que ${spotsLabel(spotsLeft(c))}` : pluralSpots(spotsLeft(c))}
                </span>
                {cohorts.length > 1 && p.price && <span className="font-heading font-bold">{p.price}</span>}
              </span>
            </label>
          );
        })}
      </fieldset>

      {chosen.currentParticipants > 0 && (
        <div
          role="progressbar"
          aria-label="Places occupées"
          aria-valuemin={0}
          aria-valuemax={chosen.maxParticipants}
          aria-valuenow={chosen.currentParticipants}
          className="mt-5 h-2.5 overflow-hidden rounded-full bg-white"
        >
          <div className="h-full rounded-full bg-cta" style={{ width: `${Math.round(fillRate(chosen) * 100)}%` }} />
        </div>
      )}

      <p className="mt-5 font-heading text-2xl font-extrabold leading-none">
        {price}
        {regular && <span className="ml-3 text-base font-medium text-ink-secondary line-through">{regular}</span>}
      </p>
      {until && (
        <p className="mt-2 text-sm font-semibold text-cta">
          Tarif préférentiel jusqu'au {new Date(until).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
        </p>
      )}

      <Button variant="primary" shape="pill" size="lg" onClick={() => onApply(chosen)} className="home-press mt-5 w-full">
        {UI.apply}
      </Button>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink-secondary">
        <li>{UI.reassurance.payment}</li>
        <li>{UI.reassurance.invoice}</li>
      </ul>
    </div>
  );
}
