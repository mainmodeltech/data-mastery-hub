/**
 * Paiement.tsx — lien de paiement envoyé au candidat accepté (route publique /paiement/:token).
 * Le jeton est le seul secret : aucune donnée sensible n'est affichée. Le candidat paie par
 * Wave / Orange Money / virement hors du site, puis déclare sa référence (et joint une capture) ;
 * l'équipe vérifie et confirme depuis « Candidatures & paiements ».
 */
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, Copy, FileText, Loader2, Upload } from "lucide-react";

import { SeoHead } from "@/components/SeoHead";
import { Logo } from "@/components/shared/Logo";
import { Button, Card, Pill } from "@/components/shared";
import { useDeclarePayment, useDownloadInvoice, usePaymentLink, useUploadPaymentProof } from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/services/httpClient";
import { useSiteContent } from "@/hooks/useSiteContent";
import { cn } from "@/lib/utils";
import { saveBlob } from "@/lib/download";
import {
  formatAmount, PAYMENT_METHOD_LABELS, type DeclarePaymentPayload, type PaymentMethod, type PaymentStatus,
} from "@/types/payment.type";

const DECLARABLE: DeclarePaymentPayload["method"][] = ["WAVE", "ORANGE_MONEY", "VIREMENT"];
const MAX_PROOF_MB = 5;
const inputClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3 font-sans text-base text-ink outline-none focus:border-navy";

const date = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMMM yyyy", { locale: fr }) : "—");

const SCHEDULE_PILL: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "info" | "neutral" | "error" }> = {
  CONFIRMED: { label: "Payée", variant: "success" },
  DECLARED: { label: "En vérification", variant: "info" },
  PENDING: { label: "À payer", variant: "warning" },
  REJECTED: { label: "Refusée", variant: "error" },
  CANCELLED: { label: "Annulée", variant: "neutral" },
  REFUNDED: { label: "Remboursée", variant: "neutral" },
};

function Frame({ children }: { children: React.ReactNode }) {
  const { content: company } = useSiteContent("site.company");
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-site-bg px-4 py-10">
      <SeoHead title="Règlement de votre inscription" description="Lien de paiement personnel." path="/paiement" noIndex />
      <Link to="/" aria-label="Accueil"><Logo className="h-14" /></Link>
      <div className="w-full max-w-xl">{children}</div>
      {company && (
        <p className="max-w-xl text-center text-xs text-ink-secondary">
          Une question ? <a href={company.whatsappUrl} target="_blank" rel="noreferrer" className="font-semibold text-navy">WhatsApp</a> ou{" "}
          <a href={`mailto:${company.email}`} className="font-semibold text-navy">{company.email}</a>
        </p>
      )}
    </div>
  );
}

function Notice({ tone, title, children }: { tone: "success" | "info" | "error"; title: string; children?: React.ReactNode }) {
  const palette = { success: "bg-success-bg text-success", info: "bg-info-bg text-navy", error: "bg-error-bg text-error" }[tone];
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Clock : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-card px-5 py-4", palette)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <span className="font-bold">{title}</span>
        {children && <span className="text-sm">{children}</span>}
      </div>
    </div>
  );
}

