/**
 * Champs d'édition des questions « Correspondance » (glisser-déposer) et « Réponse libre » (mots-clés), et leur aperçu
 * avec corrigé pour la fiche d'une question. Le serveur revalide tout : ces champs guident l'auteur, ils ne remplacent pas ses contrôles.
 */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { inputClass } from "@/components/admin/AdminKit";
import { Button } from "@/components/shared";
import {
  addKeyword, addMatchOption, addMatchPrompt, MAX_KEYWORDS, MAX_OPTIONS, MAX_PROMPTS, parseAccept, removeKeyword, removeMatchOption,
  removeMatchPrompt, setKeywordAccept, setMatchPair,
} from "@/lib/simulatorEditor";
import { cn } from "@/lib/utils";
import type { ItemPayload } from "@/types/simulator.type";

interface FieldsProps { payload: ItemPayload; setPayload: (p: ItemPayload) => void }

// ── Correspondance ────────────────────────────────────────────────────

export function MatchingFields({ payload, setPayload }: FieldsProps) {
  const prompts = payload.prompts ?? [];
  const options = payload.options ?? [];
  const pairs = payload.pairs ?? {};
  const setPromptText = (i: number, text: string) => setPayload({ ...payload, prompts: prompts.map((p, k) => (k === i ? { ...p, text } : p)) });
  const setOptionText = (i: number, text: string) => setPayload({ ...payload, options: options.map((o, k) => (k === i ? { ...o, text } : o)) });

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-card bg-surface-sand p-3 text-xs text-ink-secondary">
        Le candidat glisse chaque <strong>option</strong> sur l'<strong>élément</strong> qui lui correspond. Indiquez pour chaque élément l'option attendue ;
        ajoutez des options en trop comme <strong>leurres</strong>. La note est la part d'éléments correctement associés.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">Éléments à associer (EN) et option attendue</legend>
        {prompts.map((p, i) => (
          <div key={p.id} className="flex flex-wrap items-center gap-2">
            <span className="w-7 text-sm font-bold text-navy">{p.id}</span>
            <input className={cn(inputClass, "min-w-40 flex-1")} value={p.text} maxLength={1000} aria-label={`Texte de l'élément ${p.id}`} onChange={(e) => setPromptText(i, e.target.value)} />
            <select aria-label={`Option attendue pour ${p.id}`} className={cn(inputClass, "w-48")} value={pairs[p.id] ?? ""} onChange={(e) => setPayload(setMatchPair(payload, p.id, e.target.value))}>
              <option value="">Option attendue…</option>
              {options.map((o) => <option key={o.id} value={o.id}>{o.id} — {o.text.slice(0, 40) || "(vide)"}</option>)}
            </select>
            {prompts.length > 2 && (
              <button type="button" aria-label={`Retirer l'élément ${p.id}`} className="text-ink-secondary hover:text-error" onClick={() => setPayload(removeMatchPrompt(payload, i))}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {prompts.length < MAX_PROMPTS && (
          <Button type="button" size="sm" shape="rounded" variant="outline" className="w-fit" onClick={() => setPayload(addMatchPrompt(payload))}><Plus />Ajouter un élément</Button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">Options proposées (EN), leurres compris</legend>
        {options.map((o, i) => (
          <div key={o.id} className="flex items-center gap-2">
            <span className="w-7 text-sm font-bold text-navy">{o.id}</span>
            <input className={inputClass} value={o.text} maxLength={1000} aria-label={`Texte de l'option ${o.id}`} onChange={(e) => setOptionText(i, e.target.value)} />
            {options.length > 2 && (
              <button type="button" aria-label={`Retirer l'option ${o.id}`} className="text-ink-secondary hover:text-error" onClick={() => setPayload(removeMatchOption(payload, i))}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {options.length < MAX_OPTIONS && (
          <Button type="button" size="sm" shape="rounded" variant="outline" className="w-fit" onClick={() => setPayload(addMatchOption(payload))}><Plus />Ajouter une option</Button>
        )}
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" checked={!!payload.reuse} onChange={(e) => setPayload({ ...payload, reuse: e.target.checked })} className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
        <span>Une même option peut être placée plusieurs fois <span className="text-ink-secondary">(sinon chaque option ne sert qu'une fois, comme dans l'examen)</span></span>
      </label>
    </div>
  );
}

// ── Réponse libre ─────────────────────────────────────────────────────

function KeywordRow({ index, id, accept, onChange, onRemove, removable }: {
  index: number; id: string; accept: string[]; onChange: (accept: string[]) => void; onRemove: () => void; removable: boolean;
}) {
  // La saisie brute reste locale : une virgule tapée en cours de route ne doit pas être « corrigée » à chaque frappe.
  const [draft, setDraft] = useState(accept.join(", "));
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-sm font-bold text-navy">{id}</span>
      <input className={inputClass} value={draft} maxLength={400} placeholder="ex. measure, mesure" aria-label={`Formulations acceptées pour le mot-clé ${index + 1}`}
        onChange={(e) => { setDraft(e.target.value); onChange(parseAccept(e.target.value)); }} />
      {removable && (
        <button type="button" aria-label={`Retirer le mot-clé ${id}`} className="text-ink-secondary hover:text-error" onClick={onRemove}><Trash2 className="h-4 w-4" /></button>
      )}
    </div>
  );
}

export function ShortAnswerFields({ payload, setPayload }: FieldsProps) {
  const keywords = payload.keywords ?? [];
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-card bg-surface-sand p-3 text-xs text-ink-secondary">
        Le candidat rédige sa réponse ; elle est juste si elle contient <strong>tous</strong> les mots-clés ci-dessous. Chaque mot-clé accepte plusieurs
        formulations (séparées par des virgules). La casse et les accents sont ignorés, et un mot-clé est reconnu au <strong>début d'un mot</strong> :
        « mesure » reconnaît « mesures », « calculate » reconnaît « calculated ». Une expression (« filter context ») doit apparaître telle quelle.
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">Mots-clés attendus (un par ligne)</legend>
        {keywords.map((k, i) => (
          <KeywordRow key={`${i}-${keywords.length}`} index={i} id={k.id} accept={k.accept} removable={keywords.length > 1}
            onChange={(accept) => setPayload(setKeywordAccept(payload, i, accept))} onRemove={() => setPayload(removeKeyword(payload, i))} />
        ))}
        {keywords.length < MAX_KEYWORDS && (
          <Button type="button" size="sm" shape="rounded" variant="outline" className="w-fit" onClick={() => setPayload(addKeyword(payload))}><Plus />Ajouter un mot-clé</Button>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={!!payload.partialCredit} onChange={(e) => setPayload({ ...payload, partialCredit: e.target.checked })} className="h-4 w-4 accent-[#1A3A5B]" />
          Note proportionnelle aux mots-clés trouvés <span className="text-ink-secondary">(sinon tout ou rien)</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          Longueur maximale
          <input type="number" min={20} max={2000} className={cn(inputClass, "w-24")} value={payload.maxLength ?? 600} aria-label="Longueur maximale de la réponse"
            onChange={(e) => setPayload({ ...payload, maxLength: Number(e.target.value) })} />
          <span className="text-ink-secondary">caractères</span>
        </label>
      </div>
    </div>
  );
}

// ── Aperçu avec corrigé (fiche d'une question) ────────────────────────

export function AdvancedPayloadPreview({ payload }: { payload: ItemPayload }) {
  if (payload.prompts) {
    const options = new Map((payload.options ?? []).map((o) => [o.id, o.text]));
    const expected = new Set(Object.values(payload.pairs ?? {}));
    return (
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-1.5">
          {payload.prompts.map((p) => (
            <li key={p.id} className="flex flex-wrap gap-2 rounded-card border border-success bg-success-bg px-3 py-2 text-sm">
              <span className="font-bold text-navy">{p.id}</span><span className="min-w-32 flex-1">{p.text}</span>
              <span className="font-semibold text-success">→ {options.get(payload.pairs?.[p.id] ?? "") ?? "?"}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-secondary">
          Options proposées :{" "}
          {(payload.options ?? []).map((o) => (
            <span key={o.id} className={cn("mr-2 inline-block", !expected.has(o.id) && "italic")}>{o.id} {o.text}{!expected.has(o.id) ? " (leurre)" : ""}</span>
          ))}
          {payload.reuse ? " · réutilisation permise" : ""}
        </p>
      </div>
    );
  }
  if (payload.keywords) {
    return (
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-1.5">
          {payload.keywords.map((k) => (
            <li key={k.id} className="flex gap-2 rounded-card border border-success bg-success-bg px-3 py-2 text-sm">
              <span className="font-bold text-navy">{k.id}</span><span className="flex-1">{k.accept.join(" / ")}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-secondary">
          Tous les mots-clés sont requis{payload.partialCredit ? " (note proportionnelle)" : " (tout ou rien)"} · {payload.maxLength ?? 600} caractères au plus.
        </p>
      </div>
    );
  }
  return null;
}
