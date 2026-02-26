import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Loader2 } from "lucide-react";
import {
  useBootcamps,
  useCreateBootcamp,
  useUpdateBootcamp,
  useDeleteBootcamp,
} from "@/hooks/useBootcamps";
import type { Bootcamp, CreateBootcampDTO, UpdateBootcampDTO } from "@/types";

const emptyForm = {
  title: "", description: "", duration: "", audience: "",
  prerequisites: "", price: "", nextSession: "", benefits: "", featured: false, published: true,
};

const AdminBootcamps = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Bootcamp | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: page, isLoading } = useBootcamps();
  const createMutation = useCreateBootcamp();
  const updateMutation = useUpdateBootcamp();
  const deleteMutation = useDeleteBootcamp();

  const bootcamps = page?.content ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Bootcamp) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      duration: item.duration || "",
      audience: item.audience || "",
      prerequisites: item.prerequisites || "",
      price: item.price || "",
      nextSession: item.nextSession || "",
      benefits: (item.benefits || []).join("\n"),
      featured: item.featured,
      published: item.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Le titre est requis", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      duration: form.duration || null,
      audience: form.audience || null,
      prerequisites: form.prerequisites || null,
      price: form.price || null,
      nextSession: form.nextSession || null,
      benefits: form.benefits ? form.benefits.split("\n").filter(Boolean) : [],
      featured: form.featured,
      published: form.published,
    };

    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload as UpdateBootcampDTO });
        toast({ title: "Bootcamp mis a jour" });
      } else {
        await createMutation.mutateAsync(payload as CreateBootcampDTO);
        toast({ title: "Bootcamp cree" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bootcamp ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Bootcamp supprime" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const togglePublished = async (item: Bootcamp) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        data: { published: !item.published },
      });
    } catch {
      toast({ title: "Erreur lors du changement de statut", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Bootcamps">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{bootcamps.length} bootcamp(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {bootcamps.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  {item.featured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Mis en avant</Badge>}
                  <Badge variant={item.published ? "default" : "outline"}>
                    {item.published ? "Publie" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {item.price && <span>💰 {item.price}</span>}
                  {item.duration && <span>⏱ {item.duration}</span>}
                  {item.nextSession && <span>📅 {item.nextSession}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => togglePublished(item)} title={item.published ? "Depublier" : "Publier"}>
                  {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {bootcamps.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">Aucun bootcamp. Cliquez sur "Ajouter" pour commencer.</div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Modifier le bootcamp" : "Nouveau bootcamp"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Power BI pour la Finance" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duree</Label>
                <Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="5 jours (35h)" />
              </div>
              <div className="space-y-2">
                <Label>Prix</Label>
                <Input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="450 000 FCFA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Public cible</Label>
                <Input value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Prerequis</Label>
                <Input value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prochaine session</Label>
              <Input value={form.nextSession} onChange={e => setForm({...form, nextSession: e.target.value})} placeholder="20 - 24 Janvier 2026" />
            </div>
            <div className="space-y-2">
              <Label>Benefices (1 par ligne)</Label>
              <Textarea value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} rows={4} placeholder={"Tableaux de bord financiers\nAutomatisation des reportings"} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm">Mis en avant</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm">Publie</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBootcamps;
