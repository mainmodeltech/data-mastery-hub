import { Building2, BookOpen, Target, HeadphonesIcon } from "lucide-react";

const values = [
  {
    icon: Building2,
    title: "Expertise bancaire & finance",
    description: "Des formateurs issus du monde de la banque et de la finance pour des cas d'usage métier concrets.",
  },
  {
    icon: BookOpen,
    title: "Formations pratiques et certifiantes",
    description: "Approche hands-on avec des exercices réels et préparation aux certifications Microsoft reconnues.",
  },
  {
    icon: Target,
    title: "Approche orientée résultats",
    description: "Focus sur les KPIs et tableaux de bord directement applicables à vos problématiques business.",
  },
  {
    icon: HeadphonesIcon,
    title: "Accompagnement post-formation",
    description: "Suivi personnalisé après la formation pour garantir la mise en pratique des compétences.",
  },
];

export function ValueProposition() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pourquoi choisir Model Technologie ?
          </h2>
          <p className="text-muted-foreground text-lg">
            Une expertise unique au service de votre transformation data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group p-8 bg-card rounded-xl border border-border hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <value.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-card-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
