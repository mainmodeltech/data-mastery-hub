/**
 * Header.tsx — Version dynamique
 *
 * Changements par rapport à la version statique :
 * ─────────────────────────────────────────────────────────────────
 * 1. bootcampsMenu n'est plus un tableau statique.
 *    → useQuery(['bootcamps', 'public']) charge les bootcamps depuis
 *      le backend (même queryKey que BootcampsPage → cache partagé,
 *      zéro requête réseau supplémentaire si la page a déjà été visitée)
 *
 * 2. buildBootcampMenuItems() transforme Bootcamp[] → MenuItem[]
 *    → badge = nextSession.startDate formaté en français
 *    → badge absent si aucune session disponible (plus de hardcode)
 *    → icon/couleur dérivés de la catégorie via CATEGORY_STYLE
 *
 * 3. Skeleton discret pendant le chargement (2 items placeholder)
 *    → pas de layout shift, UX fluide
 *
 * 4. servicesMenu (menu "Entreprises") reste en statique — contenu détaillé
 *    sur /entreprises, piloté par src/config/b2b-offers.config.ts
 *
 * 5. Aucun any, typage strict conservé
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Menu, X, BarChart3, Database, Compass, Building2,
  Users, ChevronDown, ArrowRight, GraduationCap,
  Phone, LogIn, LogOut, LayoutDashboard, BookOpen,
  Code2, Table2, Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { bootcampService } from "@/services/bootcampService";
import { QUERY_CONFIG } from "@/config/constants";
import type { Bootcamp } from "@/types/bootcamp.type";
import logo from "@/assets/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  href: string;
  anchor: string | null;
  badge: string | null;
  badgeColor: string;
}

// ─── Style par catégorie de bootcamp ─────────────────────────────────────────
// Permet de mapper category (string venant du backend) → style visuel
// Ajouter une entrée ici pour chaque nouvelle catégorie backend

interface CategoryStyle {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badgeColor: string;
  fallbackDesc: string;
}

const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  bi: {
    icon: BarChart3,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    badgeColor: "bg-accent/15 text-accent",
    fallbackDesc: "Power BI · Certification PL-300",
  },
  python: {
    icon: Code2,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    badgeColor: "bg-primary/15 text-primary",
    fallbackDesc: "Python pour la data",
  },
  sql: {
    icon: Table2,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    badgeColor: "bg-accent/15 text-accent",
    fallbackDesc: "SQL pour la data",
  },
  "excel-finance": {
    icon: Calculator,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    badgeColor: "bg-primary/15 text-primary",
    fallbackDesc: "Excel Financiers & Contrôle de gestion",
  },
  /** @deprecated ancien catalogue fusionné, conservé en fallback visuel */
  data: {
    icon: Database,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    badgeColor: "bg-orange-500/15 text-orange-500",
    fallbackDesc: "SQL & Python",
  },
};

/** Style générique pour les catégories non référencées */
const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  icon: BookOpen,
  iconBg: "bg-secondary border border-border",
  iconColor: "text-foreground",
  badgeColor: "bg-primary/15 text-primary",
  fallbackDesc: "Programme intensif",
};

function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLE[category] ?? DEFAULT_CATEGORY_STYLE;
}

// ─── Transformation Bootcamp[] → MenuItem[] ───────────────────────────────────