export default function Paiement() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { data: p, isLoading, error } = usePaymentLink(token);
  const declare = useDeclarePayment(token ?? "");
  const upload = useUploadPaymentProof(token ?? "");
  const invoice = useDownloadInvoice(token ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const [method, setMethod] = useState<DeclarePaymentPayload["method"]>("WAVE");
  const [reference, setReference] = useState("");

  if (isLoading) {
    return <Frame><Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" /></Frame>;
  }

  if (error || !p) {
    const status = error instanceof ApiError ? error.status : 0;
    return (
      <Frame>
        <Notice tone="error" title={status === 410 ? "Ce lien de paiement a expiré" : status === 404 ? "Lien de paiement introuvable" : "Page momentanément indisponible"}>
          {status === 410
            ? "Contactez-nous pour recevoir un nouveau lien."
            : status === 404
              ? "Vérifiez que vous avez ouvert le lien complet reçu par e-mail."
              : "Réessayez dans quelques instants ou contactez-nous."}
        </Notice>
      </Frame>
    );
  }

  const methods = (p.payTo.methods?.length ? p.payTo.methods : DECLARABLE).filter((m): m is DeclarePaymentPayload["method"] => DECLARABLE.includes(m as never));
  const phone = p.payTo.phone;
  const awaitingPayment = p.status === "PENDING";

  const submitDeclaration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    try {
      await declare.mutateAsync({ method, reference: reference.trim() });
      toast({ title: "Paiement déclaré", description: "Nous le vérifions et vous confirmons par e-mail." });
    } catch (err) {
      toast({ title: "Déclaration impossible", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const sendProof = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Joignez une image (capture d'écran ou photo)", variant: "destructive" });
    if (file.size > MAX_PROOF_MB * 1024 * 1024) return toast({ title: `Image trop lourde (${MAX_PROOF_MB} Mo max)`, variant: "destructive" });
    try {
      await upload.mutateAsync(file);
      toast({ title: "Justificatif envoyé" });
    } catch (err) {
      toast({ title: "Envoi impossible", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const downloadInvoice = async () => {
    try {
      saveBlob(await invoice.mutateAsync(), "facture.pdf");
    } catch (err) {
      toast({ title: "Facture indisponible", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const copyPhone = async () => {
    if (!phone) return;
    try { await navigator.clipboard.writeText(phone); toast({ title: "Numéro copié" }); } catch { /* ignoré */ }
  };

  return (
    <Frame>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[30px] font-extrabold leading-tight tracking-[-0.5px] text-navy">Bonjour {p.firstName},</h1>
          <p className="text-ink-secondary">
            votre candidature pour <strong className="text-ink">{p.bootcampTitle ?? "la formation"}</strong>
            {p.sessionName ? <> ({p.sessionName})</> : null} est acceptée.
            {p.sessionStartDate && <> Début le {date(p.sessionStartDate)}.</>}
          </p>
        </div>

        {p.status === "CONFIRMED" && (
          <Notice tone="success" title="Paiement confirmé — merci !">
            {p.installmentNumber < p.installmentCount ? "Les échéances suivantes figurent ci-dessous." : "Vous recevrez vos accès par e-mail."}
          </Notice>
        )}
        {p.status === "DECLARED" && (
          <Notice tone="info" title="Paiement déclaré, en cours de vérification">
            {p.method ? PAYMENT_METHOD_LABELS[p.method as PaymentMethod] ?? p.method : "Paiement"}{p.reference ? ` · réf. ${p.reference}` : ""}. Nous vous confirmons par e-mail dès sa vérification.
          </Notice>
        )}
        {p.status === "CANCELLED" && <Notice tone="error" title="Cette échéance a été annulée">Contactez-nous si c'est une erreur.</Notice>}
        {p.status === "REFUNDED" && <Notice tone="info" title="Cette échéance a été remboursée">Contactez-nous pour toute question sur ce remboursement.</Notice>}
        {awaitingPayment && p.rejectionReason && (
          <Notice tone="error" title="Votre précédent paiement n'a pas pu être validé">{p.rejectionReason}</Notice>
        )}

        <Card radius="callout" className="flex flex-col gap-5 border border-[#E7E0D4] p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-ink-secondary">
                {p.installmentCount > 1 ? `Échéance ${p.installmentNumber} sur ${p.installmentCount}` : "Montant à régler"}
              </span>
              <span className="font-heading text-[40px] font-extrabold leading-none text-navy">{formatAmount(p.amount, p.currency)}</span>
            </div>
            {p.dueDate && awaitingPayment && <Pill variant="warning">À régler avant le {date(p.dueDate)}</Pill>}
          </div>

          {p.invoiceAvailable && (
            <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit" disabled={invoice.isPending} onClick={() => void downloadInvoice()}>
              {invoice.isPending ? <Loader2 className="animate-spin" /> : <><FileText />Télécharger la facture</>}
            </Button>
          )}

          {p.schedule.length > 1 && (
            <ul className="flex flex-col divide-y divide-[#E7E0D4] rounded-xl border border-[#E7E0D4]">
              {p.schedule.map((s) => (
                <li key={s.installmentNumber} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className={cn(s.installmentNumber === p.installmentNumber && "font-bold text-navy")}>
                    Échéance {s.installmentNumber}{s.dueDate ? ` · ${date(s.dueDate)}` : ""}
                  </span>
                  <span className="flex items-center gap-3">
                    <strong>{formatAmount(s.amount, p.currency)}</strong>
                    <Pill variant={SCHEDULE_PILL[s.status].variant}>{SCHEDULE_PILL[s.status].label}</Pill>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {awaitingPayment && (
          <Card radius="callout" className="flex flex-col gap-5 border border-[#E7E0D4] p-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-xl font-bold text-navy">1. Effectuez le paiement</h2>
              <p className="text-sm text-ink-secondary">
                Réglez {formatAmount(p.amount, p.currency)} par {methods.map((m) => PAYMENT_METHOD_LABELS[m]).join(", ")}.
              </p>
              {phone && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-info-bg px-4 py-3">
                  <span className="flex flex-col">
                    <span className="text-xs text-ink-secondary">Numéro Wave / Orange Money</span>
                    <span className="font-heading text-lg font-bold text-navy">{phone}</span>
                  </span>
                  <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => void copyPhone()}><Copy />Copier</Button>
                </div>
              )}
              <p className="text-xs text-ink-secondary">Pour un virement bancaire, demandez nos coordonnées à l'équipe.</p>
            </div>

            <form onSubmit={submitDeclaration} className="flex flex-col gap-4">
              <h2 className="font-heading text-xl font-bold text-navy">2. Déclarez votre paiement</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  Moyen utilisé
                  <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value as DeclarePaymentPayload["method"])}>
                    {methods.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  Référence de la transaction *
                  <input className={inputClass} required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="ex. T1234567890" />
                </label>
              </div>
              <Button type="submit" size="lg" shape="rounded" disabled={declare.isPending || !reference.trim()}>
                {declare.isPending ? <Loader2 className="animate-spin" /> : "J'ai payé — déclarer mon paiement"}
              </Button>
            </form>
          </Card>
        )}

        {p.status === "DECLARED" && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-bold text-navy">{p.hasProof ? "Justificatif reçu" : "Ajoutez une capture de votre paiement"}</h2>
              <p className="text-sm text-ink-secondary">
                {p.hasProof ? "Vous pouvez le remplacer si besoin." : "Facultatif, mais cela accélère la vérification."} Image de {MAX_PROOF_MB} Mo maximum.
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Choisir une capture d'écran" onChange={(e) => { void sendProof(e.target.files?.[0]); e.target.value = ""; }} />
            <Button type="button" variant="outline" shape="rounded" className="w-fit" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>
              {upload.isPending ? <Loader2 className="animate-spin" /> : <><Upload />{p.hasProof ? "Remplacer" : "Joindre une image"}</>}
            </Button>
          </Card>
        )}
      </div>
    </Frame>
  );
}
