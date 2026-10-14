/**
 * RichTextEditor — zone de saisie avec barre d'outils (gras, italique, code, bloc de code avec langage, liste, lien) et onglet
 * « Aperçu » qui montre exactement ce que verront les lecteurs. Le texte produit est du Markdown simple (voir lib/richText.ts).
 */
import { useRef, useState } from "react";
import { Bold, Code, Code2, Italic, Link2, List } from "lucide-react";

import { RichText } from "@/components/rich/RichText";
import { CODE_LANGUAGES } from "@/lib/highlight";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const tool = "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-sand hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:opacity-40";

export function RichTextEditor({ id, value, onChange, label, placeholder, rows = 5, maxLength = 5000, required, disabled, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [lang, setLang] = useState("");

  /** Remplace la sélection par `make(selection)` puis replace le curseur ; le texte reste borné par maxLength. */
  const edit = (make: (selected: string) => { text: string; select?: [number, number] }) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { text, select } = make(value.slice(start, end));
    const next = value.slice(0, start) + text + value.slice(end);
    if (next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const [a, b] = select ?? [start + text.length, start + text.length];
      el.setSelectionRange(start + a, start + b);
    });
  };

  const wrap = (mark: string, fallback: string) => edit((sel) => {
    const inner = sel || fallback;
    return { text: `${mark}${inner}${mark}`, select: [mark.length, mark.length + inner.length] };
  });

  const codeBlock = () => edit((sel) => {
    const body = sel || "votre code ici";
    const lead = value.slice(0, ref.current?.selectionStart ?? 0);
    const prefix = lead === "" || lead.endsWith("\n\n") ? "" : lead.endsWith("\n") ? "\n" : "\n\n";
    const open = `${prefix}\`\`\`${lang}\n`;
    return { text: `${open}${body}\n\`\`\`\n`, select: [open.length, open.length + body.length] };
  });

  const bullets = () => edit((sel) => {
    const lines = (sel || "élément").split("\n").map((l) => (l.startsWith("- ") ? l : `- ${l}`)).join("\n");
    return { text: lines, select: [0, lines.length] };
  });

  const link = () => edit((sel) => {
    const label = sel || "texte du lien";
    return { text: `[${label}](https://)`, select: [label.length + 3, label.length + 11] };
  });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
        <div className="flex rounded-pill border border-[#D6CEC0] bg-white p-0.5 text-xs font-semibold" role="tablist" aria-label="Mode">
          <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")}
            className={cn("rounded-pill px-3 py-1", tab === "write" ? "bg-navy text-white" : "text-ink-secondary")}>Écrire</button>
          <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}
            className={cn("rounded-pill px-3 py-1", tab === "preview" ? "bg-navy text-white" : "text-ink-secondary")}>Aperçu</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-[#D6CEC0] bg-white focus-within:border-navy">
        {tab === "write" && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E7E0D4] bg-app-bg px-2 py-1" role="toolbar" aria-label="Mise en forme">
            <button type="button" className={tool} title="Gras" aria-label="Gras" disabled={disabled} onClick={() => wrap("**", "texte")}><Bold className="h-4 w-4" /></button>
            <button type="button" className={tool} title="Italique" aria-label="Italique" disabled={disabled} onClick={() => wrap("*", "texte")}><Italic className="h-4 w-4" /></button>
            <button type="button" className={tool} title="Code dans une phrase" aria-label="Code dans une phrase" disabled={disabled} onClick={() => wrap("`", "code")}><Code className="h-4 w-4" /></button>
            <button type="button" className={tool} title="Liste" aria-label="Liste" disabled={disabled} onClick={bullets}><List className="h-4 w-4" /></button>
            <button type="button" className={tool} title="Lien" aria-label="Lien" disabled={disabled} onClick={link}><Link2 className="h-4 w-4" /></button>
            <span className="mx-1 h-5 w-px bg-[#D6CEC0]" aria-hidden="true" />
            <label className="sr-only" htmlFor={`${id}-lang`}>Langage du bloc de code</label>
            <select id={`${id}-lang`} value={lang} onChange={(e) => setLang(e.target.value)} disabled={disabled}
              className="h-8 rounded-lg border border-[#D6CEC0] bg-white px-2 text-xs text-ink">
              {CODE_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <button type="button" disabled={disabled} onClick={codeBlock}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-navy hover:bg-surface-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
              <Code2 className="h-4 w-4" aria-hidden="true" />Bloc de code
            </button>
          </div>
        )}

        {tab === "write" ? (
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Tabulation dans un bloc de code : deux espaces au lieu de quitter le champ
              if (e.key === "Tab" && !e.shiftKey && value.slice(0, e.currentTarget.selectionStart).split("```").length % 2 === 0) {
                e.preventDefault();
                edit(() => ({ text: "  " }));
              }
            }}
            className="block w-full resize-y bg-white p-3 text-sm outline-none"
          />
        ) : (
          <div className="min-h-[7rem] p-3" aria-live="polite">
            {value.trim() ? <RichText source={value} /> : <p className="text-sm text-ink-secondary">Rien à afficher pour le moment.</p>}
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-ink-secondary">
        <span>Astuce : entourez votre code avec trois accents graves (```) ou utilisez « Bloc de code ».</span>
        <span>{value.length} / {maxLength}</span>
      </div>
    </div>
  );
}