function formatSessionBadge(startDate: string | null): string | null {
  if (!startDate) return null;
  return new Date(startDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildBootcampMenuItems(bootcamps: Bootcamp[]): MenuItem[] {
  return bootcamps
      .filter((bc) => bc.published)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((bc): MenuItem => {
        const style = getCategoryStyle(bc.category);
        const badge = formatSessionBadge(bc.nextSession?.startDate ?? null);

        return {
          icon: style.icon,
          iconBg: style.iconBg,
          iconColor: style.iconColor,
          title: bc.title,
          // Utilise duration du backend si disponible, sinon fallback statique
          desc: bc.duration ?? style.fallbackDesc,
          href: `/bootcamps?tab=${bc.category}`,
          anchor: null,
          badge,
          badgeColor: badge ? style.badgeColor : "",
        };
      });
}

// ─── Menu Entreprises (statique — contenu détaillé sur /entreprises) ─────────

const servicesMenu: MenuItem[] = [
  {
    icon: Database,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    title: "Formation sur mesure en Data",
    desc: "Diagnostic gratuit · sur vos données réelles",
    href: "/entreprises",
    anchor: "data-sur-mesure",
    badge: null,
    badgeColor: "",
  },
  {
    icon: BarChart3,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    title: "Formation sur mesure Power BI",
    desc: "Excel Opérationnel → Power BI · intra-entreprise",
    href: "/entreprises",
    anchor: "power-bi-entreprise",
    badge: null,
    badgeColor: "",
  },
  {
    icon: GraduationCap,
    iconBg: "bg-secondary border border-border",
    iconColor: "text-foreground",
    title: "Mise à niveau Excel",
    desc: "Débutant · Intermédiaire · Avancé",
    href: "/entreprises",
    anchor: "excel-entreprise",
    badge: null,
    badgeColor: "",
  },
];

// ─── Skeleton placeholder ─────────────────────────────────────────────────────

function MenuItemSkeleton() {
  return (
      <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-secondary flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-secondary rounded w-3/4" />
          <div className="h-2.5 bg-secondary rounded w-1/2" />
        </div>
      </div>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function NavDropdown({
                       label,
                       items,
                       isLoading = false,
                       footer,
                       active,
                     }: {
  label: string;
  items: MenuItem[];
  isLoading?: boolean;
  footer?: React.ReactNode;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const clearTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const handleEnter = useCallback(() => {
    clearTimer();
    setOpen(true);
  }, [clearTimer]);

  const handleLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleItemClick = useCallback(
      (item: MenuItem) => {
        setOpen(false);
        clearTimer();
        if (item.anchor) {
          if (location.pathname === item.href) {
            document
                .getElementById(item.anchor)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            navigate(item.href);
            setTimeout(() => {
              document
                  .getElementById(item.anchor!)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 450);
          }
        } else {
          navigate(item.href);
        }
      },
      [location.pathname, navigate, clearTimer]
  );

  return (
      <div
          className="relative"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
      >
        <button
            className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                active
                    ? "text-primary"
                    : "text-foreground/75 hover:text-foreground hover:bg-secondary/60"
            )}
        >
          {label}
          <ChevronDown
              className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  open ? "rotate-180" : ""
              )}
          />
        </button>

        {open && (
            <div
                className="absolute top-full left-1/2 -translate-x-1/2 z-50 pt-2"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
              <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-2">
                  {isLoading ? (
                      // Skeleton pendant le chargement
                      <>
                        <MenuItemSkeleton />
                        <MenuItemSkeleton />
                      </>
                  ) : (
                      items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.title}
                                onClick={() => handleItemClick(item)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/70 transition-colors group text-left"
                            >
                              <div
                                  className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                      item.iconBg
                                  )}
                              >
                                <Icon className={cn("h-5 w-5", item.iconColor)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-card-foreground leading-tight">
                                  {item.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {item.desc}
                                </div>
                              </div>
                              {item.badge && (
                                  <span
                                      className={cn(
                                          "text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                                          item.badgeColor
                                      )}
                                  >
                          {item.badge}
                        </span>
                              )}
                            </button>
                        );
                      })
                  )}
                </div>
                {footer && (
                    <div className="border-t border-border bg-secondary/30 p-3">
                      {footer}
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // ── Fetch bootcamps dynamique ──────────────────────────────────────────────
  // Même queryKey que BootcampsPage → résultat mis en cache, pas de double appel
  const { data: bootcamps, isLoading: bootcampsLoading } = useQuery({
    queryKey: ["bootcamps", "public"],
    queryFn: bootcampService.list,
    staleTime: QUERY_CONFIG.staleTime,
    // Pas de retry agressif dans le header : silencieux en cas d'erreur
    retry: 1,
  });

  const bootcampMenuItems = buildBootcampMenuItems(bootcamps ?? []);

  // ── Scroll ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu mobile à chaque changement de route
  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  const navLinkClass = (href: string) =>
      cn(
          "px-3 py-2 rounded-lg text-sm font-medium transition-all",
          isActive(href)
              ? "text-primary"
              : "text-foreground/75 hover:text-foreground hover:bg-secondary/60"
      );

  const handleMobileServiceClick = (item: MenuItem) => {
    setMobileOpen(false);
    if (item.anchor) {
      if (location.pathname === item.href) {
        document
            .getElementById(item.anchor)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate(item.href);
        setTimeout(() => {
          document
              .getElementById(item.anchor!)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 450);
      }
    } else {
      navigate(item.href);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
      <header
          className={cn(
              "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
              scrolled
                  ? "bg-background/97 backdrop-blur-md shadow-soft border-b border-border"
                  : "bg-background/95 backdrop-blur-md border-b border-border"
          )}
      >
        <nav
            className="container mx-auto px-4 lg:px-8"
            aria-label="Navigation principale"
        >
          <div className="flex h-20 items-center justify-between gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Model Technologie" className="h-11 w-auto" />
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              <NavDropdown
                  label="Bootcamps"
                  items={bootcampMenuItems}
                  isLoading={bootcampsLoading}
                  active={isActive("/bootcamps")}
                  footer={
                    <Link
                        to="/orientation"
                        className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
                    >
                  <span className="flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5" />
                    Pas sûr ? Faites le quiz d'orientation
                  </span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  }
              />

              <NavDropdown
                  label="Entreprises"
                  items={servicesMenu}
                  active={isActive("/entreprises")}
                  footer={
                    <Link to="/entreprises" className="flex items-center justify-between text-xs font-medium text-primary hover:underline">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Voir toute l'offre entreprises
                  </span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  }
              />

              <Link to="/alumni" className={navLinkClass("/alumni")}>
                Alumni
              </Link>
              <Link to="/contact" className={navLinkClass("/contact")}>
                Contact
              </Link>
              {/*<Link*/}
              {/*    to="/masterclass/power-bi-dashboard"*/}
              {/*    className="flex items-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-sm font-bold px-3 py-1.5 rounded-full transition-colors"*/}
              {/*>*/}
              {/*  <Zap className="h-3.5 w-3.5 animate-pulse" />*/}
              {/*  Masterclass gratuite*/}
              {/*</Link>*/}
            </div>

            {/* ── Desktop CTAs ── */}
            {/*<div className="hidden lg:flex lg:items-center lg:gap-3 flex-shrink-0">*/}
            {/*  {isAuthenticated ? (*/}
            {/*      <div className="flex items-center gap-2">*/}
            {/*        <Button*/}
            {/*            asChild*/}
            {/*            variant="outline"*/}
            {/*            size="sm"*/}
            {/*            className="text-sm font-medium gap-1.5"*/}
            {/*        >*/}
            {/*          <Link to="/admin">*/}
            {/*            <LayoutDashboard className="h-4 w-4" />*/}
            {/*            {user?.email?.split("@")[0] ?? "Admin"}*/}
            {/*          </Link>*/}
            {/*        </Button>*/}
            {/*        <Button*/}
            {/*            variant="ghost"*/}
            {/*            size="sm"*/}
            {/*            onClick={handleSignOut}*/}
            {/*            className="text-sm font-medium text-muted-foreground hover:text-destructive gap-1.5"*/}
            {/*        >*/}
            {/*          <LogOut className="h-4 w-4" />*/}
            {/*          Déconnexion*/}
            {/*        </Button>*/}
            {/*      </div>*/}
            {/*  ) : (*/}
            {/*      <Button*/}
            {/*          asChild*/}
            {/*          size="sm"*/}
            {/*          className="font-bold bg-primary hover:bg-primary/90 text-white px-5"*/}
            {/*      >*/}
            {/*        <Link to="/admin/login">*/}
            {/*          <LogIn className="h-4 w-4 mr-1.5" />*/}
            {/*          Connexion*/}
            {/*        </Link>*/}
            {/*      </Button>*/}
            {/*  )}*/}
            {/*</div>*/}

            {/* ── Mobile burger ── */}
            <button
                type="button"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary/50 text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Ouvrir le menu"
            >
              {mobileOpen ? (
                  <X className="h-5 w-5" />
              ) : (
                  <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* ── Mobile menu ── */}
          {mobileOpen && (
              <div className="lg:hidden border-t border-border py-4 animate-fade-in">
                <div className="flex flex-col gap-1">

                  {/* Bootcamps */}
                  <button
                      onClick={() =>
                          setMobileExpanded(
                              mobileExpanded === "bootcamps" ? null : "bootcamps"
                          )
                      }
                      className="flex items-center justify-between w-full px-3 py-3 rounded-xl hover:bg-secondary/50 text-left font-medium text-foreground/80"
                  >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-accent" />
                  Bootcamps
                </span>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 transition-transform",
                            mobileExpanded === "bootcamps" ? "rotate-180" : ""
                        )}
                    />
                  </button>

                  {mobileExpanded === "bootcamps" && (
                      <div className="ml-4 flex flex-col gap-1 mb-2">
                        {bootcampsLoading ? (
                            // Skeleton mobile
                            <>
                              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border animate-pulse">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3 bg-secondary rounded w-3/4" />
                                  <div className="h-2.5 bg-secondary rounded w-1/2" />
                                </div>
                              </div>
                              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border animate-pulse">
                                <div className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3 bg-secondary rounded w-3/4" />
                                  <div className="h-2.5 bg-secondary rounded w-1/2" />
                                </div>
                              </div>
                            </>
                        ) : (
                            bootcampMenuItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                  <Link
                                      key={item.title}
                                      to={item.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border"
                                  >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                            item.iconBg
                                        )}
                                    >
                                      <Icon className={cn("h-4 w-4", item.iconColor)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-foreground">
                                        {item.title}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.desc}
                                      </div>
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                                                item.badgeColor
                                            )}
                                        >
                              {item.badge}
                            </span>
                                    )}
                                  </Link>
                              );
                            })
                        )}
                        <Link
                            to="/orientation"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium"
                        >
                          <Compass className="h-4 w-4" />
                          Quiz d'orientation →
                        </Link>
                      </div>
                  )}

                  {/* Entreprises */}
                  <button
                      onClick={() =>
                          setMobileExpanded(
                              mobileExpanded === "services" ? null : "services"
                          )
                      }
                      className="flex items-center justify-between w-full px-3 py-3 rounded-xl hover:bg-secondary/50 text-left font-medium text-foreground/80"
                  >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Entreprises
                </span>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 transition-transform",
                            mobileExpanded === "services" ? "rotate-180" : ""
                        )}
                    />
                  </button>

                  {mobileExpanded === "services" && (
                      <div className="ml-4 flex flex-col gap-1 mb-2">
                        {servicesMenu.map((item) => {
                          const Icon = item.icon;
                          return (
                              <button
                                  key={item.title}
                                  onClick={() => handleMobileServiceClick(item)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border text-left"
                              >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        item.iconBg
                                    )}
                                >
                                  <Icon className={cn("h-4 w-4", item.iconColor)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground">
                                    {item.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.desc}
                                  </div>
                                </div>
                              </button>
                          );
                        })}
                      </div>
                  )}

                  {/* Liens plats — à propos et orientation restent accessibles via le footer / le dropdown Bootcamps */}
                  {(
                      [
                        { label: "Alumni", href: "/alumni", icon: Users },
                        { label: "Contact", href: "/contact", icon: Phone },
                      ] as const
                  ).map((item) => (
                      <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                              "flex items-center gap-2 px-3 py-3 rounded-xl font-medium transition-colors",
                              isActive(item.href)
                                  ? "text-primary bg-primary/8"
                                  : "text-foreground/75 hover:text-foreground hover:bg-secondary/50"
                          )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                  ))}

                  {/* Auth mobile */}
                  {/*<div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">*/}
                  {/*  {isAuthenticated ? (*/}
                  {/*      <>*/}
                  {/*        <Button*/}
                  {/*            asChild*/}
                  {/*            variant="outline"*/}
                  {/*            className="w-full justify-start gap-2"*/}
                  {/*        >*/}
                  {/*          <Link to="/admin">*/}
                  {/*            <LayoutDashboard className="h-4 w-4" />*/}
                  {/*            Tableau de bord admin*/}
                  {/*          </Link>*/}
                  {/*        </Button>*/}
                  {/*        <Button*/}
                  {/*            variant="ghost"*/}
                  {/*            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"*/}
                  {/*            onClick={handleSignOut}*/}
                  {/*        >*/}
                  {/*          <LogOut className="h-4 w-4" />*/}
                  {/*          Déconnexion*/}
                  {/*        </Button>*/}
                  {/*      </>*/}
                  {/*  ) : (*/}
                  {/*      <>*/}
                  {/*        <Button*/}
                  {/*            asChild*/}
                  {/*            variant="outline"*/}
                  {/*            className="w-full justify-start gap-2"*/}
                  {/*        >*/}
                  {/*          <Link to="/admin/login">*/}
                  {/*            <LogIn className="h-4 w-4" />*/}
                  {/*            Connexion admin*/}
                  {/*          </Link>*/}
                  {/*        </Button>*/}
                  {/*        <Button*/}
                  {/*            asChild*/}
                  {/*            className="w-full font-bold bg-primary text-white"*/}
                  {/*        >*/}
                  {/*          <Link to="/bootcamps">*/}
                  {/*            Voir les sessions · S'inscrire*/}
                  {/*            <ArrowRight className="h-4 w-4 ml-2" />*/}
                  {/*          </Link>*/}
                  {/*        </Button>*/}
                  {/*      </>*/}
                  {/*  )}*/}
                  {/*</div>*/}
                </div>
              </div>
          )}
        </nav>
      </header>
  );
}
