/**
 * QuestionItem — une question d'apprenant avec sa réponse, ou le formulaire de réponse (éditeur de code compris).
 * Utilisée par la carte « Questions » du suivi de session et par la boîte de réception de Communauté.
 */
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MessageCircle } from "lucide-react";

import { errorMessage } from "@/components/admin/AdminKit";
import { RichText } from "@/components/rich/RichText";
import { RichTextEditor } from "@/components/rich/RichTextEditor";
import { Button, Pill } from "@/components/shared";
import { useAnswerQuestion } from "@/hooks/useSessionOps";
import { useToast } from "@/hooks/use-toast";

const stamp = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM HH:mm", { locale: fr }) : "—");

export const ANSWER_MAX = 8000;

export interface QuestionLike {
  id: string;
  learnerName: string;
  lessonTitle: string;
  question: string;
  askedAt: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
}

export function QuestionItem({
  sessionId, q, context, canAnswer = true, onAnswered,
}: { sessionId: string; q: QuestionLike; context?: string; canAnswer?: boolean; onAnswered?: () => void }) {
  const { toast } = useToast();
  const answer = useAnswerQuestion(sessionId);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");

  const submit = async () => {
    try {
      await answer.mutateAsync({ questionId: q.id, answer: text.trim() });
      toast({ title: "Réponse envoyée", description: `${q.learnerName} est prévenu par e-mail.` });
      setComposing(false);
      setText("");
      onAnswered?.();
    } catch (err) {
      toast({ title: "Envoi impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-secondary">
        <strong className="text-ink">{q.learnerName}</strong>
        <span>{q.lessonTitle}</span>
        {context && <span>· {context}</span>}
        <span>· {stamp(q.askedAt)}</span>
        {!q.answer && <Pill variant="warning">Sans réponse</Pill>}
      </p>
      <RichText source={q.question} />
      {q.answer ? (
        <div className="flex flex-col gap-1 rounded-xl bg-success-bg px-3 py-2.5">
          <RichText source={q.answer} />
          <span className="text-xs text-ink-secondary">{q.answeredBy} · {stamp(q.answeredAt)}</span>
        </div>
      ) : canAnswer && composing ? (
        <div className="flex flex-col gap-2">
          <RichTextEditor id={`answer-${q.id}`} label="Votre réponse" value={text} onChange={setText} rows={5} maxLength={ANSWER_MAX} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => { setComposing(false); setText(""); }}>Annuler</Button>
            <Button type="button" variant="navy" shape="rounded" size="sm" disabled={answer.isPending || !text.trim()} onClick={() => void submit()}>
              {answer.isPending ? <Loader2 className="animate-spin" /> : "Répondre"}
            </Button>
          </div>
        </div>
      ) : canAnswer ? (
        <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => setComposing(true)}>
          <MessageCircle /> Répondre
        </Button>
      ) : null}
    </div>
  );
}
