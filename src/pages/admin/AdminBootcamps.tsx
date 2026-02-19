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
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";

interface Bootcamp {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  audience: string | null;
  prerequisites: string | null;
  price: string | null;
  next_session: string | null;
  benefits: string[] | null;
  featured: boolean | null;
  published: boolean | null;
  created_at: string;
}

const emptyForm = {
  title: "", description: "", duration: "", audience: "",
  prerequisites: "", price: "", next_session: "", benefits: "", featured: false, published: true,
};

const AdminBootcamps = () => {
  const { toast } = useToast();
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Bootcamp | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("bootcamps").select("*").order("created_at", { ascending: false });
    setBootcamps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

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
      next_session: item.next_session || "",
      benefits: (item.benefits || []).join("\n"),
      featured: item.featured || false,
      published: item.published ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Le titre est requis", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      duration: form.duration || null,
      audience: form.audience || null,
      prerequisites: form.prerequisites || null,
      price: form.price || null,
      next_session: form.next_session || null,
      benefits: form.benefits ? form.benefits.split("\n").filter(Boolean) : [],
      featured: form.featured,
      published: form.published,
    };

    const { error } = editItem
      ? await supabase.from("bootcamps").update(payload).eq("id", editItem.id)
      : await supabase.from("bootcamps").insert(payload);

    if (error) {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    } else {
      toast({ title: editItem ? "Bootcamp mis à jour" : "Bootcamp créé" });
      setDialogOpen(false);
      fetch();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bootcamp ?")) return;
    await supabase.from("bootcamps").delete().eq("id", id);
    toast({ title: "Bootcamp supprimé" });
    fetch();
  };

  const togglePublished = async (item: Bootcamp) => {
    await supabase.from("bootcamps").update({ published: !item.published }).eq("id", item.id);
    fetch();
  };

  return (
    <AdminLayout title="Bootcamps">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{bootcamps.length} bootcamp(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="space-y-4">
          {bootcamps.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  {item.featured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" />Mis en avant</Badge>}
                  <Badge variant={item.published ? "default" : "outline"}>
                    {item.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {item.price && <span>💰 {item.price}</span>}
                  {item.duration && <span>⏱ {item.duration}</span>}
                  {item.next_session && <span>📅 {item.next_session}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => togglePublished(item)} title={item.published ? "Dépublier" : "Publier"}>
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
                <Label>Durée</Label>
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
                <Label>Prérequis</Label>
                <Input value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prochaine session</Label>
              <Input value={form.next_session} onChange={e => setForm({...form, next_session: e.target.value})} placeholder="20 - 24 Janvier 2026" />
            </div>
            <div className="space-y-2">
              <Label>Bénéfices (1 par ligne)</Label>
              <Textarea value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} rows={4} placeholder={"Tableaux de bord financiers\nAutomatisation des reportings"} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm">Mis en avant</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm">Publié</span>
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
