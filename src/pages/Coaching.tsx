/**
 * Coaching.tsx — le coaching individuel : tout converge vers la demande (/coaching/demande), choisie par formule ou par créneau. Même langage
 * visuel que l'accueil : les barres montantes ; ici les formules montent avec le nombre de séances (1, 5, 10) et le déroulé monte jusqu'au
 * livrable. Une barre d'appel suit le visiteur sur téléphone ; le bandeau de fin ajoute une voix (WhatsApp, téléphone) pour qui hésite.
 *
 * Textes, formules, tarifs, FAQ et photo viennent du backend (contenu `page.coaching`, modifiable depuis l'administration) ; les libellés
 * d'action de config/coachingPage.ts ; les coordonnées de `site.company`. Un tarif vide s'affiche « Sur devis » ; les créneaux et le
 * témoignage vides sont masqués. Le créneau ou la formule choisis pré-remplissent la demande.
 */
import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";

import { ClosingLayout } from "@/components/formations/ClosingBand";
import { TOP } from "@/components/formations/CohortBars";
import { StickyBar } from "@/components/formations/StickyBar";
import { HeroVideo } from "@/components/home/HeroVideo";
import { HomeFaq } from "@/components/home/HomeFaq";
import { useReveal } from "@/components/home/useReveal";
import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, ContentGate } from "@/components/shared";
import { COACHING_UI as UI } from "@/config/coachingPage";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useStickyHidden } from "@/hooks/useStickyHidden";
import { cn } from "@/lib/utils";
import type { PageCoaching, SiteCompany } from "@/types/siteContent";
import "@/styles/home.css";

const SECTION = "px-5 py-20 lg:px-20 lg:py-24";
const H2 = "font-heading text-[clamp(22px,3.4vw,48px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance max-w-4xl";
const delay = (ms: number) => ({ ["--d" as string]: ms });

/** « VOTRE COACH » (saisi en capitales) → « Votre coach ». */
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

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

/** Les contenus enregistrés avant la demande de coaching pointent encore vers le formulaire de contact : on les redirige ici. */
const LEGACY_BOOKING = /^\/contact\?sujet=coaching/;
const coachingHref = (href: string): string => (LEGACY_BOOKING.test(href) ? "/coaching/demande" : href);

