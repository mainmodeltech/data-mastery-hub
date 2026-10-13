/**
 * Index.tsx — Accueil (docs/design/README.md §2, screens/site/Main.dc.html)
 *
 * Structure issue de la référence Main.dc.html. Aucun contenu n'est écrit en dur : les textes, images,
 * chiffres clés, FAQ et offres viennent du backend (contenu `page.home`, modifiable depuis l'administration),
 * et les données métier (parcours, prix, durées, prochaine cohorte, témoignages) de l'API. Une section sans
 * données est masquée plutôt qu'affichée avec un texte à compléter.
 */
import { Link } from "react-router-dom";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, FaqAccordion, ContentGate } from "@/components/shared";
import { useAllFormationSessions, useFormations } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { fill } from "@/lib/template";
import { FORMAT_LABELS } from "@/types/formation.type";
import type { PageHome, SiteCompany } from "@/types/siteContent";

const AVATAR_BG = ["bg-navy", "bg-cta", "bg-success"];

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function Index() {
  const page = useSiteContent("page.home");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.home} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <HomeBody c={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function HomeBody({ c, company }: { c: PageHome; company: SiteCompany }) {
  const { data: formations = [] } = useFormations();
  const { data: sessions = [] } = useAllFormationSessions();
  const { data: testimonials = [] } = usePublishedTestimonials();

  const today = new Date().toISOString().slice(0, 10);
  const nextSession =
    sessions.find((x) => x.startDate && x.startDate >= today && (x.status === "OPEN" || x.status === "UPCOMING")) ?? null;
  const nextFormation = nextSession ? formations.find((f) => f.id === nextSession.formationId) ?? null : null;
  const applyTo = nextFormation ? `/formations/${nextFormation.slug}` : "/formations";

  const L = c.cohort.labels;
  const cohortFacts = [
    { label: L.start, value: nextSession?.startDate ? dateFr(nextSession.startDate) : L.startUnknown, mobile: true },
    nextSession?.schedule ? { label: L.rhythm, value: nextSession.schedule, mobile: true } : null,
    nextFormation ? { label: L.format, value: FORMAT_LABELS[nextFormation.format] ?? "—", mobile: false } : null,
    nextFormation?.prerequisites ? { label: L.prerequisites, value: nextFormation.prerequisites, mobile: false } : null,
    nextSession?.price || nextFormation?.price ? { label: L.price, value: (nextSession?.price ?? nextFormation?.price) as string, mobile: true } : null,
    nextSession?.spotsRemaining != null ? { label: L.spots, value: `${nextSession.spotsRemaining} sur ${nextSession.maxParticipants}`, mobile: false } : null,
  ].filter((f): f is { label: string; value: string; mobile: boolean } => f !== null);

  // Parcours mis en avant : d'abord les formations « featured », puis l'ordre d'affichage
  const parcours = [...formations]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder)
    .slice(0, 4);

  const proofStats = [
    c.proof.alumniStat,
    ...(formations.length > 0 ? [{ value: String(formations.length), label: c.proof.formationsLabel }] : []),
    c.proof.projectStat,
  ];

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-7 px-6 pb-14 pt-16 text-center lg:px-40 lg:pt-24">
        <span className="flex items-center gap-2.5 rounded-pill border border-[#E7E0D4] bg-white px-4 py-2 font-sans text-sm text-[#3E4A5C]">
          <span className="h-2 w-2 rounded-pill bg-success" />
          {nextSession ? c.hero.badgeOpen : c.hero.badgeClosed}
        </span>
        {/* Copie mobile dédiée (plus courte, cf. Mobile.dc.html) */}
        <h1 className="max-w-4xl font-heading text-[2.5rem] font-extrabold leading-[1] tracking-[-1.2px] text-navy sm:hidden">
          {c.hero.titleMobile.before} <span className="text-cta">{c.hero.titleMobile.accent}</span>
        </h1>
        <p className="max-w-2xl text-lg text-ink-secondary sm:hidden">{c.hero.subtitleMobile}</p>
        {/* Copie desktop (Main.dc.html) */}
        <h1 className="hidden max-w-4xl font-heading text-[clamp(44px,6vw,84px)] font-extrabold leading-[0.98] tracking-[-2.5px] text-navy sm:block">
          {c.hero.titleDesktop.before} <span className="text-cta">{c.hero.titleDesktop.accent}</span>
        </h1>
        <p className="hidden max-w-2xl text-xl text-ink-secondary sm:block">{c.hero.subtitleDesktop}</p>
        <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          <Button asChild variant="primary" shape="pill" size="lg">
            <a href="#cohorte">{nextSession ? c.hero.primaryOpen : c.hero.primaryClosed}</a>
          </Button>
          <Button asChild variant="outline" shape="pill" size="lg">
            <Link to={c.hero.secondary.href}>{c.hero.secondary.label}</Link>
          </Button>
        </div>
        <Link to={c.hero.quiz.href} className="text-sm text-ink-secondary underline">
          {c.hero.quiz.label}
        </Link>
      </section>

      {/* Visuel + citation */}
      <section className="px-5 pb-16 sm:px-6 lg:pb-24 lg:px-20">
        <div className="relative flex h-[240px] items-end overflow-hidden rounded-hero bg-navy sm:h-[320px] lg:h-[520px]">
          <img
            src={c.visual.image}
            alt={c.visual.imageAlt}
            className="absolute inset-0 h-full w-full object-cover object-[center_65%]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" aria-hidden="true" />
          <Card radius="card" className="relative m-4 flex max-w-xl flex-col gap-2 p-5 sm:m-6 sm:gap-3 sm:p-7">
            <p className="font-heading text-lg font-bold leading-tight text-navy sm:text-2xl">« {c.visual.quote} »</p>
            <p className="text-sm text-ink-secondary">
              {c.visual.author}<span className="hidden sm:inline">{c.visual.authorExtra}</span>
            </p>
          </Card>
        </div>
      </section>

      {/* Bandeau preuve */}
      <section className="px-5 pb-16 sm:px-6 lg:pb-24 lg:px-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden border-y border-[#E7E0D4] bg-[#E7E0D4] sm:grid-cols-3">
          {proofStats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-1.5 bg-site-bg p-5 sm:p-7 ${i >= 2 ? "hidden sm:flex" : ""}`}
            >
              <span className="font-heading text-[2.125rem] font-extrabold text-navy lg:text-[3.25rem]">{s.value}</span>
              <span className="text-sm text-ink-secondary">{s.label}</span>
            </div>
          ))}
        </div>
        {c.proof.companies.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-10 pt-7">
            <span className="text-xs font-semibold uppercase tracking-[1.5px] text-ink-secondary">
              {c.proof.companiesLabel}
            </span>
            {c.proof.companies.map((name) => (
              <span key={name} className="text-lg font-bold text-[#8A93A0]">{name}</span>
            ))}
          </div>
        )}
      </section>

      {/* Cohorte */}
      <section id="cohorte" className="px-6 pb-28 lg:px-20">
        <Card radius="hero" className="grid gap-16 p-8 lg:grid-cols-2 lg:p-16">
          <div className="flex flex-col gap-5">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
              {nextSession ? c.cohort.eyebrowOpen : c.cohort.eyebrowClosed}
            </span>
            <h2 className="font-heading text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.02] tracking-[-1.5px] text-navy">
              {nextSession?.maxParticipants
                ? fill(c.cohort.titleWithPlaces, { places: nextSession.maxParticipants })
                : c.cohort.titleDefault}
            </h2>
            <p className="text-lg text-ink-secondary">{c.cohort.description}</p>
            <div className="flex flex-wrap gap-3.5">
              <Button asChild variant="primary" shape="pill" size="lg" className="w-full sm:w-auto">
                <Link to={applyTo}>{nextSession ? c.cohort.applyOpen : c.cohort.applyClosed}</Link>
              </Button>
              <Button asChild variant="outline" shape="pill" size="lg" className="hidden border-transparent sm:inline-flex">
                <Link to="/formations">{c.cohort.compare}</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col border-t border-[#E7E0D4]">
            {cohortFacts.map((f) => (
              <div
                key={f.label}
                className={`flex justify-between gap-4 border-b border-[#E7E0D4] py-5 text-base last:border-b-0 ${f.mobile ? "" : "hidden sm:flex"}`}
              >
                <span className="text-ink-secondary">{f.label}</span>
                <span className="text-right font-semibold text-navy">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Par métier */}
      <section className="flex flex-col gap-10 px-6 pb-28 lg:px-20">
        <div className="flex max-w-3xl flex-col gap-3.5">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.byRole.eyebrow}</span>
          <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
            {c.byRole.title}
          </h2>
        </div>
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.byRole.items.map((r) => (
            <Link key={r.title} to="/formations">
              <Card radius="card" className="flex h-full flex-row items-center justify-between gap-3 p-5 sm:flex-col sm:items-stretch sm:justify-start sm:gap-3.5 sm:p-7">
                <span className="font-heading text-lg font-bold text-navy sm:text-2xl">{r.title}</span>
                <span className="hidden text-base text-ink-secondary sm:block">{r.description}</span>
                <span className="shrink-0 text-right text-sm font-semibold text-cta sm:mt-auto sm:text-left">{r.path}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Parcours Data & BI */}
      {parcours.length > 0 && (
        <section className="flex flex-col gap-10 px-6 pb-28 lg:px-20">
          <div className="flex items-end justify-between gap-6">
            <div className="flex max-w-xl flex-col gap-3.5">
              <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.parcours.eyebrow}</span>
              <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
                {c.parcours.title}
              </h2>
            </div>
            <Link to="/formations" className="shrink-0 font-sans text-sm font-semibold text-navy hover:text-cta">
              {c.parcours.all}
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {parcours.map((f, i) => {
              const highlight = i === 0;
              return (
                <Card
                  key={f.id}
                  radius="card"
                  variant={highlight ? "navy" : "default"}
                  className="flex flex-col gap-4 p-7"
                >
                  <span
                    className={
                      highlight
                        ? "w-fit rounded-pill bg-white px-2.5 py-1.5 font-sans text-xs font-bold tracking-[1px] text-navy"
                        : "w-fit rounded-pill bg-surface-sand px-2.5 py-1.5 font-sans text-xs font-bold tracking-[1px] text-ink-secondary"
                    }
                  >
                    {(f.tag ?? f.domain?.name ?? c.parcours.fallbackTag).toUpperCase()}
                  </span>
                  <h3 className={highlight ? "font-heading text-[1.75rem] font-bold text-white" : "font-heading text-[1.75rem] font-bold text-navy"}>
                    {f.title}
                  </h3>
                  <p className={highlight ? "text-base text-[#D5DEE8]" : "text-base text-ink-secondary"}>{f.description}</p>
                  <div
                    className={
                      highlight
                        ? "mt-auto flex justify-between border-t border-navy-medium pt-4 text-sm text-white"
                        : "mt-auto flex justify-between border-t border-[#E7E0D4] pt-4 text-sm text-ink"
                    }
                  >
                    <span>{f.duration}</span>
                    <span className="font-bold">{f.price}</span>
                  </div>
                  <Button asChild variant={highlight ? "navy" : "outline"} shape="pill" className={highlight ? "bg-white text-navy hover:bg-white/90" : undefined}>
                    <Link to={`/formations/${f.slug}`}>{c.parcours.seeProgram}</Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Nouveau domaine */}
      <section className="px-6 pb-28 lg:px-20">
        <Card radius="hero" className="grid items-center gap-10 p-10 lg:grid-cols-3 lg:p-14">
          <div className="flex flex-col gap-3.5 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Pill variant="error">{c.newDomain.badge}</Pill>
              <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.newDomain.eyebrow}</span>
            </div>
            <h2 className="font-heading text-[clamp(26px,3vw,40px)] font-extrabold leading-tight tracking-[-1px] text-navy">
              {c.newDomain.title}
            </h2>
            <p className="text-lg text-ink-secondary">{c.newDomain.description}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="navy" shape="pill">
              <Link to={c.newDomain.cta.href}>{c.newDomain.cta.label}</Link>
            </Button>
            <Link to={c.newDomain.partner.href} className="text-center text-sm font-semibold text-navy hover:text-cta">
              {c.newDomain.partner.label}
            </Link>
          </div>
        </Card>
      </section>

      {/* Coaching */}
      <section id="coaching" className="px-6 pb-28 lg:px-20">
        <Card radius="hero" variant="sand" className="grid items-center gap-8 overflow-hidden p-0 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-4 p-10 text-center lg:items-start lg:p-16 lg:text-left">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.coaching.eyebrow}</span>
            <h2 className="font-heading text-[clamp(26px,3.5vw,44px)] font-extrabold leading-tight tracking-[-1px] text-navy">
              {c.coaching.title}
            </h2>
            <p className="text-lg text-ink-secondary">{c.coaching.description}</p>
            <Button asChild variant="navy" shape="pill" size="lg" className="mt-2">
              <Link to={c.coaching.cta.href}>{c.coaching.cta.label}</Link>
            </Button>
          </div>
          {c.coaching.image && (
            <img
              src={c.coaching.image}
              alt={c.coaching.imageAlt}
              loading="lazy"
              className="h-64 w-full object-cover lg:h-full lg:min-h-[360px]"
            />
          )}
        </Card>
      </section>

      {/* Témoignages */}
      {testimonials.length > 0 && (
        <section id="alumni" className="flex flex-col gap-10 px-6 pb-28 lg:px-20">
          <div className="flex items-end justify-between gap-6">
            <div className="flex max-w-xl flex-col gap-3.5">
              <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.testimonials.eyebrow}</span>
              <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
                {c.testimonials.title}
              </h2>
            </div>
            <Link to="/alumni" className="shrink-0 font-sans text-sm font-semibold text-navy hover:text-cta">
              {c.testimonials.all}
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {[...testimonials].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 3).map((t, i) => (
              <Card key={t.id} radius="card" className="flex flex-col gap-6 p-8">
                <blockquote className="font-sans text-lg leading-relaxed text-ink">« {t.content} »</blockquote>
                <figcaption className="mt-auto flex items-center gap-3.5">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-pill font-bold text-white ${AVATAR_BG[i % AVATAR_BG.length]}`}>
                    {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-bold text-navy">{t.name}</span>
                    <span className="text-sm text-ink-secondary">{[t.role, t.company].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Certif + Communauté */}
      {c.highlights.length > 0 && (
        <section className="grid gap-5 px-6 pb-28 lg:grid-cols-2 lg:px-20">
          {c.highlights.map((h) => (
            <Card key={h.eyebrow} radius="callout" className="flex flex-col gap-3.5 p-10">
              <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{h.eyebrow}</span>
              <h3 className="font-heading text-[2rem] font-bold leading-tight text-navy">{h.title}</h3>
              <p className="text-lg text-ink-secondary">{h.description}</p>
            </Card>
          ))}
        </section>
      )}

      {/* Entreprises */}
      <section id="entreprises" className="flex flex-col gap-12 bg-navy px-6 py-28 text-white lg:px-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr,1fr]">
          <div className="flex flex-col gap-4">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">{c.enterprises.eyebrow}</span>
            <h2 className="font-heading text-[clamp(28px,4vw,56px)] font-extrabold leading-[1.02] tracking-[-1.5px]">
              {c.enterprises.title}
            </h2>
            <p className="text-lg text-[#D5DEE8]">{c.enterprises.description}</p>
            <Button asChild variant="primary" shape="pill" size="lg" className="mt-2 w-fit bg-white text-navy hover:bg-white/90">
              <Link to={c.enterprises.cta.href}>{c.enterprises.cta.label}</Link>
            </Button>
          </div>
          {c.enterprises.image && (
            <img
              src={c.enterprises.image}
              alt={c.enterprises.imageAlt}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-hero object-cover"
            />
          )}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {c.enterprises.offers.map((o) => (
            <div key={o.eyebrow} className="flex flex-col gap-3.5 rounded-card bg-navy-medium p-8">
              <span className="text-xs font-bold uppercase tracking-[1px] text-cta-on-navy">{o.eyebrow}</span>
              <h3 className="font-heading text-[1.625rem] font-bold leading-snug">{o.title}</h3>
              <p className="text-base text-[#D5DEE8]">{o.description}</p>
            </div>
          ))}
        </div>
        {c.enterprises.forWhom.length > 0 && (
          <div className="flex flex-wrap items-center gap-10 border-t border-navy-medium pt-8 text-base text-[#D5DEE8]">
            <span className="font-bold text-white">{c.enterprises.forWhomLabel}</span>
            {c.enterprises.forWhom.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        )}
      </section>

      {/* FAQ + CTA */}
      <section id="contact" className="grid gap-20 px-6 py-28 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-5">
          <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
            {c.closing.title}
          </h2>
          <p className="text-lg text-ink-secondary">{c.closing.description}</p>
          <div className="flex flex-wrap gap-3.5">
            <Button asChild variant="primary" shape="pill" size="lg">
              <Link to="/formations">{c.closing.apply}</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg">
              <a href={company.whatsappUrl} target="_blank" rel="noreferrer">{c.closing.whatsapp}</a>
            </Button>
          </div>
        </div>
        <FaqAccordion items={c.closing.faq} />
      </section>
    </>
  );
}
