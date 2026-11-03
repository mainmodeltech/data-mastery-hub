/**
 * Achat d'un forfait : le visiteur laisse son nom et son e-mail (son accès lui y est envoyé), accepte les conditions, puis
 *   - paiement en ligne : il est redirigé vers la page de paiement sécurisée du prestataire ;
 *   - paiement manuel (Wave, Orange Money, virement) : il est dirigé vers la page de suivi, qui lui donne les consignes.
 * Les moyens proposés viennent du serveur (réglages de la Direction, secours automatique si le prestataire est en panne).
 * Le prix affiché vient aussi du serveur, qui le refixe à la commande.
 */
import { useState } from "react";
import { Info, Loader2, Lock, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateOrder } from "@/hooks/useSimulatorShop";
import { submitErrorMessage } from "@/lib/formErrors";
import { splitName } from "@/services/api/siteFormsService";
import { formatAmount } from "@/types/payment.type";
import type { OrderChannel, PlansView, ShopPlan } from "@/types/simulatorShop.type";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

type Options = Pick<PlansView, "online" | "manual" | "fallback" | "fallbackReason">;

export function PurchaseDialog({ plan, options, termsLabel, onClose }: { plan: ShopPlan; options: Options; termsLabel: string; onClose: () => void }) {
  const order = useCreateOrder();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const both = options.online && options.manual;
  const [choice, setChoice] = useState<OrderChannel>("ONLINE");
  // Un seul moyen proposé : c'est lui. Les deux : le choix du client (en ligne par défaut).
  const channel: OrderChannel = both ? choice : options.online ? "ONLINE" : "MANUAL";
  const amount = channel === "ONLINE" ? plan.onlineTotalXof : plan.priceXof;
  const fee = channel === "ONLINE" ? plan.onlineFeeXof : 0;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));
    order.mutate(
      // Le moyen n'est envoyé que si le client a eu le choix : sinon le serveur décide (et bascule en manuel si le prestataire est en panne).
      { plan: plan.code, channel: both ? channel : undefined, firstName, lastName, email: text("email"), phone: text("phone") || undefined, acceptTerms: data.get("terms") === "on" },
      {
        onSuccess: (res) => {
          if (res.channel === "MANUAL" || !res.checkoutUrl) {
            navigate(`/simulateur-pl-300/paiement?ref=${encodeURIComponent(res.orderRef)}`);
            return;
          }
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
            {formatAmount(amount)} · accès {plan.durationDays} jours · {plan.examAttempts} examen{plan.examAttempts > 1 ? "s" : ""} blanc{plan.examAttempts > 1 ? "s" : ""}.
            {fee > 0 && ` Dont ${formatAmount(fee)} de frais de paiement en ligne.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {options.fallback && options.fallbackReason && (
            <p role="status" className="flex items-start gap-2 rounded-xl bg-surface-sand px-4 py-3 text-sm text-ink">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />{options.fallbackReason}
            </p>
          )}
          {both && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">Comment souhaitez-vous payer ?</legend>
              {(["ONLINE", "MANUAL"] as const).map((c) => (
                <label key={c} className="flex cursor-pointer items-start gap-2 rounded-card border border-[#D6CEC0] bg-white px-3 py-2.5 text-sm text-ink has-[:checked]:border-navy">
                  <input type="radio" name="channel" value={c} checked={choice === c} onChange={() => setChoice(c)} className="mt-1 accent-[#1A3A5B]" />
                  <span>
                    <strong>{c === "ONLINE" ? "Payer en ligne" : "Payer par Wave, Orange Money ou virement"}</strong>
                    <span className="block text-xs text-ink-secondary">
                      {c === "ONLINE"
                        ? `Wave, Orange Money, carte bancaire : accès immédiat. ${formatAmount(plan.onlineTotalXof)}.`
                        : `Vous payez de votre côté puis nous indiquez la référence : accès après vérification. ${formatAmount(plan.priceXof)}.`}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}
          <input name="name" required autoFocus placeholder="Nom et prénom" aria-label="Nom et prénom" autoComplete="name" className={inputClass} />
          <input name="email" type="email" required placeholder="E-mail (votre accès vous y est envoyé)" aria-label="E-mail" autoComplete="email" className={inputClass} />
          <input name="phone" type="tel" placeholder="Téléphone / WhatsApp (facultatif)" aria-label="Téléphone" autoComplete="tel" className={inputClass} />
          <label className="flex items-start gap-2 text-sm text-ink">
            <input name="terms" type="checkbox" required className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
            <span>{termsLabel}</span>
          </label>
          {order.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(order.error)}</p>}
          <Button type="submit" variant="primary" shape="pill" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : channel === "ONLINE" ? <Lock className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            {redirecting ? "Redirection vers le paiement…" : channel === "ONLINE" ? `Payer ${formatAmount(amount)}` : "Continuer vers les consignes de paiement"}
          </Button>
          <p className="text-center text-xs text-ink-secondary">
            {channel === "ONLINE"
              ? "Paiement sécurisé par PayDunya. Vous ne saisissez aucune donnée bancaire sur notre site."
              : "Aucun paiement n'est pris sur le site : les consignes s'affichent à l'étape suivante."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
