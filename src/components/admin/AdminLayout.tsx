import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Briefcase,
  Star,
  MessageSquare,
  ClipboardList,
  Image,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  CalendarDays, Tag, Shield, KeyRound,
} from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/bootcamps", label: "Bootcamps", icon: BookOpen },
  { href: "/admin/bootcamp-sessions", label: "Sessions bootcamp", icon: CalendarDays },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList },
  { href: "/admin/masterclass", label: "Masterclass", icon: ClipboardList },
  { href: "/admin/promo-codes", label: "Codes parrainage", icon: Tag },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/temoignages", label: "Témoignages", icon: MessageSquare },
  // { href: "/admin/services", label: "Services", icon: Briefcase },
  // { href: "/admin/references", label: "Références", icon: Star },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/admin/projets", label: "Projets", icon: Users },
  // { href: "/admin/galerie", label: "Galerie", icon: Image },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: KeyRound },
  { href: "/admin/roles", label: "Roles", icon: Shield },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
      <div className="min-h-screen bg-secondary flex">
        {/* Sidebar overlay mobile */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 bg-foreground/20 z-20 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Model Technologie" className="h-8 w-auto" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-3 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Navigation</p>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive(item.href, item.exact)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {isActive(item.href, item.exact) && (
                      <ChevronRight className="h-3 w-3 ml-auto" />
                  )}
                </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrateur</p>
              </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <div className="ml-auto">
              <a href="/" target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Voir le site →
              </a>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
  );
};
