/**
 * AdminQuizBank.tsx — banque de questions d'un quiz (GET/PUT /admin/lessons/{lessonId}/quiz).
 * Le quiz tire `questionCount` questions au hasard dans cette banque. Règles serveur : 2 à 8
 * choix par question, une seule bonne réponse. Le nombre de questions tirées, le seuil et le
 * nombre de tentatives se règlent dans le programme (lecture seule ici).
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useQuizBank, useSaveQuizBank } from "@/hooks/useAuthoring";
import { useToast } from "@/hooks/use-toast";
import { QuizQuestionsEditor, validateQuestions } from "@/components/admin/QuizQuestionsEditor";
import type { QuizQuestionEdit } from "@/types/authoring.type";

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


  const handleSave = () => {
    if (!bank) return;
    const problem = validateQuestions(questions);
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

            <QuizQuestionsEditor questions={questions} onChange={(qs) => { setQuestions(qs); setDirty(true); }} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
