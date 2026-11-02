/**
 * /espace/simulateur/tentatives/:id/rapport — résultat d'une tentative terminée : score estimé, résultats par domaine et
 * compétence, revue des questions avec corrigé et explication en français.
 */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Loader2, Lock, XCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { RichText } from "@/components/rich/RichText";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import { useSimReport, useStartAttempt } from "@/hooks/useSimulatorLearner";
import { formatAnswer, percentTone } from "@/lib/simulator";
import { cn } from "@/lib/utils";
import { MODE_LABELS, STATUS_LABELS, type AnswerValue, type QuestionReport, type ScoreBucket } from "@/types/simulatorLearner.type";

const TONE_TEXT = { success: "text-success", warning: "text-warning", error: "text-error" } as const;

function Buckets({ title, items, weakFirst }: { title: string; items: ScoreBucket[]; weakFirst?: boolean }) {
  const rows = useMemo(() => (weakFirst ? [...items].sort((a, b) => a.percent - b.percent) : items), [items, weakFirst]);
  return (
    <Card radius="stat" className="flex flex-col gap-3 p-5">
      <h3 className="font-heading text-lg font-bold text-navy">{title}</h3>
      <ul className="flex flex-col gap-3">
        {rows.map((b) => (
          <li key={b.code} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink">{b.name}</span>
              <span className={cn("font-bold tabular-nums", TONE_TEXT[percentTone(b.percent)])}>{b.percent} %</span>
            </div>
            <ProgressBar value={b.percent} aria-label={`${b.name} : ${b.percent} %`} />
            <span className="text-xs text-ink-secondary">{b.questions} question{b.questions > 1 ? "s" : ""}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MatchingReview({ r }: { r: QuestionReport }) {
  const options = new Map((r.payload.options ?? []).map((o) => [o.id, o.text]));
  return (
    <ul className="flex flex-col gap-1.5">
      {(r.payload.prompts ?? []).map((p) => {
        const given = r.yourAnswer?.pairs?.[p.id];
        const expected = r.correctAnswer?.pairs?.[p.id];
        const ok = given === expected;
        return (
          <li key={p.id} className={cn("flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm", ok ? "border-success/50 bg-success-bg" : "border-error/50 bg-error-bg")}>
            <span className="font-semibold text-ink">{p.text}</span>
            <span className="text-xs">Vous : {given ? options.get(given) : "—"}{!ok && expected ? ` · Attendu : ${options.get(expected)}` : ""}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ShortReview({ r }: { r: QuestionReport }) {
  const text = r.yourAnswer?.text?.trim();
  return (
    <div className="flex flex-col gap-2">
      <blockquote className="whitespace-pre-wrap rounded-lg border border-[#E7E0D4] bg-white px-3 py-2 text-sm text-ink">{text || "Aucune réponse"}</blockquote>
      <p className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-semibold text-ink-secondary">Mots-clés attendus :</span>
        {(r.correctAnswer?.keywords ?? []).map((k) => {
          const missing = r.detail?.missing?.includes(k.id);
          return (
            <span key={k.id} className={cn("rounded-pill px-2 py-0.5", missing ? "bg-error-bg text-error" : "bg-success-bg text-success")}>
              {missing ? "✗" : "✓"} {k.accept.join(" / ")}
            </span>
          );
        })}
      </p>
    </div>
  );
}

function LockedQuestion({ r }: { r: QuestionReport }) {
  return (
    <Card radius="stat" className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Lock className="h-5 w-5 text-ink-secondary" aria-hidden="true" />
        <h4 className="font-heading font-bold text-navy">Question {r.position}</h4>
        <Pill variant="neutral">{r.domainCode} · {r.skillCode}</Pill>
      </div>
      <RichText source={r.stem} />
      <p className="text-sm text-ink-secondary">Votre réponse : <strong>{formatAnswer(r.payload, r.yourAnswer)}</strong></p>
      <div className="flex flex-wrap items-center gap-3 rounded-card bg-surface-sand p-3 text-sm text-ink">
        <span className="min-w-48 flex-1">La correction et l'explication de cette question sont réservées au simulateur complet.</span>
        <Button asChild size="sm" shape="rounded"><Link to="/simulateur-pl-300#forfaits">Débloquer</Link></Button>
      </div>
    </Card>
  );
}

function QuestionReview({ r }: { r: QuestionReport }) {
  if (r.locked) return <LockedQuestion r={r} />;
  const right = (r.score ?? 0) >= 1;
  const options = r.payload.choices ?? r.payload.statements ?? [];
  const correctIds = new Set(r.correctAnswer?.selected ?? []);
  const yourIds = new Set(r.yourAnswer?.selected ?? []);
  return (
    <Card radius="stat" className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        {right ? <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /> : <XCircle className="h-5 w-5 text-error" aria-hidden="true" />}
        <h4 className="font-heading font-bold text-navy">Question {r.position}</h4>
        <Pill variant="neutral">{r.domainCode} · {r.skillCode}</Pill>
        {r.score !== null && r.score > 0 && r.score < 1 && <Pill variant="warning">Partiel {Math.round(r.score * 100)} %</Pill>}
        <span className="ml-auto text-xs text-ink-secondary">{r.itemCode}</span>
      </div>
      <RichText source={r.stem} />
      {r.type === "MATCHING" ? (
        <MatchingReview r={r} />
      ) : r.type === "SHORT_ANSWER" ? (
        <ShortReview r={r} />
      ) : r.payload.choices ? (
        <ul className="flex flex-col gap-1.5">
          {r.payload.choices.map((c) => {
            const isCorrect = correctIds.has(c.id);
            const isYours = yourIds.has(c.id);
            return (
              <li key={c.id} className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", isCorrect ? "border-success/50 bg-success-bg" : isYours ? "border-error/50 bg-error-bg" : "border-[#E7E0D4]")}>
                <span className="font-heading font-bold text-navy">{c.id}</span>
                <span className="min-w-0 flex-1 break-words">{c.text}</span>
                {isYours && <span className="text-xs font-semibold text-ink-secondary">Votre réponse</span>}
                {isCorrect && <span className="text-xs font-semibold text-success">Correct</span>}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {options.map((s) => {
            const expected = r.correctAnswer?.answers?.[s.id];
            const given = r.yourAnswer?.answers?.[s.id];
            const ok = given === expected;
            return (
              <li key={s.id} className={cn("flex flex-wrap items-start gap-2 rounded-lg border px-3 py-2 text-sm", ok ? "border-success/50 bg-success-bg" : "border-error/50 bg-error-bg")}>
                <span className="min-w-0 flex-1 break-words">{s.text}</span>
                <span className="text-xs font-semibold">Vous : {given === undefined ? "—" : given ? "Oui" : "Non"} · Attendu : {expected ? "Oui" : "Non"}</span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="sr-only">Votre réponse : {formatAnswer(r.payload, r.yourAnswer)}. Bonne réponse : {formatAnswer(r.payload, r.correctAnswer)}.</p>
      {r.explanationFr && (
        <div className="rounded-card bg-surface-sand p-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-secondary">Explication</p>
          <RichText source={r.explanationFr} />
        </div>
      )}
    </Card>
  );
}

export default function EspaceSimulateurRapport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: report, isLoading, error } = useSimReport(id);
  const start = useStartAttempt();
  const [onlyWrong, setOnlyWrong] = useState(false);

  const questions = useMemo(() => (report?.questions ?? []).filter((q) => !onlyWrong || (q.score ?? 0) < 1), [report, onlyWrong]);
  const s = report?.summary;
  const trial = !!report?.trial;
  const isExam = s?.mode === "EXAM" && !trial;

  const retry = async () => {
    try {
      const a = await start.mutateAsync({ mode: "STUDY", count: 10 });
      navigate(`/espace/simulateur/tentatives/${a.id}`);
    } catch (err) {
      toast({ title: "Démarrage impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <LearnerShell title="Résultats" description={s ? `${MODE_LABELS[s.mode]} du ${format(new Date(s.startedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}` : undefined}>
      <div className="flex flex-col gap-6">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {error && <ErrorNotice>{errorMessage(error, "Ce rapport n'est pas disponible.")}</ErrorNotice>}

        {report && s && (
          <>
            <Card radius="callout" variant={isExam && s.passed ? "navy" : "default"} className="flex flex-wrap items-center gap-6 p-6">
              <div className="min-w-48 flex-1">
                <p className={cn("text-sm", isExam && s.passed ? "text-[#D5DEE8]" : "text-ink-secondary")}>{trial ? "Mini-test d'essai · " : ""}{STATUS_LABELS[s.status]} · {s.totalQuestions} questions</p>
                {isExam ? (
                  <>
                    <p className="font-heading text-5xl font-bold tabular-nums">{s.scaledScore}<span className="text-2xl font-semibold opacity-70"> / 1000</span></p>
                    <p className="mt-1 font-semibold">{s.passed ? "Seuil de réussite atteint" : `Seuil de réussite non atteint (${report.passScore})`}</p>
                  </>
                ) : (
                  <p className="font-heading text-5xl font-bold tabular-nums">{Math.round(s.scorePercent ?? 0)} %</p>
                )}
                {s.status === "EXPIRED" && <p className="mt-1 text-sm">Le temps était écoulé : l'examen a été remis automatiquement.</p>}
              </div>
              <div className="flex flex-col gap-2">
                {report.estimated && isExam && <p className={cn("max-w-64 text-xs", s.passed ? "text-[#D5DEE8]" : "text-ink-secondary")}>Score estimé : Microsoft ne publie pas son barème. Visez au moins 75 % de réussite de façon régulière avant de passer l'examen.</p>}
                <div className="flex flex-wrap gap-2">
                  {trial ? (
                    <Button asChild shape="rounded" size="sm"><Link to="/simulateur-pl-300#forfaits">Débloquer le simulateur complet</Link></Button>
                  ) : (
                    <Button type="button" shape="rounded" variant={isExam && s.passed ? "primary" : "navy"} size="sm" disabled={start.isPending} onClick={retry}>Travailler mes points faibles</Button>
                  )}
                  <Button asChild shape="rounded" variant="outline" size="sm"><Link to="/espace/simulateur">Retour au simulateur</Link></Button>
                </div>
              </div>
            </Card>

            {trial && (
              <Card radius="stat" variant="sand" className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-56 flex-1">
                  <h3 className="font-heading text-lg font-bold text-navy">Vous avez vu {report.questions.length - report.lockedCount} correction{report.questions.length - report.lockedCount > 1 ? "s" : ""} sur {report.questions.length}</h3>
                  <p className="text-sm text-ink-secondary">Le simulateur complet débloque toutes les corrections, des examens blancs de 50 questions et l'entraînement illimité par domaine. Ciblez vos points faibles ci-dessous.</p>
                </div>
                <Button asChild shape="rounded"><Link to="/simulateur-pl-300#forfaits">Voir les forfaits</Link></Button>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Buckets title="Par domaine" items={report.domains} />
              <Buckets title="Compétences à travailler en premier" items={report.skills} weakFirst />
            </div>

            <section aria-labelledby="review-title" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 id="review-title" className="font-heading text-lg font-bold text-navy">Revue des questions</h3>
                {!trial && (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" className="h-4 w-4 accent-[#1A3A5B]" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
                  Seulement les erreurs
                </label>
                )}
              </div>
              {questions.length === 0 && <p className="text-sm text-ink-secondary">Aucune erreur : bravo !</p>}
              {questions.map((q) => <QuestionReview key={q.position} r={q} />)}
            </section>
          </>
        )}
      </div>
    </LearnerShell>
  );
}
