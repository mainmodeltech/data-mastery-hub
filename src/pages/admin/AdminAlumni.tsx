import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Linkedin, GraduationCap } from "lucide-react";

interface Alumni {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  current_position: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  cohort: string | null;
  year: number | null;
  bootcamp_id: string | null;
  registration_id: string | null;
  published: boolean | null;
  display_order: number | null;
}

interface Bootcamp {
  id: string;
  title: string;
}

const emptyForm = {
  name: "", email: "", phone: "", current_title: "", current_position: "",
  linkedin_url: "", photo_url: "", cohort: "", year: new Date().getFullYear(),
  bootcamp_id: "", registration_id: "", published: true, display_order: 0,
};

const AdminAlumni = () => {
  const { toast } = useToast();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Alumni | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [{ data: alumniData }, { data: bootcampsData }] = await Promise.all([
      supabase.from("alumni").select("*").order("display_order"),
      supabase.from("bootcamps").select("id, title").order("title"),
    ]);
    setAlumni(alumniData || []);
    setBootcamps(bootcampsData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Alumni) => {
    setEditItem(item);
    setForm({
      name: item.name, email: item.email || "", phone: item.phone || "",
      current_title: item.current_title || "", current_position: item.current_position || "",
      linkedin_url: item.linkedin_url || "", photo_url: item.photo_url || "",
      cohort: item.cohort || "", year: item.year || new Date().getFullYear(),
      bootcamp_id: item.bootcamp_id || "", registration_id: item.registration_id || "",
      published: item.published ?? true, display_order: item.display_order || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Le nom est requis", variant: "destructive" }); return; }
    setSaving(true);

    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      current_title: form.current_title || null,
      current_position: form.current_position || null,
      linkedin_url: form.linkedin_url || null,
      photo_url: form.photo_url || null,
      cohort: form.cohort || null,
      year: form.year || null,
      bootcamp_id: form.bootcamp_id || null,
      published: form.published,
      display_order: form.display_order,
    };

    if (editItem) {
      await supabase.from("alumni").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("alumni").insert(payload);
    }

    toast({ title: editItem ? "Alumni mis à jour" : "Alumni créé" });
    setDialogOpen(false);
    fetchData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet alumni ?")) return;
    await supabase.from("alumni").delete().eq("id", id);
    toast({ title: "Supprimé" });
    fetchData();
  };

  const togglePublished = async (item: Alumni) => {
    await supabase.from("alumni").update({ published: !item.published }).eq("id", item.id);
    fetchData();
  };

  return (
    <AdminLayout title="Alumni">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{alumni.length} alumni</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter un alumni</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="space-y-3">
          {alumni.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-foreground">{item.name}</span>
                  {item.cohort && <Badge variant="secondary">{item.cohort}</Badge>}
                  <Badge variant={item.published ? "default" : "outline"}>{item.published ? "Publié" : "Brouillon"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[item.current_position, item.current_title].filter(Boolean).join(" • ") || "Aucun poste renseigné"}
                </p>
                {item.linkedin_url && (
                  <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => togglePublished(item)}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {alumni.length === 0 && <div className="text-center py-16 text-muted-foreground">Aucun alumni enregistré.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Modifier l'alumni" : "Nouvel alumni"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>Nom complet *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Titre actuel</Label><Input value={form.current_title} onChange={e => setForm({...form, current_title: e.target.value})} placeholder="Ex: Data Analyst" /></div>
              <div className="space-y-2"><Label>Poste actuel</Label><Input value={form.current_position} onChange={e => setForm({...form, current_position: e.target.value})} placeholder="Ex: Analyste Junior" /></div>
            </div>
            <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={form.linkedin_url} onChange={e => setForm({...form, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." /></div>
            <div className="space-y-2"><Label>Photo (URL)</Label><Input value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cohorte</Label><Input value={form.cohort} onChange={e => setForm({...form, cohort: e.target.value})} placeholder="Cohorte 2024" /></div>
              <div className="space-y-2"><Label>Année</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} /></div>
            </div>
            {bootcamps.length > 0 && (
              <div className="space-y-2">
                <Label>Bootcamp complété</Label>
                <Select value={form.bootcamp_id} onValueChange={v => setForm({...form, bootcamp_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un bootcamp" /></SelectTrigger>
                  <SelectContent>
                    {bootcamps.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
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

export default AdminAlumni;
