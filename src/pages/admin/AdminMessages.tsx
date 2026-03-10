import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Mail,
  Phone,
  Archive,
  CheckCheck,
  Trash2,
  Search,
  Loader2,
  MessageSquare,
  MailOpen,
  MailCheck,
  InboxIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ContactMessage, ContactMessageStatus } from "@/types";
import {
  useContactMessages,
  useUpdateContactStatus,
  useDeleteContactMessage,
} from "@/hooks/useContacts";

// ─── Config statuts ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    ContactMessageStatus,
    { label: string; className: string }
> = {
  unread:   { label: "Non lu",  className: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300" },
  read:     { label: "Lu",      className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300" },
  replied:  { label: "Répondu", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" },
  archived: { label: "Archivé", className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300" },
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "all",      label: "Tous" },
  { value: "unread",   label: "Non lus" },
  { value: "read",     label: "Lus" },
  { value: "replied",  label: "Répondus" },
  { value: "archived", label: "Archivés" },
];

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({label,  value,  icon: Icon, accent, }: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
  );
}

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

function MessageDetailDialog({
                               message,
                               onClose,
                               onStatusChange,
                             }: {
  message: ContactMessage | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ContactMessageStatus) => void;
}) {
  if (!message) return null;

  return (
      <Dialog open={!!message} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Message de {message.firstName} {message.lastName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Infos contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${message.email}`} className="text-primary hover:underline truncate">
                  {message.email}
                </a>
              </div>
              {message.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{message.phone}</span>
                  </div>
              )}
              {message.company && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-muted-foreground">Entreprise :</span>
                    <span className="font-medium">{message.company}</span>
                  </div>
              )}
              {message.subject && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-muted-foreground">Sujet :</span>
                    <span className="font-medium">{message.subject}</span>
                  </div>
              )}
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-muted-foreground">Reçu le :</span>
                <span>{format(new Date(message.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}</span>
              </div>
            </div>

            {/* Corps du message */}
            <div className="bg-muted rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed border-l-4 border-primary">
              {message.message}
            </div>

            {/* Changer le statut */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium shrink-0">Statut :</span>
              <Select
                  value={message.status}
                  onValueChange={(v: ContactMessageStatus) =>
                      onStatusChange(message.id, v)
                  }
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-1">
              <a href={`mailto:${message.email}`} className="flex-1">
                <Button className="w-full" variant="default">
                  <Mail className="h-4 w-4 mr-2" />
                  Répondre par email
                </Button>
              </a>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

const AdminMessages = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data, isLoading } = useContactMessages(0, 200);
  const updateStatus = useUpdateContactStatus();
  const deleteMsg   = useDeleteContactMessage();

  const messages = data?.items ?? [];

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total:    messages.length,
    unread:   messages.filter(m => m.status === "unread").length,
    replied:  messages.filter(m => m.status === "replied").length,
    archived: messages.filter(m => m.status === "archived").length,
  }), [messages]);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return messages.filter(m => {
      const matchStatus = filterStatus === "all" || m.status === filterStatus;
      const matchSearch =
          !q ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.subject ?? "").toLowerCase().includes(q) ||
          (m.company ?? "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [messages, filterStatus, search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpen = (item: ContactMessage) => {
    setSelected(item);
    if (item.status === "unread") {
      updateStatus.mutate({ id: item.id, status: "read" });
    }
  };

  const handleStatusChange = (id: string, status: ContactMessageStatus) => {
    updateStatus.mutate({ id, status });
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    deleteMsg.mutate(id);
    if (selected?.id === id) setSelected(null);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
      <AdminLayout title="Messages de contact">

        {/* ── KPIs ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total"     value={kpis.total}    icon={InboxIcon}    accent="bg-slate-100 text-slate-600 dark:bg-slate-800" />
          <KpiCard label="Non lus"   value={kpis.unread}   icon={MailOpen}     accent="bg-rose-100 text-rose-600 dark:bg-rose-950" />
          <KpiCard label="Répondus"  value={kpis.replied}  icon={MailCheck}    accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950" />
          <KpiCard label="Archivés"  value={kpis.archived} icon={Archive}      accent="bg-sky-100 text-sky-600 dark:bg-sky-950" />
        </div>

        {/* ── Barre recherche + filtres ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                className="pl-9"
                placeholder="Rechercher par nom, email, sujet…"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
                <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        filterStatus === tab.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    }`}
                >
                  {tab.label}
                  {tab.value !== "all" && (
                      <span className="ml-1.5 text-xs opacity-60">
                  {messages.filter(m => m.status === tab.value).length}
                </span>
                  )}
                </button>
            ))}
          </div>
        </div>

        {/* ── Tableau ─────────────────────────────────────────────────────── */}
        {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-6"></TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead className="hidden md:table-cell">Sujet</TableHead>
                    <TableHead className="hidden lg:table-cell">Entreprise</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                          Aucun message trouvé.
                        </TableCell>
                      </TableRow>
                  ) : (
                      filtered.map(item => (
                          <TableRow
                              key={item.id}
                              className={`cursor-pointer transition-colors ${
                                  item.status === "unread"
                                      ? "font-medium bg-primary/[0.03] hover:bg-primary/[0.06]"
                                      : "hover:bg-muted/30"
                              }`}
                              onClick={() => handleOpen(item)}
                          >
                            {/* Indicateur non lu */}
                            <TableCell className="pr-0">
                              {item.status === "unread" && (
                                  <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto" />
                              )}
                            </TableCell>

                            {/* Expéditeur */}
                            <TableCell>
                              <p className="font-medium leading-none">
                                {item.firstName} {item.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                                {item.email}
                              </p>
                            </TableCell>

                            {/* Sujet */}
                            <TableCell className="hidden md:table-cell max-w-[200px]">
                              <p className="truncate text-sm">
                                {item.subject ?? <span className="text-muted-foreground italic">Sans objet</span>}
                              </p>
                            </TableCell>

                            {/* Entreprise */}
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {item.company ?? "—"}
                            </TableCell>

                            {/* Statut */}
                            <TableCell>
                              <Badge
                                  variant="outline"
                                  className={`text-xs ${STATUS_CONFIG[item.status].className}`}
                              >
                                {STATUS_CONFIG[item.status].label}
                              </Badge>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(item.createdAt), "d MMM yyyy", { locale: fr })}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                {/* Voir */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Voir le message"
                                    onClick={() => handleOpen(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {/* Marquer comme lu */}
                                {item.status === "unread" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                        title="Marquer comme lu"
                                        onClick={() => handleStatusChange(item.id, "read")}
                                    >
                                      <CheckCheck className="h-4 w-4" />
                                    </Button>
                                )}

                                {/* Archiver */}
                                {item.status !== "archived" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-sky-600 hover:text-sky-700"
                                        title="Archiver"
                                        onClick={() => handleStatusChange(item.id, "archived")}
                                    >
                                      <Archive className="h-4 w-4" />
                                    </Button>
                                )}

                                {/* Supprimer */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    title="Supprimer"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deleteMsg.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
        )}

        {/* Compteur résultats */}
        {!isLoading && (
            <p className="text-xs text-muted-foreground mt-3 text-right">
              {filtered.length} message{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
              {messages.length !== filtered.length && ` sur ${messages.length}`}
            </p>
        )}

        {/* ── Dialog détail ────────────────────────────────────────────────── */}
        <MessageDetailDialog
            message={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
        />
      </AdminLayout>
  );
};

export default AdminMessages;
