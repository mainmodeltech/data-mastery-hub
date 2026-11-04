/**
 * ClosingBand — le dernier appel d'une page de formations : la cohorte la plus proche avec l'action, devant la promotion. Partagé par le
 * catalogue et la fiche. S'il n'y a plus de cohorte ouverte, l'action devient « Être prévenu ».
 */
import { forwardRef } from "react";
import { Link } from "react-router-dom";

import promotion from "@/assets/home/promotion.webp";
import promotionSmall from "@/assets/home/promotion-sm.webp";
import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { pluralSpots, spotsLeft } from "@/lib/cohorts";
import type { FlatSession } from "@/types/formation.type";

const dateLong = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Date à venir";

interface Props {
  cohort: FlatSession | null;
  /** Lien « voir les autres dates » (absent : pas de lien). */
  othersHref?: string;
  onApply: (s: FlatSession) => void;
}

export const ClosingBand = forwardRef<HTMLElement, Props>(function ClosingBand({ cohort, othersHref, onApply }, ref) {
  return (
    <section ref={ref} className="bg-cta px-5 pt-16 text-white lg:px-20 lg:pt-20">
      <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="reveal flex flex-col gap-6 pb-4 lg:col-span-6 lg:pb-20">
          <h2 className="font-heading text-[clamp(24px,2.8vw,40px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance">{UI.closing.title}</h2>
          {cohort && (
            <p className="text-lg">
              {cohort.formationTitle} · {dateLong(cohort.startDate)} · {pluralSpots(spotsLeft(cohort))}
            </p>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
          </div>
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
