/**
 * Paiement manuel d'une commande du simulateur (Wave, Orange Money, virement) : consignes, déclaration du paiement (moyen + référence
 * de la transaction) et justificatif facultatif. L'équipe vérifie ensuite ; l'accès ne s'ouvre qu'à sa confirmation.
 * Un refus renvoie la commande « en attente » avec le motif, et l'acheteur peut déclarer de nouveau.
 */
import { useRef, useState } from "react";
import { Clock, Copy, Info, Loader2, Upload } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import { useDeclareOrder, useUploadProof } from "@/hooks/useSimulatorShop";
import { useSiteContent } from "@/hooks/useSiteContent";
import { submitErrorMessage } from "@/lib/formErrors";
import { formatAmount } from "@/types/payment.type";
import { MANUAL_METHOD_LABELS, type ManualMethod, type OrderStatusView } from "@/types/simulatorShop.type";

const MAX_PROOF_MB = 5;
const METHODS = Object.keys(MANUAL_METHOD_LABELS) as ManualMethod[];

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

function ProofUpload({ orderRef, done }: { orderRef: string; done: boolean }) {
  const { toast } = useToast();
  const upload = useUploadProof(orderRef);
  const fileRef = useRef<HTMLInputElement>(null);

  const send = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_PROOF_MB * 1024 * 1024) return toast({ title: `Image trop lourde (${MAX_PROOF_MB} Mo max)`, variant: "destructive" });
    try {
      await upload.mutateAsync(file);
      toast({ title: "Justificatif reçu" });
    } catch (err) {
      toast({ title: "Envoi impossible", description: submitErrorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-card bg-surface-sand px-4 py-3">
      <p className="text-sm text-ink">
        <strong>{done ? "Justificatif reçu." : "Ajoutez une capture de votre paiement."}</strong>{" "}
        {done ? "Vous pouvez le remplacer si besoin." : "Facultatif, mais cela accélère la vérification."} Image de {MAX_PROOF_MB} Mo maximum.
      </p>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Choisir une capture d'écran" onChange={(e) => { void send(e.target.files?.[0]); e.target.value = ""; }} />
      <Button type="button" variant="outline" shape="pill" size="sm" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
        {upload.isPending ? <Loader2 className="animate-spin" /> : <><Upload />{done ? "Remplacer" : "Joindre une image"}</>}
      </Button>
    </div>
  );
}

export function ManualPaymentPanel({ order }: { order: OrderStatusView }) {
  const { toast } = useToast();
  const { content: company } = useSiteContent("site.company");
  const declare = useDeclareOrder(order.ref);
  const [method, setMethod] = useState<ManualMethod>("WAVE");
  const [reference, setReference] = useState("");
  const phone = company?.phone;

  const copyPhone = async () => {
    if (!phone) return;
    try { await navigator.clipboard.writeText(phone); toast({ title: "Numéro copié" }); } catch { /* ignoré */ }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    declare.mutate({ method, reference: reference.trim() });
  };

  if (order.status === "DECLARED") {
    return (
      <>
        <Clock className="h-12 w-12 text-warning" aria-hidden="true" />
        <h1 className="font-heading text-xl font-bold text-navy">Paiement en cours de vérification</h1>
        <p className="text-sm text-ink-secondary">
          Nous avons bien reçu votre déclaration{order.declaredMethod ? ` (${MANUAL_METHOD_LABELS[order.declaredMethod]})` : ""} pour le forfait <strong>{order.planName}</strong>.
          Dès que notre équipe l'a vérifiée, votre accès s'ouvre et vous recevez un e-mail de connexion à <strong>{order.emailHint}</strong>.
          Cette page se met à jour toute seule.
        </p>
        <ProofUpload orderRef={order.ref} done={order.proofUploaded} />
        <Button asChild shape="pill" variant="outline"><Link to="/contact">Nous contacter</Link></Button>
      </>
    );
  }

  return (
    <>
      <h1 className="font-heading text-xl font-bold text-navy">Règlement du forfait {order.planName}</h1>
      <p className="text-sm text-ink-secondary">
        Montant à régler : <strong className="text-ink">{formatAmount(order.chargedXof)}</strong>. Payez par Wave, Orange Money ou virement,
        puis indiquez-nous la référence de la transaction : votre accès s'ouvre dès que nous l'avons vérifiée.
      </p>

      {order.note && (
        <p role="alert" className="flex w-full items-start gap-2 rounded-xl bg-error-bg px-4 py-3 text-left text-sm text-error">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Votre précédente déclaration n'a pas pu être validée : {order.note}</span>
        </p>
      )}

      {phone && (
        <div className="flex w-full items-center justify-between gap-3 rounded-card bg-surface-sand px-4 py-3 text-left">
          <div className="flex flex-col">
            <span className="text-xs text-ink-secondary">Numéro Wave / Orange Money</span>
            <span className="font-heading text-lg font-bold text-navy">{phone}</span>
          </div>
          <Button type="button" variant="outline" shape="pill" size="sm" onClick={() => void copyPhone()}><Copy />Copier</Button>
        </div>
      )}
      <p className="text-xs text-ink-secondary">Pour un virement bancaire, demandez-nous nos coordonnées.</p>

      <form onSubmit={submit} className="flex w-full flex-col gap-3 text-left">
        <select aria-label="Moyen de paiement utilisé" className={inputClass} value={method} onChange={(e) => setMethod(e.target.value as ManualMethod)}>
          {METHODS.map((m) => <option key={m} value={m}>{MANUAL_METHOD_LABELS[m]}</option>)}
        </select>
        <input
          required maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)}
          placeholder="Référence de la transaction" aria-label="Référence de la transaction" className={inputClass}
        />
        {declare.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(declare.error)}</p>}
        <Button type="submit" variant="primary" shape="pill" disabled={declare.isPending || !reference.trim()}>
          {declare.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "J'ai payé : prévenir l'équipe"}
        </Button>
      </form>
      <p className="text-xs text-ink-secondary">Un souci pour payer ? Écrivez-nous sur la page contact : nous vous aidons.</p>
    </>
  );
}
