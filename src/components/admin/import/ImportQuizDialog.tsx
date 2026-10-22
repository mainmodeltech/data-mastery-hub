/** Import des questions d'un quiz depuis un fichier Excel ou CSV : aperçu, rapport d'erreurs, ajout à la banque (sans rien remplacer). */
import { useRef } from "react";

import { applyQuizImport, parseQuizRows, type ParsedQuiz } from "@/lib/import/quizImport";
import type { QuizQuestionEdit } from "@/types/authoring.type";
import { ImportDialogShell, type Analysis } from "./ImportDialogShell";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuizQuestionEdit[];
  /** Reçoit la banque complète après ajout (l'utilisateur enregistre ensuite). */
  onApply: (questions: QuizQuestionEdit[]) => void;
}

export function ImportQuizDialog({ open, onOpenChange, questions, onApply }: Props) {
  const parsed = useRef<ParsedQuiz | null>(null);

  const analyse = (rows: string[][]): Analysis => {
    const p = parseQuizRows(rows);
    parsed.current = p;
    return {
      errors: p.errors,
      count: p.questions.length,
      preview: (
        <>
          <p>{p.questions.length} question{p.questions.length > 1 ? "s" : ""} ajoutée{p.questions.length > 1 ? "s" : ""} aux {questions.length} existante{questions.length > 1 ? "s" : ""}.</p>
          <ol className="list-decimal pl-5">
            {p.questions.map(({ line, question: q }) => (
              <li key={line}>
                {q.text} <span className="text-ink-secondary">· {q.choices.length} choix, bonne réponse : {q.choices.find((c) => c.correct)?.label}</span>
              </li>
            ))}
          </ol>
        </>
      ),
    };
  };

  return (
    <ImportDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Importer des questions"
      description="Un fichier Excel (.xlsx) ou CSV, une ligne par question (2 à 8 choix, une seule bonne réponse indiquée par sa lettre). Les questions sont ajoutées à la banque sans rien remplacer ; pensez à enregistrer ensuite."
      templateBase="/modeles/modele-quiz"
      analyse={analyse}
      applyLabel="Ajouter à la banque"
      onApply={() => { if (parsed.current) onApply(applyQuizImport(questions, parsed.current)); }}
    />
  );
}
