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
 * Valeur d'une cellule Excel -> texte, comme si la ligne venait d'un CSV. Les dates (lues en UTC = heure
 * affichée dans Excel) deviennent « 25/12/2026 18:30 », le format attendu pour la date du live.
 */
export function cellToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const p = (n: number) => String(n).padStart(2, "0");
    const day = `${p(value.getUTCDate())}/${p(value.getUTCMonth() + 1)}/${value.getUTCFullYear()}`;
    const h = value.getUTCHours(), mi = value.getUTCMinutes();
    return h || mi ? `${day} ${p(h)}:${p(mi)}` : day;
  }
  if (typeof value === "boolean") return value ? "oui" : "non";
  return String(value).trim();
}

/** Première feuille du classeur ; la bibliothèque est chargée à la demande (hors du bundle principal). */
async function readExcel(file: File): Promise<string[][]> {
  if (/\.xls$/i.test(file.name)) {
    throw new SpreadsheetError("L'ancien format Excel (.xls) n'est pas pris en charge : enregistrez le fichier au format .xlsx ou CSV puis réessayez.");
  }
  const { readSheet } = await import("read-excel-file/browser");
  let rows: unknown[][];
  try {
    rows = await readSheet(file);
  } catch {
    throw new SpreadsheetError("Impossible de lire ce classeur : vérifiez qu'il s'agit d'un fichier .xlsx non protégé par mot de passe.");
  }
  return rows.map((r) => r.map(cellToText));
}

export async function readSpreadsheet(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase();
  if (/\.xlsx?$/.test(name)) return readExcel(file);
  if (!/\.(csv|txt)$/.test(name)) throw new SpreadsheetError("Format non reconnu : choisissez un fichier .xlsx ou .csv.");
  const buffer = await file.arrayBuffer();
  let text = new TextDecoder("utf-8").decode(buffer);
  // Excel français enregistre souvent en Windows-1252 : repli si le texte n'est pas de l'UTF-8 valide.
  if (text.includes("\uFFFD")) text = new TextDecoder("windows-1252").decode(buffer);
  return parseCsv(text, { keepBlank: true });
}
