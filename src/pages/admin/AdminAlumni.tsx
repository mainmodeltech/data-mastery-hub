/**
 * AdminAlumni.tsx — anciens apprenants affichés sur le site (design system) : liste paginée par le serveur, recherche dans la
 * page, publication d'un clic, création/modification en sections (identité, poste, formation), photo de profil (téléversée
 * vers le stockage, contrôlée côté serveur), suppression confirmée.
 */
import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, GraduationCap, Linkedin, Loader2, Pencil, Plus, Search, Trash2, Upload, User } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdminAlumni, useCreateAlumni, useDeleteAlumni, useUpdateAlumni, useUploadAlumniPhoto } from "@/hooks/useNetworking";
import type { AlumniDetail, CreateAlumniPayload } from "@/services/api/networkingService.ts";

const PAGE_SIZE = 20;

const EMPTY_FORM: CreateAlumniPayload = {
  name: "", email: null, phone: null, currentTitle: null, currentPosition: null, linkedinUrl: null, cohort: null,
  year: new Date().getFullYear(), bootcampTitle: null, registrationId: null, published: true, displayOrder: 0,
};

function Avatar({ name, photoUrl, size = "h-11 w-11" }: { name: string; photoUrl?: string | null; size?: string }) {
  return photoUrl
    ? <img src={photoUrl} alt={name} className={`${size} shrink-0 rounded-pill object-cover`} />
    : <span className={`${size} flex shrink-0 items-center justify-center rounded-pill bg-info-bg text-navy`}><GraduationCap className="h-5 w-5" aria-hidden="true" /></span>;
}

