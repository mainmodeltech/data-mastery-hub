/**
 * /espace/calendrier — « Calendrier & lives » : lives de toutes les formations ouvertes (leçons de
 * type LIVE du programme, avec date et lien) et dates d'ouverture des formations à venir.
 * Les dates de live sont en heure locale du site (Africa/Dakar), affichées sans décalage.
 */
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, Loader2, Video } from "lucide-react";

import { Button, Card, Pill } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useOpenCourses } from "@/hooks/useCourse";
import { accessMessage } from "@/lib/accessErrors";
import type { Lesson } from "@/types/course.type";

interface LiveEntry {
  lesson: Lesson;
  formationId: string;
  formationTitle: string;
  at: Date;
}

export default function EspaceCalendrier() {
  const { isLoading, isError, upcoming, courses } = useOpenCourses();

  const lives: LiveEntry[] = courses
    .flatMap(({ summary, course }) =>
      (course?.content.modules ?? []).flatMap((m) =>
        m.lessons
          .filter((l) => l.type === "LIVE" && l.liveAt && l.status !== "DRAFT")
          .map((lesson) => ({ lesson, formationId: summary.formationId, formationTitle: summary.title, at: parseISO(lesson.liveAt as string) }))
      )
    )
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const now = new Date();
  const next = lives.filter((l) => l.at >= now);
  const past = lives.filter((l) => l.at < now).reverse();
  const blocked = courses.filter((c) => !c.course && c.error);

  return (
    <LearnerShell title="Calendrier & lives" description="Vos sessions en direct et les ouvertures de formations">
      <div className="flex flex-col gap-6">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger votre calendrier pour le moment.
          </div>
        )}
        {blocked.map((b) => (
          <div key={b.summary.formationId} role="status" className="rounded-card bg-warning-bg px-5 py-4 text-sm text-warning">
            <b>{b.summary.title}</b> : {accessMessage(b.error) ?? "programme momentanément indisponible."}
          </div>
        ))}

        {!isLoading && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Prochains lives</h2>
            {next.length === 0 ? (
              <p className="text-sm text-ink-secondary">Aucun live programmé pour le moment.</p>
            ) : (
              <ul className="flex flex-col">
                {next.map((l) => (
                  <li key={l.lesson.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E7E0D4] py-3 first:border-t-0">
                    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-card bg-info-bg text-navy">
                      <span className="text-[10px] font-bold uppercase">{format(l.at, "MMM", { locale: fr })}</span>
                      <span className="font-heading text-lg font-extrabold leading-none">{format(l.at, "d")}</span>
                    </span>
                    <div className="flex min-w-0 flex-1 basis-48 flex-col">
                      <span className="truncate font-semibold text-ink">{l.lesson.title}</span>
                      <span className="truncate text-xs text-ink-secondary">
                        {l.formationTitle} · {format(l.at, "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    {l.lesson.liveUrl ? (
                      <Button asChild variant="navy" shape="rounded" size="sm">
                        <a href={l.lesson.liveUrl} target="_blank" rel="noopener noreferrer"><Video />Rejoindre</a>
                      </Button>
                    ) : (
                      <Pill variant="neutral">Lien à venir</Pill>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {upcoming.length > 0 && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Formations à venir</h2>
            <ul className="flex flex-col">
              {upcoming.map((c) => (
                <li key={c.formationId} className="flex flex-wrap items-center gap-3 border-t border-[#E7E0D4] py-3 first:border-t-0">
                  <CalendarDays className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                  <div className="flex min-w-0 flex-1 basis-48 flex-col">
                    <span className="truncate font-semibold text-ink">{c.title}</span>
                    <span className="truncate text-xs text-ink-secondary">{c.providerLabel}</span>
                  </div>
                  <Pill variant="neutral">{c.statusNote}</Pill>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {past.length > 0 && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Lives passés</h2>
            <ul className="flex flex-col">
              {past.map((l) => (
                <li key={l.lesson.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E7E0D4] py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-ink">{l.lesson.title}</span>
                    <span className="truncate text-xs text-ink-secondary">{l.formationTitle} · {format(l.at, "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                  </span>
                  <Link to={`/espace/formations/${l.formationId}/lecons/${l.lesson.id}`} className="text-sm font-semibold text-navy">Voir la leçon</Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </LearnerShell>
  );
}
