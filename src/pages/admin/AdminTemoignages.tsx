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

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  published: boolean | null;
  display_order: number | null;
}

const emptyForm = { name: "", role: "", company: "", content: "", rating: 5, published: true, display_order: 0 };

const AdminTemoignages = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("display_order");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Testimonial) => {
    setEditItem(item);
    setForm({ name: item.name, role: item.role || "", company: item.company || "", content: item.content, rating: item.rating || 5, published: item.published ?? true, display_order: item.display_order || 0 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) { toast({ title: "Nom et contenu requis", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { name: form.name, role: form.role || null, company: form.company || null, content: form.content, rating: form.rating, published: form.published, display_order: form.display_order };
    const { error } = editItem ? await supabase.from("testimonials").update(payload).eq("id", editItem.id) : await supabase.from("testimonials").insert(payload);
    if (error) { toast({ title: "Erreur", variant: "destructive" }); } else { toast({ title: "Sauvegardé" }); setDialogOpen(false); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Supprimé" });
    fetch();
  };

  const togglePublished = async (item: Testimonial) => {
    await supabase.from("testimonials").update({ published: !item.published }).eq("id", item.id);
    fetch();
  };

  return (
    <AdminLayout title="Témoignages">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{items.length} témoignage(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <div className="flex">{Array.from({length: item.rating || 5}).map((_,i) => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}</div>
                  <Badge variant={item.published ? "default" : "outline"}>{item.published ? "Publié" : "Brouillon"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.role} {item.company && `• ${item.company}`}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 italic">"{item.content}"</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => togglePublished(item)}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-16 text-muted-foreground">Aucun témoignage.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Modifier" : "Nouveau témoignage"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Poste</Label><Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} /></div>
              <div className="space-y-2"><Label>Entreprise</Label><Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Note (1-5)</Label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm({...form, rating: n})} className={`p-1 rounded ${n <= form.rating ? "text-accent" : "text-muted-foreground"}`}>
                    <Star className={`h-6 w-6 ${n <= form.rating ? "fill-accent" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2"><Label>Témoignage *</Label><Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4} /></div>
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

export default AdminTemoignages;
