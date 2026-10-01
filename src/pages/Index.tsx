/**
 * Index.tsx — Accueil, Lot 2 (docs/design/README.md §2, screens/site/Main.dc.html)
 *
 * Hero, par métier (domaines), parcours Data & BI (formations), bandeau Gestion
 * de projet, coaching, témoignages, entreprises, FAQ. Réutilise les données et
 * composants du Lot 1 (useDomains/useFormations/DomainCard/FormationCard) plutôt
 * que de dupliquer la logique du catalogue.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader, FaqAccordion } from "@/components/shared";
import { DomainCard } from "@/components/formations/DomainCard";
import { FormationCard } from "@/components/formations/FormationCard";
import { useDomains, useFormations } from "@/hooks/useFormations";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { getInitials } from "@/types/testimonial.types";
import { STATS } from "@/config/constants";

const FAQ_ITEMS = [
  { question: "Quand démarre la prochaine cohorte ?", answer: "Les dates varient par formation — consultez le calendrier sur la page Formations pour la prochaine session disponible." },
  { question: "Quels moyens de paiement acceptez-vous ?", answer: "Wave, Orange Money et virement bancaire. Les entreprises peuvent être facturées sur bon de commande." },
  { question: "Les formations sont-elles accessibles à distance ?", answer: "Cela dépend de la formation — le format (présentiel, en ligne, hybride) est indiqué sur chaque fiche formation." },
  { question: "Mon employeur peut-il financer ma formation ?", answer: "Oui, nous émettons une facture ou un bon de commande entreprise sur demande depuis la page Entreprises." },
];

export default function Index() {
  const { data: domains = [] } = useDomains();
  const { data: formations = [] } = useFormations();
  const { data: testimonials = [] } = usePublishedTestimonials();

  const featuredFormations = formations.filter((f) => f.featured).slice(0, 4);

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.home} />

      {/* Hero */}
      <section className="px-6 py-20 lg:px-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Pill variant="info" className="w-fit">Prochaine cohorte · candidatures ouvertes</Pill>
            <h1 className="font-heading text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[0.98] tracking-[-2px] text-navy">
              Des compétences data qui <span className="text-cta">changent votre carrière.</span>
            </h1>
            <p className="max-w-xl text-lg text-ink-secondary">
              Bootcamps Power BI, Python, SQL et Excel Finance à Dakar — le soir et le week-end, 100% pratique.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="primary" shape="pill">
                <Link to="/formations">Voir les formations</Link>
              </Button>
              <Button asChild variant="outline" shape="pill">
                <Link to="/orientation">Faire le quiz d'orientation</Link>
              </Button>
            </div>
          </div>
          <Card radius="hero" shadow className="grid grid-cols-2 gap-6 p-8">
            <div>
              <p className="font-heading text-3xl font-extrabold text-navy">{STATS.professionals}</p>
              <p className="text-sm text-ink-secondary">professionnels formés</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-navy">{STATS.certificationRate}</p>
              <p className="text-sm text-ink-secondary">en poste ou promus</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-navy">{STATS.satisfaction}</p>
              <p className="text-sm text-ink-secondary">taux de satisfaction</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-navy">{STATS.partners}</p>
              <p className="text-sm text-ink-secondary">entreprises partenaires</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Par métier / domaines */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow="PAR MÉTIER" title="Un domaine, plusieurs formations" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <DomainCard key={d.id} domain={d} formationCount={formations.filter((f) => f.domainId === d.id).length} />
          ))}
        </div>
      </section>

      {/* Parcours Data & BI */}
      <section className="bg-surface-sand px-6 py-16 lg:px-20">
        <SectionHeader
          eyebrow="NOS FORMATIONS"
          title="Choisissez votre parcours"
          action={
            <Button asChild variant="outline" shape="pill">
              <Link to="/formations">
                Tout voir <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredFormations.map((f) => (
            <FormationCard key={f.id} formation={f} />
          ))}
        </div>
      </section>

      {/* Gestion de projet banner */}
      <section className="bg-navy px-6 py-16 text-white lg:px-20">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-[1.5px] text-cta-on-navy">
              NOUVEAU · EN PARTENARIAT
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold">Gestion de projet & Agile</h2>
            <p className="mt-2 max-w-xl text-[#C9D4E0]">
              Scrum, certifications PM — dispensées par des experts partenaires certifiés.
            </p>
          </div>
          <Button asChild variant="primary" shape="pill">
            <Link to="/formations?domaine=gestion-de-projet-agile">Découvrir</Link>
          </Button>
        </div>
      </section>

      {/* Coaching teaser */}
      <section className="px-6 py-16 lg:px-20">
        <div className="grid items-center gap-10 rounded-hero border border-[#E7E0D4] bg-white p-10 lg:grid-cols-2">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-[1.5px] text-cta">
              COACHING INDIVIDUEL
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold text-navy">
              Votre fichier. Votre rythme. Un coach.
            </h2>
            <p className="mt-2 text-ink-secondary">
              Un accompagnement 1:1 sur vos propres fichiers Excel et Power BI, sans attendre la prochaine cohorte.
            </p>
          </div>
          <div className="flex gap-4 lg:justify-end">
            <Button asChild variant="primary" shape="pill">
              <Link to="/coaching">Réserver un appel diagnostic</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      {testimonials.length > 0 && (
        <section className="bg-surface-sand px-6 py-16 lg:px-20">
          <SectionHeader eyebrow="ILS L'ONT FAIT" title="Ce que disent nos alumni" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <Card key={t.id} radius="card" className="flex flex-col gap-4 p-6">
                <p className="text-sm text-ink-secondary">« {t.content} »</p>
                <div className="mt-auto flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-navy font-sans text-xs font-bold text-white">
                    {getInitials(t.name)}
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold text-navy">{t.name}</p>
                    <p className="text-xs text-ink-secondary">
                      {t.role}
                      {t.company ? ` · ${t.company}` : ""}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Entreprises teaser */}
      <section className="px-6 py-16 lg:px-20">
        <div className="grid items-center gap-10 rounded-hero bg-navy p-10 text-white lg:grid-cols-2">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-[1.5px] text-cta-on-navy">
              ENTREPRISES & INSTITUTIONS
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold">
              Rendez vos équipes autonomes sur la donnée.
            </h2>
          </div>
          <div className="flex gap-4 lg:justify-end">
            <Button asChild variant="primary" shape="pill">
              <Link to="/entreprises">Demander un diagnostic gratuit</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow="QUESTIONS FRÉQUENTES" title="Tout ce qu'il faut savoir" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </SiteLayout>
  );
}
