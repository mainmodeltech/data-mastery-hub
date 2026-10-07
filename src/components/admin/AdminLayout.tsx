/**
 * AdminLayout — coque du backoffice, désormais construite sur AppLayout
 * (docs/design/screens/app/App-Admin-*.dc.html). Recherche et notifications du
 * header sont masquées : elles n'ont pas de fonctionnalité côté admin.
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { hasAnyRole } from "@/lib/roles";
import { AppLayout, type AppNavItem } from "@/components/layouts/AppLayout";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  MessageSquare,
  ClipboardList,
  LogOut,
  Users,
  CalendarDays,
  Tag,
  Wallet,
  Eye,
  Layers,
  Handshake,
  ShieldCheck,
} from "lucide-react";

const navItems: AppNavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/bootcamps", label: "Formations", icon: BookOpen, section: "Catalogue" },
  { href: "/admin/domaines", label: "Domaines", icon: Layers, section: "Catalogue" },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, section: "Catalogue" },
  { href: "/admin/bootcamp-sessions", label: "Sessions", icon: CalendarDays, section: "Catalogue" },
  { href: "/admin/candidatures", label: "Candidatures & paiements", icon: Wallet, section: "Admissions" },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList, section: "Admissions" },
  { href: "/admin/masterclass", label: "Masterclass", icon: ClipboardList, section: "Admissions" },
  { href: "/admin/promo-codes", label: "Codes parrainage", icon: Tag, section: "Admissions" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, section: "Relation" },
  { href: "/admin/temoignages", label: "Témoignages", icon: MessageSquare, section: "Contenu du site" },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap, section: "Contenu du site" },
  { href: "/admin/projets", label: "Projets", icon: Users, section: "Contenu du site" },
  { href: "/admin/apprenants", label: "Apprenants", icon: GraduationCap, section: "Équipe & comptes" },
  { href: "/admin/comptes", label: "Comptes back-office", icon: ShieldCheck, section: "Équipe & comptes" },
  // Le personnel peut ouvrir l'espace apprenant (aperçu) ; les comptes apprenants arrivent avec le backend learner-accounts.
  { href: "/espace", label: "Aperçu espace apprenant", icon: Eye, section: "Apprenants" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, description, actions }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/connexion");
  };

  const initials = (user?.email ?? "AD").slice(0, 2).toUpperCase();
  // La gestion des comptes back-office est réservée au super administrateur (403 côté serveur sinon)
  const visibleNav = navItems.filter((i) => i.href !== "/admin/comptes" || hasAnyRole(user?.roles, ["SUPER_ADMIN"]));

  return (
    <AppLayout
      navItems={visibleNav}
      title={title}
      description={description}
      subtitle="Backoffice"
      avatarInitials={initials}
      hideSearch
      hideNotifications
      headerExtra={
        <>
          {actions}
          <a href="/" target="_blank" rel="noreferrer" className="hidden text-sm font-medium text-ink-secondary hover:text-cta sm:block">
            Voir le site →
          </a>
        </>
      }
      helpSlot={
        <div className="flex flex-col gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{user?.email}</p>
            <p className="text-xs text-[#D5DEE8]">Administrateur</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-semibold text-[#D5DEE8] hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      }
    >
      {children}
    </AppLayout>
  );
};
