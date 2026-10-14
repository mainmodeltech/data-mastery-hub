// src/pages/admin/AdminContenus.tsx
// « Contenus du site » : textes, images, coordonnées, FAQ… de chaque page publique, servis par le backend
// (clé/valeur JSON). Les valeurs par défaut sont livrées avec l'application et restaurables à tout moment.
import { useEffect, useMemo, useState } from "react";
import { Code2, FileText, Loader2, RotateCcw, Save, SlidersHorizontal } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { JsonContentEditor, type Json } from "@/components/admin/JsonContentEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminSiteContent,
  useResetSiteContent,
  useSaveSiteContent,
  useSiteContentDefaultKeys,
} from "@/hooks/useSiteContent";

const KEY_LABELS: Record<string, { label: string; hint: string }> = {
  "site.company": { label: "Entreprise & coordonnées", hint: "Nom, téléphone, e-mail, adresse, horaires, réseaux sociaux et carte Google Maps" },
  "site.nav": { label: "Menu & pied de page", hint: "Liens du menu, colonnes du pied de page, mentions" },
  "page.home": { label: "Accueil", hint: "Bandeau, chiffres clés, métiers, entreprises, FAQ" },
  "page.formations": { label: "Formations (habillage)", hint: "Titres, parcours en 4 étapes, FAQ du catalogue" },
  "page.coaching": { label: "Coaching", hint: "Formules, tarifs, déroulé, FAQ, créneaux" },
  "page.entreprises": { label: "Entreprises", hint: "Offres, méthode, étude de cas, formulaire de diagnostic" },
  "page.ressources": { label: "Ressources", hint: "Articles, modèles à télécharger, atelier, newsletter" },
  "page.partenaires": { label: "Partenaires formateurs", hint: "Principe, avantages, exigences, formulaire" },
  "page.alumni": { label: "Alumni", hint: "Titres, chiffres, appels à l'action" },
  "page.about": { label: "À propos", hint: "Mission, parcours, valeurs, équipe, partenaires" },
  "page.contact": { label: "Contact", hint: "Formulaire, FAQ, photo" },
  "page.masterclass": { label: "Masterclass", hint: "Textes de la page, programme, formateur (la date, le lieu et les inscriptions se gèrent dans Masterclass)" },
  "page.orientation": { label: "Quiz d'orientation", hint: "Questions, règles de recommandation, résultats" },
};

const keyLabel = (key: string) => KEY_LABELS[key]?.label ?? key;

type Mode = "form" | "json";

