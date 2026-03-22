import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useRegistrations,
  useUpdateRegistrationStatus,
} from "@/hooks/useRegistrations";
import { useAddPayment, useDeletePayment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Registration, RegistrationStatus, PaymentStatus, PaymentMethod, Payment, CreatePaymentDTO } from "@/types";

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

// ─── Config statuts ───────────────────────────────────────────────────────────

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

// ─── Config paiement ─────────────────────────────────────────────────────────

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string; icon: React.ReactNode }> = {
  UNPAID: {
    label: "Non paye",
    className: "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    icon: <X className="h-3 w-3" />,
  },
  PARTIAL: {
    label: "Partiel",
    className: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    icon: <Clock className="h-3 w-3" />,
  },
  PAID: {
    label: "Paye",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    icon: <Check className="h-3 w-3" />,
  },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  VIREMENT: "Virement",
  CASH: "Especes",
  CARTE: "Carte",
};

const ALL_PAYMENT_METHODS: PaymentMethod[] = ["WAVE", "ORANGE_MONEY", "VIREMENT", "CASH", "CARTE"];

/** Formater un montant en FCFA */
function formatFcfa(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

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

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── Pagination bar ───────────────────────────────────────────────────────────

interface PaginationBarProps {
  page: number;           // 0-indexed (Spring)
  totalPages: number;
  totalElements: number;
  pageSize: PageSize;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: PageSize) => void;
  isLoading: boolean;
}

function PaginationBar({
                         page,
                         totalPages,
                         totalElements,
                         pageSize,
                         onPageChange,
                         onPageSizeChange,
                         isLoading,
                       }: PaginationBarProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to   = Math.min((page + 1) * pageSize, totalElements);

  // Pages à afficher : max 5 numéros autour de la page courante
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const delta = 2;
    const left  = Math.max(0, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    const pages: (number | "ellipsis")[] = [];

    if (left > 0) { pages.push(0); if (left > 1) pages.push("ellipsis"); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) {
      if (right < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages - 1);
    }
    return pages;
  }, [page, totalPages]);

  return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
        {/* Résumé + sélecteur taille */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {totalElements === 0
                ? "Aucun résultat"
                : `${from}–${to} sur ${totalElements}`}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Lignes :</span>
            <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange(Number(v) as PageSize)}
                disabled={isLoading}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)} className="text-xs">
                      {s}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center gap-1">
          {/* Première page */}
          <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(0)}
              disabled={page === 0 || isLoading}
              title="Première page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Page précédente */}
          <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || isLoading}
              title="Page précédente"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Numéros de page */}
          {pageNumbers.map((p, idx) =>
              p === "ellipsis" ? (
                  <span
                      key={`ellipsis-${idx}`}
                      className="h-7 w-7 flex items-center justify-center text-xs text-muted-foreground"
                  >
              …
            </span>
              ) : (
                  <Button
                      key={p}
                      variant={p === page ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() => onPageChange(p)}
                      disabled={isLoading}
                  >
                    {p + 1}
                  </Button>
              )
          )}

          {/* Page suivante */}
          <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
              title="Page suivante"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          {/* Dernière page */}
          <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
              title="Dernière page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
  );
}

// ─── Section paiements dans la modale ─────────────────────────────────────────

interface PaymentSectionProps {
  registration: Registration;
}

