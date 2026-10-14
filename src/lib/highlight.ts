/**
 * Coloration syntaxique légère des blocs de code (SQL, Python, JavaScript/TypeScript, DAX, VBA, JSON, Bash).
 * Sans dépendance : un analyseur simple (commentaires, chaînes, nombres, mots-clés) suffit pour des extraits de cours ou de
 * questions. Les jetons sont rendus comme du texte par React (jamais en HTML).
 */

export type TokenKind = "kw" | "str" | "com" | "num" | "fn" | "plain";
export interface Token { kind: TokenKind; v: string }

interface Lang {
  keywords: string[];
  ci: boolean;               // mots-clés insensibles à la casse
  line: string[];            // débuts de commentaire jusqu'à la fin de ligne
  block?: [string, string];  // commentaire multi-lignes
  quotes: string[];
}

const SQL = "select from where group by order having join left right inner outer full cross on as and or not in is null like between case when then else end insert into values update set delete create alter drop table view index primary key foreign references distinct union all limit offset top with over partition asc desc count sum avg min max exists".split(" ");
const PY = "def class return if elif else for while in not and or is import from as with try except finally raise lambda yield pass break continue None True False global nonlocal assert del print async await".split(" ");
const JS = "function const let var return if else for while do switch case break continue new this class extends import from export default try catch finally throw async await typeof instanceof in of null undefined true false interface type enum implements".split(" ");
const DAX = "var return if switch true false calculate calculatetable filter all allexcept values distinct sum sumx average averagex count countx countrows divide related relatedtable summarize addcolumns selectedvalue earlier datesytd totalytd sameperiodlastyear dateadd format blank isblank and or not in".split(" ");
const VBA = "sub function end dim as set if then else elseif for each next to step while wend do loop until select case with new private public byval byref return exit call const true false nothing not and or string integer long double boolean variant range worksheets workbooks".split(" ");
const SH = "if then else fi for do done while case esac function echo cd ls cat grep export source sudo apt npm git docker".split(" ");

const LANGS: Record<string, Lang> = {
  sql: { keywords: SQL, ci: true, line: ["--"], block: ["/*", "*/"], quotes: ["'", '"'] },
  python: { keywords: PY, ci: false, line: ["#"], quotes: ['"', "'"] },
  js: { keywords: JS, ci: false, line: ["//"], block: ["/*", "*/"], quotes: ['"', "'", "`"] },
  dax: { keywords: DAX, ci: true, line: ["//", "--"], block: ["/*", "*/"], quotes: ['"'] },
  vba: { keywords: VBA, ci: true, line: ["'"], quotes: ['"'] },
  json: { keywords: ["true", "false", "null"], ci: false, line: [], quotes: ['"'] },
  bash: { keywords: SH, ci: false, line: ["#"], quotes: ['"', "'"] },
};

const ALIASES: Record<string, string> = {
  py: "python", python3: "python", javascript: "js", jsx: "js", ts: "js", tsx: "js", typescript: "js", node: "js",
  powerquery: "dax", m: "dax", sh: "bash", shell: "bash", zsh: "bash", vb: "vba", vbs: "vba", postgres: "sql", mysql: "sql", tsql: "sql",
};

/** Langages proposés dans l'éditeur (valeur de la clôture ```). */
export const CODE_LANGUAGES: { value: string; label: string }[] = [
  { value: "", label: "Texte" },
  { value: "sql", label: "SQL" },
  { value: "python", label: "Python" },
  { value: "dax", label: "DAX / Power Query" },
  { value: "js", label: "JavaScript" },
  { value: "vba", label: "VBA (Excel)" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Terminal" },
];

export function languageLabel(lang: string): string {
  const key = normalizeLang(lang);
  return CODE_LANGUAGES.find((l) => l.value === key)?.label ?? (lang || "Texte");
}

function normalizeLang(lang: string): string {
  const l = lang.toLowerCase();
  return ALIASES[l] ?? l;
}

const IDENT_START = /[A-Za-z_]/;
const IDENT = /[A-Za-z0-9_]/;
const DIGIT = /[0-9]/;

export function highlight(code: string, lang: string): Token[] {
  const spec = LANGS[normalizeLang(lang)];
  if (!spec) return [{ kind: "plain", v: code }];
  const kw = new Set(spec.ci ? spec.keywords.map((k) => k.toLowerCase()) : spec.keywords);
  const tokens: Token[] = [];
  let plain = "";
  const push = (kind: TokenKind, v: string) => {
    if (kind === "plain") { plain += v; return; }
    if (plain) { tokens.push({ kind: "plain", v: plain }); plain = ""; }
    tokens.push({ kind, v });
  };

  let i = 0;
  while (i < code.length) {
    const rest = code.slice(i);
    const lineStart = spec.line.find((m) => rest.startsWith(m));
    if (lineStart) {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? code.length : end;
      push("com", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (spec.block && rest.startsWith(spec.block[0])) {
      const end = code.indexOf(spec.block[1], i + spec.block[0].length);
      const stop = end === -1 ? code.length : end + spec.block[1].length;
      push("com", code.slice(i, stop));
      i = stop;
      continue;
    }
    const ch = code[i];
    if (spec.quotes.includes(ch)) {
      let j = i + 1;
      while (j < code.length && code[j] !== ch && code[j] !== "\n") { if (code[j] === "\\") j++; j++; }
      const stop = Math.min(code.length, j + 1);
      push("str", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (DIGIT.test(ch)) {
      let j = i + 1;
      while (j < code.length && /[0-9._]/.test(code[j])) j++;
      push("num", code.slice(i, j));
      i = j;
      continue;
    }
    if (IDENT_START.test(ch)) {
      let j = i + 1;
      while (j < code.length && IDENT.test(code[j])) j++;
      const word = code.slice(i, j);
      const isKeyword = kw.has(spec.ci ? word.toLowerCase() : word);
      if (isKeyword) push("kw", word);
      else if (code[j] === "(") push("fn", word);
      else push("plain", word);
      i = j;
      continue;
    }
    push("plain", ch);
    i++;
  }
  if (plain) tokens.push({ kind: "plain", v: plain });
  return tokens;
}
