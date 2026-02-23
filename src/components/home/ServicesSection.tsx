/**
 * Section Services de la page d'accueil.
 * Utilise le hook usePublishedServices au lieu d'appeler Supabase directement.
 */

import { Link } from 'react-router-dom';
import { BarChart3, GraduationCap, Building, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublishedServices } from '@/hooks/useServices';
import type { Service } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  GraduationCap,
  Building,
  Award,
};

const staticServices = [
  {
    icon: BarChart3,
    title: 'Formation Power BI',
    description: "Maitrisez l'outil de reference en Business Intelligence. Des fondamentaux au niveau expert.",
    href: '/services',
  },
  {
    icon: GraduationCap,
    title: 'Bootcamps Data',
    description: 'Programmes intensifs pour acquerir rapidement les competences cles en analyse de donnees.',
    href: '/bootcamps',
  },
  {
    icon: Building,
    title: 'Formations Intra-entreprise',
    description: 'Programmes sur-mesure adaptes aux besoins specifiques de votre organisation.',
    href: '/services',
  },
  {
    icon: Award,
    title: 'Certification Microsoft',
    description: 'Preparation intensive aux examens de certification Microsoft Power BI Data Analyst.',
    href: '/services',
  },
];

function mapServiceToDisplay(service: Service) {
  return {
    icon: iconMap[service.iconName || ''] || BarChart3,
    title: service.title,
    description: service.description || '',
    href: '/services',
  };
}

export function ServicesSection() {
  const { data: servicesData } = usePublishedServices();

  const services =
    servicesData && servicesData.length > 0
      ? servicesData.slice(0, 4).map(mapServiceToDisplay)
      : staticServices;

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos domaines d'expertise
            </h2>
            <p className="text-muted-foreground text-lg">
              Des formations professionnelles adaptees a tous les niveaux pour developper vos competences data
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link to="/services">
              Voir tous les services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className="group relative p-8 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <service.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
