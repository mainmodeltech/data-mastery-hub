import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, Check, X, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Registration {
  id: string;
  bootcamp_title: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  position: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: "Confirmé", color: "bg-green-100 text-green-800 border-green-200", icon: <Check className="h-3 w-3" /> },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-800 border-red-200", icon: <X className="h-3 w-3" /> },
  waitlist: { label: "Liste d'attente", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <AlertCircle className="h-3 w-3" /> },
};

const AdminInscriptions = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetch = async () => {
    let query = supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data } = await query;
    setRegistrations(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("registrations").update({ status }).eq("id", id);
    toast({ title: "Statut mis à jour" });
    fetch();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  return (
    <AdminLayout title="Inscriptions">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "waitlist", "cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
            >
              {s === "all" ? "Tous" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{registrations.length} résultat(s)</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {registrations.map((item) => {
            const sc = statusConfig[item.status] || statusConfig.pending;
            return (
              <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground">{item.first_name} {item.last_name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.email} {item.phone && `• ${item.phone}`}</p>
                  {item.company && <p className="text-sm text-muted-foreground">{item.company} {item.position && `• ${item.position}`}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    📚 {item.bootcamp_title || "—"} • {format(new Date(item.created_at), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v)}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="waitlist">Liste d'attente</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
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
            <DialogTitle>Détail de l'inscription</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Nom</p><p className="font-medium">{selected.first_name} {selected.last_name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-muted-foreground">Téléphone</p><p className="font-medium">{selected.phone || "—"}</p></div>
                <div><p className="text-muted-foreground">Entreprise</p><p className="font-medium">{selected.company || "—"}</p></div>
                <div><p className="text-muted-foreground">Poste</p><p className="font-medium">{selected.position || "—"}</p></div>
                <div><p className="text-muted-foreground">Bootcamp</p><p className="font-medium">{selected.bootcamp_title || "—"}</p></div>
              </div>
              {selected.message && (
                <div><p className="text-muted-foreground text-sm mb-1">Message</p>
                  <p className="text-sm bg-muted rounded-lg p-3">{selected.message}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Changer le statut</Label>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="waitlist">Liste d'attente</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
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
