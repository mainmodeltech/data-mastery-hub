/**
 * Formations.tsx — Lot 1 (docs/design/README.md §2, screens/site/Formations.dc.html)
 *
 * Catalogue par domaines : cartes domaines, filtres, grille groupée par domaine, calendrier des sessions
 * toutes formations confondues (données de l'API catalogue). Les textes d'habillage (titres, parcours,
 * FAQ, quiz) viennent du backend (contenu `page.formations`) ; si ce contenu est indisponible, le catalogue
 * reste affiché et seules ces sections sont masquées.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/shared/Button";
import { DomainCard } from "@/components/formations/DomainCard";
import { FormationCard } from "@/components/formations/FormationCard";
import { FilterBar, EMPTY_FILTERS, type FormationFilters } from "@/components/formations/FilterBar";
import { SessionsCalendarTable } from "@/components/formations/SessionsCalendarTable";
import { useFormations, useDomains, useAllFormationSessions } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Formations() {
  const { data: formations = [], isLoading, isError } = useFormations();
  const { data: domains = [] } = useDomains();
  const { data: sessions = [] } = useAllFormationSessions();
  const { content: c } = useSiteContent("page.formations");
  const [filters, setFilters] = useState<FormationFilters>(EMPTY_FILTERS);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const domainSlug = searchParams.get("domaine");
    if (!domainSlug || domains.length === 0) return;
    const domain = domains.find((d) => d.slug === domainSlug);
    if (domain) setFilters((prev) => ({ ...prev, domainId: domain.id }));
  }, [searchParams, domains]);

  const targetRoles = useMemo(
    () => Array.from(new Set(formations.flatMap((f) => f.targetRoles))).sort(),
    [formations]
  );

  const filtered = useMemo(
    () =>
      formations.filter((f) => {
        if (filters.domainId !== "all" && f.domainId !== filters.domainId) return false;
        if (filters.level !== "all" && f.level !== filters.level) return false;
        if (filters.format !== "all" && f.format !== filters.format) return false;
        if (filters.deliveredBy !== "all" && f.deliveredBy !== filters.deliveredBy) return false;
        if (filters.targetRole !== "all" && !f.targetRoles.includes(filters.targetRole)) return false;
        return true;
      }),
    [formations, filters]
  );

  const byDomain = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const f of filtered) {
      const list = map.get(f.domainId) ?? [];
      list.push(f);
      map.set(f.domainId, list);
    }
    return map;
  }, [filtered]);

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.formations} />

      {/* Hero */}
      {c && (
        <section className="px-6 pb-10 pt-20 text-center lg:px-20">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.hero.eyebrow}</span>
          <h1 className="mx-auto mt-4 max-w-3xl font-heading text-[clamp(32px,5vw,52px)] font-extrabold tracking-[-1.5px] text-navy">
            {c.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-secondary">{c.hero.description}</p>
          {c.hero.image && (
            <img
              src={c.hero.image}
              alt={c.hero.imageAlt}
              loading="eager"
              className="mx-auto mt-10 h-56 w-full max-w-5xl rounded-hero object-cover object-[center_60%] sm:h-72 lg:h-80"
            />
          )}
        </section>
      )}

      {/* Nos domaines */}
      <section className="px-6 pb-16 pt-10 lg:px-20">
        {c && <SectionHeader eyebrow={c.domains.eyebrow} title={c.domains.title} />}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              formationCount={formations.filter((f) => f.domainId === d.id).length}
              onBrowse={() => setFilters({ ...EMPTY_FILTERS, domainId: d.id })}
            />
          ))}
        </div>
      </section>

      {/* Filtres + grille */}
      <section id="catalogue" className="px-6 pb-20 lg:px-20">
        <FilterBar domains={domains} targetRoles={targetRoles} filters={filters} onChange={setFilters} />

        {isLoading && <p className="mt-10 text-sm text-ink-secondary">{c?.domains.loading ?? "…"}</p>}
        {isError && (
          <p role="alert" className="mt-10 rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Le catalogue est momentanément indisponible. Réessayez dans quelques instants ou contactez-nous.
          </p>
        )}

        <div className="mt-10 flex flex-col gap-16">
          {Array.from(byDomain.entries()).map(([domainId, items]) => {
            const domain = domains.find((d) => d.id === domainId);
            if (!domain) return null;
            const line = c
              ? items.some((i) => i.deliveredBy === "PARTNER") ? c.domains.partnerLine : c.domains.internalLine
              : null;
            return (
              <div key={domainId} className="flex flex-col gap-6">
                <div>
                  <h2 className="font-heading text-2xl font-extrabold text-navy">{domain.name}</h2>
                  <p className="text-sm text-ink-secondary">
                    {line && <>{line} · </>}
                    {items.length} formation{items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((f) => (
                    <FormationCard key={f.id} formation={f} />
                  ))}
                </div>
              </div>
            );
          })}

          {!isLoading && !isError && filtered.length === 0 && c && (
            <p className="text-sm text-ink-secondary">{c.domains.empty}</p>
          )}
        </div>
      </section>

      {/* Calendrier */}
      {c && (
        <section className="px-6 pb-20 lg:px-20">
          <SectionHeader eyebrow={c.calendar.eyebrow} title={c.calendar.title} description={c.calendar.description} />
          <div className="mt-8">
            <SessionsCalendarTable sessions={sessions} />
          </div>
        </section>
      )}

      {/* Comment ça se passe */}
      {c && c.process.steps.length > 0 && (
        <section className="bg-surface-sand px-6 py-20 lg:px-20">
          <SectionHeader eyebrow={c.process.eyebrow} title={c.process.title} align="center" />
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.process.steps.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-2 rounded-card bg-white p-6">
                <span className="font-heading text-2xl font-extrabold text-cta">{i + 1}</span>
                <p className="font-heading text-base font-bold text-navy">{step.title}</p>
                <p className="text-sm text-ink-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quiz CTA */}
      {c && (
        <section className="bg-navy px-6 py-16 text-center lg:px-20">
          <h2 className="font-heading text-2xl font-extrabold text-white">{c.quiz.title}</h2>
          <p className="mt-2 text-[#C9D4E0]">{c.quiz.description}</p>
          <Button asChild variant="primary" className="mt-6" shape="pill">
            <Link to={c.quiz.cta.href}>{c.quiz.cta.label}</Link>
          </Button>
        </section>
      )}

      {/* FAQ */}
      {c && c.faq.items.length > 0 && (
        <section className="px-6 py-20 lg:px-20">
          <SectionHeader eyebrow={c.faq.eyebrow} title={c.faq.title} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {c.faq.items.map((item) => (
              <div key={item.question} className="rounded-card border border-[#E7E0D4] bg-white p-6">
                <p className="font-heading text-base font-bold text-navy">{item.question}</p>
                <p className="mt-2 text-sm text-ink-secondary">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
