import { Link } from "react-router-dom";

import { Pill } from "@/components/shared/Pill";
import type { FlatSession } from "@/types/formation.type";

function formatDate(iso: string | null): string {
  if (!iso) return "Date à venir";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export interface SessionsCalendarTableProps {
  sessions: FlatSession[];
}

export function SessionsCalendarTable({ sessions }: SessionsCalendarTableProps) {
  if (sessions.length === 0) {
    return <p className="text-sm text-ink-secondary">Aucune session à venir pour le moment.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-[#E7E0D4] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#E7E0D4] text-xs font-bold uppercase tracking-[1px] text-ink-secondary">
            <th className="px-4 py-3">Formation</th>
            <th className="px-4 py-3">Domaine</th>
            <th className="px-4 py-3">Démarrage</th>
            <th className="px-4 py-3">Disponibilité</th>
            <th className="px-4 py-3">Dispensé par</th>
            <th className="px-4 py-3">Tarif</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-[#E7E0D4] last:border-0">
              <td className="px-4 py-3">
                <Link to={`/formations/${s.formationSlug}`} className="font-semibold text-navy hover:text-cta">
                  {s.formationTitle}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink-secondary">{s.domainName}</td>
              <td className="px-4 py-3 text-ink-secondary">{formatDate(s.startDate)}</td>
              <td className="px-4 py-3">
                {s.isFull ? (
                  <Pill variant="error">Complet</Pill>
                ) : (
                  <span className="text-ink-secondary">
                    {s.spotsRemaining ?? s.maxParticipants - s.currentParticipants} / {s.maxParticipants} places
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-ink-secondary">
                {s.deliveredBy === "INTERNAL" ? "Model Technologie" : s.partnerName}
              </td>
              <td className="px-4 py-3 font-semibold text-navy">{s.price ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
