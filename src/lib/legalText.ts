/**
 * legalText.ts — mise en forme d'un texte légal (sous-ensemble de Markdown) en blocs affichables, sans HTML injecté.
 * Reconnu : titres (« ## », « ### »), listes (« - »), paragraphes, **gras**, *italique*. Une ligne vide sépare les paragraphes ;
 * les lignes consécutives d'un même paragraphe sont jointes. Fonction pure, couverte par tests/unit/legalText.test.ts.
 */

export type LegalInline = { t: "text"; v: string } | { t: "b"; v: string } | { t: "i"; v: string };

export type LegalBlock =
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "p"; parts: LegalInline[] }
  | { t: "ul"; items: LegalInline[][] };

/** Découpe « texte **gras** et *italique* » en morceaux ; un marqueur non refermé reste du texte. */
export function parseInline(text: string): LegalInline[] {
  const out: LegalInline[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    out.push(m[1] !== undefined ? { t: "b", v: m[1] } : { t: "i", v: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

export function parseLegalText(source: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];
  let list: LegalInline[][] | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ t: "p", parts: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = () => {
    if (list && list.length > 0) blocks.push({ t: "ul", items: list });
    list = null;
  };

  for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (line === "") { flushParagraph(); flushList(); continue; }
    if (line.startsWith("### ")) { flushParagraph(); flushList(); blocks.push({ t: "h3", text: line.slice(4).trim() }); continue; }
    if (line.startsWith("## ")) { flushParagraph(); flushList(); blocks.push({ t: "h2", text: line.slice(3).trim() }); continue; }
    if (line.startsWith("- ")) {
      flushParagraph();
      if (!list) list = [];
      list.push(parseInline(line.slice(2).trim()));
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Les champs laissés à compléter dans un texte : ils bloquent sa publication. */
export function placeholderCount(text: string): number {
  return (text.match(/\[À COMPLÉTER/g) ?? []).length;
}
