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
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Users, Image, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  tools_technologies: string[] | null;
  access_link: string | null;
  cover_image_url: string | null;
  cohort: string | null;
  year: number | null;
  bootcamp_id: string | null;
  published: boolean | null;
  display_order: number | null;
}

interface Alumni {
  id: string;
  name: string;
  current_position: string | null;
}

interface Bootcamp {
  id: string;
  title: string;
}

interface Screenshot {
  id?: string;
  photo_url: string;
  caption: string;
}

const emptyForm = {
  title: "", description: "", tools_technologies: "", access_link: "",
  cover_image_url: "", cohort: "", year: new Date().getFullYear(),
  bootcamp_id: "", published: true, display_order: 0,
};

const AdminProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allAlumni, setAllAlumni] = useState<Alumni[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedAlumniIds, setSelectedAlumniIds] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([{ photo_url: "", caption: "" }]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<Record<string, { members: any[]; screenshots: any[] }>>({});

  const fetchData = async () => {
    const [{ data: projectsData }, { data: alumniData }, { data: bootcampsData }] = await Promise.all([
      supabase.from("projects").select("*").order("year", { ascending: false }),
      supabase.from("alumni").select("id, name, current_position").order("name"),
      supabase.from("bootcamps").select("id, title").order("title"),
    ]);
    setProjects(projectsData || []);
    setAllAlumni(alumniData || []);
    setBootcamps(bootcampsData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const fetchProjectDetails = async (projectId: string) => {
    const [{ data: members }, { data: shots }] = await Promise.all([
      supabase.from("project_members").select("*, alumni:alumni_id(id, name, current_position, linkedin_url)").eq("project_id", projectId).order("display_order"),
      supabase.from("project_screenshots").select("*").eq("project_id", projectId).order("display_order"),
    ]);
    setProjectDetails(prev => ({ ...prev, [projectId]: { members: members || [], screenshots: shots || [] } }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => {
      if (prev !== id) fetchProjectDetails(id);
      return prev === id ? null : id;
    });
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setSelectedAlumniIds([]);
    setScreenshots([{ photo_url: "", caption: "" }]);
    setDialogOpen(true);
  };

  const openEdit = async (item: Project) => {
    setEditItem(item);
    setForm({
      title: item.title, description: item.description || "",
      tools_technologies: (item.tools_technologies || []).join(", "),
      access_link: item.access_link || "", cover_image_url: item.cover_image_url || "",
      cohort: item.cohort || "", year: item.year || new Date().getFullYear(),
      bootcamp_id: item.bootcamp_id || "", published: item.published ?? true,
      display_order: item.display_order || 0,
    });
    // Load existing members and screenshots
    const [{ data: members }, { data: shots }] = await Promise.all([
      supabase.from("project_members").select("alumni_id").eq("project_id", item.id),
      supabase.from("project_screenshots").select("photo_url, caption").eq("project_id", item.id).order("display_order"),
    ]);
    setSelectedAlumniIds((members || []).map(m => m.alumni_id));
    setScreenshots(shots && shots.length > 0 ? shots.map(s => ({ photo_url: s.photo_url, caption: s.caption || "" })) : [{ photo_url: "", caption: "" }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Le titre est requis", variant: "destructive" }); return; }
    setSaving(true);

    const tools = form.tools_technologies.split(",").map(t => t.trim()).filter(Boolean);
    const payload = {
      title: form.title, description: form.description || null,
      tools_technologies: tools.length > 0 ? tools : null,
      access_link: form.access_link || null, cover_image_url: form.cover_image_url || null,
      cohort: form.cohort || null, year: form.year || null,
      bootcamp_id: form.bootcamp_id || null, published: form.published,
      display_order: form.display_order,
    };

    let projectId = editItem?.id;
    if (editItem) {
      await supabase.from("projects").update(payload).eq("id", editItem.id);
    } else {
      const { data } = await supabase.from("projects").insert(payload).select().single();
      projectId = data?.id;
    }

    if (projectId) {
      // Save members
      await supabase.from("project_members").delete().eq("project_id", projectId);
      if (selectedAlumniIds.length > 0) {
        await supabase.from("project_members").insert(
          selectedAlumniIds.map((alumniId, i) => ({ project_id: projectId!, alumni_id: alumniId, display_order: i }))
        );
      }

      // Save screenshots
      await supabase.from("project_screenshots").delete().eq("project_id", projectId);
      const validShots = screenshots.filter(s => s.photo_url.trim());
      if (validShots.length > 0) {
        await supabase.from("project_screenshots").insert(
          validShots.map((s, i) => ({ project_id: projectId!, photo_url: s.photo_url, caption: s.caption || null, display_order: i }))
        );
      }
    }

    toast({ title: editItem ? "Projet mis à jour" : "Projet créé" });
    setDialogOpen(false);
    fetchData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    await supabase.from("projects").delete().eq("id", id);
    toast({ title: "Supprimé" });
    fetchData();
  };

  const togglePublished = async (item: Project) => {
    await supabase.from("projects").update({ published: !item.published }).eq("id", item.id);
    fetchData();
  };

  const toggleAlumni = (id: string) => {
    setSelectedAlumniIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const addScreenshot = () => setScreenshots(prev => [...prev, { photo_url: "", caption: "" }]);
  const removeScreenshot = (i: number) => setScreenshots(prev => prev.filter((_, idx) => idx !== i));
  const updateScreenshot = (i: number, field: keyof Screenshot, value: string) => setScreenshots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  return (
    <AdminLayout title="Projets">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{projects.length} projet(s)</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nouveau projet</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="space-y-4">
          {projects.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 flex items-start gap-4">
                {item.cover_image_url && (
                  <img src={item.cover_image_url} alt={item.title} className="w-16 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    {item.cohort && <Badge variant="secondary">{item.cohort}</Badge>}
                    {item.tools_technologies && item.tools_technologies.slice(0, 3).map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                    <Badge variant={item.published ? "default" : "outline"}>{item.published ? "Publié" : "Brouillon"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleExpand(item.id)}>
                    {expandedId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => togglePublished(item)}>{item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {expandedId === item.id && projectDetails[item.id] && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  {projectDetails[item.id].members.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="h-3 w-3" />Membres ({projectDetails[item.id].members.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {projectDetails[item.id].members.map((m: any) => (
                          <Badge key={m.id} variant="secondary">{m.alumni?.name} {m.alumni?.current_position ? `• ${m.alumni.current_position}` : ""}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {projectDetails[item.id].screenshots.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2"><Image className="h-3 w-3" />Captures ({projectDetails[item.id].screenshots.length})</p>
                      <div className="flex gap-2 overflow-x-auto">
                        {projectDetails[item.id].screenshots.map((s: any) => (
                          <img key={s.id} src={s.photo_url} alt={s.caption || ""} className="h-20 rounded-lg object-cover" />
                        ))}
                      </div>
                    </div>
                  )}
                  {item.access_link && (
                    <a href={item.access_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Voir le projet
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
          {projects.length === 0 && <div className="text-center py-16 text-muted-foreground">Aucun projet. Créez d'abord des alumni, puis ajoutez des projets.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Modifier le projet" : "Nouveau projet"}</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-2"><Label>Titre du projet *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div className="space-y-2"><Label>Outils & Technologies (séparés par des virgules)</Label><Input value={form.tools_technologies} onChange={e => setForm({...form, tools_technologies: e.target.value})} placeholder="Python, Power BI, SQL, Excel" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Lien d'accès</Label><Input value={form.access_link} onChange={e => setForm({...form, access_link: e.target.value})} placeholder="https://" /></div>
              <div className="space-y-2"><Label>Image de couverture (URL)</Label><Input value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} placeholder="https://..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cohorte</Label><Input value={form.cohort} onChange={e => setForm({...form, cohort: e.target.value})} placeholder="Cohorte 2024" /></div>
              <div className="space-y-2"><Label>Année</Label><Input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})} /></div>
            </div>
            {bootcamps.length > 0 && (
              <div className="space-y-2">
                <Label>Bootcamp associé</Label>
                <Select value={form.bootcamp_id} onValueChange={v => setForm({...form, bootcamp_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un bootcamp" /></SelectTrigger>
                  <SelectContent>
                    {bootcamps.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Alumni selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Membres du groupe</Label>
              {allAlumni.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun alumni disponible. Ajoutez d'abord des alumni.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                  {allAlumni.map(a => (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                      <input type="checkbox" checked={selectedAlumniIds.includes(a.id)} onChange={() => toggleAlumni(a.id)} className="w-4 h-4" />
                      <span className="text-sm">{a.name}</span>
                      {a.current_position && <span className="text-xs text-muted-foreground">• {a.current_position}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Screenshots */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Captures d'écran</Label>
                <Button type="button" variant="outline" size="sm" onClick={addScreenshot}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
              </div>
              {screenshots.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input placeholder="URL de l'image *" value={s.photo_url} onChange={e => updateScreenshot(i, "photo_url", e.target.value)} className="col-span-2" />
                    <Input placeholder="Légende (optionnel)" value={s.caption} onChange={e => updateScreenshot(i, "caption", e.target.value)} className="col-span-2" />
                  </div>
                  {screenshots.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeScreenshot(i)} className="mt-1"><Trash2 className="h-4 w-4" /></Button>}
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

export default AdminProjects;
