/**
 * Questions à l'équipe pédagogique, sous une leçon (GET/POST /learner/lessons/{id}/questions).
 * Le serveur limite à 5 questions sans réponse par leçon (409) et contrôle l'accès à la formation
 * (403) : son message est affiché tel quel.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/shared";
import { useAskQuestion, useLessonQuestions } from "@/hooks/useLessonQuestions";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/services/httpClient";
import { QUESTION_MAX, QUESTION_MIN } from "@/types/question.type";

const schema = z.object({
  question: z
    .string()
    .trim()
    .min(QUESTION_MIN, `Au moins ${QUESTION_MIN} caractères`)
    .max(QUESTION_MAX, `${QUESTION_MAX} caractères maximum`),
});
type FormValues = z.infer<typeof schema>;

const when = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "");

export function LessonQuestions({ lessonId, disabled }: { lessonId: string; disabled?: boolean }) {
  const { toast } = useToast();
  const { data: questions, isLoading, isError } = useLessonQuestions(lessonId, !disabled);
  const ask = useAskQuestion(lessonId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { question: "" },
  });

  if (disabled) {
    return <p className="text-sm text-ink-secondary">Les questions sont disponibles avec votre compte apprenant.</p>;
  }

  const onSubmit = handleSubmit(async ({ question }) => {
    try {
      await ask.mutateAsync(question);
      reset();
      toast({ title: "Question envoyée", description: "Vous serez prévenu par e-mail de la réponse." });
    } catch (err) {
      toast({
        title: "Question non envoyée",
        description: err instanceof ApiError && err.message && !/^Erreur \d+$/.test(err.message) ? err.message : "Réessayez dans un instant.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
        <label htmlFor={`question-${lessonId}`} className="text-sm font-semibold text-ink">Poser une question sur cette leçon</label>
        <textarea
          id={`question-${lessonId}`}
          rows={4}
          maxLength={QUESTION_MAX}
          aria-invalid={!!errors.question}
          className="w-full rounded-card border border-[#D6CEC0] bg-white p-3 text-sm outline-none focus:border-navy"
          placeholder="Votre question à l'équipe pédagogique…"
          {...register("question")}
        />
        {errors.question && <span role="alert" className="text-xs text-error">{errors.question.message}</span>}
        <Button type="submit" variant="navy" shape="rounded" size="sm" className="w-fit" disabled={ask.isPending}>
          {ask.isPending ? <Loader2 className="animate-spin" /> : "Envoyer ma question"}
        </Button>
      </form>

      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
      {isError && <p role="alert" className="text-sm text-error">Impossible de charger vos questions pour le moment.</p>}
      {questions && questions.length === 0 && <p className="text-sm text-ink-secondary">Vous n'avez pas encore posé de question sur cette leçon.</p>}
      {questions && questions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {questions.map((q) => (
            <li key={q.id} className="flex flex-col gap-2 rounded-card border border-[#E7E0D4] bg-white p-4">
              <p className="whitespace-pre-line text-sm text-ink">{q.question}</p>
              <span className="text-xs text-ink-secondary">Posée le {when(q.askedAt)}</span>
              {q.answer ? (
                <div className="flex flex-col gap-1 rounded-xl bg-info-bg p-3">
                  <p className="whitespace-pre-line text-sm text-ink">{q.answer}</p>
                  <span className="text-xs text-ink-secondary">
                    {q.answeredBy ? `${q.answeredBy} · ` : ""}{when(q.answeredAt)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-warning">En attente de réponse</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
