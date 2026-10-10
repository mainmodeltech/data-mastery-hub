/**
 * Coque de l'espace apprenant : AppLayout + navigation apprenant + barre d'onglets mobile
 * (docs/design/screens/app/App-Apprenant.dc.html, M-Accueil.dc.html).
 */
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Award, BookOpen, CalendarDays, CircleHelp, FileText, Home, User, Users, Wallet, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppLayout, type AppNavItem } from "@/components/layouts/AppLayout";
import { ComingSoonLink } from "@/components/layouts/ComingSoonLink";
import { NotificationsBell } from "@/components/learner/NotificationsBell";
import { useAuth } from "@/hooks/useAuth";

export const LEARNER_NAV: AppNavItem[] = [
  { href: "/espace", label: "Mon espace", icon: Home, exact: true },
  { href: "/espace/formations", label: "Mes formations", icon: BookOpen },
  { href: "/espace/calendrier", label: "Calendrier & lives", icon: CalendarDays },
  { href: "/espace/evaluations", label: "Évaluations", icon: CircleHelp },
  { href: "/espace/ressources", label: "Ressources", icon: FileText },
  { href: "/espace/communaute", label: "Communauté", icon: Users },
  { href: "/espace/hors-ligne", label: "Hors ligne", icon: WifiOff },
  { href: "/espace/certificats", label: "Certificats", icon: Award },
  { href: "/espace/paiements", label: "Mes paiements", icon: Wallet },
  { href: "/espace/profil", label: "Mon profil", icon: User },
];

const TABS: { href: string; label: string; icon: LucideIcon; end?: boolean; comingSoon?: boolean }[] = [
  { href: "/espace", label: "Accueil", icon: Home, end: true },
  { href: "/espace/formations", label: "Formations", icon: BookOpen },
  { href: "/espace/calendrier", label: "Lives", icon: CalendarDays },
  { href: "/espace/certificats", label: "Certificats", icon: Award },
  { href: "/espace/profil", label: "Profil", icon: User },
];

export function MobileTabBar() {
  return (
    <nav
      aria-label="Navigation"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-[#E7E0D4] bg-white lg:hidden"
    >
      {TABS.map((t) =>
        t.comingSoon ? (
          <ComingSoonLink
            key={t.href}
            title={t.label}
            badge={false}
            className="min-h-[56px] flex-col justify-center gap-0.5 text-[11px] font-medium text-[#8A93A0]"
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </ComingSoonLink>
        ) : (
          <NavLink
            key={t.href}
            to={t.href}
            end={t.end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                isActive ? "font-bold text-navy" : "text-[#8A93A0]"
              }`
            }
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </NavLink>
        )
      )}
    </nav>
  );
}

export function DemoDataBanner() {
  return (
    <div role="status" className="rounded-card bg-warning-bg px-4 py-3 text-sm text-warning">
      <span className="font-bold">Aperçu :</span> données de démonstration — les endpoints correspondants ne sont pas encore disponibles
      côté serveur.
    </div>
  );
}

export interface LearnerShellProps {
  children: ReactNode;
  title?: string;
  greeting?: string;
  description?: string;
  withTabBar?: boolean;
}

export function LearnerShell({ children, title, greeting, description, withTabBar = true }: LearnerShellProps) {
  const { user } = useAuth();
  const initials = (user?.email ?? "AP").slice(0, 2).toUpperCase();

  return (
    <AppLayout
      navItems={LEARNER_NAV}
      title={title}
      greeting={greeting}
      description={description}
      avatarInitials={initials}
      hideSearch
      hideNotifications
      headerExtra={<NotificationsBell />}
      bottomNav={withTabBar ? <MobileTabBar /> : undefined}
      helpSlot={
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-[#D5DEE8]">Besoin d'aide ?</span>
          <a href="/contact" className="text-sm font-bold text-white">Écrire à l'équipe →</a>
        </div>
      }
    >
      {children}
    </AppLayout>
  );
}
