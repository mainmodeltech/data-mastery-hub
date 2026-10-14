/**
 * AdminProjects.tsx — projets réalisés par les alumni et montrés sur le site (design system) : liste paginée par le serveur,
 * publication, création/modification (membres choisis à la création), fiche en panneau latéral (membres, captures d'écran,
 * image de couverture — téléversées vers le stockage et contrôlées côté serveur), suppression confirmée.
 */
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Eye, EyeOff, GraduationCap, Image as ImageIcon, Loader2, Pencil, Plus, Search, Trash2, Upload, Users, Wrench, X } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useAddProjectMember, useAddProjectScreenshot, useAdminProjects, useCreateProject, useDeleteProject, useDeleteProjectScreenshot,
  useProjectDetail, useRemoveProjectMember, useUpdateProject, useUploadProjectCover,
} from "@/hooks/useNetworking";
import { cn } from "@/lib/utils";
import { alumniService, type AlumniSummary } from "@/services/api/networkingService.ts";
import type { CreateProjectPayload, ProjectMemberPayload, ProjectResponse, UpdateProjectPayload } from "@/services/api/networkingService.ts";

const PAGE_SIZE = 10;

const EMPTY_PROJECT: CreateProjectPayload = {
  title: "", description: null, toolsTechnologies: [], accessLink: null, cohort: null, year: new Date().getFullYear(),
  published: true, displayOrder: 0, members: [],
};

function PersonDot({ name, photoUrl, size = "h-8 w-8" }: { name: string; photoUrl?: string | null; size?: string }) {
  return photoUrl
    ? <img src={photoUrl} alt={name} className={`${size} shrink-0 rounded-pill object-cover`} />
    : <span className={`${size} flex shrink-0 items-center justify-center rounded-pill bg-info-bg text-navy`}><GraduationCap className="h-4 w-4" aria-hidden="true" /></span>;
}

function AlumniPicker({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[], members: ProjectMemberPayload[]) => void }) {
  const { data: all = [], isLoading } = useQuery({ queryKey: ["alumni-all-published"], queryFn: () => alumniService.getAllPublished(), staleTime: 5 * 60 * 1000 });
  const toggle = (a: AlumniSummary) => {
    const ids = selectedIds.includes(a.id) ? selectedIds.filter((id) => id !== a.id) : [...selectedIds, a.id];
    onChange(ids, ids.map((id, i) => ({ alumniId: id, displayOrder: i })));
  };
  if (isLoading) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-ink-secondary" />;
  if (all.length === 0) return <p className="text-sm text-ink-secondary">Aucun alumni publié. Créez d'abord des alumni.</p>;
  return (
    <div className="grid max-h-56 gap-1 overflow-y-auto rounded-card border border-[#E7E0D4] p-2">
      {all.map((a) => (
        <label key={a.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2", selectedIds.includes(a.id) ? "bg-info-bg" : "hover:bg-app-bg")}>
          <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggle(a)} className="h-4 w-4 accent-[#1A3A5B]" />
          <PersonDot name={a.name} photoUrl={a.photoUrl} size="h-7 w-7" />
          <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{a.name}</span>{a.currentTitle && <span className="block truncate text-xs text-ink-secondary">{a.currentTitle}</span>}</span>
        </label>
      ))}
    </div>
  );
}

