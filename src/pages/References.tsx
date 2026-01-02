import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Quote, ArrowRight, Award, Building2, GraduationCap } from "lucide-react";

const clients = [
  { name: "SGBS", sector: "Banque", logo: "SGBS" },
  { name: "Bank of Africa", sector: "Banque", logo: "BOA" },
  { name: "CBAO", sector: "Banque", logo: "CBAO" },
  { name: "AXA Assurances", sector: "Assurance", logo: "AXA" },
  { name: "Ecobank", sector: "Banque", logo: "ECO" },
  { name: "Orange Finances Mobiles", sector: "Fintech", logo: "OFM" },
  { name: "LONASE", sector: "Public", logo: "LON" },
  { name: "Port Autonome de Dakar", sector: "Public", logo: "PAD" },
];

const schools = [
  { name: "ESMT", fullName: "École Supérieure Multinationale des Télécommunications" },
  { name: "CESAG", fullName: "Centre Africain d'Études Supérieures en Gestion" },
  { name: "ISM", fullName: "Institut Supérieur de Management" },
  { name: "ESP", fullName: "École Supérieure Polytechnique" },
];

const partners = [
  { name: "Microsoft", description: "Partenaire technologique" },
];

const testimonials = [
  {
    name: "Ibrahima Fall",
    role: "Directeur du Contrôle de Gestion",
    company: "Banque Régionale",
    content: "La formation Power BI dispensée par Model Technologie a véritablement transformé notre façon de travailler. Nos reportings qui prenaient des jours sont maintenant générés en quelques clics. Le formateur a su adapter le contenu à notre contexte bancaire avec des exemples très pertinents.",
    rating: 5,
  },
  {
    name: "Aïssatou Diop",
    role: "Responsable Reporting",
    company: "Groupe Industriel",
    content: "Excellente formation, très pratique avec des cas concrets. J'ai particulièrement apprécié l'accompagnement post-formation qui nous a permis de consolider nos acquis. Je recommande vivement pour toute équipe souhaitant professionnaliser ses analyses de données.",
    rating: 5,
  },
  {
    name: "Mamadou Sy",
    role: "Chef de Projet Digital",
    company: "Institution Financière",
    content: "Le bootcamp intensif m'a permis d'acquérir rapidement les compétences nécessaires pour piloter notre projet de transformation data. La qualité pédagogique et l'expertise du formateur font la différence. J'ai obtenu ma certification Microsoft dès le premier essai.",
    rating: 5,
  },
  {
    name: "Fatou Sarr",
    role: "Analyste Financier Senior",
    company: "Cabinet d'Audit",
    content: "Formation de haut niveau avec un contenu très riche. Les exercices pratiques basés sur des données réelles nous ont permis d'être opérationnels immédiatement. Le suivi personnalisé après la formation est un vrai plus.",
    rating: 5,
  },
];

const References = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nos Références & Partenaires
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Découvrez les entreprises et institutions qui nous font confiance 
              pour accompagner leurs équipes vers l'excellence data.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-4xl font-bold text-primary-foreground">500+</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Professionnels formés</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-primary-foreground">15+</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Entreprises clientes</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-primary-foreground">98%</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Taux de satisfaction</p>
            </div>
            <div>
              <p className="font-heading text-4xl font-bold text-primary-foreground">90%</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Taux de certification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="font-heading text-3xl font-bold text-foreground">Entreprises Clientes</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clients.map((client, index) => (
              <div
                key={client.name}
                className="group p-6 bg-card rounded-xl border border-border hover:shadow-card transition-all duration-300 text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.05 + index * 0.05}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading font-bold text-foreground">{client.logo}</span>
                </div>
                <h3 className="font-semibold text-card-foreground">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.sector}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h2 className="font-heading text-3xl font-bold text-foreground">Écoles Partenaires</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schools.map((school, index) => (
              <div
                key={school.name}
                className="p-6 bg-card rounded-xl border border-border opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <h3 className="font-heading text-2xl font-bold text-primary mb-2">{school.name}</h3>
                <p className="text-sm text-muted-foreground">{school.fullName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <Award className="h-8 w-8 text-primary" />
            <h2 className="font-heading text-3xl font-bold text-foreground">Partenaires Technologiques</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="p-8 bg-card rounded-xl border border-border text-center"
              >
                <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-2xl font-bold text-foreground">{partner.name}</span>
                </div>
                <p className="text-muted-foreground">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Témoignages détaillés
            </h2>
            <p className="text-muted-foreground text-lg">
              Ce que nos clients disent de leur expérience avec Model Technologie
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="relative p-8 bg-card rounded-2xl border border-border opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>

                <p className="text-card-foreground leading-relaxed mb-6 text-lg">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-lg">{testimonial.name}</p>
                    <p className="text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
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
              Rejoignez nos clients satisfaits
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Découvrez comment Model Technologie peut accompagner votre organisation vers l'excellence data.
            </p>
            <Button asChild size="xl" variant="hero">
              <Link to="/contact">
                Contactez-nous
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default References;
