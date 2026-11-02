/**
 * /espace/simulateur — tableau de bord du simulateur de certification : droits d'usage, examen blanc chronométré,
 * entraînement par domaine et historique des tentatives. Le serveur décide de tout (quota, temps, note).
 */
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BookOpenCheck, Clock, Loader2, PlayCircle, Timer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { EmptyState, ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { Button, Card, Pill } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import { useSimAttempts, useSimCatalog, useStartAttempt } from "@/hooks/useSimulatorLearner";
import { PLAN_LABELS } from "@/types/simulator.type";
import { MODE_LABELS, STATUS_LABELS, type AttemptSummary, type StartRequest } from "@/types/simulatorLearner.type";

const stamp = (iso: string) => format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });
const day = (iso: string) => format(new Date(iso), "d MMM yyyy", { locale: fr });

function resultOf(a: AttemptSummary): { label: string; variant: "success" | "error" | "neutral" | "info" } {
  if (a.status === "IN_PROGRESS") return { label: "En cours", variant: "info" };
  if (a.mode === "EXAM") return a.passed ? { label: `${a.scaledScore}/1000 · réussi`, variant: "success" } : { label: `${a.scaledScore}/1000 · non atteint`, variant: "error" };
  return { label: a.scorePercent == null ? "—" : `${Math.round(a.scorePercent)} %`, variant: "neutral" };
}

