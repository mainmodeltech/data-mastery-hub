/**
 * AdminCandidatures.tsx — candidatures → paiement → inscription, conçu pour des centaines de dossiers.
 *
 * Étapes (onglets avec compteurs) : Nouvelles · Paiement en attente · À confirmer · Inscrits · Archives (refusées/annulées).
 * Recherche, filtre par formation, tri et pagination sont faits par le serveur ; l'état est dans l'URL (lien partageable).
 * Deux vues : « Liste » (tableau, actions groupées, export) et « Pipeline » (colonnes des dossiers les plus récents).
 * Un clic sur un dossier ouvre sa fiche complète dans un panneau latéral.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, ChevronUp, Download, Kanban, List, Loader2, Plus, Search, X } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { CandidateDrawer, type DrawerActions } from "@/components/admin/candidatures/CandidateDrawer";
import { AcceptDialog, ManualPaymentDialog } from "@/components/admin/candidatures/PaymentDialogs";
import { STAGES, STATUS_LABELS } from "@/components/admin/candidatures/stages";
import { CreateInvoiceDialog } from "@/components/admin/CreateInvoiceDialog";
import { ManualRegistrationDialog } from "@/components/admin/ManualRegistrationDialog";
import { Button, Pill } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAdminFormations } from "@/hooks/useCatalogAdmin";
import {
  useAcceptRegistration, useCancelRegistration, useConfirmPayment, useOpenPayments, useRejectPayment,
  useRejectRegistration, useRemindPayment,
} from "@/hooks/usePayments";
import { useRegistrationSearch, useRegistrationSummary } from "@/hooks/useRegistrationSearch";
import { useDeleteRegistration, useUpdateRegistrationStatus } from "@/hooks/useRegistrations";
import { csvRow, downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { registrationService, type RegistrationQuery, type RegistrationStage } from "@/services/api/registrationService";
import type { Registration, RegistrationStatus } from "@/types";
import { formatAmount, PAYMENT_METHOD_LABELS, type AdminPayment, type PaymentMethod } from "@/types/payment.type";

const PAGE_SIZE = 25;
const PIPELINE_SIZE = 6;
const EXPORT_LIMIT = 2000;
const AVATAR_COLORS = ["#5B4B8A", "#0F5C73", "#8A5A00", "#1A3A5B", "#9A2E06", "#1F6B4F"];
const selectClass = "rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

const avatarColor = (name: string) => AVATAR_COLORS[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const day = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "—");
const shortDay = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM", { locale: fr }) : "—");

function Avatar({ r }: { r: Registration }) {
  const name = `${r.firstName} ${r.lastName}`;
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-xs font-bold text-white" style={{ background: avatarColor(name) }}>
      {`${r.firstName[0] ?? ""}${r.lastName[0] ?? ""}`.toUpperCase()}
    </span>
  );
}

type Dialogs =
  | { kind: "accept" | "reject" | "manual" | "cancel" | "invoice"; r: Registration }
  | { kind: "newManual" }
  | { kind: "rejectPayment"; payment: AdminPayment }
  | { kind: "rejectMany"; ids: string[] }
  | null;

type SortKey = "createdAt" | "lastName" | "bootcampTitle";

export default function AdminCandidatures() {
  const { toast } = useToast();
  const { can } = useAuth();
  const canDecide = can("APPLICATIONS_DECIDE");
  const canManagePayments = can("PAYMENTS_MANAGE");
  const canRecordPayments = can("PAYMENTS_RECORD");
  const canInvoice = can("INVOICES_MANAGE");
  const canEnroll = can("ENROLLMENTS_MANAGE");

  // ── État dans l'URL ──
  const [params, setParams] = useSearchParams();
  const stage = (STAGES.find((s) => s.key === params.get("etape"))?.key ?? "NEW") as RegistrationStage;
  const view = params.get("vue") === "pipeline" ? "pipeline" : "list";
  const q = params.get("q") ?? "";
  const bootcampId = params.get("formation") ?? "";
  const page = Math.max(0, Number(params.get("page") ?? 0) || 0);
  const sortKey = (["createdAt", "lastName", "bootcampTitle"].includes(params.get("tri") ?? "") ? params.get("tri") : "createdAt") as SortKey;
  const sortDir = params.get("ordre") === "asc" ? "asc" : "desc";

  const update = (patch: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    if (!keepPage && !("page" in patch)) next.delete("page");
    setParams(next, { replace: true });
  };

  // Recherche saisie : appliquée après une courte pause
  const [search, setSearch] = useState(q);
  useEffect(() => { setSearch(q); }, [q]);
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filter = { q: q || undefined, bootcampId: bootcampId || undefined };
  const { data: formations = [] } = useAdminFormations();
  const { data: summary } = useRegistrationSummary(filter);
  const listQuery: RegistrationQuery = { ...filter, stage, page, size: PAGE_SIZE, sort: `${sortKey},${sortDir}` };
  const list = useRegistrationSearch(listQuery, view === "list");
  const { data: openPayments = [] } = useOpenPayments();

  const paymentsByRegistration = useMemo(() => {
    const map = new Map<string, AdminPayment[]>();
    for (const p of openPayments) map.set(p.registrationId, [...(map.get(p.registrationId) ?? []), p]);
    for (const l of map.values()) l.sort((a, b) => a.installmentNumber - b.installmentNumber);
    return map;
  }, [openPayments]);

  const accept = useAcceptRegistration();
  const rejectRegistration = useRejectRegistration();
  const confirmPayment = useConfirmPayment();
  const rejectPayment = useRejectPayment();
  const remind = useRemindPayment();
  const cancelRegistration = useCancelRegistration();
  const updateStatus = useUpdateRegistrationStatus();
  const deleteRegistration = useDeleteRegistration();

  const [dialog, setDialog] = useState<Dialogs>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const rows: Registration[] = useMemo(() => list.data?.content ?? [], [list.data]);
  const totalElements = list.data?.totalElements ?? 0;
  const totalPages = list.data?.totalPages ?? 1;
  const [drawerCache, setDrawerCache] = useState<Registration | null>(null);
  const drawerReg = useMemo(() => {
    if (!openId) return null;
    return rows.find((r) => r.id === openId) ?? (drawerCache?.id === openId ? drawerCache : null);
  }, [openId, rows, drawerCache]);

  const open = (r: Registration) => { setDrawerCache(r); setOpenId(r.id); };
  useEffect(() => { setSelected(new Set()); }, [stage, q, bootcampId, page, view]);

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try { await action(); toast({ title: success }); } catch (err) { toast({ title: failure, description: errorMessage(err), variant: "destructive" }); }
  };

  const copyLink = async (link: string | null) => {
    if (!link) return toast({ title: "Aucun lien disponible", variant: "destructive" });
    try { await navigator.clipboard.writeText(link); toast({ title: "Lien de paiement copié" }); }
    catch { toast({ title: "Copie impossible", description: link, variant: "destructive" }); }
  };

  const pendingOf = (r: Registration) => (paymentsByRegistration.get(r.id) ?? []).find((p) => p.status === "PENDING");
  const declaredOf = (r: Registration) => (paymentsByRegistration.get(r.id) ?? []).find((p) => p.status === "DECLARED");

  const drawerActions: DrawerActions = {
    canDecide, canManagePayments, canRecordPayments, canInvoice,
    onAccept: (r) => setDialog({ kind: "accept", r }),
    onReject: (r) => setDialog({ kind: "reject", r }),
    onCancel: (r) => setDialog({ kind: "cancel", r }),
    onInvoice: (r) => setDialog({ kind: "invoice", r }),
    onManualPayment: (r) => setDialog({ kind: "manual", r }),
    onRemind: (p) => void run(() => remind.mutateAsync(p.id), "Relance envoyée", "Relance impossible"),
    onConfirm: (p) => void run(() => confirmPayment.mutateAsync(p.id), "Paiement confirmé", "Confirmation impossible"),
    onRejectPayment: (p) => setDialog({ kind: "rejectPayment", payment: p }),
    onCopyLink: (l) => void copyLink(l),
    onComplete: (r) => void run(() => updateStatus.mutateAsync({ id: r.id, status: "COMPLETED" }), "Marqué comme terminé", "Mise à jour impossible"),
    onChangeStatus: async (r, status: RegistrationStatus) => {
      await run(() => updateStatus.mutateAsync({ id: r.id, status }), `Statut : ${STATUS_LABELS[status]}`, "Changement impossible");
    },
    onDelete: async (r) => { await run(() => deleteRegistration.mutateAsync(r.id), "Candidature supprimée", "Suppression impossible"); },
  };

  // ── Actions groupées ──
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) => setSelected((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const bulk = async (label: string, action: (r: Registration) => Promise<unknown>) => {
    setBulkBusy(true);
    let ok = 0;
    const failed: string[] = [];
    for (const r of selectedRows) {
      try { await action(r); ok++; } catch { failed.push(`${r.firstName} ${r.lastName}`); }
    }
    setBulkBusy(false);
    setSelected(new Set());
    toast({
      title: `${label} : ${ok} dossier${ok > 1 ? "s" : ""}`,
      description: failed.length ? `Échec : ${failed.join(", ")}` : undefined,
      variant: failed.length ? "destructive" : undefined,
    });
  };

  // ── Export CSV de la sélection courante (étape + recherche + formation) ──
  const exportCsv = async () => {
    setExporting(true);
    try {
      const lines = [csvRow(["Reçue le", "Statut", "Prénom", "Nom", "E-mail", "Téléphone", "Pays", "Entreprise", "Fonction", "Formation", "Session", "Code promo", "Remise %", "Montant total", "Message"])];
      for (let p = 0; lines.length - 1 < EXPORT_LIMIT; p++) {
        const res = await registrationService.search({ ...filter, stage, page: p, size: 200, sort: "createdAt,desc" });
        for (const r of res.content) {
          lines.push(csvRow([r.createdAt?.slice(0, 10), STATUS_LABELS[r.status], r.firstName, r.lastName, r.email, r.phone, r.country, r.company, r.position,
            r.bootcampTitle, r.sessionName, r.promoCodeUsed, r.discountPercent, r.totalAmount, r.message]));
        }
        if (res.last || res.content.length === 0) break;
      }
      downloadCsv(`candidatures-${stage.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`, lines);
      toast({ title: "Export prêt", description: `${lines.length - 1} dossier${lines.length > 2 ? "s" : ""}` });
    } catch (err) {
      toast({ title: "Export impossible", description: errorMessage(err), variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const setSort = (key: SortKey) => {
    if (sortKey === key) update({ ordre: sortDir === "asc" ? "desc" : "asc" });
    else update({ tri: key, ordre: key === "createdAt" ? "desc" : "asc" });
  };
  const SortIcon = ({ k }: { k: SortKey }) => (sortKey === k ? (sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : null);

  /** Cellule « paiement » : l'info utile de l'étape en cours. */
  const paymentCell = (r: Registration) => {
    const s = r.paymentSummary;
    if (r.status === "PAYMENT_PENDING") {
      const p = pendingOf(r);
      return p ? <>Échéance {p.installmentNumber}/{p.installmentCount} · <strong>{formatAmount(p.amount, p.currency)}</strong>{p.dueDate ? <span className="text-ink-secondary"> · avant le {shortDay(p.dueDate)}</span> : null}</> : "Lien envoyé";
    }
    if (r.status === "PAYMENT_TO_CONFIRM") {
      const d = declaredOf(r);
      const method = d?.method ?? s?.declaredMethod;
      return <>{method ? (PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method) : "Paiement"}{d ? <> · <strong>{formatAmount(d.amount, d.currency)}</strong></> : null}</>;
    }
    if (r.status === "CONFIRMED" || r.status === "COMPLETED") {
      return s && s.installmentCount > 0 ? <>{s.confirmedCount}/{s.installmentCount} échéances{r.totalAmount ? <span className="text-ink-secondary"> · {formatAmount(s.paidAmount)} / {formatAmount(r.totalAmount)}</span> : null}</> : "—";
    }
    if (r.status === "REJECTED" || r.status === "CANCELLED") {
      const reason = r.status === "REJECTED" ? r.rejectedReason : r.cancelledReason;
      return reason ? <span className="line-clamp-2 text-ink-secondary" title={reason}>{reason}</span> : "—";
    }
    return r.promoCodeUsed ? <Pill variant="info">{r.promoCodeUsed}{r.discountPercent ? ` −${r.discountPercent} %` : ""}</Pill> : "—";
  };

  /** Action principale de la ligne selon l'étape. */
  const primaryAction = (r: Registration) => {
    if (r.status === "PENDING" && canDecide) return <Button type="button" size="sm" shape="rounded" variant="navy" onClick={() => setDialog({ kind: "accept", r })}>Accepter</Button>;
    if (r.status === "PAYMENT_TO_CONFIRM" && canManagePayments) {
      const d = declaredOf(r);
      return <Button type="button" size="sm" shape="rounded" variant="navy" disabled={!d || confirmPayment.isPending} onClick={() => d && void run(() => confirmPayment.mutateAsync(d.id), "Paiement confirmé", "Confirmation impossible")}>Confirmer</Button>;
    }
    if (r.status === "PAYMENT_PENDING" && canManagePayments) {
      const p = pendingOf(r);
      return <Button type="button" size="sm" shape="rounded" variant="outline" disabled={!p || remind.isPending} onClick={() => p && void run(() => remind.mutateAsync(p.id), "Relance envoyée", "Relance impossible")}>Relancer</Button>;
    }
    return null;
  };

  // ── Pipeline : les dossiers les plus récents de chaque étape ──
  const pipelineStages = STAGES.filter((s) => s.key !== "ARCHIVED");

  const count = (key: RegistrationStage) => summary?.[key] ?? 0;
  const currentStage = STAGES.find((s) => s.key === stage)!;

  return (
    <AdminLayout title="Candidatures & paiements" description="Du formulaire du site à l'inscription confirmée">
      <div className="flex flex-col gap-5">
        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
            <input
              type="search"
              aria-label="Rechercher une candidature"
              placeholder="Nom, e-mail, téléphone, entreprise, session…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select aria-label="Formation" className={cn(selectClass, "max-w-[220px]")} value={bootcampId} onChange={(e) => update({ formation: e.target.value || null })}>
            <option value="">Toutes les formations</option>
            {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
          {(q || bootcampId) && (
            <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-secondary hover:text-navy" onClick={() => { setSearch(""); update({ q: null, formation: null }); }}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />Effacer les filtres
            </button>
          )}
          <span className="flex-1" />
          <div className="flex rounded-pill border border-[#D6CEC0] bg-white p-0.5" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={view === "list"} onClick={() => update({ vue: null }, true)}
              className={cn("inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold", view === "list" ? "bg-navy text-white" : "text-ink-secondary")}><List className="h-4 w-4" aria-hidden="true" />Liste</button>
            <button type="button" aria-pressed={view === "pipeline"} onClick={() => update({ vue: "pipeline" }, true)}
              className={cn("inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold", view === "pipeline" ? "bg-navy text-white" : "text-ink-secondary")}><Kanban className="h-4 w-4" aria-hidden="true" />Pipeline</button>
          </div>
          <Button type="button" variant="outline" shape="rounded" size="sm" disabled={exporting} onClick={() => void exportCsv()}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}Exporter
          </Button>
          <Button asChild variant="outline" shape="rounded" size="sm"><Link to="/admin/promo-codes">Codes de parrainage</Link></Button>
          {canEnroll && (
            <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => setDialog({ kind: "newManual" })}><Plus />Inscription manuelle</Button>
          )}
        </div>

        {/* Étapes */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Étape du parcours">
          {STAGES.map((s) => (
            <Button
              key={s.key}
              type="button"
              role="tab"
              size="sm"
              shape="pill"
              variant={stage === s.key && view === "list" ? "navy" : "outline"}
              aria-selected={stage === s.key && view === "list"}
              onClick={() => update({ etape: s.key === "NEW" ? null : s.key, vue: null })}
            >
              {s.label}
              <span className={cn("ml-1.5 rounded-pill px-1.5 text-[0.6875rem] font-bold", s.key === "NEW" || s.key === "TO_CONFIRM" ? (count(s.key) > 0 ? "bg-cta text-white" : "bg-surface-sand text-ink-secondary") : "bg-surface-sand text-ink-secondary")}>
                {count(s.key)}
              </span>
            </Button>
          ))}
        </div>

        {view === "list" ? (
          <>
            {selectedRows.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-info-bg px-4 py-3">
                <span className="flex-1 font-bold text-navy">{selectedRows.length} dossier{selectedRows.length > 1 ? "s" : ""} sélectionné{selectedRows.length > 1 ? "s" : ""}</span>
                {stage === "NEW" && canDecide && (
                  <>
                    <Button type="button" size="sm" shape="rounded" variant="navy" disabled={bulkBusy}
                      onClick={() => void bulk("Acceptées au tarif", (r) => accept.mutateAsync({ id: r.id, payload: {} }))}>
                      {bulkBusy ? <Loader2 className="animate-spin" /> : null}Accepter au tarif
                    </Button>
                    <Button type="button" size="sm" shape="rounded" variant="outline" disabled={bulkBusy} onClick={() => setDialog({ kind: "rejectMany", ids: selectedRows.map((r) => r.id) })}>Refuser</Button>
                  </>
                )}
                {stage === "AWAITING_PAYMENT" && canManagePayments && (
                  <Button type="button" size="sm" shape="rounded" variant="navy" disabled={bulkBusy}
                    onClick={() => void bulk("Relancés", async (r) => { const p = pendingOf(r); if (!p) throw new Error("Aucune échéance"); await remind.mutateAsync(p.id); })}>
                    {bulkBusy ? <Loader2 className="animate-spin" /> : null}Relancer
                  </Button>
                )}
                {stage === "TO_CONFIRM" && canManagePayments && (
                  <Button type="button" size="sm" shape="rounded" variant="navy" disabled={bulkBusy}
                    onClick={() => void bulk("Paiements confirmés", async (r) => { const d = declaredOf(r); if (!d) throw new Error("Aucun paiement déclaré"); await confirmPayment.mutateAsync(d.id); })}>
                    {bulkBusy ? <Loader2 className="animate-spin" /> : null}Confirmer les paiements
                  </Button>
                )}
                <button type="button" className="text-sm font-semibold text-ink-secondary hover:text-navy" onClick={() => setSelected(new Set())}>Désélectionner</button>
              </div>
            )}

            {list.isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
            ) : list.isError ? (
              <ErrorNotice>Impossible de charger les candidatures. Vérifiez la connexion au serveur puis rechargez la page.</ErrorNotice>
            ) : rows.length === 0 ? (
              <EmptyState title={q || bootcampId ? "Aucun dossier ne correspond" : currentStage.empty} text={q || bootcampId ? "Modifiez la recherche ou effacez les filtres." : undefined} />
            ) : (
              <div className={cn("overflow-x-auto rounded-card border border-[#E7E0D4] bg-white", list.isFetching && "opacity-70 transition-opacity")}>
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-[#E7E0D4] bg-app-bg text-xs text-ink-secondary">
                    <tr>
                      <th scope="col" className="w-10 px-4 py-3">
                        <input type="checkbox" aria-label="Tout sélectionner" checked={allSelected} className="h-4 w-4 accent-[#1A3A5B]"
                          onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))} />
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold" aria-sort={sortKey === "lastName" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                        <button type="button" className="inline-flex items-center gap-1 font-semibold" onClick={() => setSort("lastName")}>Candidat <SortIcon k="lastName" /></button>
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold" aria-sort={sortKey === "bootcampTitle" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                        <button type="button" className="inline-flex items-center gap-1 font-semibold" onClick={() => setSort("bootcampTitle")}>Formation <SortIcon k="bootcampTitle" /></button>
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold" aria-sort={sortKey === "createdAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                        <button type="button" className="inline-flex items-center gap-1 font-semibold" onClick={() => setSort("createdAt")}>Reçue le <SortIcon k="createdAt" /></button>
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">{stage === "ARCHIVED" ? "Motif" : "Paiement"}</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className={cn("border-b border-[#E7E0D4] last:border-b-0 hover:bg-app-bg/60", selected.has(r.id) && "bg-info-bg/40")}>
                        <td className="px-4 py-3">
                          <input type="checkbox" aria-label={`Sélectionner ${r.firstName} ${r.lastName}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="h-4 w-4 accent-[#1A3A5B]" />
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => open(r)} className="flex items-center gap-2.5 text-left">
                            <Avatar r={r} />
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate font-bold text-ink">{r.firstName} {r.lastName}</span>
                              <span className="truncate text-xs text-ink-secondary">{r.email}</span>
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[240px] truncate text-ink" title={r.bootcampTitle ?? undefined}>{r.bootcampTitle ?? "—"}</div>
                          <div className="text-xs text-ink-secondary">{r.sessionName ?? ""}</div>
                        </td>
                        <td className="px-4 py-3 text-ink-secondary">{day(r.createdAt)}</td>
                        <td className="max-w-[260px] px-4 py-3">{paymentCell(r)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            {primaryAction(r)}
                            <Button type="button" size="sm" shape="rounded" variant="outline" onClick={() => open(r)}>Détails</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager page={page} totalPages={totalPages} totalElements={totalElements} onChange={(p) => update({ page: p ? String(p) : null }, true)} />
          </>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pipelineStages.map((s) => (
              <PipelineColumn
                key={s.key}
                stage={s.key}
                title={s.label}
                empty={s.empty}
                total={count(s.key)}
                filter={filter}
                onOpen={open}
                onSeeAll={() => update({ etape: s.key === "NEW" ? null : s.key, vue: null })}
                primaryAction={primaryAction}
              />
            ))}
          </div>
        )}
      </div>

      <CandidateDrawer registration={drawerReg} payments={drawerReg ? paymentsByRegistration.get(drawerReg.id) ?? [] : []} actions={drawerActions} onClose={() => setOpenId(null)} />

      {dialog?.kind === "invoice" && <CreateInvoiceDialog registration={dialog.r} onClose={() => setDialog(null)} />}
      {dialog?.kind === "newManual" && <ManualRegistrationDialog onClose={() => setDialog(null)} />}
      {dialog?.kind === "accept" && <AcceptDialog registration={dialog.r} onClose={() => setDialog(null)} />}
      {dialog?.kind === "manual" && <ManualPaymentDialog registration={dialog.r} onClose={() => setDialog(null)} />}
      {dialog?.kind === "cancel" && (
        <ReasonDialog
          title={`Annuler l'inscription de ${dialog.r.firstName} ${dialog.r.lastName}`}
          description="Les échéances ouvertes sont annulées ; si l'inscription était confirmée, la place est libérée et l'accès à la formation fermé. Un remboursement éventuel se fait depuis « Paiements »."
          confirmLabel="Annuler l'inscription"
          onClose={() => setDialog(null)}
          onSubmit={async (reason) => {
            await run(() => cancelRegistration.mutateAsync({ id: dialog.r.id, reason }), "Inscription annulée", "Annulation impossible");
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === "reject" && (
        <ReasonDialog
          title={`Refuser ${dialog.r.firstName} ${dialog.r.lastName}`}
          description="Le motif est conservé en interne ; aucun e-mail n'est envoyé au candidat refusé."
          confirmLabel="Refuser la candidature"
          onClose={() => setDialog(null)}
          onSubmit={async (reason) => {
            await run(() => rejectRegistration.mutateAsync({ id: dialog.r.id, reason }), "Candidature refusée", "Refus impossible");
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === "rejectMany" && (
        <ReasonDialog
          title={`Refuser ${dialog.ids.length} candidature${dialog.ids.length > 1 ? "s" : ""}`}
          description="Le même motif est conservé pour chaque dossier ; aucun e-mail n'est envoyé aux candidats refusés."
          confirmLabel="Refuser la sélection"
          onClose={() => setDialog(null)}
          onSubmit={async (reason) => {
            const ids = dialog.ids;
            setDialog(null);
            setBulkBusy(true);
            let ok = 0;
            for (const id of ids) { try { await rejectRegistration.mutateAsync({ id, reason }); ok++; } catch { /* compté en échec */ } }
            setBulkBusy(false);
            setSelected(new Set());
            toast({ title: `Refusées : ${ok} dossier${ok > 1 ? "s" : ""}`, description: ok < ids.length ? `${ids.length - ok} en échec` : undefined, variant: ok < ids.length ? "destructive" : undefined });
          }}
        />
      )}
      {dialog?.kind === "rejectPayment" && (
        <ReasonDialog
          title="Rejeter ce paiement"
          description="Le candidat est prévenu par e-mail et son inscription repasse en « Paiement en attente »."
          confirmLabel="Rejeter le paiement"
          onClose={() => setDialog(null)}
          onSubmit={async (reason) => {
            await run(() => rejectPayment.mutateAsync({ id: dialog.payment.id, reason }), "Paiement rejeté", "Rejet impossible");
            setDialog(null);
          }}
        />
      )}
    </AdminLayout>
  );
}

/** Colonne du pipeline : les dossiers les plus récents de l'étape, avec accès à la liste complète. */
function PipelineColumn({
  stage, title, empty, total, filter, onOpen, onSeeAll, primaryAction,
}: {
  stage: RegistrationStage; title: string; empty: string; total: number;
  filter: Pick<RegistrationQuery, "q" | "bootcampId">;
  onOpen: (r: Registration) => void; onSeeAll: () => void;
  primaryAction: (r: Registration) => React.ReactNode;
}) {
  const { data, isLoading } = useRegistrationSearch({ ...filter, stage, page: 0, size: PIPELINE_SIZE, sort: "createdAt,desc" });
  const items = data?.content ?? [];
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-stat bg-[#ECE6DB] p-3.5">
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="font-sans text-[0.9375rem] font-bold text-navy">{title}</span>
        <span className="rounded-pill bg-white px-2.5 py-0.5 text-[0.8125rem] font-bold text-ink-secondary">{total}</span>
      </div>
      {isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-ink-secondary" />}
      {!isLoading && items.length === 0 && <p className="px-1 text-[0.8125rem] text-ink-secondary">{empty}</p>}
      {items.map((r) => {
        const name = `${r.firstName} ${r.lastName}`;
        return (
          <div key={r.id} className="flex flex-col gap-2 rounded-[14px] border border-[#E7E0D4] bg-white p-3.5">
            <button type="button" onClick={() => onOpen(r)} className="flex items-center gap-2.5 text-left">
              <Avatar r={r} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-ink">{name}</span>
                <span className="truncate text-xs text-ink-secondary">{r.bootcampTitle ?? "Formation"} · {r.sessionName ?? shortDay(r.createdAt)}</span>
              </span>
            </button>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-secondary">{shortDay(r.createdAt)}</span>
              {primaryAction(r)}
            </div>
          </div>
        );
      })}
      {total > items.length && (
        <button type="button" onClick={onSeeAll} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-navy hover:text-cta">
          Voir les {total} dossiers →
        </button>
      )}
    </div>
  );
}
