/**
 * QuizRunner.tsx — Lot 6 (docs/design/screens/app/M-Quiz.dc.html)
 * Route : /espace/formations/:id/evaluations/:quizId
 *
 * Trois étapes : présentation (tentative n / max, seuil, durée) → questions (une par écran,
 * chrono si limité, reprise après rechargement) → résultat (score, correction si fournie).
 * Le score et le seuil sont décidés par le serveur ; les bonnes réponses ne sont jamais
 * connues du client avant la soumission.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";

import { Button, Card, Pill } from "@/components/shared";
import { DemoDataBanner } from "@/components/learner/LearnerShell";
import { useEvaluationsOverview, useStartQuizAttempt, useSubmitQuizAttempt } from "@/hooks/useEvaluations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  attemptsLabel,
  attemptsRemaining,
  quizFormatLabel,
  type QuizAttemptResult,
  type QuizAttemptStart,
} from "@/types/evaluation.type";

interface StoredRun {
  attempt: QuizAttemptStart;
  answers: Record<string, string>;
  index: number;
}

const storageKey = (quizId: string) => `quiz-run:${quizId}`;

function loadRun(quizId: string): StoredRun | null {
  try {
    const raw = sessionStorage.getItem(storageKey(quizId));
    return raw ? (JSON.parse(raw) as StoredRun) : null;
  } catch {
    return null;
  }
}

function saveRun(quizId: string, run: StoredRun | null) {
  try {
    if (run) sessionStorage.setItem(storageKey(quizId), JSON.stringify(run));
    else sessionStorage.removeItem(storageKey(quizId));
  } catch {
    /* stockage indisponible : la reprise après rechargement n'est simplement pas offerte */
  }
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function secondsLeft(attempt: QuizAttemptStart): number | null {
  if (!attempt.timeLimitMinutes) return null;
  const end = new Date(attempt.startedAt).getTime() + attempt.timeLimitMinutes * 60000;
  return Math.max(0, Math.round((end - Date.now()) / 1000));
}

function Frame({ backTo, title, right, children }: { backTo: string; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-site-bg">
      <header className="flex items-center gap-1.5 border-b border-[#E7E0D4] bg-white px-5 py-2.5">
        <Link to={backTo} aria-label="Retour aux évaluations" className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-xl text-navy">
          <ArrowLeft className="h-[22px] w-[22px]" />
        </Link>
        <h1 className="flex-1 truncate font-heading text-[19px] font-extrabold text-navy">{title}</h1>
        {right}
      </header>
      {children}
    </div>
  );
}

