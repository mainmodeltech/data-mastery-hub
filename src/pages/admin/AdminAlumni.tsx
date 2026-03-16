import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAdminAlumni,
  useCreateAlumni,
  useUpdateAlumni,
  useDeleteAlumni,
  useUploadAlumniPhoto,
} from "@/hooks/useNetworking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Linkedin,
  GraduationCap,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
} from "lucide-react";
import type { AlumniDetail, CreateAlumniPayload } from "@/services/api/networkingService.ts";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZES)[number];

const EMPTY_FORM: CreateAlumniPayload = {
  name:            "",
  email:           null,
  phone:           null,
  currentTitle:    null,
  currentPosition: null,
  linkedinUrl:     null,
  cohort:          null,
  year:            new Date().getFullYear(),
  bootcampTitle:   null,
  registrationId:  null,
  published:       true,
  displayOrder:    0,
};

// ─── Sous-composants ─────────────────────────────────────────────────────────

function AlumniAvatar({ alumni, size = "md" }: { alumni: Pick<AlumniDetail, "name" | "photoUrl">; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-base" };
  if (alumni.photoUrl) {
    return (
        <img
            src={alumni.photoUrl}
            alt={alumni.name}
            className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
        />
    );
  }
  return (
      <div className={`${sizes[size]} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>
  );
}

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
            <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange(Number(v) as PageSize)}
                disabled={isLoading}
            >
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(0)}
                  disabled={page === 0 || isLoading}><ChevronsLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(page - 1)}
                  disabled={page === 0 || isLoading}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <span className="text-xs text-muted-foreground px-2">
          {page + 1} / {Math.max(1, totalPages)}
        </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages - 1 || isLoading}><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(totalPages - 1)}
                  disabled={page >= totalPages - 1 || isLoading}><ChevronsRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
  );
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

function AlumniForm({
                      initial, alumniId, onSave, onClose,
                    }: {
  initial: CreateAlumniPayload;
  alumniId: string | null;
  onSave: (data: CreateAlumniPayload) => Promise<void>;
  onClose: () => void;
}) {
  const { toast }        = useToast();
  const uploadPhoto      = useUploadAlumniPhoto();
  const [form, setForm]  = useState<CreateAlumniPayload>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef     = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<CreateAlumniPayload>) =>
      setForm((prev) => ({ ...prev, ...patch }));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !alumniId) return;
    setUploading(true);
    try {
      const updated = await uploadPhoto.mutateAsync({ id: alumniId, file });
      set({ photoUrl: updated.photoUrl ?? undefined });
      toast({ title: "Photo mise à jour" });
    } catch {
      toast({ title: "Erreur lors de l'upload", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="space-y-5 mt-2">

        {/* Photo — uniquement en mode édition */}
        {alumniId && (
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
              {form.photoUrl ? (
                  <img src={form.photoUrl} alt={form.name}
                       className="w-16 h-16 rounded-full object-cover border border-border" />
              ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                    <User className="h-7 w-7 text-primary/40" />
                  </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Photo de profil</p>
                <p className="text-xs text-muted-foreground mb-2">JPG, PNG — max 5 Mo</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                       onChange={handlePhotoUpload} />
                <Button type="button" size="sm" variant="outline" disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}>
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Upload className="h-3.5 w-3.5 mr-2" />}
                  {uploading ? "Upload…" : "Changer la photo"}
                </Button>
              </div>
            </div>
        )}

        {/* Identité */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
            Identité
          </Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Nom complet *</Label>
              <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Amadou Diallo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Email</Label>
                <Input type="email" value={form.email ?? ""} onChange={(e) => set({ email: e.target.value || null })} placeholder="amadou@example.com" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Téléphone</Label>
                <Input value={form.phone ?? ""} onChange={(e) => set({ phone: e.target.value || null })} placeholder="+221 77 000 00 00" />
              </div>
            </div>
          </div>
        </div>

        {/* Poste actuel */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
            Poste actuel
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Titre</Label>
              <Input value={form.currentTitle ?? ""} onChange={(e) => set({ currentTitle: e.target.value || null })} placeholder="Data Analyst" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Organisation</Label>
              <Input value={form.currentPosition ?? ""} onChange={(e) => set({ currentPosition: e.target.value || null })} placeholder="Orange Sénégal" />
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs mb-1 block">LinkedIn</Label>
            <Input value={form.linkedinUrl ?? ""} onChange={(e) => set({ linkedinUrl: e.target.value || null })} placeholder="https://linkedin.com/in/..." />
          </div>
        </div>

        {/* Formation */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
            Formation Model Technologie
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Bootcamp suivi</Label>
              <Input value={form.bootcampTitle ?? ""} onChange={(e) => set({ bootcampTitle: e.target.value || null })} placeholder="Power BI, Data Analyst…" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Cohorte</Label>
              <Input value={form.cohort ?? ""} onChange={(e) => set({ cohort: e.target.value || null })} placeholder="Promo Mars 2025" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Année</Label>
              <Input type="number" value={form.year ?? ""} onChange={(e) => set({ year: Number(e.target.value) || null })} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Ordre d'affichage</Label>
              <Input type="number" value={form.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Statut */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={form.published}
                 onChange={(e) => set({ published: e.target.checked })} className="w-4 h-4" />
          <span className="text-sm">Publié sur le site</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Sauvegarde…" : alumniId ? "Mettre à jour" : "Créer l'alumni"}
          </Button>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
        </div>
      </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const AdminAlumni = () => {
  const { toast }  = useToast();
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem]     = useState<AlumniDetail | null>(null);

  const { data, isLoading }  = useAdminAlumni(page, pageSize);
  const createMutation       = useCreateAlumni();
  const updateMutation       = useUpdateAlumni();
  const deleteMutation       = useDeleteAlumni();

  const alumniList   = data?.content   ?? [];
  const totalPages   = data?.totalPages   ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const openCreate = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit   = (item: AlumniDetail) => { setEditItem(item); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditItem(null); };

  const handleSave = async (formData: CreateAlumniPayload) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
        toast({ title: "Alumni mis à jour" });
      } else {
        await createMutation.mutateAsync(formData);
        toast({ title: "Alumni créé" });
      }
      closeDialog();
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  const handleTogglePublish = async (item: AlumniDetail) => {
    try {
      await updateMutation.mutateAsync({ id: item.id, data: { published: !item.published } });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet alumni ? Cette action est irréversible.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Alumni supprimé" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const initialForm: CreateAlumniPayload = editItem
      ? {
        name:            editItem.name,
        email:           editItem.email,
        phone:           editItem.phone,
        currentTitle:    editItem.currentTitle,
        currentPosition: editItem.currentPosition,
        linkedinUrl:     editItem.linkedinUrl,
        cohort:          editItem.cohort,
        year:            editItem.year,
        bootcampTitle:   editItem.bootcampTitle,
        registrationId:  editItem.registrationId,
        published:       editItem.published,
        displayOrder:    editItem.displayOrder,
      }
      : EMPTY_FORM;

  return (
      <AdminLayout title="Alumni">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">
              {totalElements} alumni enregistré{totalElements !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Ajouter un alumni
          </Button>
        </div>

        {/* Liste */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
          ) : alumniList.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Aucun alumni enregistré.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                  Ajouter le premier alumni
                </Button>
              </div>
          ) : (
              <>
                <div className="divide-y divide-border">
                  {alumniList.map((item) => (
                      <div key={item.id}
                           className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                        <AlumniAvatar alumni={item} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-semibold text-sm text-foreground">{item.name}</span>
                            {item.cohort && <Badge variant="secondary" className="text-xs">{item.cohort}</Badge>}
                            <Badge variant={item.published ? "default" : "outline"} className="text-xs">
                              {item.published ? "Publié" : "Brouillon"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {[item.currentTitle, item.currentPosition].filter(Boolean).join(" · ") || "Aucun poste renseigné"}
                          </p>
                          {item.bootcampTitle && (
                              <p className="text-xs text-primary/70 mt-0.5">{item.bootcampTitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.linkedinUrl && (
                              <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Linkedin className="h-3.5 w-3.5 text-blue-600" />
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

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="border-t border-border px-5">
                      <PaginationBar
                          page={page} totalPages={totalPages}
                          totalElements={totalElements} pageSize={pageSize}
                          onPageChange={setPage}
                          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
                          isLoading={isLoading}
                      />
                    </div>
                )}
              </>
          )}
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editItem ? `Modifier — ${editItem.name}` : "Nouvel alumni"}
              </DialogTitle>
            </DialogHeader>
            <AlumniForm
                key={editItem?.id ?? "new"}
                initial={initialForm}
                alumniId={editItem?.id ?? null}
                onSave={handleSave}
                onClose={closeDialog}
            />
          </DialogContent>
        </Dialog>
      </AdminLayout>
  );
};

export default AdminAlumni;
