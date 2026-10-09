/**
 * AdminQuizBank.tsx — banque de questions d'un quiz (GET/PUT /admin/lessons/{lessonId}/quiz).
 * Le quiz tire `questionCount` questions au hasard dans cette banque. Règles serveur : 2 à 8
 * choix par question, une seule bonne réponse. Le nombre de questions tirées, le seuil et le
 * nombre de tentatives se règlent dans le programme (lecture seule ici).
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useQuizBank, useSaveQuizBank } from "@/hooks/useAuthoring";
import { useToast } from "@/hooks/use-toast";
import { MAX_CHOICES, MIN_CHOICES, type QuizQuestionEdit } from "@/types/authoring.type";

const fieldClass = "w-full rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy";

const blankQuestion = (): QuizQuestionEdit => ({
  text: "",
  explanation: "",
  choices: [{ label: "", correct: true }, { label: "", correct: false }],
});

/** Message d'erreur de la première question invalide, ou null. */
function validate(questions: QuizQuestionEdit[]): string | null {
  for (const [i, q] of questions.entries()) {
    const n = i + 1;
    if (!q.text.trim()) return `Question ${n} : l'énoncé est obligatoire.`;
    if (q.choices.length < MIN_CHOICES || q.choices.length > MAX_CHOICES) return `Question ${n} : entre ${MIN_CHOICES} et ${MAX_CHOICES} choix.`;
    if (q.choices.some((c) => !c.label.trim())) return `Question ${n} : tous les choix doivent être renseignés.`;
    if (q.choices.filter((c) => c.correct).length !== 1) return `Question ${n} : une seule bonne réponse est attendue.`;
  }
  return null;
}

export default function AdminQuizBank() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bank, isLoading, isError, error } = useQuizBank(lessonId);
  const save = useSaveQuizBank(lessonId ?? "");
  const [questions, setQuestions] = useState<QuizQuestionEdit[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!bank) return;
    setQuestions(bank.questions ?? []);
    setDirty(false);
  }, [bank]);

  const edit = (fn: (q: QuizQuestionEdit[]) => QuizQuestionEdit[]) => { setQuestions(fn); setDirty(true); };
  const patch = (i: number, p: Partial<QuizQuestionEdit>) => edit((qs) => qs.map((q, k) => (k === i ? { ...q, ...p } : q)));

  const handleSave = () => {
    if (!bank) return;
    const problem = validate(questions);
    if (problem) {
      toast({ title: "Quiz incomplet", description: problem, variant: "destructive" });
      return;
    }
    save.mutate(
      { ...bank, questions: questions.map((q) => ({ ...q, explanation: q.explanation?.trim() || null })) },
      {
        onSuccess: () => toast({ title: "Questions enregistrées" }),
        onError: (e) => toast({ title: "Enregistrement impossible", description: errorMessage(e, "Réessayez dans un instant."), variant: "destructive" }),
      }
    );
  };

  const draw = bank?.questionCount ?? 0;

  return (
    <AdminLayout
      title="Banque de questions"
      description={bank?.title ?? "Quiz"}
      actions={
        <Button variant="primary" shape="rounded" size="sm" onClick={handleSave} disabled={!dirty || save.isPending}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
        </Button>
      }
    >
      <div className="flex max-w-3xl flex-col gap-5">
        <Button variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => navigate(-1)}>← Retour au programme</Button>
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger ce quiz.")} <Link to="/admin/bootcamps" className="underline">Retour aux formations</Link></ErrorNotice>}

        {bank && (
          <>
            <Card radius="stat" className="flex flex-wrap items-center gap-3 border border-[#E7E0D4] p-4 text-sm">
              <Pill variant="info">{draw} question{draw > 1 ? "s" : ""} tirée{draw > 1 ? "s" : ""} au sort</Pill>
              <Pill variant="neutral">Seuil {bank.passThreshold ?? "—"} %</Pill>
              <Pill variant="neutral">{bank.maxAttempts ? `${bank.maxAttempts} tentatives` : "Tentatives illimitées"}</Pill>
              <span className="text-ink-secondary">Ces réglages se modifient dans le programme.</span>
            </Card>
            {questions.length < draw && (
              <div role="status" className="rounded-card bg-warning-bg px-4 py-3 text-sm text-warning">
                La banque contient {questions.length} question{questions.length > 1 ? "s" : ""} pour {draw} tirées : ajoutez-en au moins {draw - questions.length}.
              </div>
            )}

            {questions.map((q, i) => (
              <Card key={q.id ?? `n${i}`} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-lg font-bold text-navy">Question {i + 1}</h2>
                  <button type="button" aria-label={`Supprimer la question ${i + 1}`} onClick={() => edit((qs) => qs.filter((_, k) => k !== i))}>
                    <Trash2 className="h-4 w-4 text-error" />
                  </button>
                </div>
                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
                  Énoncé *
                  <textarea rows={2} className={fieldClass} value={q.text} onChange={(e) => patch(i, { text: e.target.value })} />
                </label>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-xs font-semibold text-ink-secondary">Choix (cochez la bonne réponse)</legend>
                  {q.choices.map((c, ci) => (
                    <div key={c.id ?? `c${ci}`} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        aria-label={`Bonne réponse : choix ${ci + 1}`}
                        className="h-4 w-4 accent-[#1F6B4F]"
                        checked={c.correct}
                        onChange={() => patch(i, { choices: q.choices.map((x, k) => ({ ...x, correct: k === ci })) })}
                      />
                      <input
                        aria-label={`Choix ${ci + 1}`}
                        className={fieldClass}
                        value={c.label}
                        onChange={(e) => patch(i, { choices: q.choices.map((x, k) => (k === ci ? { ...x, label: e.target.value } : x)) })}
                      />
                      <button
                        type="button"
                        aria-label={`Supprimer le choix ${ci + 1}`}
                        disabled={q.choices.length <= MIN_CHOICES}
                        className="disabled:opacity-30"
                        onClick={() => {
                          const rest = q.choices.filter((_, k) => k !== ci);
                          patch(i, { choices: rest.some((x) => x.correct) ? rest : rest.map((x, k) => ({ ...x, correct: k === 0 })) });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    shape="rounded"
                    size="sm"
                    className="w-fit"
                    disabled={q.choices.length >= MAX_CHOICES}
                    onClick={() => patch(i, { choices: [...q.choices, { label: "", correct: false }] })}
                  >
                    <Plus className="h-4 w-4" /> Ajouter un choix
                  </Button>
                </fieldset>
                <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
                  Explication (affichée dans la correction)
                  <textarea rows={2} className={fieldClass} value={q.explanation ?? ""} onChange={(e) => patch(i, { explanation: e.target.value })} />
                </label>
              </Card>
            ))}

            <Button type="button" variant="navy" shape="rounded" className="w-fit" onClick={() => edit((qs) => [...qs, blankQuestion()])}>
              <Plus className="h-4 w-4" /> Ajouter une question
            </Button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
