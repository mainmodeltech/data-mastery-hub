/**
 * JsonContentEditor — éditeur de formulaire générique pour un contenu JSON du site (objets, listes,
 * textes, nombres, booléens). Les libellés sont déduits des clés ; une valeur d'image (clé `image`,
 * `photoUrl`, `url`… se terminant par une extension d'image) s'affiche en aperçu.
 * Les listes d'objets se complètent à partir de leur premier élément (modèle vide).
 */
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { emptyLike, type Json } from "@/lib/json";

export type { Json };

const LABELS: Record<string, string> = {
  cta: "Bouton d'action", href: "Lien", url: "URL", label: "Libellé", title: "Titre", subtitle: "Sous-titre",
  description: "Description", eyebrow: "Sur-titre", image: "Image (URL)", imageAlt: "Texte alternatif de l'image",
  photoUrl: "Photo (URL)", faq: "Questions fréquentes", question: "Question", answer: "Réponse",
  items: "Éléments", steps: "Étapes", features: "Points clés", name: "Nom", role: "Fonction", content: "Texte",
  linkedin: "LinkedIn", phone: "Téléphone", phoneRaw: "Téléphone (format international)", email: "E-mail",
  whatsappUrl: "Lien WhatsApp", address: "Adresse", hours: "Horaires", map: "Carte Google Maps",
  query: "Adresse recherchée", zoom: "Zoom (1-21)", enabled: "Activé", price: "Tarif", tags: "Étiquettes",
};

function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const IMAGE_RE = /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i;
const isImageField = (key: string, value: string) =>
  value.length > 0 && IMAGE_RE.test(value) && /image|photo|logo|url|cover/i.test(key);

/** Intitulé d'un élément de liste : premier champ texte parmi les plus parlants. */
function itemTitle(item: Json, index: number): string {
  if (typeof item === "string") return item || `Élément ${index + 1}`;
  if (item && typeof item === "object" && !Array.isArray(item)) {
    for (const k of ["title", "name", "label", "question", "day", "year", "time", "value"]) {
      const v = (item as Record<string, Json>)[k];
      if (typeof v === "string" && v) return v.length > 60 ? `${v.slice(0, 60)}…` : v;
    }
  }
  return `Élément ${index + 1}`;
}

/** Champs simples d'abord, puis blocs imbriqués, puis listes (la base ne conserve pas l'ordre d'origine des clés). */
function orderEntries(value: { [key: string]: Json }): [string, Json][] {
  const rank = (v: Json) => (Array.isArray(v) ? 2 : v !== null && typeof v === "object" ? 1 : 0);
  return Object.entries(value).sort((a, b) => rank(a[1]) - rank(b[1]));
}

interface FieldProps {
  name: string;
  value: Json;
  onChange: (next: Json) => void;
  depth: number;
}

function PrimitiveField({ name, value, onChange }: Omit<FieldProps, "depth">) {
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
        <span className="text-sm font-medium">{humanize(name)}</span>
        <Switch checked={value} onCheckedChange={onChange} aria-label={humanize(name)} />
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{humanize(name)}</label>
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
      </div>
    );
  }
  const text = typeof value === "string" ? value : "";
  const long = text.length > 70 || text.includes("\n") || /description|content|answer|bio|message|text$/i.test(name);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{humanize(name)}</label>
      {long ? (
        <Textarea value={text} rows={Math.min(8, Math.max(3, Math.ceil(text.length / 80)))} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={text} onChange={(e) => onChange(e.target.value)} />
      )}
      {isImageField(name, text) && (
        <img src={text} alt="" className="mt-1 h-24 w-40 rounded-md border border-border object-cover" loading="lazy" />
      )}
    </div>
  );
}

function ArrayField({ name, value, onChange, depth }: FieldProps & { value: Json[] }) {
  const template: Json | undefined = value.length > 0 ? emptyLike(value[0]) : undefined;
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  const stringList = value.length > 0 ? value.every((v) => typeof v === "string") : template === undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{humanize(name)}</span>
        <span className="text-xs text-muted-foreground">{value.length} élément{value.length > 1 ? "s" : ""}</span>
      </div>
      {value.length === 0 && template === undefined && (
        <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Liste vide — utilisez le mode JSON avancé pour définir le premier élément complexe.
        </p>
      )}
      {value.map((item, i) => {
        const controls = (
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Monter">
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Descendre">
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Supprimer">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
        if (typeof item === "object" && item !== null) {
          return (
            <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">{i + 1}. {itemTitle(item, i)}</span>
                {controls}
              </div>
              <ValueEditor name={`${name}-${i}`} value={item} depth={depth + 1} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} inline />
            </div>
          );
        }
        return (
          <div key={i} className="flex items-center gap-2">
            <Input value={typeof item === "string" ? item : String(item ?? "")} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            {controls}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={template === undefined && !stringList}
        onClick={() => onChange([...value, template ?? ""])}
      >
        <Plus className="mr-1 h-4 w-4" /> Ajouter
      </Button>
    </div>
  );
}

function ValueEditor({ name, value, onChange, depth, inline }: FieldProps & { inline?: boolean }) {
  if (Array.isArray(value)) return <ArrayField name={name} value={value} onChange={onChange} depth={depth} />;

  if (value !== null && typeof value === "object") {
    const entries = orderEntries(value);
    const body = (
      <div className="flex flex-col gap-4">
        {entries.map(([k, v]) => (
          <ValueEditor key={k} name={k} value={v} depth={depth + 1} onChange={(next) => onChange({ ...value, [k]: next })} />
        ))}
      </div>
    );
    if (inline) return body;
    return (
      <fieldset className="rounded-xl border border-border p-4">
        <legend className="px-2 text-sm font-bold">{humanize(name)}</legend>
        {body}
      </fieldset>
    );
  }
  return <PrimitiveField name={name} value={value} onChange={onChange} />;
}

export function JsonContentEditor({ value, onChange }: { value: Json; onChange: (next: Json) => void }) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return <ValueEditor name="valeur" value={value} depth={0} onChange={onChange} />;
  }
  return (
    <div className="flex flex-col gap-5">
      {orderEntries(value).map(([k, v]) => (
        <ValueEditor key={k} name={k} value={v} depth={0} onChange={(next) => onChange({ ...value, [k]: next })} />
      ))}
    </div>
  );
}
