/**
 * Espace.tsx — tableau de bord apprenant, Lot 5
 * (docs/design/screens/app/App-Apprenant.dc.html + M-Accueil.dc.html).
 */
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Award, ChevronRight, Loader2, Play } from "lucide-react";

import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { CourseList } from "@/components/learner/CourseList";
import { DemoDataBanner, LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerDashboard } from "@/hooks/useCourse";
import { useAuth } from "@/hooks/useAuth";
import { formatDuration, type LiveItem } from "@/types/course.type";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function downloadIcs(live: LiveItem) {
  const dt = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0];
  const start = new Date(live.startsAt);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Model Technologie//Espace apprenant//FR",
    "BEGIN:VEVENT",
    `UID:${live.id}@model-technologie.com`,
    `DTSTART:${dt(start.toISOString())}Z`,
    `DTEND:${dt(end.toISOString())}Z`,
    `SUMMARY:${live.title}`,
    `LOCATION:${live.place}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "live.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Espace() {
  const { user } = useAuth();
  const { data: result, isLoading, isError } = useLearnerDashboard();
  const dash = result?.data;

  const today = capitalize(format(new Date(), "EEEE d MMMM", { locale: fr }));
  const firstName = dash?.firstName ?? user?.email?.split("@")[0] ?? "";
  const streak = dash?.streakDays;
  const description = streak ? `${today} · vous êtes sur une série de ${streak} jours d'apprentissage` : today;

  return (
    <LearnerShell greeting={`Bonjour ${firstName}`} description={description}>
      <div className="flex flex-col gap-6">
        {result?.demo && <DemoDataBanner />}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-ink-secondary" />
          </div>
        )}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger votre espace pour le moment. Réessayez dans quelques instants.
          </div>
        )}

        {dash && (
          <>
            {/* KPI desktop (4) */}
            <div className="hidden gap-4 lg:grid lg:grid-cols-4">
              {[
                { label: "Heures suivies", value: `${dash.stats.hoursWatched} h` },
                { label: "Leçons terminées", value: `${dash.stats.lessonsDone} / ${dash.stats.lessonsTotal}` },
                { label: "Score moyen aux quiz", value: dash.stats.averageQuizScore != null ? `${dash.stats.averageQuizScore} %` : "—" },
                { label: "Certificats", value: String(dash.stats.certificates) },
              ].map((k) => (
                <Card key={k.label} radius="stat" className="flex flex-col gap-1 p-5">
                  <span className="text-sm text-ink-secondary">{k.label}</span>
                  <span className="font-heading text-[28px] font-extrabold text-navy">{k.value}</span>
                </Card>
              ))}
            </div>

            {/* Toutes les formations sont « à venir » : on explique pourquoi l'espace est encore vide */}
            {dash.courses.length > 0 && dash.courses.every((c) => c.status === "UPCOMING") && (
              <div role="status" className="flex flex-col gap-1 rounded-card bg-info-bg px-5 py-4 text-sm text-navy">
                <span className="font-bold">Vos formations ne sont pas encore ouvertes</span>
                <span>
                  {dash.courses.map((c) => `${c.title} : ${c.statusNote.toLowerCase()}`).join(" · ")}. Les cours, ressources et lives
                  apparaîtront ici dès l'ouverture de l'accès. <Link to="/espace/calendrier" className="font-semibold underline">Voir le calendrier</Link>
                </span>
              </div>
            )}

            {/* Reprendre */}
            {dash.resume && (
              <Card radius="callout" variant="navy" className="grid grid-cols-[minmax(0,1fr)] gap-5 p-4 lg:grid-cols-[280px,minmax(0,1fr)] lg:items-center lg:p-6">
                <Link
                  to={`/espace/formations/${dash.resume.formationId}/lecons/${dash.resume.lessonId}`}
                  className="relative flex h-44 items-center justify-center rounded-[14px] bg-navy-dark lg:h-40"
                  aria-label="Reprendre la leçon"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-cta">
                    <Play className="h-6 w-6 text-white" />
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-bold text-navy lg:hidden">
                    {Math.max(1, Math.ceil((dash.resume.durationSeconds - dash.resume.positionSeconds) / 60))} min restantes
                  </span>
                  <span className="absolute bottom-3 right-3 hidden rounded-pill bg-white/90 px-2.5 py-1 text-xs font-bold text-navy lg:block">
                    {formatDuration(dash.resume.durationSeconds)}
                  </span>
                </Link>
                <div className="flex flex-col gap-3 px-1 pb-1 lg:px-0 lg:pb-0">
                  <span className="text-xs font-bold uppercase tracking-[1px] text-cta-on-navy">
                    Reprendre<span className="lg:hidden"> · {dash.resume.courseTitle}</span>
                  </span>
                  <p className="font-heading text-xl font-bold text-white lg:text-2xl">
                    <span className="hidden lg:inline">Leçon {dash.resume.lessonLabel} — </span>
                    <span className="lg:hidden">{dash.resume.lessonLabel} · </span>
                    {dash.resume.lessonTitle}
                  </p>
                  <p className="hidden text-sm text-[#D5DEE8] lg:block">
                    {dash.resume.courseTitle} · Module {dash.resume.moduleIndex} sur {dash.resume.moduleCount} · il vous reste{" "}
                    {Math.max(1, Math.ceil((dash.resume.durationSeconds - dash.resume.positionSeconds) / 60))} min sur cette vidéo
                  </p>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={dash.resume.percent} variant="accent-on-navy" className="flex-1" aria-label="Progression de la formation" />
                    <span className="text-sm font-bold text-white">{dash.resume.percent} %</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="primary" shape="rounded">
                      <Link to={`/espace/formations/${dash.resume.formationId}/lecons/${dash.resume.lessonId}`}>
                        Continuer la leçon
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      shape="rounded"
                      className="hidden border-white/40 text-white hover:bg-white/10 lg:inline-flex"
                    >
                      <Link to={`/espace/formations/${dash.resume.formationId}`}>Voir le programme</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* KPI mobile (3) */}
            <div className="grid grid-cols-3 gap-3 lg:hidden">
              {[
                { value: streak ? `${streak} j` : "—", label: "de suite" },
                { value: `${dash.stats.lessonsDone}/${dash.stats.lessonsTotal}`, label: "leçons" },
                { value: dash.stats.averageQuizScore != null ? `${dash.stats.averageQuizScore} %` : "—", label: "aux quiz" },
              ].map((k) => (
                <Card key={k.label} radius="stat" className="flex flex-col p-3.5">
                  <span className="font-heading text-xl font-extrabold text-navy">{k.value}</span>
                  <span className="text-xs text-ink-secondary">{k.label}</span>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-6">
                {dash.certificateReady && (
                  <Link to="/espace/certificats" className="flex items-center gap-3 rounded-stat bg-success-bg p-4 lg:hidden">
                    <span className="flex h-10 w-10 items-center justify-center rounded-card bg-success">
                      <Award className="h-5 w-5 text-white" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-success">Certificat {dash.certificateReady.title} prêt</p>
                      <p className="text-xs text-ink-secondary">Ajoutez-le à LinkedIn en 1 clic</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-success" />
                  </Link>
                )}

                <Card radius="stat" className="flex flex-col gap-2 p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-navy">À faire cette semaine</h2>
                  </div>
                  <ul className="flex flex-col">
                    {dash.todos.map((t, i) => (
                      <li
                        key={t.id}
                        className={`flex items-center gap-3 border-t border-[#E7E0D4] py-3.5 first:border-t-0 ${i >= 2 ? "hidden lg:flex" : ""}`}
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-semibold text-ink">{t.title}</span>
                          <span className="truncate text-[13px] text-ink-secondary">{t.subtitle}</span>
                        </div>
                        <Pill variant={t.tone === "warning" ? "warning" : "info"}>{t.badge}</Pill>
                      </li>
                    ))}
                    {dash.todos.length === 0 && <li className="text-sm text-ink-secondary">Rien à faire pour le moment.</li>}
                  </ul>
                </Card>

                <Card radius="stat" className="flex flex-col gap-2 p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-navy">Mes formations</h2>
                    <Link to="/espace/formations" className="text-sm font-semibold text-navy hover:text-cta">Tout voir</Link>
                  </div>
                  <CourseList courses={dash.courses} />
                </Card>
              </div>

              <div className="flex min-w-0 flex-col gap-6">
                {dash.certificateReady && (
                  <Link to="/espace/certificats" className="hidden items-center gap-3 rounded-stat bg-success-bg p-5 lg:flex">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-success">
                      <Award className="h-5 w-5 text-white" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-success">Votre certificat {dash.certificateReady.title} est prêt</p>
                      <p className="text-xs text-ink-secondary">Ajoutez-le à votre profil LinkedIn en un clic.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-success" />
                  </Link>
                )}

                <Card radius="stat" className="flex flex-col gap-4 p-5 lg:p-6">
                  <h2 className="font-heading text-xl font-bold text-navy">
                    <span className="lg:hidden">Prochain live</span>
                    <span className="hidden lg:inline">Prochains lives</span>
                  </h2>
                  {dash.lives.length === 0 && <p className="text-sm text-ink-secondary">Aucun live programmé.</p>}
                  {dash.lives.map((l, i) => {
                    const d = new Date(l.startsAt);
                    return (
                      <div key={l.id} className={`flex items-center gap-3 ${i >= 1 ? "hidden lg:flex" : ""}`}>
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-card bg-app-bg">
                          <span className="text-[11px] font-bold uppercase text-cta">{format(d, "EEE", { locale: fr })}</span>
                          <span className="font-heading text-lg font-extrabold text-navy">{format(d, "dd")}</span>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-bold text-ink">{l.title}</span>
                          <span className="text-xs text-ink-secondary">{l.timeLabel} · {l.place}</span>
                        </div>
                        {l.joinUrl ? (
                          <Button asChild variant="navy" shape="rounded" size="sm">
                            <a href={l.joinUrl} target="_blank" rel="noreferrer">Rejoindre</a>
                          </Button>
                        ) : (
                          <Button variant="outline" shape="rounded" size="sm" onClick={() => downloadIcs(l)}>
                            Ajouter
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </LearnerShell>
  );
}
