import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  useAllServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/useServices";
import type { Service, CreateServiceDTO, UpdateServiceDTO } from "@/types";

const emptyForm = {
  title: "", description: "", iconName: "", features: "", duration: "",
  displayOrder: 0, published: true,
};

const AdminServices = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: page, isLoading } = useAllServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const services = page?.content ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Service) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      iconName: item.iconName || "",
      features: (item.features || []).join("\n"),
      duration: item.duration || "",
      displayOrder: item.displayOrder || 0,
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
      iconName: form.iconName || null,
      features: form.features ? form.features.split("\n").filter(Boolean) : [],
      duration: form.duration || null,
      displayOrder: form.displayOrder,
      published: form.published,
    };

    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload as UpdateServiceDTO });
        toast({ title: "Service mis a jour" });
      } else {
        await createMutation.mutateAsync(payload as CreateServiceDTO);
        toast({ title: "Service cree" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Service supprime" });
    } catch {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  };

  const togglePublished = async (item: Service) => {
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
    <AdminLayout title="Services">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{services.length} service(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={item.published ? "default" : "outline"}>
                    {item.published ? "Publie" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {item.duration && <span>⏱ {item.duration}</span>}
                  {item.iconName && <span>🎨 {item.iconName}</span>}
                  <span>📋 Ordre: {item.displayOrder}</span>
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
          {services.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">Aucun service. Cliquez sur "Ajouter" pour commencer.</div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Modifier le service" : "Nouveau service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Formation Power BI" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duree</Label>
                <Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="3 a 5 jours" />
              </div>
              <div className="space-y-2">
                <Label>Icone (nom Lucide)</Label>
                <Input value={form.iconName} onChange={e => setForm({...form, iconName: e.target.value})} placeholder="BarChart3" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Fonctionnalites (1 par ligne)</Label>
              <Textarea value={form.features} onChange={e => setForm({...form, features: e.target.value})} rows={4} placeholder={"Tableaux de bord interactifs\nConnexion aux sources de donnees"} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">Publie</span>
            </label>
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

export default AdminServices;
