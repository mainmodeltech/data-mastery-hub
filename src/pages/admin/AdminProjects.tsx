import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAdminProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAddProjectMember,
  useRemoveProjectMember,
  useUploadProjectCover,
  useAddProjectScreenshot,
  useDeleteProjectScreenshot,
  useProjectDetail,
} from "@/hooks/useNetworking";
import { alumniService, type AlumniSummary } from "@/services/api/networkingService.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Loader2, Upload,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ExternalLink, Users, Image as ImageIcon, X, GraduationCap,
  ChevronDown, ChevronUp, Wrench,
} from "lucide-react";
import type {
  ProjectResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectMemberPayload,
} from "@/services/api/networkingService.ts";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZES = [5, 10, 25] as const;
type PageSize = (typeof PAGE_SIZES)[number];

const EMPTY_PROJECT: CreateProjectPayload = {
  title:             "",
  description:       null,
  toolsTechnologies: [],
  accessLink:        null,
  cohort:            null,
  year:              new Date().getFullYear(),
  published:         true,
  displayOrder:      0,
  members:           [],
};

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationBar({
                         page, totalPages, totalElements, pageSize,
                         onPageChange, onPageSizeChange, isLoading,
                       }: {
  page: number; totalPages: number; totalElements: number; pageSize: PageSize;
  onPageChange: (p: number) => void; onPageSizeChange: (s: PageSize) => void; isLoading: boolean;
}) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to   = Math.min((page + 1) * pageSize, totalElements);
  return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {totalElements === 0 ? "Aucun résultat" : `${from}–${to} sur ${totalElements}`}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Lignes :</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v) as PageSize)} disabled={isLoading}>
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(0)} disabled={page === 0 || isLoading}><ChevronsLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(page - 1)} disabled={page === 0 || isLoading}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <span className="text-xs text-muted-foreground px-2">{page + 1} / {Math.max(1, totalPages)}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1 || isLoading}><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1 || isLoading}><ChevronsRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
  );
}

// ─── Sélecteur d'alumni ───────────────────────────────────────────────────────

