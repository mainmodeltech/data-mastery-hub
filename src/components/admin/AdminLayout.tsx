/**
 * AdminLayout — coque du backoffice, désormais construite sur AppLayout
 * (docs/design/screens/app/App-Admin-*.dc.html). Recherche et notifications du
 * header sont masquées : elles n'ont pas de fonctionnalité côté admin.
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { profileTitle } from "@/lib/roles";
import { ACCESS } from "@/lib/permissions";
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
  KeyRound,
  Mail,
  FileText,
  Receipt,
  MessagesSquare,
  Award,
  Send,
} from "lucide-react";

type PermNavItem = AppNavItem & { access: readonly string[] };

/** Entrées du menu et droits qui les ouvrent (mêmes droits que les routes : voir lib/permissions.ts). */
const navItems: PermNavItem[] = [
  { href: "/admin/espace", label: "Mon espace", icon: Home, access: ACCESS.ESPACE },
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true, access: ACCESS.DASHBOARD },
  { href: "/admin/bootcamps", label: "Formations", icon: BookOpen, section: "Catalogue", access: ACCESS.CATALOG },
  { href: "/admin/domaines", label: "Domaines", icon: Layers, section: "Catalogue", access: ACCESS.CATALOG },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake, section: "Catalogue", access: ACCESS.PARTNERS },
  { href: "/admin/bootcamp-sessions", label: "Sessions", icon: CalendarDays, section: "Catalogue", access: ACCESS.CATALOG },
  { href: "/admin/candidatures", label: "Candidatures", icon: Wallet, section: "Admissions", access: ACCESS.APPLICATIONS },
  { href: "/admin/paiements", label: "Paiements", icon: Banknote, section: "Admissions", access: ACCESS.PAYMENTS },
  { href: "/admin/masterclass", label: "Masterclass", icon: ClipboardList, section: "Admissions", access: ACCESS.MASTERCLASS },
  { href: "/admin/factures", label: "Factures", icon: Receipt, section: "Admissions", access: ACCESS.INVOICES },
  { href: "/admin/certificats", label: "Certificats", icon: Award, section: "Admissions", access: ACCESS.CERTIFICATES },
  { href: "/admin/promo-codes", label: "Codes parrainage", icon: Tag, section: "Admissions", access: ACCESS.PROMO },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, section: "Relation", access: ACCESS.MESSAGES },
  { href: "/admin/communaute", label: "Communauté", icon: MessagesSquare, section: "Relation", access: ACCESS.COMMUNITY },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail, section: "Relation", access: ACCESS.NEWSLETTER },
  { href: "/admin/emails", label: "Journal d'e-mails", icon: Send, section: "Relation", access: ACCESS.EMAILS },
  { href: "/admin/contenus", label: "Pages du site", icon: FileText, section: "Contenu du site", access: ACCESS.SITE_CONTENT },
  { href: "/admin/temoignages", label: "Témoignages", icon: MessageSquare, section: "Contenu du site", access: ACCESS.SITE_CONTENT },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap, section: "Contenu du site", access: ACCESS.SITE_CONTENT },
  { href: "/admin/projets", label: "Projets", icon: Users, section: "Contenu du site", access: ACCESS.SITE_CONTENT },
  { href: "/admin/apprenants", label: "Apprenants", icon: GraduationCap, section: "Équipe & comptes", access: ACCESS.LEARNERS },
  { href: "/admin/comptes", label: "Comptes back-office", icon: ShieldCheck, section: "Équipe & comptes", access: ACCESS.ACCOUNTS },
  { href: "/admin/profils", label: "Profils & droits", icon: KeyRound, section: "Équipe & comptes", access: ACCESS.PROFILES },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, description, actions }: AdminLayoutProps) => {
  const { user, signOut, can } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/connexion");
  };

  const initials = (user?.email ?? "AD").slice(0, 2).toUpperCase();
  // Chaque entrée n'apparaît que si l'un des profils du compte donne le droit correspondant (le serveur vérifie aussi)
  const { data: todo } = useAdminActions();
  const badges: Record<string, number> = todo
    ? {
        // Un compteur absent = la personne ne traite pas cette file (le serveur ne le renvoie pas)
        "/admin/candidatures": todo.newApplications ?? 0,
        "/admin/paiements": (todo.paymentsToConfirm ?? 0) + (todo.overdueInstallments ?? 0),
        "/admin/messages": todo.unreadMessages ?? 0,
        "/admin/certificats": todo.certificatesToValidate ?? 0,
        "/admin/bootcamp-sessions": (todo.openQuestions ?? 0) + (todo.projectsToReview ?? 0),
      }
    : {};
  const visibleNav: AppNavItem[] = navItems
    .filter((i) => can(...i.access))
    .map(({ access: _access, ...item }) => (badges[item.href] ? { ...item, badge: badges[item.href] } : item));

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
            <p className="text-xs text-[#D5DEE8]">{profileTitle(user)}</p>
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
