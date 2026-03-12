import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, ClipboardList, Briefcase, Star, MessageSquare, GraduationCap, Image, TrendingUp, Mail
} from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  bootcamps: number;
  registrations: number;
  services: number;
  references: number;
  testimonials: number;
  alumni: number;
  gallery: number;
  messages: number;
  unread_messages: number;
  pending_registrations: number;
}

const statCards = [
  { key: "bootcamps", label: "Bootcamps", icon: BookOpen, href: "/admin/bootcamps", color: "text-primary" },
  { key: "registrations", label: "Inscriptions", icon: ClipboardList, href: "/admin/inscriptions", color: "text-accent", badge: "pending_registrations" },
  { key: "messages", label: "Messages", icon: Mail, href: "/admin/messages", color: "text-primary", badge: "unread_messages" },
  { key: "alumni", label: "Groupes Alumni", icon: GraduationCap, href: "/admin/alumni", color: "text-accent" },
  { key: "services", label: "Services", icon: Briefcase, href: "/admin/services", color: "text-primary" },
  { key: "references", label: "Références", icon: Star, href: "/admin/references", color: "text-accent" },
  { key: "testimonials", label: "Témoignages", icon: MessageSquare, href: "/admin/temoignages", color: "text-primary" },
  { key: "gallery", label: "Photos galerie", icon: Image, href: "/admin/galerie", color: "text-accent" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    bootcamps: 0, registrations: 0, services: 0, references: 0,
    testimonials: 0, alumni: 0, gallery: 0, messages: 0,
    unread_messages: 0, pending_registrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: bootcamps },
        { count: registrations },
        { count: services },
        { count: refs },
        { count: testimonials },
        { count: alumni },
        { count: gallery },
        { count: messages },
        { count: unread },
        { count: pending },
      ] = await Promise.all([
        supabase.from("bootcamps").select("*", { count: "exact", head: true }),
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("references").select("*", { count: "exact", head: true }),
        supabase.from("testimonials").select("*", { count: "exact", head: true }),
        supabase.from("alumni").select("*", { count: "exact", head: true }),
        supabase.from("gallery_photos").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      setStats({
        bootcamps: bootcamps ?? 0,
        registrations: registrations ?? 0,
        services: services ?? 0,
        references: refs ?? 0,
        testimonials: testimonials ?? 0,
        alumni: alumni ?? 0,
        gallery: gallery ?? 0,
        messages: messages ?? 0,
        unread_messages: unread ?? 0,
        pending_registrations: pending ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
      <AdminLayout title="Tableau de bord">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Bienvenue 👋</h2>
          <p className="text-muted-foreground">Gérez le contenu de votre site Model Technologie</p>
        </div>

        {/* Alerts */}
        {(stats.unread_messages > 0 || stats.pending_registrations > 0) && (
            <div className="mb-6 grid sm:grid-cols-2 gap-4">
              {stats.unread_messages > 0 && (
                  <Link to="/admin/messages" className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/15 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">{stats.unread_messages} message(s) non lu(s)</p>
                      <p className="text-sm text-muted-foreground">Cliquez pour les consulter</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary ml-auto" />
                  </Link>
              )}
              {stats.pending_registrations > 0 && (
                  <Link to="/admin/inscriptions" className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-xl hover:bg-accent/15 transition-colors">
                    <ClipboardList className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-semibold text-foreground">{stats.pending_registrations} inscription(s) en attente</p>
                      <p className="text-sm text-muted-foreground">Cliquez pour traiter</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-accent ml-auto" />
                  </Link>
              )}
            </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const count = stats[card.key as keyof Stats];
            const badge = card.badge ? stats[card.badge as keyof Stats] : null;
            return (
                <Link
                    key={card.key}
                    to={card.href}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-card hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    {badge !== null && badge > 0 && (
                        <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                    {badge}
                  </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : count}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                    {card.label}
                  </p>
                </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/admin/bootcamps" className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-card transition-all text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Ajouter un bootcamp
            </Link>
            <Link to="/admin/alumni" className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-card transition-all text-sm font-medium text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Ajouter un groupe alumni
            </Link>
            <Link to="/admin/galerie" className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-card transition-all text-sm font-medium text-foreground flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" /> Ajouter des photos
            </Link>
          </div>
        </div>
      </AdminLayout>
  );
};

export default AdminDashboard;
