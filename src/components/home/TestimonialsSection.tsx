import { Quote, Star, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const staticTestimonials = [
  {
    name: "Amadou Diallo",
    role: "Data Analyst",
    company: "CBAO Groupe Attijariwafa",
    bootcamp: "SQL & Python",
    bootcampColor: "text-primary bg-primary/10",
    result: "Embauché en 3 mois après le bootcamp",
    resultIcon: TrendingUp,
    content:
        "Le bootcamp m'a donné exactement les compétences qu'on attendait de moi lors des entretiens. En 12 semaines, j'ai appris Python, SQL et réalisé un vrai projet d'analyse que j'ai présenté comme portfolio.",
    rating: 5,
    initials: "AD",
    gradient: "from-primary to-accent",
  },
  {
    name: "Fatou Ndiaye",
    role: "Contrôleur de Gestion",
    company: "Groupe Sonatel",
    bootcamp: "Power BI",
    bootcampColor: "text-accent bg-accent/10",
    result: "Réduit ses reportings de 2 jours à 2 heures",
    resultIcon: TrendingUp,
    content:
        "Mon reporting mensuel prenait 2 jours de travail. Après la formation Power BI, je l'automatise en 2 heures. Mon directeur m'a demandé de former toute l'équipe finance.",
    rating: 5,
    initials: "FN",
    gradient: "from-accent to-primary",
  },
  {
    name: "Moussa Sow",
    role: "Chef de Projet Data",
    company: "Wave Mobile Money",
    bootcamp: "SQL & Python",
    bootcampColor: "text-primary bg-primary/10",
    result: "Promotion obtenue en 6 mois",
    resultIcon: TrendingUp,
    content:
        "J'étais développeur web et je voulais me reconvertir en data. Le bootcamp m'a offert un parcours structuré avec de vrais projets. J'ai décroché un poste de Chef de Projet Data chez Wave.",
    rating: 5,
    initials: "MS",
    gradient: "from-primary to-[hsl(217,72%,30%)]",
  },
];

export function TestimonialsSection() {
  const { data } = useQuery({
    queryKey: ["testimonials-home"],
    queryFn: async () => {
      const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("published", true)
          .order("display_order", { ascending: true })
          .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const testimonials = data && data.length > 0 ? data : staticTestimonials;

  return (
      <section className="py-20 lg:py-28 bg-secondary/30 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/4 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
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

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((t: any, index: number) => {
              const ResultIcon = t.resultIcon || TrendingUp;
              return (
                  <div
                      key={t.name}
                      className="group relative bg-card rounded-2xl border border-border p-7 hover:border-primary/30 hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in flex flex-col"
                      style={{ animationDelay: `${0.1 + index * 0.12}s` }}
                  >
                    {/* Quote icon */}
                    <Quote className="absolute top-6 right-6 h-8 w-8 text-muted/30 group-hover:text-primary/20 transition-colors" />

                    {/* Bootcamp tag */}
                    <div className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full mb-5 w-fit ${t.bootcampColor || "text-primary bg-primary/10"}`}>
                      {t.bootcamp || "Bootcamp"}
                    </div>

                    {/* Result highlight */}
                    <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-secondary/50 border border-border">
                      <ResultIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">{t.result || "Résultat remarquable"}</span>
                    </div>

                    {/* Testimonial */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 italic">
                      "{t.content}"
                    </p>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient || "from-primary to-accent"} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{t.initials || t.name?.substring(0, 2) || "??"}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-card-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/alumni">
                Voir tous les témoignages
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
  );
}
