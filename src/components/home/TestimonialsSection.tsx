/**
 * Section Temoignages de la page d'accueil.
 * Utilise le hook usePublishedTestimonials.
 */

import { Star, Quote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedTestimonials } from '@/hooks/useTestimonials';
import type { Testimonial } from '@/types';

const staticTestimonials: Pick<Testimonial, 'name' | 'role' | 'company' | 'content' | 'rating'>[] = [
  {
    name: 'Amadou Diallo',
    role: 'Directeur Financier',
    company: 'Banque Regionale',
    content: 'La formation Power BI a transforme notre facon d\'analyser les donnees. Nos reportings sont maintenant automatises et visuellement impactants.',
    rating: 5,
  },
  {
    name: 'Fatou Ndiaye',
    role: 'Controleur de Gestion',
    company: 'Groupe Industriel',
    content: 'Excellent formateur avec une vraie expertise metier. Les cas pratiques etaient directement applicables a mon quotidien professionnel.',
    rating: 5,
  },
  {
    name: 'Moussa Sow',
    role: 'Analyste Data',
    company: 'Cabinet de Conseil',
    content: 'Le bootcamp intensif m\'a permis de decrocher ma certification Microsoft en seulement 2 mois. Je recommande vivement !',
    rating: 5,
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = usePublishedTestimonials();

  const displayTestimonials = testimonials && testimonials.length > 0
    ? testimonials.slice(0, 3)
    : staticTestimonials;

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce que disent nos participants
          </h2>
          <p className="text-muted-foreground text-lg">
            Decouvrez les retours d'experience de professionnels formes par Model Technologie
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="relative p-8 bg-card rounded-xl border border-border opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10" />

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating ?? 5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-card-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">
                      {getInitials(testimonial.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company ? `, ${testimonial.company}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
