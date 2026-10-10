export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Copie d'une valeur avec tous les champs vidés : modèle pour un nouvel élément de liste de l'éditeur de contenus. */
export function emptyLike(value: Json): Json {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, emptyLike(v)]));
  }
  return "";
}
