/**
 * Entreprises.tsx — la page des équipes et des institutions : tout converge vers une seule action, la demande de diagnostic gratuit. Le
 * formulaire est posé dans le haut de page (un décideur ne doit pas le chercher), chaque offre le préremplit, et une barre d'appel suit le
 * visiteur sur téléphone. Même langage visuel que l'accueil et le catalogue : les barres montantes, ici « avant → après » par service et les
 * étapes de la méthode qui montent.
 *
 * Textes, offres, méthode, étude de cas et photos viennent du backend (contenu `page.entreprises`, modifiable depuis l'administration) ; les
 * libellés de champs de config/entreprisesPage.ts ; les coordonnées de `site.company` ; les entreprises des alumni de `page.home` et les
 * témoignages de l'API. Un bloc sans données (plaquette, étude de cas, témoignages) est masqué.
 */
import { useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";

import { DiagnosticForm } from "@/components/entreprises/DiagnosticForm";
import { ClosingLayout } from "@/components/formations/ClosingBand";
import { TOP } from "@/components/formations/CohortBars";
import { StickyBar } from "@/components/formations/StickyBar";
import { HeroVideo } from "@/components/home/HeroVideo";
import { useReveal } from "@/components/home/useReveal";
import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, ContentGate } from "@/components/shared";
import { ENTREPRISES_UI as UI } from "@/config/entreprisesPage";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useStickyHidden } from "@/hooks/useStickyHidden";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { cn } from "@/lib/utils";
import { TRAINING_NEEDS, type DiagnosticRequestPayload } from "@/services/api/siteFormsService";
import type { PageEntreprises, SiteCompany } from "@/types/siteContent";
import "@/styles/home.css";

const SECTION = "px-5 py-20 lg:px-20 lg:py-24";
const H2 = "font-heading text-[clamp(22px,3.4vw,48px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance max-w-4xl";
const delay = (ms: number) => ({ ["--d" as string]: ms });

/** « NOS ALUMNI TRAVAILLENT CHEZ » (saisi en capitales) → « Nos alumni travaillent chez ». */
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

type Need = DiagnosticRequestPayload["need"];

/** Le besoin du formulaire qui correspond à une offre (même intitulé), pour préremplir le formulaire au clic. */
const needOf = (offerTitle: string): Need | "" =>
  TRAINING_NEEDS.find((n) => n.label.trim().toLowerCase() === offerTitle.trim().toLowerCase())?.code ?? "";

