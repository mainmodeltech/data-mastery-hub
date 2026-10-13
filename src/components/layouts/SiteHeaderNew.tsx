/**
 * Design-system site header (docs/design/README.md §2 — screens/site/Main.dc.html
 * + screens/site/Mobile.dc.html pour le menu mobile).
 * Sticky : le menu reste visible au défilement.
 * Menu et libellés servis par le backend (contenu `site.nav`, modifiable depuis l'administration).
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/shared/Button";
import { Logo } from "@/components/shared/Logo";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useAuth } from "@/hooks/useAuth";
import { homePathFor } from "@/lib/roles";

export function SiteHeaderNew() {
  const [open, setOpen] = useState(false);
  // Tant que le contenu n'est pas chargé (ou indisponible), seul le logo est affiché.
  const { content } = useSiteContent("site.nav");
  const header = content?.header;
  const items = header?.links ?? [];
  // Connecté : le lien de connexion devient « Mon espace » (espace apprenant ou back-office selon le rôle).
  const { user } = useAuth();
  const accountHref = user ? homePathFor(user) : "/connexion";
  const accountLabel = user ? (header?.accountLabel ?? header?.loginLabel) : header?.loginLabel;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7E0D4] bg-site-bg/95 backdrop-blur supports-[backdrop-filter]:bg-site-bg/85">
      <div className="flex items-center gap-8 px-5 py-2 lg:px-20 lg:py-2.5">
        <Link to="/" aria-label="Accueil" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <Logo className="h-11 lg:h-[52px]" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {items.map((item) => (
            <Link key={item.href} to={item.href} className="font-sans text-sm font-medium text-ink hover:text-cta">
              {item.label}
            </Link>
          ))}
        </nav>

        {header && (
          <div className="ml-auto hidden items-center gap-5 lg:flex">
            {/* Lien ordinaire (rechargement complet) : la page de connexion et les espaces privés se chargent
                sans le widget de discussion tiers (voir public/tawk-init.js). */}
            <a href={accountHref} className="font-sans text-sm font-medium text-navy hover:text-cta">
              {accountLabel}
            </a>
            <Button asChild variant="primary" shape="pill" size="sm">
              <Link to={header.applyHref}>{header.applyLabel}</Link>
            </Button>
          </div>
        )}

        {header && (
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-card border border-[#E7E0D4] bg-white lg:hidden"
          >
            {open ? <X className="h-5 w-5 text-navy" /> : <Menu className="h-5 w-5 text-navy" />}
          </button>
        )}
      </div>

      {open && header && (
        <nav className="absolute inset-x-0 top-full z-20 flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto border-b border-[#E7E0D4] bg-white px-5 py-4 shadow-[0_12px_24px_rgba(26,58,91,0.08)] lg:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="rounded-card px-3 py-3 font-sans text-base font-medium text-ink hover:bg-app-bg"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#E7E0D4] pt-4">
            <a
              href={accountHref}
              className="rounded-card px-3 py-2 text-center font-sans text-sm font-medium text-navy"
            >
              {accountLabel}
            </a>
            <Button asChild variant="primary" shape="pill" onClick={() => setOpen(false)}>
              <Link to={header.applyHref}>{header.applyLabel}</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
