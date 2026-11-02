/**
 * Logique pure du simulateur (sans React) : chronomètre aligné sur l'horloge du serveur, réponses vides, couleurs de score.
 * Le serveur reste seul juge du temps et de la note : ces fonctions ne servent qu'à l'affichage.
 */
import type { AnswerValue, QuestionPayload, QuestionType } from "@/types/simulatorLearner.type";

/** Texte d'une option ou d'un élément d'une question de correspondance. */
const textOf = (list: { id: string; text: string }[] | undefined, id: string) => list?.find((x) => x.id === id)?.text ?? id;

/** Décalage entre l'horloge du serveur et celle du navigateur, mesuré à la réception de la tentative. */
export function clockOffsetMs(serverNowIso: string, localNowMs: number): number {
  return new Date(serverNowIso).getTime() - localNowMs;
}

/** Secondes restantes avant l'échéance (jamais négatif) ; `null` si la tentative n'a pas d'échéance (mode étude). */
export function remainingSeconds(deadlineIso: string | null, offsetMs: number, localNowMs: number): number | null {
  if (!deadlineIso) return null;
  return Math.max(0, Math.ceil((new Date(deadlineIso).getTime() - (localNowMs + offsetMs)) / 1000));
}

/** 5025 → « 1:23:45 », 125 → « 2:05 ». */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/** Une réponse sans choix coché (ou sans aucun jugement Oui/Non) équivaut à « pas de réponse ». */
export function isAnswered(answer: AnswerValue | null | undefined): boolean {
  if (!answer) return false;
  if (answer.selected) return answer.selected.length > 0;
  if (answer.answers) return Object.keys(answer.answers).length > 0;
  if (answer.pairs) return Object.keys(answer.pairs).length > 0;
  if (answer.text !== undefined) return answer.text.trim().length > 0;
  return false;
}

/** Ajoute ou retire un choix en respectant le nombre de réponses attendu (choix unique = remplacement). */
export function toggleChoice(current: string[], id: string, selectCount: number): string[] {
  if (selectCount <= 1) return [id];
  if (current.includes(id)) return current.filter((c) => c !== id);
  return [...current, id];
}

/** Libellé court du type de question affiché au candidat. */
export function questionHint(type: QuestionType, payload: QuestionPayload): string {
  if (type === "YES_NO_SERIES") return "Pour chaque affirmation, répondez Oui ou Non.";
  if (type === "MATCHING") return "Glissez chaque option sur l'élément qui lui correspond.";
  if (type === "SHORT_ANSWER") return "Rédigez votre réponse : elle est validée par mots-clés.";
  const n = payload.selectCount ?? 1;
  return n > 1 ? `Choisissez ${n} réponses.` : "Choisissez une réponse.";
}

export type ScoreTone = "success" | "warning" | "error";

/** Pourcentage par domaine : ≥ 75 % acquis, 60–74 % à consolider, en dessous à retravailler. */
export function percentTone(percent: number): ScoreTone {
  if (percent >= 75) return "success";
  if (percent >= 60) return "warning";
  return "error";
}

/** Une réponse ou une bonne réponse en clair (« SUM → Adds values · … »), pour la correction et la lecture d'écran. */
export function formatAnswer(payload: QuestionPayload, answer: AnswerValue | null | undefined): string {
  if (!answer) return "Aucune réponse";
  if (answer.selected) return answer.selected.length ? answer.selected.join(", ") : "Aucune réponse";
  if (answer.answers) {
    const e = Object.entries(answer.answers);
    return e.length ? e.map(([k, v]) => `${k} : ${v ? "Oui" : "Non"}`).join(" · ") : "Aucune réponse";
  }
  if (answer.pairs) {
    const e = Object.entries(answer.pairs);
    return e.length ? e.map(([p, o]) => `${textOf(payload.prompts, p)} → ${textOf(payload.options, o)}`).join(" · ") : "Aucune réponse";
  }
  if (answer.keywords) return answer.keywords.map((k) => k.accept.join(" / ")).join(" · ");
  if (answer.text !== undefined) return answer.text.trim() || "Aucune réponse";
  return "Aucune réponse";
}

/** Replace une option dans les cases : une option déjà placée ailleurs la quitte (sauf si la réutilisation est permise). */
export function placeOption(pairs: Record<string, string>, promptId: string, optionId: string, reuse: boolean): Record<string, string> {
  const next = { ...pairs };
  if (!reuse) for (const k of Object.keys(next)) if (next[k] === optionId) delete next[k];
  next[promptId] = optionId;
  return next;
}

export function clearOption(pairs: Record<string, string>, promptId: string): Record<string, string> {
  const next = { ...pairs };
  delete next[promptId];
  return next;
}