export default function EspaceSimulateur() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const catalog = useSimCatalog();
  const attempts = useSimAttempts();
  const start = useStartAttempt();

  const launch = async (body: StartRequest) => {
    try {
      const attempt = await start.mutateAsync(body);
      navigate(`/espace/simulateur/tentatives/${attempt.id}`);
    } catch (err) {
      toast({ title: "Démarrage impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const c = catalog.data;
  const access = c?.access ?? [];
  const examsLeft = access.reduce((n, a) => n + a.examAttemptsRemaining, 0);
  const openExam = attempts.data?.find((a) => a.mode === "EXAM" && a.status === "IN_PROGRESS");
  const earliestExpiry = access.length ? access.map((a) => a.expiresAt).sort()[0] : null;

  return (
    <LearnerShell title="Simulateur PL-300" description="Entraînez-vous dans les conditions de l'examen Microsoft, avec correction détaillée en français.">
      <div className="flex flex-col gap-6">
        {catalog.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {catalog.isError && <ErrorNotice>{errorMessage(catalog.error, "Impossible de charger le simulateur.")}</ErrorNotice>}

        {c && access.length === 0 && (
          <EmptyState
            title="Vous n'avez pas d'accès actif au simulateur"
            text="Découvrez les forfaits ou contactez l'équipe si vous venez de payer : l'accès est ouvert dès validation."
            action={<Link to="/simulateur-pl-300" className="font-bold text-navy underline underline-offset-2">Voir l'offre →</Link>}
          />
        )}

        {c && access.length > 0 && (
          <>
            <Card radius="callout" variant="navy" className="flex flex-wrap items-center gap-x-8 gap-y-4 p-6">
              <div className="min-w-48 flex-1">
                <p className="text-sm text-[#D5DEE8]">{c.name} · {c.blueprintLabel}</p>
                <h2 className="font-heading text-2xl font-bold">{PLAN_LABELS[access[0].planCode]}</h2>
                {earliestExpiry && <p className="mt-1 text-sm text-[#D5DEE8]">Accès jusqu'au {day(earliestExpiry)}</p>}
              </div>
              <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <div><dt className="text-[#D5DEE8]">Examens blancs restants</dt><dd className="font-heading text-2xl font-bold">{examsLeft}</dd></div>
                <div><dt className="text-[#D5DEE8]">Durée d'un examen</dt><dd className="font-heading text-2xl font-bold">{c.durationMinutes} min</dd></div>
                <div><dt className="text-[#D5DEE8]">Réussite à partir de</dt><dd className="font-heading text-2xl font-bold">{c.passScore}/1000</dd></div>
              </dl>
            </Card>

            <Card radius="stat" className="flex flex-wrap items-center gap-4 p-5">
              <Timer className="h-8 w-8 shrink-0 text-cta" aria-hidden="true" />
              <div className="min-w-56 flex-1">
                <h3 className="font-heading text-lg font-bold text-navy">Examen blanc</h3>
                <p className="text-sm text-ink-secondary">
                  {c.examQuestions} questions réparties comme à l'examen, {c.durationMinutes} minutes. La correction n'apparaît qu'à la fin ; le temps est décompté par le serveur.
                </p>
              </div>
              {openExam ? (
                <Button asChild shape="rounded"><Link to={`/espace/simulateur/tentatives/${openExam.id}`}><PlayCircle />Reprendre l'examen</Link></Button>
              ) : (
                <Button type="button" shape="rounded" disabled={start.isPending || examsLeft <= 0} onClick={() => launch({ mode: "EXAM" })}>
                  {start.isPending ? <Loader2 className="animate-spin" /> : <PlayCircle />}Démarrer un examen
                </Button>
              )}
              {!openExam && examsLeft <= 0 && <p className="basis-full text-sm text-warning">Vous avez utilisé tous vos examens blancs. L'entraînement par domaine reste illimité.</p>}
              {!openExam && examsLeft > 0 && <p className="basis-full text-xs text-ink-secondary">Un examen commencé compte dans votre quota, même abandonné.</p>}
            </Card>

            <section aria-labelledby="study-title" className="flex flex-col gap-3">
              <h3 id="study-title" className="font-heading text-lg font-bold text-navy">S'entraîner par domaine</h3>
              <p className="-mt-2 text-sm text-ink-secondary">Séries de 10 questions avec correction immédiate. Sans limite, sans chronomètre.</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {c.domains.map((d) => (
                  <li key={d.code}>
                    <Card radius="stat" className="flex h-full flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-ink">{d.name}</h4>
                          <p className="text-xs text-ink-secondary">{d.weightMin}–{d.weightMax} % de l'examen · {d.publishedQuestions} question{d.publishedQuestions > 1 ? "s" : ""}</p>
                        </div>
                        <BookOpenCheck className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                      </div>
                      <Button type="button" size="sm" variant="outline" shape="rounded" className="mt-auto self-start" disabled={start.isPending || d.publishedQuestions === 0} onClick={() => launch({ mode: "STUDY", domain: d.code })}>
                        Commencer
                      </Button>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section aria-labelledby="history-title" className="flex flex-col gap-3">
          <h3 id="history-title" className="font-heading text-lg font-bold text-navy">Mes tentatives</h3>
          {attempts.isError && <ErrorNotice>{errorMessage(attempts.error, "Impossible de charger l'historique.")}</ErrorNotice>}
          {attempts.data && attempts.data.length === 0 && <p className="text-sm text-ink-secondary">Aucune tentative pour le moment.</p>}
          {attempts.data && attempts.data.length > 0 && (
            <Card radius="stat" className="overflow-hidden p-0">
              <ul>
                {attempts.data.map((a) => {
                  const r = resultOf(a);
                  const target = a.status === "IN_PROGRESS" ? `/espace/simulateur/tentatives/${a.id}` : `/espace/simulateur/tentatives/${a.id}/rapport`;
                  return (
                    <li key={a.id} className="border-b border-[#E7E0D4] last:border-b-0">
                      <Link to={target} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-app-bg">
                        <span className="min-w-36 flex-1 text-sm font-semibold text-ink">{MODE_LABELS[a.mode]}<span className="ml-2 font-normal text-ink-secondary">{a.totalQuestions} questions</span></span>
                        <span className="flex items-center gap-1.5 text-xs text-ink-secondary"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{stamp(a.startedAt)}</span>
                        <Pill variant="neutral">{STATUS_LABELS[a.status]}</Pill>
                        <Pill variant={r.variant}>{r.label}</Pill>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </LearnerShell>
  );
}
