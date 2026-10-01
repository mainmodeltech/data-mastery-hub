/**
 * Bloc "Dispensé par" — la seule section dont le contenu change entre une
 * formation interne et une formation partenaire (docs/design/README.md §2-§3,
 * FicheFormation.dc.html lignes ~101-124).
 */
import { Card } from "@/components/shared/Card";
import type { Formation } from "@/types/formation.type";

export interface DeliveredByBlockProps {
  formation: Formation;
}

export function DeliveredByBlock({ formation }: DeliveredByBlockProps) {
  if (formation.deliveredBy === "INTERNAL") {
    return (
      <Card radius="card" className="p-8">
        <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">DISPENSÉ PAR</span>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-navy font-heading text-lg font-extrabold text-white">
            M
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-navy">Model Technologie</p>
            <p className="text-sm text-ink-secondary">
              Contenu pédagogique, animation, inscription, paiement et suivi — tout est géré par nos formateurs internes.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const partner = formation.partner;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card radius="card" className="flex flex-col gap-4 p-8">
        <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">DISPENSÉ PAR</span>
        <p className="font-heading text-lg font-bold text-navy">{partner?.name}</p>
        <p className="text-sm text-ink-secondary">{partner?.bio}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-[#E7E0D4] pt-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-dashed border-[#D6CEC0] text-xs text-ink-secondary">
            {partner?.name.slice(0, 1)}
          </span>
          {partner?.website ? (
            <a
              href={partner.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-navy hover:text-cta"
            >
              {partner.name} · en savoir plus ↗
            </a>
          ) : (
            <span className="text-sm text-ink-secondary">{partner?.name}</span>
          )}
        </div>
      </Card>

      <Card radius="card" variant="sand" className="p-8">
        <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">QUI FAIT QUOI</span>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="font-heading text-sm font-bold text-navy">{partner?.name}</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">
              <li>Contenu pédagogique</li>
              <li>Animation des séances</li>
              <li>Préparation à l'examen</li>
            </ul>
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-navy">Model Technologie</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">
              <li>Inscription et paiement</li>
              <li>Plateforme et supports</li>
              <li>Suivi et attestation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
