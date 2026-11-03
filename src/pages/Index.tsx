/**
 * Index.tsx — Accueil, la vitrine du site.
 *
 * Idée de la page : les barres montantes d'un tableau de bord Power BI (« Toujours plus haut ! ») deviennent le motif unique. Les diplômés
 * eux-mêmes sont les barres du héros ; le même sommet arrondi revient sur les métiers, les photos et les puces. Une boucle vidéo « data »
 * porte le fond du héros (voir components/home/HeroVideo.tsx).
 *
 * Aucun contenu n'est écrit en dur : les textes, chiffres clés, FAQ et offres viennent du backend (contenu `page.home`, modifiable depuis
 * l'administration), et les données métier (parcours, prix, durées, prochaine cohorte, témoignages) de l'API. Une section sans données
 * est masquée plutôt qu'affichée avec un texte à compléter.
 */
import { useRef } from "react";
import { Link } from "react-router-dom";

import promotion from "@/assets/home/promotion.webp";
import promotionSmall from "@/assets/home/promotion-sm.webp";
import { BAR_TOP } from "@/components/home/PeopleBars";
import { HomeHero } from "@/components/home/HomeHero";
import { useReveal } from "@/components/home/useReveal";
import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { HomeFaq } from "@/components/home/HomeFaq";
import { Button, ContentGate } from "@/components/shared";
import { useAllFormationSessions, useFormations } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { fill } from "@/lib/template";
import { FORMAT_LABELS } from "@/types/formation.type";
import type { PageHome, SiteCompany } from "@/types/siteContent";
import "@/styles/home.css";

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** « NOS ALUMNI TRAVAILLENT CHEZ » (saisi en capitales) → « Nos alumni travaillent chez ». */
const sentence = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

const delay = (ms: number) => ({ ["--d" as string]: ms });

/** Rang de l'élément dans une liste → délai d'apparition en cascade. */
const stagger = (i: number) => delay(i * 90);

/** Étendue de la dernière case selon le reste des cases sur une ligne de 4 (0 : ligne pleine). */
const LAST_SPAN = ["", "lg:col-span-4", "lg:col-span-3", "lg:col-span-2"] as const;

