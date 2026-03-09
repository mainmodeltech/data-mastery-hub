// src/pages/admin/AdminTemoignages.tsx

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Loader2 } from "lucide-react";

import {
  useAdminTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  useToggleTestimonialPublished,
} from "@/hooks/useTestimonials";
import type { Testimonial, TestimonialRequest } from "@/types/testimonial.types";
import { TESTIMONIAL_EMPTY_FORM } from "@/types/testimonial.types";

// ─── Sous-composants ──────────────────────────────────────────────────────────

function StarRating({
                      value,
                      onChange,
                    }: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
            <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`p-1 rounded transition-colors ${
                    n <= value ? "text-accent" : "text-muted-foreground"
                }`}
            >
              <Star className={`h-6 w-6 ${n <= value ? "fill-accent" : ""}`} />
            </button>
        ))}
      </div>
  );
}

function TestimonialCard({
                           item,
                           onEdit,
                           onDelete,
                           onToggle,
                           togglePending,
                         }: {
  item: Testimonial;
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  togglePending: boolean;
}) {
  return (
      <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Nom + étoiles + badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-foreground">{item.name}</span>
            <div className="flex">
              {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
              ))}
            </div>
            <Badge variant={item.published ? "default" : "outline"}>
              {item.published ? "Publié" : "Brouillon"}
            </Badge>
            {item.bootcamp && (
                <Badge variant="secondary" className="text-xs">
                  {item.bootcamp}
                </Badge>
            )}
          </div>

          {/* Poste / Entreprise */}
          <p className="text-sm text-muted-foreground">
            {item.role}
            {item.company && ` • ${item.company}`}
          </p>

          {/* Résultat */}
          {item.result && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                🎯 {item.result}
              </p>
          )}

          {/* Contenu */}
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 italic">
            "{item.content}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
              variant="ghost"
              size="icon"
              title={item.published ? "Masquer" : "Publier"}
              onClick={() => onToggle(item.id)}
              disabled={togglePending}
          >
            {item.published ? (
                <EyeOff className="h-4 w-4" />
            ) : (
                <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" title="Modifier" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
              variant="ghost"
              size="icon"
              title="Supprimer"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
  );
}

function TestimonialFormDialog({
                                 open,
                                 onOpenChange,
                                 editItem,
                                 form,
                                 setForm,
                                 onSave,
                                 saving,
                               }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editItem: Testimonial | null;
  form: TestimonialRequest;
  setForm: (f: TestimonialRequest) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = (patch: Partial<TestimonialRequest>) =>
      setForm({ ...form, ...patch });

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Modifier le témoignage" : "Nouveau témoignage"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>

            {/* Poste / Entreprise */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poste</Label>
                <Input value={form.role} onChange={(e) => set({ role: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Entreprise</Label>
                <Input value={form.company} onChange={(e) => set({ company: e.target.value })} />
              </div>
            </div>

            {/* Bootcamp / Résultat */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bootcamp</Label>
                <Input
                    placeholder="Ex: Power BI"
                    value={form.bootcamp}
                    onChange={(e) => set({ bootcamp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Résultat obtenu</Label>
                <Input
                    placeholder="Ex: Embauché en 3 mois"
                    value={form.result}
                    onChange={(e) => set({ result: e.target.value })}
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Note (1-5)</Label>
              <StarRating value={form.rating} onChange={(n) => set({ rating: n })} />
            </div>

            {/* Contenu */}
            <div className="space-y-2">
              <Label>Témoignage *</Label>
              <Textarea
                  value={form.content}
                  onChange={(e) => set({ content: e.target.value })}
                  rows={4}
              />
            </div>

            {/* Ordre d'affichage */}
            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(e) => set({ displayOrder: Number(e.target.value) })}
              />
            </div>

            {/* Publié */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => set({ published: e.target.checked })}
                  className="w-4 h-4"
              />
              <span className="text-sm">Publié</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={onSave} disabled={saving} className="flex-1">
                {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                ) : (
                    "Sauvegarder"
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AdminTemoignages = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem]     = useState<Testimonial | null>(null);
  const [form, setForm]             = useState<TestimonialRequest>(TESTIMONIAL_EMPTY_FORM);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { data: items = [], isLoading } = useAdminTestimonials();
  const createMutation  = useCreateTestimonial();
  const updateMutation  = useUpdateTestimonial();
  const deleteMutation  = useDeleteTestimonial();
  const toggleMutation  = useToggleTestimonialPublished();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditItem(null);
    setForm(TESTIMONIAL_EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditItem(item);
    setForm({
      name:         item.name,
      role:         item.role         ?? "",
      company:      item.company      ?? "",
      content:      item.content,
      bootcamp:     item.bootcamp     ?? "",
      result:       item.result       ?? "",
      rating:       item.rating,
      published:    item.published,
      displayOrder: item.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.content.trim()) return;
    const onSuccess = () => setDialogOpen(false);

    if (editItem) {
      updateMutation.mutate(
          { id: editItem.id, payload: form },
          { onSuccess },
      );
    } else {
      createMutation.mutate(form, { onSuccess });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    deleteMutation.mutate(id);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
      <AdminLayout title="Témoignages">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {items.length} témoignage{items.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Liste */}
        {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Aucun témoignage pour l'instant.
            </div>
        ) : (
            <div className="space-y-4">
              {items.map((item) => (
                  <TestimonialCard
                      key={item.id}
                      item={item}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onToggle={(id) => toggleMutation.mutate(id)}
                      togglePending={toggleMutation.isPending}
                  />
              ))}
            </div>
        )}

        {/* Dialog formulaire */}
        <TestimonialFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editItem={editItem}
            form={form}
            setForm={setForm}
            onSave={handleSave}
            saving={createMutation.isPending || updateMutation.isPending}
        />
      </AdminLayout>
  );
};

export default AdminTemoignages;
