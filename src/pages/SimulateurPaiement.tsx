/**
 * /simulateur-pl-300/paiement?ref=… — retour du paiement d'un forfait. La page ne décide de rien : elle interroge le serveur, qui
 * relit l'état du paiement auprès du prestataire (toutes les 3 secondes tant qu'il est en attente) et n'ouvre l'accès qu'une fois
 * le paiement confirmé. La référence est opaque : elle seule permet de suivre la commande, sans compte.
 */
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Loader2, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card } from "@/components/shared";
import { useOrderStatus } from "@/hooks/useSimulatorShop";
import { formatAmount } from "@/types/payment.type";

const REF = /^[0-9a-fA-F-]{36}$/;

export default function SimulateurPaiement() {
  const [params] = useSearchParams();
  const raw = params.get("ref");
  const ref = raw && REF.test(raw) ? raw : null;
  const cancelledByUser = params.get("annule") === "1";
  const { data, isLoading, isError, isFetching } = useOrderStatus(ref);

  return (
    <SiteLayout>
      <SeoHead title="Paiement du simulateur PL-300" description="Suivi de votre paiement." path="/simulateur-pl-300/paiement" noIndex />
      <section className="flex min-h-[60vh] items-center justify-center px-6 py-16">
        <Card radius="callout" className="flex w-full max-w-lg flex-col items-center gap-4 p-8 text-center" role="status" aria-live="polite">
          {!ref && (
            <>
              <AlertCircle className="h-12 w-12 text-warning" aria-hidden="true" />
              <h1 className="font-heading text-xl font-bold text-navy">Lien de paiement invalide</h1>
              <p className="text-sm text-ink-secondary">Ce lien est incomplet. Retrouvez les forfaits sur la page du simulateur.</p>
              <Button asChild shape="pill"><Link to="/simulateur-pl-300#forfaits">Voir les forfaits</Link></Button>
            </>
          )}

          {ref && (isLoading || (!data && !isError)) && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-navy" aria-hidden="true" />
              <p className="text-sm text-ink-secondary">Vérification de votre paiement…</p>
            </>
          )}

          {ref && isError && (
            <>
              <AlertCircle className="h-12 w-12 text-warning" aria-hidden="true" />
              <h1 className="font-heading text-xl font-bold text-navy">Commande introuvable</h1>
              <p className="text-sm text-ink-secondary">Nous ne retrouvons pas cette commande. Si vous avez été débité, écrivez-nous avec le justificatif de paiement.</p>
              <Button asChild shape="pill"><Link to="/contact">Nous contacter</Link></Button>
            </>
          )}

          {data?.status === "PAID" && (
            <>
              <CheckCircle2 className="h-14 w-14 text-success" aria-hidden="true" />
              <h1 className="font-heading text-2xl font-bold text-navy">Paiement confirmé</h1>
              <p className="text-sm text-ink-secondary">
                Forfait <strong>{data.planName}</strong> · {formatAmount(data.amountXof)}. Votre accès est ouvert.
              </p>
              <p className="rounded-card bg-surface-sand px-4 py-3 text-sm text-ink">
                Un e-mail avec votre <strong>lien de connexion</strong> vient d'être envoyé à <strong>{data.emailHint}</strong>.
                Pensez à regarder vos courriers indésirables.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild shape="pill"><Link to="/connexion">Me connecter</Link></Button>
                {data.receiptUrl && data.receiptUrl.startsWith("https://") && (
                  <Button asChild shape="pill" variant="outline">
                    <a href={data.receiptUrl} target="_blank" rel="noopener noreferrer"><ExternalLink />Mon reçu</a>
                  </Button>
                )}
              </div>
            </>
          )}

          {data?.status === "PENDING" && (
            <>
              <Clock className="h-12 w-12 text-warning" aria-hidden="true" />
              <h1 className="font-heading text-xl font-bold text-navy">{cancelledByUser ? "Paiement non finalisé" : "Paiement en cours de vérification"}</h1>
              <p className="text-sm text-ink-secondary">
                {cancelledByUser
                  ? "Vous avez quitté la page de paiement avant la fin. Si vous avez bien été débité, patientez : cette page se met à jour toute seule."
                  : "Nous attendons la confirmation de votre paiement. Cette page se met à jour toute seule (Orange Money et Wave peuvent demander une validation sur votre téléphone)."}
              </p>
              {isFetching && <Loader2 className="h-4 w-4 animate-spin text-ink-secondary" aria-hidden="true" />}
              <p className="text-xs text-ink-secondary">Débité sans confirmation au bout de quelques minutes ? Écrivez-nous : nous retrouvons votre paiement et ouvrons votre accès.</p>
              <Button asChild shape="pill" variant="outline"><Link to="/contact">Nous contacter</Link></Button>
            </>
          )}

          {data && (data.status === "CANCELLED" || data.status === "FAILED" || data.status === "EXPIRED") && (
            <>
              <XCircle className="h-12 w-12 text-error" aria-hidden="true" />
              <h1 className="font-heading text-xl font-bold text-navy">
                {data.status === "CANCELLED" ? "Paiement annulé" : data.status === "EXPIRED" ? "Commande abandonnée" : "Le paiement n'a pas abouti"}
              </h1>
              <p className="text-sm text-ink-secondary">Aucun accès n'a été ouvert. Vous pouvez recommencer quand vous le souhaitez.</p>
              <Button asChild shape="pill"><Link to="/simulateur-pl-300#forfaits">Choisir un forfait</Link></Button>
            </>
          )}
        </Card>
      </section>
    </SiteLayout>
  );
}
