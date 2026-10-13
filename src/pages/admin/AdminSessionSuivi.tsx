/**
 * AdminSessionSuivi.tsx — Lot 6 (docs/design/screens/app/App-Admin-Session.dc.html)
 * Route : /admin/sessions/:id
 *
 * Suivi d'une session : KPI, apprenants (progression, quiz, projet, certificat), lives et appel.
 * Actions réelles : appel, export CSV, ajout d'un apprenant (candidature manuelle rattachée à la session),
 * message aux apprenants, délivrance de certificats (dérogation motivée pour les administrateurs),
 * correction du projet final, réponse aux questions des leçons et affectation du formateur.
 */
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Download, Loader2, MessageCircle, Plus, Award } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button, Card, Pill } from "@/components/shared";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import {
  IssueCertificatesDialog, MessagesCard, ProjectReviewDialog, QuestionsCard, SessionMessageDialog, TrainerAssign,
} from "@/components/admin/SessionActions";
import { DemoDataBanner } from "@/components/learner/LearnerShell";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EVALUATION_KEYS, useSaveAttendance, useSessionTracking } from "@/hooks/useEvaluations";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { csvRow, downloadCsv } from "@/lib/csv";
import {
  CERTIFICATE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  type CertificateTrackingStatus,
  type ProjectStatus,
  type SessionLive,
  type SessionTracking,
  type TrackedLearner,
} from "@/types/evaluation.type";

const AVATAR_COLORS = ["#5B4B8A", "#0F5C73", "#8A5A00", "#1A3A5B", "#9A2E06", "#1F6B4F"];
const ROW_GRID = "lg:grid lg:grid-cols-[28px_minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-3";

const PROJECT_PILL: Record<ProjectStatus, "success" | "warning" | "error"> = {
  VALIDATED: "success",
  SUBMITTED: "warning",
  CHANGES_REQUESTED: "warning",
  NOT_STARTED: "error",
};

const CERT_PILL: Record<CertificateTrackingStatus, "success" | "neutral" | "error" | "info"> = {
  READY: "success",
  PENDING: "neutral",
  AT_RISK: "error",
  ISSUED: "info",
};

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

function formatDate(iso: string | null): string {
  return iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "—";
}

function exportCsv(tracking: SessionTracking) {
  const header = ["Apprenant", "Profil", "Progression (%)", "Quiz réussis", "Quiz total", "Projet final", "Certificat"];
  const rows = tracking.learners.map((l) => [
    l.name, l.subtitle ?? "", l.progressPercent, l.quizPassed, l.quizTotal,
    PROJECT_STATUS_LABELS[l.project], CERTIFICATE_STATUS_LABELS[l.certificate],
  ]);
  downloadCsv(
    `suivi-${tracking.sessionName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`,
    [header, ...rows].map(csvRow),
  );
}

function progressColor(p: number): string {
  return p >= 85 ? "#1F6B4F" : "#8A5A00";
}

