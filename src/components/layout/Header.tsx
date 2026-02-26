import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, BarChart3, Database, Compass, Building2,
  Users, ChevronDown, ArrowRight, Zap, GraduationCap,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

// ─── Nav data ─────────────────────────────────────────────────────────────────

const bootcampsMenu: MenuItem[] = [
  {
    icon: BarChart3,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    title: "Bootcamp Power BI & Excel",
    desc: "Maîtrisez la BI en 8 semaines",
    href: "/bootcamps",
    anchor: null,
    badge: "10 Mars",
    badgeColor: "bg-accent/15 text-accent",
  },
  {
    icon: Database,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    title: "Bootcamp Data Analyst",
    desc: "SQL & Python · 12 semaines",
    href: "/bootcamps",
    anchor: null,
    badge: "2 places",
    badgeColor: "bg-orange-500/15 text-orange-500",
  },
];

const servicesMenu: MenuItem[] = [
  {
    icon: Zap,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    title: "Data Project Sprint",
    desc: "Projets data clé en main · 4-8 semaines",
    href: "/services",
    anchor: "sprint",
    badge: null,
    badgeColor: "",
  },
  {
    icon: Users,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    title: "Model Talent Régie",
    desc: "Placement d'analystes certifiés",
    href: "/services",
    anchor: "regie",
    badge: null,
    badgeColor: "",
  },
  {
    icon: GraduationCap,
    iconBg: "bg-secondary border border-border",
    iconColor: "text-foreground",
    title: "Formation Intra-Entreprise",
    desc: "Programme sur mesure pour vos équipes",
    href: "/services",
    anchor: "intra",
    badge: null,
    badgeColor: "",
  },
];

// ─── Dropdown component ───────────────────────────────────────────────────────
// Fix : a "bridge" div fills the gap between trigger and panel so the mouse
// can travel from one to the other without triggering the close timer.

function NavDropdown({
                       label,
                       items,
                       footer,
                       active,
                     }: {
  label: string;
  items: MenuItem[];
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

  // 150 ms grace period — enough to move from the trigger button to the panel
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
            const el = document.getElementById(item.anchor);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            navigate(item.href);
            // Wait for page render then scroll
            setTimeout(() => {
              const el = document.getElementById(item.anchor!);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 450);
          }
        } else {
          navigate(item.href);
        }
      },
      [location.pathname, navigate, clearTimer]
  );

  return (
      <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {/* Trigger */}
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

        {/* Panel — wrapped in a container that also captures mouse events */}
        {open && (
            <div
                className="absolute top-full left-1/2 -translate-x-1/2 z-50 pt-2"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
              <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-2">
                  {items.map((item) => {
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
                            <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
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
                  })}
                </div>
                {footer && (
                    <div className="border-t border-border bg-secondary/30 p-3">{footer}</div>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Mobile service item click (with anchor scroll)
  const handleMobileServiceClick = (item: MenuItem) => {
    setMobileOpen(false);
    if (item.anchor) {
      if (location.pathname === item.href) {
        const el = document.getElementById(item.anchor);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate(item.href);
        setTimeout(() => {
          const el = document.getElementById(item.anchor!);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 450);
      }
    } else {
      navigate(item.href);
    }
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
        <nav className="container mx-auto px-4 lg:px-8" aria-label="Navigation principale">
          <div className="flex h-20 items-center justify-between gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Model Technologie" className="h-11 w-auto" />
            </Link>

            {/* ── Desktop nav ── */}
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              <NavDropdown
                  label="Bootcamps"
                  items={bootcampsMenu}
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
                  label="Services B2B"
                  items={servicesMenu}
                  active={isActive("/services")}
                  footer={
                    <Link
                        to="/references"
                        className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
                    >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Voir nos références clients
                  </span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  }
              />

              <Link to="/orientation" className={navLinkClass("/orientation")}>
                Orientation
              </Link>
              <Link to="/alumni" className={navLinkClass("/alumni")}>
                Alumni
              </Link>
              <Link to="/a-propos" className={navLinkClass("/a-propos")}>
                À propos
              </Link>
            </div>

            {/* ── Desktop CTAs ── */}
            <div className="hidden lg:flex lg:items-center lg:gap-3 flex-shrink-0">
              <Button asChild variant="ghost" size="sm" className="text-sm font-medium">
                <Link to="/contact">Contact</Link>
              </Button>
              <Button
                  asChild
                  size="sm"
                  className="font-bold bg-primary hover:bg-primary/90 text-white px-5"
              >
                <Link to="/bootcamps">
                  Voir les sessions
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </div>

            {/* ── Mobile burger ── */}
            <button
                type="button"
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-secondary/50 text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Ouvrir le menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* ── Mobile menu ── */}
          {mobileOpen && (
              <div className="lg:hidden border-t border-border py-4 animate-fade-in">
                <div className="flex flex-col gap-1">

                  {/* Bootcamps */}
                  <button
                      onClick={() =>
                          setMobileExpanded(mobileExpanded === "bootcamps" ? null : "bootcamps")
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
                        {bootcampsMenu.map((item) => {
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
                                <div>
                                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                                </div>
                              </Link>
                          );
                        })}
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

                  {/* Services B2B */}
                  <button
                      onClick={() =>
                          setMobileExpanded(mobileExpanded === "services" ? null : "services")
                      }
                      className="flex items-center justify-between w-full px-3 py-3 rounded-xl hover:bg-secondary/50 text-left font-medium text-foreground/80"
                  >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Services B2B
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
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/40 border border-border text-left w-full"
                              >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                        item.iconBg
                                    )}
                                >
                                  <Icon className={cn("h-4 w-4", item.iconColor)} />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                                </div>
                              </button>
                          );
                        })}
                      </div>
                  )}

                  {/* Flat links */}
                  {[
                    { label: "Orientation", href: "/orientation", icon: Compass },
                    { label: "Alumni", href: "/alumni", icon: Users },
                    { label: "À propos", href: "/a-propos", icon: null },
                    { label: "Contact", href: "/contact", icon: Phone },
                  ].map((item) => (
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

                  {/* Main CTA */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button asChild className="w-full font-bold bg-primary text-white">
                      <Link to="/bootcamps">
                        Voir les sessions · S'inscrire
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </nav>
      </header>
  );
}
