/**
 * AdminPartenaires.tsx — partenaires formateurs (formations dispensées par un tiers).
 * Logo téléversé vers le stockage objet par le backend ; la part de revenu sert au
 * reversement partenaire (information interne, jamais affichée sur le site).
 */
import { useAuth } from "@/hooks/useAuth";
import { useRef, useState } from "react";
import { ExternalLink, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAdminPartners, useDeletePartner, useSavePartner } from "@/hooks/useCatalogAdmin";
import { useToast } from "@/hooks/use-toast";
import type { AdminPartner, PartnerPayload } from "@/types/catalogAdmin.type";

const MAX_LOGO_MB = 2;

function PartnerDialog({ partner, open, onOpenChange }: {
  partner: AdminPartner | null; open: boolean; onOpenChange: (o: boolean) => void;
}) {
  const { can } = useAuth();
  const canRevenue = can("PARTNERS_REVENUE");
  const { toast } = useToast();
  const save = useSavePartner();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [form, setForm] = useState<PartnerPayload>({
    name: partner?.name ?? "",
    slug: partner?.slug ?? "",
    bio: partner?.bio ?? "",
    website: partner?.website ?? "",
    contactName: partner?.contactName ?? "",
    contactEmail: partner?.contactEmail ?? "",
    contactPhone: partner?.contactPhone ?? "",
    revenueSharePercent: partner?.revenueSharePercent ?? null,
    active: partner?.active ?? true,
  });
  const set = <K extends keyof PartnerPayload>(k: K, v: PartnerPayload[K]) => setForm((f) => ({ ...f, [k]: v }));

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Le logo doit être une image", variant: "destructive" });
      return;
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      toast({ title: `Logo trop lourd (${MAX_LOGO_MB} Mo max)`, variant: "destructive" });
      return;
    }
    setLogo(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" });
      return;
    }
    const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
    try {
      await save.mutateAsync({
        id: partner?.id,
        logo,
        payload: {
          name: form.name.trim(),
          slug: clean(form.slug),
          bio: clean(form.bio),
          website: clean(form.website),
          contactName: clean(form.contactName),
          contactEmail: clean(form.contactEmail),
          contactPhone: clean(form.contactPhone),
          revenueSharePercent: form.revenueSharePercent == null || Number.isNaN(form.revenueSharePercent) ? null : form.revenueSharePercent,
          active: form.active,
        },
      });
      toast({ title: partner ? "Partenaire mis à jour" : "Partenaire créé", description: form.name });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Enregistrement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const preview = logo ? URL.createObjectURL(logo) : partner?.logoUrl ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{partner ? "Modifier le partenaire" : "Nouveau partenaire"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Organisme qui dispense tout ou partie de vos formations partenaires.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E0D4] bg-white">
              {preview ? <img src={preview} alt="" className="h-full w-full object-contain p-1" /> : <Upload className="h-5 w-5 text-ink-secondary" />}
            </span>
            <div className="flex flex-col gap-1">
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Choisir un logo" onChange={(e) => { pickLogo(e.target.files?.[0]); e.target.value = ""; }} />
              <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => fileRef.current?.click()}>
                {preview ? "Changer le logo" : "Ajouter un logo"}
              </Button>
              <span className="text-xs text-ink-secondary">PNG, JPG ou SVG · {MAX_LOGO_MB} Mo max{partner ? "" : " · envoyé à l'enregistrement"}</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom *" htmlFor="pt-name"><input id="pt-name" className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Identifiant d'URL" htmlFor="pt-slug" hint="Généré depuis le nom si vide.">
              <input id="pt-slug" className={inputClass} value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
            </Field>
          </div>
          <Field label="Présentation" htmlFor="pt-bio"><textarea id="pt-bio" rows={3} className={inputClass} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></Field>
          <Field label="Site web" htmlFor="pt-web"><input id="pt-web" type="url" className={inputClass} value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Contact" htmlFor="pt-cn"><input id="pt-cn" className={inputClass} value={form.contactName ?? ""} onChange={(e) => set("contactName", e.target.value)} /></Field>
            <Field label="E-mail" htmlFor="pt-ce"><input id="pt-ce" type="email" className={inputClass} value={form.contactEmail ?? ""} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
            <Field label="Téléphone" htmlFor="pt-cp"><input id="pt-cp" className={inputClass} value={form.contactPhone ?? ""} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
          </div>
          <Field label="Part de revenu du partenaire (%)" htmlFor="pt-rev" hint={canRevenue ? "Interne — entre 0 et 100." : "Réservé au droit « Parts de revenu des partenaires »."}>
            <input
              id="pt-rev" type="number" min={0} max={100} step={0.5} className={inputClass} disabled={!canRevenue}
              value={form.revenueSharePercent ?? ""}
              onChange={(e) => set("revenueSharePercent", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <SwitchRow label="Partenaire actif" description="Désactivé : il n'est plus proposé pour de nouvelles formations." checked={form.active} onChange={(v) => set("active", v)} />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" shape="rounded" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={save.isPending}>{save.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPartenaires() {
  const { can } = useAuth();
  const canManage = can("PARTNERS_MANAGE", "PARTNERS_REVENUE");
  const { data: partners = [], isLoading, isError } = useAdminPartners();
  const remove = useDeletePartner();
  const { toast } = useToast();
  const [editing, setEditing] = useState<AdminPartner | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminPartner | null>(null);

  return (
    <AdminLayout
      title="Partenaires"
      description="Organismes qui dispensent des formations en partenariat"
      actions={canManage ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau partenaire</Button> : undefined}
    >
      <div className="flex flex-col gap-4">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les partenaires.</ErrorNotice>}
        {!isLoading && !isError && partners.length === 0 && (
          <EmptyState
            title="Aucun partenaire"
            text="Ajoutez un partenaire pour pouvoir lui attribuer des formations."
            action={canManage ? <Button type="button" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau partenaire</Button> : undefined}
          />
        )}
        {partners.map((p) => (
          <Card key={p.id} radius="stat" className="flex flex-wrap items-start gap-4 border border-[#E7E0D4] p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E0D4] bg-white font-heading text-lg font-extrabold text-navy">
              {p.logoUrl ? <img src={p.logoUrl} alt="" className="h-full w-full object-contain p-1" /> : p.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-navy">{p.name}</h2>
                <Pill variant={p.active ? "success" : "neutral"}>{p.active ? "Actif" : "Inactif"}</Pill>
                {p.revenueSharePercent != null && <Pill variant="info">{p.revenueSharePercent} % reversés</Pill>}
              </div>
              {p.bio && <p className="line-clamp-2 text-sm text-ink-secondary">{p.bio}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
                {p.contactName && <span>{p.contactName}</span>}
                {p.contactEmail && <a href={`mailto:${p.contactEmail}`} className="hover:text-navy">{p.contactEmail}</a>}
                {p.contactPhone && <span>{p.contactPhone}</span>}
                {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-navy">Site <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setEditing(p)}><Pencil />Modifier</Button>
              <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Supprimer ${p.name}`} onClick={() => setDeleting(p)}><Trash2 /></Button>
            </div>
          </Card>
        ))}
      </div>

      {creating && <PartnerDialog key="new" partner={null} open onOpenChange={(o) => !o && setCreating(false)} />}
      {editing && <PartnerDialog key={editing.id} partner={editing} open onOpenChange={(o) => !o && setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Supprimer « ${deleting?.name} » ?`}
        description="La suppression est refusée si ce partenaire dispense encore des formations."
        onConfirm={async () => {
          try {
            await remove.mutateAsync(deleting!.id);
            toast({ title: "Partenaire supprimé" });
          } catch (err) {
            toast({ title: "Suppression impossible", description: errorMessage(err), variant: "destructive" });
          }
        }}
      />
    </AdminLayout>
  );
}
