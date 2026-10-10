/**
 * GoogleMapCard — carte Google Maps intégrée (iframe d'embed, sans clé d'API) pour une adresse.
 * Chargement différé ; l'adresse, le zoom et le titre viennent du contenu `site.company.map`.
 */
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleMapCardProps {
  query: string;
  zoom?: number;
  title: string;
  className?: string;
}

export function mapEmbedUrl(query: string, zoom = 16): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&hl=fr&output=embed`;
}

export function mapLinkUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function GoogleMapCard({ query, zoom = 16, title, className }: GoogleMapCardProps) {
  return (
    <div className={cn("overflow-hidden rounded-hero border border-[#E7E0D4] bg-surface-sand", className)}>
      <iframe
        title={title}
        src={mapEmbedUrl(query, zoom)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="block h-72 w-full border-0 lg:h-96"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3">
        <p className="flex items-center gap-2 text-sm text-ink">
          <MapPin className="h-4 w-4 shrink-0 text-cta" aria-hidden="true" />
          <span><strong className="font-semibold text-navy">{title}</strong> — {query}</span>
        </p>
        <a
          href={mapLinkUrl(query)}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-navy underline-offset-2 hover:text-cta hover:underline"
        >
          Ouvrir dans Google Maps
        </a>
      </div>
    </div>
  );
}
