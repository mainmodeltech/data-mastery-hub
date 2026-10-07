/**
 * Design-system AppLayout (Lot 0+, docs/design/README.md §2 — screens/app/App-Apprenant.dc.html).
 * Generalized version of @/components/admin/AdminLayout.tsx's sidebar+header shell
 * (nav items / help slot passed as props instead of hardcoded). Standalone for now —
 * AdminLayout itself is not migrated to this component in Lot 0 (see plan follow-up),
 * so no existing admin page changes appearance.
 */
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ComingSoonLink } from "./ComingSoonLink";
import { Logo } from "@/components/shared/Logo";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Page pas encore disponible : badge "en cours" + popup au lieu d'une navigation. */
  comingSoon?: boolean;
}

export interface AppLayoutProps {
  children: ReactNode;
  navItems: AppNavItem[];
  title?: string;
  greeting?: string;
  subtitle?: string;
  helpSlot?: ReactNode;
  avatarInitials?: string;
  description?: string;
  hideSearch?: boolean;
  hideNotifications?: boolean;
  headerExtra?: ReactNode;
  /** Barre d'onglets mobile (remplace le menu burger sous lg). */
  bottomNav?: ReactNode;
}

export function AppLayout({
  children,
  navItems,
  title,
  greeting,
  subtitle = "Espace apprenant",
  helpSlot,
  avatarInitials = "MT",
  description,
  hideSearch = false,
  hideNotifications = false,
  headerExtra,
  bottomNav,
}: AppLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-app-bg flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-dark/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-navy flex flex-col gap-7 p-4 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white p-1.5">
              <Logo variant="mark" className="h-full" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-sm font-bold text-white">Model Technologie</span>
              <span className="text-xs font-medium text-cta-on-navy">{subtitle}</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#C9D4E0] lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navigation principale" className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.comingSoon) {
              return (
                <ComingSoonLink
                  key={item.href}
                  title={item.label}
                  className="w-full rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#C9D4E0] hover:bg-white/10"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-[#8FA5BC]" />
                  <span>{item.label}</span>
                </ComingSoonLink>
              );
            }
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white font-bold text-navy"
                    : "text-[#C9D4E0] font-medium hover:bg-white/10"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-navy" : "text-[#8FA5BC]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {helpSlot && <div className="rounded-[14px] bg-navy-medium p-4">{helpSlot}</div>}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#E7E0D4] bg-white px-4 py-6 lg:px-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className={cn("text-ink-secondary hover:text-navy lg:hidden", bottomNav && "hidden")}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            {greeting && (
              <h1 className="truncate font-heading text-[28px] font-extrabold text-navy">{greeting}</h1>
            )}
            {title && !greeting && (
              <h1 className="truncate font-heading text-xl font-bold text-navy lg:text-[28px] lg:font-extrabold">{title}</h1>
            )}
            {description && <p className="truncate text-sm text-ink-secondary">{description}</p>}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {headerExtra}
            {!hideSearch && (
              <div className="hidden items-center gap-2 rounded-card bg-app-bg px-4 py-2.5 sm:flex">
                <Search className="h-4 w-4 text-ink-secondary" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-40 bg-transparent text-sm text-ink outline-none placeholder:text-ink-secondary"
                />
              </div>
            )}
            {!hideNotifications && (
              <button
                className="relative flex h-11 w-11 items-center justify-center rounded-card border border-[#E7E0D4] text-navy"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-pill bg-cta" />
              </button>
            )}
            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-success font-sans text-sm font-bold text-white">
              {avatarInitials}
            </span>
          </div>
        </header>

        <main className={cn("flex-1 p-4 lg:p-10", bottomNav && "pb-24 lg:pb-10")}>{children}</main>
      </div>
      {bottomNav}
    </div>
  );
}
