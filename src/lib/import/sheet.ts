import { parseCsv } from "./csv.ts";

/** Normalise un en-tête : minuscules, sans accents ni ponctuation (« Durée (min) » -> « duree min »). */
export function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface SheetRecord {
  /** Numéro de ligne dans le fichier (l'en-tête est la ligne 1). */
  line: number;
  cells: Record<string, string>;
}

/** Première ligne non vide = en-têtes ; renvoie les lignes de données (vides ignorées) avec leur numéro. */
export function toRecords(rows: string[][]): { headers: string[]; records: SheetRecord[] } {
  const headerIdx = rows.findIndex((r) => r.some((c) => c.trim() !== ""));
  if (headerIdx < 0) return { headers: [], records: [] };
  const headers = rows[headerIdx].map(normalizeHeader);
  const records: SheetRecord[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.every((c) => c.trim() === "")) continue;
    const cells: Record<string, string> = {};
    headers.forEach((h, k) => {
      // Les choix du quiz peuvent se répéter : la première colonne de même nom l'emporte.
      if (h && !(h in cells)) cells[h] = (r[k] ?? "").trim();
    });
    records.push({ line: i + 1, cells });
  }
  return { headers, records };
}

export class SpreadsheetError extends Error {}

/**
 * Point d'extension tableur : le CSV est lu ici. Pour le format Excel (.xlsx), brancher la
 * bibliothèque choisie dans `readExcel` (non installée : à valider avant) ; le reste du code ne change pas.
 */
async function readExcel(_file: File): Promise<string[][]> {
  throw new SpreadsheetError("Le format Excel sera bientôt disponible : enregistrez votre fichier au format CSV (Fichier > Enregistrer sous > CSV) puis réessayez.");
}

export async function readSpreadsheet(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (/\.xlsx?$/.test(name)) return readExcel(file);
  if (!/\.(csv|txt)$/.test(name)) throw new SpreadsheetError("Format non reconnu : choisissez un fichier .csv.");
  const buffer = await file.arrayBuffer();
  let text = new TextDecoder("utf-8").decode(buffer);
  // Excel français enregistre souvent en Windows-1252 : repli si le texte n'est pas de l'UTF-8 valide.
  if (text.includes("\uFFFD")) text = new TextDecoder("windows-1252").decode(buffer);
  return parseCsv(text, { keepBlank: true });
}
