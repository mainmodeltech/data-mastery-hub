/**
 * NewsletterToken.tsx — pages ouvertes depuis les e-mails de la newsletter :
 *   /newsletter/confirmation?token=…    → POST /newsletter/subscriptions/confirm
 *   /newsletter/desinscription?token=…  → POST /newsletter/subscriptions/unsubscribe
 * Les deux appels sont idempotents ; un jeton invalide ou expiré renvoie 400.
 */
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button } from "@/components/shared";
import { useConfirmNewsletter, useUnsubscribeNewsletter } from "@/hooks/useSiteForms";
import { submitErrorMessage } from "@/lib/formErrors";

function TokenAction({ mode }: { mode: "confirm" | "unsubscribe" }) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const confirm = useConfirmNewsletter();
  const unsubscribe = useUnsubscribeNewsletter();
  const action = mode === "confirm" ? confirm : unsubscribe;
  const fired = useRef(false);

  useEffect(() => {
    if (!token || fired.current) return;
    fired.current = true;
    action.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const title = mode === "confirm" ? "Confirmation de votre abonnement" : "Désinscription";
  const missing = !token;

  return (
    <SiteLayout>
      <SeoHead title={title} description="Newsletter Model Technologie." path={`/newsletter/${mode === "confirm" ? "confirmation" : "desinscription"}`} noIndex />
      <section className="flex flex-col items-center gap-5 px-6 py-24 text-center">
        {!missing && action.isPending && <Loader2 className="h-8 w-8 animate-spin text-ink-secondary" />}
        {!missing && action.isSuccess && (
          <>
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h1 className="font-heading text-3xl font-extrabold text-navy">
              {mode === "confirm" ? "Abonnement confirmé !" : "Vous êtes désinscrit(e)"}
            </h1>
            <p className="max-w-md text-ink-secondary">
              {mode === "confirm"
                ? "Merci, vous recevrez désormais une astuce data par mois."
                : "Vous ne recevrez plus nos e-mails. Vous pouvez vous réabonner à tout moment depuis la page Ressources."}
            </p>
          </>
        )}
        {(missing || action.isError) && (
          <>
            <XCircle className="h-12 w-12 text-error" />
            <h1 className="font-heading text-3xl font-extrabold text-navy">Lien invalide ou expiré</h1>
            <p className="max-w-md text-ink-secondary">{missing ? "Ce lien est incomplet : ouvrez-le depuis l'e-mail reçu." : submitErrorMessage(action.error)}</p>
          </>
        )}
        <Button asChild variant="outline" shape="pill"><Link to="/ressources">Retour aux ressources</Link></Button>
      </section>
    </SiteLayout>
  );
}

export function NewsletterConfirmation() {
  return <TokenAction mode="confirm" />;
}

export function NewsletterUnsubscribe() {
  return <TokenAction mode="unsubscribe" />;
}
