/**
 * DiagnosticForm — la demande de diagnostic gratuit, seul acte de conversion de la page Entreprises. Posé dans le haut de page : un décideur
 * qui arrive avec un besoin n'a pas à chercher le formulaire. Champs étiquetés en permanence (pas de placeholder seul), saisie assistée par le
 * navigateur (autoComplete), besoin préchoisi quand le visiteur vient d'une offre. Envoi par `useSendDiagnostic` (endpoint dédié du backend).
 */
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

import { TOP } from "@/components/formations/CohortBars";
import { Button } from "@/components/shared";
import { ENTREPRISES_UI as UI } from "@/config/entreprisesPage";
import { useSendDiagnostic } from "@/hooks/useSiteForms";
import { submitErrorMessage } from "@/lib/formErrors";
import { cn } from "@/lib/utils";
import { PEOPLE_COUNTS, TRAINING_NEEDS, splitName, type DiagnosticRequestPayload } from "@/services/api/siteFormsService";
import type { PageEntreprises } from "@/types/siteContent";

type Need = DiagnosticRequestPayload["need"];

const field =
  "min-h-11 w-full rounded-xl bg-white px-4 text-base text-navy placeholder:text-ink-secondary/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
const label = "flex flex-col gap-1.5 text-sm font-semibold text-navy";

interface Props {
  d: PageEntreprises["diagnostic"];
  /** Besoin à présélectionner (venant d'une offre). */
  need: Need | "";
  onNeedChange: (need: Need | "") => void;
  className?: string;
}

export function DiagnosticForm({ d, need, onNeedChange, className }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const send = useSendDiagnostic();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));

    const payload: DiagnosticRequestPayload = {
      firstName,
      lastName,
      email: text("email"),
      phone: text("phone") || undefined,
      company: text("company"),
      role: text("role"),
      peopleCount: text("peopleCount") as DiagnosticRequestPayload["peopleCount"],
      need: text("need") as Need,
      context: text("context") || undefined,
    };
    send.mutate(payload, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <div id="diagnostic" className={cn(TOP, "scroll-mt-24 bg-surface-sand p-6 pt-14 text-navy lg:p-8 lg:pt-16", className)}>
      {submitted ? (
        <div role="status" className="flex flex-col items-start gap-3 py-6">
          <CheckCircle className="h-10 w-10 text-success" aria-hidden="true" />
          <h2 className="font-heading text-2xl font-extrabold">{d.successTitle}</h2>
          <p className="max-w-[50ch] text-base leading-relaxed text-ink-secondary">{d.successText}</p>
        </div>
      ) : (
        <>
          <h2 className="font-heading text-2xl font-extrabold">{d.title}</h2>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                {UI.form.name} *
                <input name="name" required autoComplete="name" placeholder={d.namePlaceholder} className={field} />
              </label>
              <label className={label}>
                {UI.form.role} *
                <input name="role" required autoComplete="organization-title" placeholder={d.rolePlaceholder} className={field} />
              </label>
              <label className={label}>
                {UI.form.company} *
                <input name="company" required autoComplete="organization" placeholder={d.companyPlaceholder} className={field} />
              </label>
              <label className={label}>
                {UI.form.people} *
                <select name="peopleCount" required defaultValue="" className={field}>
                  <option value="" disabled>{d.peoplePlaceholder}</option>
                  {PEOPLE_COUNTS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                </select>
              </label>
              <label className={label}>
                {UI.form.email} *
                <input name="email" type="email" required autoComplete="email" placeholder={d.emailPlaceholder} className={field} />
              </label>
              <label className={label}>
                <span>{UI.form.phone} <span className="font-normal text-ink-secondary">({UI.form.optional})</span></span>
                <input name="phone" type="tel" autoComplete="tel" placeholder={d.phonePlaceholder} className={field} />
              </label>
            </div>
            <label className={label}>
              {UI.form.need} *
              <select name="need" required value={need} onChange={(e) => onNeedChange(e.target.value as Need | "")} className={field}>
                <option value="" disabled>{d.needPlaceholder}</option>
                {TRAINING_NEEDS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </label>
            <label className={label}>
              <span>{UI.form.context} <span className="font-normal text-ink-secondary">({UI.form.optional})</span></span>
              <textarea name="context" rows={3} placeholder={d.contextPlaceholder} className={cn(field, "min-h-24 py-3")} />
            </label>

            {send.isError && (
              <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">{submitErrorMessage(send.error)}</p>
            )}
            <Button type="submit" variant="primary" shape="pill" size="lg" disabled={send.isPending} className="home-press w-full">
              {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : d.submitLabel}
            </Button>
            <p className="text-sm text-ink-secondary">
              {d.note} <span className="whitespace-nowrap">{UI.form.requiredNote}</span>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
