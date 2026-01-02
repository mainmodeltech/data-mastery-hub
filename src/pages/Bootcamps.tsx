import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle,
  Download
} from "lucide-react";

const bootcamps = [
  {
    title: "Power BI pour la Finance",
    description: "Maîtrisez Power BI avec des cas pratiques orientés finance : analyse de la rentabilité, suivi budgétaire, reporting financier automatisé.",
    duration: "5 jours (35h)",
    audience: "Contrôleurs de gestion, DAF, analystes financiers",
    prerequisites: "Maîtrise d'Excel, notions de comptabilité",
    price: "450 000 FCFA",
    nextSession: "20 - 24 Janvier 2026",
    benefits: [
      "Tableaux de bord financiers interactifs",
      "Automatisation des reportings mensuels",
      "Analyse de variance et KPIs",
      "Connexion aux sources comptables",
      "Certification de fin de formation",
    ],
    featured: true,
  },
  {
    title: "Data Analytics pour Managers",
    description: "Développez une culture data-driven. Apprenez à interpréter les données et prendre des décisions éclairées basées sur les faits.",
    duration: "3 jours (21h)",
    audience: "Managers, directeurs, chefs de projet",
    prerequisites: "Aucun prérequis technique",
    price: "350 000 FCFA",
    nextSession: "10 - 12 Février 2026",
    benefits: [
      "Lecture et interprétation des données",
      "Identification des KPIs pertinents",
      "Prise de décision basée sur les données",
      "Communication avec les équipes data",
      "Initiation à Power BI",
    ],
    featured: false,
  },
  {
    title: "Reporting & Data Visualization",
    description: "Créez des visualisations impactantes et des rapports automatisés qui communiquent efficacement vos insights.",
    duration: "4 jours (28h)",
    audience: "Analystes, chargés de reporting, data analysts",
    prerequisites: "Bases Excel, esprit analytique",
    price: "400 000 FCFA",
    nextSession: "3 - 6 Mars 2026",
    benefits: [
      "Principes de data visualization",
      "Power BI Desktop complet",
      "Conception de dashboards efficaces",
      "Storytelling avec les données",
      "Publication et partage",
    ],
    featured: false,
  },
  {
    title: "Préparation Certification PL-300",
    description: "Préparez-vous intensivement à l'examen Microsoft PL-300 Power BI Data Analyst avec un taux de réussite supérieur à 90%.",
    duration: "3 jours (21h)",
    audience: "Utilisateurs Power BI confirmés",
    prerequisites: "Expérience Power BI (6 mois minimum)",
    price: "300 000 FCFA",
    nextSession: "17 - 19 Mars 2026",
    benefits: [
      "Révision complète du syllabus",
      "Exercices pratiques ciblés",
      "3 examens blancs commentés",
      "Stratégies de passage d'examen",
      "Support jusqu'à l'examen",
    ],
    featured: false,
  },
];

const Bootcamps = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Bootcamps & Formations
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Des programmes intensifs pour une montée en compétences rapide. 
              Formations pratiques, cas réels et certification.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/contact">
                  S'inscrire à un bootcamp
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#" download>
                  <Download className="h-4 w-4" />
                  Télécharger le catalogue
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bootcamps List */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-8">
            {bootcamps.map((bootcamp, index) => (
              <div
                key={bootcamp.title}
                className={`relative p-8 lg:p-10 rounded-2xl border transition-all duration-300 opacity-0 animate-fade-in ${
                  bootcamp.featured 
                    ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30" 
                    : "bg-card border-border"
                }`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {bootcamp.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                    Prochaine session
                  </div>
                )}

                <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
                  <div>
                    <h3 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">
                      {bootcamp.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {bootcamp.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Durée</p>
                          <p className="text-sm font-medium text-foreground">{bootcamp.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Public cible</p>
                          <p className="text-sm font-medium text-foreground">{bootcamp.audience}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prérequis</p>
                          <p className="text-sm font-medium text-foreground">{bootcamp.prerequisites}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prochaine session</p>
                          <p className="text-sm font-medium text-accent">{bootcamp.nextSession}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Ce que vous apprendrez :</p>
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {bootcamp.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:border-l lg:border-border lg:pl-8 flex flex-col justify-center">
                    <div className="text-center lg:text-left mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Tarif</p>
                      <p className="font-heading text-3xl font-bold text-foreground">{bootcamp.price}</p>
                      <p className="text-xs text-muted-foreground mt-1">Supports de formation inclus</p>
                    </div>
                    <div className="space-y-3">
                      <Button asChild className="w-full" size="lg">
                        <Link to="/contact">
                          S'inscrire
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/contact">
                          En savoir plus
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Besoin d'une formation sur-mesure ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Nous pouvons adapter nos bootcamps à vos besoins spécifiques ou créer un programme entièrement personnalisé.
            </p>
            <Button asChild size="xl">
              <Link to="/contact">
                Discutons de votre projet
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Bootcamps;