function PaymentSection({ registration }: PaymentSectionProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WAVE");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const addPayment = useAddPayment();
  const deletePayment = useDeletePayment();

  const payments = registration.payments ?? [];
  const amountDue = registration.amountDue ?? 0;
  const amountPaid = registration.amountPaid ?? 0;
  const remaining = Math.max(0, amountDue - amountPaid);
  const progressPct = amountDue > 0 ? Math.min(100, (amountPaid / amountDue) * 100) : 0;

  const resetForm = () => {
    setAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("WAVE");
    setReference("");
    setNotes("");
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount.replace(/\s/g, ""), 10);
    if (!numAmount || numAmount <= 0) {
      toast({ title: "Montant invalide", variant: "destructive" });
      return;
    }

    try {
      await addPayment.mutateAsync({
        registrationId: registration.id,
        data: {
          amount: numAmount,
          paymentDate,
          paymentMethod,
          reference: reference || undefined,
          notes: notes || undefined,
        },
      });
      toast({ title: "Paiement enregistre" });
      resetForm();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le paiement.", variant: "destructive" });
    }
  };

  const handleDelete = async (paymentId: string) => {
    try {
      await deletePayment.mutateAsync(paymentId);
      toast({ title: "Paiement supprime" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le paiement.", variant: "destructive" });
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Paiement
      </p>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <div className="flex items-center gap-2">
            <PaymentStatusBadge status={registration.paymentStatus ?? "UNPAID"} />
          </div>
          <span className="text-muted-foreground text-xs">
            {formatFcfa(amountPaid)} / {formatFcfa(amountDue)}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPct >= 100 ? "bg-emerald-500" : progressPct > 0 ? "bg-amber-500" : "bg-muted"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Reste a payer : {formatFcfa(remaining)}
          </p>
        )}
      </div>

      {/* Liste des paiements */}
      {payments.length > 0 && (
        <div className="space-y-2 mb-4">
          {payments.map((p: Payment) => (
            <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{formatFcfa(p.amount)}</span>
                  <span className="text-xs text-muted-foreground">via {PAYMENT_METHOD_LABELS[p.paymentMethod]}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{format(new Date(p.paymentDate), "d MMM yyyy", { locale: fr })}</span>
                  {p.reference && <span>· Ref: {p.reference}</span>}
                  {p.notes && <span>· {p.notes}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                onClick={() => handleDelete(p.id)}
                disabled={deletePayment.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm ? (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium mb-2">Nouveau paiement</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Montant (FCFA)</Label>
              <Input
                type="number"
                placeholder="150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Mode</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="text-sm">{PAYMENT_METHOD_LABELS[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Reference</Label>
              <Input
                placeholder="REF-12345"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Input
              placeholder="Notes libres..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleSubmit} disabled={addPayment.isPending}>
              {addPayment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Enregistrer
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>Annuler</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Ajouter un paiement
        </Button>
      )}
    </div>
  );
}

// ─── Modale détail ────────────────────────────────────────────────────────────

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
  const [localStatus, setLocalStatus] = useState<RegistrationStatus | null>(null);

  const currentStatus = localStatus ?? (registration?.status as RegistrationStatus);

  const handleStatusChange = async (val: string) => {
    if (!registration) return;
    const newStatus = val as RegistrationStatus;
    setLocalStatus(newStatus);
    await onUpdateStatus(registration.id, newStatus);
  };

  if (!registration) return null;

  return (
      <Dialog open={!!registration} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{registration.firstName} {registration.lastName}</span>
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
                <Field label="Email"      value={registration.email} />
                <Field label="Téléphone"  value={registration.phone} />
                <Field label="Pays"       value={registration.country} />
                <Field label="Profil"     value={registration.profile} />
                <Field label="Entreprise" value={registration.company} />
                <Field label="Poste"      value={registration.position} />
                {registration.school && (
                    <Field label="École / Institution" value={registration.school} />
                )}
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
                <Field label="Session"  value={registration.sessionName} />
                {registration.promoCodeUsed && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-0.5">Code promo</p>
                      <p className="font-medium text-emerald-600">
                        {registration.promoCodeUsed} (−{registration.discountPercent}%)
                      </p>
                    </div>
                )}
                <Field
                    label="Inscrit le"
                    value={format(new Date(registration.createdAt), "d MMMM yyyy", { locale: fr })}
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

            {/* Section paiement */}
            <PaymentSection registration={registration} />

            <Separator />

            {/* Changer statut */}
            <div className="flex items-center gap-3">
              <Label className="shrink-0 text-sm">Statut</Label>
              <Select
                  value={currentStatus}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
              >
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
              {isUpdating && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
      <div>
        <p className="text-muted-foreground mb-0.5">{label}</p>
        <p className="font-medium">{value || "—"}</p>
      </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const AdminInscriptions = () => {
  const { toast } = useToast();

  // ── État pagination ────────────────────────────────────────────────────────
  const [page, setPage]           = useState(0);
  const [pageSize, setPageSize]   = useState<PageSize>(10);

  // ── Filtres ────────────────────────────────────────────────────────────────
  const [selected, setSelected]         = useState<Registration | null>(null);
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | "all">("all");
  const [search, setSearch]             = useState("");

  const statusParam =
      filterStatus === "all" ? undefined : (filterStatus as RegistrationStatus);

  // Réinitialiser à la page 0 quand on change le filtre ou la taille
  const handleFilterStatus = (s: RegistrationStatus | "all") => {
    setFilterStatus(s);
    setPage(0);
  };
  const handlePageSize = (s: PageSize) => {
    setPageSize(s);
    setPage(0);
  };

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading }   = useRegistrations(page, pageSize, statusParam);
  const updateStatusMutation  = useUpdateRegistrationStatus();

  const registrations: Registration[] = data?.content ?? [];
  const totalPages    = data?.totalPages   ?? 0;
  const totalElements = data?.totalElements ?? 0;

  // ── Filtrage local par recherche (sur la page courante uniquement) ─────────
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

  // ── KPIs sur la page courante ─────────────────────────────────────────────
  // Note : pour des KPIs globaux il faudrait un endpoint dédié.
  // Ici on affiche les données réelles de la page chargée.
  const kpis = useMemo(() => ({
    total:     totalElements,
    confirmed: registrations.filter((r) => r.status === "CONFIRMED").length,
    pending:   registrations.filter((r) => r.status === "PENDING").length,
    cancelled: registrations.filter((r) => r.status === "CANCELLED").length,
  }), [registrations, totalElements]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
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
                onClick={() => handleFilterStatus("all")}
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
                    onClick={() => handleFilterStatus(s)}
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
          {search
              ? `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""} sur la page`
              : `${totalElements} inscription${totalElements !== 1 ? "s" : ""} au total`}
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
              <>
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
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
                        Paiement
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
                              colSpan={7}
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
                                  <p className="text-xs text-muted-foreground">{item.email}</p>
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
                                {format(new Date(item.createdAt), "d MMM yyyy", { locale: fr })}
                              </TableCell>

                              {/* Paiement */}
                              <TableCell className="hidden lg:table-cell">
                                <PaymentStatusBadge status={item.paymentStatus ?? "UNPAID"} />
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
                                    {ALL_STATUSES.filter((s) => s !== item.status).map((s) => (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() => handleUpdateStatus(item.id, s)}
                                        >
                                <span className="flex items-center gap-2">
                                  {STATUS_CONFIG[s].icon}
                                  Marquer «{STATUS_CONFIG[s].label}»
                                </span>
                                        </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>

                {/* ── Barre de pagination ── */}
                {totalPages > 0 && (
                    <div className="border-t border-border px-4">
                      <PaginationBar
                          page={page}
                          totalPages={totalPages}
                          totalElements={totalElements}
                          pageSize={pageSize}
                          onPageChange={setPage}
                          onPageSizeChange={handlePageSize}
                          isLoading={isLoading}
                      />
                    </div>
                )}
              </>
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
