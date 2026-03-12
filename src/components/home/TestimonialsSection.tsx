/**
 * TestimonialsSection.tsx
 *
 * Section témoignages — défilement continu horizontal infini (marquee CSS).
 * - Deux rangées en sens opposés pour un effet dynamique
 * - Pause au hover
 * - Skeleton pendant le chargement
 * - Fallback statique si le backend est vide / inaccessible
 */

import { Quote, Star, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial } from "@/types/testimonial.types";
import {
  getInitials,
  getGradientFromName,
  getBootcampColorClass,
  getResultFallback,
} from "@/types/testimonial.types";

// ─── Données statiques de fallback ───────────────────────────────────────────

const staticTestimonials: Testimonial[] = [
  {
    id: "static-1",
    name: "Amadou Diallo",
    role: "Data Analyst",
    company: "CBAO Groupe Attijariwafa",
    bootcamp: "Data Analyst",
    result: "Embauché en 3 mois après le bootcamp",
    content:
        "Le bootcamp m'a donné exactement les compétences qu'on attendait de moi lors des entretiens. En 12 semaines, j'ai appris Python, SQL et réalisé un vrai projet d'analyse.",
    rating: 5,
    published: true,
    displayOrder: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "static-2",
    name: "Fatou Ndiaye",
    role: "Contrôleur de Gestion",
    company: "Groupe Sonatel",
    bootcamp: "Power BI",
    result: "Réduit ses reportings de 2 jours à 2 heures",
    content:
        "Mon reporting mensuel prenait 2 jours de travail. Après la formation Power BI, je l'automatise en 2 heures. Mon directeur m'a demandé de former toute l'équipe finance.",
    rating: 5,
    published: true,
    displayOrder: 2,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "static-3",
    name: "Moussa Sow",
    role: "Chef de Projet Data",
    company: "Wave Mobile Money",
    bootcamp: "Data Analyst",
    result: "Promotion obtenue en 6 mois",
    content:
        "J'étais développeur web et je voulais me reconvertir en data. Le bootcamp m'a offert un parcours structuré avec de vrais projets.",
    rating: 5,
    published: true,
    displayOrder: 3,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "static-4",
    name: "Aïssatou Ba",
    role: "Business Analyst",
    company: "Orange Sénégal",
    bootcamp: "Power BI",
    result: "Nouvelle mission confiée en 1 mois",
    content:
        "Grâce aux dashboards Power BI, j'ai présenté une analyse qui a convaincu la direction de lancer un nouveau projet. Ma crédibilité a vraiment changé.",
    rating: 5,
    published: true,
    displayOrder: 4,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "static-5",
    name: "Ibrahim Camara",
    role: "Data Engineer Junior",
    company: "Baobab Groupe",
    bootcamp: "Data Analyst",
    result: "Premier CDI décroché à 24 ans",
    content:
        "Sans expérience formelle, j'avais peu de chances. Mon portfolio réalisé pendant le bootcamp a tout changé : les recruteurs voyaient du concret.",
    rating: 5,
    published: true,
    displayOrder: 5,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "static-6",
    name: "Rokhaya Diop",
    role: "Responsable Reporting",
    company: "BICIS",
    bootcamp: "Power BI",
    result: "Processus automatisé, gain de 8h/semaine",
    content:
        "J'automatise désormais des tâches qui me prenaient des heures. La formation est dense mais très pratique — j'appliquais dès le lendemain.",
    rating: 5,
    published: true,
    displayOrder: 6,
    createdAt: "",
    updatedAt: "",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Duplique le tableau pour créer la boucle seamless */
function duplicate<T>(arr: T[]): T[] {
  return [...arr, ...arr];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
      <div className="flex-shrink-0 w-80 bg-card rounded-2xl border border-border p-6 animate-pulse">
        <div className="h-5 w-20 rounded-full bg-secondary mb-4" />
        <div className="h-10 w-full rounded-lg bg-secondary mb-4" />
        <div className="space-y-2 mb-5">
          <div className="h-3 bg-secondary rounded w-full" />
          <div className="h-3 bg-secondary rounded w-4/5" />
          <div className="h-3 bg-secondary rounded w-3/5" />
        </div>
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 w-3 rounded-full bg-secondary" />
          ))}
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="w-9 h-9 rounded-full bg-secondary flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-secondary rounded w-2/3" />
            <div className="h-2.5 bg-secondary rounded w-1/2" />
          </div>
        </div>
      </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const colorClass = getBootcampColorClass(testimonial.bootcamp);
  const result     = testimonial.result ?? getResultFallback(testimonial.bootcamp);
  const initials   = getInitials(testimonial.name);
  const gradient   = getGradientFromName(testimonial.name);

  return (
      <div className="flex-shrink-0 w-80 bg-card rounded-2xl border border-border p-6 flex flex-col hover:border-primary/30 hover:shadow-card transition-colors duration-300 group">
        {/* Badge bootcamp */}
        {testimonial.bootcamp && (
            <div
                className={cn(
                    "inline-flex items-center text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit",
                    colorClass,
                )}
            >
              {testimonial.bootcamp}
            </div>
        )}

        {/* Résultat */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-secondary/60 border border-border">
          <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-foreground leading-snug">{result}</span>
        </div>

        {/* Contenu */}
        <div className="relative flex-1 mb-4">
          <Quote className="absolute -top-1 -left-1 h-5 w-5 text-primary/15" />
          <p className="text-muted-foreground text-sm leading-relaxed italic pl-3 line-clamp-4">
            "{testimonial.content}"
          </p>
        </div>

        {/* Étoiles */}
        <div className="flex gap-0.5 mb-4">
          {[...Array(testimonial.rating ?? 5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          ))}
        </div>

        {/* Auteur */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: gradient }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-card-foreground truncate">
              {testimonial.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      </div>
  );
}

// ─── Marquee Row ──────────────────────────────────────────────────────────────

function MarqueeRow({
                      items,
                      reverse = false,
                      duration = 40,
                    }: {
  items: Testimonial[];
  reverse?: boolean;
  duration?: number;
}) {
  const looped = duplicate(items);

  return (
      <div
          className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
          // Pause on hover via CSS group
      >
        <div
            className={cn(
                "flex gap-5 w-max",
                reverse ? "animate-marquee-reverse" : "animate-marquee",
                // Pause au hover sur le conteneur parent (section)
                "group-hover/marquee:[animation-play-state:paused]",
            )}
            style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        >
          {looped.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
          ))}
        </div>
      </div>
  );
}

