/**
 * NotFound.tsx — page 404 sur le design system (SiteLayout, tokens navy/cta).
 * Remplace l'ancienne page d'attente « le site arrive le 16 mars » (compte à rebours),
 * dont la date de lancement est passée.
 */
import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button } from "@/components/shared";

const QUICK_LINKS = [
  { label: "Formations", href: "/formations" },
  { label: "Coaching", href: "/coaching" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Alumni", href: "/alumni" },
  { label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <SiteLayout>
      <section className="flex flex-col items-center gap-6 px-6 py-24 text-center lg:py-32">
        <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">ERREUR 404</span>
        <p
          aria-hidden="true"
          className="font-heading text-[clamp(96px,22vw,200px)] font-extrabold leading-none tracking-[-4px] text-navy"
        >
          4<span className="text-cta">0</span>4
        </p>
        <h1 className="max-w-2xl font-heading text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-[-1px] text-navy">
          Cette page est introuvable.
        </h1>
        <p className="max-w-xl text-lg text-ink-secondary">
          Le lien est peut-être erroné ou la page a été déplacée. Reprenez depuis l'accueil ou parcourez nos formations.
        </p>
        <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row">
          <Button asChild variant="primary" shape="pill" size="lg">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button asChild variant="outline" shape="pill" size="lg">
            <Link to="/formations">Voir les formations</Link>
          </Button>
        </div>
        <nav aria-label="Liens utiles" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} to={l.href}>{l.label}</Link>
          ))}
        </nav>
      </section>
    </SiteLayout>
  );
}
