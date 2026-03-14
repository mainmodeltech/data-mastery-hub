import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useRegistrations,
  useUpdateRegistrationStatus,
} from "@/hooks/useRegistrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  MoreHorizontal,
  Users,
  TrendingUp,
  CalendarCheck,
  Ban,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Registration, RegistrationStatus } from "@/types";

// ─── Config statuts ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    RegistrationStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      className: string;
      icon: React.ReactNode;
    }
> = {
  PENDING: {
    label: "En attente",
    variant: "outline",
    className:
        "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    icon: <Clock className="h-3 w-3" />,
  },
  CONFIRMED: {
    label: "Confirmé",
    variant: "outline",
    className:
        "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    icon: <Check className="h-3 w-3" />,
  },
  CANCELLED: {
    label: "Annulé",
    variant: "outline",
    className:
        "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: <X className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Terminé",
    variant: "outline",
    className:
        "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

const ALL_STATUSES: RegistrationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

// ─── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function KpiCard({ label, value, icon, colorClass, bgClass }: KpiCardProps) {
  return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${bgClass}`}>
          <span className={colorClass}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground leading-none mb-0.5">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RegistrationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
      <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
      >
      {cfg.icon}
        {cfg.label}
    </span>
  );
}

// ─── Modale détail ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  registration: Registration | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RegistrationStatus) => Promise<void>;
  isUpdating: boolean;
}

function DetailModal({
                       registration,
                       onClose,
                       onUpdateStatus,
                       isUpdating,
                     }: DetailModalProps) {
  const [localStatus, setLocalStatus] = useState<RegistrationStatus | null>(
      null
  );

  const currentStatus =
      localStatus ?? (registration?.status as RegistrationStatus);

  const handleStatusChange = async (val: string) => {
    if (!registration) return;
    const newStatus = val as RegistrationStatus;
    setLocalStatus(newStatus);
    await onUpdateStatus(registration.id, newStatus);
  };

  if (!registration) return null;

  return (
      <Dialog open={!!registration} onOpenChange={onClose}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
            <span>
              {registration.firstName} {registration.lastName}
            </span>
              <StatusBadge status={currentStatus} />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-1">
            {/* Infos personnelles */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Informations personnelles
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Email" value={registration.email} />
                <Field label="Téléphone" value={registration.phone} />
                <Field label="Entreprise" value={registration.company} />
                <Field label="Poste" value={registration.position} />
              </div>
            </div>

            <Separator />

            {/* Infos bootcamp */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Formation
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Bootcamp" value={registration.bootcampTitle} />
                <Field label="Session" value={registration.sessionName} />
                {registration.promoCodeUsed && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-0.5">Code promo</p>
                      <p className="font-medium text-emerald-600">
                        {registration.promoCodeUsed} (−{registration.discountPercent}
                        %)
                      </p>
                    </div>
                )}
                <Field
                    label="Inscrit le"
                    value={format(new Date(registration.createdAt), "d MMMM yyyy", {
                      locale: fr,
                    })}
                />
              </div>
            </div>

            {registration.message && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Message
                    </p>
                    <p className="text-sm bg-muted rounded-lg p-3 leading-relaxed">
                      {registration.message}
                    </p>
                  </div>
                </>
            )}

            <Separator />

            {/* Changer statut */}
            <div className="flex items-center gap-3">
              <Label className="shrink-0 text-sm">Statut</Label>
              <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      {STATUS_CONFIG[s].icon}
                      {STATUS_CONFIG[s].label}
                    </span>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}

function Field({
                 label,
                 value,
               }: {
  label: string;
  value: string | null | undefined;
}) {
  return (
      <div>
        <p className="text-muted-foreground mb-0.5">{label}</p>
        <p className="font-medium">{value || "—"}</p>
      </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

const AdminInscriptions = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | "all">(
      "all"
  );
  const [search, setSearch] = useState("");
  const [page] = useState(0);

  const statusParam =
      filterStatus === "all" ? undefined : (filterStatus as RegistrationStatus);
  const { data, isLoading } = useRegistrations(page, 10, statusParam);
  const updateStatusMutation = useUpdateRegistrationStatus();

  const registrations: Registration[] = data?.content ?? [];

  // Filtrage local par recherche
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return registrations;
    return registrations.filter(
        (r) =>
            `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.company?.toLowerCase().includes(q) ||
            r.bootcampTitle?.toLowerCase().includes(q) ||
            r.sessionName?.toLowerCase().includes(q)
    );
  }, [registrations, search]);

  // KPIs calculés sur toutes les inscriptions (sans filtre de recherche)
  const kpis = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
    const pending = registrations.filter((r) => r.status === "PENDING").length;
    const cancelled = registrations.filter((r) => r.status === "CANCELLED").length;
    return { total, confirmed, pending, cancelled };
  }, [registrations]);

  const handleUpdateStatus = async (id: string, status: RegistrationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast({ title: "Statut mis à jour avec succès." });
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  return (
      <AdminLayout title="Inscriptions">
        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <KpiCard
              label="Total inscriptions"
              value={kpis.total}
              icon={<Users className="h-4 w-4" />}
              colorClass="text-violet-600"
              bgClass="bg-violet-100 dark:bg-violet-900/30"
          />
          <KpiCard
              label="Confirmées"
              value={kpis.confirmed}
              icon={<CalendarCheck className="h-4 w-4" />}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <KpiCard
              label="En attente"
              value={kpis.pending}
              icon={<TrendingUp className="h-4 w-4" />}
              colorClass="text-amber-600"
              bgClass="bg-amber-100 dark:bg-amber-900/30"
          />
          <KpiCard
              label="Annulées"
              value={kpis.cancelled}
              icon={<Ban className="h-4 w-4" />}
              colorClass="text-red-600"
              bgClass="bg-red-100 dark:bg-red-900/30"
          />
        </div>

        {/* ── Barre recherche + filtres ── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                placeholder="Rechercher un nom, email, entreprise…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
            />
          </div>

          {/* Filtre statut */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    filterStatus === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
            >
              Tous
            </button>
            {ALL_STATUSES.map((s) => (
                <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        filterStatus === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
        </div>

        {/* ── Tableau ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
              <div className="flex justify-center items-center py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Chargement…</span>
              </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Participant
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Formation
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                      Session
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Statut
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                            colSpan={6}
                            className="text-center py-16 text-muted-foreground text-sm"
                        >
                          Aucune inscription trouvée.
                        </TableCell>
                      </TableRow>
                  ) : (
                      filtered.map((item) => (
                          <TableRow
                              key={item.id}
                              className="hover:bg-muted/30 cursor-pointer group"
                              onClick={() => setSelected(item)}
                          >
                            {/* Participant */}
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {item.firstName} {item.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.email}
                                </p>
                                {item.company && (
                                    <p className="text-xs text-muted-foreground">
                                      {item.company}
                                      {item.position && ` · ${item.position}`}
                                    </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Formation */}
                            <TableCell>
                              <p className="text-sm font-medium text-foreground">
                                {item.bootcampTitle || "—"}
                              </p>
                              {item.promoCodeUsed && (
                                  <span className="text-xs text-emerald-600 font-medium">
                          {item.promoCodeUsed} (−{item.discountPercent}%)
                        </span>
                              )}
                            </TableCell>

                            {/* Session */}
                            <TableCell className="hidden md:table-cell">
                              <p className="text-sm text-muted-foreground">
                                {item.sessionName || "—"}
                              </p>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {format(new Date(item.createdAt), "d MMM yyyy", {
                                locale: fr,
                              })}
                            </TableCell>

                            {/* Statut */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Select
                                  value={item.status}
                                  onValueChange={(v) =>
                                      handleUpdateStatus(item.id, v as RegistrationStatus)
                                  }
                              >
                                <SelectTrigger className="h-7 w-36 text-xs border-0 shadow-none p-0 gap-1 bg-transparent focus:ring-0">
                                  <StatusBadge status={item.status as RegistrationStatus} />
                                  <ChevronDown className="h-3 w-3 text-muted-foreground ml-1 shrink-0" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ALL_STATUSES.map((s) => (
                                      <SelectItem key={s} value={s}>
                              <span className="flex items-center gap-2 text-xs">
                                {STATUS_CONFIG[s].icon}
                                {STATUS_CONFIG[s].label}
                              </span>
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>

                            {/* Actions */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelected(item)}>
                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                    Voir le détail
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {ALL_STATUSES.filter((s) => s !== item.status).map(
                                      (s) => (
                                          <DropdownMenuItem
                                              key={s}
                                              onClick={() =>
                                                  handleUpdateStatus(item.id, s)
                                              }
                                          >
                                <span className="flex items-center gap-2">
                                  {STATUS_CONFIG[s].icon}
                                  Marquer «{STATUS_CONFIG[s].label}»
                                </span>
                                          </DropdownMenuItem>
                                      )
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
          )}
        </div>

        {/* ── Modale détail ── */}
        <DetailModal
            registration={selected}
            onClose={() => setSelected(null)}
            onUpdateStatus={handleUpdateStatus}
            isUpdating={updateStatusMutation.isPending}
        />
      </AdminLayout>
  );
};

export default AdminInscriptions;
