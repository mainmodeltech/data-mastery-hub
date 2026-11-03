/**
 * /coaching/demande — demande de coaching (formulaire public).
 * La demande arrive au responsable pédagogique, qui l'analyse avec le formateur ; une fois le coaching validé, le client reçoit par e-mail
 * un lien de paiement personnel. Aucun paiement n'est demandé ici. La formule et le créneau choisis sur la page Coaching pré-remplissent le
 * formulaire (?formule=…&creneau=…).
 */
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card } from "@/components/shared";
import { useSendCoachingRequest } from "@/hooks/useCoaching";
import { submitErrorMessage } from "@/lib/formErrors";
import { splitName } from "@/services/api/siteFormsService";
import type { CoachingRequestReceipt } from "@/types/coaching.type";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

export default function CoachingDemande() {
  const [params] = useSearchParams();
  const send = useSendCoachingRequest();
  const [receipt, setReceipt] = useState<CoachingRequestReceipt | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));
    send.mutate(
      {
        firstName, lastName, email: text("email"), phone: text("phone") || undefined, company: text("company") || undefined,
        tier: text("tier") || undefined, slot: text("slot") || undefined, message: text("message") || undefined, acceptTerms: data.get("terms") === "on",
      },
      { onSuccess: setReceipt },
    );
  };

  return (
    <SiteLayout>
      <SeoHead title="Demande de coaching" description="Décrivez votre besoin : notre responsable pédagogique revient vers vous avec une proposition." path="/coaching/demande" noIndex />
      <section className="flex min-h-[60vh] items-start justify-center px-6 py-16">
        <Card radius="callout" className="flex w-full max-w-xl flex-col gap-5 p-8">
          {receipt ? (
            <div role="status" className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-14 w-14 text-success" aria-hidden="true" />
              <h1 className="font-heading text-2xl font-bold text-navy">Demande bien reçue</h1>
              <p className="text-sm text-ink-secondary">
                {receipt.message} Vous allez recevoir un e-mail de confirmation (pensez à regarder vos courriers indésirables). Aucun paiement n'est demandé
                à ce stade : un lien de paiement sécurisé vous sera envoyé une fois votre coaching validé.
              </p>
              {receipt.bookingUrl && receipt.bookingUrl.startsWith("https://") && (
                <div className="flex w-full flex-col items-center gap-2 rounded-card bg-surface-sand px-4 py-4">
                  <p className="text-sm text-ink">Pour avancer plus vite, réservez dès maintenant un <strong>échange de présentation de 15 à 20 minutes</strong>.</p>
                  <Button asChild shape="pill"><a href={receipt.bookingUrl} target="_blank" rel="noopener noreferrer">Réserver un échange</a></Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="font-heading text-2xl font-bold text-navy">Demander un coaching</h1>
                <p className="text-sm text-ink-secondary">
                  Décrivez votre besoin. Notre responsable pédagogique étudie votre demande avec le formateur le plus adapté, puis revient vers vous
                  avec une proposition et un lien de paiement. <strong>Aucun paiement n'est demandé maintenant.</strong>
                </p>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <input name="name" required autoFocus placeholder="Nom et prénom" aria-label="Nom et prénom" autoComplete="name" className={inputClass} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="email" type="email" required placeholder="E-mail" aria-label="E-mail" autoComplete="email" className={inputClass} />
                  <input name="phone" type="tel" placeholder="Téléphone / WhatsApp (facultatif)" aria-label="Téléphone" autoComplete="tel" className={inputClass} />
                </div>
                <input name="company" placeholder="Entreprise (facultatif)" aria-label="Entreprise" autoComplete="organization" className={inputClass} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="tier" defaultValue={params.get("formule") ?? ""} placeholder="Formule souhaitée (facultatif)" aria-label="Formule souhaitée" className={inputClass} />
                  <input name="slot" defaultValue={params.get("creneau") ?? ""} placeholder="Créneau souhaité (facultatif)" aria-label="Créneau souhaité" className={inputClass} />
                </div>
                <textarea name="message" rows={4} maxLength={4000} placeholder="Votre objectif, votre niveau, ce que vous voulez accomplir…" aria-label="Votre besoin" className={inputClass} />
                <label className="flex items-start gap-2 text-sm text-ink">
                  <input name="terms" type="checkbox" required className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
                  <span>J'accepte d'être contacté(e) au sujet de ma demande et que mes informations soient utilisées pour la traiter.</span>
                </label>
                {send.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(send.error)}</p>}
                <Button type="submit" variant="primary" shape="pill" disabled={send.isPending}>
                  {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer ma demande"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </section>
    </SiteLayout>
  );
}
