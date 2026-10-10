/**
 * AdminLayout — coque du backoffice, désormais construite sur AppLayout
 * (docs/design/screens/app/App-Admin-*.dc.html). Recherche et notifications du
 * header sont masquées : elles n'ont pas de fonctionnalité côté admin.
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { hasAnyRole, primaryRoleLabel, ROLE_GROUPS } from "@/lib/roles";
import { useAdminActions } from "@/hooks/useAdminStats";
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
  Banknote,
  Home,
  Layers,
  Handshake,
  ShieldCheck,
  Mail,
  FileText,
} from "lucide-react";

type RoleNavItem = AppNavItem & { roles: readonly string[] };

/** Entrées du menu et rôles autorisés (mêmes groupes que les routes : voir lib/roles.ts). */
const navItems: RoleNavItem[] = [
  { href: "/admin/espace", label: "Mon espace", icon: Home, roles: ["TRAINER", "PARTNER"] },
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true, roles: ROLE_GROUPS.ADMINS },
  { href: "/admin/bootcamps", label: "Formations", icon: BookOpen, section: "Catalogue", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/domaines", label: "Domaines", icon: Layers, section: "Catalogue", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, section: "Catalogue", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/bootcamp-sessions", label: "Sessions", icon: CalendarDays, section: "Catalogue", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/candidatures", label: "Candidatures", icon: Wallet, section: "Admissions", roles: ROLE_GROUPS.ADMINS },
  { href: "/admin/paiements", label: "Paiements", icon: Banknote, section: "Admissions", roles: ROLE_GROUPS.ADMINS },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList, section: "Admissions", roles: ROLE_GROUPS.ADMINS },
  { href: "/admin/masterclass", label: "Masterclass", icon: ClipboardList, section: "Admissions", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/promo-codes", label: "Codes parrainage", icon: Tag, section: "Admissions", roles: ROLE_GROUPS.ADMINS },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, section: "Relation", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail, section: "Relation", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/contenus", label: "Pages du site", icon: FileText, section: "Contenu du site", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/temoignages", label: "Témoignages", icon: MessageSquare, section: "Contenu du site", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap, section: "Contenu du site", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/projets", label: "Projets", icon: Users, section: "Contenu du site", roles: ROLE_GROUPS.CONTENT },
  { href: "/admin/apprenants", label: "Apprenants", icon: GraduationCap, section: "Équipe & comptes", roles: ROLE_GROUPS.ADMINS },
  { href: "/admin/comptes", label: "Comptes back-office", icon: ShieldCheck, section: "Équipe & comptes", roles: ROLE_GROUPS.SUPER },
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
  // Chaque entrée n'apparaît que pour les rôles que l'API autorise (matrice SecurityConfig)
  const { data: todo } = useAdminActions();
  const badges: Record<string, number> = todo
    ? {
        "/admin/candidatures": todo.newApplications,
        "/admin/paiements": todo.paymentsToConfirm + todo.overdueInstallments,
        "/admin/messages": todo.unreadMessages,
        "/admin/bootcamp-sessions": todo.openQuestions + todo.projectsToReview,
      }
    : {};
  const visibleNav: AppNavItem[] = navItems
    .filter((i) => hasAnyRole(user?.roles, i.roles))
    .map(({ roles: _roles, ...item }) => (badges[item.href] ? { ...item, badge: badges[item.href] } : item));

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
            <p className="text-xs text-[#D5DEE8]">{primaryRoleLabel(user?.roles)}</p>
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
