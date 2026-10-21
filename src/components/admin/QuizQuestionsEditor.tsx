/**
 * Édition d'une liste de questions de quiz (banque de questions, et banque d'une proposition de programme).
 * Règles serveur : 2 à 8 choix par question, une seule bonne réponse. Avec `lockExisting`, une question déjà enregistrée
 * (qui a un `id`) se modifie mais ne se retire pas.
 */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { ImportQuizDialog } from "@/components/admin/import/ImportQuizDialog";
import { Button, Card } from "@/components/shared";
import { MAX_CHOICES, MIN_CHOICES, type QuizQuestionEdit } from "@/types/authoring.type";

const fieldClass = "w-full rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy";

export const blankQuestion = (): QuizQuestionEdit => ({
  text: "",
  explanation: "",
  choices: [{ label: "", correct: true }, { label: "", correct: false }],
});

/** Message d'erreur de la première question invalide, ou null. */
export function validateQuestions(questions: QuizQuestionEdit[]): string | null {
  for (const [i, q] of questions.entries()) {
    const n = i + 1;
    if (!q.text.trim()) return `Question ${n} : l'énoncé est obligatoire.`;
    if (q.choices.length < MIN_CHOICES || q.choices.length > MAX_CHOICES) return `Question ${n} : entre ${MIN_CHOICES} et ${MAX_CHOICES} choix.`;
    if (q.choices.some((c) => !c.label.trim())) return `Question ${n} : tous les choix doivent être renseignés.`;
    if (q.choices.filter((c) => c.correct).length !== 1) return `Question ${n} : une seule bonne réponse est attendue.`;
  }
  return null;
}

export function QuizQuestionsEditor({ questions, onChange, lockExisting = false, idPrefix = "q" }: {
  questions: QuizQuestionEdit[];
  onChange: (next: QuizQuestionEdit[]) => void;
  lockExisting?: boolean;
  idPrefix?: string;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const patch = (i: number, p: Partial<QuizQuestionEdit>) => onChange(questions.map((q, k) => (k === i ? { ...q, ...p } : q)));

  return (
    <>
      {questions.map((q, i) => (
        <Card key={q.id ?? `n${i}`} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold text-navy">Question {i + 1}</h2>
            {lockExisting && q.id ? (
              <span className="text-xs text-ink-secondary">Question en ligne : non retirable</span>
            ) : (
              <button type="button" aria-label={`Supprimer la question ${i + 1}`} onClick={() => onChange(questions.filter((_, k) => k !== i))}>
                <Trash2 className="h-4 w-4 text-error" />
              </button>
            )}
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
                  name={`${idPrefix}-correct-${i}`}
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

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="navy" shape="rounded" className="w-fit" onClick={() => onChange([...questions, blankQuestion()])}>
          <Plus className="h-4 w-4" /> Ajouter une question
        </Button>
        <Button type="button" variant="outline" shape="rounded" className="w-fit" onClick={() => setImportOpen(true)}>Importer</Button>
      </div>
      <ImportQuizDialog open={importOpen} onOpenChange={setImportOpen} questions={questions} onApply={onChange} />
    </>
  );
}