export default function QuizRunner() {
  const { id: formationId = "", quizId = "" } = useParams<{ id: string; quizId: string }>();
  const { toast } = useToast();
  const overviewQuery = useEvaluationsOverview(formationId);
  const start = useStartQuizAttempt();
  const submit = useSubmitQuizAttempt(formationId);

  const backTo = `/espace/formations/${formationId}/evaluations`;
  const quiz = overviewQuery.data?.data.quizzes.find((q) => q.id === quizId);

  const [run, setRun] = useState<StoredRun | null>(() => loadRun(quizId));
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [finished, setFinished] = useState<QuizAttemptStart | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const submitting = useRef(false);

  const update = useCallback(
    (next: StoredRun | null) => {
      setRun(next);
      saveRun(quizId, next);
    },
    [quizId]
  );

  const finish = useCallback(
    async (current: StoredRun) => {
      if (submitting.current) return;
      submitting.current = true;
      try {
        const res = await submit.mutateAsync({ attemptId: current.attempt.attemptId, submission: { answers: current.answers } });
        update(null);
        setFinished(current.attempt);
        setResult(res);
      } catch {
        submitting.current = false;
        toast({ title: "Envoi impossible", description: "Vos réponses sont conservées, réessayez.", variant: "destructive" });
      }
    },
    [submit, update, toast]
  );

  // Chrono : mise à jour chaque seconde, envoi automatique à l'expiration
  useEffect(() => {
    if (!run) return;
    const tick = () => {
      const left = secondsLeft(run.attempt);
      setRemaining(left);
      if (left === 0) void finish(run);
    };
    tick();
    if (!run.attempt.timeLimitMinutes) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [run, finish]);

  const handleStart = async () => {
    try {
      const attempt = await start.mutateAsync(quizId);
      submitting.current = false;
      setResult(null);
      update({ attempt, answers: {}, index: 0 });
    } catch (e) {
      toast({ title: "Impossible de démarrer le quiz", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    }
  };

  const question = run?.attempt.questions[run.index];
  const answeredCount = useMemo(() => (run ? Object.keys(run.answers).length : 0), [run]);

  // ── Chargement / erreurs ──────────────────────────────────────────────────
  if (overviewQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>;
  }
  if (!quiz) {
    return (
      <Frame backTo={backTo} title="Quiz">
        <div className="mx-auto w-full max-w-xl p-6">
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">Ce quiz est introuvable.</div>
        </div>
      </Frame>
    );
  }

  // ── Résultat ──────────────────────────────────────────────────────────────
  if (result) {
    const left = result.attemptsRemaining;
    const questions = new Map((finished?.questions ?? []).map((qq) => [qq.id, qq]));
    return (
      <Frame backTo={backTo} title={quiz.title}>
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-5 lg:py-10">
          <Card radius="callout" className="flex flex-col items-center gap-3 border border-[#E7E0D4] p-8 text-center">
            <Pill variant={result.passed ? "success" : "error"}>{result.passed ? "Réussi" : "Non validé"}</Pill>
            <span className="font-heading text-[56px] font-extrabold leading-none text-navy">{result.score} %</span>
            <p className="text-ink-secondary">
              {result.correctCount} bonne{result.correctCount > 1 ? "s" : ""} réponse{result.correctCount > 1 ? "s" : ""} sur {result.questionCount} · seuil {quiz.passThreshold} %
            </p>
            <p className="text-sm text-ink-secondary">
              Tentative {result.attemptNumber}{quiz.maxAttempts ? ` sur ${quiz.maxAttempts}` : ""}
            </p>
          </Card>

          {result.review && questions.size > 0 && (
            <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5">
              <h2 className="font-heading text-lg font-bold text-navy">Correction</h2>
              {result.review.map((r, i) => {
                const qq = questions.get(r.questionId);
                if (!qq) return null;
                const ok = r.chosenChoiceId === r.correctChoiceId;
                const label = (id: string | null) => qq.choices.find((c) => c.id === id)?.label ?? "Sans réponse";
                return (
                  <div key={r.questionId} className="flex flex-col gap-1.5 border-b border-[#E7E0D4] pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill text-white", ok ? "bg-success" : "bg-error")} aria-label={ok ? "Correct" : "Incorrect"}>
                        {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      <span className="text-[15px] font-semibold text-ink">{i + 1}. {qq.text}</span>
                    </div>
                    {!ok && (
                      <p className="pl-7 text-sm text-ink-secondary">
                        Votre réponse : <span className="text-error">{label(r.chosenChoiceId)}</span>
                      </p>
                    )}
                    <p className="pl-7 text-sm text-ink-secondary">
                      Bonne réponse : <span className="font-semibold text-success">{label(r.correctChoiceId)}</span>
                    </p>
                    {r.explanation && <p className="pl-7 text-[13px] text-ink-secondary">{r.explanation}</p>}
                  </div>
                );
              })}
            </Card>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {!result.passed && left !== 0 && (
              <Button type="button" variant="primary" shape="rounded" size="lg" disabled={start.isPending} onClick={() => void handleStart()}>
                {start.isPending ? <Loader2 className="animate-spin" /> : "Réessayer"}
              </Button>
            )}
            <Button asChild variant={result.passed ? "primary" : "outline"} shape="rounded" size="lg" className={result.passed ? "sm:col-span-2" : undefined}>
              <Link to={backTo}>Retour aux évaluations</Link>
            </Button>
          </div>
        </main>
      </Frame>
    );
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  if (run && question) {
    const total = run.attempt.questions.length;
    const isLast = run.index === total - 1;
    const chosen = run.answers[question.id];
    const select = (choiceId: string) => update({ ...run, answers: { ...run.answers, [question.id]: choiceId } });
    const urgent = remaining != null && remaining <= 60;

    return (
      <Frame
        backTo={backTo}
        title={run.attempt.title}
        right={remaining != null && (
          <span role="timer" aria-label="Temps restant" className={cn("text-sm font-bold tabular-nums", urgent ? "text-error" : "text-warning")}>
            {formatClock(remaining)}
          </span>
        )}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="flex flex-col gap-2 px-5 pt-4">
            <div className="flex justify-between text-[13px] text-ink-secondary">
              <span>Question {run.index + 1} sur {total}</span>
              <span>Tentative {run.attempt.attemptNumber}{run.attempt.maxAttempts ? ` sur ${run.attempt.maxAttempts}` : ""}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progression du quiz"
              aria-valuenow={Math.round(((run.index + 1) / total) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-pill bg-[#ECE6DB]"
            >
              <div className="h-full rounded-pill bg-navy transition-all" style={{ width: `${((run.index + 1) / total) * 100}%` }} />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3.5 p-5">
            <h2 className="font-heading text-[21px] font-bold leading-snug text-navy lg:text-2xl">{question.text}</h2>
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="sr-only">Choisissez une réponse</legend>
              {question.choices.map((c, i) => {
                const selected = chosen === c.id;
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-[14px] border p-4 text-[15px] leading-snug",
                      selected ? "border-2 border-navy bg-info-bg" : "border-[#D6CEC0] bg-white"
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={selected}
                      onChange={() => select(c.id)}
                      className="mt-px h-5 w-5 shrink-0 accent-[#1A3A5B]"
                    />
                    <span><span className="font-bold">{"ABCDEF"[i]}.</span> {c.label}</span>
                  </label>
                );
              })}
            </fieldset>
            {isLast && answeredCount < total && (
              <p className="text-[13px] text-warning">
                {total - answeredCount} question{total - answeredCount > 1 ? "s" : ""} sans réponse (compté{total - answeredCount > 1 ? "es" : "e"} comme fausse{total - answeredCount > 1 ? "s" : ""}).
              </p>
            )}
          </div>

          <div className="sticky bottom-0 grid grid-cols-[1fr_2fr] gap-2.5 border-t border-[#E7E0D4] bg-white px-5 pb-6 pt-3">
            <Button
              type="button"
              variant="outline"
              shape="rounded"
              className="min-h-[50px] text-base"
              disabled={run.index === 0}
              onClick={() => update({ ...run, index: run.index - 1 })}
            >
              Préc.
            </Button>
            <Button
              type="button"
              variant="navy"
              shape="rounded"
              className="min-h-[50px] text-base"
              disabled={!chosen || submit.isPending}
              onClick={() => (isLast ? void finish(run) : update({ ...run, index: run.index + 1 }))}
            >
              {submit.isPending ? <Loader2 className="animate-spin" /> : isLast ? "Terminer le quiz" : "Valider"}
            </Button>
          </div>
        </div>
      </Frame>
    );
  }

  // ── Présentation ──────────────────────────────────────────────────────────
  const left = attemptsRemaining(quiz);
  const canStart = quiz.status !== "LOCKED" && left !== 0;
  return (
    <Frame backTo={backTo} title={quiz.title}>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 p-5 lg:py-10">
        {overviewQuery.data?.demo && <DemoDataBanner />}
        <Card radius="callout" className="flex flex-col gap-5 border border-[#E7E0D4] p-6 lg:p-8">
          <div className="flex flex-col gap-2">
            {quiz.status === "PASSED" && <div><Pill variant="success">Réussi · meilleur score {quiz.bestScore} %</Pill></div>}
            {quiz.status === "LOCKED" && <div><Pill variant="neutral">Verrouillé</Pill></div>}
            <h2 className="font-heading text-2xl font-extrabold text-navy">{quiz.title}</h2>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-ink-secondary">Format</dt><dd className="font-semibold text-ink">{quizFormatLabel(quiz)}</dd></div>
            <div><dt className="text-ink-secondary">Seuil de réussite</dt><dd className="font-semibold text-ink">{quiz.passThreshold} %</dd></div>
            <div><dt className="text-ink-secondary">Tentatives</dt><dd className="font-semibold text-ink">{attemptsLabel(quiz.attemptsUsed, quiz.maxAttempts)}</dd></div>
            <div><dt className="text-ink-secondary">Meilleur score</dt><dd className="font-semibold text-ink">{quiz.bestScore != null ? `${quiz.bestScore} %` : "—"}</dd></div>
          </dl>
          <p className="text-sm text-ink-secondary">
            {quiz.timeLimitMinutes
              ? `Vous disposez de ${quiz.timeLimitMinutes} minutes : le quiz est envoyé automatiquement à la fin du temps.`
              : "Aucune limite de temps. Vos réponses sont conservées si vous rechargez la page."}
            {" "}Une seule réponse par question.
          </p>
          {canStart ? (
            <Button type="button" variant="primary" shape="rounded" size="lg" disabled={start.isPending} onClick={() => void handleStart()}>
              {start.isPending ? <Loader2 className="animate-spin" /> : quiz.attemptsUsed > 0 ? (quiz.status === "PASSED" ? "Refaire le quiz" : "Réessayer") : "Commencer le quiz"}
            </Button>
          ) : (
            <p className="rounded-xl bg-surface-sand px-4 py-3 text-sm text-ink-secondary">
              {quiz.status === "LOCKED" ? "Terminez d'abord le quiz précédent pour débloquer celui-ci." : "Vous avez utilisé toutes vos tentatives."}
            </p>
          )}
        </Card>
      </main>
    </Frame>
  );
}
