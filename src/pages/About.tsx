import { Layout } from "@/components/layout/Layout";
import { Target, Eye, Heart, Award } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque formation, avec des contenus constamment mis à jour.",
  },
  {
    icon: Eye,
    title: "Innovation",
    description: "Nous adoptons les dernières technologies et méthodes pédagogiques pour un apprentissage optimal.",
  },
  {
    icon: Heart,
    title: "Engagement",
    description: "Nous nous engageons pour la réussite de chaque participant, avec un suivi personnalisé.",
  },
  {
    icon: Award,
    title: "Impact",
    description: "Nous mesurons notre succès à l'impact concret de nos formations sur la performance de nos clients.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              À propos de Model Technologie
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Depuis notre création, nous accompagnons les entreprises et professionnels africains 
              dans leur montée en compétences Data & Analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Notre histoire</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                Une expertise née du terrain
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Model Technologie a été fondée par des professionnels issus du monde de la banque 
                  et de la finance, convaincus que la maîtrise des données est un levier stratégique 
                  pour les entreprises africaines.
                </p>
                <p>
                  Notre fondateur, fort d'une expérience de plus de 10 ans dans le secteur bancaire 
                  et le conseil en transformation digitale, a créé Model Technologie avec une mission claire : 
                  démocratiser l'accès aux compétences Data en Afrique francophone.
                </p>
                <p>
                  Aujourd'hui, nous sommes fiers d'avoir formé plus de 500 professionnels et accompagné 
                  plus de 15 entreprises dans leur transformation data, des banques aux institutions 
                  internationales.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="font-heading text-6xl font-bold text-primary">10+</span>
                    <p className="text-muted-foreground mt-2">Années d'expertise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-8 lg:p-12 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-card-foreground mb-4">Notre Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Accompagner les entreprises et professionnels africains dans leur transformation data 
                en leur fournissant des formations de qualité internationale, pratiques et orientées résultats, 
                adaptées aux réalités du marché local.
              </p>
            </div>
            <div className="p-8 lg:p-12 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-card-foreground mb-4">Notre Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                Devenir la référence en formation Data & Business Intelligence en Afrique francophone, 
                en contribuant à l'émergence d'une nouvelle génération de professionnels capables de 
                transformer les données en décisions stratégiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos valeurs
            </h2>
            <p className="text-muted-foreground text-lg">
              Les principes qui guident notre action au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-8 opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
