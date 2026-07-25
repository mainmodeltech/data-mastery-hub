import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBootcampService } from "@/services/Adminbootcampservice";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Loader2,
  BookOpen, Calendar, CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_LABELS: Record<string, string> = {
  bi: "Business Intelligence", python: "Python", sql: "SQL",
  "excel-finance": "Excel Financiers", data: "Data Analytics", ai: "Intelligence Artificielle",
};

// La création/édition complète (contenu configurable, programme, sessions) se
// fait sur la page dédiée BootcampForm.tsx (/admin/bootcamps/new et /:id/edit)
// — cette liste ne fait plus que lister + publier/dépublier/supprimer, pour
// éviter d'avoir deux formulaires différents qui divergent dans le temps.
export default function AdminBootcamps() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: bootcamps, isLoading } = useQuery({
    queryKey: ["admin", "bootcamps"],
    queryFn: adminBootcampService.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "bootcamps"] });

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

  return (
      <AdminLayout title="Bootcamps">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {bootcamps?.length ?? 0} programme{(bootcamps?.length ?? 0) > 1 ? "s" : ""} au total
          </p>
          <Button onClick={() => navigate("/admin/bootcamps/new")}>
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
              <Button variant="outline" onClick={() => navigate("/admin/bootcamps/new")}>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/bootcamps/${bootcamp.id}/edit`)}>
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
      </AdminLayout>
  );
}
