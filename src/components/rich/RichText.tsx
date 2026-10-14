/**
 * RichText — affiche un message enrichi (voir lib/richText.ts) : paragraphes, listes, liens, code en ligne et blocs de code
 * colorés avec bouton « Copier ». Rien n'est injecté en HTML : le contenu reste du texte pour React.
 */
import { memo, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

import { highlight, languageLabel, type TokenKind } from "@/lib/highlight";
import { parseRichText, type Block, type Inline } from "@/lib/richText";
import { cn } from "@/lib/utils";

const TOKEN_CLASS: Record<TokenKind, string> = {
  kw: "text-[#FFB08A] font-semibold",
  str: "text-[#8FE0B8]",
  com: "text-[#8FA5BC] italic",
  num: "text-[#F2C879]",
  fn: "text-[#A9C7F0]",
  plain: "",
};

function Inlines({ items }: { items: Inline[] }) {
  return (
    <>
      {items.map((x, i) => {
        switch (x.t) {
          case "text": return <span key={i}>{x.v}</span>;
          case "code": return <code key={i} className="rounded-md bg-surface-sand px-1.5 py-0.5 font-mono text-[0.85em] text-navy">{x.v}</code>;
          case "b": return <strong key={i} className="font-bold"><Inlines items={x.c} /></strong>;
          case "i": return <em key={i}><Inlines items={x.c} /></em>;
          case "a": return <a key={i} href={x.href} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-navy underline underline-offset-2 hover:text-cta"><Inlines items={x.c} /></a>;
        }
      })}
    </>
  );
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const tokens = useMemo(() => highlight(text, lang), [text, lang]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* presse-papier indisponible */ }
  };
  return (
    <div className="overflow-hidden rounded-xl bg-navy-dark text-[#E8EEF5]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-1.5 text-[0.6875rem] text-[#8FA5BC]">
        <span className="font-semibold uppercase tracking-[0.6px]">{languageLabel(lang)}</span>
        <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1 font-semibold hover:text-white" aria-label="Copier le code">
          {copied ? <><Check className="h-3 w-3" aria-hidden="true" />Copié</> : <><Copy className="h-3 w-3" aria-hidden="true" />Copier</>}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[0.8125rem] leading-relaxed" tabIndex={0}>
        <code>
          {tokens.map((t, i) => (t.kind === "plain" ? <span key={i}>{t.v}</span> : <span key={i} className={TOKEN_CLASS[t.kind]}>{t.v}</span>))}
        </code>
      </pre>
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "code": return <CodeBlock lang={b.lang} text={b.text} />;
    case "p": return <p>{b.lines.map((l, i) => <span key={i}>{i > 0 && <br />}<Inlines items={l} /></span>)}</p>;
    case "ul": return <ul className="list-disc space-y-0.5 pl-5">{b.items.map((it, i) => <li key={i}><Inlines items={it} /></li>)}</ul>;
    case "ol": return <ol className="list-decimal space-y-0.5 pl-5">{b.items.map((it, i) => <li key={i}><Inlines items={it} /></li>)}</ol>;
  }
}

export const RichText = memo(function RichText({ source, className }: { source: string; className?: string }) {
  const blocks = useMemo(() => parseRichText(source), [source]);
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 break-words text-sm text-ink", className)}>
      {blocks.map((b, i) => <BlockView key={i} b={b} />)}
    </div>
  );
});