function ProjectDialog({ item, onClose, onCreated }: { item: ProjectResponse | null; onClose: () => void; onCreated: (id: string) => void }) {
  const { toast } = useToast();
  const create = useCreateProject();
  const update = useUpdateProject();
  const uploadCover = useUploadProjectCover();
  const coverRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CreateProjectPayload>(item ? {
    title: item.title, description: item.description, toolsTechnologies: item.toolsTechnologies ?? [], accessLink: item.accessLink,
    cohort: item.cohort, year: item.year, published: item.published, displayOrder: item.displayOrder,
    members: item.members.map((m, i) => ({ alumniId: m.alumni.id, displayOrder: i })),
  } : EMPTY_PROJECT);
  const [cover, setCover] = useState<string | null>(item?.coverImageUrl ?? null);
  const [tools, setTools] = useState((item?.toolsTechnologies ?? []).join(", "));
  const [selected, setSelected] = useState<string[]>(form.members.map((m) => m.alumniId));
  const [error, setError] = useState("");
  const pending = create.isPending || update.isPending;
  const set = (patch: Partial<CreateProjectPayload>) => setForm((f) => ({ ...f, ...patch }));

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !item) return;
    try {
      const updated = await uploadCover.mutateAsync({ id: item.id, file });
      setCover(updated.coverImageUrl ?? null);
      toast({ title: "Image de couverture mise à jour" });
    } catch (err) {
      toast({ title: "Téléversement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Le titre est obligatoire.");
    if (!item && form.members.length === 0) return setError("Sélectionnez au moins un membre du groupe.");
    const payload = { ...form, toolsTechnologies: tools.split(",").map((t) => t.trim()).filter(Boolean) };
    try {
      if (item) {
        await update.mutateAsync({ id: item.id, data: payload as UpdateProjectPayload });
        toast({ title: "Projet mis à jour", description: form.title });
      } else {
        const created = await create.mutateAsync(payload);
        toast({ title: "Projet créé", description: "Ajoutez maintenant l'image de couverture et les captures." });
        onCreated(created.id);
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{item ? `Modifier — ${item.title}` : "Nouveau projet"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Affiché sur la page Alumni du site une fois publié.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          {item && (
            <div className="relative overflow-hidden rounded-card border border-[#E7E0D4]">
              {cover ? <img src={cover} alt="Couverture" className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center bg-app-bg text-[#C9C0B0]"><ImageIcon className="h-8 w-8" aria-hidden="true" /></div>}
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Choisir une image de couverture" onChange={onCover} />
              <Button type="button" size="sm" shape="rounded" variant="outline" className="absolute bottom-2 right-2 bg-white" disabled={uploadCover.isPending} onClick={() => coverRef.current?.click()}>
                {uploadCover.isPending ? <Loader2 className="animate-spin" /> : <Upload />}{cover ? "Changer l'image" : "Ajouter une image"}
              </Button>
            </div>
          )}
          <Field label="Titre *" htmlFor="pj-title"><input id="pj-title" required className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Tableau de bord de suivi budgétaire" /></Field>
          <Field label="Description" htmlFor="pj-desc"><textarea id="pj-desc" rows={3} className={inputClass} value={form.description ?? ""} onChange={(e) => set({ description: e.target.value || null })} placeholder="Contexte, démarche, résultats…" /></Field>
          <Field label="Outils et technologies" htmlFor="pj-tools" hint="Séparés par des virgules."><input id="pj-tools" className={inputClass} value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Power BI, SQL, DAX" /></Field>
          <Field label="Lien de démonstration" htmlFor="pj-link"><input id="pj-link" type="url" className={inputClass} value={form.accessLink ?? ""} onChange={(e) => set({ accessLink: e.target.value || null })} placeholder="https://" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Promotion" htmlFor="pj-co" className="sm:col-span-2"><input id="pj-co" className={inputClass} value={form.cohort ?? ""} onChange={(e) => set({ cohort: e.target.value || null })} placeholder="Promo mars 2026" /></Field>
            <Field label="Année" htmlFor="pj-year"><input id="pj-year" type="number" className={inputClass} value={form.year ?? ""} onChange={(e) => set({ year: Number(e.target.value) || null })} /></Field>
          </div>
          {!item && (
            <Field label={`Membres du groupe * ${selected.length ? `(${selected.length})` : ""}`}>
              <AlumniPicker selectedIds={selected} onChange={(ids, members) => { setSelected(ids); set({ members }); }} />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <SwitchRow label="Publié" description="Visible sur le site." checked={form.published} onChange={(v) => set({ published: v })} />
            <Field label="Ordre" htmlFor="pj-order"><input id="pj-order" type="number" min={0} className={inputClass} value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} /></Field>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : item ? "Enregistrer" : "Créer le projet"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectSheet({ projectId, canManage, onClose, onEdit }: { projectId: string | null; canManage: boolean; onClose: () => void; onEdit: () => void }) {
  const { toast } = useToast();
  const { data: project, isLoading } = useProjectDetail(projectId);
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();
  const addShot = useAddProjectScreenshot();
  const deleteShot = useDeleteProjectScreenshot();
  const shotRef = useRef<HTMLInputElement>(null);
  const [toAdd, setToAdd] = useState("");
  const [removing, setRemoving] = useState<{ alumniId: string; name: string } | null>(null);
  const [deletingShot, setDeletingShot] = useState<string | null>(null);

  const { data: all = [] } = useQuery({ queryKey: ["alumni-all-published"], queryFn: () => alumniService.getAllPublished(), enabled: !!projectId });
  const available = all.filter((a) => !project?.members.some((m) => m.alumni.id === a.id));
  const fail = (title: string) => (e: unknown) => toast({ title, description: errorMessage(e), variant: "destructive" });

  const onShot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !projectId) return;
    try {
      await addShot.mutateAsync({ id: projectId, file, displayOrder: project?.screenshots.length ?? 0 });
      toast({ title: "Capture ajoutée" });
    } catch (err) { fail("Téléversement impossible")(err); }
  };

  return (
    <Sheet open={!!projectId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading || !project ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : (
          <div className="flex flex-col gap-5">
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-xl font-bold text-navy">{project.title}</SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-1.5">
                {(project.toolsTechnologies ?? []).map((t) => <Pill key={t} variant="info">{t}</Pill>)}
                <Pill variant={project.published ? "success" : "neutral"}>{project.published ? "Publié" : "Brouillon"}</Pill>
              </SheetDescription>
            </SheetHeader>
            {canManage && <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" onClick={onEdit}><Pencil />Modifier le projet</Button>}
            {project.coverImageUrl && <img src={project.coverImageUrl} alt={project.title} className="h-44 w-full rounded-card border border-[#E7E0D4] object-cover" />}
            {project.description && <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">{project.description}</p>}
            {project.accessLink && <a href={project.accessLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-navy hover:text-cta"><ExternalLink className="h-4 w-4" aria-hidden="true" />Voir le projet en ligne</a>}

            <section className="flex flex-col gap-3 border-t border-[#E7E0D4] pt-4">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-[0.6px] text-navy"><Users className="h-4 w-4" aria-hidden="true" />Membres ({project.members.length})</h3>
              <ul className="flex flex-col gap-2">
                {project.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-card bg-app-bg px-3 py-2">
                    <PersonDot name={m.alumni.name} photoUrl={m.alumni.photoUrl} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{m.alumni.name}</span>{m.alumni.currentTitle && <span className="block truncate text-xs text-ink-secondary">{m.alumni.currentTitle}</span>}</span>
                    {canManage && <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Retirer ${m.alumni.name}`} onClick={() => setRemoving({ alumniId: m.alumni.id, name: m.alumni.name })}><X /></Button>}
                  </li>
                ))}
              </ul>
              {canManage && available.length > 0 && (
                <div className="flex gap-2">
                  <select aria-label="Ajouter un alumni" className={cn(inputClass, "flex-1")} value={toAdd} onChange={(e) => setToAdd(e.target.value)}>
                    <option value="">Ajouter un alumni…</option>
                    {available.map((a) => <option key={a.id} value={a.id}>{a.name}{a.currentTitle ? ` · ${a.currentTitle}` : ""}</option>)}
                  </select>
                  <Button type="button" shape="rounded" disabled={!toAdd || addMember.isPending}
                    onClick={() => addMember.mutate({ projectId: project.id, data: { alumniId: toAdd } }, { onSuccess: () => { setToAdd(""); toast({ title: "Membre ajouté" }); }, onError: fail("Ajout impossible") })}>
                    {addMember.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                  </Button>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3 border-t border-[#E7E0D4] pt-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-[0.6px] text-navy"><ImageIcon className="h-4 w-4" aria-hidden="true" />Captures ({project.screenshots.length})</h3>
                {canManage && (
                  <>
                    <input ref={shotRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Choisir une capture" onChange={onShot} />
                    <Button type="button" size="sm" shape="rounded" variant="outline" disabled={addShot.isPending} onClick={() => shotRef.current?.click()}>
                      {addShot.isPending ? <Loader2 className="animate-spin" /> : <Upload />}Ajouter
                    </Button>
                  </>
                )}
              </div>
              {project.screenshots.length === 0 ? <p className="py-2 text-center text-xs text-ink-secondary">Aucune capture ajoutée.</p> : (
                <div className="grid grid-cols-2 gap-2">
                  {project.screenshots.map((s) => (
                    <div key={s.id} className="relative overflow-hidden rounded-card border border-[#E7E0D4]">
                      <img src={s.photoUrl} alt={s.caption ?? "Capture du projet"} className="h-28 w-full object-cover" />
                      {s.caption && <p className="truncate bg-navy-dark/80 px-2 py-1 text-xs text-white">{s.caption}</p>}
                      {canManage && <button type="button" aria-label="Supprimer la capture" onClick={() => setDeletingShot(s.id)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-pill bg-error text-white"><X className="h-3 w-3" /></button>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} title="Retirer ce membre ?" description={removing ? `${removing.name} ne figurera plus sur ce projet.` : ""} confirmLabel="Retirer"
        onConfirm={async () => { if (removing && projectId) { try { await removeMember.mutateAsync({ projectId, alumniId: removing.alumniId }); toast({ title: "Membre retiré" }); } catch (e) { fail("Retrait impossible")(e); } } }} />
      <ConfirmDialog open={!!deletingShot} onOpenChange={(o) => !o && setDeletingShot(null)} title="Supprimer cette capture ?" description="Elle disparaît du projet et du stockage."
        onConfirm={async () => { if (deletingShot && projectId) { try { await deleteShot.mutateAsync({ projectId, screenshotId: deletingShot }); toast({ title: "Capture supprimée" }); } catch (e) { fail("Suppression impossible")(e); } } }} />
    </Sheet>
  );
}

export default function AdminProjects() {
  const { can } = useAuth();
  const canManage = can("SITE_CONTENT_MANAGE");
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useAdminProjects(page, PAGE_SIZE);
  const update = useUpdateProject();
  const remove = useDeleteProject();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProjectResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ProjectResponse | null>(null);

  const projects = useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? 0;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? projects.filter((p) => `${p.title} ${p.cohort ?? ""} ${(p.toolsTechnologies ?? []).join(" ")}`.toLowerCase().includes(q)) : projects;
  }, [projects, search]);

  return (
    <AdminLayout
      title="Projets"
      description={`${total} projet${total > 1 ? "s" : ""} réalisé${total > 1 ? "s" : ""} par les alumni`}
      actions={canManage ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau projet</Button> : undefined}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 sm:max-w-sm">
          <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
          <input type="search" aria-label="Rechercher un projet" placeholder="Titre, promotion, outil…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les projets.</ErrorNotice>}
        {!isLoading && !isError && visible.length === 0 && <EmptyState title={projects.length === 0 ? "Aucun projet" : "Aucun projet ne correspond"} text={projects.length === 0 ? "Créez d'abord des alumni, puis le projet qu'ils ont réalisé." : undefined} />}

        {visible.length > 0 && (
          <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
            <ul>
              {visible.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-[#E7E0D4] px-4 py-3.5 last:border-b-0">
                  <button type="button" onClick={() => setDetailId(p.id)} className="flex min-w-0 flex-1 basis-72 items-center gap-4 text-left">
                    {p.coverImageUrl ? <img src={p.coverImageUrl} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-[#E7E0D4] object-cover" /> : <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-[#E7E0D4] bg-app-bg text-[#C9C0B0]"><ImageIcon className="h-5 w-5" aria-hidden="true" /></span>}
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-base font-bold text-navy">{p.title}</span>
                        {p.cohort && <Pill variant="info">{p.cohort}</Pill>}
                        <Pill variant={p.published ? "success" : "neutral"}>{p.published ? "Publié" : "Brouillon"}</Pill>
                      </span>
                      <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-ink-secondary">
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden="true" />{p.members.length} membre{p.members.length > 1 ? "s" : ""}</span>
                        {(p.toolsTechnologies?.length ?? 0) > 0 && <span className="inline-flex items-center gap-1 truncate"><Wrench className="h-3.5 w-3.5" aria-hidden="true" />{(p.toolsTechnologies ?? []).slice(0, 3).join(", ")}{(p.toolsTechnologies?.length ?? 0) > 3 ? " …" : ""}</span>}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0 gap-1.5">
                    {p.accessLink && <Button asChild size="sm" shape="rounded" variant="outline"><a href={p.accessLink} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${p.title}`}><ExternalLink /></a></Button>}
                    <Button type="button" size="sm" shape="rounded" variant="outline" onClick={() => setDetailId(p.id)}>Fiche</Button>
                    {canManage && (
                      <>
                        <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={p.published ? `Masquer ${p.title}` : `Publier ${p.title}`} title={p.published ? "Masquer" : "Publier"} disabled={update.isPending}
                          onClick={() => update.mutate({ id: p.id, data: { published: !p.published } }, { onError: (e) => toast({ title: "Action impossible", description: errorMessage(e), variant: "destructive" }) })}>{p.published ? <EyeOff /> : <Eye />}</Button>
                        <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Modifier ${p.title}`} onClick={() => setEditing(p)}><Pencil /></Button>
                        <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Supprimer ${p.title}`} onClick={() => setDeleting(p)}><Trash2 /></Button>
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

      {(creating || editing) && (
        <ProjectDialog key={editing?.id ?? "new"} item={editing} onCreated={(id) => setDetailId(id)} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
      <ProjectSheet
        projectId={detailId}
        canManage={canManage}
        onClose={() => setDetailId(null)}
        onEdit={() => { const found = projects.find((p) => p.id === detailId); if (found) { setDetailId(null); setEditing(found); } }}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Supprimer ce projet ?"
        description={deleting ? `« ${deleting.title} » et toutes ses images seront supprimés. Cette action est irréversible.` : ""}
        onConfirm={async () => { if (deleting) { try { await remove.mutateAsync(deleting.id); if (detailId === deleting.id) setDetailId(null); toast({ title: "Projet supprimé" }); } catch (e) { toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }); } } }}
      />
    </AdminLayout>
  );
}