/** Adresse de la demande de coaching avec le créneau ou la formule choisis (le formulaire est pré-rempli). */
function bookingHref(base: string, key: "creneau" | "formule", value: string): string {
  const target = coachingHref(base);
  return `${target}${target.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

const underline = "underline decoration-white/50 underline-offset-4 hover:decoration-white";

function CoachingBody({ c, company }: { c: PageCoaching; company: SiteCompany }) {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const closing = useRef<HTMLElement>(null);
  const hideWhenVisible = useMemo(() => [hero], []);
  const stickyHidden = useStickyHidden(hideWhenVisible, closing);
  useReveal(root);

  const book = coachingHref(c.hero.primary.href);
  const hasSlots = c.slots.items.length > 0;
  const hasTestimonial = Boolean(c.coach.testimonial.quote);
  const tiers = c.pricing.tiers;
  const steps = c.process.steps;

  return (
    <div ref={root}>
      {/* Héros : la promesse, l'action, une personne au travail */}
      <section ref={hero} className="relative isolate overflow-hidden bg-navy-dark text-white">
        <HeroVideo />
        <div className="absolute inset-0 -z-10 bg-navy-dark/75" aria-hidden="true" />

        <div className="grid items-end gap-10 px-5 pb-16 pt-14 lg:grid-cols-12 lg:gap-12 lg:px-20 lg:pb-0 lg:pt-20">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7 lg:pb-24">
            <h1 className="font-heading text-[clamp(32px,3.8vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance">{c.hero.title}</h1>
            <p className="home-hero-in max-w-[60ch] text-lg leading-relaxed text-white/90" style={delay(40)}>{c.hero.description}</p>
            <div className="home-hero-in flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={delay(100)}>
              <Button asChild variant="primary" shape="pill" size="lg" className="home-press">
                <Link to={book}>{c.hero.primary.label}</Link>
              </Button>
              <a href={c.hero.secondary.href} className={cn("home-press inline-flex min-h-11 items-center text-base font-semibold text-white", underline)}>
                {c.hero.secondary.label}
              </a>
            </div>
            <ul className="home-hero-in flex flex-col gap-2 text-base text-white/90" style={delay(160)}>
              {[c.hero.note, hasSlots ? "" : c.slots.formatNote, hasSlots ? "" : c.slots.durationNote].filter(Boolean).map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {c.hero.image && (
            <div className="lg:col-span-5">
              <img
                src={c.hero.image}
                alt={c.hero.imageAlt}
                width={1200}
                height={900}
                loading="eager"
                decoding="async"
                className="home-bar-in aspect-[4/3] w-full rounded-t-[72px] object-cover lg:aspect-[4/5]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Créneaux de la semaine (masqués tant qu'aucun n'est renseigné) */}
      {hasSlots && (
        <section className="bg-surface-sand px-5 py-14 text-navy lg:px-20 lg:py-16">
          <div className="reveal flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <h2 className="font-heading text-[clamp(22px,2.4vw,34px)] font-extrabold leading-[1.1] tracking-[-0.02em]">{c.slots.title}</h2>
            <p className="text-base font-semibold text-cta">{c.slots.badge}</p>
          </div>
          <ul className="mt-6 flex flex-wrap gap-3">
            {c.slots.items.map((s) => (
              <li key={`${s.day}-${s.time}`}>
                {s.available ? (
                  <Link
                    to={bookingHref(c.slots.bookHref, "creneau", `${s.day} ${s.time}`)}
                    className="home-press inline-flex min-h-11 items-center rounded-full bg-navy px-5 text-base font-semibold text-white hover:bg-cta"
                  >
                    {s.day} {s.time}
                  </Link>
                ) : (
                  <span aria-disabled="true" className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-base text-ink-secondary line-through">
                    {s.day} {s.time}<span className="sr-only"> ({UI.slotFull})</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base text-ink-secondary">{[c.slots.formatNote, c.slots.durationNote].filter(Boolean).join(" · ")}</p>
        </section>
      )}

      {/* Pour qui */}
      {c.whoFor.items.length > 0 && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.whoFor.title}</h2>
          <ul className="mt-10 grid gap-3 lg:grid-cols-3 lg:gap-4">
            {c.whoFor.items.map((item, i) => (
              <li key={item.title} className={cn(TOP, "reveal bg-surface-sand p-6 pt-12 lg:p-8 lg:pt-14")} style={delay(i * 80)}>
                <h3 className="font-heading text-xl font-bold">{item.title}</h3>
                <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-ink-secondary">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Formules : elles montent avec le nombre de séances */}
      {tiers.length > 0 && (
        <section id="formules" className={cn(SECTION, "scroll-mt-20 bg-surface-sand pt-16 text-navy lg:pt-20")}>
          <h2 className={cn(H2, "reveal")}>{c.pricing.title}</h2>
          <ul className="mt-12 grid gap-4 lg:grid-cols-3 lg:items-end lg:gap-6">
            {tiers.map((tier, i) => (
              <li
                key={tier.name}
                style={{ ["--i" as string]: i, ...delay(i * 90) }}
                className={cn(
                  TOP,
                  "reveal flex flex-col gap-5 p-6 pt-14 lg:p-8 lg:pt-16 lg:min-h-[calc(480px+var(--i)*48px)]",
                  tier.highlight ? "bg-navy text-white" : "bg-white",
                )}
              >
                {tier.highlight && <p><span className="rounded-full bg-cta px-3 py-1 text-sm font-bold text-white">{sentence(c.pricing.recommended)}</span></p>}
                <div>
                  <h3 className="font-heading text-2xl font-extrabold leading-tight">{tier.name}</h3>
                  <p className={cn("mt-1 text-base font-semibold", tier.highlight ? "text-cta-on-navy" : "text-ink-secondary")}>{tier.sessions}</p>
                </div>
                <p className={cn("font-heading font-extrabold leading-none", tier.price ? "text-[40px]" : "text-2xl")}>{tier.price || c.pricing.onQuote}</p>
                <ul className="flex flex-col gap-2">
                  {tier.features.map((f) => (
                    <li key={f} className={cn("flex items-start gap-3 text-base", tier.highlight ? "text-white/90" : "text-ink-secondary")}>
                      <span className={cn("mt-1.5 h-4 w-2 shrink-0 rounded-t-full", tier.highlight ? "bg-cta-on-navy" : "bg-cta")} aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={tier.highlight ? "primary" : "navy"} shape="pill" size="lg" className="home-press mt-auto w-fit">
                  <Link to={bookingHref(c.slots.bookHref, "formule", tier.name)}>{c.pricing.choose}</Link>
                </Button>
              </li>
            ))}
          </ul>
          <p className="reveal mt-8 max-w-3xl text-base text-ink-secondary">{c.pricing.note}</p>
        </section>
      )}

      {/* Déroulé : l'appel offert est la porte d'entrée */}
      {steps.length > 0 && (
        <section className={cn(SECTION, "bg-navy-dark text-white")}>
          <h2 className={cn(H2, "reveal")}>{c.process.title}</h2>
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end lg:gap-4">
            {steps.map((step, i) => (
              <li
                key={step.title}
                style={{ ["--i" as string]: i, ...delay(i * 90) }}
                className={cn(TOP, "reveal flex flex-col gap-3 p-6 pt-12 lg:min-h-[calc(240px+var(--i)*56px)]", i === 0 ? "bg-cta" : "bg-navy-medium")}
              >
                <span className="font-heading text-[40px] font-extrabold leading-none">{i + 1}</span>
                <p className="font-heading text-xl font-bold">{step.title}</p>
                <p className="text-base leading-relaxed text-white/90">{step.description}</p>
              </li>
            ))}
          </ol>
          <Button asChild variant="primary" shape="pill" size="lg" className="home-press reveal mt-10">
            <Link to={book}>{c.hero.primary.label}</Link>
          </Button>
        </section>
      )}

      {/* Le coach, et une personne au travail */}
      <section className={cn(SECTION, "text-navy")}>
        <div className="grid items-end gap-4 lg:grid-cols-12 lg:gap-6">
          <div className={cn(TOP, "reveal flex flex-col gap-4 bg-surface-sand p-6 pt-14 lg:col-span-6 lg:p-8 lg:pt-16")}>
            {c.coach.photoUrl ? (
              <img src={c.coach.photoUrl} alt={c.coach.name} width={80} height={80} loading="lazy" decoding="async" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy font-heading text-2xl font-extrabold text-white" aria-hidden="true">{c.coach.initials}</span>
            )}
            <div>
              <h2 className="font-heading text-2xl font-extrabold leading-tight">{c.coach.name}</h2>
              <p className="mt-1 text-base font-semibold text-ink-secondary">{sentence(c.coach.label)}</p>
            </div>
            <p className="max-w-[60ch] text-base leading-relaxed text-ink-secondary">{c.coach.description}</p>
            {company.social.linkedin && (
              <a href={company.social.linkedin} target="_blank" rel="noreferrer" className="home-press inline-flex min-h-11 w-fit items-center gap-2 text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">
                <Linkedin className="h-4 w-4" aria-hidden="true" /> {c.coach.linkedinLabel}
              </a>
            )}
          </div>
          <img
            src="/images/photos/picture-1.jpg"
            alt="Une analyste construisant un tableau de bord"
            width={1200}
            height={800}
            loading="lazy"
            decoding="async"
            style={delay(90)}
            className="reveal aspect-[4/3] w-full rounded-t-[72px] object-cover lg:col-span-6"
          />
        </div>
        {hasTestimonial && (
          <figure className={cn(TOP, "reveal mt-4 flex flex-col gap-3 bg-navy p-6 pt-14 text-white lg:mt-6 lg:p-8 lg:pt-16")}>
            <blockquote className="max-w-[50ch] font-heading text-[clamp(20px,2vw,28px)] font-bold leading-snug">« {c.coach.testimonial.quote} »</blockquote>
            <figcaption className="text-base text-white/85">{c.coach.testimonial.author}</figcaption>
          </figure>
        )}
      </section>

      {/* Questions */}
      {c.faq.items.length > 0 && (
        <section className={cn(SECTION, "pt-0 text-navy lg:pt-0")}>
          <h2 className={cn(H2, "reveal")}>{c.faq.title}</h2>
          <div className="reveal mt-10 max-w-4xl"><HomeFaq items={c.faq.items} /></div>
        </section>
      )}

      {/* Dernier appel : la demande, ou une voix */}
      <ClosingLayout
        ref={closing}
        title={UI.closingTitle}
        actions={
          <>
            <Button asChild variant="navy" shape="pill" size="lg" className="home-press">
              <Link to={coachingHref(c.faq.cta.href)}>{c.faq.cta.label}</Link>
            </Button>
            {company.whatsappUrl && (
              <a href={company.whatsappUrl} target="_blank" rel="noopener noreferrer" className={cn("home-press inline-flex min-h-11 items-center text-base font-semibold text-white", underline)}>
                {UI.closing.whatsapp}
              </a>
            )}
            {company.phoneRaw && (
              <a href={`tel:${company.phoneRaw}`} className={cn("home-press inline-flex min-h-11 items-center text-base font-semibold text-white", underline)}>
                {UI.closing.call} {company.phone}
              </a>
            )}
          </>
        }
      />

      <StickyBar hidden={stickyHidden}>
        <p className="min-w-0 flex-1 truncate font-heading text-base font-bold">{c.hero.note || c.hero.title}</p>
        <Button asChild variant="primary" shape="pill" className="home-press shrink-0">
          <Link to={book}>{UI.reserve}</Link>
        </Button>
      </StickyBar>
    </div>
  );
}
