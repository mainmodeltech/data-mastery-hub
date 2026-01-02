import { Link } from "react-router-dom";
import { ArrowRight, Award, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { icon: Users, value: "500+", label: "Professionnels formés" },
  { icon: Award, value: "15+", label: "Entreprises partenaires" },
  { icon: TrendingUp, value: "98%", label: "Taux de satisfaction" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-accent text-sm font-medium">Nouveau bootcamp Power BI - Janvier 2026</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Formez vos équipes à la
            <span className="text-accent block mt-2">maîtrise de la donnée</span>
          </h1>

          <p className="text-lg md:text-xl text-background/80 mb-8 leading-relaxed max-w-2xl opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Formations Power BI & Data Analytics orientées finance, performance et prise de décision. 
            Accompagnement vers la certification Microsoft.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button asChild size="xl" variant="hero">
              <Link to="/bootcamps">
                Découvrir nos formations
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="hero-outline">
              <Link to="/contact">
                Demander un devis
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <stat.icon className="h-5 w-5 text-accent" />
                  <span className="font-heading text-2xl md:text-3xl font-bold text-background">{stat.value}</span>
                </div>
                <span className="text-background/60 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
