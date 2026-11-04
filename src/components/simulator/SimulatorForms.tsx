/**
 * SimulatorForms — les deux formulaires publics du simulateur : l'essai gratuit (posé dans le haut de page, il capte le visiteur avec un test
 * de 15 minutes) et la liste d'attente (pour qui n'achète pas encore). Champs étiquetés en permanence (pas de placeholder seul), saisie assistée
 * par le navigateur ; envoi par les mêmes hooks et mêmes charges utiles qu'avant (`useSendSimulatorTrial`, `useSendSimulatorWaitlist`).
 */
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

import { TOP } from "@/components/formations/CohortBars";
import { Button } from "@/components/shared";
import { SIMULATEUR_UI as UI } from "@/config/simulateurPage";
import { useSendSimulatorTrial, useSendSimulatorWaitlist } from "@/hooks/useSiteForms";
import { submitErrorMessage } from "@/lib/formErrors";
import { cn } from "@/lib/utils";
import { EXAM_HORIZONS, SIMULATOR_PLANS, splitName, type SimulatorTrialPayload, type SimulatorWaitlistPayload } from "@/services/api/siteFormsService";
import type { PageSimulateur } from "@/types/siteContent";

const field =
  "min-h-11 w-full rounded-xl bg-white px-4 text-base text-navy placeholder:text-ink-secondary/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
const label = "flex flex-col gap-1.5 text-sm font-semibold text-navy";
const optional = <span className="font-normal text-ink-secondary">({UI.optional})</span>;
const consent = "flex items-start gap-3 text-base text-navy";

type Trial = NonNullable<PageSimulateur["trial"]>;

export function TrialForm({ t, className }: { t: Trial; className?: string }) {
  const [sent, setSent] = useState(false);
  const send = useSendSimulatorTrial();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));
    const payload: SimulatorTrialPayload = { firstName, lastName, email: text("email"), phone: text("phone") || undefined, consent: data.get("consent") === "on" };
    send.mutate(payload, { onSuccess: () => setSent(true) });
  };

  return (
    <div id="essai" className={cn(TOP, "scroll-mt-24 bg-surface-sand p-6 pt-14 text-navy lg:p-8 lg:pt-16", className)}>
      {sent ? (
        <div role="status" className="flex flex-col items-start gap-3 py-6">
          <CheckCircle className="h-10 w-10 text-success" aria-hidden="true" />
          <h2 className="font-heading text-2xl font-extrabold">{t.successTitle}</h2>
          <p className="max-w-[50ch] text-base leading-relaxed text-ink-secondary">{t.successText}</p>
        </div>
      ) : (
        <>
          <h2 className="font-heading text-2xl font-extrabold leading-tight">{t.title}</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {t.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-base text-ink-secondary">
                <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <label className={label}>
              {UI.trial.name} *
              <input name="name" required autoComplete="name" placeholder={t.namePlaceholder} className={field} />
            </label>
            <label className={label}>
              {UI.trial.email} *
              <input name="email" type="email" required autoComplete="email" placeholder={t.emailPlaceholder} className={field} />
            </label>
            <label className={label}>
              <span>{UI.trial.phone} {optional}</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder={t.phonePlaceholder} className={field} />
            </label>
            <label className={consent}>
              <input name="consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[#1A3A5B]" />
              <span>{t.consentLabel}</span>
            </label>
            {send.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">{submitErrorMessage(send.error)}</p>}
            <Button type="submit" variant="primary" shape="pill" size="lg" disabled={send.isPending} className="home-press w-full">
              {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : t.submitLabel}
            </Button>
            <p className="text-sm text-ink-secondary">{t.note}</p>
          </form>
        </>
      )}
    </div>
  );
}

export function WaitlistForm({ w, className }: { w: PageSimulateur["waitlist"]; className?: string }) {
  const [sent, setSent] = useState(false);
  const send = useSendSimulatorWaitlist();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));
    const payload: SimulatorWaitlistPayload = {
      firstName, lastName, email: text("email"), phone: text("phone") || undefined, company: text("company") || undefined,
      plan: text("plan") as SimulatorWaitlistPayload["plan"], examHorizon: text("examHorizon") as SimulatorWaitlistPayload["examHorizon"],
      context: text("context") || undefined, consent: data.get("consent") === "on",
    };
    send.mutate(payload, { onSuccess: () => setSent(true) });
  };

  return (
    <div className={cn(TOP, "bg-surface-sand p-6 pt-14 text-navy lg:p-8 lg:pt-16", className)}>
      {sent ? (
        <div role="status" className="flex flex-col items-start gap-3 py-6">
          <CheckCircle className="h-10 w-10 text-success" aria-hidden="true" />
          <h2 className="font-heading text-2xl font-extrabold">{w.successTitle}</h2>
          <p className="max-w-[50ch] text-base leading-relaxed text-ink-secondary">{w.successText}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              {UI.waitlist.name} *
              <input name="name" required autoComplete="name" placeholder={w.namePlaceholder} className={field} />
            </label>
            <label className={label}>
              {UI.waitlist.email} *
              <input name="email" type="email" required autoComplete="email" placeholder={w.emailPlaceholder} className={field} />
            </label>
            <label className={label}>
              <span>{UI.waitlist.phone} {optional}</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder={w.phonePlaceholder} className={field} />
            </label>
            <label className={label}>
              <span>{UI.waitlist.company} {optional}</span>
              <input name="company" autoComplete="organization" placeholder={w.companyPlaceholder} className={field} />
            </label>
          </div>
          <label className={label}>
            {UI.waitlist.plan} *
            <select name="plan" required defaultValue="" className={field}>
              <option value="" disabled>{w.planPlaceholder}</option>
              {SIMULATOR_PLANS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </label>
          <label className={label}>
            {UI.waitlist.horizon} *
            <select name="examHorizon" required defaultValue="" className={field}>
              <option value="" disabled>{w.horizonPlaceholder}</option>
              {EXAM_HORIZONS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </label>
          <label className={label}>
            <span>{UI.waitlist.context} {optional}</span>
            <textarea name="context" rows={3} maxLength={2000} placeholder={w.contextPlaceholder} className={cn(field, "min-h-24 py-3")} />
          </label>
          <label className={consent}>
            <input name="consent" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[#1A3A5B]" />
            <span>{w.consentLabel}</span>
          </label>
          {send.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">{submitErrorMessage(send.error)}</p>}
          <Button type="submit" variant="primary" shape="pill" size="lg" disabled={send.isPending} className="home-press w-full">
            {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : w.submitLabel}
          </Button>
          <p className="text-sm text-ink-secondary">{w.note} <span className="whitespace-nowrap">{UI.requiredNote}</span></p>
        </form>
      )}
    </div>
  );
}
