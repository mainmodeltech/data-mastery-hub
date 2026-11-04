/**
 * FormationDetail.tsx — la fiche d'une formation : l'étape qui décide de la candidature. Tout converge vers le choix d'une cohorte
 * (CohortPicker, à droite du titre) ; chaque section répond à une objection (pour qui ? qu'est-ce que j'y gagne ? que va-t-on faire ?
 * qui l'anime ? comment payer ?) et la barre d'appel reste à portée du pouce ou de la souris.
 *
 * Même règles que le catalogue : les cohortes proposées sont celles réellement ouvertes (lib/cohorts.ts, jamais `nextSession` qui peut
 * désigner une cohorte déjà démarrée), les libellés viennent de config/formationsPage.ts, la FAQ du contenu `page.formations`.
 * Une section sans données est masquée.
 */
import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { CatalogueCard } from "@/components/formations/CatalogueCard";
import { ClosingBand } from "@/components/formations/ClosingBand";
import { TOP } from "@/components/formations/CohortBars";
import { CohortPicker } from "@/components/formations/CohortPicker";
import { DeliveredByBlock } from "@/components/formations/DeliveredByBlock";
import { ProgramAccordion } from "@/components/formations/ProgramAccordion";
import { StickyApplyBar } from "@/components/formations/StickyApplyBar";
import { HeroVideo } from "@/components/home/HeroVideo";
import { HomeFaq } from "@/components/home/HomeFaq";
import { useReveal } from "@/components/home/useReveal";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { SeoHead } from "@/components/SeoHead";
import { FICHE_UI as T, FORMATIONS_UI } from "@/config/formationsPage";
import { useAllFormationSessions, useFormationBySlug, useFormations } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { nextOpenByFormation, openCohorts, todayIso } from "@/lib/cohorts";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS, LEVEL_LABELS } from "@/types/formation.type";
import type { FlatSession } from "@/types/formation.type";
import "@/styles/home.css";
import { RegistrationModal } from "./RegistrationModal";

const SECTION = "px-5 py-20 lg:px-20 lg:py-24";
const H2 = "font-heading text-[clamp(22px,3.4vw,48px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance max-w-4xl";
const delay = (ms: number) => ({ ["--d" as string]: ms });

/** Description tronquée pour les moteurs de recherche (155 caractères au plus, coupée sur un mot). */
function seoDescription(text: string | null): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= 155) return t;
  return `${t.slice(0, 152).replace(/\s+\S*$/, "")}…`;
}

