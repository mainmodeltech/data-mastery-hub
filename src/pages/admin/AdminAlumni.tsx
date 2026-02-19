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
import { Plus, Edit, Trash2, Eye, EyeOff, Users, ChevronDown, ChevronUp } from "lucide-react";

interface AlumniGroup {
  id: string;
  cohort: string;
  year: number;
  project_title: string;
  project_description: string | null;
  project_link: string | null;
  group_photo_url: string | null;
  testimonial: string | null;
  published: boolean | null;
  display_order: number | null;
}

interface Member {
  id?: string;
  name: string;
  position: string;
  linkedin_url: string;
  email: string;
  phone: string;
}

interface WorkPhoto {
  id?: string;
  photo_url: string;
  caption: string;
}

const emptyForm = { cohort: "", year: new Date().getFullYear(), project_title: "", project_description: "", project_link: "", group_photo_url: "", testimonial: "", published: true, display_order: 0 };
const emptyMember: Member = { name: "", position: "", linkedin_url: "", email: "", phone: "" };

const AdminAlumni = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<AlumniGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<AlumniGroup | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [members, setMembers] = useState<Member[]>([{ ...emptyMember }]);
  const [workPhotos, setWorkPhotos] = useState<WorkPhoto[]>([{ photo_url: "", caption: "" }]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<Record<string, any[]>>({});

  const fetch = async () => {
    const { data } = await supabase.from("alumni_groups").select("*").order("year", { ascending: false });
    setGroups(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const fetchGroupDetails = async (groupId: string) => {
    const [{ data: members }, { data: photos }] = await Promise.all([
      supabase.from("alumni_members").select("*").eq("group_id", groupId).order("display_order"),
      supabase.from("alumni_work_photos").select("*").eq("group_id", groupId).order("display_order"),
    ]);
    setGroupMembers(prev => ({ ...prev, [groupId]: members || [] }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => {
      if (prev !== id) fetchGroupDetails(id);
      return prev === id ? null : id;
    });
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setMembers([{ ...emptyMember }]);
    setWorkPhotos([{ photo_url: "", caption: "" }]);
    setDialogOpen(true);
  };

  const openEdit = (item: AlumniGroup) => {
    setEditItem(item);
    setForm({ cohort: item.cohort, year: item.year, project_title: item.project_title, project_description: item.project_description || "", project_link: item.project_link || "", group_photo_url: item.group_photo_url || "", testimonial: item.testimonial || "", published: item.published ?? true, display_order: item.display_order || 0 });
    setMembers([{ ...emptyMember }]);
    setWorkPhotos([{ photo_url: "", caption: "" }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.project_title.trim() || !form.cohort.trim()) { toast({ title: "Titre et cohorte requis", variant: "destructive" }); return; }
    setSaving(true);

    const payload = { cohort: form.cohort, year: form.year, project_title: form.project_title, project_description: form.project_description || null, project_link: form.project_link || null, group_photo_url: form.group_photo_url || null, testimonial: form.testimonial || null, published: form.published, display_order: form.display_order };

    let groupId = editItem?.id;
    if (editItem) {
      await supabase.from("alumni_groups").update(payload).eq("id", editItem.id);
    } else {
      const { data } = await supabase.from("alumni_groups").insert(payload).select().single();
      groupId = data?.id;
    }

    if (groupId) {
      // Save members
      const validMembers = members.filter(m => m.name.trim());
      if (validMembers.length > 0) {
        if (editItem) await supabase.from("alumni_members").delete().eq("group_id", groupId);
        await supabase.from("alumni_members").insert(validMembers.map((m, i) => ({ group_id: groupId!, name: m.name, position: m.position || null, linkedin_url: m.linkedin_url || null, email: m.email || null, phone: m.phone || null, display_order: i })));
      }

      // Save work photos
      const validPhotos = workPhotos.filter(p => p.photo_url.trim());
      if (validPhotos.length > 0) {
        if (editItem) await supabase.from("alumni_work_photos").delete().eq("group_id", groupId);
        await supabase.from("alumni_work_photos").insert(validPhotos.map((p, i) => ({ group_id: groupId!, photo_url: p.photo_url, caption: p.caption || null, display_order: i })));
      }
    }

    toast({ title: editItem ? "Groupe mis à jour" : "Groupe créé" });
    setDialogOpen(false);
    fetch();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce groupe alumni ?")) return;
    await supabase.from("alumni_groups").delete().eq("id", id);
    toast({ title: "Supprimé" });
    fetch();
  };

  const togglePublished = async (item: AlumniGroup) => {
    await supabase.from("alumni_groups").update({ published: !item.published }).eq("id", item.id);
    fetch();
  };

  const addMember = () => setMembers(prev => [...prev, { ...emptyMember }]);
  const removeMember = (i: number) => setMembers(prev => prev.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: keyof Member, value: string) => setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const addPhoto = () => setWorkPhotos(prev => [...prev, { photo_url: "", caption: "" }]);
  const removePhoto = (i: number) => setWorkPhotos(prev => prev.filter((_, idx) => idx !== i));
  const updatePhoto = (i: number, field: keyof WorkPhoto, value: string) => setWorkPhotos(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  return (
    <AdminLayout title="Alumni">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{groups.length} groupe(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter un groupe</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="space-y-4">
          {groups.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{item.project_title}</span>
                    <Badge variant="secondary">{item.cohort}</Badge>
                    <Badge variant={item.published ? "default" : "outline"}>{item.published ? "Publié" : "Brouillon"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.project_description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleExpand(item.id)} title="Voir les détails">
                    {expandedId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => togglePublished(item)}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {expandedId === item.id && groupMembers[item.id] && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="h-3 w-3" />Membres</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {groupMembers[item.id].map((m: any) => (
                      <div key={m.id} className="bg-muted rounded-lg p-3 text-sm">
                        <p className="font-medium text-foreground">{m.name}</p>
                        <p className="text-muted-foreground">{m.position}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {groups.length === 0 && <div className="text-center py-16 text-muted-foreground">Aucun groupe alumni.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Modifier le groupe" : "Nouveau groupe alumni"}</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cohorte *</Label><Input value={form.cohort} onChange={e => setForm({...form, cohort: e.target.value})} placeholder="Cohorte 2024" /></div>
              <div className="space-y-2"><Label>Année</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><Label>Titre du projet *</Label><Input value={form.project_title} onChange={e => setForm({...form, project_title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description du projet</Label><Textarea value={form.project_description} onChange={e => setForm({...form, project_description: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Lien du projet</Label><Input value={form.project_link} onChange={e => setForm({...form, project_link: e.target.value})} placeholder="https://" /></div>
              <div className="space-y-2"><Label>Photo de groupe (URL)</Label><Input value={form.group_photo_url} onChange={e => setForm({...form, group_photo_url: e.target.value})} placeholder="https://..." /></div>
            </div>
            <div className="space-y-2"><Label>Témoignage</Label><Textarea value={form.testimonial} onChange={e => setForm({...form, testimonial: e.target.value})} rows={3} /></div>

            {/* Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Membres du groupe</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMember}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
              </div>
              {members.map((m, i) => (
                <div key={i} className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Membre {i + 1}</span>
                    {members.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)} className="h-6 w-6"><Trash2 className="h-3 w-3" /></Button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Nom *" value={m.name} onChange={e => updateMember(i, "name", e.target.value)} />
                    <Input placeholder="Poste actuel" value={m.position} onChange={e => updateMember(i, "position", e.target.value)} />
                    <Input placeholder="Email" value={m.email} onChange={e => updateMember(i, "email", e.target.value)} />
                    <Input placeholder="Téléphone" value={m.phone} onChange={e => updateMember(i, "phone", e.target.value)} />
                    <Input placeholder="LinkedIn URL" value={m.linkedin_url} onChange={e => updateMember(i, "linkedin_url", e.target.value)} className="col-span-2" />
                  </div>
                </div>
              ))}
            </div>

            {/* Work Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Photos de travaux (URLs)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPhoto}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
              </div>
              {workPhotos.map((p, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input placeholder="URL de l'image *" value={p.photo_url} onChange={e => updatePhoto(i, "photo_url", e.target.value)} className="col-span-2" />
                    <Input placeholder="Légende (optionnel)" value={p.caption} onChange={e => updatePhoto(i, "caption", e.target.value)} className="col-span-2" />
                  </div>
                  {workPhotos.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removePhoto(i)} className="mt-1"><Trash2 className="h-4 w-4" /></Button>}
                </div>
              ))}
            </div>

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
