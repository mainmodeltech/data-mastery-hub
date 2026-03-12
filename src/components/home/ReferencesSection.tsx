/**
 * Section References de la page d'accueil.
 * Utilise le hook usePublishedReferences.
 */

import { usePublishedReferences } from '@/hooks/useReferences';
import { FALLBACK_REFERENCES } from '@/config/constants';

export function ReferencesSection() {
  const { data: references } = usePublishedReferences();

  const displayReferences = references && references.length > 0
    ? references
    : FALLBACK_REFERENCES;

  return (
    <section className="py-16 bg-secondary border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
            Ils nous font confiance
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {displayReferences.map((ref) => (
            <div
              key={ref.name}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {'logoUrl' in ref && ref.logoUrl ? (
                <img src={ref.logoUrl} alt={ref.name} className="h-12 w-auto object-contain" />
              ) : (
                <div className="h-12 w-24 bg-muted rounded-lg flex items-center justify-center">
                  <span className="font-heading font-bold text-foreground text-sm">
                    {'logoText' in ref ? ref.logoText || ref.name : ref.name}
                  </span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">{ref.sector}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
