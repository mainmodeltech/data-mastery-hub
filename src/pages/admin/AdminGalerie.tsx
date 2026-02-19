import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  bootcamp_name: string | null;
  display_order: number | null;
  published: boolean | null;
  created_at: string;
}

const AdminGalerie = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [bootcampName, setBootcampName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("gallery_photos").select("*").order("display_order");
    setPhotos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!url.trim()) { toast({ title: "URL requise", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("gallery_photos").insert({ url, caption: caption || null, bootcamp_name: bootcampName || null, published: true });
    if (error) { toast({ title: "Erreur", variant: "destructive" }); } else { toast({ title: "Photo ajoutée" }); setDialogOpen(false); setUrl(""); setCaption(""); setBootcampName(""); fetch(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette photo ?")) return;
    await supabase.from("gallery_photos").delete().eq("id", id);
    toast({ title: "Photo supprimée" });
    fetch();
  };

  const togglePublished = async (item: GalleryPhoto) => {
    await supabase.from("gallery_photos").update({ published: !item.published }).eq("id", item.id);
    fetch();
  };

  return (
    <AdminLayout title="Galerie Photos">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{photos.length} photo(s)</p>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Ajouter une photo</Button>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">Chargement...</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((item) => (
            <div key={item.id} className="group relative bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-muted">
                <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
              </div>
              <div className="p-3">
                {item.caption && <p className="text-xs font-medium text-foreground line-clamp-1">{item.caption}</p>}
                {item.bootcamp_name && <p className="text-xs text-muted-foreground">{item.bootcamp_name}</p>}
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={item.published ? "default" : "outline"} className="text-xs">{item.published ? "Publié" : "Masqué"}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePublished(item)}>
                      {item.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {photos.length === 0 && <div className="col-span-4 text-center py-16 text-muted-foreground">Aucune photo dans la galerie.</div>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Ajouter une photo</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2"><Label>URL de l'image *</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></div>
            {url && <div className="aspect-video rounded-lg overflow-hidden bg-muted"><img src={url} alt="Aperçu" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} /></div>}
            <div className="space-y-2"><Label>Légende</Label><Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Description de la photo" /></div>
            <div className="space-y-2"><Label>Bootcamp associé</Label><Input value={bootcampName} onChange={e => setBootcampName(e.target.value)} placeholder="Power BI pour la Finance" /></div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} disabled={saving} className="flex-1">{saving ? "Ajout..." : "Ajouter"}</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminGalerie;
