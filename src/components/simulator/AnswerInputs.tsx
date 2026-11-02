/**
 * Saisie du candidat pour les questions « Correspondance » (glisser-déposer) et « Réponse libre ».
 * Le glisser-déposer est doublé d'une liste déroulante sous chaque élément : indispensable au clavier, au lecteur d'écran et sur téléphone
 * (le glisser-déposer natif du navigateur ne fonctionne pas au toucher).
 */
import { useState } from "react";
import { GripVertical, X } from "lucide-react";

import { clearOption, placeOption } from "@/lib/simulator";
import { cn } from "@/lib/utils";
import type { AnswerValue, QuestionPayload } from "@/types/simulatorLearner.type";

interface InputProps { payload: QuestionPayload; value: AnswerValue | null; disabled: boolean; onChange: (v: AnswerValue) => void }

export function MatchingInput({ payload, value, disabled, onChange }: InputProps) {
  const pairs = value?.pairs ?? {};
  const prompts = payload.prompts ?? [];
  const options = payload.options ?? [];
  const reuse = !!payload.reuse;
  const used = new Set(Object.values(pairs));
  const pool = options.filter((o) => reuse || !used.has(o.id));
  const textOf = (id: string) => options.find((o) => o.id === id)?.text ?? id;
  const [over, setOver] = useState<string | null>(null);

  const drop = (promptId: string, e: React.DragEvent) => {
    e.preventDefault();
    setOver(null);
    const optionId = e.dataTransfer.getData("text/plain");
    if (!disabled && options.some((o) => o.id === optionId)) onChange({ pairs: placeOption(pairs, promptId, optionId, reuse) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.6px] text-ink-secondary">Options à placer</p>
        <ul className="flex min-h-11 flex-wrap gap-2" aria-label="Options disponibles">
          {pool.length === 0 && <li className="text-sm text-ink-secondary">Toutes les options sont placées.</li>}
          {pool.map((o) => (
            <li
              key={o.id}
              draggable={!disabled}
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", o.id); e.dataTransfer.effectAllowed = "move"; }}
              className={cn("flex max-w-full items-center gap-1.5 rounded-pill border border-navy bg-white px-3 py-1.5 text-sm text-ink", !disabled && "cursor-grab active:cursor-grabbing")}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
              <span className="break-words">{o.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-col gap-2">
        {prompts.map((p) => {
          const chosen = pairs[p.id];
          return (
            <li key={p.id} className="grid gap-2 rounded-card border border-[#E7E0D4] bg-white p-3 sm:grid-cols-[1fr_1.4fr]">
              <span className="self-center break-words text-sm font-semibold text-ink">{p.text}</span>
              <div className="flex flex-col gap-1.5">
                <div
                  onDragOver={(e) => { if (!disabled) { e.preventDefault(); setOver(p.id); } }}
                  onDragLeave={() => setOver((o) => (o === p.id ? null : o))}
                  onDrop={(e) => drop(p.id, e)}
                  className={cn("flex min-h-11 items-center justify-between gap-2 rounded-card border-2 border-dashed px-3 py-1.5 text-sm",
                    over === p.id ? "border-navy bg-info-bg" : chosen ? "border-success/60 bg-success-bg/40" : "border-[#D6CEC0] text-ink-secondary")}
                >
                  {chosen ? (
                    <>
                      <span className="break-words text-ink">{textOf(chosen)}</span>
                      {!disabled && (
                        <button type="button" aria-label={`Retirer l'option de « ${p.text} »`} className="shrink-0 text-ink-secondary hover:text-error" onClick={() => onChange({ pairs: clearOption(pairs, p.id) })}>
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span>Déposez une option ici</span>
                  )}
                </div>
                <select
                  aria-label={`Option pour « ${p.text} »`}
                  disabled={disabled}
                  value={chosen ?? ""}
                  onChange={(e) => onChange({ pairs: e.target.value ? placeOption(pairs, p.id, e.target.value, reuse) : clearOption(pairs, p.id) })}
                  className="w-full rounded-xl border border-[#D6CEC0] bg-white px-3 py-1.5 text-xs text-ink outline-none focus:border-navy disabled:bg-app-bg"
                >
                  <option value="">Choisir une option…</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id} disabled={!reuse && used.has(o.id) && chosen !== o.id}>{o.text}</option>
                  ))}
                </select>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShortAnswerInput({ payload, value, disabled, onChange }: InputProps) {
  const max = payload.maxLength ?? 600;
  const text = value?.text ?? "";
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        rows={5}
        maxLength={max}
        disabled={disabled}
        value={text}
        aria-label="Votre réponse"
        placeholder="Rédigez votre réponse…"
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-3 text-sm text-ink outline-none focus:border-navy disabled:bg-app-bg"
      />
      <span className="self-end text-xs text-ink-secondary" aria-live="off">{text.length} / {max}</span>
    </div>
  );
}
