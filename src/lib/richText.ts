/**
 * Texte enrichi des échanges (questions, réponses, messages d'entraide) : un sous-ensemble sûr de Markdown.
 *
 *   ```sql … ```      bloc de code (langue facultative)      `code`   code en ligne
 *   **gras**  *italique*  [texte](https://…)   - liste   1. liste numérotée
 *
 * Le texte est stocké tel quel (pas de HTML) et converti ici en une arborescence que React affiche sans jamais injecter de
 * HTML : un message ne peut donc pas contenir de script. Les liens se limitent à http(s) et mailto.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "code"; v: string }
  | { t: "b"; c: Inline[] }
  | { t: "i"; c: Inline[] }
  | { t: "a"; href: string; c: Inline[] };

export type Block =
  | { t: "code"; lang: string; text: string }
  | { t: "p"; lines: Inline[][] }
  | { t: "ul"; items: Inline[][] }
  | { t: "ol"; items: Inline[][] };

const FENCE = /^```\s*([\w+#-]*)\s*$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

/** Lien autorisé : http(s) ou mailto uniquement. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  return /^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(h) ? h : null;
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  let buf = "";
  const flush = () => { if (buf) { out.push({ t: "text", v: buf }); buf = ""; } };

  while (i < src.length) {
    const ch = src[i];
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) { flush(); out.push({ t: "code", v: src.slice(i + 1, end) }); i = end + 1; continue; }
    }
    if (ch === "*" && src[i + 1] === "*") {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) { flush(); out.push({ t: "b", c: parseInline(src.slice(i + 2, end)) }); i = end + 2; continue; }
    }
    if (ch === "*") {
      const end = src.indexOf("*", i + 1);
      if (end > i + 1 && src[i + 1] !== " ") { flush(); out.push({ t: "i", c: parseInline(src.slice(i + 1, end)) }); i = end + 1; continue; }
    }
    if (ch === "[") {
      const close = src.indexOf("](", i + 1);
      const end = close > -1 ? src.indexOf(")", close + 2) : -1;
      if (close > i + 1 && end > close) {
        const href = safeHref(src.slice(close + 2, end));
        if (href) { flush(); out.push({ t: "a", href, c: parseInline(src.slice(i + 1, close)) }); i = end + 1; continue; }
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

export function parseRichText(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const fence = FENCE.exec(line.trim());
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { code.push(lines[i]); i++; }
      // une ligne « ``` » ferme le bloc ; sans fermeture, le code court jusqu'à la fin du message
      if (i < lines.length) i++;
      blocks.push({ t: "code", lang: (fence[1] ?? "").toLowerCase(), text: code.join("\n").replace(/\n+$/, "") });
      continue;
    }
    if (line.trim() === "") { i++; continue; }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = NUMBERED.test(line) && !BULLET.test(line);
      const items: Inline[][] = [];
      while (i < lines.length) {
        const m = (ordered ? NUMBERED : BULLET).exec(lines[i]);
        if (!m) break;
        items.push(parseInline(m[1]));
        i++;
      }
      blocks.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }

    const para: Inline[][] = [];
    while (i < lines.length && lines[i].trim() !== "" && !FENCE.test(lines[i].trim()) && !BULLET.test(lines[i]) && !NUMBERED.test(lines[i])) {
      para.push(parseInline(lines[i]));
      i++;
    }
    blocks.push({ t: "p", lines: para });
  }
  return blocks;
}

/** Texte brut sans mise en forme (aperçus, notifications, longueur utile). */
export function plainText(source: string): string {
  return parseRichText(source)
    .map((b) => {
      if (b.t === "code") return b.text;
      const flat = (inl: Inline[]): string => inl.map((x) => (x.t === "text" || x.t === "code" ? x.v : flat(x.c))).join("");
      if (b.t === "p") return b.lines.map(flat).join(" ");
      return b.items.map(flat).join(" ");
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