function AlumniSelector({
                          selectedIds,
                          onChange,
                        }: {
  selectedIds: string[];
  onChange: (ids: string[], members: ProjectMemberPayload[]) => void;
}) {
  const { data: allAlumni = [], isLoading } = useQuery({
    queryKey: ["alumni-all-published"],
    queryFn:  () => alumniService.getAllPublished(),
    staleTime: 5 * 60 * 1000,
  });

  const toggle = (alumni: AlumniSummary) => {
    const isSelected = selectedIds.includes(alumni.id);
    const newIds = isSelected
        ? selectedIds.filter((id) => id !== alumni.id)
        : [...selectedIds, alumni.id];
    const members: ProjectMemberPayload[] = newIds.map((id, i) => ({ alumniId: id, displayOrder: i }));
    onChange(newIds, members);
  };

  if (isLoading) return <div className="text-sm text-muted-foreground py-4 text-center"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Chargement des alumni…</div>;
  if (allAlumni.length === 0) return <p className="text-sm text-muted-foreground">Aucun alumni disponible. Créez d'abord des alumni.</p>;

  return (
      <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto border border-border rounded-xl p-2">
        {allAlumni.map((a) => {
          const isSelected = selectedIds.includes(a.id);
          return (
              <label key={a.id}
                     className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                         isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                     }`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggle(a)} className="w-4 h-4 accent-primary" />
                {a.photoUrl ? (
                    <img src={a.photoUrl} alt={a.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{a.name}</p>
                  {a.currentTitle && <p className="text-xs text-muted-foreground truncate">{a.currentTitle}</p>}
                </div>
              </label>
          );
        })}
      </div>
  );
}

// ─── Formulaire projet (création / édition) ───────────────────────────────────

function ProjectForm({
                       initial, projectId, onSave, onClose,
                     }: {
  initial: CreateProjectPayload;
  projectId: string | null;
  onSave: (data: CreateProjectPayload | UpdateProjectPayload) => Promise<void>;
  onClose: () => void;
}) {
  const { toast }           = useToast();
  const uploadCover         = useUploadProjectCover();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm]     = useState<CreateProjectPayload>(initial);
  const [toolsInput, setToolsInput] = useState(
      (initial.toolsTechnologies ?? []).join(", ")
  );
  const [selectedAlumniIds, setSelectedAlumniIds] = useState<string[]>(
      initial.members.map((m) => m.alumniId)
  );
  const coverRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<CreateProjectPayload>) =>
      setForm((prev) => ({ ...prev, ...patch }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploading(true);
    try {
      const updated = await uploadCover.mutateAsync({ id: projectId, file });
      set({ coverImageUrl: updated.coverImageUrl });
      toast({ title: "Image de couverture mise à jour" });
    } catch {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleAlumniChange = (ids: string[], members: ProjectMemberPayload[]) => {
    setSelectedAlumniIds(ids);
    set({ members });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Le titre est obligatoire", variant: "destructive" });
      return;
    }
    if (!projectId && form.members.length === 0) {
      toast({ title: "Sélectionnez au moins un membre", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const tools = toolsInput.split(",").map((t) => t.trim()).filter(Boolean);
      await onSave({ ...form, toolsTechnologies: tools });
    } finally { setSaving(false); }
  };

  return (
      <div className="space-y-6 mt-2">

        {/* Cover image (édition uniquement) */}
        {projectId && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              {form.coverImageUrl ? (
                  <img src={form.coverImageUrl} alt="Cover" className="w-full h-36 object-cover" />
              ) : (
                  <div className="w-full h-36 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
              )}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              <Button type="button" size="sm" variant="secondary" disabled={uploading}
                      className="absolute bottom-2 right-2 opacity-90"
                      onClick={() => coverRef.current?.click()}>
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                Changer l'image
              </Button>
            </div>
        )}

        {/* Infos générales */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Informations</Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Titre *</Label>
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Dashboard de suivi budgétaire" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Description</Label>
              <Textarea value={form.description ?? ""} onChange={(e) => set({ description: e.target.value || null })}
                        rows={3} placeholder="Présentation du projet, contexte, résultats…" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Outils & Technologies</Label>
              <Input value={toolsInput} onChange={(e) => setToolsInput(e.target.value)}
                     placeholder="Python, Power BI, SQL, DAX (séparés par des virgules)" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Lien de démo</Label>
              <Input value={form.accessLink ?? ""} onChange={(e) => set({ accessLink: e.target.value || null })} placeholder="https://" />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Classification</Label>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Cohorte</Label>
              <Input value={form.cohort ?? ""} onChange={(e) => set({ cohort: e.target.value || null })} placeholder="Promo Mars 2025" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Année</Label>
              <Input type="number" value={form.year ?? ""} onChange={(e) => set({ year: Number(e.target.value) || null })} />
            </div>
          </div>
        </div>

        {/* Membres — uniquement à la création */}
        {!projectId && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
                Membres du groupe *
                {selectedAlumniIds.length > 0 && (
                    <span className="ml-2 text-primary normal-case font-normal">
                ({selectedAlumniIds.length} sélectionné{selectedAlumniIds.length > 1 ? "s" : ""})
              </span>
                )}
              </Label>
              <AlumniSelector selectedIds={selectedAlumniIds} onChange={handleAlumniChange} />
            </div>
        )}

        {/* Paramètres */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.published} onChange={(e) => set({ published: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm">Publié</span>
          </label>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Ordre :</Label>
            <Input type="number" className="w-20 h-8 text-xs" value={form.displayOrder}
                   onChange={(e) => set({ displayOrder: Number(e.target.value) })} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Sauvegarde…" : projectId ? "Mettre à jour" : "Créer le projet"}
          </Button>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
        </div>
      </div>
  );
}

// ─── Panel détail projet (Sheet) ──────────────────────────────────────────────

function ProjectDetailSheet({
                              projectId,
                              open,
                              onClose,
                              onEdit,
                            }: {
  projectId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { toast }         = useToast();
  const { data: project, isLoading } = useProjectDetail(projectId);
  const addMember         = useAddProjectMember();
  const removeMember      = useRemoveProjectMember();
  const addScreenshot     = useAddProjectScreenshot();
  const deleteScreenshot  = useDeleteProjectScreenshot();

  const [alumniToAdd, setAlumniToAdd]   = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const screenshotRef                   = useRef<HTMLInputElement>(null);
  const [uploadingShot, setUploadingShot] = useState(false);

  const { data: allAlumni = [] } = useQuery({
    queryKey: ["alumni-all-published"],
    queryFn:  () => alumniService.getAllPublished(),
    enabled:  open,
  });

  const handleAddMember = async () => {
    if (!alumniToAdd || !projectId) return;
    setAddingMember(true);
    try {
      await addMember.mutateAsync({ projectId, data: { alumniId: alumniToAdd } });
      setAlumniToAdd(null);
      toast({ title: "Membre ajouté" });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      toast({ title: msg.includes("déjà") ? "Cet alumni est déjà membre" : "Erreur", variant: "destructive" });
    } finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (alumniId: string) => {
    if (!projectId || !confirm("Retirer ce membre ?")) return;
    try {
      await removeMember.mutateAsync({ projectId, alumniId });
      toast({ title: "Membre retiré" });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "";
      toast({ title: msg || "Erreur", variant: "destructive" });
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploadingShot(true);
    try {
      await addScreenshot.mutateAsync({
        id: projectId, file,
        displayOrder: (project?.screenshots.length ?? 0),
      });
      toast({ title: "Capture ajoutée" });
    } catch {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally {
      setUploadingShot(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeleteScreenshot = async (screenshotId: string) => {
    if (!projectId || !confirm("Supprimer cette capture ?")) return;
    try {
      await deleteScreenshot.mutateAsync({ projectId, screenshotId });
      toast({ title: "Capture supprimée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const availableToAdd = allAlumni.filter(
      (a) => !project?.members.some((m) => m.alumni.id === a.id)
  );

  return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {isLoading || !project ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
          ) : (
              <>
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-start justify-between gap-2">
                    <span className="leading-tight">{project.title}</span>
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="h-3.5 w-3.5 mr-1" />Modifier
                    </Button>
                  </SheetTitle>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(project.toolsTechnologies ?? []).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                    <Badge variant={project.published ? "default" : "outline"} className="text-xs">
                      {project.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                </SheetHeader>

                {/* Cover */}
                {project.coverImageUrl && (
                    <img src={project.coverImageUrl} alt={project.title}
                         className="w-full h-40 object-cover rounded-xl mb-5 border border-border" />
                )}

                {/* Description */}
                {project.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      {project.description}
                    </p>
                )}

                {project.accessLink && (
                    <a href={project.accessLink} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-5">
                      <ExternalLink className="h-3.5 w-3.5" /> Voir le projet en ligne
                    </a>
                )}

                <Separator className="my-5" />

                {/* ── Membres ───────────────────────────────────── */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Membres ({project.members.length})
                  </p>

                  <div className="space-y-2 mb-4">
                    {project.members.map((m) => (
                        <div key={m.id}
                             className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border group">
                          {m.alumni.photoUrl ? (
                              <img src={m.alumni.photoUrl} alt={m.alumni.name}
                                   className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                              </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight">{m.alumni.name}</p>
                            {m.alumni.currentTitle && (
                                <p className="text-xs text-muted-foreground">{m.alumni.currentTitle}</p>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveMember(m.alumni.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                    ))}
                  </div>

                  {/* Ajouter un membre */}
                  {availableToAdd.length > 0 && (
                      <div className="flex gap-2">
                        <Select value={alumniToAdd ?? ""} onValueChange={setAlumniToAdd}>
                          <SelectTrigger className="flex-1 h-8 text-xs">
                            <SelectValue placeholder="Ajouter un alumni…" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableToAdd.map((a) => (
                                <SelectItem key={a.id} value={a.id} className="text-xs">
                                  {a.name}{a.currentTitle ? ` · ${a.currentTitle}` : ""}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" className="h-8" onClick={handleAddMember}
                                disabled={!alumniToAdd || addingMember}>
                          {addingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                  )}
                </div>

                <Separator className="my-5" />

                {/* ── Screenshots ───────────────────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Captures ({project.screenshots.length})
                    </p>
                    <input ref={screenshotRef} type="file" accept="image/*" className="hidden"
                           onChange={handleScreenshotUpload} />
                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={uploadingShot}
                            onClick={() => screenshotRef.current?.click()}>
                      {uploadingShot
                          ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          : <Upload className="h-3 w-3 mr-1" />}
                      Ajouter
                    </Button>
                  </div>

                  {project.screenshots.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3 text-center">Aucune capture ajoutée</p>
                  ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {project.screenshots.map((s) => (
                            <div key={s.id} className="relative group rounded-lg overflow-hidden border border-border">
                              <img src={s.photoUrl} alt={s.caption ?? ""}
                                   className="w-full h-28 object-cover" />
                              {s.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-foreground/70 px-2 py-1">
                                    <p className="text-xs text-background truncate">{s.caption}</p>
                                  </div>
                              )}
                              <button
                                  onClick={() => handleDeleteScreenshot(s.id)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </>
          )}
        </SheetContent>
      </Sheet>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const AdminProjects = () => {
  const { toast }  = useToast();
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [formOpen, setFormOpen]   = useState(false);
  const [detailId, setDetailId]   = useState<string | null>(null);
  const [editItem, setEditItem]   = useState<ProjectResponse | null>(null);

  const { data, isLoading }  = useAdminProjects(page, pageSize);
  const createMutation       = useCreateProject();
  const updateMutation       = useUpdateProject();
  const deleteMutation       = useDeleteProject();

  const projects      = data?.content       ?? [];
  const totalPages    = data?.totalPages    ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit   = (item: ProjectResponse) => { setDetailId(null); setEditItem(item); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditItem(null); };

  const handleSave = async (data: CreateProjectPayload | UpdateProjectPayload) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: data as UpdateProjectPayload,
        });
        toast({ title: "Projet mis à jour" });
      } else {
        const created = await createMutation.mutateAsync(data as CreateProjectPayload);
        toast({ title: "Projet créé" });
        // Ouvrir le panel détail pour ajouter cover / screenshots
        setDetailId(created.id);
      }
      closeForm();
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  const handleTogglePublish = async (item: ProjectResponse) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { published: !item.published } });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet et toutes ses images ? Cette action est irréversible.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Projet supprimé" });
      if (detailId === id) setDetailId(null);
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const initialForm: CreateProjectPayload = editItem
      ? {
        title:             editItem.title,
        description:       editItem.description,
        toolsTechnologies: editItem.toolsTechnologies ?? [],
        accessLink:        editItem.accessLink,
        cohort:            editItem.cohort,
        year:              editItem.year,
        published:         editItem.published,
        displayOrder:      editItem.displayOrder,
        members:           editItem.members.map((m, i) => ({ alumniId: m.alumni.id, displayOrder: i })),
      }
      : EMPTY_PROJECT;

  return (
      <AdminLayout title="Projets Alumni">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm">
            {totalElements} projet{totalElements !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nouveau projet
          </Button>
        </div>

        {/* Liste */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
          ) : projects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Wrench className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucun projet. Commencez par créer des alumni.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                  Créer le premier projet
                </Button>
              </div>
          ) : (
              <>
                <div className="divide-y divide-border">
                  {projects.map((item) => (
                      <div key={item.id}
                           className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group cursor-pointer"
                           onClick={() => setDetailId(item.id)}>

                        {/* Cover */}
                        {item.coverImageUrl ? (
                            <img src={item.coverImageUrl} alt={item.title}
                                 className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-border" />
                        ) : (
                            <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                              <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                        )}

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-semibold text-sm text-foreground">{item.title}</span>
                            {item.cohort && <Badge variant="secondary" className="text-xs">{item.cohort}</Badge>}
                            <Badge variant={item.published ? "default" : "outline"} className="text-xs">
                              {item.published ? "Publié" : "Brouillon"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {item.members.length} membre{item.members.length !== 1 ? "s" : ""}
                      </span>
                            {(item.toolsTechnologies?.length ?? 0) > 0 && (
                                <span className="flex items-center gap-1 truncate">
                          <Wrench className="h-3 w-3" />
                                  {(item.toolsTechnologies ?? []).slice(0, 3).join(", ")}
                                  {(item.toolsTechnologies?.length ?? 0) > 3 && " …"}
                        </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={(e) => e.stopPropagation()}>
                          {item.accessLink && (
                              <a href={item.accessLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={() => handleTogglePublish(item)}>
                            {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={() => openEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>

                {totalPages > 0 && (
                    <div className="border-t border-border px-5">
                      <PaginationBar
                          page={page} totalPages={totalPages} totalElements={totalElements}
                          pageSize={pageSize}
                          onPageChange={setPage}
                          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
                          isLoading={isLoading}
                      />
                    </div>
                )}
              </>
          )}
        </div>

        {/* Dialog création / édition */}
        <Dialog open={formOpen} onOpenChange={closeForm}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editItem ? `Modifier — ${editItem.title}` : "Nouveau projet"}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm
                key={editItem?.id ?? "new"}
                initial={initialForm}
                projectId={editItem?.id ?? null}
                onSave={handleSave}
                onClose={closeForm}
            />
          </DialogContent>
        </Dialog>

        {/* Sheet détail — membres + screenshots */}
        <ProjectDetailSheet
            projectId={detailId}
            open={!!detailId}
            onClose={() => setDetailId(null)}
            onEdit={() => {
              // Trouver le projet dans la liste et ouvrir le formulaire
              const found = projects.find((p) => p.id === detailId);
              if (found) { setDetailId(null); openEdit(found); }
            }}
        />
      </AdminLayout>
  );
};

export default AdminProjects;