function LearnerRow({ l, selected, onToggle, onReview }: { l: TrackedLearner; selected: boolean; onToggle: () => void; onReview: () => void }) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-[#E7E0D4] px-4 py-4 text-sm lg:py-3.5", ROW_GRID)}>
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          aria-label={`Sélectionner ${l.name}`}
          checked={selected}
          onChange={onToggle}
          className="h-[18px] w-[18px] accent-[#1A3A5B]"
        />
        <span className="flex min-w-0 items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-xs font-bold text-white" style={{ background: avatarColor(l.name) }}>
            {initials(l.name)}
          </span>
          <span className="flex flex-col"><span className="font-bold">{l.name}</span><span className="text-xs text-ink-secondary">{l.subtitle}</span></span>
        </span>
      </span>
      <span className="hidden min-w-0 items-center gap-2 lg:flex">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-xs font-bold text-white" style={{ background: avatarColor(l.name) }}>
          {initials(l.name)}
        </span>
        <span className="flex min-w-0 flex-col"><span className="truncate font-bold">{l.name}</span><span className="truncate text-xs text-ink-secondary">{l.subtitle}</span></span>
      </span>
      <span className="flex flex-col gap-1.5">
        <div
          role="progressbar"
          aria-label={`Progression de ${l.name}`}
          aria-valuenow={l.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-pill bg-[#ECE6DB]"
        >
          <div className="h-full rounded-pill" style={{ width: `${l.progressPercent}%`, background: progressColor(l.progressPercent) }} />
        </div>
        <span className="text-xs text-ink-secondary">{l.progressPercent} %</span>
      </span>
      <span className="font-semibold"><span className="font-normal text-ink-secondary lg:hidden">Quiz : </span>{l.quizPassed}/{l.quizTotal}</span>
      <span className="flex flex-wrap items-center gap-2">
        <Pill variant={PROJECT_PILL[l.project]}>{PROJECT_STATUS_LABELS[l.project]}</Pill>
        {(l.project === "SUBMITTED" || l.project === "CHANGES_REQUESTED") && (
          <button type="button" onClick={onReview} className="text-xs font-semibold text-navy underline underline-offset-2 hover:text-cta">Corriger</button>
        )}
      </span>
      <span><Pill variant={CERT_PILL[l.certificate]}>{CERTIFICATE_STATUS_LABELS[l.certificate]}</Pill></span>
    </div>
  );
}

function AttendanceDialog({
  open, onOpenChange, tracking, sessionId,
}: { open: boolean; onOpenChange: (o: boolean) => void; tracking: SessionTracking; sessionId: string }) {
  const { toast } = useToast();
  const save = useSaveAttendance(sessionId);
  const defaultLive = tracking.lives.find((l) => l.status === "UPCOMING") ?? tracking.lives[tracking.lives.length - 1];
  const [liveId, setLiveId] = useState(defaultLive?.id ?? "");
  const live = tracking.lives.find((l) => l.id === liveId);
  const [present, setPresent] = useState<Set<string>>(new Set(live?.presentLearnerIds ?? []));

  const selectLive = (id: string) => {
    setLiveId(id);
    setPresent(new Set(tracking.lives.find((l) => l.id === id)?.presentLearnerIds ?? []));
  };

  const toggle = (id: string) =>
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleSave = async () => {
    if (!live) return;
    try {
      await save.mutateAsync({ liveId: live.id, update: { presentLearnerIds: Array.from(present) } });
      toast({ title: "Appel enregistré", description: `${live.title} · ${present.size}/${tracking.learners.length} présents` });
      onOpenChange(false);
    } catch {
      toast({ title: "Appel non enregistré", description: "Réessayez dans un instant.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Faire l'appel</DialogTitle>
          <DialogDescription className="text-ink-secondary">Cochez les apprenants présents à la séance.</DialogDescription>
        </DialogHeader>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Séance
          <select
            value={liveId}
            onChange={(e) => selectLive(e.target.value)}
            className="rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-navy"
          >
            {tracking.lives.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </label>

        <fieldset className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          <legend className="sr-only">Présents</legend>
          {tracking.learners.map((l) => (
            <label key={l.learnerId} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-app-bg">
              <input
                type="checkbox"
                checked={present.has(l.learnerId)}
                onChange={() => toggle(l.learnerId)}
                className="h-[18px] w-[18px] accent-[#1A3A5B]"
              />
              {l.name}
            </label>
          ))}
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-secondary">{present.size} / {tracking.learners.length} présents</span>
          <Button type="button" variant="navy" shape="rounded" disabled={save.isPending || !live} onClick={() => void handleSave()}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <><Check />Enregistrer</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LiveRow({ live, total }: { live: SessionLive; total: number }) {
  let pill: React.ReactNode;
  if (live.presentLearnerIds) {
    const n = live.presentLearnerIds.length;
    pill = <Pill variant={total > 0 && n / total >= 0.75 ? "success" : "warning"}>{n === total ? `${n}/${total} présents` : `${n}/${total}`}</Pill>;
  } else if (live.status === "UPCOMING") {
    pill = <Pill variant="neutral">À venir</Pill>;
  } else {
    pill = <Pill variant="warning">Appel à faire</Pill>;
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E7E0D4] py-2 text-sm">
      <span className="min-w-0 truncate">{live.title}</span>
      {pill}
    </div>
  );
}

export default function AdminSessionSuivi() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  // Le programme de la formation n'est ouvert qu'à qui peut le modifier (403 pour un formateur)
  const canOpenProgram = can("PROGRAM_MANAGE");
  const { data: result, isLoading, isError } = useSessionTracking(id);
  const tracking = result?.data;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [reviewing, setReviewing] = useState<TrackedLearner | null>(null);
  const qc = useQueryClient();
  const canForce = can("CERTIFICATES_OVERRIDE");          // délivrer un certificat par dérogation
  const canAddLearner = can("ENROLLMENTS_MANAGE");
  const canAssignTrainer = can("SESSIONS_ASSIGN");
  const canIssueCertificate = can("CERTIFICATES_MANAGE");

  const kpis = useMemo(() => {
    if (!tracking) return [];
    const n = tracking.learners.length;
    const avg = n === 0 ? 0 : Math.round(tracking.learners.reduce((a, l) => a + l.progressPercent, 0) / n);
    return [
      { label: "Inscrits", value: `${n} / ${tracking.capacity}` },
      { label: "Progression moyenne", value: `${avg} %` },
      { label: "Projets à corriger", value: String(tracking.learners.filter((l) => l.project === "SUBMITTED").length) },
      { label: "Certificats délivrés", value: String(tracking.learners.filter((l) => l.certificate === "ISSUED").length) },
    ];
  }, [tracking]);

  const toggle = (learnerId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(learnerId)) next.delete(learnerId); else next.add(learnerId);
      return next;
    });

  const dates = tracking ? `${formatDate(tracking.startDate)} → ${formatDate(tracking.endDate)}` : "";

  return (
    <AdminLayout
      title={tracking?.sessionName ?? "Suivi de session"}
      description={tracking ? `Sessions / ${tracking.formationTitle}` : undefined}
      actions={
        tracking?.formationId && canOpenProgram ? (
          <Button asChild variant="outline" shape="rounded" size="sm" className="hidden sm:inline-flex">
            <Link to={`/admin/formations/${tracking.formationId}`}>Ouvrir la vue formateur</Link>
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6">
        {result?.demo && <DemoDataBanner />}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger le suivi de cette session.
          </div>
        )}

        {tracking && id && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {kpis.map((k) => (
                <Card key={k.label} radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-5">
                  <span className="text-sm text-ink-secondary">{k.label}</span>
                  <span className="font-heading text-[30px] font-extrabold text-navy">{k.value}</span>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card radius="stat" className="flex min-w-0 flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading text-xl font-bold text-navy">Apprenants ({tracking.learners.length})</h2>
                  <div className="flex flex-wrap gap-2.5">
                    <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => exportCsv(tracking)}>
                      <Download />Exporter CSV
                    </Button>
                    <Button type="button" variant="outline" shape="rounded" size="sm" disabled={tracking.learners.length === 0} onClick={() => { setSelected(new Set()); setMessageOpen(true); }}>
                      <MessageCircle />Écrire à la session
                    </Button>
                    {canAddLearner && (
                      <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => setAddOpen(true)}>
                        <Plus />Ajouter un apprenant
                      </Button>
                    )}
                  </div>
                </div>

                {selected.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl bg-info-bg px-4 py-3">
                    <span className="flex-1 font-bold text-navy">
                      {selected.size} apprenant{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
                    </span>
                    <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setMessageOpen(true)}>
                      <MessageCircle />Envoyer un message
                    </Button>
                    <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => setIssueOpen(true)}>
                      <Award />Délivrer le certificat
                    </Button>
                  </div>
                )}

                <div className="flex flex-col">
                  <div className={cn("hidden rounded-[10px] bg-app-bg px-4 py-3 text-xs font-bold tracking-[0.8px] text-ink-secondary", ROW_GRID)}>
                    <span /><span>APPRENANT</span><span>PROGRESSION</span><span>QUIZ</span><span>PROJET FINAL</span><span>CERTIFICAT</span>
                  </div>
                  {tracking.learners.length === 0 && (
                    <p className="px-4 py-6 text-sm text-ink-secondary">Aucun apprenant inscrit à cette session pour le moment.</p>
                  )}
                  {tracking.learners.map((l) => (
                    <LearnerRow key={l.learnerId} l={l} selected={selected.has(l.learnerId)} onToggle={() => toggle(l.learnerId)} onReview={() => setReviewing(l)} />
                  ))}
                </div>
              </Card>

              <div className="flex min-w-0 flex-col gap-5">
                <Card radius="stat" className="flex flex-col gap-1 border border-[#E7E0D4] p-5 lg:p-6">
                  <h2 className="mb-2 font-heading text-xl font-bold text-navy">Session</h2>
                  {[
                    ["Formation", tracking.formationTitle],
                    ["Dispensé par", tracking.deliveredBy],
                    ["Formateur", tracking.trainerName ?? "—"],
                    ["Dates", dates],
                    ["Format", tracking.formatLabel],
                    ["Statut", tracking.statusLabel],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-[#E7E0D4] py-2 text-sm last:border-b-0">
                      <span className="text-ink-secondary">{k}</span>
                      <span className="text-right font-semibold">{v}</span>
                    </div>
                  ))}
                  {canAssignTrainer && <TrainerAssign sessionId={id} currentName={tracking.trainerName} />}
                </Card>

                <Card radius="stat" className="flex flex-col gap-1 border border-[#E7E0D4] p-5 lg:p-6">
                  <h2 className="mb-2 font-heading text-xl font-bold text-navy">Lives & présence</h2>
                  {tracking.lives.length === 0 && <p className="text-sm text-ink-secondary">Aucune séance planifiée.</p>}
                  {tracking.lives.map((live) => <LiveRow key={live.id} live={live} total={tracking.learners.length} />)}
                  {tracking.lives.length > 0 && tracking.learners.length > 0 && (
                    <Button type="button" variant="outline" shape="rounded" className="mt-3" onClick={() => setAttendanceOpen(true)}>
                      <Check />Faire l'appel
                    </Button>
                  )}
                </Card>

                <QuestionsCard sessionId={id} />
                <MessagesCard sessionId={id} />
              </div>
            </div>

            {addOpen && <ManualRegistrationDialog presetFormationId={tracking.formationId ?? undefined} presetSessionId={id} onClose={() => setAddOpen(false)} />}
            {messageOpen && (
              <SessionMessageDialog
                sessionId={id}
                recipients={tracking.learners.filter((l) => selected.has(l.learnerId))}
                totalLearners={tracking.learners.length}
                onClose={() => setMessageOpen(false)}
              />
            )}
            {issueOpen && (
              <IssueCertificatesDialog
                sessionId={id}
                learners={tracking.learners.filter((l) => selected.has(l.learnerId))}
                canForce={canForce}
                onClose={() => setIssueOpen(false)}
                onDone={() => qc.invalidateQueries({ queryKey: EVALUATION_KEYS.tracking(id) })}
              />
            )}
            {reviewing && <ProjectReviewDialog sessionId={id} learner={reviewing} onClose={() => setReviewing(null)} />}

            {attendanceOpen && (
              <AttendanceDialog open={attendanceOpen} onOpenChange={setAttendanceOpen} tracking={tracking} sessionId={id} />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