export default function FormationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: formation, isLoading } = useFormationBySlug(slug);
  const { data: allFormations = [] } = useFormations();
  const { data: sessions = [] } = useAllFormationSessions();
  const { content: faqContent } = useSiteContent("page.formations");
  const [applying, setApplying] = useState<FlatSession | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const closing = useRef<HTMLElement>(null);
  const stickyHides = useMemo(() => [hero], []);
  useReveal(root);

  const today = todayIso();
  const mine = useMemo(
    () => (formation ? openCohorts(sessions.filter((s) => s.formationId === formation.id), today) : []),
    [sessions, formation, today],
  );
  const nextByFormation = useMemo(() => nextOpenByFormation(sessions, today), [sessions, today]);

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="px-5 py-24 text-center text-base text-ink-secondary lg:px-20">{T.loading}</p>
      </SiteLayout>
    );
  }

  if (!formation) {
    return (
      <SiteLayout>
        <div className="px-5 py-24 text-center lg:px-20">
          <p className="text-base text-ink-secondary">{T.notFound}</p>
          <Link to="/formations" className="mt-4 inline-flex min-h-11 items-center text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">
            {T.back}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const f = formation;
  const related = allFormations.filter((x) => f.relatedFormationIds.includes(x.id));
  const soonest = mine[0] ?? null;
  const faq = faqContent?.faq.items ?? [];
  const testimonial = f.testimonial?.content ? f.testimonial : null;
  const certification = f.certification?.name ? f.certification : null;
  const facts = [
    { label: "Durée", value: f.duration },
    { label: "Niveau", value: LEVEL_LABELS[f.level] },
    { label: "Format", value: FORMAT_LABELS[f.format] },
    { label: "Langue", value: T.language },
  ];

  return (
    <SiteLayout>
      <SeoHead title={f.title} description={seoDescription(f.description)} path={`/formations/${f.slug}`} />
      <div ref={root}>
        {/* Héros : ce que c'est, et le choix de la cohorte juste à côté */}
        <section ref={hero} className="relative isolate overflow-hidden bg-navy-dark text-white">
          <HeroVideo />
          <div className="absolute inset-0 -z-10 bg-navy-dark/75" aria-hidden="true" />

          <div className="grid items-end gap-10 px-5 pb-16 pt-8 lg:grid-cols-12 lg:gap-12 lg:px-20 lg:pb-0 lg:pt-10">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-7 lg:pb-20">
              <nav aria-label="Fil d'Ariane" className="text-sm text-white/85">
                <Link to="/formations" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">{T.breadcrumb}</Link>
                <span aria-hidden="true"> / </span>
                <span>{f.domain.name}</span>
              </nav>

              <h1 className="font-heading text-[clamp(32px,3.8vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance">{f.title}</h1>
              {(f.tag || (f.deliveredBy === "PARTNER" && f.partner)) && (
                <p className="flex flex-wrap items-center gap-3">
                  {f.tag && <span className="rounded-full bg-cta px-3 py-1 text-sm font-bold">{f.tag}</span>}
                  {f.deliveredBy === "PARTNER" && f.partner && <span className="text-base font-semibold text-white/90">En partenariat avec {f.partner.name}</span>}
                </p>
              )}
              <p className="home-hero-in max-w-[60ch] text-lg leading-relaxed text-white/90" style={delay(40)}>{f.description}</p>

              <dl className="home-hero-in grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4" style={delay(100)}>
                {facts.map((x) => (
                  <div key={x.label}>
                    <dt className="text-sm text-white/80">{x.label}</dt>
                    <dd className="text-lg font-semibold">{x.value}</dd>
                  </div>
                ))}
                {f.certificationPrep && (
                  <div className="col-span-full">
                    <dt className="text-sm text-white/80">Prépare à</dt>
                    <dd className="text-lg font-semibold">{f.certificationPrep}</dd>
                  </div>
                )}
              </dl>

              {f.benefits.length > 0 && (
                <ul className="home-hero-in flex flex-col gap-2 text-base text-white/90" style={delay(160)}>
                  {f.benefits.slice(0, 4).map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {f.curriculum.length > 0 && (
                <a href="#programme" className="home-hero-in home-press inline-flex min-h-11 w-fit items-center text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white" style={delay(200)}>
                  {T.seeProgram}
                </a>
              )}
            </div>

            <div className="min-w-0 lg:col-span-5">
              <CohortPicker cohorts={mine} today={today} fallbackPrice={f.price} onApply={setApplying} />
            </div>
          </div>
        </section>

        {/* Pour qui */}
        {(f.profiles.length > 0 || f.prerequisites || f.audience) && (
          <section className={cn(SECTION, "text-navy")}>
            <h2 className={cn(H2, "reveal")}>{T.forWho}</h2>
            {f.profiles.length > 0 && (
              <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {f.profiles.map((p, i) => (
                  <li key={p.label} className={cn(TOP, "reveal bg-surface-sand p-6 pt-12 font-heading text-xl font-bold")} style={delay(i * 70)}>
                    {p.label}
                  </li>
                ))}
              </ul>
            )}
            {(f.audience || f.prerequisites) && (
              <dl className="reveal mt-8 grid max-w-4xl gap-6 text-base sm:grid-cols-2">
                {f.audience && (
                  <div>
                    <dt className="font-semibold">Public</dt>
                    <dd className="mt-1 max-w-[60ch] leading-relaxed text-ink-secondary">{f.audience}</dd>
                  </div>
                )}
                {f.prerequisites && (
                  <div>
                    <dt className="font-semibold">{T.prerequisites}</dt>
                    <dd className="mt-1 max-w-[60ch] leading-relaxed text-ink-secondary">{f.prerequisites}</dd>
                  </div>
                )}
              </dl>
            )}
          </section>
        )}

        {/* Résultats attendus */}
        {f.outcomes.length > 0 && (
          <section className={cn(SECTION, "bg-surface-sand pt-16 text-navy lg:pt-20")}>
            <h2 className={cn(H2, "reveal")}>{T.outcomes}</h2>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end lg:gap-4">
              {f.outcomes.map((o, i) => (
                <li
                  key={o.label}
                  style={{ ["--i" as string]: i, ...delay(i * 90) }}
                  className={cn(TOP, "reveal flex flex-col gap-2 p-6 pt-12 lg:min-h-[calc(200px+var(--i)*40px)]", i === f.outcomes.length - 1 ? "bg-cta text-white" : "bg-navy text-white")}
                >
                  <span className="font-heading text-[48px] font-extrabold leading-none">{o.stat}</span>
                  <span className="text-base leading-snug text-white/90">{o.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Programme et outils */}
        {(f.curriculum.length > 0 || f.tools.length > 0) && (
          <section id="programme" className={cn(SECTION, "scroll-mt-20 text-navy")}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              {f.curriculum.length > 0 && (
                <div className="lg:col-span-8">
                  <h2 className={cn(H2, "reveal mb-10")}>{T.program}</h2>
                  <div className="reveal"><ProgramAccordion modules={f.curriculum} /></div>
                </div>
              )}
              {f.tools.length > 0 && (
                <div className={cn("reveal", f.curriculum.length > 0 ? "lg:col-span-4" : "lg:col-span-12")}>
                  <h2 className="font-heading text-[clamp(22px,2.4vw,34px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance">{T.tools}</h2>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {f.tools.map((t, i) => (
                      <li key={t.name} style={delay(i * 70)} className="reveal rounded-full bg-navy px-4 py-2 text-base font-semibold text-white">{t.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Attestation et examen */}
        {certification && (
          <section className="bg-navy px-5 py-16 text-white lg:px-20 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <h2 className="reveal font-heading text-[clamp(24px,2.8vw,40px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-balance lg:col-span-5">{T.certification}</h2>
              <div className="reveal flex flex-col gap-3 lg:col-span-7" style={delay(90)}>
                <p className="text-lg">{f.deliveredBy === "PARTNER" && f.partner ? T.attestationPartner(f.partner.name) : T.attestationInternal}</p>
                <p className="font-heading text-xl font-bold text-cta-on-navy">{T.examLabel} : {certification.name}</p>
                {certification.description && <p className="max-w-[60ch] text-base leading-relaxed text-white/90">{certification.description}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Qui anime */}
        <section className={cn(SECTION, "text-navy")}>
          <div className="reveal"><DeliveredByBlock formation={f} /></div>
        </section>

        {/* Un ancien */}
        {testimonial && (
          <section className={cn(SECTION, "bg-surface-sand pt-16 text-navy lg:pt-20")}>
            <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
              <img
                src="/images/photos/cohorte-salle.jpg"
                alt="Apprenants attentifs pendant une séance de formation"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="reveal aspect-[4/3] w-full rounded-t-[72px] object-cover lg:col-span-5"
              />
              <figure className="reveal flex flex-col gap-5 pb-2 lg:col-span-7 lg:pb-8" style={delay(90)}>
                <figcaption className="font-heading text-xl font-bold text-cta">{T.testimonial}</figcaption>
                <blockquote className="max-w-[40ch] font-heading text-[clamp(22px,2.4vw,34px)] font-bold leading-snug">« {testimonial.content} »</blockquote>
                <p className="text-base text-ink-secondary">
                  <span className="font-semibold text-navy">{testimonial.name}</span>
                  {testimonial.role ? `, ${testimonial.role}` : ""}{testimonial.company ? ` · ${testimonial.company}` : ""}
                </p>
              </figure>
            </div>
          </section>
        )}

        {!testimonial && (
          <section className="px-5 pb-20 lg:px-20 lg:pb-24">
            <div className="grid items-end gap-4 lg:grid-cols-12 lg:gap-6">
              <img
                src="/images/photos/cohorte-travail.jpg"
                alt="Apprenantes d'une cohorte Model Technologie travaillant ensemble sur un exercice, en salle à Dakar"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="reveal aspect-[4/3] w-full rounded-t-[72px] object-cover lg:col-span-7 lg:aspect-[3/2]"
              />
              <figure className="reveal lg:col-span-5" style={delay(90)}>
                <img
                  src="/images/photos/cohorte-salle.jpg"
                  alt="Apprenants attentifs pendant une séance de formation"
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full rounded-t-[72px] object-cover"
                />
                <figcaption className="pt-3 text-sm text-ink-secondary">{FORMATIONS_UI.photosCaption}</figcaption>
              </figure>
            </div>
          </section>
        )}

        {/* Questions */}
        {faq.length > 0 && (
          <section className={cn(SECTION, "text-navy")}>
            <h2 className={cn(H2, "reveal")}>{T.faq}</h2>
            <div className="reveal mt-10 max-w-4xl"><HomeFaq items={faq} /></div>
          </section>
        )}

        {/* À découvrir aussi */}
        {related.length > 0 && (
          <section className={cn(SECTION, "pt-0 text-navy lg:pt-0")}>
            <h2 className={cn(H2, "reveal")}>{T.related}</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
              {related.map((x) => (
                <CatalogueCard
                  key={x.id}
                  formation={x}
                  cohort={nextByFormation.get(x.id) ?? null}
                  today={today}
                  className="reveal"
                  onApply={(_, s) => setApplying(s)}
                />
              ))}
            </div>
          </section>
        )}

        <ClosingBand ref={closing} cohort={soonest} onApply={setApplying} />
      </div>

      <StickyApplyBar cohort={soonest} hideWhenVisible={stickyHides} hideFrom={closing} onApply={setApplying} desktop />

      {applying && <RegistrationModal bootcamp={allFormations.find((x) => x.id === applying.formationId) ?? f} session={applying} onClose={() => setApplying(null)} />}
    </SiteLayout>
  );
}
