/**
 * ProgramAccordion — le programme, module par module. Des `<details name="…">` natifs : accordéon exclusif, clavier et lecteurs d'écran sans
 * script ; le premier module est ouvert. Même habillage que la FAQ de l'accueil.
 */
import { FICHE_UI } from "@/config/formationsPage";
import type { CurriculumWeek } from "@/config/bootcamps.config";

interface Props {
  modules: CurriculumWeek[];
}

export function ProgramAccordion({ modules }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {modules.map((m, i) => (
        <details
          key={`${m.week}-${m.title}`}
          name="program-module"
          open={i === 0}
          style={{ ["--d" as string]: i * 70 }}
          className="reveal group rounded-2xl bg-surface-sand px-6 py-5 text-navy open:bg-navy open:text-white"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-sm font-semibold text-ink-secondary group-open:text-white/80">{m.week}</span>
              {m.title}
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xl leading-none text-white group-open:bg-cta" aria-hidden="true">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="mt-4 flex flex-col gap-4 text-base">
            {m.hours && (
              <p className="text-ink-secondary group-open:text-white/90">
                <span className="font-semibold">{FICHE_UI.hours} :</span> {m.hours}
              </p>
            )}
            {m.topics.length > 0 && (
              <ul className="flex flex-col gap-2">
                {m.topics.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-ink-secondary group-open:text-white/90">
                    <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta group-open:bg-cta-on-navy" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {m.project && (
              <p className="text-ink-secondary group-open:text-white/90">
                <span className="font-semibold text-navy group-open:text-cta-on-navy">{FICHE_UI.deliverable} :</span> {m.project}
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
