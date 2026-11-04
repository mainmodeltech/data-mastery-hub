/**
 * Bloc « Dispensé par » — la seule section dont le contenu change entre une formation interne et une formation partenaire : qui anime, et
 * qui s'occupe de l'inscription, du paiement et du suivi. Pour un client, savoir que Model Technologie reste l'interlocuteur unique rassure.
 */
import { FICHE_UI } from "@/config/formationsPage";
import { TOP } from "@/components/formations/CohortBars";
import { cn } from "@/lib/utils";
import type { Formation } from "@/types/formation.type";

export interface DeliveredByBlockProps {
  formation: Formation;
}

const LIST = "flex flex-col gap-2 text-base";
const BULLET = "mt-1.5 h-4 w-2 shrink-0 rounded-t-full";

export function DeliveredByBlock({ formation }: DeliveredByBlockProps) {
  if (formation.deliveredBy === "INTERNAL") {
    return (
      <div className="grid items-end gap-4 lg:grid-cols-12 lg:gap-6">
        <div className={cn(TOP, "flex flex-col gap-3 bg-surface-sand p-6 pt-14 text-navy lg:col-span-6 lg:p-8 lg:pt-16")}>
          <h3 className="font-heading text-2xl font-extrabold">{FICHE_UI.deliveredBy} Model Technologie</h3>
          <p className="max-w-[60ch] text-base leading-relaxed text-ink-secondary">
            Contenu pédagogique, animation, inscription, paiement et suivi : tout est géré par nos formateurs.
          </p>
        </div>
        <img
          src="/images/photos/cohorte-travail.jpg"
          alt="Apprenantes d'une cohorte Model Technologie travaillant ensemble sur un exercice, en salle à Dakar"
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] w-full rounded-t-[72px] object-cover lg:col-span-6"
        />
      </div>
    );
  }

  const partner = formation.partner;

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className={cn(TOP, "flex flex-col gap-3 bg-surface-sand p-6 pt-14 text-navy lg:p-8 lg:pt-16")}>
        <h3 className="font-heading text-2xl font-extrabold">
          {FICHE_UI.deliveredBy} {partner?.name}
        </h3>
        {partner?.bio && <p className="max-w-[60ch] text-base leading-relaxed text-ink-secondary">{partner.bio}</p>}
        {partner?.website && (
          <a
            href={partner.website}
            target="_blank"
            rel="noreferrer"
            className="home-press mt-auto inline-flex min-h-11 w-fit items-center text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy"
          >
            {partner.name} · en savoir plus ↗
          </a>
        )}
      </div>

      <div className={cn(TOP, "bg-navy p-6 pt-14 text-white lg:p-8 lg:pt-16")}>
        <h3 className="font-heading text-2xl font-extrabold">{FICHE_UI.whoDoesWhat}</h3>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-heading text-lg font-bold">{partner?.name}</p>
            <ul className={cn(LIST, "mt-3 text-white/90")}>
              {["Contenu pédagogique", "Animation des séances", "Préparation à l'examen"].map((t) => (
                <li key={t} className="flex items-start gap-3"><span className={cn(BULLET, "bg-cta-on-navy")} aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-heading text-lg font-bold">Model Technologie</p>
            <ul className={cn(LIST, "mt-3 text-white/90")}>
              {["Inscription et paiement", "Plateforme et supports", "Suivi et attestation"].map((t) => (
                <li key={t} className="flex items-start gap-3"><span className={cn(BULLET, "bg-cta-on-navy")} aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
