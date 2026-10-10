/**
 * AdminFactures.tsx — factures des entreprises : liste, PDF, envoi par e-mail, annulation (motif).
 * L'émission se fait depuis une inscription (« Candidatures & paiements » → Inscrits → Facture).
 * Réservé SUPER_ADMIN et ADMIN.
 */
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Loader2, Mail, Printer } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCancelInvoice, useInvoices, useSendInvoice } from "@/hooks/useAdminOps";
import { useToast } from "@/hooks/use-toast";
import { saveBlob } from "@/lib/download";
import { invoiceAdminService, type Invoice } from "@/services/api/adminOpsService";
import { formatAmount } from "@/types/payment.type";

const day = (iso: string | null | undefined) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");

const FILTERS = [
  { key: "", label: "Toutes" },
  { key: "ISSUED", label: "Émises" },
  { key: "CANCELLED", label: "Annulées" },
];

function SendDialog({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { toast } = useToast();
  const send = useSendInvoice();
  const [to, setTo] = useState(invoice.buyerEmail ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await send.mutateAsync({ number: invoice.number, to: to.trim() || undefined });
      toast({ title: "Facture envoyée", description: `Facture ${invoice.number} envoyée par e-mail.` });
      onClose();
    } catch (err) {
      toast({ title: "Envoi impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !send.isPending && onClose()}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Envoyer la facture {invoice.number}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Le PDF est joint à l'e-mail. Laissez vide pour utiliser l'adresse de facturation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Destinataire" htmlFor="inv-to">
            <input id="inv-to" type="email" className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} placeholder="facturation@entreprise.sn" />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={send.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="navy" shape="rounded" disabled={send.isPending}>
              {send.isPending ? <Loader2 className="animate-spin" /> : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminFactures() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const { data, isLoading, isError } = useInvoices(page, status || undefined);
  const cancel = useCancelInvoice();
  const [sending, setSending] = useState<Invoice | null>(null);
  const [cancelling, setCancelling] = useState<Invoice | null>(null);
  const [busyPdf, setBusyPdf] = useState<string | null>(null);

  const openPdf = async (invoice: Invoice) => {
    setBusyPdf(invoice.number);
    try {
      saveBlob(await invoiceAdminService.pdf(invoice.number), `Facture-${invoice.number}.pdf`);
    } catch (err) {
      toast({ title: "Téléchargement impossible", description: errorMessage(err), variant: "destructive" });
    } finally {
      setBusyPdf(null);
    }
  };

  const invoices = data?.items ?? [];

  return (
    <AdminLayout title="Factures" description="Factures entreprise : PDF, envoi par e-mail et annulation">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les factures">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={status === f.key}
              onClick={() => { setStatus(f.key); setPage(0); }}
              className={status === f.key ? "rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white" : "rounded-pill border border-[#D6CEC0] bg-white px-4 py-2 text-sm text-ink-secondary"}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : isError ? (
          <ErrorNotice>Impossible de charger les factures.</ErrorNotice>
        ) : invoices.length === 0 ? (
          <EmptyState title="Aucune facture" text="Émettez une facture depuis « Candidatures & paiements » : carte d'un inscrit → Facture." />
        ) : (
          <div className="overflow-x-auto rounded-card border border-[#E7E0D4] bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] bg-app-bg text-xs uppercase tracking-[0.5px] text-ink-secondary">
                <tr>
                  <th className="px-4 py-3">N°</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Émise</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#E7E0D4] last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-navy">{inv.number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{inv.buyerName}</div>
                      {inv.purchaseOrderRef && <div className="text-xs text-ink-secondary">BC {inv.purchaseOrderRef}</div>}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{day(inv.issueDate)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{day(inv.dueDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatAmount(inv.total, inv.currency)}</td>
                    <td className="px-4 py-3">
                      {inv.status === "CANCELLED"
                        ? <Pill variant="neutral" title={inv.cancelledReason ?? undefined}>Annulée</Pill>
                        : <Pill variant="success">Émise</Pill>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button type="button" variant="outline" shape="rounded" size="sm" disabled={busyPdf === inv.number} onClick={() => void openPdf(inv)} aria-label={`PDF de la facture ${inv.number}`}>
                          {busyPdf === inv.number ? <Loader2 className="animate-spin" /> : <Printer />} PDF
                        </Button>
                        {inv.status !== "CANCELLED" && (
                          <>
                            <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setSending(inv)}><Mail /> Envoyer</Button>
                            <Button type="button" variant="outline" shape="rounded" size="sm" className="border-transparent text-error" onClick={() => setCancelling(inv)}>Annuler</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pager page={data.pagination.page} totalPages={data.pagination.totalPages} totalElements={data.pagination.totalElements} onChange={setPage} />}
        <p className="flex items-center gap-2 text-xs text-ink-secondary"><FileText className="h-4 w-4" /> Une facture annulée reste conservée avec son motif ; émettez-en une nouvelle si nécessaire.</p>
      </div>

      {sending && <SendDialog invoice={sending} onClose={() => setSending(null)} />}
      {cancelling && (
        <ReasonDialog
          title={`Annuler la facture ${cancelling.number}`}
          description="La facture est conservée comme annulée. Cette action est définitive."
          confirmLabel="Annuler la facture"
          onClose={() => setCancelling(null)}
          onSubmit={async (reason) => {
            try {
              await cancel.mutateAsync({ number: cancelling.number, reason });
              toast({ title: "Facture annulée" });
              setCancelling(null);
            } catch (err) {
              toast({ title: "Annulation impossible", description: errorMessage(err), variant: "destructive" });
            }
          }}
        />
      )}
    </AdminLayout>
  );
}