export default function AdminContenus() {
  const { toast } = useToast();
  const { data: entries = [], isLoading } = useAdminSiteContent();
  const { data: defaultKeys = [] } = useSiteContentDefaultKeys();
  const save = useSaveSiteContent();
  const reset = useResetSiteContent();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Json | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("form");
  const [confirmReset, setConfirmReset] = useState(false);

  const keys = useMemo(
    () => Array.from(new Set([...entries.map((e) => e.key), ...defaultKeys])).sort(),
    [entries, defaultKeys],
  );
  const saved = useMemo(
    () => (selectedKey ? (entries.find((e) => e.key === selectedKey)?.value as Json | undefined) ?? null : null),
    [entries, selectedKey],
  );

  // Charge le contenu enregistré à la sélection d'une clé (ou après enregistrement / restauration).
  useEffect(() => {
    if (selectedKey === null) return;
    setDraft(saved);
    setJsonText(JSON.stringify(saved, null, 2));
    setJsonError(null);
  }, [selectedKey, saved]);

  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  const select = (key: string) => {
    if (key === selectedKey) return;
    if (dirty && !window.confirm("Des modifications ne sont pas enregistrées. Les abandonner ?")) return;
    setSelectedKey(key);
  };

  const updateDraft = (next: Json) => {
    setDraft(next);
    setJsonText(JSON.stringify(next, null, 2));
    setJsonError(null);
  };

  const onJsonChange = (text: string) => {
    setJsonText(text);
    try {
      setDraft(JSON.parse(text) as Json);
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "JSON invalide");
    }
  };

  const handleSave = () => {
    if (!selectedKey || draft === null || jsonError) return;
    save.mutate(
      { key: selectedKey, value: draft },
      {
        onSuccess: () => toast({ title: "Contenu enregistré", description: `« ${keyLabel(selectedKey)} » est en ligne sur le site.` }),
        onError: (err) => toast({ title: "Enregistrement impossible", description: err instanceof Error ? err.message : undefined, variant: "destructive" }),
      },
    );
  };

  const handleReset = () => {
    if (!selectedKey) return;
    reset.mutate(selectedKey, {
      onSuccess: () => {
        setConfirmReset(false);
        toast({ title: "Contenu restauré", description: "La version livrée avec l'application est de nouveau en ligne." });
      },
      onError: (err) => toast({ title: "Restauration impossible", description: err instanceof Error ? err.message : undefined, variant: "destructive" }),
    });
  };

  const canReset = selectedKey !== null && defaultKeys.includes(selectedKey);

  return (
    <AdminLayout
      title="Contenus du site"
      description="Modifiez les textes, images, coordonnées et FAQ de chaque page publique. Les changements sont visibles immédiatement."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Liste des contenus */}
        <nav aria-label="Contenus du site" className="flex flex-col gap-1.5">
          {isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</p>
          )}
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              aria-current={key === selectedKey ? "true" : undefined}
              className={
                key === selectedKey
                  ? "flex flex-col rounded-lg border border-primary bg-primary/5 px-3 py-2.5 text-left"
                  : "flex flex-col rounded-lg border border-border px-3 py-2.5 text-left hover:bg-muted/50"
              }
            >
              <span className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 shrink-0" /> {keyLabel(key)}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{KEY_LABELS[key]?.hint ?? key}</span>
            </button>
          ))}
        </nav>

        {/* Éditeur */}
        <section className="min-w-0 rounded-xl border border-border bg-card p-5">
          {selectedKey === null || draft === null ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Choisissez un contenu dans la liste pour le modifier.</p>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold">{keyLabel(selectedKey)}</h2>
                  <p className="text-xs text-muted-foreground">Clé technique : {selectedKey}{dirty ? " · modifications non enregistrées" : ""}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setMode(mode === "form" ? "json" : "form")}>
                    {mode === "form" ? <><Code2 className="mr-1.5 h-4 w-4" /> Mode JSON</> : <><SlidersHorizontal className="mr-1.5 h-4 w-4" /> Mode formulaire</>}
                  </Button>
                  {canReset && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setConfirmReset(true)} disabled={reset.isPending}>
                      <RotateCcw className="mr-1.5 h-4 w-4" /> Restaurer
                    </Button>
                  )}
                  <Button type="button" size="sm" onClick={handleSave} disabled={!dirty || Boolean(jsonError) || save.isPending}>
                    {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Enregistrer
                  </Button>
                </div>
              </div>

              {mode === "form" ? (
                <JsonContentEditor value={draft} onChange={updateDraft} />
              ) : (
                <div className="flex flex-col gap-2">
                  <Textarea value={jsonText} onChange={(e) => onJsonChange(e.target.value)} rows={28} spellCheck={false} className="font-mono text-xs" aria-label="Contenu au format JSON" />
                  {jsonError && <p role="alert" className="text-xs text-destructive">JSON invalide : {jsonError}</p>}
                </div>
              )}
              <p className="mt-6 text-xs text-muted-foreground">
                Astuce : les images se référencent par leur adresse (ex. <code>/images/photos/picture-1.jpg</code>). Les textes peuvent contenir des variables entre accolades, comme <code>{"{date}"}</code>, remplacées automatiquement sur le site.
              </p>
            </>
          )}
        </section>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer la version d'origine ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le contenu « {selectedKey ? keyLabel(selectedKey) : ""} » reviendra à la version livrée avec l'application. Vos modifications seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Restaurer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
