/**
 * Simulateur.tsx — page d'offre du simulateur de certification PL-300 (lot S0 : liste d'attente).
 *
 * Textes, forfaits, tarifs prévisionnels, FAQ et libellés du formulaire viennent du backend (contenu `page.simulateur`,
 * modifiable depuis « Pages du site »). Aucun paiement n'est pris ici : le formulaire inscrit la personne sur la liste
 * d'attente (POST /simulator/waitlist, visible dans « Messages » côté administration).
 * Un tarif, un badge ou une image vides sont masqués.
 */
import { useState } from "react";
import { Check, CheckCircle, Clock, Loader2 } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, ContentGate, FaqAccordion, Pill, SectionHeader } from "@/components/shared";
import { useSendSimulatorWaitlist } from "@/hooks/useSiteForms";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EXAM_HORIZONS, SIMULATOR_PLANS, splitName, type SimulatorWaitlistPayload } from "@/services/api/siteFormsService";
import { submitErrorMessage } from "@/lib/formErrors";
import { cn } from "@/lib/utils";
import type { PageSimulateur } from "@/types/siteContent";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

export default function Simulateur() {
  const page = useSiteContent("page.simulateur");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.simulateur} />
      <ContentGate content={page.content} isLoading={page.isLoading} isError={page.isError} onRetry={() => page.refetch()}>
        {(c) => <SimulateurBody c={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function SimulateurBody({ c }: { c: PageSimulateur }) {
  const [submitted, setSubmitted] = useState(false);
  const send = useSendSimulatorWaitlist();
  const w = c.waitlist;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));

    const payload: SimulatorWaitlistPayload = {
      firstName,
      lastName,
      email: text("email"),
      phone: text("phone") || undefined,
      company: text("company") || undefined,
      plan: text("plan") as SimulatorWaitlistPayload["plan"],
      examHorizon: text("examHorizon") as SimulatorWaitlistPayload["examHorizon"],
      context: text("context") || undefined,
      consent: data.get("consent") === "on",
    };
    send.mutate(payload, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-navy px-6 py-20 text-white lg:px-20">
        <div className={cn("grid items-center gap-10", c.hero.image.url && "lg:grid-cols-2")}>
          <div className="flex flex-col gap-5">
            {c.hero.badge && <Pill variant="warning" className="w-fit">{c.hero.badge}</Pill>}
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">{c.hero.eyebrow}</span>
            <h1 className="font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px]">{c.hero.title}</h1>
            <p className="max-w-2xl text-[#C9D4E0]">{c.hero.description}</p>
            <ul className="flex flex-col gap-2">
              {c.hero.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-[#C9D4E0]">
                  <Check className="h-4 w-4 shrink-0 text-cta-on-navy" aria-hidden="true" /> {p}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="primary" shape="pill"><a href={c.hero.primary.href}>{c.hero.primary.label}</a></Button>
              <Button asChild variant="outline" shape="pill" className="border-white text-white hover:bg-white/10">
                <a href={c.hero.secondary.href}>{c.hero.secondary.label}</a>
              </Button>
            </div>
          </div>
          {c.hero.image.url && (
            <img src={c.hero.image.url} alt={c.hero.image.alt} loading="eager" className="h-64 w-full rounded-hero object-cover lg:h-80" />
          )}
        </div>
      </section>

      {/* Pour qui */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow={c.audience.eyebrow} title={c.audience.title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.audience.items.map((a) => (
            <Card key={a.title} radius="card" className="flex flex-col gap-2 p-6">
              <h3 className="font-heading text-base font-bold text-navy">{a.title}</h3>
              <p className="text-sm text-ink-secondary">{a.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Couverture de l'examen */}
      <section id="contenu" className="bg-surface-sand px-6 py-16 lg:px-20">
        <SectionHeader eyebrow={c.coverage.eyebrow} title={c.coverage.title} description={c.coverage.intro} />
        <p className="mt-4"><Pill variant="info">{c.coverage.version}</Pill></p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {c.coverage.domains.map((d) => (
            <Card key={d.name} radius="card" className="flex flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-lg font-bold text-navy">{d.name}</h3>
                <Pill variant="success">{d.weight}</Pill>
              </div>
              <ul className="flex flex-col gap-1.5">
                {d.topics.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow={c.features.eyebrow} title={c.features.title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.features.items.map((f) => (
            <Card key={f.title} radius="card" className="flex flex-col gap-2 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-base font-bold text-navy">{f.title}</h3>
                {f.status && <Pill variant="neutral"><Clock className="mr-1 inline h-3 w-3" aria-hidden="true" />{f.status}</Pill>}
              </div>
              <p className="text-sm text-ink-secondary">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Forfaits */}
      <section className="bg-surface-sand px-6 py-16 lg:px-20">
        <SectionHeader eyebrow={c.plans.eyebrow} title={c.plans.title} description={c.plans.note} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.plans.items.map((p) => (
            <Card key={p.code} radius="card" className={cn("flex flex-col gap-4 p-6", p.highlighted && "border-2 border-navy")}>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-navy">{p.name}</h3>
                  {p.badge && <Pill variant="warning">{p.badge}</Pill>}
                </div>
                {p.price && <p className="font-heading text-2xl font-extrabold text-ink">{p.price}</p>}
                <p className="text-xs text-ink-secondary">{p.duration}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Étapes */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow={c.steps.eyebrow} title={c.steps.title} />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.items.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-navy font-heading text-sm font-bold text-white">{i + 1}</span>
              <h3 className="font-heading text-base font-bold text-navy">{s.title}</h3>
              <p className="text-sm text-ink-secondary">{s.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Liste d'attente */}
      <section id="liste-attente" className="grid gap-10 bg-surface-sand px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-4">
          <SectionHeader eyebrow={w.eyebrow} title={w.title} />
          <ul className="flex flex-col gap-2">
            {w.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-ink-secondary">
                <Check className="h-4 w-4 text-success" aria-hidden="true" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <Card radius="card" className="self-start p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
              <CheckCircle className="h-12 w-12 text-success" aria-hidden="true" />
              <p className="font-heading text-lg font-bold text-navy">{w.successTitle}</p>
              <p className="text-sm text-ink-secondary">{w.successText}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder={w.namePlaceholder} className={inputClass} aria-label="Nom et prénom" autoComplete="name" />
                <input name="email" type="email" required placeholder={w.emailPlaceholder} className={inputClass} aria-label="E-mail" autoComplete="email" />
                <input name="phone" type="tel" placeholder={w.phonePlaceholder} className={inputClass} aria-label="Téléphone / WhatsApp" autoComplete="tel" />
                <input name="company" placeholder={w.companyPlaceholder} className={inputClass} aria-label="Entreprise ou école" />
              </div>
              <select name="plan" required defaultValue="" className={inputClass} aria-label="Forfait qui vous intéresse">
                <option value="" disabled>{w.planPlaceholder}</option>
                {SIMULATOR_PLANS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
              <select name="examHorizon" required defaultValue="" className={inputClass} aria-label="Date d'examen envisagée">
                <option value="" disabled>{w.horizonPlaceholder}</option>
                {EXAM_HORIZONS.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
              <textarea name="context" rows={3} maxLength={2000} placeholder={w.contextPlaceholder} className={inputClass} aria-label="Votre niveau et vos outils" />
              <label className="flex items-start gap-2 text-sm text-ink">
                <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
                <span>{w.consentLabel}</span>
              </label>
              {send.isError && (
                <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(send.error)}</p>
              )}
              <Button type="submit" variant="primary" shape="pill" disabled={send.isPending}>
                {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : w.submitLabel}
              </Button>
              <p className="text-center text-xs text-ink-secondary">{w.note}</p>
            </form>
          )}
        </Card>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow={c.faq.eyebrow} title={c.faq.title} />
        <div className="mt-8"><FaqAccordion items={c.faq.items} /></div>
      </section>

      {/* Mentions */}
      <section className="px-6 pb-16 lg:px-20">
        <p className="text-xs leading-relaxed text-ink-secondary">{c.disclaimer}</p>
      </section>
    </>
  );
}
