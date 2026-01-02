import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amadou Diallo",
    role: "Directeur Financier",
    company: "Banque Régionale",
    content: "La formation Power BI a transformé notre façon d'analyser les données. Nos reportings sont maintenant automatisés et visuellement impactants.",
    rating: 5,
  },
  {
    name: "Fatou Ndiaye",
    role: "Contrôleur de Gestion",
    company: "Groupe Industriel",
    content: "Excellent formateur avec une vraie expertise métier. Les cas pratiques étaient directement applicables à mon quotidien professionnel.",
    rating: 5,
  },
  {
    name: "Moussa Sow",
    role: "Analyste Data",
    company: "Cabinet de Conseil",
    content: "Le bootcamp intensif m'a permis de décrocher ma certification Microsoft en seulement 2 mois. Je recommande vivement !",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce que disent nos participants
          </h2>
          <p className="text-muted-foreground text-lg">
            Découvrez les retours d'expérience de professionnels formés par Model Technologie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative p-8 bg-card rounded-xl border border-border opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <Quote className="absolute top-6 right-6 h-10 w-10 text-primary/10" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-card-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
