import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  GraduationCap, 
  Building, 
  Award, 
  ArrowRight, 
  CheckCircle,
  FileSpreadsheet,
  Users
} from "lucide-react";

const services = [
  {
    icon: BarChart3,
    title: "Formation Power BI",
    description: "Maîtrisez Microsoft Power BI, l'outil de référence en Business Intelligence. Des fondamentaux à l'expertise avancée.",
    features: [
      "Création de tableaux de bord interactifs",
      "DAX et modélisation de données",
      "Connexion aux sources de données",
      "Partage et collaboration",
      "Bonnes pratiques de visualisation",
    ],
    duration: "3 à 5 jours selon le niveau",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Avancé & VBA",
    description: "Allez au-delà des bases d'Excel. Automatisez vos tâches et créez des outils de gestion puissants.",
    features: [
      "Fonctions avancées (INDEX, MATCH, XLOOKUP)",
      "Tableaux croisés dynamiques",
      "Introduction à VBA et macros",
      "Power Query pour l'ETL",
      "Automatisation des reportings",
    ],
    duration: "2 à 3 jours",
  },
  {
    icon: Building,
    title: "Formations Intra-entreprise",
    description: "Programmes personnalisés adaptés à vos problématiques métier et à votre contexte organisationnel.",
    features: [
      "Analyse de vos besoins spécifiques",
      "Contenu sur-mesure",
      "Exercices basés sur vos données",
      "Sessions dans vos locaux",
      "Suivi post-formation inclus",
    ],
    duration: "Sur mesure",
  },
  {
    icon: Award,
    title: "Préparation Certification Microsoft",
    description: "Préparez et réussissez l'examen PL-300 Microsoft Power BI Data Analyst Associate.",
    features: [
      "Revue complète du programme d'examen",
      "Exercices pratiques ciblés",
      "Examens blancs commentés",
      "Conseils et astuces pour le jour J",
      "Taux de réussite supérieur à 90%",
    ],
    duration: "2 à 3 jours",
  },
  {
    icon: Users,
    title: "Coaching & Accompagnement",
    description: "Accompagnement individuel ou en équipe pour vos projets data et la montée en compétences continue.",
    features: [
      "Sessions de coaching personnalisées",
      "Revue de vos tableaux de bord",
      "Conseils d'optimisation",
      "Transfert de compétences",
      "Support continu",
    ],
    duration: "À la demande",
  },
  {
    icon: GraduationCap,
    title: "Bootcamps Intensifs",
    description: "Programmes courts et intensifs pour une montée en compétences rapide et efficace.",
    features: [
      "Format immersif sur quelques jours",
      "Projets pratiques fil rouge",
      "Travail en groupe",
      "Certification de fin de bootcamp",
      "Accès à la communauté alumni",
    ],
    duration: "3 à 5 jours",
  },
];

const Services = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nos Services
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Des formations et accompagnements sur-mesure pour développer les compétences 
              Data de vos équipes et accélérer votre transformation digitale.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group p-8 lg:p-10 bg-card rounded-2xl border border-border hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.05 + index * 0.05}s` }}
              >
                <div className="grid lg:grid-cols-[1fr,2fr,auto] gap-8 items-start">
                  <div>
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                      <service.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{service.duration}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-card-foreground mb-3">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-card-foreground">
                          <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:self-center">
                    <Button asChild>
                      <Link to="/contact">
                        Demander un devis
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Un projet de formation sur-mesure ?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Contactez-nous pour discuter de vos besoins spécifiques et obtenir une proposition adaptée.
            </p>
            <Button asChild size="xl" variant="hero">
              <Link to="/contact">
                Parlons de votre projet
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
