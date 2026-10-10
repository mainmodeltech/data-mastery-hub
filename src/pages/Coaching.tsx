/**
 * Coaching.tsx — Lot 2 (docs/design/README.md §2, screens/site/Coaching.dc.html)
 * Textes, formules, tarifs, FAQ et photo viennent du backend (contenu `page.coaching`). Le bouton « Réserver »
 * envoie vers le formulaire de contact (sujet pré-rempli), faute d'un flux de réservation dédié.
 * Un tarif vide s'affiche « Sur devis » ; les créneaux et le témoignage vides sont masqués.
 * La réservation se fait par demande : le créneau ou la formule choisis pré-remplissent le message du formulaire de contact.
 */
import { Link } from "react-router-dom";
import { Check, Linkedin } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader, FaqAccordion, ContentGate } from "@/components/shared";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { PageCoaching, SiteCompany } from "@/types/siteContent";

export default function Coaching() {
  const page = useSiteContent("page.coaching");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.coaching} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <CoachingBody c={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

/** Adresse du formulaire de contact avec le créneau ou la formule choisis (le message est pré-rempli). */
function bookingHref(base: string, key: "creneau" | "formule", value: string): string {
  return `${base}${base.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

function CoachingBody({ c, company }: { c: PageCoaching; company: SiteCompany }) {
  const hasSlots = c.slots.items.length > 0;
  const hasTestimonial = Boolean(c.coach.testimonial.quote);

  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-5">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.hero.eyebrow}</span>
          <h1 className="font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">{c.hero.title}</h1>
          <p className="text-ink-secondary">{c.hero.description}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="primary" shape="pill">
              <Link to={c.hero.primary.href}>{c.hero.primary.label}</Link>
            </Button>
            <Button asChild variant="outline" shape="pill">
              <a href={c.hero.secondary.href}>{c.hero.secondary.label}</a>
            </Button>
          </div>
          <p className="text-xs text-ink-secondary">{c.hero.note}</p>
        </div>

        <div className="flex flex-col gap-4">
          {c.hero.image && (
            <img src={c.hero.image} alt={c.hero.imageAlt} loading="eager" className="aspect-[4/3] w-full rounded-hero object-cover" />
          )}
          {hasSlots && (
            <Card radius="callout" shadow className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-navy">{c.slots.title}</span>
                <Pill variant="info">{c.slots.badge}</Pill>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {c.slots.items.map((s) =>
                  s.available ? (
                    <Link
                      key={`${s.day}-${s.time}`}
                      to={bookingHref(c.slots.bookHref, "creneau", `${s.day} ${s.time}`)}
                      className="rounded-card border border-navy px-3 py-2 text-center text-sm font-medium text-navy hover:bg-navy hover:text-white"
                    >
                      {s.day} {s.time}
                    </Link>
                  ) : (
                    <span
                      key={`${s.day}-${s.time}`}
                      aria-disabled="true"
                      className="rounded-card border border-[#E7E0D4] px-3 py-2 text-center text-sm text-ink-secondary line-through"
                    >
                      {s.day} {s.time}
                    </span>
                  ),
                )}
              </div>
              <div className="flex items-center justify-between border-t border-[#E7E0D4] pt-4 text-xs text-ink-secondary">
                <span>{c.slots.formatNote}</span>
                <span>{c.slots.durationNote}</span>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Pour qui */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.whoFor.eyebrow} title={c.whoFor.title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {c.whoFor.items.map((item) => (
            <Card key={item.title} radius="card" className="p-6">
              <p className="font-heading font-bold text-navy">{item.title}</p>
              <p className="mt-2 text-sm text-ink-secondary">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Formules */}
      <section id="formules" className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.pricing.eyebrow} title={c.pricing.title} />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {c.pricing.tiers.map((tier) => (
            <Card
              key={tier.name}
              radius="callout"
              variant={tier.highlight ? "navy" : "default"}
              shadow={tier.highlight}
              className="flex flex-col gap-4 p-8"
            >
              {tier.highlight && <Pill variant="success">{c.pricing.recommended}</Pill>}
              <div>
                <p className={tier.highlight ? "font-heading text-lg font-bold text-white" : "font-heading text-lg font-bold text-navy"}>
                  {tier.name}
                </p>
                <p className={tier.highlight ? "text-sm text-cta-on-navy" : "text-sm text-ink-secondary"}>{tier.sessions}</p>
              </div>
              <p className={tier.highlight ? "font-heading text-2xl font-extrabold text-white" : "font-heading text-2xl font-extrabold text-navy"}>
                {tier.price || c.pricing.onQuote}
              </p>
              <ul className="flex flex-col gap-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={tier.highlight ? "mt-0.5 h-4 w-4 shrink-0 text-cta-on-navy" : "mt-0.5 h-4 w-4 shrink-0 text-success"} />
                    <span className={tier.highlight ? "text-[#C9D4E0]" : "text-ink-secondary"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={tier.highlight ? "navy" : "outline"}
                shape="pill"
                className={tier.highlight ? "bg-white text-navy hover:bg-white/90" : undefined}
              >
                <Link to={bookingHref(c.slots.bookHref, "formule", tier.name)}>{c.pricing.choose}</Link>
              </Button>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink-secondary">{c.pricing.note}</p>
      </section>

      {/* Déroulé */}
      <section className="bg-surface-sand px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.process.eyebrow} title={c.process.title} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.process.steps.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-card border-t-2 border-cta bg-white p-6">
              <span className="font-heading text-2xl font-extrabold text-cta">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-heading text-base font-bold text-navy">{step.title}</p>
              <p className="text-sm text-ink-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coach + témoignage */}
      <section className={`grid gap-6 px-6 py-14 lg:px-20 ${hasTestimonial ? "lg:grid-cols-2" : "lg:mx-auto lg:max-w-xl"}`}>
        <Card radius="card" className="flex flex-col items-center gap-3 p-8 text-center">
          {c.coach.photoUrl ? (
            <img src={c.coach.photoUrl} alt={c.coach.name} loading="lazy" className="h-20 w-20 rounded-pill object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-pill bg-surface-sand font-heading text-2xl font-extrabold text-navy">
              {c.coach.initials}
            </span>
          )}
          <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">{c.coach.label}</span>
          <p className="font-heading text-lg font-bold text-navy">{c.coach.name}</p>
          <p className="text-sm text-ink-secondary">{c.coach.description}</p>
          <a href={company.social.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-navy hover:text-cta">
            <Linkedin className="h-4 w-4" /> {c.coach.linkedinLabel}
          </a>
        </Card>
        {hasTestimonial && (
          <Card radius="card" variant="sand" className="flex flex-col justify-center gap-4 p-8">
            <p className="font-heading text-lg text-navy">« {c.coach.testimonial.quote} »</p>
            <p className="text-sm font-semibold text-ink-secondary">— {c.coach.testimonial.author}</p>
          </Card>
        )}
      </section>

      {/* FAQ */}
      <section className="px-6 py-14 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[1fr,2fr]">
          <div>
            <SectionHeader eyebrow={c.faq.eyebrow} title={c.faq.title} />
            <Button asChild variant="primary" shape="pill" className="mt-6">
              <Link to={c.faq.cta.href}>{c.faq.cta.label}</Link>
            </Button>
          </div>
          <FaqAccordion items={c.faq.items} />
        </div>
      </section>
    </>
  );
}
