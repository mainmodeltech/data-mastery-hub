/**
 * Paiement en ligne d'une inscription depuis le lien de paiement : une échéance, ou tout le solde restant d'un coup.
 * Les montants (frais compris) viennent du serveur ; le payeur est redirigé vers la page sécurisée du prestataire, puis revient sur ce lien
 * où le paiement est relu côté serveur avant toute confirmation. Le paiement manuel reste proposé en secours par la page parente.
 */
import { useState } from "react";
import { Info, Loader2, Lock } from "lucide-react";

import { Button, Card } from "@/components/shared";
import { useStartOnlinePayment } from "@/hooks/usePayments";
import { submitErrorMessage } from "@/lib/formErrors";
import { formatAmount, type CheckoutScope, type OnlineAmounts } from "@/types/payment.type";

interface Props {
  token: string;
  currency: string;
  installmentNumber: number;
  installmentCount: number;
  installment?: OnlineAmounts;
  balance?: OnlineAmounts;
  fallbackReason?: string;
}

function Cost({ a, currency }: { a: OnlineAmounts; currency: string }) {
  return (
    <>
      <strong>{formatAmount(a.total, currency)}</strong>
      {a.fee > 0 && <span className="block text-xs font-normal opacity-80">dont {formatAmount(a.fee, currency)} de frais de paiement en ligne</span>}
    </>
  );
}

export function OnlinePaymentCard({ token, currency, installmentNumber, installmentCount, installment, balance, fallbackReason }: Props) {
  const start = useStartOnlinePayment(token);
  const [redirecting, setRedirecting] = useState(false);
  const [scope, setScope] = useState<CheckoutScope | null>(null);

  const pay = (s: CheckoutScope) => {
    setScope(s);
    start.mutate(s, {
      onSuccess: (res) => {
        // Seule une page de paiement en HTTPS est suivie : la réponse du serveur n'est jamais redirigée à l'aveugle.
        const local = import.meta.env.DEV && /^http:\/\/localhost[:/]/.test(res.checkoutUrl);   // faux prestataire des essais locaux
        if (!res.checkoutUrl.startsWith("https://") && !local) return;
        setRedirecting(true);
        window.location.assign(res.checkoutUrl);
      },
    });
  };

  const busy = start.isPending || redirecting;
  const label = (s: CheckoutScope) => (busy && scope === s ? <Loader2 className="animate-spin" /> : <Lock />);

  return (
    <Card radius="callout" className="flex flex-col gap-4 border border-[#E7E0D4] p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-bold text-navy">Payer en ligne</h2>
        <p className="text-sm text-ink-secondary">
          Wave, Orange Money, carte bancaire : paiement sécurisé par PayDunya, confirmation immédiate. Vous ne saisissez aucune donnée bancaire sur notre site.
        </p>
      </div>
      {fallbackReason && (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-surface-sand px-4 py-3 text-sm text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />{fallbackReason}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        {installment && (
          <Button type="button" size="lg" shape="rounded" className="h-auto flex-1 flex-col items-center gap-0.5 py-3" disabled={busy} onClick={() => pay("INSTALLMENT")}>
            <span className="flex items-center gap-2">{label("INSTALLMENT")}{installmentCount > 1 ? `Payer l'échéance ${installmentNumber}` : "Payer maintenant"}</span>
            <Cost a={installment} currency={currency} />
          </Button>
        )}
        {balance && (
          <Button type="button" size="lg" variant="outline" shape="rounded" className="h-auto flex-1 flex-col items-center gap-0.5 py-3" disabled={busy} onClick={() => pay("BALANCE")}>
            <span className="flex items-center gap-2">{label("BALANCE")}Payer tout le solde ({balance.count} échéances)</span>
            <Cost a={balance} currency={currency} />
          </Button>
        )}
      </div>
      {redirecting && <p className="text-sm text-ink-secondary">Redirection vers le paiement…</p>}
      {start.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(start.error)}</p>}
    </Card>
  );
}
