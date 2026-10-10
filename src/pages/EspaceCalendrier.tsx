/**
 * /espace/calendrier — « Calendrier & lives » : séances en direct de toutes les formations ouvertes
 * (GET /learner/calendar). Les heures sont en heure locale du site (Africa/Dakar), affichées sans décalage.
 */
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MapPin, Video } from "lucide-react";

import { Button, Card, Pill } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerCalendar } from "@/hooks/useLearner";

export default function EspaceCalendrier() {
  const { data = [], isLoading, isError } = useLearnerCalendar();

  const upcoming = data.filter((i) => !i.past).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = data.filter((i) => i.past).sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <LearnerShell title="Calendrier & lives" description="Vos séances en direct">
      <div className="flex flex-col gap-6">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger votre calendrier pour le moment.
          </div>
        )}

        {!isLoading && !isError && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Prochains lives</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-ink-secondary">Aucun live programmé pour le moment.</p>
            ) : (
              <ul className="flex flex-col">
                {upcoming.map((l) => {
                  const at = parseISO(l.startsAt);
                  return (
                    <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E7E0D4] py-3 first:border-t-0">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-card bg-info-bg text-navy">
                        <span className="text-[10px] font-bold uppercase">{format(at, "MMM", { locale: fr })}</span>
                        <span className="font-heading text-lg font-extrabold leading-none">{format(at, "d")}</span>
                      </span>
                      <div className="flex min-w-0 flex-1 basis-48 flex-col">
                        <span className="truncate font-semibold text-ink">{l.title}</span>
                        <span className="truncate text-xs text-ink-secondary">
                          {l.formationTitle} · {format(at, "EEEE d MMMM", { locale: fr })} · {l.timeLabel || format(at, "HH:mm")}
                        </span>
                        {l.place && <span className="flex items-center gap-1 truncate text-xs text-ink-secondary"><MapPin className="h-3 w-3" aria-hidden="true" />{l.place}</span>}
                      </div>
                      {l.joinUrl ? (
                        <Button asChild variant="navy" shape="rounded" size="sm">
                          <a href={l.joinUrl} target="_blank" rel="noopener noreferrer"><Video />Rejoindre</a>
                        </Button>
                      ) : (
                        <Pill variant="neutral">Lien à venir</Pill>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        )}

        {past.length > 0 && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Lives passés</h2>
            <ul className="flex flex-col">
              {past.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E7E0D4] py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-ink">{l.title}</span>
                    <span className="truncate text-xs text-ink-secondary">{l.formationTitle} · {format(parseISO(l.startsAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </LearnerShell>
  );
}
