import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, Mail, Phone, Building, Archive } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  unread: { label: "Non lu", color: "bg-red-100 text-red-800 border-red-200" },
  read: { label: "Lu", color: "bg-gray-100 text-gray-800 border-gray-200" },
  replied: { label: "Répondu", color: "bg-green-100 text-green-800 border-green-200" },
  archived: { label: "Archivé", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

const AdminMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetch = async () => {
    let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data } = await query;
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [filterStatus]);

  const openMessage = async (item: ContactMessage) => {
    setSelected(item);
    setNotes(item.notes || "");
    if (item.status === "unread") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", item.id);
      fetch();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
    toast({ title: "Statut mis à jour" });
    fetch();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    await supabase.from("contact_messages").update({ notes }).eq("id", selected.id);
    toast({ title: "Notes sauvegardées" });
  };

  return (
    <AdminLayout title="Messages de contact">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {["all", "unread", "read", "replied", "archived"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
            >
              {s === "all" ? "Tous" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{messages.length} message(s)</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {messages.map((item) => {
            const sc = statusConfig[item.status] || statusConfig.unread;
            return (
              <div
                key={item.id}
                className={`bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors ${item.status === "unread" ? "border-primary/40 bg-primary/2" : "border-border"}`}
                onClick={() => openMessage(item)}
              >
                <div className="flex items-start gap-3">
                  {item.status === "unread" && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-foreground">{item.first_name} {item.last_name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.email} {item.company && `• ${item.company}`}</p>
                    {item.subject && <p className="text-sm font-medium text-foreground mt-1">{item.subject}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{item.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{format(new Date(item.created_at), "d MMM yyyy à HH:mm", { locale: fr })}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openMessage(item); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">Aucun message.</div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message de {selected?.first_name} {selected?.last_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
                {selected.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>{selected.phone}</span></div>}
                {selected.company && <div className="flex items-center gap-2"><Building className="h-4 w-4 text-primary" /><span>{selected.company}</span></div>}
              </div>

              {selected.subject && (
                <div><p className="text-sm text-muted-foreground mb-1">Objet</p>
                  <p className="font-medium">{selected.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-muted rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</div>
              </div>

              <div className="space-y-2">
                <Label>Notes internes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Ajouter des notes..." />
                <Button size="sm" variant="outline" onClick={saveNotes}>Sauvegarder les notes</Button>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Non lu</SelectItem>
                    <SelectItem value="read">Lu</SelectItem>
                    <SelectItem value="replied">Répondu</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Votre demande"}`}>
                    <Mail className="h-4 w-4 mr-2" />Répondre par email
                  </a>
                </Button>
                <Button variant="outline" onClick={() => updateStatus(selected.id, "archived")}>
                  <Archive className="h-4 w-4 mr-2" />Archiver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages;
