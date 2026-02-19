import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Reference {
  id: string;
  name: string;
  full_name: string | null;
  category: string;
  sector: string | null;
  logo_text: string | null;
  description: string | null;
  display_order: number | null;
  published: boolean | null;
}

const emptyForm = { name: "", full_name: "", category: "client", sector: "", logo_text: "", description: "", display_order: 0, published: true };

const categoryLabels: Record<string, string> = { client: "Entreprise cliente", school: "École partenaire", partner: "Partenaire technologique" };

const AdminReferences = () => {
  const { toast } = useToast();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Reference | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const fetch = async () => {
    let query = supabase.from("references").select("*").order("display_order");
    if (filterCategory !== "all") query = query.eq("category", filterCategory);
    const { data } = await query;
    setReferences(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [filterCategory]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (item: Reference) => {
    setEditItem(item);
    setForm({ name: item.name, full_name: item.full_name || "", category: item.category, sector: item.sector || "", logo_text: item.logo_text || "", description: item.description || "", display_order: item.display_order || 0, published: item.published ?? true });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Le nom est requis", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { name: form.name, full_name: form.full_name || null, category: form.category, sector: form.sector || null, logo_text: form.logo_text || null, description: form.description || null, display_order: form.display_order, published: form.published };
    const { error } = editItem ? await supabase.from("references").update(payload).eq("id", editItem.id) : await supabase.from("references").insert(payload);
    if (error) { toast({ title: "Erreur", variant: "destructive" }); } else { toast({ title: "Sauvegardé" }); setDialogOpen(false); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("references").delete().eq("id", id);
    toast({ title: "Supprimé" });
    fetch();
  };

  const togglePublished = async (item: Reference) => {
    await supabase.from("references").update({ published: !item.published }).eq("id", item.id);
    fetch();
  };

  return (
    <AdminLayout title="Références & Partenaires">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {["all", "client", "school", "partner"].map(c => (
            <button key={c} onClick={() => setFilterCategory(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterCategory === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}>
              {c === "all" ? "Tous" : categoryLabels[c]}
            </button>
          ))}
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="space-y-3">
          {references.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-sm text-foreground">{item.logo_text || item.name.slice(0, 3).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <Badge variant="secondary">{categoryLabels[item.category]}</Badge>
                  <Badge variant={item.published ? "default" : "outline"}>{item.published ? "Publié" : "Brouillon"}</Badge>
                </div>
                {item.full_name && <p className="text-sm text-muted-foreground">{item.full_name}</p>}
                {item.sector && <p className="text-xs text-muted-foreground">{item.sector}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => togglePublished(item)}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {references.length === 0 && <div className="text-center py-16 text-muted-foreground">Aucune référence.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Modifier" : "Nouvelle référence"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Entreprise cliente</SelectItem>
                  <SelectItem value="school">École partenaire</SelectItem>
                  <SelectItem value="partner">Partenaire technologique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Sigle (logo)</Label><Input value={form.logo_text} onChange={e => setForm({...form, logo_text: e.target.value})} placeholder="BOA" /></div>
            </div>
            <div className="space-y-2"><Label>Nom complet</Label><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Secteur</Label><Input value={form.sector} onChange={e => setForm({...form, sector: e.target.value})} placeholder="Banque, Assurance..." /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
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

export default AdminReferences;
