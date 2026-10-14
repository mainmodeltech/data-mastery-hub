/**
 * Boîtes de dialogue du parcours candidature → paiement : accepter (montant, échéances) et enregistrer un paiement reçu hors site.
 */
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { errorMessage, ErrorNotice, Field, inputClass } from "@/components/admin/AdminKit";
import { Button } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAcceptRegistration, useRecordManualPayment } from "@/hooks/usePayments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Registration } from "@/types";
import {
  formatAmount, PAYMENT_METHOD_LABELS,
  type AcceptRegistrationPayload, type PaymentMethod, type PayerType,
} from "@/types/payment.type";

// ─── Boîtes de dialogue ───────────────────────────────────────────────────────

interface InstallmentRow { amount: string; dueDate: string }

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function AcceptDialog({ registration, onClose }: { registration: Registration; onClose: () => void }) {
  const { toast } = useToast();
  const { can } = useAuth();
  const canOverridePrice = can("PRICE_OVERRIDE");   // montant différent du tarif : droit « Déroger au prix »
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
            <Field
              label="Montant total (FCFA)"
              htmlFor="ac-total"
              hint={canOverridePrice
                ? "Vide : calculé depuis le prix de la session, l'early-bird et le code promo."
                : "Calculé depuis le prix de la session, l'early-bird et le code promo. Un autre montant demande le droit « Déroger au prix »."}
            >
              <input id="ac-total" type="number" min={0} step={1000} className={inputClass} value={total} disabled={!canOverridePrice} onChange={(e) => setTotal(e.target.value)} />
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
              {rows.length > 1 && canOverridePrice && (
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

export function ManualPaymentDialog({ registration, onClose }: { registration: Registration; onClose: () => void }) {
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

