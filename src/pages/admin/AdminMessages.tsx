import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {   } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Mail, Phone, Building, Archive, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ContactMessage, ContactMessageStatus } from "@/types";
import {useContactMessages, useUpdateMessageStatus} from "@/hooks/useContacts.ts";

const statusConfig: Record<ContactMessageStatus, { label: string; color: string }> = {
  unread: { label: "Non lu", color: "bg-red-100 text-red-800 border-red-200" },
  read: { label: "Lu", color: "bg-gray-100 text-gray-800 border-gray-200" },
  replied: { label: "Répondu", color: "bg-green-100 text-green-800 border-green-200" },
  archived: { label: "Archivé", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

const AdminMessages = () => {
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: messages = [], isLoading } = useContactMessages();
  const updateStatus = useUpdateMessageStatus();

  const filteredMessages = useMemo(() => {
    if (filterStatus === "all") return messages;
    return messages.filter(m => m.status === filterStatus);
  }, [messages, filterStatus]);

  const handleOpenMessage = (item: ContactMessage) => {
    setSelected(item);
    setNotes(item.notes || "");
    if (item.status === "unread") {
      updateStatus.mutate({ id: item.id, status: "read" });
    }
  };

  return (
      <AdminLayout title="Messages de contact">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {["all", "unread", "read", "replied", "archived"].map(s => (
                <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                >
                  {s === "all" ? "Tous" : statusConfig[s as ContactMessageStatus]?.label}
                </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{filteredMessages.length} message(s)</span>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
            <div className="space-y-3">
              {filteredMessages.map((item) => (
                  <div
                      key={item.id}
                      className={`bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors ${
                          item.status === "unread" ? "border-primary/40 bg-primary/2" : "border-border"
                      }`}
                      onClick={() => handleOpenMessage(item)}
                  >
                    <div className="flex items-start gap-3">
                      {item.status === "unread" && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold">{item.firstName} {item.lastName}</span>
                          <Badge variant="outline" className={statusConfig[item.status].color}>
                            {statusConfig[item.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.email} {item.company && `• ${item.company}`}</p>
                        <p className="text-sm font-medium mt-1">{item.subject}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(item.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}</p>
                      </div>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Message Dialog - Identique mais avec camelCase (firstName, email, etc.) */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message de {selected?.firstName} {selected?.lastName}</DialogTitle>
            </DialogHeader>
            {selected && (
                <div className="space-y-5 mt-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
                    {selected.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>{selected.phone}</span></div>}
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-sm whitespace-pre-wrap">{selected.message}</div>

                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select
                        value={selected.status}
                        onValueChange={(v: ContactMessageStatus) => updateStatus.mutate({ id: selected.id, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusConfig).map(status => (
                            <SelectItem key={status} value={status}>{statusConfig[status as ContactMessageStatus].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setSelected(null)} className="w-full">Fermer</Button>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
  );
};

export default AdminMessages;
