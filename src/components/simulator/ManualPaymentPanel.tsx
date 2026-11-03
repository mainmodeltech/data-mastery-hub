/**
 * Paiement manuel (Wave, Orange Money, virement) : consignes, déclaration du paiement (moyen + référence de la transaction) et justificatif
 * facultatif. L'équipe vérifie ensuite ; rien ne s'ouvre avant sa confirmation. Un refus renvoie la demande « en attente » avec le motif, et
 * le client peut déclarer de nouveau.
 *
 * {@link ManualPaymentView} est indépendant du service payé (forfait du simulateur, coaching…) ; {@link ManualPaymentPanel} le branche sur une
 * commande du simulateur.
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
import { MANUAL_METHOD_LABELS, type DeclareRequest, type ManualMethod, type OrderStatusView } from "@/types/simulatorShop.type";

const MAX_PROOF_MB = 5;
const METHODS = Object.keys(MANUAL_METHOD_LABELS) as ManualMethod[];

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

function ProofUpload({ done, onUpload }: { done: boolean; onUpload: (file: File) => Promise<unknown> }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  const send = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_PROOF_MB * 1024 * 1024) return toast({ title: `Image trop lourde (${MAX_PROOF_MB} Mo max)`, variant: "destructive" });
    setPending(true);
    try {
      await onUpload(file);
      toast({ title: "Justificatif reçu" });
    } catch (err) {
      toast({ title: "Envoi impossible", description: submitErrorMessage(err), variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-card bg-surface-sand px-4 py-3">
      <p className="text-sm text-ink">
        <strong>{done ? "Justificatif reçu." : "Ajoutez une capture de votre paiement."}</strong>{" "}
        {done ? "Vous pouvez le remplacer si besoin." : "Facultatif, mais cela accélère la vérification."} Image de {MAX_PROOF_MB} Mo maximum.
      </p>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Choisir une capture d'écran" onChange={(e) => { void send(e.target.files?.[0]); e.target.value = ""; }} />
      <Button type="button" variant="outline" shape="pill" size="sm" disabled={pending} onClick={() => fileRef.current?.click()}>
        {pending ? <Loader2 className="animate-spin" /> : <><Upload />{done ? "Remplacer" : "Joindre une image"}</>}
      </Button>
    </div>
  );
}

interface ViewProps {
  /** Titre de l'étape de règlement (ex. « Règlement du forfait Pro »). */
  title: string;
  amountXof: number;
  /** Ce qui est payé, repris dans le message d'attente de vérification (ex. « le forfait Pro »). */
  subject: string;
  /** Phrase indiquant où l'accès ou la confirmation sera envoyé après vérification. */
  afterVerification: string;
  /** Le client a déclaré son paiement : l'équipe vérifie. */
  declared: boolean;
  declaredMethod: ManualMethod | null;
  /** Motif d'un refus précédent de l'équipe. */
  note: string | null;
  proofUploaded: boolean;
  onDeclare: (body: DeclareRequest) => void;
  declarePending: boolean;
  declareError: unknown;
  onUpload: (file: File) => Promise<unknown>;
  /** Niveau du titre : 2 quand la page porte déjà son propre titre principal. */
  headingLevel?: 1 | 2;
}

export function ManualPaymentView(p: ViewProps) {
  const Heading = p.headingLevel === 2 ? "h2" : "h1";
  const { toast } = useToast();
  const { content: company } = useSiteContent("site.company");
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
    p.onDeclare({ method, reference: reference.trim() });
  };

  if (p.declared) {
    return (
      <>
        <Clock className="h-12 w-12 text-warning" aria-hidden="true" />
        <Heading className="font-heading text-xl font-bold text-navy">Paiement en cours de vérification</Heading>
        <p className="text-sm text-ink-secondary">
          Nous avons bien reçu votre déclaration{p.declaredMethod ? ` (${MANUAL_METHOD_LABELS[p.declaredMethod]})` : ""} pour {p.subject}.{" "}
          {p.afterVerification} Cette page se met à jour toute seule.
        </p>
        <ProofUpload done={p.proofUploaded} onUpload={p.onUpload} />
        <Button asChild shape="pill" variant="outline"><Link to="/contact">Nous contacter</Link></Button>
      </>
    );
  }

  return (
    <>
      <Heading className="font-heading text-xl font-bold text-navy">{p.title}</Heading>
      <p className="text-sm text-ink-secondary">
        Montant à régler : <strong className="text-ink">{formatAmount(p.amountXof)}</strong>. Payez par Wave, Orange Money ou virement,
        puis indiquez-nous la référence de la transaction : {p.afterVerification.toLowerCase()}
      </p>

      {p.note && (
        <p role="alert" className="flex w-full items-start gap-2 rounded-xl bg-error-bg px-4 py-3 text-left text-sm text-error">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Votre précédente déclaration n'a pas pu être validée : {p.note}</span>
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
        {p.declareError ? <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(p.declareError)}</p> : null}
        <Button type="submit" variant="primary" shape="pill" disabled={p.declarePending || !reference.trim()}>
          {p.declarePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "J'ai payé : prévenir l'équipe"}
        </Button>
      </form>
      <p className="text-xs text-ink-secondary">Un souci pour payer ? Écrivez-nous sur la page contact : nous vous aidons.</p>
    </>
  );
}

/** Paiement manuel d'une commande du simulateur. */
export function ManualPaymentPanel({ order }: { order: OrderStatusView }) {
  const declare = useDeclareOrder(order.ref);
  const upload = useUploadProof(order.ref);
  return (
    <ManualPaymentView
      title={`Règlement du forfait ${order.planName}`}
      amountXof={order.chargedXof}
      subject={`le forfait ${order.planName}`}
      afterVerification={`Dès que notre équipe l'a vérifiée, votre accès s'ouvre et vous recevez un e-mail de connexion à ${order.emailHint}.`}
      declared={order.status === "DECLARED"}
      declaredMethod={order.declaredMethod}
      note={order.note}
      proofUploaded={order.proofUploaded}
      onDeclare={(body) => declare.mutate(body)}
      declarePending={declare.isPending}
      declareError={declare.isError ? declare.error : null}
      onUpload={(file) => upload.mutateAsync(file)}
    />
  );
}
