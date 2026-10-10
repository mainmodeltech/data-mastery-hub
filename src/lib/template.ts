/** Remplace les variables `{nom}` d'un texte éditorial ; une variable inconnue est laissée telle quelle. */
export function fill(text: string | undefined | null, vars: Record<string, string | number | null | undefined>): string {
  if (!text) return "";
  return text.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined || value === null ? match : String(value);
  });
}