// ─── Section principale ───────────────────────────────────────────────────────

export function TestimonialsSection() {
  const { data, isLoading } = usePublishedTestimonials();

  // 4 derniers témoignages publiés (triés par displayOrder côté backend)
  const source = (data && data.length > 0 ? data : staticTestimonials).slice(0, 4);

  return (
      <section className="py-20 lg:py-28 bg-secondary/30 relative overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/4 blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* En-tête */}
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/25 text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-4">
                <Star className="h-3.5 w-3.5 fill-current" />
                Histoires de réussite
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Des résultats concrets,{" "}
                <span className="text-primary">pas des promesses</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Découvrez ce que nos alumni ont accompli après leur bootcamp.
              </p>
            </div>
          </div>

          {/* Défilement — group pour le pause-on-hover */}
          <div className="group/marquee space-y-5">
            {isLoading ? (
                <>
                  {/* Skeleton — une rangée de 4 cartes */}
                  <div className="flex gap-5 px-4 overflow-hidden">
                    {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                </>
            ) : (
                <MarqueeRow items={source} reverse={false} duration={32} />
                )}
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 lg:px-8">
              <div className="text-center mt-12">
                <Button asChild variant="outline" size="lg" className="group">
                  <Link to="/alumni">
                    Voir tous les témoignages
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
      </section>
  );
}
