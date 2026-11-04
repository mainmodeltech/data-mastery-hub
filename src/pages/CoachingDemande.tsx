/**
 * /coaching/demande — demande de coaching (formulaire public).
 * La demande arrive au responsable pédagogique, qui l'analyse avec le formateur ; une fois le coaching validé, le client reçoit par e-mail
 * un lien de paiement personnel. Aucun paiement n'est demandé ici. La formule et le créneau choisis sur la page Coaching pré-remplissent le
 * formulaire (?formule=…&creneau=…). Mise en page : même langage que la page Coaching, libellés visibles en permanence.
 */
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { LegalConsent } from "@/components/legal/LegalConsent";
import { TOP } from "@/components/formations/CohortBars";
import { useLegalAcceptedIds } from "@/hooks/useLegal";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button } from "@/components/shared";
import { COACHING_UI as UI } from "@/config/coachingPage";
import { useSendCoachingRequest } from "@/hooks/useCoaching";
import { submitErrorMessage } from "@/lib/formErrors";
import { cn } from "@/lib/utils";
import { splitName } from "@/services/api/siteFormsService";
import type { CoachingRequestReceipt } from "@/types/coaching.type";

const field =
  "min-h-11 w-full rounded-xl bg-white px-4 text-base text-navy placeholder:text-ink-secondary/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
const label = "flex flex-col gap-1.5 text-sm font-semibold text-navy";
const optional = <span className="font-normal text-ink-secondary">({UI.form.optional})</span>;

export default function CoachingDemande() {
  const [params] = useSearchParams();
  const send = useSendCoachingRequest();
  const legalIds = useLegalAcceptedIds("COACHING_REQUEST");
  const [receipt, setReceipt] = useState<CoachingRequestReceipt | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));
    send.mutate(
      {
        firstName, lastName, email: text("email"), phone: text("phone") || undefined, company: text("company") || undefined,
        tier: text("tier") || undefined, slot: text("slot") || undefined, message: text("message") || undefined, acceptTerms: data.get("terms") === "on", acceptedDocuments: legalIds,
      },
      { onSuccess: setReceipt },
    );
  };

  return (
    <SiteLayout>
      <SeoHead title="Demande de coaching" description="Décrivez votre besoin : notre responsable pédagogique revient vers vous avec une proposition." path="/coaching/demande" noIndex />
      <section className="flex min-h-[60vh] items-start justify-center bg-navy-dark px-5 pt-14 lg:px-20 lg:pt-20">
        <div className={cn(TOP, "w-full max-w-2xl bg-surface-sand p-6 pt-14 text-navy lg:p-10 lg:pt-16")}>
          {receipt ? (
            <div role="status" className="flex flex-col items-start gap-4">
              <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
              <h1 className="font-heading text-[clamp(24px,2.8vw,40px)] font-extrabold leading-tight">Demande bien reçue</h1>
              <p className="max-w-[60ch] text-base leading-relaxed text-ink-secondary">
                {receipt.message} Vous allez recevoir un e-mail de confirmation (pensez à regarder vos courriers indésirables). Aucun paiement n'est demandé
                à ce stade : un lien de paiement sécurisé vous sera envoyé une fois votre coaching validé.
              </p>
              {receipt.bookingUrl && receipt.bookingUrl.startsWith("https://") && (
                <div className="flex w-full flex-col items-start gap-3 rounded-2xl bg-white p-5">
                  <p className="text-base">Pour avancer plus vite, réservez dès maintenant un <strong>échange de présentation de 15 à 20 minutes</strong>.</p>
                  <Button asChild shape="pill" size="lg" className="home-press"><a href={receipt.bookingUrl} target="_blank" rel="noopener noreferrer">Réserver un échange</a></Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <h1 className="font-heading text-[clamp(24px,2.8vw,40px)] font-extrabold leading-tight">{UI.form.title}</h1>
              <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-ink-secondary">
                {UI.form.intro} <strong className="text-navy">{UI.form.noPayment}</strong>
              </p>
              <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
                <label className={label}>
                  {UI.form.name} *
                  <input name="name" required autoFocus autoComplete="name" className={field} />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={label}>
                    {UI.form.email} *
                    <input name="email" type="email" required autoComplete="email" className={field} />
                  </label>
                  <label className={label}>
                    {UI.form.phone} {optional}
                    <input name="phone" type="tel" autoComplete="tel" className={field} />
                  </label>
                </div>
                <label className={label}>
                  {UI.form.company} {optional}
                  <input name="company" autoComplete="organization" className={field} />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={label}>
                    {UI.form.tier} {optional}
                    <input name="tier" defaultValue={params.get("formule") ?? ""} className={field} />
                  </label>
                  <label className={label}>
                    {UI.form.slot} {optional}
                    <input name="slot" defaultValue={params.get("creneau") ?? ""} className={field} />
                  </label>
                </div>
                <label className={label}>
                  {UI.form.message}
                  <textarea name="message" rows={4} maxLength={4000} placeholder={UI.form.messagePlaceholder} className={cn(field, "min-h-28 py-3")} />
                </label>
                <LegalConsent
                  context="COACHING_REQUEST" lead="J'ai lu et j'accepte" fallbackLabel="J'accepte d'être contacté(e) au sujet de ma demande et que mes informations soient utilisées pour la traiter."
                />
                {send.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">{submitErrorMessage(send.error)}</p>}
                <Button type="submit" variant="primary" shape="pill" size="lg" disabled={send.isPending} className="home-press w-full">
                  {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : UI.form.submit}
                </Button>
                <p className="text-sm text-ink-secondary">{UI.form.requiredNote}</p>
              </form>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
