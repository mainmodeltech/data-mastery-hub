/**
 * CatalogueCard — une formation du catalogue, pensée pour décider puis agir : ce que c'est, ce que ça donne (certification, témoignage), la
 * prochaine cohorte réellement ouverte avec ses places et son tarif, et deux actions sur la carte (candidater, voir le programme).
 * La variante `lead` met en avant la formation phare sur toute la largeur.
 */
import { Link } from "react-router-dom";

import { Button } from "@/components/shared";
import { TOP } from "@/components/formations/CohortBars";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { cohortPrice, fillRate, isScarce, pluralSpots, spotsLabel, spotsLeft } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS, LEVEL_LABELS } from "@/types/formation.type";
import type { FlatSession, Formation } from "@/types/formation.type";

const dateLong = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date à venir";

interface Props {
  formation: Formation;
  /** Prochaine cohorte ouverte de cette formation, s'il y en a une. */
  cohort: FlatSession | null;
  today: string;
  lead?: boolean;
  className?: string;
  onApply: (formation: Formation, cohort: FlatSession) => void;
}

export function CatalogueCard({ formation: f, cohort, today, lead = false, className, onApply }: Props) {
  const dark = lead;
  const muted = dark ? "text-white/85" : "text-ink-secondary";
  const { price, regular, until } = cohort ? cohortPrice(cohort, today, f.price) : { price: f.price, regular: null, until: null };
  const facts: { label: string; value: string }[] = [
    { label: "Domaine", value: f.domain.name },
    { label: "Durée", value: f.duration },
    { label: "Niveau", value: LEVEL_LABELS[f.level] },
    { label: "Format", value: FORMAT_LABELS[f.format] },
    ...(f.certificationPrep ? [{ label: "Prépare à", value: f.certificationPrep }] : []),
  ];
  const quote = f.testimonial?.content ? f.testimonial : null;

  return (
    <article
      className={cn(
        TOP,
        "flex flex-col gap-6 p-6 pt-14 lg:p-8 lg:pt-16",
        dark ? "bg-navy text-white lg:grid lg:grid-cols-12 lg:gap-12" : "bg-surface-sand text-navy",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-5", dark && "lg:col-span-7")}>

        <h3 className={cn("font-heading font-extrabold leading-[1.1] tracking-[-0.02em] text-balance", lead ? "text-[clamp(26px,2.8vw,40px)]" : "text-2xl")}>
          <Link to={`/formations/${f.slug}`} className="hover:underline hover:decoration-cta hover:underline-offset-4">{f.title}</Link>
        </h3>
        {f.tag && (
          <p>
            <span className={cn("inline-block rounded-full px-3 py-1 text-sm font-bold", dark ? "bg-cta text-white" : "bg-navy text-white")}>{f.tag}</span>
          </p>
        )}
        <p className={cn("max-w-[60ch] text-base leading-relaxed", muted, !lead && "line-clamp-3")}>{f.description}</p>

        {f.deliveredBy === "PARTNER" && f.partner && <p className={cn("text-sm font-semibold", muted)}>En partenariat avec {f.partner.name}</p>}

        {lead && f.benefits.length > 0 && (
          <ul className="flex flex-col gap-2">
            {f.benefits.slice(0, 3).map((b) => (
              <li key={b} className="flex items-start gap-3 text-base">
                <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        )}

        <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-3 text-sm", lead && "lg:grid-cols-4")}>
          {facts.map((x) => (
            <div key={x.label} className={x.label === "Prépare à" ? "col-span-full" : undefined}>
              <dt className={muted}>{x.label}</dt>
              <dd className="font-semibold">{x.value}</dd>
            </div>
          ))}
        </dl>

        {lead && quote && (
          <figure>
            <blockquote className="max-w-[60ch] text-base leading-relaxed text-white/90">« {quote.content} »</blockquote>
            <figcaption className="mt-2 text-sm text-white/80">
              {quote.name}{quote.role ? `, ${quote.role}` : ""}{quote.company ? ` · ${quote.company}` : ""}
            </figcaption>
          </figure>
        )}
      </div>

      <div className={cn("mt-auto flex flex-col gap-4", dark && "lg:col-span-5 lg:self-end")}>
        {cohort ? (
          <div className={cn("flex flex-col gap-3 rounded-2xl p-5", dark ? "bg-white/10" : "bg-white")}>
            <p className={cn("text-sm", muted)}>Prochaine cohorte</p>
            <p className="font-heading text-xl font-bold">{dateLong(cohort.startDate)}</p>
            <p className={cn("text-sm", muted)}>{[cohort.schedule, cohort.location].filter(Boolean).join(" · ")}</p>

            <div
              role="progressbar"
              aria-label="Places occupées"
              aria-valuemin={0}
              aria-valuemax={cohort.maxParticipants}
              aria-valuenow={cohort.currentParticipants}
              className={cn("h-2.5 overflow-hidden rounded-full", dark ? "bg-white/20" : "bg-surface-sand")}
            >
              <div className="h-full rounded-full bg-cta" style={{ width: `${Math.round(fillRate(cohort) * 100)}%` }} />
            </div>
            <p className={cn("text-sm font-semibold", isScarce(cohort) && (dark ? "text-cta-on-navy" : "text-cta"))}>
              {isScarce(cohort) ? `Plus que ${spotsLabel(spotsLeft(cohort))}` : pluralSpots(spotsLeft(cohort))}
            </p>
          </div>
        ) : (
          <p className={cn("text-base", muted)}>{UI.noCohort}</p>
        )}

        <p className="font-heading text-2xl font-extrabold leading-none">
          {price}
          {regular && <span className={cn("ml-3 text-base font-medium line-through", muted)}>{regular}</span>}
        </p>
        {until && (
          <p className={cn("-mt-2 text-sm", dark ? "text-cta-on-navy" : "text-cta")}>
            Tarif préférentiel jusqu'au {new Date(until).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {cohort ? (
            <Button variant="primary" shape="pill" size="lg" onClick={() => onApply(f, cohort)} aria-label={`${UI.apply} : ${f.title}`} className="home-press">
              {UI.apply}
            </Button>
          ) : (
            <Button asChild variant="primary" shape="pill" size="lg" className="home-press">
              <Link to="/contact">{UI.notifyShort}</Link>
            </Button>
          )}
          <Link
            to={`/formations/${f.slug}`}
            className={cn("home-press inline-flex min-h-11 items-center text-base font-semibold underline underline-offset-4", dark ? "decoration-white/40 hover:decoration-white" : "decoration-navy/30 hover:decoration-navy")}
          >
            {UI.seeProgram}
          </Link>
        </div>
      </div>
    </article>
  );
}
