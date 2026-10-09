/**
 * AdminCandidatures.tsx — pipeline candidatures → paiement → inscription
 * (docs/design/screens/app/App-Admin-Candidatures.dc.html), branché sur le backend
 * enrollment-payment :
 *
 *   PENDING            Nouvelles candidatures   Accepter (montant + échéances) · Refuser (motif)
 *   PAYMENT_PENDING    Paiement en attente      Lien de paiement · Relancer · Paiement reçu hors site
 *   PAYMENT_TO_CONFIRM Paiement à confirmer     Voir la preuve · Confirmer · Rejeter (motif)
 *   CONFIRMED/COMPLETED Inscrits                Échéances restantes · Marquer terminé
 *
 * REJECTED et CANCELLED sont masqués ; l'historique complet reste dans « Inscriptions ».
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, ExternalLink, Loader2, Plus, Search, X } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice, errorMessage, Field, inputClass, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Pill } from "@/components/shared";
import { ComingSoonLink } from "@/components/layouts/ComingSoonLink";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useRegistrations, useUpdateRegistrationStatus } from "@/hooks/useRegistrations";
import {
  useAcceptRegistration, useConfirmPayment, useOpenPayments, useRecordManualPayment,
  useRejectPayment, useRejectRegistration, useRemindPayment,
} from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import type { Registration } from "@/types";
import {
  formatAmount, PAYMENT_METHOD_LABELS,
  type AcceptRegistrationPayload, type AdminPayment, type PaymentMethod, type PayerType,
} from "@/types/payment.type";

const PAGE_SIZE = 100;
const AVATAR_COLORS = ["#5B4B8A", "#0F5C73", "#8A5A00", "#1A3A5B", "#9A2E06", "#1F6B4F"];
const selectClass =
  "rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

function avatarColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const day = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM", { locale: fr }) : "—");

// ─── Boîtes de dialogue ───────────────────────────────────────────────────────

interface InstallmentRow { amount: string; dueDate: string }

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function AcceptDialog({ registration, onClose }: { registration: Registration; onClose: () => void }) {
  const { toast } = useToast();
  const accept = useAcceptRegistration();
  const [payerType, setPayerType] = useState<PayerType>("INDIVIDUAL");
  const [total, setTotal] = useState("");
  const [customAmounts, setCustomAmounts] = useState(false);
  const [rows, setRows] = useState<InstallmentRow[]>([{ amount: "", dueDate: inDays(2) }]);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [poRef, setPoRef] = useState("");
  const [error, setError] = useState("");

  const setRow = (i: number, patch: Partial<InstallmentRow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setCount = (n: number) =>
    setRows((r) => Array.from({ length: n }, (_, i) => r[i] ?? { amount: "", dueDate: inDays(2 + 30 * i) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const totalAmount = total.trim() === "" ? undefined : Math.round(Number(total));
    if (totalAmount !== undefined && (Number.isNaN(totalAmount) || totalAmount < 0)) return setError("Le montant total est invalide.");
    if (rows.some((r) => !r.dueDate)) return setError("Chaque échéance doit avoir une date.");
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].dueDate < rows[i - 1].dueDate) return setError("Les dates d'échéance doivent être croissantes.");
    }
    let installments: AcceptRegistrationPayload["installments"];
    if (customAmounts) {
      const amounts = rows.map((r) => Math.round(Number(r.amount)));
      if (amounts.some((a) => !Number.isFinite(a) || a <= 0)) return setError("Renseignez le montant de chaque échéance.");
      if (totalAmount === undefined) return setError("Le montant total est requis pour des échéances personnalisées.");
      if (amounts.reduce((s, a) => s + a, 0) !== totalAmount) return setError("La somme des échéances doit être égale au montant total.");
      installments = rows.map((r, i) => ({ amount: amounts[i], dueDate: r.dueDate }));
    } else {
      installments = rows.map((r) => ({ dueDate: r.dueDate }));
    }
    try {
      await accept.mutateAsync({
        id: registration.id,
        payload: {
          payerType,
          totalAmount,
          installments,
          invoiceRef: payerType === "COMPANY" && invoiceRef.trim() ? invoiceRef.trim() : undefined,
          purchaseOrderRef: payerType === "COMPANY" && poRef.trim() ? poRef.trim() : undefined,
        },
      });
      toast({ title: "Candidature acceptée", description: "Le lien de paiement a été envoyé au candidat." });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "L'acceptation a échoué."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !accept.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Accepter {registration.firstName} {registration.lastName}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            {registration.bootcampTitle ?? "Formation"}{registration.sessionName ? ` · ${registration.sessionName}` : ""}. Le candidat reçoit un lien de paiement pour la première échéance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Payeur" htmlFor="ac-payer">
              <select id="ac-payer" className={inputClass} value={payerType} onChange={(e) => setPayerType(e.target.value as PayerType)}>
                <option value="INDIVIDUAL">Particulier</option>
                <option value="COMPANY">Entreprise (facture / bon de commande)</option>
              </select>
            </Field>
            <Field label="Montant total (FCFA)" htmlFor="ac-total" hint="Vide : calculé depuis le prix de la session, l'early-bird et le code promo.">
              <input id="ac-total" type="number" min={0} step={1000} className={inputClass} value={total} onChange={(e) => setTotal(e.target.value)} />
            </Field>
          </div>
          {payerType === "COMPANY" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Réf. facture" htmlFor="ac-inv"><input id="ac-inv" className={inputClass} value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} /></Field>
              <Field label="Réf. bon de commande" htmlFor="ac-po"><input id="ac-po" className={inputClass} value={poRef} onChange={(e) => setPoRef(e.target.value)} /></Field>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-xl border border-[#E7E0D4] bg-app-bg p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Field label="Nombre d'échéances" htmlFor="ac-count" className="w-36">
                <select id="ac-count" className={inputClass} value={rows.length} onChange={(e) => setCount(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              {rows.length > 1 && (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={customAmounts} onChange={(e) => setCustomAmounts(e.target.checked)} className="h-4 w-4 accent-[#1A3A5B]" />
                  Montants personnalisés
                </label>
              )}
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid items-end gap-3 sm:grid-cols-[70px_1fr_1fr]">
                <span className="pb-2.5 text-sm font-bold text-navy">#{i + 1}</span>
                <Field label="Date limite" htmlFor={`ac-d${i}`}>
                  <input id={`ac-d${i}`} type="date" required className={inputClass} value={r.dueDate} onChange={(e) => setRow(i, { dueDate: e.target.value })} />
                </Field>
                <Field label={customAmounts ? "Montant (FCFA)" : "Montant"} htmlFor={`ac-a${i}`}>
                  <input
                    id={`ac-a${i}`}
                    type="number"
                    min={0}
                    className={inputClass}
                    disabled={!customAmounts || rows.length === 1}
                    placeholder={customAmounts ? "" : "Répartition égale"}
                    value={customAmounts ? r.amount : ""}
                    onChange={(e) => setRow(i, { amount: e.target.value })}
                  />
                </Field>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={accept.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={accept.isPending}>{accept.isPending ? <Loader2 className="animate-spin" /> : "Accepter et envoyer le lien"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ManualPaymentDialog({ registration, onClose }: { registration: Registration; onClose: () => void }) {
  const { toast } = useToast();
  const record = useRecordManualPayment();
  const [method, setMethod] = useState<PaymentMethod>("VIREMENT");
  const [reference, setReference] = useState("");
  const [installment, setInstallment] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [poRef, setPoRef] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await record.mutateAsync({
        id: registration.id,
        payload: {
          method,
          installmentNumber: installment ? Number(installment) : undefined,
          reference: reference.trim() || undefined,
          invoiceRef: invoiceRef.trim() || undefined,
          purchaseOrderRef: poRef.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      toast({ title: "Paiement enregistré", description: "À confirmer dans la colonne « Paiement à confirmer »." });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !record.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Paiement reçu hors du site</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Virement, espèces ou facture entreprise pour {registration.firstName} {registration.lastName}. L'échéance passe « à confirmer ».
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Moyen de paiement *" htmlFor="mp-method">
              <select id="mp-method" className={inputClass} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
              </select>
            </Field>
            <Field label="Échéance n°" htmlFor="mp-inst" hint="Vide : la première non payée.">
              <input id="mp-inst" type="number" min={1} className={inputClass} value={installment} onChange={(e) => setInstallment(e.target.value)} />
            </Field>
          </div>
          <Field label="Référence" htmlFor="mp-ref"><input id="mp-ref" className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} /></Field>
          {method === "ENTREPRISE" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Réf. facture" htmlFor="mp-inv"><input id="mp-inv" className={inputClass} value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} /></Field>
              <Field label="Réf. bon de commande" htmlFor="mp-po"><input id="mp-po" className={inputClass} value={poRef} onChange={(e) => setPoRef(e.target.value)} /></Field>
            </div>
          )}
          <Field label="Notes" htmlFor="mp-notes"><textarea id="mp-notes" rows={2} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={record.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={record.isPending}>{record.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cartes ───────────────────────────────────────────────────────────────────

function CandidateCard({ r, children }: { r: Registration; children?: React.ReactNode }) {
  const name = `${r.firstName} ${r.lastName}`;
  const initials = `${r.firstName[0] ?? ""}${r.lastName[0] ?? ""}`.toUpperCase();
  const context = [r.position, r.company].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#E7E0D4] bg-white p-3.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-xs font-bold text-white" style={{ background: avatarColor(name) }}>
          {initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold text-ink">{name}</span>
          <span className="truncate text-xs text-ink-secondary">
            {r.bootcampTitle ?? "Formation"} · {r.sessionName ?? day(r.createdAt)}
          </span>
        </span>
      </div>
      {(context || r.message) && (
        <span className="line-clamp-2 text-[13px] text-ink-secondary">
          {context}{context && r.message ? " · " : ""}{r.message ? `« ${r.message} »` : ""}
        </span>
      )}
      {children}
    </div>
  );
}

function Column({ title, count, empty, children }: { title: string; count: number; empty: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-stat bg-[#ECE6DB] p-3.5">
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="font-sans text-[15px] font-bold text-navy">{title}</span>
        <span className="rounded-pill bg-white px-2.5 py-0.5 text-[13px] font-bold text-ink-secondary">{count}</span>
      </div>
      {count === 0 && <p className="px-1 text-[13px] text-ink-secondary">{empty}</p>}
      {children}
    </div>
  );
}

type Dialogs =
  | { kind: "accept" | "reject" | "manual"; r: Registration }
  | { kind: "rejectPayment"; payment: AdminPayment }
  | null;

export default function AdminCandidatures() {
  const { toast } = useToast();
  const { data, isLoading, isError } = useRegistrations(0, PAGE_SIZE);
  const { data: openPayments = [] } = useOpenPayments();
  const updateStatus = useUpdateRegistrationStatus();
  const rejectRegistration = useRejectRegistration();
  const confirmPayment = useConfirmPayment();
  const rejectPayment = useRejectPayment();
  const remind = useRemindPayment();

  const [formation, setFormation] = useState("all");
  const [session, setSession] = useState("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<Dialogs>(null);

  const all: Registration[] = data?.content ?? [];
  const total = data?.totalElements ?? all.length;

  const paymentsByRegistration = useMemo(() => {
    const map = new Map<string, AdminPayment[]>();
    for (const p of openPayments) map.set(p.registrationId, [...(map.get(p.registrationId) ?? []), p]);
    for (const list of map.values()) list.sort((a, b) => a.installmentNumber - b.installmentNumber);
    return map;
  }, [openPayments]);

  const formations = useMemo(() => Array.from(new Set(all.map((r) => r.bootcampTitle).filter(Boolean) as string[])).sort(), [all]);
  const sessions = useMemo(() => Array.from(new Set(all.map((r) => r.sessionName).filter(Boolean) as string[])).sort(), [all]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return all.filter((r) => {
      if (formation !== "all" && r.bootcampTitle !== formation) return false;
      if (session !== "all" && r.sessionName !== session) return false;
      if (q && !`${r.firstName} ${r.lastName} ${r.email} ${r.company ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, formation, session, search]);

  const byStatus = (...s: Registration["status"][]) => filtered.filter((r) => s.includes(r.status));
  const newOnes = byStatus("PENDING");
  const awaiting = byStatus("PAYMENT_PENDING");
  const toConfirm = byStatus("PAYMENT_TO_CONFIRM");
  const enrolled = byStatus("CONFIRMED", "COMPLETED");
  const hiddenCount = filtered.filter((r) => r.status === "CANCELLED" || r.status === "REJECTED").length;

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      toast({ title: success });
    } catch (err) {
      toast({ title: failure, description: errorMessage(err), variant: "destructive" });
    }
  };

  const copyLink = async (link: string | null) => {
    if (!link) return toast({ title: "Aucun lien disponible", variant: "destructive" });
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Lien de paiement copié" });
    } catch {
      toast({ title: "Copie impossible", description: link, variant: "destructive" });
    }
  };

  /** Actions sur l'échéance à payer (lien, relance, paiement reçu hors site). */
  const duePaymentActions = (r: Registration) => {
    const pending = (paymentsByRegistration.get(r.id) ?? []).find((p) => p.status === "PENDING");
    const s = r.paymentSummary;
    return (
      <div className="flex flex-col gap-2">
        <div className="text-[13px] text-ink-secondary">
          {pending && (
            <div>
              Échéance {pending.installmentNumber}/{pending.installmentCount} · <strong className="text-ink">{formatAmount(pending.amount, pending.currency)}</strong>
              {pending.dueDate && <> · avant le {day(pending.dueDate)}</>}
            </div>
          )}
          {s?.linkSentAt && <div>Lien envoyé le {day(s.linkSentAt)}{pending && pending.reminderCount > 0 ? ` · ${pending.reminderCount} relance${pending.reminderCount > 1 ? "s" : ""}` : ""}</div>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="outline" shape="rounded" size="sm" disabled={!pending} onClick={() => void copyLink(pending?.paymentLink ?? null)}><Copy />Lien</Button>
          <Button
            type="button" variant="outline" shape="rounded" size="sm"
            disabled={!pending || remind.isPending}
            onClick={() => pending && void run(() => remind.mutateAsync(pending.id), "Relance envoyée", "Relance impossible")}
          >
            Relancer
          </Button>
          <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setDialog({ kind: "manual", r })}>Paiement reçu</Button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="Candidatures & paiements" description="Du formulaire du site à l'inscription confirmée">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Formation" className={selectClass} value={formation} onChange={(e) => setFormation(e.target.value)}>
            <option value="all">Toutes les formations</option>
            {formations.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select aria-label="Session" className={selectClass} value={session} onChange={(e) => setSession(e.target.value)}>
            <option value="all">Toutes les sessions</option>
            {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-ink-secondary" />
            <input type="search" aria-label="Rechercher une candidature" placeholder="Nom, e-mail, entreprise…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 bg-transparent text-sm outline-none" />
          </div>
          <span className="flex-1" />
          <Button asChild variant="outline" shape="rounded" size="sm"><Link to="/admin/promo-codes">Codes promo</Link></Button>
          <ComingSoonLink title="Inscription manuelle" className="rounded-card bg-navy px-4 py-2.5 font-sans text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Inscription manuelle
          </ComingSoonLink>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : isError ? (
          <ErrorNotice>Impossible de charger les candidatures. Vérifiez la connexion au serveur puis rechargez la page.</ErrorNotice>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Column title="Nouvelles candidatures" count={newOnes.length} empty="Aucune nouvelle candidature.">
              {newOnes.map((r) => (
                <CandidateCard key={r.id} r={r}>
                  <div className="flex gap-2">
                    <Button shape="rounded" variant="navy" size="sm" onClick={() => setDialog({ kind: "accept", r })}>Accepter</Button>
                    <Button shape="rounded" variant="outline" size="sm" className="border-transparent" onClick={() => setDialog({ kind: "reject", r })}>Refuser</Button>
                  </div>
                </CandidateCard>
              ))}
            </Column>

            <Column title="Paiement en attente" count={awaiting.length} empty="Aucun paiement en attente.">
              {awaiting.map((r) => (
                <CandidateCard key={r.id} r={r}>
                  {duePaymentActions(r)}
                  <button
                    type="button"
                    className="w-fit text-xs font-semibold text-ink-secondary hover:text-error"
                    onClick={() => {
                      if (window.confirm(`Annuler l'inscription de ${r.firstName} ${r.lastName} ?`)) {
                        void run(() => updateStatus.mutateAsync({ id: r.id, status: "CANCELLED" }), "Inscription annulée", "Annulation impossible");
                      }
                    }}
                  >
                    Annuler l'inscription
                  </button>
                </CandidateCard>
              ))}
            </Column>

            <Column title="Paiement à confirmer" count={toConfirm.length} empty="Aucun paiement à vérifier.">
              {toConfirm.map((r) => {
                const declared = (paymentsByRegistration.get(r.id) ?? []).find((p) => p.status === "DECLARED");
                const s = r.paymentSummary;
                const method = declared?.method ?? s?.declaredMethod;
                const reference = declared?.reference ?? s?.declaredReference;
                return (
                  <CandidateCard key={r.id} r={r}>
                    <div className="text-[13px] text-ink-secondary">
                      {method ? (PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method) : "Paiement"}
                      {declared && <> · <strong className="text-ink">{formatAmount(declared.amount, declared.currency)}</strong></>}
                      {reference && <> · réf. {reference}</>}
                      {declared && declared.installmentCount > 1 && <> · échéance {declared.installmentNumber}/{declared.installmentCount}</>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {declared?.proofUrl ? (
                        <Button asChild variant="outline" shape="rounded" size="sm">
                          <a href={declared.proofUrl} target="_blank" rel="noreferrer"><ExternalLink />Preuve</a>
                        </Button>
                      ) : (
                        <Pill variant="neutral">Pas de preuve</Pill>
                      )}
                      <Button
                        type="button" variant="navy" shape="rounded" size="sm"
                        disabled={!declared || confirmPayment.isPending}
                        onClick={() => declared && void run(() => confirmPayment.mutateAsync(declared.id), "Paiement confirmé", "Confirmation impossible")}
                      >
                        Confirmer
                      </Button>
                      <Button
                        type="button" variant="outline" shape="rounded" size="sm" className="border-transparent"
                        disabled={!declared}
                        onClick={() => declared && setDialog({ kind: "rejectPayment", payment: declared })}
                      >
                        <X />Rejeter
                      </Button>
                    </div>
                  </CandidateCard>
                );
              })}
            </Column>

            <Column title="Inscrits" count={enrolled.length} empty="Aucun inscrit pour le moment.">
              {enrolled.map((r) => {
                const s = r.paymentSummary;
                const hasRemaining = !!s && s.confirmedCount < s.installmentCount;
                return (
                  <CandidateCard key={r.id} r={r}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Pill variant={r.status === "COMPLETED" ? "info" : "success"}>{r.status === "COMPLETED" ? "Terminé" : "Confirmé"}</Pill>
                      {s && s.installmentCount > 1 && (
                        <span className="text-xs text-ink-secondary">
                          {s.confirmedCount}/{s.installmentCount} échéances{r.totalAmount ? ` · ${formatAmount(s.paidAmount)} sur ${formatAmount(r.totalAmount)}` : ""}
                        </span>
                      )}
                    </div>
                    {hasRemaining && duePaymentActions(r)}
                    {r.status === "CONFIRMED" && (
                      <Button
                        shape="rounded" variant="outline" size="sm" className="w-fit border-transparent"
                        disabled={updateStatus.isPending}
                        onClick={() => void run(() => updateStatus.mutateAsync({ id: r.id, status: "COMPLETED" }), "Marqué comme terminé", "Mise à jour impossible")}
                      >
                        Marquer terminé
                      </Button>
                    )}
                  </CandidateCard>
                );
              })}
            </Column>
          </div>
        )}

        {!isLoading && !isError && (
          <p className="text-xs text-ink-secondary">
            {hiddenCount} refusée(s)/annulée(s) non affichée(s)
            {total > PAGE_SIZE ? ` · ${PAGE_SIZE} inscriptions les plus récentes sur ${total} chargées` : ""}.{" "}
            L'historique complet reste disponible dans <Link to="/admin/inscriptions" className="font-semibold text-navy">Inscriptions</Link>.
          </p>
        )}
      </div>

      {dialog?.kind === "accept" && <AcceptDialog registration={dialog.r} onClose={() => setDialog(null)} />}
      {dialog?.kind === "manual" && <ManualPaymentDialog registration={dialog.r} onClose={() => setDialog(null)} />}
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
