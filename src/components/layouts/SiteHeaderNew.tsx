/**
 * Design-system site header (Lot 0-2, docs/design/README.md §2 — screens/site/Main.dc.html
 * + screens/site/Mobile.dc.html pour le menu mobile).
 * Net-new, separate from @/components/layout/Header.tsx (the current, data-driven
 * header kept unchanged for the 8 pre-existing pages).
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/shared/Button";
import { ComingSoonLink } from "./ComingSoonLink";

const NAV_ITEMS: { label: string; href: string; comingSoon?: boolean }[] = [
  { label: "Formations", href: "/formations" },
  { label: "Coaching", href: "/coaching" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Alumni", href: "/alumni" },
  { label: "Ressources", href: "/ressources", comingSoon: true },
  { label: "Contact", href: "/contact" },
];

export function SiteHeaderNew() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-[#E7E0D4] bg-site-bg">
      <div className="flex items-center gap-8 px-5 py-3.5 lg:px-20 lg:py-5">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-navy font-heading text-lg font-extrabold text-white lg:h-10 lg:w-10 lg:rounded-[10px]">
            M
          </span>
          <span className="font-heading text-base font-bold text-navy">
            Model<span className="text-cta">Technologie</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.comingSoon ? (
              <ComingSoonLink
                key={item.href}
                title={item.label}
                className="font-sans text-sm font-medium text-ink-secondary"
              >
                {item.label}
              </ComingSoonLink>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className="font-sans text-sm font-medium text-ink hover:text-cta"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-5 lg:flex">
          <Link to="/admin/login" className="font-sans text-sm font-medium text-navy hover:text-cta">
            Connexion
          </Link>
          <Button asChild variant="primary" shape="pill" size="sm">
            <Link to="/formations">Candidater</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-card border border-[#E7E0D4] bg-white lg:hidden"
        >
          {open ? <X className="h-5 w-5 text-navy" /> : <Menu className="h-5 w-5 text-navy" />}
        </button>
      </div>

      {open && (
        <nav className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-[#E7E0D4] bg-white px-5 py-4 shadow-[0_12px_24px_rgba(26,58,91,0.08)] lg:hidden">
          {NAV_ITEMS.map((item) =>
            item.comingSoon ? (
              <ComingSoonLink
                key={item.href}
                title={item.label}
                className="rounded-card px-3 py-3 font-sans text-base font-medium text-ink-secondary"
              >
                {item.label}
              </ComingSoonLink>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="rounded-card px-3 py-3 font-sans text-base font-medium text-ink hover:bg-app-bg"
              >
                {item.label}
              </Link>
            )
          )}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#E7E0D4] pt-4">
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="rounded-card px-3 py-2 text-center font-sans text-sm font-medium text-navy"
            >
              Connexion
            </Link>
            <Button asChild variant="primary" shape="pill" onClick={() => setOpen(false)}>
              <Link to="/formations">Candidater</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
