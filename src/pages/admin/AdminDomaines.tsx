/**
 * AdminDomaines.tsx — domaines du catalogue (Data & BI, Gestion de projet…).
 * Un domaine regroupe des formations sur /formations ; « bientôt » affiche une carte
 * « prochain domaine » sans formations publiées ; « visible » le masque du site.
 */
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAdminDomains, useDeleteDomain, useSaveDomain } from "@/hooks/useCatalogAdmin";
import { useToast } from "@/hooks/use-toast";
import type { AdminDomain, DomainPayload } from "@/types/catalogAdmin.type";

const EMPTY: DomainPayload = { name: "", slug: "", description: "", badge: "", comingSoon: false, visible: true, displayOrder: 0 };

function DomainDialog({ domain, open, onOpenChange, nextOrder }: {
  domain: AdminDomain | null; open: boolean; onOpenChange: (o: boolean) => void; nextOrder: number;
}) {
  const { toast } = useToast();
  const save = useSaveDomain();
  const [form, setForm] = useState<DomainPayload>(
    domain
      ? { name: domain.name, slug: domain.slug, description: domain.description ?? "", badge: domain.badge ?? "", comingSoon: domain.comingSoon, visible: domain.visible, displayOrder: domain.displayOrder }
      : { ...EMPTY, displayOrder: nextOrder }
  );
  const set = <K extends keyof DomainPayload>(k: K, v: DomainPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" });
      return;
    }
    try {
      await save.mutateAsync({
        id: domain?.id,
        payload: { ...form, name: form.name.trim(), slug: form.slug?.trim() || undefined, displayOrder: Number(form.displayOrder) || 0 },
      });
      toast({ title: domain ? "Domaine mis à jour" : "Domaine créé", description: form.name });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Enregistrement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{domain ? "Modifier le domaine" : "Nouveau domaine"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Un domaine regroupe des formations sur la page /formations.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Nom *" htmlFor="dom-name">
            <input id="dom-name" className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Data & BI" />
          </Field>
          <Field label="Identifiant d'URL" htmlFor="dom-slug" hint="Minuscules, chiffres et tirets. Généré depuis le nom si vide.">
            <input id="dom-slug" className={inputClass} value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="data-bi" />
          </Field>
          <Field label="Description" htmlFor="dom-desc">
            <textarea id="dom-desc" rows={3} className={inputClass} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <Field label="Badge" htmlFor="dom-badge" hint="Ex. NOTRE SPÉCIALITÉ, BIENTÔT">
              <input id="dom-badge" className={inputClass} value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
            </Field>
            <Field label="Ordre" htmlFor="dom-order">
              <input id="dom-order" type="number" className={inputClass} value={form.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value))} />
            </Field>
          </div>
          <SwitchRow label="Visible sur le site" description="Décoché : le domaine et ses formations n'apparaissent plus sur /formations." checked={form.visible} onChange={(v) => set("visible", v)} />
          <SwitchRow label="Bientôt disponible" description="Affiche une carte « prochain domaine » sans formations." checked={form.comingSoon} onChange={(v) => set("comingSoon", v)} />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" shape="rounded" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDomaines() {
  const { data: domains = [], isLoading, isError } = useAdminDomains();
  const remove = useDeleteDomain();
  const { toast } = useToast();
  const [editing, setEditing] = useState<AdminDomain | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminDomain | null>(null);

  const sorted = [...domains].sort((a, b) => a.displayOrder - b.displayOrder);
  const nextOrder = sorted.length ? sorted[sorted.length - 1].displayOrder + 1 : 0;

  return (
    <AdminLayout
      title="Domaines"
      description="Regroupements du catalogue de formations"
      actions={<Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau domaine</Button>}
    >
      <div className="flex flex-col gap-4">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les domaines.</ErrorNotice>}
        {!isLoading && !isError && sorted.length === 0 && (
          <EmptyState
            title="Aucun domaine"
            text="Créez un premier domaine pour organiser vos formations (ex. Data & BI)."
            action={<Button type="button" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau domaine</Button>}
          />
        )}
        {sorted.map((d) => (
          <Card key={d.id} radius="stat" className="flex flex-wrap items-start gap-4 border border-[#E7E0D4] p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-bg font-heading text-sm font-extrabold text-navy">
              {d.displayOrder}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-navy">{d.name}</h2>
                {d.badge && <Pill variant="info">{d.badge}</Pill>}
                {d.comingSoon && <Pill variant="warning">Bientôt</Pill>}
                {!d.visible && <Pill variant="neutral">Masqué</Pill>}
              </div>
              {d.description && <p className="text-sm text-ink-secondary">{d.description}</p>}
              <span className="font-mono text-xs text-ink-secondary">/{d.slug}</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setEditing(d)}><Pencil />Modifier</Button>
              <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Supprimer ${d.name}`} onClick={() => setDeleting(d)}>
                <Trash2 />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {creating && <DomainDialog key="new" domain={null} open onOpenChange={(o) => !o && setCreating(false)} nextOrder={nextOrder} />}
      {editing && <DomainDialog key={editing.id} domain={editing} open onOpenChange={(o) => !o && setEditing(null)} nextOrder={nextOrder} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Supprimer « ${deleting?.name} » ?`}
        description="Le domaine disparaît du site. La suppression est refusée s'il contient encore des formations."
        onConfirm={async () => {
          try {
            await remove.mutateAsync(deleting!.id);
            toast({ title: "Domaine supprimé" });
          } catch (err) {
            toast({ title: "Suppression impossible", description: errorMessage(err), variant: "destructive" });
          }
        }}
      />
    </AdminLayout>
  );
}
