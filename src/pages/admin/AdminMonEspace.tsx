/**
 * AdminMonEspace.tsx — page d'accueil du back-office pour les formateurs et partenaires (et point
 * d'entrée « mes éléments » pour les autres rôles).
 *  - Formateur : « Mes sessions » → suivi de session (appel, projets, questions, messages, certificats).
 *  - Partenaire : « Mes formations » → éditeur de programme, banque de questions, projet final.
 * Données : GET /admin/me/sessions et /admin/me/formations (filtrées côté serveur selon le rôle).
 */
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { BookOpenCheck, CalendarDays, Loader2, Users } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useMyFormations, useMySessions } from "@/hooks/useAdminMe";
import { profileTitle } from "@/lib/roles";

const day = (iso: string | null) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon", UPCOMING: "À venir", OPEN: "Inscriptions ouvertes", CLOSED: "Clôturée",
  IN_PROGRESS: "En cours", COMPLETED: "Terminée", CANCELLED: "Annulée",
};

export default function AdminMonEspace() {
  const { user, can } = useAuth();
  const trainer = can("SESSIONS_TRACK") && !can("SCOPE_ALL_SESSIONS");   // anime « ses » sessions (celles qui lui sont confiées)
  const partner = can("PROGRAM_MANAGE") && !can("SCOPE_ALL_FORMATIONS");  // ne gère que « ses » formations
  const sessions = useMySessions();
  const formations = useMyFormations();

  const showSessions = can("SESSIONS_VIEW");
  const showFormations = can("PROGRAM_MANAGE", "CATALOG_VIEW") || trainer;
  const canEditProgram = can("PROGRAM_MANAGE");

  return (
    <AdminLayout title="Mon espace" description={profileTitle(user)}>
      <div className="flex flex-col gap-6">
        {showSessions && (
          <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Mes sessions</h2>
            {sessions.isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
            {sessions.isError && <ErrorNotice>{errorMessage(sessions.error, "Impossible de charger vos sessions.")}</ErrorNotice>}
            {sessions.data && sessions.data.length === 0 && (
              <EmptyState
                title="Aucune session"
                text={trainer ? "Aucune session ne vous est confiée pour le moment. L'administration peut vous en affecter une." : "Aucune session."}
              />
            )}
            {sessions.data && sessions.data.length > 0 && (
              <ul className="flex flex-col">
                {sessions.data.map((s) => (
                  <li key={s.sessionId} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E7E0D4] py-3 first:border-t-0">
                    <div className="flex min-w-0 flex-1 basis-56 flex-col">
                      <span className="truncate font-semibold text-ink">{s.sessionName ?? "Session"} · {s.formationTitle}</span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{day(s.startDate)} → {day(s.endDate)}
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />{s.participants ?? 0}{s.capacity ? ` / ${s.capacity}` : ""} inscrits
                        {s.trainerName && <>· Formateur : {s.trainerName}</>}
                      </span>
                    </div>
                    <Pill variant="info">{STATUS_LABELS[s.status] ?? s.status}</Pill>
                    <Button asChild variant="navy" shape="rounded" size="sm">
                      <Link to={`/admin/sessions/${s.sessionId}`}>Suivi de session</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {showFormations && (
          <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">{partner ? "Mes formations" : "Formations"}</h2>
            {formations.isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
            {formations.isError && <ErrorNotice>{errorMessage(formations.error, "Impossible de charger vos formations.")}</ErrorNotice>}
            {formations.data && formations.data.length === 0 && (
              <EmptyState
                title="Aucune formation"
                text={partner ? "Votre compte n'est lié à aucune formation. Contactez l'administration de Model Technologie." : "Aucune formation."}
              />
            )}
            {formations.data && formations.data.length > 0 && (
              <ul className="flex flex-col">
                {formations.data.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E7E0D4] py-3 first:border-t-0">
                    <div className="flex min-w-0 flex-1 basis-56 flex-col">
                      <span className="truncate font-semibold text-ink">{f.title}</span>
                      <span className="truncate text-xs text-ink-secondary">
                        {[f.domainName, f.partnerName ?? "Model Technologie", `${f.sessionCount} session${f.sessionCount > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <Pill variant={f.published ? "success" : "warning"}>{f.published ? "Publiée" : "Brouillon"}</Pill>
                    {canEditProgram && (
                      <Button asChild variant="navy" shape="rounded" size="sm">
                        <Link to={`/admin/formations/${f.id}`}><BookOpenCheck />Programme</Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
