/**
 * SessionActions — actions de l'équipe pédagogique sur une session : message aux apprenants, questions des
 * leçons, correction du projet final, délivrance de certificats, affectation du formateur.
 * Utilisées par la page de suivi de session (AdminSessionSuivi).
 */
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, Loader2, MessageCircle } from "lucide-react";

import { ErrorNotice, errorMessage, Field, inputClass } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIssueCertificate } from "@/hooks/useAdminOps";
import { QUIZ_STATUS_LABELS, attemptsLabel, type QuizSummary } from "@/types/evaluation.type";
import {
  useAnswerQuestion, useAssignTrainer, useGrantAttempts, useLearnerQuizzes, useProjectFiles, useReviewProject, useSendSessionMessage,
  useSessionMessages, useSessionQuestions, useTrainers,
} from "@/hooks/useSessionOps";
import { useToast } from "@/hooks/use-toast";
import type { ProjectDecision } from "@/services/api/sessionOpsService";
import type { TrackedLearner } from "@/types/evaluation.type";

const stamp = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM HH:mm", { locale: fr }) : "—");

// ─── Message aux apprenants ───────────────────────────────────────────────────

export function SessionMessageDialog({
  sessionId, recipients, totalLearners, onClose,
}: { sessionId: string; recipients: TrackedLearner[]; totalLearners: number; onClose: () => void }) {
  const { toast } = useToast();
  const send = useSendSessionMessage(sessionId);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const toAll = recipients.length === 0 || recipients.length === totalLearners;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await send.mutateAsync({
        subject: subject.trim(),
        body: body.trim(),
        learnerIds: toAll ? undefined : recipients.map((r) => r.learnerId),
      });
      toast({ title: "Message en cours d'envoi", description: `${res.recipientCount} destinataire${res.recipientCount > 1 ? "s" : ""}.` });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "L'envoi a échoué."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !send.isPending && onClose()}>
      <DialogContent className="max-w-lg rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Écrire aux apprenants</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            {toAll ? `Tous les apprenants de la session (${totalLearners})` : `${recipients.length} apprenant${recipients.length > 1 ? "s" : ""} sélectionné${recipients.length > 1 ? "s" : ""}`} recevront ce message par e-mail.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <Field label="Objet *" htmlFor="sm-subject"><input id="sm-subject" required maxLength={150} className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Message *" htmlFor="sm-body" hint="5 000 caractères maximum.">
            <textarea id="sm-body" required rows={7} maxLength={5000} className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={send.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="navy" shape="rounded" disabled={send.isPending}>
              {send.isPending ? <Loader2 className="animate-spin" /> : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Quiz d'un apprenant : tentatives ─────────────────────────────────────────

const QUIZ_PILL: Record<string, "success" | "warning" | "error" | "neutral" | "info"> = {
  PASSED: "success", FAILED: "error", AVAILABLE: "warning", TO_DO: "neutral", LOCKED: "neutral",
};

function GrantForm({ quiz, onGrant, onCancel, pending }: {
  quiz: QuizSummary; pending: boolean; onCancel: () => void;
  onGrant: (extra: number, reason: string) => Promise<void>;
}) {
  const [extra, setExtra] = useState("1");
  const [reason, setReason] = useState("");
  return (
    <form
      className="mt-3 flex flex-col gap-3 rounded-xl bg-app-bg p-3"
      onSubmit={async (e) => { e.preventDefault(); await onGrant(Number(extra), reason.trim()); }}
    >
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <Field label="Tentatives" htmlFor={`gx-${quiz.id}`}>
          <input id={`gx-${quiz.id}`} type="number" min={1} max={10} required className={inputClass} value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
        <Field label="Motif *" htmlFor={`gr-${quiz.id}`} hint="Conservé avec l'octroi (ex. limite réglée à 1 par erreur).">
          <input id={`gr-${quiz.id}`} required maxLength={1000} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" shape="rounded" size="sm" disabled={pending} onClick={onCancel}>Annuler</Button>
        <Button type="submit" shape="rounded" size="sm" disabled={pending || !reason.trim()}>{pending ? <Loader2 className="animate-spin" /> : "Accorder"}</Button>
      </div>
    </form>
  );
}

export function LearnerQuizzesDialog({ sessionId, learner, onClose }: { sessionId: string; learner: TrackedLearner; onClose: () => void }) {
  const { toast } = useToast();
  const { data: quizzes = [], isLoading, isError } = useLearnerQuizzes(sessionId, learner.learnerId);
  const grant = useGrantAttempts(sessionId, learner.learnerId);
  const [granting, setGranting] = useState<string | null>(null);
  const [error, setError] = useState("");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Quiz de {learner.name}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Tentatives utilisées et limite. Vous pouvez accorder des tentatives supplémentaires à cet apprenant seulement (la limite du quiz, pour tous, se règle dans le programme).
          </DialogDescription>
        </DialogHeader>
        {error && <ErrorNotice>{error}</ErrorNotice>}
        {isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les quiz de cet apprenant.</ErrorNotice>}
        {!isLoading && !isError && quizzes.length === 0 && <p className="text-sm text-ink-secondary">Cette formation n'a pas de quiz.</p>}
        <ul className="flex flex-col gap-3">
          {quizzes.map((q) => (
            <li key={q.id} className="rounded-card border border-[#E7E0D4] bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 font-semibold text-ink">{q.title}</span>
                <Pill variant={QUIZ_PILL[q.status] ?? "neutral"}>{QUIZ_STATUS_LABELS[q.status]}</Pill>
              </div>
              <p className="mt-1 text-xs text-ink-secondary">
                Tentatives {attemptsLabel(q.attemptsUsed, q.maxAttempts)}
                {(q.extraAttempts ?? 0) > 0 && <> · dont {q.extraAttempts} accordée{(q.extraAttempts ?? 0) > 1 ? "s" : ""}</>}
                {q.bestScore != null && <> · meilleur score {q.bestScore} % (seuil {q.passThreshold} %)</>}
              </p>
              {q.maxAttempts != null && q.status !== "PASSED" && granting !== q.id && (
                <Button type="button" variant="outline" shape="rounded" size="sm" className="mt-3" onClick={() => { setError(""); setGranting(q.id); }}>
                  Accorder des tentatives
                </Button>
              )}
              {granting === q.id && (
                <GrantForm
                  quiz={q}
                  pending={grant.isPending}
                  onCancel={() => setGranting(null)}
                  onGrant={async (extra, reason) => {
                    try {
                      await grant.mutateAsync({ quizId: q.id, extraAttempts: extra, reason });
                      toast({ title: "Tentatives accordées", description: `${extra} pour ${learner.name} sur « ${q.title} »` });
                      setGranting(null);
                    } catch (err) {
                      setError(errorMessage(err, "L'octroi a échoué."));
                    }
                  }}
                />
              )}
            </li>
          ))}
        </ul>
        <div className="flex justify-end"><Button type="button" variant="outline" shape="rounded" onClick={onClose}>Fermer</Button></div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Correction du projet final ───────────────────────────────────────────────

export function ProjectReviewDialog({ sessionId, learner, onClose }: { sessionId: string; learner: TrackedLearner; onClose: () => void }) {
  const { toast } = useToast();
  const { data: files = [], isLoading, isError } = useProjectFiles(sessionId, learner.learnerId);
  const review = useReviewProject(sessionId);
  const [decision, setDecision] = useState<ProjectDecision>("VALIDATED");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (decision === "CHANGES_REQUESTED" && !message.trim()) return setError("Précisez les modifications demandées à l'apprenant.");
    try {
      await review.mutateAsync({ learnerId: learner.learnerId, status: decision, message: message.trim() || undefined });
      toast({ title: decision === "VALIDATED" ? "Projet validé" : "Modifications demandées", description: learner.name });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "L'enregistrement a échoué."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !review.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Projet final — {learner.name}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Téléchargez les fichiers rendus, puis validez ou demandez des modifications.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.8px] text-ink-secondary">Fichiers rendus</p>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
          {isError && <ErrorNotice>Impossible de charger les fichiers.</ErrorNotice>}
          {!isLoading && !isError && files.length === 0 && <p className="text-sm text-ink-secondary">Aucun fichier rendu pour le moment.</p>}
          {files.map((f) => (
            <a key={f.id} href={f.downloadUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-[#E7E0D4] px-3.5 py-2.5 text-sm hover:bg-app-bg">
              <span className="flex min-w-0 items-center gap-2"><Download className="h-4 w-4 shrink-0 text-navy" /><span className="truncate font-medium">{f.name}</span></span>
              <span className="shrink-0 text-xs text-ink-secondary">{f.sizeLabel}</span>
            </a>
          ))}
          {files.length > 0 && <p className="text-xs text-ink-secondary">Les liens sont valables 15 minutes.</p>}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-ink">Décision</legend>
            {([
              ["VALIDATED", "Valider le projet"],
              ["CHANGES_REQUESTED", "Demander des modifications"],
            ] as const).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" name="decision" value={value} checked={decision === value} onChange={() => setDecision(value)} className="accent-[#1A3A5B]" />
                {label}
              </label>
            ))}
          </fieldset>
          <Field label={decision === "CHANGES_REQUESTED" ? "Message à l'apprenant *" : "Message à l'apprenant"} htmlFor="pr-message">
            <textarea id="pr-message" rows={4} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={review.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="navy" shape="rounded" disabled={review.isPending}>
              {review.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer la décision"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Délivrance de certificats ────────────────────────────────────────────────

interface IssueResult { learner: TrackedLearner; ok: boolean; message?: string }

export function IssueCertificatesDialog({
  sessionId, learners, canForce, onClose, onDone,
}: { sessionId: string; learners: TrackedLearner[]; canForce: boolean; onClose: () => void; onDone: () => void }) {
  const issue = useIssueCertificate();
  const [force, setForce] = useState(false);
  const [reason, setReason] = useState("");
  const [results, setResults] = useState<IssueResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const out: IssueResult[] = [];
    for (const learner of learners) {
      try {
        await issue.mutateAsync({ sessionId, learnerId: learner.learnerId, force: force || undefined, reason: force ? reason.trim() : undefined });
        out.push({ learner, ok: true });
      } catch (err) {
        out.push({ learner, ok: false, message: errorMessage(err, "Délivrance impossible.") });
      }
    }
    setResults(out);
    setBusy(false);
    onDone();
  };

  const missingReason = force && !reason.trim();

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Délivrer le certificat</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            {learners.length} apprenant{learners.length > 1 ? "s" : ""}. Le certificat n'est délivré que si les conditions de la formation sont remplies (parcours, quiz, projet).
          </DialogDescription>
        </DialogHeader>

        {results ? (
          <div className="flex flex-col gap-2" role="status">
            {results.map((r) => (
              <div key={r.learner.learnerId} className="flex items-start justify-between gap-3 rounded-xl border border-[#E7E0D4] px-3.5 py-2.5 text-sm">
                <span className="font-medium">{r.learner.name}</span>
                {r.ok ? <Pill variant="success">Délivré</Pill> : <span className="max-w-[60%] text-right text-xs text-error">{r.message}</span>}
              </div>
            ))}
            <div className="flex justify-end pt-2"><Button type="button" variant="navy" shape="rounded" onClick={onClose}>Fermer</Button></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ul className="max-h-40 overflow-y-auto text-sm text-ink-secondary">{learners.map((l) => <li key={l.learnerId}>• {l.name}</li>)}</ul>
            {canForce && (
              <div className="flex flex-col gap-2 rounded-xl border border-[#E7E0D4] p-3.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="accent-[#1A3A5B]" />
                  Délivrer par dérogation (même si les conditions ne sont pas remplies)
                </label>
                {force && (
                  <Field label="Motif de la dérogation *" htmlFor="ic-reason">
                    <textarea id="ic-reason" rows={2} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </Field>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" shape="rounded" disabled={busy} onClick={onClose}>Annuler</Button>
              <Button type="button" variant="navy" shape="rounded" disabled={busy || missingReason} onClick={() => void run()}>
                {busy ? <Loader2 className="animate-spin" /> : "Délivrer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Questions des apprenants ─────────────────────────────────────────────────

export function QuestionsCard({ sessionId }: { sessionId: string }) {
  const { toast } = useToast();
  const { data: questions = [], isLoading } = useSessionQuestions(sessionId);
  const answer = useAnswerQuestion(sessionId);
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [showAnswered, setShowAnswered] = useState(false);

  const open = questions.filter((q) => !q.answer);
  const shown = showAnswered ? questions : open;

  const submit = async (questionId: string) => {
    try {
      await answer.mutateAsync({ questionId, answer: text.trim() });
      toast({ title: "Réponse envoyée" });
      setOpenId(null);
      setText("");
    } catch (err) {
      toast({ title: "Envoi impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-bold text-navy">Questions des apprenants</h2>
        {open.length > 0 && <Pill variant="warning">{open.length} à traiter</Pill>}
      </div>
      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
      {!isLoading && shown.length === 0 && <p className="text-sm text-ink-secondary">{questions.length === 0 ? "Aucune question posée pour le moment." : "Toutes les questions ont reçu une réponse."}</p>}
      {shown.map((q) => (
        <div key={q.id} className="flex flex-col gap-2 border-b border-[#E7E0D4] pb-3 last:border-b-0 last:pb-0">
          <p className="text-xs text-ink-secondary"><strong className="text-ink">{q.learnerName}</strong> · {q.lessonTitle} · {stamp(q.askedAt)}</p>
          <p className="text-sm text-ink">{q.question}</p>
          {q.answer ? (
            <p className="rounded-xl bg-success-bg px-3 py-2 text-sm text-success">{q.answer}<span className="mt-1 block text-xs opacity-80">{q.answeredBy} · {stamp(q.answeredAt)}</span></p>
          ) : openId === q.id ? (
            <div className="flex flex-col gap-2">
              <textarea aria-label="Votre réponse" rows={3} maxLength={5000} className={inputClass} value={text} onChange={(e) => setText(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => { setOpenId(null); setText(""); }}>Annuler</Button>
                <Button type="button" variant="navy" shape="rounded" size="sm" disabled={answer.isPending || !text.trim()} onClick={() => void submit(q.id)}>
                  {answer.isPending ? <Loader2 className="animate-spin" /> : "Répondre"}
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => { setOpenId(q.id); setText(""); }}>
              <MessageCircle /> Répondre
            </Button>
          )}
        </div>
      ))}
      {questions.length > open.length && (
        <button type="button" onClick={() => setShowAnswered((v) => !v)} className="w-fit text-xs font-semibold text-navy hover:underline">
          {showAnswered ? "Masquer les questions traitées" : `Voir les questions traitées (${questions.length - open.length})`}
        </button>
      )}
    </Card>
  );
}

// ─── Historique des messages ──────────────────────────────────────────────────

export function MessagesCard({ sessionId }: { sessionId: string }) {
  const { data: messages = [], isLoading } = useSessionMessages(sessionId);
  return (
    <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
      <h2 className="font-heading text-xl font-bold text-navy">Messages envoyés</h2>
      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
      {!isLoading && messages.length === 0 && <p className="text-sm text-ink-secondary">Aucun message envoyé à cette session.</p>}
      {messages.map((m) => (
        <div key={m.id} className="border-b border-[#E7E0D4] pb-3 text-sm last:border-b-0 last:pb-0">
          <p className="font-semibold text-ink">{m.subject}</p>
          <p className="text-xs text-ink-secondary">
            {stamp(m.sentAt)} · {m.sentBy} · {m.deliveredCount ?? "…"}/{m.recipientCount} remis
          </p>
        </div>
      ))}
    </Card>
  );
}

// ─── Formateur de la session ──────────────────────────────────────────────────

export function TrainerAssign({ sessionId, currentName }: { sessionId: string; currentName: string | null }) {
  const { toast } = useToast();
  const { data: trainers = [], isLoading } = useTrainers();
  const assign = useAssignTrainer(sessionId);
  const [value, setValue] = useState("");

  const save = async () => {
    try {
      await assign.mutateAsync(value || null);
      toast({ title: value ? "Formateur affecté" : "Formateur retiré" });
      setValue("");
    } catch (err) {
      toast({ title: "Affectation impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2 border-t border-[#E7E0D4] pt-3">
      <label htmlFor="trainer-select" className="text-xs font-bold uppercase tracking-[0.8px] text-ink-secondary">Affecter un formateur</label>
      <div className="flex gap-2">
        <select id="trainer-select" className={inputClass} value={value} onChange={(e) => setValue(e.target.value)} disabled={isLoading}>
          <option value="">{currentName ? `Actuel : ${currentName}` : "Choisir un formateur"}</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
        </select>
        <Button type="button" variant="outline" shape="rounded" size="sm" disabled={assign.isPending || (!value && !currentName)} onClick={() => void save()}>
          {assign.isPending ? <Loader2 className="animate-spin" /> : value ? "Affecter" : "Retirer"}
        </Button>
      </div>
      {trainers.length === 0 && !isLoading && <p className="text-xs text-ink-secondary">Aucun compte formateur actif : créez-en un dans « Comptes back-office ».</p>}
    </div>
  );
}
