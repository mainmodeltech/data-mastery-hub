/**
 * /coaching/paiement/:token — page de paiement d'un coaching validé (lien personnel envoyé par e-mail ; le jeton est le seul secret).
 * Deux moyens selon les réglages de la Direction : en ligne (le serveur relit le paiement chez le prestataire avant de confirmer) ou manuel
 * (Wave, Orange Money, virement + déclaration, vérifiés par l'équipe). Le manuel sert aussi de secours si l'en ligne est coupé ou en panne.
 */
import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Info, Loader2, Lock, XCircle } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { DocumentLinks } from "@/components/legal/LegalConsent";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card } from "@/components/shared";
import { ManualPaymentView } from "@/components/simulator/ManualPaymentPanel";
import { useAcceptCoachingTerms, useCoachingCheckout, useCoachingPayment, useDeclareCoachingPayment, useStartCoachingOnline, useUploadCoachingProof } from "@/hooks/useCoaching";
import { submitErrorMessage } from "@/lib/formErrors";
import { ApiError } from "@/services/httpClient";
import { formatAmount } from "@/types/payment.type";
import type { CoachingPayView } from "@/types/coaching.type";

const REF = /^[0-9a-fA-F-]{36}$/;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SiteLayout>
      <SeoHead title="Paiement de votre coaching" description="Lien de paiement personnel." path="/coaching/paiement" noIndex />
      <section className="flex min-h-[60vh] items-start justify-center px-6 py-16">
        <Card radius="callout" className="flex w-full max-w-lg flex-col items-center gap-4 p-8 text-center" role="status" aria-live="polite">
          {children}
        </Card>
      </section>
    </SiteLayout>
  );
}

function Problem({ title, text }: { title: string; text: string }) {
  return (
    <>
      <AlertCircle className="h-12 w-12 text-warning" aria-hidden="true" />
      <h1 className="font-heading text-xl font-bold text-navy">{title}</h1>
      <p className="text-sm text-ink-secondary">{text}</p>
      <Button asChild shape="pill"><Link to="/contact">Nous contacter</Link></Button>
    </>
  );
}

/** Retour de la page du prestataire (?checkout=…) : suit la tentative ; le serveur relit le paiement avant de rien confirmer. */
function CheckoutReturn({ token, checkoutRef, cancelled }: { token: string; checkoutRef: string; cancelled: boolean }) {
  const { data, isError } = useCoachingCheckout(token, checkoutRef);
  if (isError || !data || data.status === "PENDING") {
    return (
      <p role="status" className="flex w-full items-start gap-2 rounded-xl bg-info-bg px-4 py-3 text-left text-sm text-navy">
        <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {cancelled
            ? "Vous avez quitté la page de paiement avant la fin. Si vous avez bien été débité, patientez : cette page se met à jour toute seule."
            : "Nous attendons la confirmation de votre paiement. Cette page se met à jour toute seule (Orange Money et Wave peuvent demander une validation sur votre téléphone)."}
        </span>
      </p>
    );
  }
  if (data.status === "PAID") return null;   // l'état « payé » de la page prend le relais
  return (
    <p role="alert" className="flex w-full items-start gap-2 rounded-xl bg-error-bg px-4 py-3 text-left text-sm text-error">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Le paiement n'a pas abouti : aucun montant n'a été validé. Vous pouvez réessayer ci-dessous. Débité malgré tout ? Écrivez-nous avec le justificatif.</span>
    </p>
  );
}

/** Conditions de vente à accepter avant de payer : rien ne s'affiche en dessous tant qu'elles ne le sont pas (le serveur refuse aussi tout paiement). */
function TermsGate({ token, view }: { token: string; view: CoachingPayView }) {
  const accept = useAcceptCoachingTerms(token);
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex w-full flex-col gap-3 rounded-card border border-[#D6CEC0] p-4 text-left">
      <h2 className="font-heading text-lg font-bold text-navy">Avant de payer</h2>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#1A3A5B]" />
        <span>J'ai lu et j'accepte <DocumentLinks documents={view.termsToAccept} />.</span>
      </label>
      {accept.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(accept.error)}</p>}
      <Button type="button" shape="pill" disabled={!checked || accept.isPending} onClick={() => accept.mutate(view.termsToAccept.map((d) => d.id))}>
        {accept.isPending ? <Loader2 className="animate-spin" /> : "Accepter et continuer"}
      </Button>
    </div>
  );
}

function OnlineCard({ token, view }: { token: string; view: CoachingPayView }) {
  const start = useStartCoachingOnline(token);
  const [redirecting, setRedirecting] = useState(false);
  const o = view.options;

  const pay = () => start.mutate(undefined, {
    onSuccess: (res) => {
      // Seule une page de paiement en HTTPS est suivie : la réponse du serveur n'est jamais redirigée à l'aveugle.
      const local = import.meta.env.DEV && /^http:\/\/localhost[:/]/.test(res.checkoutUrl);   // faux prestataire des essais locaux
      if (!res.checkoutUrl.startsWith("https://") && !local) return;
      setRedirecting(true);
      window.location.assign(res.checkoutUrl);
    },
  });
  const busy = start.isPending || redirecting;

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <h2 className="font-heading text-lg font-bold text-navy">Payer en ligne</h2>
      <p className="text-sm text-ink-secondary">Wave, Orange Money, carte bancaire : paiement sécurisé par PayDunya. Vous ne saisissez aucune donnée bancaire sur notre site.</p>
      <Button type="button" size="lg" shape="pill" className="h-auto flex-col gap-0.5 py-3" disabled={busy} onClick={pay}>
        <span className="flex items-center gap-2">{busy ? <Loader2 className="animate-spin" /> : <Lock />}Payer {formatAmount(o.onlineTotalXof)}</span>
        {o.onlineFeeXof > 0 && <span className="text-xs font-normal opacity-80">dont {formatAmount(o.onlineFeeXof)} de frais de paiement en ligne</span>}
      </Button>
      {redirecting && <p className="text-sm text-ink-secondary">Redirection vers le paiement…</p>}
      {start.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(start.error)}</p>}
    </div>
  );
}

