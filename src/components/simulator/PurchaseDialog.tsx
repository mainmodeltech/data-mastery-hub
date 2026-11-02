/**
 * Achat d'un forfait : le visiteur laisse son nom et son e-mail (son accès lui y est envoyé), accepte les conditions, puis est
 * redirigé vers la page de paiement sécurisée du prestataire. Le prix affiché vient du serveur, qui le refixe à la commande.
 */
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateOrder } from "@/hooks/useSimulatorShop";
import { submitErrorMessage } from "@/lib/formErrors";
import { splitName } from "@/services/api/siteFormsService";
import { formatAmount } from "@/types/payment.type";
import type { ShopPlan } from "@/types/simulatorShop.type";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

export function PurchaseDialog({ plan, termsLabel, onClose }: { plan: ShopPlan; termsLabel: string; onClose: () => void }) {
  const order = useCreateOrder();
  const [redirecting, setRedirecting] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));
    order.mutate(
      { plan: plan.code, firstName, lastName, email: text("email"), phone: text("phone") || undefined, acceptTerms: data.get("terms") === "on" },
      {
        onSuccess: (res) => {
          // Seule une page de paiement en HTTPS est suivie : la réponse du serveur n'est jamais redirigée à l'aveugle.
          const local = import.meta.env.DEV && /^http:\/\/localhost[:/]/.test(res.checkoutUrl);   // faux prestataire des essais locaux
          if (!res.checkoutUrl.startsWith("https://") && !local) return;
          setRedirecting(true);
          window.location.assign(res.checkoutUrl);
        },
      },
    );
  };

  const busy = order.isPending || redirecting;
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Forfait {plan.name}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            {formatAmount(plan.priceXof)} · accès {plan.durationDays} jours · {plan.examAttempts} examen{plan.examAttempts > 1 ? "s" : ""} blanc{plan.examAttempts > 1 ? "s" : ""}.
            Wave, Orange Money, carte bancaire…
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="name" required autoFocus placeholder="Nom et prénom" aria-label="Nom et prénom" autoComplete="name" className={inputClass} />
          <input name="email" type="email" required placeholder="E-mail (votre accès vous y est envoyé)" aria-label="E-mail" autoComplete="email" className={inputClass} />
          <input name="phone" type="tel" placeholder="Téléphone / WhatsApp (facultatif)" aria-label="Téléphone" autoComplete="tel" className={inputClass} />
          <label className="flex items-start gap-2 text-sm text-ink">
            <input name="terms" type="checkbox" required className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
            <span>{termsLabel}</span>
          </label>
          {order.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(order.error)}</p>}
          <Button type="submit" variant="primary" shape="pill" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {redirecting ? "Redirection vers le paiement…" : `Payer ${formatAmount(plan.priceXof)}`}
          </Button>
          <p className="text-center text-xs text-ink-secondary">Paiement sécurisé par PayDunya. Vous ne saisissez aucune donnée bancaire sur notre site.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
