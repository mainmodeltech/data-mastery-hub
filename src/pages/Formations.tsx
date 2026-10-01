/**
 * Formations.tsx — Lot 1 (docs/design/README.md §2, screens/site/Formations.dc.html)
 *
 * Catalogue par domaines : cartes domaines, filtres, grille groupée par domaine,
 * calendrier des sessions toutes formations confondues. Construit contre des
 * données de démonstration (voir src/types/formation.type.ts) en attendant les
 * entités Domain/Partner côté backend — coexiste avec /bootcamps (page de
 * production actuelle, données réelles) plutôt que de la remplacer.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/layouts/SiteLayout";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/shared/Button";
import { DomainCard } from "@/components/formations/DomainCard";
import { FormationCard } from "@/components/formations/FormationCard";
import { FilterBar, EMPTY_FILTERS, type FormationFilters } from "@/components/formations/FilterBar";
import { SessionsCalendarTable } from "@/components/formations/SessionsCalendarTable";
import { useFormations, useDomains, useAllFormationSessions } from "@/hooks/useFormations";

const PROCESS_STEPS = [
  { title: "Candidature", description: "Remplissez le formulaire en quelques minutes." },
  { title: "Test de positionnement", description: "Un court test pour valider votre niveau." },
  { title: "La formation", description: "Cohorte intensive, le soir et le week-end." },
  { title: "Projet & certificat", description: "Un projet final évalué par un jury." },
];

const FAQ_ITEMS = [
  { q: "Comment fonctionnent les formations en partenariat ?", a: "Le contenu et l'animation sont assurés par le partenaire ; l'inscription, le paiement et le suivi restent gérés par Model Technologie." },
  { q: "Compatible avec un emploi à temps plein ?", a: "Oui — nos cohortes se déroulent le soir et le week-end." },
  { q: "Les frais d'examen sont-ils inclus ?", a: "Cela dépend de la formation — le détail est indiqué sur chaque fiche formation." },
  { q: "Mon employeur peut-il payer la formation ?", a: "Oui, nous émettons un bon de commande / facture entreprise sur demande." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Wave, Orange Money et virement bancaire." },
];

export default function Formations() {
  const { data: formations = [], isLoading } = useFormations();
  const { data: domains = [] } = useDomains();
  const { data: sessions = [] } = useAllFormationSessions();
  const [filters, setFilters] = useState<FormationFilters>(EMPTY_FILTERS);

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
      {/* Hero */}
      <section className="px-6 py-20 text-center lg:px-20">
        <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
          CATALOGUE DES FORMATIONS
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl font-heading text-[clamp(32px,5vw,52px)] font-extrabold tracking-[-1.5px] text-navy">
          Les compétences qui font gagner du temps.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-secondary">
          Formations dispensées par nos formateurs ou par des partenaires experts — inscription, paiement et suivi
          toujours gérés par Model Technologie.
        </p>
      </section>

      {/* Nos domaines */}
      <section className="px-6 pb-16 lg:px-20">
        <SectionHeader eyebrow="NOS DOMAINES" title="Un domaine, plusieurs formations" />
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

        {isLoading && <p className="mt-10 text-sm text-ink-secondary">Chargement des formations…</p>}

        <div className="mt-10 flex flex-col gap-16">
          {Array.from(byDomain.entries()).map(([domainId, items]) => {
            const domain = domains.find((d) => d.id === domainId);
            if (!domain) return null;
            return (
              <div key={domainId} className="flex flex-col gap-6">
                <div>
                  <h2 className="font-heading text-2xl font-extrabold text-navy">{domain.name}</h2>
                  <p className="text-sm text-ink-secondary">
                    {items.some((i) => i.deliveredBy === "PARTNER")
                      ? "En partenariat · inscription et suivi par Model Technologie"
                      : "Conçues et dispensées par Model Technologie"}{" "}
                    · {items.length} formation{items.length > 1 ? "s" : ""}
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

          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-ink-secondary">Aucune formation ne correspond à ces filtres.</p>
          )}
        </div>
      </section>

      {/* Calendrier */}
      <section className="px-6 pb-20 lg:px-20">
        <SectionHeader eyebrow="CALENDRIER" title="Prochaines sessions" description="Tous domaines confondus, par date." />
        <div className="mt-8">
          <SessionsCalendarTable sessions={sessions} />
        </div>
      </section>

      {/* Comment ça se passe */}
      <section className="bg-surface-sand px-6 py-20 lg:px-20">
        <SectionHeader eyebrow="LE PARCOURS" title="Comment ça se passe" align="center" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-card bg-white p-6">
              <span className="font-heading text-2xl font-extrabold text-cta">{i + 1}</span>
              <p className="font-heading text-base font-bold text-navy">{step.title}</p>
              <p className="text-sm text-ink-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="bg-navy px-6 py-16 text-center lg:px-20">
        <h2 className="font-heading text-2xl font-extrabold text-white">
          Vous ne savez pas quelle formation choisir ?
        </h2>
        <p className="mt-2 text-[#C9D4E0]">Faites notre quiz d'orientation en 2 minutes.</p>
        <Button asChild variant="primary" className="mt-6" shape="pill">
          <Link to="/orientation">Faire le quiz</Link>
        </Button>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 lg:px-20">
        <SectionHeader eyebrow="QUESTIONS FRÉQUENTES" title="Tout ce qu'il faut savoir" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="rounded-card border border-[#E7E0D4] bg-white p-6">
              <p className="font-heading text-base font-bold text-navy">{item.q}</p>
              <p className="mt-2 text-sm text-ink-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
