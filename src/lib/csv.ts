/**
 * Export CSV sûr pour les tableurs (séparateur « ; », ouverture dans Excel / LibreOffice).
 *
 * Une cellule texte qui commence par `=`, `+`, `-`, `@`, une tabulation ou un retour chariot est
 * interprétée comme une formule par le tableur : un abonné ou un apprenant qui saisit `=HYPERLINK(...)`
 * dans son nom ou son e-mail pourrait faire exécuter une formule à la personne qui ouvre l'export.
 * Ces valeurs sont préfixées d'une apostrophe (affichée par le tableur comme du texte). Les nombres
 * passent tels quels.
 */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  let s = value;
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const csvRow = (cells: ReadonlyArray<string | number | null | undefined>): string => cells.map(csvCell).join(";");

/** Télécharge un CSV (BOM UTF-8 pour que les accents s'affichent correctement dans Excel). */
export function downloadCsv(filename: string, lines: string[]): void {
  const url = URL.createObjectURL(new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