const SECTION = "px-5 py-20 lg:px-20 lg:py-24";
const H2 = "font-heading text-[clamp(22px,3.4vw,48px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance max-w-4xl";
/** Titre posé dans une colonne étroite (la moitié ou moins de l'écran) : même famille, un cran plus petit. */
const H2_NARROW = "font-heading text-[clamp(22px,2.4vw,34px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance";

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
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

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

  const stats = [
    ...(formations.length > 0 ? [{ value: String(formations.length), label: c.proof.formationsLabel }] : []),
    c.proof.projectStat,
  ];

  // Nombre de cases de la grille de preuves (titre sur 2 colonnes + entreprises + chiffres) : la dernière s'étend pour fermer la ligne
  const boardCells = (c.proof.companies.length > 0 ? 2 : 0) + c.proof.companies.length + stats.length;

  const topTestimonials = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 3);
  const [leadTestimonial, ...otherTestimonials] = topTestimonials;

  return (
    <div ref={root}>
      <HomeHero c={c} cohortOpen={nextSession !== null} />

      {/* Preuve : la promotion, les entreprises, les chiffres */}
      <section className={SECTION}>
        <div className="flex flex-col gap-4">
          <figure className="reveal">
            <img
              src={promotion}
              srcSet={`${promotionSmall} 800w, ${promotion} 1400w`}
              sizes="(min-width: 1024px) calc(100vw - 160px), 100vw"
              width={1400}
              height={933}
              loading="lazy"
              decoding="async"
              alt="Une promotion de Model Technologie à la remise des certificats : des diplômés souriants, certificat en main, devant leurs camarades"
              className="aspect-[4/3] w-full object-cover object-[50%_35%] sm:aspect-[16/9]"
            />
            <figcaption className="pt-3 text-sm text-ink-secondary">Une promotion de Model Technologie, le jour de la remise des certificats.</figcaption>
          </figure>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            {c.proof.companies.length > 0 && (
              <div className="reveal col-span-2 flex min-h-[150px] flex-col justify-end bg-cta p-6 text-white" style={stagger(0)}>
                <h2 className="font-heading text-[clamp(24px,2.4vw,34px)] font-extrabold leading-tight">{sentence(c.proof.companiesLabel)}</h2>
              </div>
            )}
            {c.proof.companies.map((name, i) => (
              <div key={name} className="reveal flex min-h-[150px] items-start bg-surface-sand p-6" style={stagger(i + 1)}>
                <span className="font-heading text-2xl font-bold text-navy">{name}</span>
              </div>
            ))}
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`reveal flex min-h-[150px] flex-col justify-between bg-navy p-6 text-white ${i === stats.length - 1 ? LAST_SPAN[boardCells % 4] : ""}`}
                style={stagger(i + c.proof.companies.length + 1)}
              >
                <span className="font-heading text-[clamp(32px,3.4vw,48px)] font-extrabold leading-none">{s.value}</span>
                <span className="text-base text-[#D5DEE8]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Un résultat, dit par un alumni */}
      <section className="px-5 pb-20 lg:px-20 lg:pb-24">
        <blockquote className="reveal flex max-w-4xl flex-col gap-4">
          <p className="font-heading text-[clamp(24px,2.6vw,34px)] font-bold leading-tight text-navy">« {c.visual.quote} »</p>
          <footer className="flex items-center gap-3 text-base text-ink-secondary">
            <span className="h-5 w-2.5 shrink-0 rounded-t-full bg-cta" aria-hidden="true" />
            <span>{c.visual.author}<span className="hidden sm:inline">{c.visual.authorExtra}</span></span>
          </footer>
        </blockquote>
      </section>

      {/* Prochaine cohorte : la donnée vivante de la page */}
      <section id="cohorte" className="bg-navy px-5 py-20 text-white lg:px-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="reveal flex flex-col gap-5 lg:col-span-6">
            <h2 className={H2}>
              {nextSession?.maxParticipants
                ? fill(c.cohort.titleWithPlaces, { places: nextSession.maxParticipants })
                : c.cohort.titleDefault}
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-[#D5DEE8]">{c.cohort.description}</p>
            <div className="flex flex-wrap items-center gap-5 pt-2">
              <Button asChild variant="primary" shape="pill" size="lg" className="home-press">
                <Link to={applyTo}>{nextSession ? c.cohort.applyOpen : c.cohort.applyClosed}</Link>
              </Button>
              <Link to="/formations" className="home-press text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                {c.cohort.compare}
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 lg:col-span-6 lg:gap-3">
            {cohortFacts.map((f, i) => (
              <div key={f.label} className={`reveal flex flex-col gap-1.5 bg-navy-medium p-5 lg:p-6 ${f.mobile ? "" : "hidden sm:flex"}`} style={stagger(i)}>
                <dt className="text-sm text-[#D5DEE8]">{f.label}</dt>
                <dd className="font-heading text-xl font-bold leading-snug lg:text-2xl">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Par métier : quatre barres qui montent */}
      <section className={SECTION}>
        <h2 className={`${H2} reveal text-navy`}>{c.byRole.title}</h2>
        <div className="mt-12 flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:mt-16 lg:flex lg:flex-row lg:items-end lg:gap-4">
          {c.byRole.items.map((r, i) => (
            <Link
              key={r.title}
              to="/formations"
              className={`reveal home-lift group flex flex-col px-6 pb-7 pt-12 lg:flex-1 lg:pt-16 ${BAR_TOP} ${
                i === c.byRole.items.length - 1
                  ? "bg-cta text-white hover:bg-navy focus-visible:bg-navy"
                  : "bg-surface-sand text-navy hover:bg-navy hover:text-white focus-visible:bg-navy focus-visible:text-white"
              }`}
              style={{ ...stagger(i), ["--h" as string]: `${300 + i * 55}px` }}
            >
              <span className="flex flex-col gap-3 lg:min-h-[var(--h)]">
                <span className="font-heading text-2xl font-bold leading-tight">{r.title}</span>
                <span className={`text-base leading-relaxed group-hover:text-[#D5DEE8] group-focus-visible:text-[#D5DEE8] ${i === c.byRole.items.length - 1 ? "text-white/90" : "text-ink-secondary"}`}>{r.description}</span>
                <span className="mt-auto pt-4 text-base font-semibold">{r.path}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Parcours Data & BI */}
      {parcours.length > 0 && (
        <section className="px-5 pb-20 lg:px-20 lg:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className={`${H2} reveal text-navy`}>{c.parcours.title}</h2>
            <Link to="/formations" className="home-press text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:text-cta">
              {c.parcours.all}
            </Link>
          </div>
          <div className="mt-12 flex flex-col gap-3">
            {parcours.map((f, i) => {
              const dark = i === 0;
              return (
                <article
                  key={f.id}
                  className={`reveal grid items-center gap-5 p-6 lg:grid-cols-12 lg:gap-8 lg:p-9 ${dark ? "bg-navy text-white" : "bg-surface-sand text-navy"}`}
                  style={stagger(i)}
                >
                  <h3 className="font-heading text-[clamp(24px,2.4vw,34px)] font-bold leading-tight lg:col-span-4">{f.title}</h3>
                  <p className={`text-base leading-relaxed lg:col-span-4 ${dark ? "text-[#D5DEE8]" : "text-ink-secondary"}`}>{f.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4 lg:col-span-4 lg:justify-end lg:gap-6">
                    <span className="flex flex-col text-base">
                      <span>{f.duration}</span>
                      <strong className="font-heading text-xl">{f.price}</strong>
                    </span>
                    <Button asChild variant={dark ? "navy" : "outline"} shape="pill" className={`home-press ${dark ? "bg-white text-navy hover:bg-white/90" : ""}`}>
                      <Link to={`/formations/${f.slug}`}>{c.parcours.seeProgram}</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Nouveau domaine */}
      <section className="bg-cta px-5 py-20 text-white lg:px-20 lg:py-24">
        <div className="reveal grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-4 lg:col-span-8">
            <h2 className={H2}>{c.newDomain.title}</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/95">{c.newDomain.description}</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
            <Button asChild variant="primary" shape="pill" size="lg" className="home-press bg-white text-navy hover:bg-white/90">
              <Link to={c.newDomain.cta.href}>{c.newDomain.cta.label}</Link>
            </Button>
            <Link to={c.newDomain.partner.href} className="home-press text-base font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
              {c.newDomain.partner.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Coaching */}
      <section id="coaching" className={SECTION}>
        <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-0">
          <div className="reveal flex flex-col justify-center gap-5 bg-surface-sand p-8 lg:col-span-6 lg:p-12">
            <h2 className={`${H2_NARROW} text-navy`}>{c.coaching.title}</h2>
            <p className="max-w-xl text-lg leading-relaxed text-ink-secondary">{c.coaching.description}</p>
            <Button asChild variant="navy" shape="pill" size="lg" className="home-press mt-2 w-fit">
              <Link to={c.coaching.cta.href}>{c.coaching.cta.label}</Link>
            </Button>
          </div>
          {c.coaching.image && (
            <div className={`reveal overflow-hidden lg:col-span-6 ${BAR_TOP}`} style={delay(120)}>
              <img src={c.coaching.image} alt={c.coaching.imageAlt} width={1200} height={900} loading="lazy" decoding="async" className="aspect-[4/3] h-full min-h-[320px] w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Témoignages */}
      {leadTestimonial && (
        <section id="alumni" className="px-5 pb-20 lg:px-20 lg:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className={`${H2} reveal text-navy`}>{c.testimonials.title}</h2>
            <Link to="/alumni" className="home-press text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:text-cta">
              {c.testimonials.all}
            </Link>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <figure className="reveal flex flex-col gap-6 lg:col-span-7">
              <blockquote className="font-heading text-[clamp(24px,2.6vw,34px)] font-bold leading-snug text-navy">« {leadTestimonial.content} »</blockquote>
              <Attribution t={leadTestimonial} />
            </figure>
            <div className="flex flex-col gap-4 lg:col-span-5">
              {otherTestimonials.map((t, i) => (
                <figure key={t.id} className="reveal flex flex-col gap-4 bg-surface-sand p-6" style={stagger(i + 1)}>
                  <blockquote className="text-lg leading-relaxed text-ink">« {t.content} »</blockquote>
                  <Attribution t={t} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certification et communauté */}
      {c.highlights.length > 0 && (
        <section className="grid gap-3 px-5 pb-20 lg:grid-cols-2 lg:gap-4 lg:px-20 lg:pb-24">
          {c.highlights.map((h, i) => (
            <div key={h.title} className={`reveal flex flex-col gap-4 p-8 lg:p-12 ${i % 2 === 0 ? "bg-navy text-white" : "bg-surface-sand text-navy"}`} style={stagger(i)}>
              <h3 className="font-heading text-[clamp(24px,2.4vw,34px)] font-bold leading-tight">{h.title}</h3>
              <p className={`text-lg leading-relaxed ${i % 2 === 0 ? "text-[#D5DEE8]" : "text-ink-secondary"}`}>{h.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Entreprises */}
      <section id="entreprises" className="flex flex-col gap-12 bg-navy-dark px-5 py-20 text-white lg:px-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="reveal flex flex-col gap-5 lg:col-span-7">
            <h2 className={H2}>{c.enterprises.title}</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-[#D5DEE8]">{c.enterprises.description}</p>
            <Button asChild variant="primary" shape="pill" size="lg" className="home-press mt-2 w-fit bg-white text-navy hover:bg-white/90">
              <Link to={c.enterprises.cta.href}>{c.enterprises.cta.label}</Link>
            </Button>
          </div>
          {c.enterprises.image && (
            <div className={`reveal overflow-hidden lg:col-span-5 ${BAR_TOP}`} style={delay(120)}>
              <img src={c.enterprises.image} alt={c.enterprises.imageAlt} width={1200} height={900} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
        </div>
        <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
          {c.enterprises.offers.map((o, i) => (
            <div key={o.title} className="reveal flex flex-col gap-3 bg-navy-medium p-6 lg:p-8" style={stagger(i)}>
              <h3 className="font-heading text-xl font-bold leading-snug lg:text-2xl">{o.title}</h3>
              <p className="text-base leading-relaxed text-[#D5DEE8]">{o.description}</p>
            </div>
          ))}
        </div>
        {c.enterprises.forWhom.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-base text-[#D5DEE8]">
            <li className="font-bold text-white">{c.enterprises.forWhomLabel}</li>
            {c.enterprises.forWhom.map((w) => (
              <li key={w} className="flex items-center gap-2.5">
                <span className="h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                {w}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAQ + CTA */}
      <section id="contact" className="grid gap-14 px-5 py-20 lg:grid-cols-12 lg:gap-8 lg:px-20 lg:py-24">
        <div className="reveal flex flex-col gap-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <h2 className={`${H2_NARROW} text-navy`}>{c.closing.title}</h2>
          <p className="max-w-md text-lg leading-relaxed text-ink-secondary">{c.closing.description}</p>
          <div className="flex flex-wrap gap-3.5 pt-2">
            <Button asChild variant="primary" shape="pill" size="lg" className="home-press">
              <Link to="/formations">{c.closing.apply}</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg" className="home-press">
              <a href={company.whatsappUrl} target="_blank" rel="noreferrer">{c.closing.whatsapp}</a>
            </Button>
          </div>
        </div>
        <div className="reveal lg:col-span-7" style={delay(120)}>
          <HomeFaq items={c.closing.faq} />
        </div>
      </section>
    </div>
  );
}

/** Auteur d'un témoignage : initiales dans une petite barre (le motif), nom, poste et entreprise. */
function Attribution({ t }: { t: { name: string; role?: string | null; company?: string | null } }) {
  return (
    <figcaption className="flex items-center gap-3.5">
      <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-t-[20px] bg-navy text-sm font-bold text-white" aria-hidden="true">
        {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
      </span>
      <span className="flex flex-col">
        <span className="font-bold text-navy">{t.name}</span>
        <span className="text-sm text-ink-secondary">{[t.role, t.company].filter(Boolean).join(" · ")}</span>
      </span>
    </figcaption>
  );
}
