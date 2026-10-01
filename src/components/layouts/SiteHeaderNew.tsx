/**
 * Design-system site header (Lot 0+, docs/design/README.md §2 — screens/site/Main.dc.html).
 * Net-new, separate from @/components/layout/Header.tsx (the current, data-driven
 * header kept unchanged for the 8 existing pages). Static nav for now — no new
 * routes are wired in Lot 0, items are placeholders matching the reference screen.
 */
import { Link } from "react-router-dom";

import { Button } from "@/components/shared/Button";

const NAV_ITEMS = ["Formations", "Coaching", "Entreprises", "Alumni", "Ressources", "Contact"];

export function SiteHeaderNew() {
  return (
    <header className="flex items-center gap-8 border-b border-[#E7E0D4] bg-site-bg px-6 py-5 lg:px-20">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-navy font-heading text-lg font-extrabold text-white">
          M
        </span>
        <span className="font-heading text-base font-bold text-navy">
          Model<span className="text-cta">Technologie</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-7 lg:flex">
        {NAV_ITEMS.map((label) => (
          <span
            key={label}
            className="cursor-pointer font-sans text-sm font-medium text-ink hover:text-cta"
          >
            {label}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <Link to="/admin/login" className="font-sans text-sm font-medium text-navy hover:text-cta">
          Connexion
        </Link>
        <Button variant="primary" shape="pill" size="sm">
          Candidater
        </Button>
      </div>
    </header>
  );
}
