import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBootcampService } from "@/services/Adminbootcampservice";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Loader2,
  BookOpen, Calendar, CalendarDays, Save, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Bootcamp, CreateBootcampPayload } from "@/types/bootcamp.type";

const CATEGORIES = [
  { value: "bi", label: "Business Intelligence / Power BI" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL & Bases de données" },
  { value: "data", label: "Data Analytics" },
  { value: "ai", label: "Intelligence Artificielle" },
];

const CATEGORY_LABELS: Record<string, string> = {
  bi: "Business Intelligence", python: "Python", sql: "SQL",
  data: "Data Analytics", ai: "Intelligence Artificielle",
};

const ICONS = ["BarChart3", "Database", "Code2", "Brain", "TrendingUp", "PieChart", "Table", "Cpu"];

type FormState = {
  title: string; description: string; duration: string; audience: string;
  prerequisites: string; price: string; benefits: string[]; category: string;
  tag: string; iconName: string; featured: boolean; published: boolean; displayOrder: number;
};

const defaultForm: FormState = {
  title: "", description: "", duration: "", audience: "", prerequisites: "",
  price: "", benefits: [], category: "data", tag: "", iconName: "BarChart3",
  featured: false, published: true, displayOrder: 0,
};

function bootcampToForm(b: Bootcamp): FormState {
  return {
    title: b.title ?? "", description: b.description ?? "", duration: b.duration ?? "",
    audience: b.audience ?? "", prerequisites: b.prerequisites ?? "", price: b.price ?? "",
    benefits: b.benefits ?? [], category: b.category ?? "data", tag: b.tag ?? "",
    iconName: b.iconName ?? "BarChart3", featured: b.featured ?? false,
    published: b.published ?? true, displayOrder: b.displayOrder ?? 0,
  };
}

export default function AdminBootcamps() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBootcamp, setEditingBootcamp] = useState<Bootcamp | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [newBenefit, setNewBenefit] = useState("");

  const { data: bootcamps, isLoading } = useQuery({
    queryKey: ["admin", "bootcamps"],
    queryFn: adminBootcampService.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "bootcamps"] });

  const saveMutation = useMutation({
    mutationFn: (payload: CreateBootcampPayload) =>
        editingBootcamp
            ? adminBootcampService.update(editingBootcamp.id, payload)
            : adminBootcampService.create(payload),
    onSuccess: (saved) => {
      invalidate();
      toast({ title: editingBootcamp ? "Bootcamp mis à jour" : "Bootcamp créé", description: saved.title });
      closeDialog();
    },
    onError: () => toast({ title: "Erreur", description: "Sauvegarde impossible", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminBootcampService.togglePublished(id),
    onSuccess: invalidate,
    onError: () => toast({ title: "Erreur", description: "Action impossible", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminBootcampService.delete(id),
    onSuccess: () => { invalidate(); toast({ title: "Bootcamp supprimé" }); },
    onError: () => toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" }),
  });

  const openCreate = () => {
    setEditingBootcamp(null);
    setForm(defaultForm);
    setNewBenefit("");
    setDialogOpen(true);
  };

  const openEdit = (bootcamp: Bootcamp) => {
    setEditingBootcamp(bootcamp);
    setForm(bootcampToForm(bootcamp));
    setNewBenefit("");
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditingBootcamp(null); };

  const set = (field: keyof FormState, value: unknown) =>
      setForm((prev) => ({ ...prev, [field]: value }));

  const addBenefit = () => {
    const val = newBenefit.trim();
    if (!val || form.benefits.includes(val)) return;
    set("benefits", [...form.benefits, val]);
    setNewBenefit("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Le titre est obligatoire", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ ...form, tag: form.tag.trim() || undefined, displayOrder: Number(form.displayOrder) || 0 });
  };

  return (
      <AdminLayout title="Bootcamps">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {bootcamps?.length ?? 0} programme{(bootcamps?.length ?? 0) > 1 ? "s" : ""} au total
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nouveau bootcamp
          </Button>
        </div>

        {/* Liste */}
        {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : !bootcamps?.length ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">Aucun bootcamp</p>
              <p className="text-muted-foreground text-sm mb-6">Créez votre premier programme de formation.</p>
              <Button variant="outline" onClick={openCreate}>
                <Plus className="h-4 w-4" />Créer un bootcamp
              </Button>
            </div>
        ) : (
            <div className="space-y-3">
              {bootcamps.map((bootcamp) => (
                  <div key={bootcamp.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-foreground truncate">{bootcamp.title}</p>
                        {bootcamp.tag && <Badge variant="secondary" className="text-xs">{bootcamp.tag}</Badge>}
                        <Badge variant={bootcamp.published ? "default" : "outline"} className="text-xs">
                          {bootcamp.published ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {bootcamp.category && <span>{CATEGORY_LABELS[bootcamp.category] ?? bootcamp.category}</span>}
                        {bootcamp.duration && (
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{bootcamp.duration}</span>
                        )}
                        {bootcamp.price && <span className="font-medium text-foreground">{bootcamp.price}</span>}
                        {bootcamp.nextSession && (
                            <span className="flex items-center gap-1 text-primary">
                      <CalendarDays className="h-3 w-3" />
                              {bootcamp.nextSession.sessionName ?? "Session planifiée"}
                    </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                          variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1"
                          onClick={() => navigate(`/admin/bootcamp-sessions?bootcamp=${bootcamp.id}`)}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />Sessions
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                              title={bootcamp.published ? "Dépublier" : "Publier"}
                              onClick={() => toggleMutation.mutate(bootcamp.id)}
                              disabled={toggleMutation.isPending}
                      >
                        {bootcamp.published
                            ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                            : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(bootcamp)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10"
                              onClick={() => { if (confirm(`Supprimer "${bootcamp.title}" ?`)) deleteMutation.mutate(bootcamp.id); }}
                              disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Dialog Créer / Éditer */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBootcamp ? "Modifier le bootcamp" : "Nouveau bootcamp"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 pt-2">

              {/* Informations principales */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Informations principales</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input id="title" placeholder="ex: Bootcamp Power BI — De Zéro à Expert"
                         value={form.title} onChange={(e) => set("title", e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Décrivez le programme en quelques phrases..."
                            value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={form.category} onValueChange={(v) => set("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Icône</Label>
                    <Select value={form.iconName} onValueChange={(v) => set("iconName", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ICONS.map((icon) => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée</Label>
                    <Input id="duration" placeholder="ex: 10 semaines"
                           value={form.duration} onChange={(e) => set("duration", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix affiché</Label>
                    <Input id="price" placeholder="ex: 450 000 FCFA"
                           value={form.price} onChange={(e) => set("price", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tag">Badge / Tag (optionnel)</Label>
                  <Input id="tag" placeholder="ex: Bestseller, Nouveau, Places limitées"
                         value={form.tag} onChange={(e) => set("tag", e.target.value)} maxLength={40} />
                </div>
              </section>

              {/* Public & Prérequis */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Public & Prérequis</h3>
                <div className="space-y-2">
                  <Label htmlFor="audience">Public cible</Label>
                  <Textarea id="audience" placeholder="ex: Professionnels en reconversion, Étudiants bac+2..."
                            value={form.audience} onChange={(e) => set("audience", e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prérequis</Label>
                  <Textarea id="prerequisites" placeholder="ex: Aucun prérequis technique requis"
                            value={form.prerequisites} onChange={(e) => set("prerequisites", e.target.value)} rows={2} />
                </div>
              </section>

              {/* Compétences */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Compétences acquises</h3>
                <p className="text-xs text-muted-foreground">Points listés dans "Ce que vous apprendrez" sur la card.</p>
                <div className="flex gap-2">
                  <Input placeholder="ex: Maîtriser Power BI Desktop" value={newBenefit}
                         onChange={(e) => setNewBenefit(e.target.value)}
                         onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }} />
                  <Button type="button" variant="outline" size="icon" onClick={addBenefit}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.benefits.map((benefit) => (
                          <Badge key={benefit} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5">
                            {benefit}
                            <button type="button" onClick={() => set("benefits", form.benefits.filter((b) => b !== benefit))}
                                    className="ml-1 hover:text-destructive transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                      ))}
                    </div>
                )}
              </section>

              {/* Publication */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Options de publication</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Publié</p>
                      <p className="text-xs text-muted-foreground">Visible sur le site</p>
                    </div>
                    <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Mis en avant</p>
                      <p className="text-xs text-muted-foreground">Fond dégradé sur la card</p>
                    </div>
                    <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="displayOrder" className="whitespace-nowrap">Ordre d'affichage</Label>
                  <Input id="displayOrder" type="number" min={0} value={form.displayOrder}
                         onChange={(e) => set("displayOrder", parseInt(e.target.value) || 0)} className="w-24" />
                  <p className="text-xs text-muted-foreground">0 = premier affiché</p>
                </div>
              </section>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingBootcamp ? "Enregistrer" : "Créer le bootcamp"}
                </Button>
                <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
  );
}
