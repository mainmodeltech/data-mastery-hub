/**
 * AdminTemoignages.tsx — témoignages affichés sur le site (design system) : liste filtrable (publiés / brouillons),
 * recherche, publication d'un clic, création et modification, suppression confirmée.
 */
import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminTestimonials, useCreateTestimonial, useDeleteTestimonial, useToggleTestimonialPublished, useUpdateTestimonial,
} from "@/hooks/useTestimonials";
import { cn } from "@/lib/utils";
import type { Testimonial, TestimonialRequest } from "@/types/testimonial.types";
import { TESTIMONIAL_EMPTY_FORM } from "@/types/testimonial.types";

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : "img"} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Star className={cn(onChange ? "h-6 w-6" : "h-3.5 w-3.5", n <= value ? "fill-cta text-cta" : "text-[#C9C0B0]")} aria-hidden="true" />;
        return onChange
          ? <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} sur 5`} onClick={() => onChange(n)} className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{star}</button>
          : <span key={n}>{star}</span>;
      })}
    </div>
  );
}

function TestimonialDialog({ item, onClose }: { item: Testimonial | null; onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateTestimonial();
  const update = useUpdateTestimonial();
  const [form, setForm] = useState<TestimonialRequest>(item ? {
    name: item.name, role: item.role ?? "", company: item.company ?? "", content: item.content, bootcamp: item.bootcamp ?? "",
    result: item.result ?? "", rating: item.rating, published: item.published, displayOrder: item.displayOrder,
  } : TESTIMONIAL_EMPTY_FORM);
  const [error, setError] = useState("");
  const pending = create.isPending || update.isPending;
  const set = (patch: Partial<TestimonialRequest>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.content.trim()) return setError("Le nom et le témoignage sont obligatoires.");
    try {
      if (item) await update.mutateAsync({ id: item.id, payload: form });
      else await create.mutateAsync(form);
      toast({ title: item ? "Témoignage mis à jour" : "Témoignage ajouté", description: form.name });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{item ? "Modifier le témoignage" : "Nouveau témoignage"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Affiché sur le site une fois publié.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <Field label="Nom *" htmlFor="tm-name"><input id="tm-name" required className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Poste" htmlFor="tm-role"><input id="tm-role" className={inputClass} value={form.role} onChange={(e) => set({ role: e.target.value })} /></Field>
            <Field label="Entreprise" htmlFor="tm-co"><input id="tm-co" className={inputClass} value={form.company} onChange={(e) => set({ company: e.target.value })} /></Field>
            <Field label="Formation suivie" htmlFor="tm-bc"><input id="tm-bc" className={inputClass} placeholder="Power BI" value={form.bootcamp} onChange={(e) => set({ bootcamp: e.target.value })} /></Field>
            <Field label="Résultat obtenu" htmlFor="tm-res"><input id="tm-res" className={inputClass} placeholder="Embauché en 3 mois" value={form.result} onChange={(e) => set({ result: e.target.value })} /></Field>
          </div>
          <Field label="Note"><Stars value={form.rating} onChange={(n) => set({ rating: n })} /></Field>
          <Field label="Témoignage *" htmlFor="tm-content"><textarea id="tm-content" required rows={5} className={inputClass} value={form.content} onChange={(e) => set({ content: e.target.value })} /></Field>
          <Field label="Ordre d'affichage" htmlFor="tm-order" hint="0 = en premier."><input id="tm-order" type="number" min={0} className={cn(inputClass, "w-32")} value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} /></Field>
          <SwitchRow label="Publié" description="Visible sur le site." checked={form.published} onChange={(v) => set({ published: v })} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : "Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTemoignages() {
  const { can } = useAuth();
  const canManage = can("SITE_CONTENT_MANAGE");
  const { toast } = useToast();
  const { data: items = [], isLoading, isError } = useAdminTestimonials();
  const toggle = useToggleTestimonialPublished();
  const remove = useDeleteTestimonial();
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  const published = items.filter((i) => i.published).length;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => (filter === "ALL" || (filter === "PUBLISHED") === i.published)
      && (!q || `${i.name} ${i.role ?? ""} ${i.company ?? ""} ${i.bootcamp ?? ""} ${i.content}`.toLowerCase().includes(q)));
  }, [items, filter, search]);

  const tabs: { key: typeof filter; label: string; n: number }[] = [
    { key: "ALL", label: "Tous", n: items.length },
    { key: "PUBLISHED", label: "Publiés", n: published },
    { key: "DRAFT", label: "Brouillons", n: items.length - published },
  ];

  return (
    <AdminLayout
      title="Témoignages"
      description="Ce que disent les anciens apprenants et les entreprises, affiché sur le site"
      actions={canManage ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Ajouter</Button> : undefined}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les témoignages">
          {tabs.map((t) => (
            <Button key={t.key} type="button" size="sm" shape="pill" variant={filter === t.key ? "navy" : "outline"} aria-pressed={filter === t.key} onClick={() => setFilter(t.key)}>
              {t.label}<span className="ml-1.5 rounded-pill bg-surface-sand px-1.5 text-[0.6875rem] font-bold text-ink-secondary">{t.n}</span>
            </Button>
          ))}
          <span className="flex-1" />
          <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            <input type="search" aria-label="Rechercher un témoignage" placeholder="Nom, entreprise, texte…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 bg-transparent text-sm outline-none" />
          </div>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les témoignages.</ErrorNotice>}
        {!isLoading && !isError && visible.length === 0 && <EmptyState title={items.length === 0 ? "Aucun témoignage" : "Aucun témoignage ne correspond"} text={items.length === 0 ? "Ajoutez le premier témoignage pour le montrer sur le site." : undefined} />}

        <ul className="flex flex-col gap-3">
          {visible.map((t) => (
            <li key={t.id}>
              <Card radius="stat" className="flex flex-wrap items-start gap-4 border border-[#E7E0D4] p-4">
                <div className="min-w-0 flex-1 basis-72">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-base font-bold text-navy">{t.name}</span>
                    <Stars value={t.rating} />
                    <Pill variant={t.published ? "success" : "neutral"}>{t.published ? "Publié" : "Brouillon"}</Pill>
                    {t.bootcamp && <Pill variant="info">{t.bootcamp}</Pill>}
                  </div>
                  <p className="text-sm text-ink-secondary">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
                  {t.result && <p className="mt-0.5 text-xs font-semibold text-success">{t.result}</p>}
                  <p className="mt-1.5 line-clamp-3 text-sm italic text-ink">« {t.content} »</p>
                </div>
                {canManage && (
                  <div className="flex shrink-0 gap-1.5">
                    <Button type="button" size="sm" shape="rounded" variant="outline" disabled={toggle.isPending} aria-label={t.published ? `Masquer ${t.name}` : `Publier ${t.name}`} title={t.published ? "Masquer" : "Publier"} onClick={() => toggle.mutate(t.id)}>{t.published ? <EyeOff /> : <Eye />}</Button>
                    <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Modifier ${t.name}`} onClick={() => setEditing(t)}><Pencil /></Button>
                    <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Supprimer ${t.name}`} onClick={() => setDeleting(t)}><Trash2 /></Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </div>

      {(creating || editing) && <TestimonialDialog item={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Supprimer ce témoignage ?"
        description={deleting ? `Le témoignage de ${deleting.name} disparaît du site.` : ""}
        onConfirm={async () => { if (deleting) { try { await remove.mutateAsync(deleting.id); toast({ title: "Témoignage supprimé" }); } catch (e) { toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }); } } }}
      />
    </AdminLayout>
  );
}