export default function Entreprises() {
  const page = useSiteContent("page.entreprises");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.entreprises} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <EntreprisesBody c={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function EntreprisesBody({ c, company }: { c: PageEntreprises; company: SiteCompany }) {
  const d = c.diagnostic;
  const [need, setNeed] = useState<Need | "">("");
  const { content: home } = useSiteContent("page.home");
  const { data: testimonials = [] } = usePublishedTestimonials();

  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const closing = useRef<HTMLElement>(null);
  const hideWhenVisible = useMemo(() => [hero], []);
  const stickyHidden = useStickyHidden(hideWhenVisible, closing);
  useReveal(root);

  const alumniCompanies = home?.proof.companies ?? [];
  const corporateTestimonials = [...testimonials].filter((t) => t.company).sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 3);
  const showReference = c.reference.enabled && Boolean(c.reference.name);
  const photos = [
    { url: c.hero.image.url, alt: c.hero.image.alt },
    { url: d.image, alt: d.imageAlt },
  ].filter((p) => p.url);
  const steps = c.method.steps;

  return (
    <div ref={root}>
      {/* Héros : la promesse et le formulaire, côte à côte */}
      <section ref={hero} className="relative isolate overflow-hidden bg-navy-dark text-white">
        <HeroVideo />
        <div className="absolute inset-0 -z-10 bg-navy-dark/75" aria-hidden="true" />

        <div className="grid items-end gap-10 px-5 pb-16 pt-14 lg:grid-cols-12 lg:gap-12 lg:px-20 lg:pb-0 lg:pt-20">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-6 lg:pb-24">
            <h1 className="font-heading text-[clamp(32px,3.8vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance">{c.hero.title}</h1>
            <p className="home-hero-in max-w-[60ch] text-lg leading-relaxed text-white/90" style={delay(40)}>{c.hero.description}</p>
            <ul className="home-hero-in flex flex-col gap-2 text-base text-white/90" style={delay(100)}>
              {d.points.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="home-hero-in flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={delay(160)}>
              <Button asChild variant="primary" shape="pill" size="lg" className="home-press lg:hidden">
                <a href={c.hero.primary.href}>{c.hero.primary.label}</a>
              </Button>
              {c.hero.brochure.url && (
                <a
                  href={c.hero.brochure.url}
                  target="_blank"
                  rel="noreferrer"
                  className="home-press inline-flex min-h-11 items-center gap-2 text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> {c.hero.brochure.label}
                </a>
              )}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <DiagnosticForm d={d} need={need} onNeedChange={setNeed} className="home-bar-in" />
          </div>
        </div>
      </section>

      {/* Qui nous fait confiance */}
      {(c.sectors.items.length > 0 || alumniCompanies.length > 0) && (
        <section className="flex flex-col gap-8 px-5 py-14 text-navy lg:px-20 lg:py-16">
          {c.sectors.items.length > 0 && (
            <div className="reveal flex flex-col gap-3 lg:flex-row lg:items-baseline lg:gap-8">
              <p className="shrink-0 text-base font-semibold text-ink-secondary">{sentence(c.sectors.label)}</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-2 font-heading text-2xl font-bold">
                {c.sectors.items.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
          {alumniCompanies.length > 0 && (
            <div className="reveal flex flex-col gap-3 lg:flex-row lg:items-baseline lg:gap-8" style={delay(70)}>
              <p className="shrink-0 text-base font-semibold text-ink-secondary">{UI.trust.alumni}</p>
              <ul className="flex flex-wrap gap-x-8 gap-y-2 font-heading text-2xl font-bold">
                {alumniCompanies.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Ce qui change, service par service : avant → après */}
      {c.departments.items.length > 0 && (
        <section className={cn(SECTION, "bg-surface-sand pt-16 text-navy lg:pt-20")}>
          <h2 className={cn(H2, "reveal")}>{c.departments.title}</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {c.departments.items.map((dept, i) => (
              <li key={dept.name} className={cn(TOP, "reveal flex flex-col overflow-hidden")} style={delay(i * 80)}>
                <div className="flex-1 bg-white p-6 pt-12">
                  <p className="font-heading text-xl font-bold">{dept.name}</p>
                  <p className="mt-3 text-base leading-snug text-ink-secondary">
                    <span className="font-semibold text-navy">{c.departments.todayLabel} :</span> {dept.before}
                  </p>
                </div>
                <div className={cn("p-6 text-white", i === 0 ? "bg-cta" : "bg-navy")}>
                  <p className="text-base leading-snug">
                    <span className="font-semibold">{c.departments.afterLabel} :</span> {dept.after}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Offres : chacune préremplit le formulaire */}
      {c.offers.items.length > 0 && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.offers.title}</h2>
          <ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
            {c.offers.items.map((offer, i) => (
              <li key={offer.title} className={cn(TOP, "reveal flex flex-col gap-5 bg-surface-sand p-6 pt-14 lg:p-8 lg:pt-16")} style={delay(i * 90)}>
                <span className="font-heading text-[40px] font-extrabold leading-none text-cta" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-heading text-2xl font-extrabold leading-tight">{offer.title}</h3>
                  <p className="mt-1 text-base font-semibold text-ink-secondary">{offer.tagline}</p>
                </div>
                <p className="max-w-[60ch] text-base leading-relaxed text-ink-secondary">{offer.description}</p>
                <dl className="grid gap-3 text-base">
                  {[
                    [c.offers.specLabels.public, offer.public],
                    [c.offers.specLabels.format, offer.format],
                    [c.offers.specLabels.duration, offer.duration],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-wrap gap-x-3">
                      <dt className="font-semibold">{k}</dt>
                      <dd className="text-ink-secondary">{v}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="flex flex-col gap-2">
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base">
                      <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="navy" shape="pill" size="lg" className="home-press mt-auto w-fit">
                  <a href={c.offers.cta.href} onClick={() => setNeed(needOf(offer.title) || need)}>{c.offers.cta.label}</a>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Des équipes au travail */}
      {photos.length > 0 && (
        <section className="px-5 pb-20 lg:px-20 lg:pb-24">
          <div className="grid items-end gap-4 lg:grid-cols-12 lg:gap-6">
            {photos.map((p, i) => (
              <img
                key={p.url}
                src={p.url}
                alt={p.alt}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                style={delay(i * 90)}
                className={cn(
                  "reveal aspect-[4/3] w-full rounded-t-[72px] object-cover",
                  photos.length > 1 ? (i === 0 ? "lg:col-span-7 lg:aspect-[3/2]" : "lg:col-span-5") : "lg:col-span-12 lg:aspect-[21/9]",
                )}
              />
            ))}
          </div>
        </section>
      )}

      {/* Méthode : les étapes montent, la première est la porte d'entrée gratuite */}
      {steps.length > 0 && (
        <section className={cn(SECTION, "bg-navy-dark text-white")}>
          <h2 className={cn(H2, "reveal")}>{c.method.title}</h2>
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
            <a href="#diagnostic">{UI.methodCta}</a>
          </Button>
        </section>
      )}

      {/* Référence (masquée tant qu'aucune étude de cas n'est renseignée) */}
      {showReference && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.reference.title}</h2>
          <div className={cn(TOP, "reveal mt-10 grid gap-8 bg-surface-sand p-6 pt-14 lg:grid-cols-3 lg:p-8 lg:pt-16")}>
            <div>
              <p className="font-heading text-2xl font-extrabold">{c.reference.name}</p>
              <p className="mt-1 text-base text-ink-secondary">{[c.reference.sector, c.reference.size].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="text-base leading-relaxed">
              <span className="font-semibold">{c.reference.needLabel} :</span> <span className="text-ink-secondary">{c.reference.need}</span>
            </p>
            <p className="text-base leading-relaxed">
              <span className="font-semibold">{c.reference.resultLabel} :</span> <span className="text-ink-secondary">{c.reference.result}</span>
            </p>
          </div>
        </section>
      )}

      {/* Témoignages de professionnels formés */}
      {corporateTestimonials.length > 0 && (
        <section className={cn(SECTION, "bg-surface-sand pt-16 text-navy lg:pt-20")}>
          <h2 className={cn(H2, "reveal")}>{UI.testimonialsTitle}</h2>
          <ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
            {corporateTestimonials.map((t, i) => (
              <li key={t.id} className={cn("reveal flex flex-col gap-4 rounded-2xl p-6 lg:p-8", i === 0 ? "bg-navy text-white" : "bg-white text-navy")} style={delay(i * 90)}>
                <p className="text-lg leading-relaxed">« {t.content} »</p>
                {t.result && <p className={cn("font-heading text-base font-bold", i === 0 ? "text-cta-on-navy" : "text-cta")}>{t.result}</p>}
                <p className={cn("mt-auto text-sm", i === 0 ? "text-white/85" : "text-ink-secondary")}>
                  <span className="font-semibold">{t.name}</span>
                  {t.role ? `, ${t.role}` : ""}{t.company ? ` · ${t.company}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dernier appel : le formulaire, ou une voix */}
      <ClosingLayout
        ref={closing}
        title={UI.closing.title}
        actions={
          <>
            <Button asChild variant="navy" shape="pill" size="lg" className="home-press">
              <a href="#diagnostic">{UI.closing.apply}</a>
            </Button>
            {company.phoneRaw && (
              <a href={`tel:${company.phoneRaw}`} className="home-press inline-flex min-h-11 items-center text-base font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                {UI.closing.call} {company.phone}
              </a>
            )}
            {company.whatsappUrl && (
              <a href={company.whatsappUrl} target="_blank" rel="noopener noreferrer" className="home-press inline-flex min-h-11 items-center text-base font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                {UI.closing.whatsapp}
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="home-press inline-flex min-h-11 items-center text-base font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                {UI.closing.write}
              </a>
            )}
          </>
        }
      />

      <StickyBar hidden={stickyHidden}>
        <p className="min-w-0 flex-1 truncate font-heading text-base font-bold">{d.points.slice(0, 2).join(" · ")}</p>
        <Button asChild variant="primary" shape="pill" className="home-press shrink-0">
          <a href="#diagnostic">{UI.closing.apply}</a>
        </Button>
      </StickyBar>
    </div>
  );
}