function AlumniDialog({ item, onClose }: { item: AlumniDetail | null; onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateAlumni();
  const update = useUpdateAlumni();
  const uploadPhoto = useUploadAlumniPhoto();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CreateAlumniPayload>(item ? {
    name: item.name, email: item.email, phone: item.phone, currentTitle: item.currentTitle, currentPosition: item.currentPosition,
    linkedinUrl: item.linkedinUrl, cohort: item.cohort, year: item.year, bootcampTitle: item.bootcampTitle, registrationId: item.registrationId,
    published: item.published, displayOrder: item.displayOrder,
  } : EMPTY_FORM);
  const [photoUrl, setPhotoUrl] = useState<string | null>(item?.photoUrl ?? null);
  const [error, setError] = useState("");
  const pending = create.isPending || update.isPending;
  const set = (patch: Partial<CreateAlumniPayload>) => setForm((f) => ({ ...f, ...patch }));
  const text = (v: string | null | undefined) => v ?? "";

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !item) return;
    try {
      const updated = await uploadPhoto.mutateAsync({ id: item.id, file });
      setPhotoUrl(updated.photoUrl ?? null);
      toast({ title: "Photo mise à jour" });
    } catch (err) {
      toast({ title: "Téléversement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Le nom est obligatoire.");
    try {
      if (item) await update.mutateAsync({ id: item.id, data: form });
      else await create.mutateAsync(form);
      toast({ title: item ? "Alumni mis à jour" : "Alumni ajouté", description: form.name });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{item ? `Modifier — ${item.name}` : "Nouvel alumni"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Affiché sur la page Alumni du site une fois publié.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-5">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          {item && (
            <div className="flex items-center gap-4 rounded-card bg-app-bg p-4">
              {photoUrl ? <img src={photoUrl} alt={form.name} className="h-16 w-16 rounded-pill object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-white text-ink-secondary"><User className="h-7 w-7" aria-hidden="true" /></span>}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">Photo de profil</span>
                <span className="text-xs text-ink-secondary">JPEG, PNG, WebP ou GIF — 5 Mo au plus</span>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Choisir une photo" onChange={onPhoto} />
                <Button type="button" size="sm" shape="rounded" variant="outline" className="w-fit" disabled={uploadPhoto.isPending} onClick={() => fileRef.current?.click()}>
                  {uploadPhoto.isPending ? <Loader2 className="animate-spin" /> : <Upload />}{photoUrl ? "Changer la photo" : "Ajouter une photo"}
                </Button>
              </div>
            </div>
          )}
          {!item && <p className="text-xs text-ink-secondary">La photo se téléverse après la création, depuis la fiche.</p>}

          <fieldset className="flex flex-col gap-3"><legend className="mb-1 font-heading text-sm font-bold text-navy">Identité</legend>
            <Field label="Nom complet *" htmlFor="al-name"><input id="al-name" required className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Amadou Diallo" /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="E-mail" htmlFor="al-mail"><input id="al-mail" type="email" className={inputClass} value={text(form.email)} onChange={(e) => set({ email: e.target.value || null })} /></Field>
              <Field label="Téléphone" htmlFor="al-tel"><input id="al-tel" className={inputClass} value={text(form.phone)} onChange={(e) => set({ phone: e.target.value || null })} /></Field>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3"><legend className="mb-1 font-heading text-sm font-bold text-navy">Poste actuel</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Titre" htmlFor="al-title"><input id="al-title" className={inputClass} value={text(form.currentTitle)} onChange={(e) => set({ currentTitle: e.target.value || null })} placeholder="Data Analyst" /></Field>
              <Field label="Organisation" htmlFor="al-org"><input id="al-org" className={inputClass} value={text(form.currentPosition)} onChange={(e) => set({ currentPosition: e.target.value || null })} placeholder="Orange Sénégal" /></Field>
            </div>
            <Field label="LinkedIn" htmlFor="al-in"><input id="al-in" type="url" className={inputClass} value={text(form.linkedinUrl)} onChange={(e) => set({ linkedinUrl: e.target.value || null })} placeholder="https://linkedin.com/in/…" /></Field>
          </fieldset>

          <fieldset className="flex flex-col gap-3"><legend className="mb-1 font-heading text-sm font-bold text-navy">Formation Model Technologie</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Formation suivie" htmlFor="al-bc"><input id="al-bc" className={inputClass} value={text(form.bootcampTitle)} onChange={(e) => set({ bootcampTitle: e.target.value || null })} placeholder="Power BI" /></Field>
              <Field label="Promotion" htmlFor="al-co"><input id="al-co" className={inputClass} value={text(form.cohort)} onChange={(e) => set({ cohort: e.target.value || null })} placeholder="Promo mars 2026" /></Field>
              <Field label="Année" htmlFor="al-year"><input id="al-year" type="number" className={inputClass} value={form.year ?? ""} onChange={(e) => set({ year: Number(e.target.value) || null })} /></Field>
              <Field label="Ordre d'affichage" htmlFor="al-order" hint="0 = en premier."><input id="al-order" type="number" min={0} className={inputClass} value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} /></Field>
            </div>
          </fieldset>

          <SwitchRow label="Publié sur le site" checked={form.published} onChange={(v) => set({ published: v })} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : item ? "Enregistrer" : "Créer l'alumni"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAlumni() {
  const { can } = useAuth();
  const canManage = can("SITE_CONTENT_MANAGE");
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useAdminAlumni(page, PAGE_SIZE);
  const update = useUpdateAlumni();
  const remove = useDeleteAlumni();
  const [editing, setEditing] = useState<AlumniDetail | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AlumniDetail | null>(null);

  const list = useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? 0;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? list.filter((a) => `${a.name} ${a.currentTitle ?? ""} ${a.currentPosition ?? ""} ${a.bootcampTitle ?? ""} ${a.cohort ?? ""}`.toLowerCase().includes(q)) : list;
  }, [list, search]);

  return (
    <AdminLayout
      title="Alumni"
      description={`${total} ancien${total > 1 ? "s" : ""} apprenant${total > 1 ? "s" : ""} enregistré${total > 1 ? "s" : ""}`}
      actions={canManage ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Ajouter</Button> : undefined}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
          <input type="search" aria-label="Rechercher un alumni" placeholder="Nom, poste, formation, promotion…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les alumni.</ErrorNotice>}
        {!isLoading && !isError && visible.length === 0 && <EmptyState title={list.length === 0 ? "Aucun alumni enregistré" : "Aucun alumni ne correspond"} text={list.length === 0 ? "Ajoutez les anciens apprenants que vous souhaitez mettre en avant." : undefined} />}

        {visible.length > 0 && (
          <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
            <ul>
              {visible.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-4 border-b border-[#E7E0D4] px-4 py-3.5 last:border-b-0">
                  <Avatar name={a.name} photoUrl={a.photoUrl} />
                  <div className="min-w-0 flex-1 basis-60">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-base font-bold text-navy">{a.name}</span>
                      {a.cohort && <Pill variant="info">{a.cohort}</Pill>}
                      <Pill variant={a.published ? "success" : "neutral"}>{a.published ? "Publié" : "Brouillon"}</Pill>
                    </div>
                    <p className="truncate text-sm text-ink-secondary">{[a.currentTitle, a.currentPosition].filter(Boolean).join(" · ") || "Poste non renseigné"}</p>
                    {a.bootcampTitle && <p className="text-xs font-semibold text-navy">{a.bootcampTitle}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {a.linkedinUrl && <Button asChild size="sm" shape="rounded" variant="outline"><a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${a.name}`}><Linkedin /></a></Button>}
                    {canManage && (
                      <>
                        <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={a.published ? `Masquer ${a.name}` : `Publier ${a.name}`} title={a.published ? "Masquer" : "Publier"} disabled={update.isPending}
                          onClick={() => update.mutate({ id: a.id, data: { published: !a.published } }, { onError: (e) => toast({ title: "Action impossible", description: errorMessage(e), variant: "destructive" }) })}>{a.published ? <EyeOff /> : <Eye />}</Button>
                        <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Modifier ${a.name}`} onClick={() => setEditing(a)}><Pencil /></Button>
                        <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Supprimer ${a.name}`} onClick={() => setDeleting(a)}><Trash2 /></Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Pager page={page} totalPages={data?.totalPages ?? 1} totalElements={total} onChange={setPage} />
      </div>

      {(creating || editing) && <AlumniDialog key={editing?.id ?? "new"} item={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Supprimer cet alumni ?"
        description={deleting ? `${deleting.name} disparaît du site. Cette action est irréversible.` : ""}
        onConfirm={async () => { if (deleting) { try { await remove.mutateAsync(deleting.id); toast({ title: "Alumni supprimé" }); } catch (e) { toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }); } } }}
      />
    </AdminLayout>
  );
}
