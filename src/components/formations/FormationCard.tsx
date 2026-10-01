/**
 * Carte formation réutilisée dans la grille du catalogue, le calendrier (lien
 * simple) et le rail "Vous aimerez aussi" (docs/design/screens/site/Formations.dc.html
 * + FicheFormation.dc.html).
 */
import { Link } from "react-router-dom";

import { Card } from "@/components/shared/Card";
import { Pill } from "@/components/shared/Pill";
import type { Formation } from "@/types/formation.type";
import { LEVEL_LABELS, FORMAT_LABELS } from "@/types/formation.type";

function formatDateShort(iso: string | null): string {
  if (!iso) return "Date à venir";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export interface FormationCardProps {
  formation: Formation;
}

export function FormationCard({ formation }: FormationCardProps) {
  const session = formation.nextSession;

  return (
    <Link to={`/formations/${formation.slug}`} className="block h-full">
      <Card radius="card" className="flex h-full flex-col gap-4 p-6 transition-shadow hover:shadow-[0_20px_40px_rgba(26,58,91,0.08)]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">
            {formation.domain.name}
          </span>
          {formation.tag && <Pill variant="error">{formation.tag}</Pill>}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-lg font-bold text-navy">{formation.title}</h3>
          <p className="line-clamp-2 text-sm text-ink-secondary">{formation.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Pill variant="neutral">{formation.duration}</Pill>
          <Pill variant="neutral">{LEVEL_LABELS[formation.level]}</Pill>
          <Pill variant="neutral">{FORMAT_LABELS[formation.format]}</Pill>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#E7E0D4] pt-4 text-sm">
          <span className="text-ink-secondary">{formatDateShort(session?.startDate ?? null)}</span>
          <span className="font-heading font-bold text-navy">{formation.price}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          {formation.deliveredBy === "INTERNAL" ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-navy font-heading text-[10px] font-extrabold text-white">
                M
              </span>
              Dispensé par Model Technologie
            </>
          ) : (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-dashed border-[#D6CEC0] text-[10px] text-ink-secondary">
                {formation.partner?.name.slice(0, 1)}
              </span>
              Dispensé par {formation.partner?.name}
            </>
          )}
        </div>
      </Card>
    </Link>
  );
}
