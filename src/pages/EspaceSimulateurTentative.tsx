/**
 * /espace/simulateur/tentatives/:id — passage d'un examen blanc (chronométré) ou d'une série d'étude.
 *
 * Le serveur décide de tout : l'échéance, la note, l'acceptation d'une réponse. Cette page ne fait qu'afficher un compte à
 * rebours aligné sur l'horloge du serveur et envoyer chaque réponse dès qu'elle change (une file garantit l'ordre).
 * Aucun corrigé n'est présent ici pendant un examen ; en mode étude il arrive question par question, après validation.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Flag, Loader2, Timer } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { RichText } from "@/components/rich/RichText";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSaveAnswer, useSimAttempt, useSubmitAttempt } from "@/hooks/useSimulatorLearner";
import { clockOffsetMs, formatClock, isAnswered, questionHint, remainingSeconds, toggleChoice } from "@/lib/simulator";
import { cn } from "@/lib/utils";
import type { AnswerValue, AttemptView, Feedback, QuestionView } from "@/types/simulatorLearner.type";

type SaveState = "idle" | "saving" | "saved" | "error";

const statusOf = (err: unknown) => (err as { status?: number } | null)?.status;
const letter = (id: string) => id;

// ── Saisie d'une réponse ───────────────────────────────────────────────

function AnswerInput({ q, value, disabled, onChange }: { q: QuestionView; value: AnswerValue | null; disabled: boolean; onChange: (v: AnswerValue) => void }) {
  if (q.type === "YES_NO_SERIES") {
    const current = value?.answers ?? {};
    return (
      <ul className="flex flex-col gap-2">
        {(q.payload.statements ?? []).map((s) => (
          <li key={s.id}>
            <fieldset disabled={disabled} className="flex flex-wrap items-center gap-3 rounded-card border border-[#E7E0D4] bg-white p-3">
              <legend className="sr-only">{s.text}</legend>
              <span className="min-w-56 flex-1 text-sm text-ink" aria-hidden="true">{s.text}</span>
              {([true, false] as const).map((v) => (
                <label key={String(v)} className={cn("flex cursor-pointer items-center gap-2 rounded-pill border px-4 py-1.5 text-sm font-semibold", current[s.id] === v ? "border-navy bg-navy text-white" : "border-[#D6CEC0] text-ink hover:border-navy", disabled && "cursor-default opacity-80")}>
                  <input type="radio" className="sr-only" name={`${q.ref}-${s.id}`} checked={current[s.id] === v} onChange={() => onChange({ answers: { ...current, [s.id]: v } })} />
                  {v ? "Oui" : "Non"}
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ul>
    );
  }

  const selected = value?.selected ?? [];
  const multiple = (q.payload.selectCount ?? 1) > 1;
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2">
      <legend className="sr-only">{questionHint(q.type, q.payload)}</legend>
      {(q.payload.choices ?? []).map((c) => {
        const on = selected.includes(c.id);
        return (
          <label key={c.id} className={cn("flex cursor-pointer items-start gap-3 rounded-card border p-3 text-sm", on ? "border-navy bg-info-bg" : "border-[#E7E0D4] bg-white hover:border-navy", disabled && "cursor-default")}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={q.ref}
              className="mt-1 h-4 w-4 shrink-0 accent-[#1A3A5B]"
              checked={on}
              onChange={() => onChange({ selected: toggleChoice(selected, c.id, q.payload.selectCount ?? 1) })}
            />
            <span className="font-heading font-bold text-navy">{letter(c.id)}</span>
            <span className="min-w-0 flex-1 break-words text-ink">{c.text}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

// ── Correction immédiate (étude) ───────────────────────────────────────

function FeedbackPanel({ q, fb }: { q: QuestionView; fb: Feedback }) {
  const right = fb.score >= 1;
  const correct = fb.correctAnswer.selected?.join(", ") ?? Object.entries(fb.correctAnswer.answers ?? {}).map(([k, v]) => `${k} : ${v ? "Oui" : "Non"}`).join(" · ");
  return (
    <Card radius="stat" variant="sand" className="flex flex-col gap-2 p-4" role="status">
      <div className="flex items-center gap-2">
        {right ? <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /> : <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />}
        <p className="font-semibold text-ink">{right ? "Bonne réponse" : fb.score > 0 ? `Partiellement juste (${Math.round(fb.score * 100)} %)` : "Réponse incorrecte"}</p>
      </div>
      {!right && <p className="text-sm text-ink">Bonne réponse : <strong>{correct}</strong></p>}
      {fb.explanationFr && <RichText source={fb.explanationFr} />}
      <span className="sr-only">Question {q.position}</span>
    </Card>
  );
}

// ── Exécution ──────────────────────────────────────────────────────────

function Runner({ attempt }: { attempt: AttemptView }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const saver = useSaveAnswer(attempt.id);
  const submitter = useSubmitAttempt();
  const exam = attempt.mode === "EXAM";
  const questions = attempt.questions;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue | null>>(() => Object.fromEntries(questions.map((q) => [q.ref, q.answer])));
  const [flags, setFlags] = useState<Record<string, boolean>>(() => Object.fromEntries(questions.map((q) => [q.ref, q.flagged])));
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [offset] = useState(() => clockOffsetMs(attempt.serverNow, Date.now()));

  const spent = useRef<Record<string, number>>({});
  const enteredAt = useRef(Date.now());
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const inFlight = useRef(0);
  const finishing = useRef(false);

  const q = questions[index];
  const remaining = remainingSeconds(attempt.deadlineAt, offset, now);
  const answeredCount = questions.filter((x) => isAnswered(answers[x.ref])).length;

  const goToReport = useCallback(() => navigate(`/espace/simulateur/tentatives/${attempt.id}/rapport`, { replace: true }), [navigate, attempt.id]);

  const timeFor = (ref: string) => (spent.current[ref] ?? 0) + (ref === q.ref ? Math.round((Date.now() - enteredAt.current) / 1000) : 0);

  /** Envoie l'état complet de la question (le serveur remplace la réponse : une réponse absente l'effacerait). */
  const save = useCallback((ref: string, answer: AnswerValue | null, flagged: boolean, seconds: number, locked: boolean) => {
    inFlight.current += 1;
    setSaveState("saving");
    chain.current = chain.current
      .then(() => saver.mutateAsync({ ref, body: { answer, flagged, timeSpentSeconds: Math.min(seconds, 36000) } }))
      .then((res) => {
        if (res.feedback) setFeedback((f) => ({ ...f, [ref]: res.feedback as Feedback }));
        if (inFlight.current === 1) setSaveState("saved");
      })
      .catch((err) => {
        if (statusOf(err) === 409) { goToReport(); return; }      // temps écoulé ou tentative déjà terminée
        setSaveState("error");
        toast({ title: "Réponse non enregistrée", description: locked ? errorMessage(err) : "Vérifiez votre connexion, elle sera renvoyée.", variant: "destructive" });
      })
      .finally(() => { inFlight.current -= 1; });
  }, [saver, goToReport, toast]);

  const setAnswer = (value: AnswerValue | null) => {
    setAnswers((a) => ({ ...a, [q.ref]: value }));
    if (exam) save(q.ref, value, flags[q.ref] ?? false, timeFor(q.ref), false);
  };

  const toggleFlag = () => {
    const next = !flags[q.ref];
    setFlags((f) => ({ ...f, [q.ref]: next }));
    save(q.ref, answers[q.ref] ?? null, next, timeFor(q.ref), false);
  };

  const validateStudy = () => save(q.ref, answers[q.ref] ?? null, false, timeFor(q.ref), true);

  const go = (to: number) => {
    spent.current[q.ref] = timeFor(q.ref);
    enteredAt.current = Date.now();
    setIndex(Math.min(Math.max(to, 0), questions.length - 1));
  };

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    try {
      await chain.current;
      await submitter.mutateAsync(attempt.id);
      goToReport();
    } catch (err) {
      finishing.current = false;
      toast({ title: "Remise impossible", description: errorMessage(err), variant: "destructive" });
    }
  }, [submitter, attempt.id, goToReport, toast]);

  // Compte à rebours : le serveur remet l'examen à l'échéance ; on s'y rend dès que le temps est écoulé.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    if (exam && remaining === 0) void finish();
  }, [exam, remaining, finish]);

  // Un examen en cours ne se quitte pas par mégarde.
  useEffect(() => {
    if (!exam) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [exam]);

  const alert = remaining !== null && remaining <= 60 ? "text-error" : remaining !== null && remaining <= 600 ? "text-warning" : "text-navy";
  const announce = remaining !== null && [600, 300, 60].includes(remaining) ? `Il reste ${Math.round(remaining / 60)} minute${remaining > 60 ? "s" : ""}.` : "";
  const locked = !exam && !!feedback[q.ref];
  const unanswered = questions.length - answeredCount;

  const saveLabel = useMemo(() => ({ idle: "", saving: "Enregistrement…", saved: "Enregistré", error: "Non enregistré" }[saveState]), [saveState]);

  return (
    <div className="flex flex-col gap-4">
      <Card radius="stat" className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-2 p-3 shadow-sm">
        <div className="min-w-40 flex-1">
          <p className="text-xs text-ink-secondary">{attempt.trial ? "Mini-test d'essai" : exam ? "Examen blanc" : "Série d'étude"} · question {index + 1} sur {questions.length}</p>
          <ProgressBar value={(answeredCount / Math.max(questions.length, 1)) * 100} aria-label="Questions répondues" />
        </div>
        {remaining !== null && (
          <div className={cn("flex items-center gap-2 font-heading text-xl font-bold tabular-nums", alert)}>
            <Timer className="h-5 w-5" aria-hidden="true" />
            <span role="timer" aria-label={`Temps restant ${formatClock(remaining)}`}>{formatClock(remaining)}</span>
          </div>
        )}
        <span className={cn("text-xs", saveState === "error" ? "font-semibold text-error" : "text-ink-secondary")} aria-live="polite">{saveLabel}</span>
        <Button type="button" shape="rounded" size="sm" onClick={() => setConfirming(true)}>{attempt.trial ? "Terminer le test" : exam ? "Terminer l'examen" : "Terminer la série"}</Button>
      </Card>
      <p className="sr-only" aria-live="assertive">{announce}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
        <Card radius="stat" className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Pill variant="info">{questionHint(q.type, q.payload)}</Pill>
            <Button type="button" size="sm" variant={flags[q.ref] ? "navy" : "outline"} shape="pill" aria-pressed={!!flags[q.ref]} onClick={toggleFlag}>
              <Flag />{flags[q.ref] ? "Marquée pour révision" : "Marquer pour révision"}
            </Button>
          </div>
          <RichText source={q.stem} className="text-base" />
          <AnswerInput q={q} value={answers[q.ref] ?? null} disabled={locked} onChange={setAnswer} />
          {exam && isAnswered(answers[q.ref]) && (
            <button type="button" className="self-start text-xs font-semibold text-ink-secondary underline underline-offset-2" onClick={() => setAnswer(null)}>Effacer ma réponse</button>
          )}
          {!exam && !feedback[q.ref] && (
            <Button type="button" shape="rounded" className="self-start" disabled={!isAnswered(answers[q.ref]) || saveState === "saving"} onClick={validateStudy}>Valider ma réponse</Button>
          )}
          {!exam && feedback[q.ref] && <FeedbackPanel q={q} fb={feedback[q.ref]} />}
          {saveState === "error" && (
            <ErrorNotice>
              Votre dernière réponse n'a pas pu être envoyée.{" "}
              <button type="button" className="font-bold underline" onClick={() => save(q.ref, answers[q.ref] ?? null, flags[q.ref] ?? false, timeFor(q.ref), false)}>Réessayer</button>
            </ErrorNotice>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-[#E7E0D4] pt-4">
            <Button type="button" variant="outline" shape="rounded" disabled={index === 0} onClick={() => go(index - 1)}><ChevronLeft />Précédente</Button>
            <Button type="button" variant="outline" shape="rounded" disabled={index === questions.length - 1} onClick={() => go(index + 1)}>Suivante<ChevronRight /></Button>
          </div>
        </Card>

        <nav aria-label="Navigation entre les questions" className="lg:sticky lg:top-24 lg:self-start">
          <Card radius="stat" className="p-3">
            <ol className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
              {questions.map((x, i) => {
                const done = isAnswered(answers[x.ref]);
                return (
                  <li key={x.ref}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={i === index ? "step" : undefined}
                      aria-label={`Question ${i + 1}${done ? ", répondue" : ", sans réponse"}${flags[x.ref] ? ", marquée" : ""}`}
                      className={cn(
                        "relative h-9 w-full rounded-lg border text-sm font-semibold",
                        i === index ? "border-navy bg-navy text-white" : done ? "border-success/40 bg-success-bg text-success" : "border-[#D6CEC0] bg-white text-ink hover:border-navy",
                      )}
                    >
                      {i + 1}
                      {flags[x.ref] && <Flag className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-cta text-cta" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>
        </nav>
      </div>

      <Dialog open={confirming} onOpenChange={(o) => !submitter.isPending && setConfirming(o)}>
        <DialogContent className="max-w-md rounded-callout">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold text-navy">{exam ? "Terminer l'examen ?" : "Terminer la série ?"}</DialogTitle>
            <DialogDescription className="text-ink-secondary">
              {unanswered > 0 ? `${unanswered} question${unanswered > 1 ? "s" : ""} sans réponse seront comptées fausses. ` : "Toutes les questions ont une réponse. "}
              Cette action est définitive{exam ? " : la correction s'affiche ensuite." : "."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={submitter.isPending} onClick={() => setConfirming(false)}>Continuer</Button>
            <Button type="button" shape="rounded" disabled={submitter.isPending} onClick={() => void finish()}>{submitter.isPending ? <Loader2 className="animate-spin" /> : "Terminer"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EspaceSimulateurTentative() {
  const { id } = useParams();
  const { data: attempt, isLoading, error } = useSimAttempt(id);

  if (attempt && attempt.status !== "IN_PROGRESS") return <Navigate to={`/espace/simulateur/tentatives/${attempt.id}/rapport`} replace />;

  return (
    <LearnerShell title="Simulateur PL-300" withTabBar={false}>
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {error && <ErrorNotice>{errorMessage(error, "Cette tentative est introuvable.")}</ErrorNotice>}
      {attempt && attempt.status === "IN_PROGRESS" && <Runner key={attempt.id} attempt={attempt} />}
    </LearnerShell>
  );
}
