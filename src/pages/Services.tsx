/**
 * Page Services - Liste des services proposes par Model Technologie.
 * Refactoree pour utiliser le hook usePublishedServices et les constantes centralisees.
 */

import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedServices } from '@/hooks/useServices';
import { FALLBACK_SERVICES } from '@/config/constants';
import {
  BarChart3,
  GraduationCap,
  Building,
  Award,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Users,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  GraduationCap,
  Building,
  Award,
  FileSpreadsheet,
  Users,
};

const Services = () => {
  const { data: servicesData, isLoading } = usePublishedServices();

  const services =
    servicesData && servicesData.length > 0
      ? servicesData.map((s) => ({
          icon: iconMap[s.iconName || ''] || BarChart3,
          title: s.title,
          description: s.description || '',
          features: s.features || [],
          duration: s.duration || '',
        }))
      : FALLBACK_SERVICES.map((s) => ({
          icon: iconMap[s.icon] || BarChart3,
          title: s.title,
          description: s.description,
          features: [...s.features],
          duration: s.duration,
        }));

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
              Des formations et accompagnements sur-mesure pour developper les competences
              Data de vos equipes et accelerer votre transformation digitale.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          {isLoading ? (
            <div className="grid gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : (
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
                      {service.features.length > 0 && (
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-card-foreground">
                              <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
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
          )}
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
              Contactez-nous pour discuter de vos besoins specifiques et obtenir une proposition adaptee.
            </p>
            <Button asChild size="lg" variant="secondary">
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
