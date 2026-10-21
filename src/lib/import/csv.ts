/** Parseur CSV (RFC 4180) : séparateur « ; » ou « , » détecté, BOM UTF-8 ignoré, guillemets doublés. */

export function detectDelimiter(text: string): ";" | "," {
  let semi = 0;
  let comma = 0;
  let quoted = false;
  for (const ch of text) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted) {
      if (ch === "\n") break;
      if (ch === ";") semi++;
      else if (ch === ",") comma++;
    }
  }
  return semi >= comma && semi > 0 ? ";" : comma > 0 ? "," : ";";
}

/**
 * Découpe le texte en lignes de cellules. Par défaut, les lignes vides sont ignorées ;
 * avec `keepBlank`, elles restent des lignes vides (`[]`) pour conserver la numérotation du fichier.
 */
export function parseCsv(input: string, options: { keepBlank?: boolean } = {}): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const delim = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const endRow = () => {
    row.push(cell);
    cell = "";
    const blank = row.every((c) => c.trim() === "");
    if (!blank) rows.push(row);
    else if (options.keepBlank) rows.push([]);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n") endRow();
    else if (ch === "\r") { if (text[i + 1] === "\n") i++; endRow(); }
    else cell += ch;
  }
  if (cell !== "" || row.length > 0) endRow();
  return rows;
}
