/**
 * Formations.tsx — le catalogue, pensé pour convertir : on peut candidater dès l'écran d'arrivée, depuis une carte ou depuis la liste des dates,
 * sans passer par la fiche. Même idée que l'accueil : les barres montantes d'un tableau de bord, ici la hauteur d'une barre dit le remplissage
 * d'une cohorte (voir CohortBars).
 *
 * Les titres, le parcours en étapes, la FAQ et le quiz viennent du contenu `page.formations` (administration) ; les libellés d'action et de
 * réassurance de config/formationsPage.ts ; tout le reste (formations, cohortes, places, tarifs, témoignages) de l'API. Si le contenu éditorial
 * est indisponible, le catalogue reste affiché et seuls les blocs concernés sont masqués. Une cohorte n'est proposée que si elle est réellement
 * ouverte (lib/cohorts.ts) : jamais une cohorte déjà démarrée ou complète.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { CatalogueCard } from "@/components/formations/CatalogueCard";
import { ClosingBand } from "@/components/formations/ClosingBand";
import { CatalogueFilters, EMPTY_FILTERS, type FormationFilters } from "@/components/formations/CatalogueFilters";
import { CohortBars, TOP } from "@/components/formations/CohortBars";
import { CohortList } from "@/components/formations/CohortList";
import { StickyApplyBar } from "@/components/formations/StickyApplyBar";
import { HeroVideo } from "@/components/home/HeroVideo";
import { HomeFaq } from "@/components/home/HomeFaq";
import { useReveal } from "@/components/home/useReveal";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { Button } from "@/components/shared";
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { useAllFormationSessions, useDomains, useFormations } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { nextOpenByFormation, openCohorts, todayIso } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import type { FlatSession, Formation } from "@/types/formation.type";
import "@/styles/home.css";
import { RegistrationModal } from "./RegistrationModal";

const SECTION = "px-5 py-20 lg:px-20 lg:py-24";
const H2 = "font-heading text-[clamp(22px,3.4vw,48px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance max-w-4xl";

const delay = (ms: number) => ({ ["--d" as string]: ms });

/** Colonnes de la grille sous la formation phare : on évite une dernière ligne à moitié vide. */
function gridFor(n: number): { grid: string; lastSpan: boolean } {
  if (n <= 1) return { grid: "", lastSpan: false };
  if (n % 3 === 0) return { grid: "lg:grid-cols-3", lastSpan: false };
  return { grid: "lg:grid-cols-2", lastSpan: n % 2 === 1 };
}

interface Applying { formation: Formation; session: FlatSession }