export default function CoachingPaiement() {
  const { token } = useParams<{ token: string }>();
  const [search] = useSearchParams();
  const rawCheckout = search.get("checkout");
  const checkoutRef = rawCheckout && REF.test(rawCheckout) ? rawCheckout : null;
  const { data: v, isLoading, error } = useCoachingPayment(token);
  const declare = useDeclareCoachingPayment(token ?? "");
  const upload = useUploadCoachingProof(token ?? "");

  if (isLoading) return <Shell><Loader2 className="h-10 w-10 animate-spin text-navy" aria-hidden="true" /></Shell>;

  if (error || !v || !token) {
    const status = error instanceof ApiError ? error.status : 0;
    return (
      <Shell>
        <Problem
          title={status === 410 ? "Ce lien de paiement a expiré" : status === 404 ? "Lien de paiement introuvable" : "Page momentanément indisponible"}
          text={status === 410 ? "Contactez-nous pour recevoir un nouveau lien." : status === 404
            ? "Vérifiez que vous avez ouvert le lien complet reçu par e-mail." : "Réessayez dans quelques instants ou contactez-nous."}
        />
      </Shell>
    );
  }

  if (v.status === "PAID") {
    return (
      <Shell>
        <CheckCircle2 className="h-14 w-14 text-success" aria-hidden="true" />
        <h1 className="font-heading text-2xl font-bold text-navy">Coaching confirmé : merci !</h1>
        <p className="text-sm text-ink-secondary">
          <strong>{v.offerLabel}</strong> avec {v.trainerName} · {formatAmount(v.amountXof)}. Votre paiement est confirmé : votre formateur vous contacte très
          bientôt pour planifier les séances.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {v.receiptUrl && v.receiptUrl.startsWith("https://") && (
            <Button asChild shape="pill" variant="outline"><a href={v.receiptUrl} target="_blank" rel="noopener noreferrer"><ExternalLink />Mon reçu</a></Button>
          )}
          <Button asChild shape="pill"><Link to="/contact">Nous contacter</Link></Button>
        </div>
      </Shell>
    );
  }

  if (v.status === "CANCELLED" || v.status === "EXPIRED" || v.status === "DECLINED") {
    return <Shell><Problem title="Ce coaching n'est plus à régler" text="La demande a été annulée ou le lien n'est plus valable. Contactez-nous si c'est une erreur." /></Shell>;
  }

  if (v.status === "PAYMENT_DECLARED") {
    return (
      <Shell>
        {checkoutRef && <CheckoutReturn token={token} checkoutRef={checkoutRef} cancelled={search.get("annule") === "1"} />}
        <ManualPaymentView
          title="" amountXof={v.amountXof} subject={`votre coaching « ${v.offerLabel} »`}
          afterVerification="Dès que notre équipe l'a vérifiée, votre coaching est confirmé et votre formateur vous contacte."
          declared declaredMethod={v.declaredMethod} note={null} proofUploaded={v.proofUploaded}
          onDeclare={() => undefined} declarePending={false} declareError={null} onUpload={(f) => upload.mutateAsync(f)}
        />
      </Shell>
    );
  }

  // AWAITING_PAYMENT
  return (
    <Shell>
      {checkoutRef && <CheckoutReturn token={token} checkoutRef={checkoutRef} cancelled={search.get("annule") === "1"} />}
      <h1 className="font-heading text-2xl font-bold text-navy">Bonjour {v.firstName},</h1>
      <p className="text-sm text-ink-secondary">Votre coaching est validé. Le paiement finalise votre réservation.</p>
      <div className="flex w-full flex-col gap-1 rounded-card bg-surface-sand px-4 py-3 text-left text-sm">
        <span><strong>{v.offerLabel}</strong></span>
        <span className="text-ink-secondary">Formateur : {v.trainerName}</span>
        <span className="font-heading text-xl font-extrabold text-navy">{formatAmount(v.amountXof)}</span>
      </div>
      {v.termsToAccept.length > 0 && <TermsGate token={token} view={v} />}
      {v.termsToAccept.length === 0 && v.options.fallback && v.options.reason && (
        <p role="status" className="flex w-full items-start gap-2 rounded-xl bg-surface-sand px-4 py-3 text-left text-sm text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />{v.options.reason}
        </p>
      )}
      {v.termsToAccept.length === 0 && v.options.online && <OnlineCard token={token} view={v} />}
      {v.termsToAccept.length === 0 && v.options.online && v.options.manual && <p className="text-sm font-semibold text-ink">Ou payez par Wave, Orange Money ou virement</p>}
      {v.termsToAccept.length === 0 && v.options.manual && (
        <ManualPaymentView
          headingLevel={2} title="Paiement manuel" amountXof={v.amountXof} subject={`votre coaching « ${v.offerLabel} »`}
          afterVerification="Dès que notre équipe l'a vérifiée, votre coaching est confirmé et votre formateur vous contacte."
          declared={false} declaredMethod={null} note={v.rejectNote} proofUploaded={v.proofUploaded}
          onDeclare={(body) => declare.mutate(body)} declarePending={declare.isPending} declareError={declare.isError ? declare.error : null}
          onUpload={(f) => upload.mutateAsync(f)}
        />
      )}
    </Shell>
  );
}
