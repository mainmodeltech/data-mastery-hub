/**
 * LegalText — affiche un texte légal (sous-ensemble de Markdown, voir lib/legalText.ts). Rien n'est injecté en HTML : le contenu reste du texte pour React.
 */
import { useMemo } from "react";

import { parseLegalText, type LegalInline } from "@/lib/legalText";

function Inline({ parts }: { parts: LegalInline[] }) {
  return (
    <>
      {parts.map((p, i) => (p.t === "b" ? <strong key={i} className="font-bold text-ink">{p.v}</strong> : p.t === "i" ? <em key={i}>{p.v}</em> : <span key={i}>{p.v}</span>))}
    </>
  );
}

export function LegalText({ source }: { source: string }) {
  const blocks = useMemo(() => parseLegalText(source), [source]);
  return (
    <div className="flex flex-col gap-4 text-[0.9375rem] leading-relaxed text-ink-secondary">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2": return <h2 key={i} className="mt-4 font-heading text-xl font-bold text-navy">{b.text}</h2>;
          case "h3": return <h3 key={i} className="mt-2 font-heading text-base font-bold text-navy">{b.text}</h3>;
          case "ul": return (
            <ul key={i} className="flex list-disc flex-col gap-1.5 pl-6">
              {b.items.map((item, j) => <li key={j}><Inline parts={item} /></li>)}
            </ul>
          );
          default: return <p key={i}><Inline parts={b.parts} /></p>;
        }
      })}
    </div>
  );
}
