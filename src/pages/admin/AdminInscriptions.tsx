import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useRegistrations, useUpdateRegistrationStatus } from "@/hooks/useRegistrations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, Check, X, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Registration, RegistrationStatus } from "@/types";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="h-3 w-3" /> },
  CONFIRMED: { label: "Confirme", color: "bg-green-100 text-green-800 border-green-200", icon: <Check className="h-3 w-3" /> },
  CANCELLED: { label: "Annule", color: "bg-red-100 text-red-800 border-red-200", icon: <X className="h-3 w-3" /> },
  COMPLETED: { label: "Termine", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <AlertCircle className="h-3 w-3" /> },
};

// Mapping pour le filtre (cle UI → valeur API)
const STATUS_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "PENDING", label: "En attente" },
  { key: "CONFIRMED", label: "Confirme" },
  { key: "CANCELLED", label: "Annule" },
  { key: "COMPLETED", label: "Termine" },
];

const AdminInscriptions = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [page] = useState(0);

  const statusParam = filterStatus === "all" ? undefined : filterStatus as RegistrationStatus;
  const { data, isLoading } = useRegistrations(page, 50, statusParam);
  const updateStatusMutation = useUpdateRegistrationStatus();

  const registrations = data?.content ?? [];

  const handleUpdateStatus = async (id: string, status: RegistrationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast({ title: "Statut mis a jour" });
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, status } : null);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre a jour le statut.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Inscriptions">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterStatus === key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{registrations.length} resultat(s)</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((item) => {
            const sc = statusConfig[item.status] || statusConfig.PENDING;
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{item.firstName} {item.lastName}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.email} {item.phone && `\u2022 ${item.phone}`}</p>
                  {item.company && <p className="text-sm text-muted-foreground">{item.company} {item.position && `\u2022 ${item.position}`}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.bootcampTitle || "\u2014"} \u2022 {format(new Date(item.createdAt), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Select value={item.status} onValueChange={(v) => handleUpdateStatus(item.id, v as RegistrationStatus)}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="CONFIRMED">Confirme</SelectItem>
                      <SelectItem value="CANCELLED">Annule</SelectItem>
                      <SelectItem value="COMPLETED">Termine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
          {registrations.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">Aucune inscription.</div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail de l'inscription</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Nom</p><p className="font-medium">{selected.firstName} {selected.lastName}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-muted-foreground">Telephone</p><p className="font-medium">{selected.phone || "\u2014"}</p></div>
                <div><p className="text-muted-foreground">Entreprise</p><p className="font-medium">{selected.company || "\u2014"}</p></div>
                <div><p className="text-muted-foreground">Poste</p><p className="font-medium">{selected.position || "\u2014"}</p></div>
                <div><p className="text-muted-foreground">Bootcamp</p><p className="font-medium">{selected.bootcampTitle || "\u2014"}</p></div>
              </div>
              {selected.message && (
                <div><p className="text-muted-foreground text-sm mb-1">Message</p>
                  <p className="text-sm bg-muted rounded-lg p-3">{selected.message}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Changer le statut</Label>
                <Select value={selected.status} onValueChange={(v) => handleUpdateStatus(selected.id, v as RegistrationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirme</SelectItem>
                    <SelectItem value="CANCELLED">Annule</SelectItem>
                    <SelectItem value="COMPLETED">Termine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminInscriptions;
