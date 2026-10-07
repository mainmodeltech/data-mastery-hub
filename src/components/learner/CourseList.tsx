import { Link } from "react-router-dom";

import { Button, Pill, ProgressBar } from "@/components/shared";
import type { EnrollmentStatus, EnrollmentSummary } from "@/types/course.type";

const STATUS_PILL: Record<EnrollmentStatus, { label: string; variant: "info" | "success" | "neutral" }> = {
  IN_PROGRESS: { label: "En cours", variant: "info" },
  CERTIFIED: { label: "Certifiée", variant: "success" },
  UPCOMING: { label: "À venir", variant: "neutral" },
};

export function CourseList({ courses }: { courses: EnrollmentSummary[] }) {
  if (courses.length === 0) {
    return <p className="text-sm text-ink-secondary">Vous n'avez pas encore de formation. Découvrez le catalogue.</p>;
  }

  return (
    <ul className="flex flex-col">
      {courses.map((c) => {
        const pill = STATUS_PILL[c.status];
        const upcoming = c.status === "UPCOMING";
        return (
          <li key={c.formationId} className="grid grid-cols-[minmax(0,1fr)] items-center gap-3 border-t border-[#E7E0D4] py-4 first:border-t-0 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1.6fr),auto,auto]">
            <div className="flex min-w-0 flex-col">
              <span className="font-bold text-ink">{c.title}</span>
              <span className="truncate text-[13px] text-ink-secondary">{c.providerLabel}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <ProgressBar value={c.progressPercent} aria-label={`Progression ${c.title}`} className="h-2" />
              <span className="text-xs text-ink-secondary">{c.statusNote}</span>
            </div>
            <Pill variant={pill.variant} className="w-fit">{pill.label}</Pill>
            {upcoming ? (
              <span className="text-xs text-ink-secondary">Accès à l'ouverture</span>
            ) : (
              <Button asChild variant="outline" shape="rounded" size="sm">
                <Link to={`/espace/formations/${c.formationId}`}>Ouvrir</Link>
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
