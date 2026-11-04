/**
 * ClosingBand — le dernier appel d'une page : un titre, une action, devant la promotion. `ClosingLayout` est la mise en page commune
 * (catalogue, fiche formation, page entreprises) ; `ClosingBand` la remplit avec la cohorte la plus proche. S'il n'y a plus de cohorte ouverte,
 * l'action devient « Être prévenu ».
 */
import { forwardRef, type ReactNode } from "react";
import { Link } from "react-router-dom";

import promotion from "@/assets/home/promotion.webp";
import promotionSmall from "@/assets/home/promotion-sm.webp";
import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { pluralSpots, spotsLeft } from "@/lib/cohorts";
import type { FlatSession } from "@/types/formation.type";

const dateLong = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date à venir";

interface LayoutProps {
  title: string;
  /** Ligne d'information sous le titre (cohorte, coordonnées…). */
  detail?: ReactNode;
  /** Boutons et liens d'action. */
  actions: ReactNode;
}

export const ClosingLayout = forwardRef<HTMLElement, LayoutProps>(function ClosingLayout({ title, detail, actions }, ref) {
  return (
    <section ref={ref} className="bg-cta px-5 pt-16 text-white lg:px-20 lg:pt-20">
      <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="reveal flex flex-col gap-6 pb-4 lg:col-span-6 lg:pb-20">
          <h2 className="font-heading text-[clamp(24px,2.8vw,40px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance">{title}</h2>
          {detail}
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>
        </div>
        <img
          src={promotion}
          srcSet={`${promotionSmall} 800w, ${promotion} 1400w`}
          sizes="(min-width: 1024px) 50vw, 100vw"
          width={1400}
          height={933}
          loading="lazy"
          decoding="async"
          alt="Une promotion de Model Technologie à la remise des certificats : des diplômés souriants, certificat en main"
          className="reveal aspect-[3/2] w-full rounded-t-[72px] object-cover object-[50%_30%] lg:col-span-6"
          style={{ ["--d" as string]: 120 }}
        />
      </div>
    </section>
  );
});

interface Props {
  cohort: FlatSession | null;
  /** Lien « voir les autres dates » (absent : pas de lien). */
  othersHref?: string;
  onApply: (s: FlatSession) => void;
}

export const ClosingBand = forwardRef<HTMLElement, Props>(function ClosingBand({ cohort, othersHref, onApply }, ref) {
  return (
    <ClosingLayout
      ref={ref}
      title={UI.closing.title}
      detail={
        cohort && (
          <p className="text-lg">
            {cohort.formationTitle} · {dateLong(cohort.startDate)} · {pluralSpots(spotsLeft(cohort))}
          </p>
        )
      }
      actions={
        <>
          {cohort ? (
            <Button variant="navy" shape="pill" size="lg" onClick={() => onApply(cohort)} className="home-press">
              {UI.apply}
            </Button>
          ) : (
            <Button asChild variant="navy" shape="pill" size="lg" className="home-press">
              <Link to="/contact">{UI.notify}</Link>
            </Button>
          )}
          {othersHref && (
            <a href={othersHref} className="home-press inline-flex min-h-11 items-center text-base font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
              {UI.closing.other}
            </a>
          )}
        </>
      }
    />
  );
});
