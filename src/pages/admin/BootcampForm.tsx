/**
 * BootcampForm.tsx — éditeur de fiche formation (création : /admin/bootcamps/new,
 * modification : /admin/bootcamps/:id/edit).
 *
 * Tout ce qui s'affiche sur /formations et /formations/:slug se règle ici : domaine,
 * dispensateur (Model Technologie ou partenaire), niveau, format, tarif, bénéfices,
 * profils, outils, programme, résultats et certification. Les sessions (dates, places,
 * prix) se gèrent à part, depuis « Sessions ».
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ExternalLink, Loader2, Plus, Save, X } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card } from "@/components/shared";
import { useAdminDomains, useAdminFormation, useAdminFormations, useAdminPartners, useSaveFormation } from "@/hooks/useCatalogAdmin";
import { useToast } from "@/hooks/use-toast";
import type { CreateBootcampPayload } from "@/types/bootcamp.type";
import type { Formation } from "@/types/formation.type";

const CATEGORIES = [
  { value: "bi", label: "Business Intelligence / Power BI" },
  { value: "data", label: "Data Analytics" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL & bases de données" },
  { value: "excel", label: "Excel" },
  { value: "ai", label: "Intelligence artificielle" },
  { value: "gestion-projet", label: "Gestion de projet & Agile" },
  { value: "cybersecurite", label: "Cybersécurité" },
  { value: "other", label: "Autre" },
];

const ICONS = ["BarChart3", "Database", "Code2", "Brain", "TrendingUp", "PieChart", "Table", "Cpu", "BookOpen", "Shield", "Users"];

const LEVELS = [
  { value: "DEBUTANT", label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "AVANCE", label: "Avancé" },
];

const FORMATS = [
  { value: "PRESENTIEL", label: "Présentiel" },
  { value: "EN_LIGNE", label: "En ligne" },
  { value: "HYBRIDE", label: "Hybride" },
];

interface FormState {
  title: string; slug: string; tagline: string; description: string;
  category: string; tag: string; iconName: string; colorKey: string; displayOrder: number;
  domainId: string; deliveredBy: "INTERNAL" | "PARTNER"; partnerId: string;
  level: string; format: string; certificationPrep: string; targetRoles: string[]; relatedFormationIds: string[];
  duration: string; price: string; priceAmount: string; audience: string; prerequisites: string;
  benefits: string[];
  profiles: { icon: string; label: string }[];
  tools: { name: string; level: number }[];
  curriculum: { week: string; title: string; hours: string; topics: string; project: string }[];
  outcomes: { stat: string; label: string }[];
  certName: string; certLogo: string; certDescription: string;
  featured: boolean; published: boolean;
}

const EMPTY: FormState = {
  title: "", slug: "", tagline: "", description: "",
  category: "data", tag: "", iconName: "BarChart3", colorKey: "accent", displayOrder: 0,
  domainId: "", deliveredBy: "INTERNAL", partnerId: "",
  level: "", format: "", certificationPrep: "", targetRoles: [], relatedFormationIds: [],
  duration: "", price: "", priceAmount: "", audience: "", prerequisites: "",
  benefits: [], profiles: [], tools: [], curriculum: [], outcomes: [],
  certName: "", certLogo: "", certDescription: "",
  featured: false, published: true,
};

function fromFormation(f: Formation): FormState {
  return {
    title: f.title ?? "", slug: f.slug ?? "", tagline: (f as { tagline?: string }).tagline ?? "", description: f.description ?? "",
    category: f.category ?? "data", tag: f.tag ?? "", iconName: f.iconName ?? "BarChart3",
    colorKey: (f as { colorKey?: string }).colorKey ?? "accent", displayOrder: f.displayOrder ?? 0,
    domainId: f.domainId ?? "", deliveredBy: f.deliveredBy ?? "INTERNAL", partnerId: f.partnerId ?? "",
    level: f.level ?? "", format: f.format ?? "", certificationPrep: f.certificationPrep ?? "",
    targetRoles: f.targetRoles ?? [], relatedFormationIds: f.relatedFormationIds ?? [],
    duration: f.duration ?? "", price: f.price ?? "",
    priceAmount: (f as { priceAmount?: number | null }).priceAmount != null ? String((f as { priceAmount?: number }).priceAmount) : "",
    audience: f.audience ?? "", prerequisites: f.prerequisites ?? "",
    benefits: f.benefits ?? [],
    profiles: f.profiles ?? [], tools: f.tools ?? [],
    curriculum: (f.curriculum ?? []).map((c) => ({ ...c, topics: (c.topics ?? []).join("\n") })),
    outcomes: f.outcomes ?? [],
    certName: f.certification?.name ?? "", certLogo: f.certification?.logo ?? "", certDescription: f.certification?.description ?? "",
    featured: f.featured ?? false, published: f.published ?? true,
  };
}

function toPayload(s: FormState): CreateBootcampPayload {
  const text = (v: string) => v.trim();
  const amount = s.priceAmount.trim() === "" ? null : Math.round(Number(s.priceAmount));
  const hasCert = s.certName.trim() !== "";
  return {
    title: text(s.title),
    slug: text(s.slug) || undefined,
    tagline: text(s.tagline),
    description: text(s.description),
    category: s.category,
    tag: text(s.tag) || undefined,
    iconName: s.iconName,
    colorKey: s.colorKey,
    displayOrder: Number(s.displayOrder) || 0,
    domainId: s.domainId || null,
    deliveredBy: s.deliveredBy,
    partnerId: s.deliveredBy === "PARTNER" ? s.partnerId || null : null,
    level: (s.level || null) as CreateBootcampPayload["level"],
    format: (s.format || null) as CreateBootcampPayload["format"],
    certificationPrep: text(s.certificationPrep),
    targetRoles: s.targetRoles,
    relatedFormationIds: s.relatedFormationIds,
    duration: text(s.duration),
    price: text(s.price),
    priceAmount: amount != null && !Number.isNaN(amount) ? amount : null,
    audience: text(s.audience),
    prerequisites: text(s.prerequisites),
    benefits: s.benefits,
    profiles: s.profiles.filter((p) => p.label.trim()),
    tools: s.tools.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), level: Math.min(100, Math.max(0, Number(t.level) || 0)) })),
    curriculum: s.curriculum
      .filter((c) => c.title.trim())
      .map((c) => ({ week: c.week.trim(), title: c.title.trim(), hours: c.hours.trim(), project: c.project.trim(), topics: c.topics.split("\n").map((t) => t.trim()).filter(Boolean) })),
    outcomes: s.outcomes.filter((o) => o.stat.trim() || o.label.trim()),
    certification: hasCert ? { name: s.certName.trim(), logo: s.certLogo.trim(), description: s.certDescription.trim() } : null,
    featured: s.featured,
    published: s.published,
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-bold text-navy">{title}</h2>
        {description && <p className="text-sm text-ink-secondary">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

function ChipList({ id, values, onChange, placeholder }: { id: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          id={id}
          className={inputClass}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Button type="button" variant="outline" shape="rounded" onClick={add} aria-label="Ajouter"><Plus /></Button>
      </div>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {values.map((v) => (
            <li key={v} className="inline-flex items-center gap-1.5 rounded-pill bg-info-bg py-1 pl-3 pr-1.5 text-sm text-navy">
              {v}
              <button type="button" aria-label={`Retirer ${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="flex h-5 w-5 items-center justify-center rounded-pill hover:bg-white">
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RowShell({ children, onRemove, label }: { children: React.ReactNode; onRemove: () => void; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#E7E0D4] bg-app-bg p-3">
      <div className="grid min-w-0 flex-1 gap-3">{children}</div>
      <button type="button" aria-label={label} onClick={onRemove} className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-white hover:text-error">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function BootcampForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: existing, isLoading: loadingExisting, isError: loadError } = useAdminFormation(id);
  const { data: domains = [] } = useAdminDomains();
  const { data: partners = [] } = useAdminPartners();
  const { data: allFormations = [] } = useAdminFormations();
  const save = useSaveFormation();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (existing && !loaded) {
      setForm(fromFormation(existing));
      setLoaded(true);
    }
  }, [existing, loaded]);

  // Nouveau : pré-sélectionne le premier domaine pour éviter une formation « orpheline »
  useEffect(() => {
    if (!isEdit && !form.domainId && domains.length > 0) setForm((f) => ({ ...f, domainId: domains[0].id }));
  }, [isEdit, domains, form.domainId]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const others = useMemo(() => allFormations.filter((f) => f.id !== id), [allFormations, id]);
  const activePartners = partners.filter((p) => p.active || p.id === form.partnerId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Le titre est obligatoire", variant: "destructive" });
      return;
    }
    if (form.deliveredBy === "PARTNER" && !form.partnerId) {
      toast({ title: "Choisissez le partenaire qui dispense la formation", variant: "destructive" });
      return;
    }
    try {
      const saved = await save.mutateAsync({ id, payload: toPayload(form) });
      toast({ title: isEdit ? "Formation mise à jour" : "Formation créée", description: saved.title });
      if (!isEdit) navigate(`/admin/bootcamps/${saved.id}/edit`, { replace: true });
    } catch (err) {
      toast({ title: "Enregistrement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const title = isEdit ? "Modifier la formation" : "Nouvelle formation";

  if (isEdit && (loadingExisting || (!loaded && !loadError))) {
    return (
      <AdminLayout title={title}>
        <Loader2 className="mx-auto my-20 h-7 w-7 animate-spin text-ink-secondary" />
      </AdminLayout>
    );
  }
  if (isEdit && loadError) {
    return (
      <AdminLayout title={title}>
        <ErrorNotice>Formation introuvable ou inaccessible. <Link to="/admin/bootcamps" className="font-semibold underline">Retour à la liste</Link></ErrorNotice>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={title}
      description={isEdit ? form.title : "Renseignez la fiche, elle s'affichera sur le site dès sa publication."}
      actions={
        isEdit ? (
          <div className="hidden gap-2 sm:flex">
            {existing?.slug && existing.published && (
              <Button asChild variant="outline" size="sm" shape="rounded">
                <a href={`/formations/${existing.slug}`} target="_blank" rel="noreferrer"><ExternalLink />Voir sur le site</a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" shape="rounded">
              <Link to={`/admin/bootcamp-sessions?bootcamp=${id}`}><CalendarDays />Sessions</Link>
            </Button>
          </div>
        ) : undefined
      }
    >
      <form onSubmit={submit} className="mx-auto flex max-w-4xl flex-col gap-5">
        <Link to="/admin/bootcamps" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-navy">
          <ArrowLeft className="h-4 w-4" />Toutes les formations
        </Link>

        <Section title="Informations principales">
          <Field label="Titre *" htmlFor="f-title"><input id="f-title" className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Bootcamp Power BI & Business Intelligence" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Accroche" htmlFor="f-tagline" hint="Phrase courte sous le titre."><input id="f-tagline" className={inputClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <Field label="Adresse de la fiche" htmlFor="f-slug" hint={isEdit ? "Modifier l'adresse casse les anciens liens." : "Générée depuis le titre si vide."}>
              <input id="f-slug" className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="power-bi-business-intelligence" />
            </Field>
          </div>
          <Field label="Description" htmlFor="f-desc"><textarea id="f-desc" rows={4} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Catégorie" htmlFor="f-cat">
              <select id="f-cat" className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Pastille" htmlFor="f-tag" hint="Ex. Le plus demandé"><input id="f-tag" className={inputClass} value={form.tag} onChange={(e) => set("tag", e.target.value)} /></Field>
            <Field label="Icône" htmlFor="f-icon">
              <select id="f-icon" className={inputClass} value={form.iconName} onChange={(e) => set("iconName", e.target.value)}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Couleur" htmlFor="f-color">
              <select id="f-color" className={inputClass} value={form.colorKey} onChange={(e) => set("colorKey", e.target.value)}>
                <option value="accent">Orange</option>
                <option value="primary">Bleu</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Catalogue" description="Où la formation apparaît et qui la dispense.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Domaine" htmlFor="f-domain" hint={domains.length === 0 ? "Aucun domaine : créez-en un dans « Domaines »." : undefined}>
              <select id="f-domain" className={inputClass} value={form.domainId} onChange={(e) => set("domainId", e.target.value)}>
                <option value="">— Aucun —</option>
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}{d.visible ? "" : " (masqué)"}</option>)}
              </select>
            </Field>
            <Field label="Dispensée par" htmlFor="f-deliv">
              <select id="f-deliv" className={inputClass} value={form.deliveredBy} onChange={(e) => set("deliveredBy", e.target.value as FormState["deliveredBy"])}>
                <option value="INTERNAL">Model Technologie</option>
                <option value="PARTNER">Un partenaire</option>
              </select>
            </Field>
          </div>
          {form.deliveredBy === "PARTNER" && (
            <Field label="Partenaire *" htmlFor="f-partner" hint={partners.length === 0 ? "Aucun partenaire : créez-en un dans « Partenaires »." : undefined}>
              <select id="f-partner" className={inputClass} value={form.partnerId} onChange={(e) => set("partnerId", e.target.value)}>
                <option value="">— Choisir —</option>
                {activePartners.map((p) => <option key={p.id} value={p.id}>{p.name}{p.active ? "" : " (inactif)"}</option>)}
              </select>
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Niveau" htmlFor="f-level">
              <select id="f-level" className={inputClass} value={form.level} onChange={(e) => set("level", e.target.value)}>
                <option value="">— Non précisé —</option>
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="Format" htmlFor="f-format">
              <select id="f-format" className={inputClass} value={form.format} onChange={(e) => set("format", e.target.value)}>
                <option value="">— Non précisé —</option>
                {FORMATS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="Ordre d'affichage" htmlFor="f-order" hint="0 = en premier"><input id="f-order" type="number" min={0} className={inputClass} value={form.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} /></Field>
          </div>
          <Field label="Certification préparée" htmlFor="f-certprep" hint="Ex. PL-300, PSM I"><input id="f-certprep" className={inputClass} value={form.certificationPrep} onChange={(e) => set("certificationPrep", e.target.value)} /></Field>
          <Field label="Métiers visés" htmlFor="f-roles" hint="Alimente le filtre « Métier » du catalogue. Entrée pour ajouter."><ChipList id="f-roles" values={form.targetRoles} onChange={(v) => set("targetRoles", v)} placeholder="Banque & Finance" /></Field>
          {others.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">Formations liées</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {others.map((o) => {
                  const checked = form.relatedFormationIds.includes(o.id);
                  return (
                    <label key={o.id} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#E7E0D4] bg-white px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => set("relatedFormationIds", checked ? form.relatedFormationIds.filter((x) => x !== o.id) : [...form.relatedFormationIds, o.id])}
                        className="h-4 w-4 accent-[#1A3A5B]"
                      />
                      <span className="min-w-0 truncate">{o.title}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </Section>

        <Section title="Durée, tarif et public" description="Le montant en FCFA sert aux paiements et aux échéances ; le texte est ce que voit le visiteur.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Durée" htmlFor="f-dur"><input id="f-dur" className={inputClass} value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="8 semaines" /></Field>
            <Field label="Prix affiché" htmlFor="f-price"><input id="f-price" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="450 000 FCFA" /></Field>
            <Field label="Montant (FCFA)" htmlFor="f-amount"><input id="f-amount" type="number" min={0} step={1000} className={inputClass} value={form.priceAmount} onChange={(e) => set("priceAmount", e.target.value)} placeholder="450000" /></Field>
          </div>
          <Field label="Public visé" htmlFor="f-aud"><input id="f-aud" className={inputClass} value={form.audience} onChange={(e) => set("audience", e.target.value)} /></Field>
          <Field label="Prérequis" htmlFor="f-pre"><input id="f-pre" className={inputClass} value={form.prerequisites} onChange={(e) => set("prerequisites", e.target.value)} /></Field>
          <Field label="Ce que vous allez obtenir" htmlFor="f-ben" hint="Entrée pour ajouter."><ChipList id="f-ben" values={form.benefits} onChange={(v) => set("benefits", v)} placeholder="Tableaux de bord Power BI professionnels" /></Field>
        </Section>

        <Section title="Profils concernés" description="« Pour qui ? » sur la fiche (emoji + libellé).">
          {form.profiles.map((p, i) => (
            <RowShell key={i} label="Retirer ce profil" onRemove={() => set("profiles", form.profiles.filter((_, j) => j !== i))}>
              <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                <input aria-label="Emoji" className={inputClass} value={p.icon} onChange={(e) => set("profiles", form.profiles.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} placeholder="💼" />
                <input aria-label="Libellé du profil" className={inputClass} value={p.label} onChange={(e) => set("profiles", form.profiles.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Contrôleurs de gestion" />
              </div>
            </RowShell>
          ))}
          <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => set("profiles", [...form.profiles, { icon: "", label: "" }])}><Plus />Ajouter un profil</Button>
        </Section>

        <Section title="Outils enseignés" description="Niveau de maîtrise visé, de 0 à 100.">
          {form.tools.map((t, i) => (
            <RowShell key={i} label="Retirer cet outil" onRemove={() => set("tools", form.tools.filter((_, j) => j !== i))}>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <input aria-label="Nom de l'outil" className={inputClass} value={t.name} onChange={(e) => set("tools", form.tools.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Power BI" />
                <input aria-label="Niveau" type="number" min={0} max={100} className={inputClass} value={t.level} onChange={(e) => set("tools", form.tools.map((x, j) => (j === i ? { ...x, level: Number(e.target.value) } : x)))} />
              </div>
            </RowShell>
          ))}
          <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => set("tools", [...form.tools, { name: "", level: 80 }])}><Plus />Ajouter un outil</Button>
        </Section>

        <Section title="Programme" description="Une ligne par étape : période, titre, volume horaire, thèmes (un par ligne) et projet.">
          {form.curriculum.map((c, i) => {
            const patch = (p: Partial<FormState["curriculum"][number]>) => set("curriculum", form.curriculum.map((x, j) => (j === i ? { ...x, ...p } : x)));
            return (
              <RowShell key={i} label="Retirer cette étape" onRemove={() => set("curriculum", form.curriculum.filter((_, j) => j !== i))}>
                <div className="grid gap-3 sm:grid-cols-[1fr_2fr_90px]">
                  <input aria-label="Période" className={inputClass} value={c.week} onChange={(e) => patch({ week: e.target.value })} placeholder="Semaines 1-2" />
                  <input aria-label="Titre de l'étape" className={inputClass} value={c.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Fondamentaux & Excel avancé" />
                  <input aria-label="Heures" className={inputClass} value={c.hours} onChange={(e) => patch({ hours: e.target.value })} placeholder="18h" />
                </div>
                <textarea aria-label="Thèmes (un par ligne)" rows={3} className={inputClass} value={c.topics} onChange={(e) => patch({ topics: e.target.value })} placeholder={"Tableaux croisés dynamiques\nPower Query"} />
                <input aria-label="Projet de l'étape" className={inputClass} value={c.project} onChange={(e) => patch({ project: e.target.value })} placeholder="Projet : tableau de bord financier" />
              </RowShell>
            );
          })}
          <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => set("curriculum", [...form.curriculum, { week: "", title: "", hours: "", topics: "", project: "" }])}><Plus />Ajouter une étape</Button>
        </Section>

        <Section title="Résultats et certification">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-ink">Chiffres clés</span>
            {form.outcomes.map((o, i) => (
              <RowShell key={i} label="Retirer ce chiffre" onRemove={() => set("outcomes", form.outcomes.filter((_, j) => j !== i))}>
                <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                  <input aria-label="Chiffre" className={inputClass} value={o.stat} onChange={(e) => set("outcomes", form.outcomes.map((x, j) => (j === i ? { ...x, stat: e.target.value } : x)))} placeholder="94%" />
                  <input aria-label="Légende" className={inputClass} value={o.label} onChange={(e) => set("outcomes", form.outcomes.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="taux de satisfaction alumni" />
                </div>
              </RowShell>
            ))}
            <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={() => set("outcomes", [...form.outcomes, { stat: "", label: "" }])}><Plus />Ajouter un chiffre</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
            <Field label="Certification délivrée ou visée" htmlFor="f-cert"><input id="f-cert" className={inputClass} value={form.certName} onChange={(e) => set("certName", e.target.value)} placeholder="Microsoft Power BI Data Analyst (PL-300)" /></Field>
            <Field label="Emoji" htmlFor="f-certlogo"><input id="f-certlogo" className={inputClass} value={form.certLogo} onChange={(e) => set("certLogo", e.target.value)} placeholder="🏅" /></Field>
          </div>
          <Field label="Description de la certification" htmlFor="f-certdesc"><textarea id="f-certdesc" rows={2} className={inputClass} value={form.certDescription} onChange={(e) => set("certDescription", e.target.value)} /></Field>
        </Section>

        <Section title="Publication">
          <SwitchRow label="Publiée sur le site" description="Décochée, la fiche reste en brouillon, invisible des visiteurs." checked={form.published} onChange={(v) => set("published", v)} />
          <SwitchRow label="Mise en avant" description="Affichée en premier dans les sélections de l'accueil et du catalogue." checked={form.featured} onChange={(v) => set("featured", v)} />
        </Section>

        <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-[#E7E0D4] bg-app-bg/95 px-4 py-4 backdrop-blur lg:-mx-10 lg:px-10">
          <Button type="submit" shape="rounded" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isEdit ? "Enregistrer" : "Créer la formation"}
          </Button>
          <Button type="button" variant="outline" shape="rounded" onClick={() => navigate("/admin/bootcamps")}>Annuler</Button>
        </div>
      </form>
    </AdminLayout>
  );
}