export default function Formations() {
  const { data: formations = [], isLoading, isError } = useFormations();
  const { data: domains = [] } = useDomains();
  const { data: sessions = [] } = useAllFormationSessions();
  const { data: testimonials = [] } = usePublishedTestimonials();
  const { content: c } = useSiteContent("page.formations");
  const { content: company } = useSiteContent("site.company");
  const [filters, setFilters] = useState<FormationFilters>(EMPTY_FILTERS);
  const [applying, setApplying] = useState<Applying | null>(null);
  const [searchParams] = useSearchParams();

  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const closing = useRef<HTMLElement>(null);
  const stickyHides = useMemo(() => [hero], []);
  useReveal(root);

  const today = todayIso();
  const open = useMemo(() => openCohorts(sessions, today), [sessions, today]);
  const nextByFormation = useMemo(() => nextOpenByFormation(sessions, today), [sessions, today]);
  const soonest = open[0] ?? null;

  const apply = (formationId: string, session: FlatSession) => {
    const formation = formations.find((f) => f.id === formationId);
    if (formation) setApplying({ formation, session });
  };

  // Liens partagés : /formations?domaine=<slug> filtre, /formations?candidater=<slug> ouvre directement la candidature
  useEffect(() => {
    const domainSlug = searchParams.get("domaine");
    if (!domainSlug || domains.length === 0) return;
    const domain = domains.find((d) => d.slug === domainSlug);
    if (domain) setFilters((prev) => ({ ...prev, domainId: domain.id }));
  }, [searchParams, domains]);

  const autoApplied = useRef(false);
  useEffect(() => {
    const slug = searchParams.get("candidater");
    if (!slug || autoApplied.current || formations.length === 0 || sessions.length === 0) return;
    autoApplied.current = true;
    const formation = formations.find((f) => f.slug === slug);
    const session = formation ? nextByFormation.get(formation.id) : undefined;
    if (formation && session) setApplying({ formation, session });
  }, [searchParams, formations, sessions, nextByFormation]);

  const catalogueDomains = domains.filter((d) => !d.comingSoon);
  const soonDomains = domains.filter((d) => d.comingSoon);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const f of formations) m[f.domainId] = (m[f.domainId] ?? 0) + 1;
    return m;
  }, [formations]);
  const targetRoles = useMemo(() => Array.from(new Set(formations.flatMap((f) => f.targetRoles))).sort(), [formations]);

  const filtered = useMemo(
    () =>
      formations
        .filter((f) => {
          if (filters.domainId !== "all" && f.domainId !== filters.domainId) return false;
          if (filters.level !== "all" && f.level !== filters.level) return false;
          if (filters.format !== "all" && f.format !== filters.format) return false;
          if (filters.deliveredBy !== "all" && f.deliveredBy !== filters.deliveredBy) return false;
          if (filters.targetRole !== "all" && !f.targetRoles.includes(filters.targetRole)) return false;
          return true;
        })
        // la formation phare d'abord, puis l'ordre d'affichage
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder),
    [formations, filters],
  );

  const leadFormation = filtered.length >= 2 && filtered[0].featured ? filtered[0] : null;
  const rest = leadFormation ? filtered.slice(1) : filtered;
  const { grid, lastSpan } = gridFor(rest.length);

  const topTestimonials = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 3);
  const steps = c?.process.steps ?? [];
  const faq = c?.faq.items ?? [];
  const advisorHref = company?.whatsappUrl || "/contact";
  const advisorExternal = advisorHref.startsWith("http");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.formations} />
      <div ref={root}>
        {/* Héros : la promesse, l'action, et les prochaines cohortes déjà candidatables */}
        <section ref={hero} className="relative isolate overflow-hidden bg-navy-dark text-white">
          <HeroVideo />
          {/* Voile : garde le texte lisible quelle que soit l'image de la vidéo */}
          <div className="absolute inset-0 -z-10 bg-navy-dark/70" aria-hidden="true" />

          <div className="grid items-end gap-12 px-5 pb-20 pt-14 lg:grid-cols-12 lg:gap-8 lg:px-20 lg:pb-0 lg:pt-20">
            <div className="flex flex-col gap-6 lg:col-span-6 lg:pb-24">
              <h1 className="font-heading text-[clamp(32px,3.8vw,64px)] font-extrabold leading-[1.04] tracking-[-0.03em] text-balance">
                {c?.hero.title ?? UI.heroFallbackTitle}
              </h1>
              {c?.hero.description && (
                <p className="home-hero-in max-w-xl text-lg leading-relaxed text-white/90" style={delay(40)}>{c.hero.description}</p>
              )}
              <div className="home-hero-in flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={delay(100)}>
                {soonest ? (
                  <Button variant="primary" shape="pill" size="lg" onClick={() => apply(soonest.formationId, soonest)} className="home-press">
                    {UI.applyNext}
                  </Button>
                ) : (
                  <Button asChild variant="primary" shape="pill" size="lg" className="home-press">
                    <Link to="/contact">{UI.notify}</Link>
                  </Button>
                )}
                <a href="#catalogue" className="home-press inline-flex min-h-11 items-center text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                  {UI.browse}
                </a>
              </div>
              <ul className="home-hero-in flex flex-col gap-2 text-base text-white/90" style={delay(160)}>
                {[UI.reassurance.payment, soonest?.schedule, UI.reassurance.invoice].filter((t): t is string => Boolean(t)).map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-6 lg:self-end">
              <CohortBars cohorts={open.slice(0, 3)} today={today} onApply={(s) => apply(s.formationId, s)} />
            </div>
          </div>
        </section>

        {/* Catalogue */}
        <section id="catalogue" className={cn(SECTION, "scroll-mt-20 text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c?.domains.title ?? UI.browse}</h2>

          <div className="reveal mt-10" style={delay(60)}>
            <CatalogueFilters
              domains={catalogueDomains}
              counts={counts}
              total={formations.length}
              targetRoles={targetRoles}
              filters={filters}
              shown={filtered.length}
              onChange={setFilters}
            />
          </div>

          {isLoading && <p className="mt-10 text-base text-ink-secondary">{c?.domains.loading ?? "…"}</p>}
          {isError && (
            <p role="alert" className="mt-10 rounded-2xl bg-error-bg px-5 py-4 text-base text-error">
              Le catalogue est momentanément indisponible. Réessayez dans quelques instants ou contactez-nous.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-4 lg:gap-6">
            {leadFormation && (
              <CatalogueCard
                formation={leadFormation}
                cohort={nextByFormation.get(leadFormation.id) ?? null}
                today={today}
                lead
                className="reveal"
                onApply={(f, s) => apply(f.id, s)}
              />
            )}
            {rest.length > 0 && (
              <div className={cn("grid gap-4 lg:gap-6", grid)}>
                {rest.map((f, i) => (
                  <CatalogueCard
                    key={f.id}
                    formation={f}
                    cohort={nextByFormation.get(f.id) ?? null}
                    today={today}
                    className={cn("reveal", lastSpan && i === rest.length - 1 && "lg:col-span-2")}
                    onApply={(fm, s) => apply(fm.id, s)}
                  />
                ))}
              </div>
            )}
            {!isLoading && !isError && filtered.length === 0 && c && <p className="text-base text-ink-secondary">{c.domains.empty}</p>}
          </div>

          {soonDomains.length > 0 && (
            <p className="mt-10 max-w-3xl text-base text-ink-secondary">
              Bientôt : {soonDomains.map((d) => d.name).join(", ")}.{" "}
              <Link to="/contact" className="font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">{UI.notify}</Link>
            </p>
          )}
        </section>

        {/* La salle : des visages, deux barres de hauteurs différentes */}
        <section className="px-5 pb-20 lg:px-20 lg:pb-24">
          <div className="grid items-end gap-4 lg:grid-cols-12 lg:gap-6">
            <figure className="reveal lg:col-span-7">
              <img
                src="/images/photos/cohorte-travail.jpg"
                alt="Apprenantes d'une cohorte Model Technologie travaillant ensemble sur un exercice, en salle à Dakar"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-t-[72px] object-cover lg:aspect-[3/2]"
              />
            </figure>
            <figure className="reveal lg:col-span-5" style={delay(90)}>
              <img
                src="/images/photos/cohorte-salle.jpg"
                alt="Apprenants attentifs pendant une séance de formation"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-t-[72px] object-cover lg:aspect-[4/3]"
              />
              <figcaption className="pt-3 text-sm text-ink-secondary">{UI.photosCaption}</figcaption>
            </figure>
          </div>
        </section>

        {/* Témoignages : la preuve, avant les dates */}
        {topTestimonials.length > 0 && (
          <section className={cn(SECTION, "bg-surface-sand text-navy")}>
            <h2 className={cn(H2, "reveal")}>{UI.testimonialsTitle}</h2>
            <ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
              {topTestimonials.map((t, i) => (
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

        {/* Toutes les dates */}
        <section id="cohortes" className={cn(SECTION, "scroll-mt-20 text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c?.calendar.title ?? UI.cohortsTitle}</h2>
          {c?.calendar.description && <p className="reveal mt-4 max-w-2xl text-lg text-ink-secondary" style={delay(40)}>{c.calendar.description}</p>}
          <div className="mt-10">
            {open.length > 0 ? (
              <CohortList cohorts={open} today={today} onApply={(s) => apply(s.formationId, s)} />
            ) : (
              <p className="text-base text-ink-secondary">{UI.noCohort}</p>
            )}
          </div>
        </section>

        {/* Après la candidature : les étapes montent comme des barres */}
        {steps.length > 0 && (
          <section className={cn(SECTION, "bg-navy-dark text-white")}>
            <h2 className={cn(H2, "reveal")}>{c?.process.title}</h2>
            <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end lg:gap-4">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  style={{ ["--i" as string]: i, ...delay(i * 90) }}
                  className={cn(TOP, "reveal flex flex-col gap-3 p-6 pt-12 lg:min-h-[calc(240px+var(--i)*56px)]", i === steps.length - 1 ? "bg-cta text-white" : "bg-navy-medium text-white")}
                >
                  <span className="font-heading text-[40px] font-extrabold leading-none">{i + 1}</span>
                  <p className="font-heading text-xl font-bold">{step.title}</p>
                  <p className="text-base leading-relaxed text-white/90">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Pas encore décidé ? Trois façons d'avancer */}
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{UI.help.title}</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="reveal flex flex-col gap-4 rounded-2xl bg-navy p-6 text-white lg:p-8">
              <h3 className="font-heading text-2xl font-extrabold leading-tight">{c?.quiz.title ?? UI.help.quiz.title}</h3>
              <p className="text-base leading-relaxed text-white/90">{c?.quiz.description ?? UI.help.quiz.text}</p>
              <Button asChild variant="primary" shape="pill" size="lg" className="home-press mt-auto w-fit">
                <Link to={c?.quiz.cta.href ?? "/orientation"}>{c?.quiz.cta.label ?? UI.help.quiz.title}</Link>
              </Button>
            </div>
            <div className="reveal flex flex-col gap-4 rounded-2xl bg-cta p-6 text-white lg:p-8" style={delay(90)}>
              <h3 className="font-heading text-2xl font-extrabold leading-tight">{UI.help.advisor.title}</h3>
              <p className="text-base leading-relaxed text-white/95">{UI.help.advisor.text}</p>
              <Button asChild variant="navy" shape="pill" size="lg" className="home-press mt-auto w-fit">
                {advisorExternal ? (
                  <a href={advisorHref} target="_blank" rel="noopener noreferrer">{UI.help.advisor.cta}</a>
                ) : (
                  <Link to={advisorHref}>{UI.help.advisor.fallbackCta}</Link>
                )}
              </Button>
            </div>
            <div className="reveal flex flex-col gap-4 rounded-2xl bg-surface-sand p-6 text-navy lg:p-8" style={delay(180)}>
              <h3 className="font-heading text-2xl font-extrabold leading-tight">{UI.help.team.title}</h3>
              <p className="text-base leading-relaxed text-ink-secondary">{UI.help.team.text}</p>
              <Button asChild variant="navy" shape="pill" size="lg" className="home-press mt-auto w-fit">
                <Link to="/entreprises">{UI.help.team.cta}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {faq.length > 0 && (
          <section className={cn(SECTION, "pt-0 text-navy lg:pt-0")}>
            <h2 className={cn(H2, "reveal")}>{c?.faq.title}</h2>
            <div className="reveal mt-10 max-w-4xl">
              <HomeFaq items={faq} />
            </div>
          </section>
        )}

        <ClosingBand ref={closing} cohort={soonest} othersHref={open.length > 1 ? "#cohortes" : undefined} onApply={(c) => apply(c.formationId, c)} />
      </div>

      <StickyApplyBar cohort={soonest} hideWhenVisible={stickyHides} hideFrom={closing} onApply={(s) => apply(s.formationId, s)} />

      {applying && <RegistrationModal bootcamp={applying.formation} session={applying.session} onClose={() => setApplying(null)} />}
    </SiteLayout>
  );
}
