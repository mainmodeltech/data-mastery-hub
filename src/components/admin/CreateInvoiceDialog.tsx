/**
 * CreateInvoiceDialog — émet la facture d'une inscription acceptée (entreprise ou particulier).
 * Tous les champs sont facultatifs : l'API reprend l'entreprise ou le nom du candidat, la première échéance…
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { ErrorNotice, errorMessage, Field, inputClass } from "@/components/admin/AdminKit";
import { Button } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateInvoice, useRegistrationInvoices } from "@/hooks/useAdminOps";
import { useToast } from "@/hooks/use-toast";
import type { Registration } from "@/types";

export function CreateInvoiceDialog({ registration, onClose }: { registration: Registration; onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateInvoice();
  const { data: existing = [] } = useRegistrationInvoices(registration.id);
  const active = existing.filter((i) => i.status !== "CANCELLED");

  const [buyerName, setBuyerName] = useState(registration.company ?? "");
  const [buyerContact, setBuyerContact] = useState(`${registration.firstName} ${registration.lastName}`);
  const [buyerEmail, setBuyerEmail] = useState(registration.email);
  const [buyerAddress, setBuyerAddress] = useState("");
  const [purchaseOrderRef, setPurchaseOrderRef] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const clean = (v: string) => (v.trim() === "" ? undefined : v.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const invoice = await create.mutateAsync({
        registrationId: registration.id,
        payload: {
          buyerName: clean(buyerName),
          buyerContact: clean(buyerContact),
          buyerEmail: clean(buyerEmail),
          buyerAddress: clean(buyerAddress),
          purchaseOrderRef: clean(purchaseOrderRef),
          dueDate: clean(dueDate),
          notes: clean(notes),
        },
      });
      toast({ title: `Facture ${invoice.number} émise`, description: "Retrouvez-la dans « Factures » pour la télécharger ou l'envoyer." });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "L'émission a échoué."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !create.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Facture — {registration.firstName} {registration.lastName}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            {registration.bootcampTitle ?? "Formation"}. Le montant vient de l'inscription acceptée.
          </DialogDescription>
        </DialogHeader>

        {active.length > 0 && (
          <p className="rounded-xl bg-info-bg px-4 py-2.5 text-sm text-navy">
            {active.length === 1 ? "Une facture est déjà en vigueur" : `${active.length} factures sont déjà en vigueur`} pour cette inscription ({active.map((i) => i.number).join(", ")}).{" "}
            <Link to="/admin/factures" className="font-semibold underline">Voir les factures</Link>
          </p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Raison sociale" htmlFor="ci-name"><input id="ci-name" className={inputClass} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} /></Field>
            <Field label="Contact" htmlFor="ci-contact"><input id="ci-contact" className={inputClass} value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} /></Field>
            <Field label="E-mail de facturation" htmlFor="ci-email"><input id="ci-email" type="email" className={inputClass} value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} /></Field>
            <Field label="Réf. bon de commande" htmlFor="ci-po"><input id="ci-po" className={inputClass} value={purchaseOrderRef} onChange={(e) => setPurchaseOrderRef(e.target.value)} /></Field>
            <Field label="Adresse" htmlFor="ci-addr" className="sm:col-span-2"><input id="ci-addr" className={inputClass} value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} /></Field>
            <Field label="Date limite de règlement" htmlFor="ci-due" hint="Vide : première échéance, sinon délai par défaut.">
              <input id="ci-due" type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Mentions complémentaires" htmlFor="ci-notes">
            <textarea id="ci-notes" rows={2} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={create.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="navy" shape="rounded" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : "Émettre la facture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
