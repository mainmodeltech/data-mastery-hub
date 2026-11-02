/**
 * Logique pure de l'éditeur de questions du simulateur (correspondance et réponse libre), sans React.
 * Les identifiants (P1…, O1…, K1…) sont toujours renumérotés dans l'ordre : le serveur les exige séquentiels et uniques.
 */
import type { ItemPayload, MatchElement } from "@/types/simulator.type";

export const MAX_PROMPTS = 6;
export const MAX_OPTIONS = 8;
export const MAX_KEYWORDS = 8;

/** « measure, mesure ; metric » → ["measure", "mesure", "metric"] (sans doublon, casse ignorée). */
export function parseAccept(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,;\n]/)) {
    const form = raw.trim();
    if (form && !seen.has(form.toLowerCase())) {
      seen.add(form.toLowerCase());
      out.push(form);
    }
  }
  return out;
}

const renumber = (items: MatchElement[], prefix: string): MatchElement[] => items.map((e, i) => ({ ...e, id: `${prefix}${i + 1}` }));

/** Renumérote les éléments en gardant la correspondance : `keep` donne l'ancien identifiant de chaque élément restant. */
function reindexed(payload: ItemPayload, prompts: { el: MatchElement }[], options: { el: MatchElement }[]): ItemPayload {
  const promptIds = new Map(prompts.map((p, i) => [p.el.id, `P${i + 1}`]));
  const optionIds = new Map(options.map((o, i) => [o.el.id, `O${i + 1}`]));
  const pairs: Record<string, string> = {};
  for (const [p, o] of Object.entries(payload.pairs ?? {})) {
    if (promptIds.has(p) && optionIds.has(o)) pairs[promptIds.get(p) as string] = optionIds.get(o) as string;
  }
  return {
    ...payload,
    prompts: renumber(prompts.map((p) => p.el), "P"),
    options: renumber(options.map((o) => o.el), "O"),
    pairs,
  };
}

export function blankMatching(): ItemPayload {
  return {
    prompts: [{ id: "P1", text: "" }, { id: "P2", text: "" }],
    options: [{ id: "O1", text: "" }, { id: "O2", text: "" }, { id: "O3", text: "" }],
    pairs: { P1: "O1", P2: "O2" },
    reuse: false,
  };
}

export function blankShortAnswer(): ItemPayload {
  return { keywords: [{ id: "K1", accept: [] }], partialCredit: false, maxLength: 600 };
}

export function addMatchPrompt(p: ItemPayload): ItemPayload {
  const prompts = p.prompts ?? [];
  if (prompts.length >= MAX_PROMPTS) return p;
  return { ...p, prompts: [...prompts, { id: `P${prompts.length + 1}`, text: "" }] };
}

export function addMatchOption(p: ItemPayload): ItemPayload {
  const options = p.options ?? [];
  if (options.length >= MAX_OPTIONS) return p;
  return { ...p, options: [...options, { id: `O${options.length + 1}`, text: "" }] };
}

export function removeMatchPrompt(p: ItemPayload, index: number): ItemPayload {
  const prompts = (p.prompts ?? []).filter((_, i) => i !== index);
  return reindexed(p, prompts.map((el) => ({ el })), (p.options ?? []).map((el) => ({ el })));
}

export function removeMatchOption(p: ItemPayload, index: number): ItemPayload {
  const options = (p.options ?? []).filter((_, i) => i !== index);
  return reindexed(p, (p.prompts ?? []).map((el) => ({ el })), options.map((el) => ({ el })));
}

export function setMatchPair(p: ItemPayload, promptId: string, optionId: string): ItemPayload {
  const pairs = { ...(p.pairs ?? {}) };
  if (optionId) pairs[promptId] = optionId;
  else delete pairs[promptId];
  return { ...p, pairs };
}

export function addKeyword(p: ItemPayload): ItemPayload {
  const keywords = p.keywords ?? [];
  if (keywords.length >= MAX_KEYWORDS) return p;
  return { ...p, keywords: [...keywords, { id: `K${keywords.length + 1}`, accept: [] }] };
}

export function removeKeyword(p: ItemPayload, index: number): ItemPayload {
  const keywords = (p.keywords ?? []).filter((_, i) => i !== index).map((k, i) => ({ ...k, id: `K${i + 1}` }));
  return { ...p, keywords };
}

export function setKeywordAccept(p: ItemPayload, index: number, accept: string[]): ItemPayload {
  return { ...p, keywords: (p.keywords ?? []).map((k, i) => (i === index ? { ...k, accept } : k)) };
}
