import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  features: string[] | null;
  duration: string | null;
  display_order: number | null;
  published: boolean | null;
}

const emptyForm = { title: "", description: "", icon_name: "", features: "", duration: "", display_order: 0, published: true };

const AdminServices = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("services").select("*").order("display_order");
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Service) => {
    setEditItem(item);
    setForm({ title: item.title, description: item.description || "", icon_name: item.icon_name || "", features: (item.features || []).join("\n"), duration: item.duration || "", display_order: item.display_order || 0, published: item.published ?? true });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Le titre est requis", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { title: form.title, description: form.description || null, icon_name: form.icon_name || null, features: form.features ? form.features.split("\n").filter(Boolean) : [], duration: form.duration || null, display_order: form.display_order, published: form.published };
    const { error } = editItem ? await supabase.from("services").update(payload).eq("id", editItem.id) : await supabase.from("services").insert(payload);
    if (error) { toast({ title: "Erreur", variant: "destructive" }); } else { toast({ title: "Sauvegardé" }); setDialogOpen(false); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast({ title: "Supprimé" });
    fetch();
  };

  const togglePublished = async (item: Service) => {
    await supabase.from("services").update({ published: !item.published }).eq("id", item.id);
    fetch();
  };

  return (
    <AdminLayout title="Services">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{services.length} service(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="space-y-4">
          {services.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <Badge variant={item.published ? "default" : "outline"}>{item.published ? "Publié" : "Brouillon"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                {item.duration && <p className="text-xs text-muted-foreground mt-1">⏱ {item.duration}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => togglePublished(item)}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {services.length === 0 && <div className="text-center py-16 text-muted-foreground">Aucun service. Cliquez sur "Ajouter" pour commencer.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Modifier" : "Nouveau service"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Titre *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Durée</Label><Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="3 à 5 jours" /></div>
              <div className="space-y-2"><Label>Ordre d'affichage</Label><Input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><Label>Fonctionnalités (1 par ligne)</Label><Textarea value={form.features} onChange={e => setForm({...form, features: e.target.value})} rows={4} /></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Publié</span></label>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? "Sauvegarde..." : "Sauvegarder"}</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminServices;
