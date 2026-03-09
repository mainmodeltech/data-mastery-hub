/**
 * AlumniPage.tsx — Partie témoignages refactorisée
 *
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap, Linkedin, ExternalLink, Star, ArrowRight,
  TrendingUp, Building2, Users, Zap, MessageCircle, CheckCircle,
  BarChart3, Database, ChevronLeft, ChevronRight, X,
  Briefcase, Wrench, Quote, Trophy, Clock, Play, Pause,
} from "lucide-react";
import { COMPANY } from "@/config/constants";
import type { AlumniPerson, Project, ProjectMember, ProjectScreenshot } from "@/types/alumni";
import type { Testimonial } from "@/types/testimonial.types";
import {
  getInitials,
  getGradientFromName,
  getBootcampColorClass,
  getResultFallback,
} from "@/types/testimonial.types";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";

// ─── Fallback statique témoignages ────────────────────────────────────────────

const staticTestimonials: Testimonial[] = [
  {
    id: "s1", name: "Fatou Ndiaye", role: "Analyste BI", company: "Sonatel",
    bootcamp: "Power BI", result: "Reportings réduits de 2 jours à 2 heures",
    content: "Avant le bootcamp, je passais 2 jours à consolider nos reportings manuellement. Aujourd'hui, Power BI le fait en 2 heures. Le ROI a été immédiat dès le premier mois.",
    rating: 5, published: true, displayOrder: 1, createdAt: "", updatedAt: "",
  },
  {
    id: "s2", name: "Moussa Sow", role: "Data Analyst", company: "Wave Mobile Money",
    bootcamp: "Data Analyst", result: "Poste décroché en 12 semaines",
    content: "12 semaines après être entré sans aucune expérience technique, j'avais un poste. La formation est intense, les formateurs sont disponibles, et le réseau alumni fait vraiment la différence.",
    rating: 5, published: true, displayOrder: 2, createdAt: "", updatedAt: "",
  },
  {
    id: "s3", name: "Aïssatou Fall", role: "Contrôleur de Gestion Senior", company: "Baobab Groupe",
    bootcamp: "Power BI", result: "80% des tâches récurrentes automatisées",
    content: "J'avais des bases en Excel mais je plafonnais. Le bootcamp Power BI m'a donné les outils pour automatiser 80% de mes tâches récurrentes. Ma hiérarchie a remarqué la transformation.",
    rating: 5, published: true, displayOrder: 3, createdAt: "", updatedAt: "",
  },
  {
    id: "s4", name: "Ibrahima Diallo", role: "SQL Developer", company: "BICIS",
    bootcamp: "Data Analyst", result: "3 offres d'emploi en 6 semaines",
    content: "La pédagogie par projets réels m'a permis d'avoir un portfolio concret à montrer en entretien. J'ai eu 3 offres dans les 6 semaines suivant ma certification.",
    rating: 5, published: true, displayOrder: 4, createdAt: "", updatedAt: "",
  },
  {
    id: "s5", name: "Mariama Ba", role: "Business Analyst", company: "Orange Senegal",
    bootcamp: "Data Analyst", result: "Intégrée dans la communauté alumni active",
    content: "La communauté alumni est un vrai atout. On s'entraide, on partage des opportunités, et les formateurs restent disponibles bien après la fin du bootcamp.",
    rating: 5, published: true, displayOrder: 5, createdAt: "", updatedAt: "",
  },
  {
    id: "s6", name: "Cheikh Mbaye", role: "Reporting Manager", company: "Microfinance Institution",
    bootcamp: "Power BI", result: "Formation compatible avec un emploi à plein temps",
    content: "En tant que manager, je cherchais à monter en compétences rapidement sans perdre trop de temps. Les séances soir/week-end et la pédagogie pratique m'ont permis de rester opérationnel.",
    rating: 5, published: true, displayOrder: 6, createdAt: "", updatedAt: "",
  },
];

// ─── Données statiques non-témoignages (inchangées) ──────────────────────────

const impactStats = [
  { value: "30+", label: "Alumni certifiés", icon: GraduationCap, color: "text-accent" },
  { value: "90%", label: "En poste en 3 mois", icon: TrendingUp, color: "text-primary" },
  { value: "10+", label: "Entreprises recrutent", icon: Building2, color: "text-accent" },
  { value: "4.9/5", label: "Note moyenne", icon: Star, color: "text-primary" },
];

const toolColors: Record<string, string> = {
  "Power BI": "bg-accent/15 text-accent border-accent/20",
  "DAX": "bg-accent/10 text-accent/80 border-accent/15",
  "Excel": "bg-green-500/15 text-green-600 border-green-500/20",
  "Python": "bg-primary/15 text-primary border-primary/20",
  "SQL": "bg-primary/10 text-primary/80 border-primary/15",
  "Pandas": "bg-primary/10 text-primary/80 border-primary/15",
  "PostgreSQL": "bg-blue-500/15 text-blue-600 border-blue-500/20",
};

const getToolClass = (tool: string) =>
    toolColors[tool] ?? "bg-secondary text-muted-foreground border-border";

const staticAlumni: AlumniPerson[] = [
  { id: "a1", name: "Cedric Zagba", current_title: "Analyste BI", current_position: "Sonatel", linkedin_url: "#", photo_url: null, cohort: "Promo Mars 2024" },
  { id: "a2", name: "Moussa Sow", current_title: "Data Analyst", current_position: "Wave Mobile Money", linkedin_url: "#", photo_url: null, cohort: "Promo Jan 2024" },
  { id: "a3", name: "Aïssatou Fall", current_title: "Contrôleur de Gestion", current_position: "Baobab Groupe", linkedin_url: "#", photo_url: null, cohort: "Promo Nov 2023" },
  { id: "a4", name: "Ibrahima Diallo", current_title: "SQL Developer", current_position: "BICIS", linkedin_url: "#", photo_url: null, cohort: "Promo Sept 2023" },
  { id: "a5", name: "Mariama Ba", current_title: "Business Analyst", current_position: "Orange Senegal", linkedin_url: "#", photo_url: null, cohort: "Promo Sept 2023" },
  { id: "a6", name: "Cheikh Mbaye", current_title: "Reporting Manager", current_position: "CBAO", linkedin_url: "#", photo_url: null, cohort: "Promo Juin 2023" },
];

// ─── Helpers sous-composants (inchangés) ─────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const gradient = getGradientFromName(name);
  const initials = getInitials(name);
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-lg" };
  return (
      <div
          className={cn("rounded-full flex items-center justify-center font-bold text-white flex-shrink-0", sizes[size])}
          style={{ background: gradient }}
      >
        {initials}
      </div>
  );
}

// ─── Testimonial Card (slider) ────────────────────────────────────────────────

function TestimonialCard({ t }: { t: Testimonial }) {
  const isBI =
      t.bootcamp?.toLowerCase().includes("bi") ||
      t.bootcamp?.toLowerCase().includes("power bi");

  const colorClass = getBootcampColorClass(t.bootcamp);
  const result = t.result ?? getResultFallback(t.bootcamp);

  return (
      <div className="flex-shrink-0 w-[340px] md:w-[400px] p-6 rounded-2xl border border-border bg-card flex flex-col">
        {/* Stars + bootcamp badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-0.5">
            {[...Array(t.rating ?? 5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          {t.bootcamp && (
              <span
                  className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1",
                      colorClass
                  )}
              >
            {isBI
                ? <BarChart3 className="h-3 w-3" />
                : <Database className="h-3 w-3" />
            }
                {t.bootcamp}
          </span>
          )}
        </div>

        {/* Quote */}
        <div className="relative mb-5 flex-1">
          <Quote className="absolute -top-1 -left-1 h-5 w-5 text-muted-foreground/20" />
          <p className="text-sm text-foreground leading-relaxed pl-4 italic">
            {t.content}
          </p>
        </div>

        {/* Résultat */}
        {result && (
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 border border-border">
              <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              {result}
            </div>
        )}

        {/* Auteur */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Avatar name={t.name} size="sm" />
          <div>
            <div className="font-semibold text-sm text-foreground leading-tight">{t.name}</div>
            <div className="text-xs text-muted-foreground">
              {[t.role, t.company].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Testimonial Slider ───────────────────────────────────────────────────────

function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const CARD_W = 416;
  const SPEED = 0.5;
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const items = [...testimonials, ...testimonials];
  const total = testimonials.length;

  const animate = useCallback(() => {
    if (!pausedRef.current && trackRef.current) {
      posRef.current += SPEED;
      if (posRef.current >= CARD_W * total) posRef.current = 0;
      trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      setActiveIdx(Math.floor(posRef.current / CARD_W) % total);
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [total]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate]);

  const togglePause = () => { pausedRef.current = !pausedRef.current; setPaused(p => !p); };

  const goTo = (idx: number) => { posRef.current = idx * CARD_W; setActiveIdx(idx); };
  const prev = () => { const n = (activeIdx - 1 + total) % total; posRef.current = n * CARD_W; setActiveIdx(n); };
  const next = () => { const n = (activeIdx + 1) % total; posRef.current = n * CARD_W; setActiveIdx(n); };

  return (
      <div
          className="relative"
          onMouseEnter={() => { pausedRef.current = true; setPaused(true); }}
          onMouseLeave={() => { pausedRef.current = false; setPaused(false); }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div
              ref={trackRef}
              className="flex gap-4 py-2 will-change-transform"
              style={{ width: `${CARD_W * items.length}px` }}
          >
            {items.map((t, i) => (
                <TestimonialCard key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5 items-center">
            {testimonials.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                        className={cn("rounded-full transition-all duration-300", i === activeIdx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-muted-foreground")}
                />
            ))}
          </div>
          <button onClick={next} className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={togglePause} className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-2" title={paused ? "Reprendre" : "Pause"}>
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
  );
}

// ─── Sub-composants Projets / Alumni (inchangés, Supabase conservé) ───────────

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const isPowerBI = project.tools_technologies?.some(t => ["Power BI", "DAX", "Excel"].includes(t));
  const accentColor = isPowerBI ? "text-accent" : "text-primary";
  const accentBg = isPowerBI ? "bg-accent/15" : "bg-primary/15";
  const accentBorder = isPowerBI ? "border-accent/25" : "border-primary/25";

  return (
      <div className="rounded-2xl border border-border bg-card hover:shadow-card hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
        <button onClick={onClick} className="group relative w-full text-left flex-shrink-0">
          <div className={cn("h-44 flex items-center justify-center relative overflow-hidden",
              isPowerBI ? "bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" : "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
          )}>
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(${isPowerBI ? "hsl(199,89%,48%)" : "hsl(217,71%,53%)"} 1px, transparent 1px), linear-gradient(to right, ${isPowerBI ? "hsl(199,89%,48%)" : "hsl(217,71%,53%)"} 1px, transparent 1px)`,
              backgroundSize: "30px 30px"
            }} />
            {isPowerBI ? <BarChart3 className="h-16 w-16 text-accent/25" /> : <Database className="h-16 w-16 text-primary/25" />}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-background/85 backdrop-blur-sm border border-border text-xs font-medium text-foreground">
              {project.cohort ?? `${project.year}`}
            </div>
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded-xl bg-background/90 backdrop-blur text-sm font-semibold text-foreground flex items-center gap-2">
                Voir les détails <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </button>
        <div className="p-5 flex flex-col flex-1">
          <button onClick={onClick} className="text-left mb-2">
            <h3 className={cn("font-heading font-bold text-base text-foreground leading-tight hover:transition-colors", `hover:${accentColor}`)}>
              {project.title}
            </h3>
          </button>
          {project.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{project.description}</p>}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(project.tools_technologies ?? []).slice(0, 4).map(t => (
                <span key={t} className={cn("text-xs px-2 py-0.5 rounded-md border font-medium", getToolClass(t))}>{t}</span>
            ))}
            {(project.tools_technologies?.length ?? 0) > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-md border border-border text-muted-foreground">+{(project.tools_technologies?.length ?? 0) - 4}</span>
            )}
          </div>
          {project.members.length > 0 && (
              <div className={cn("rounded-xl border p-3 mb-4", accentBg, accentBorder)}>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Réalisé par
                </div>
                <div className="flex flex-col gap-2">
                  {project.members.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Avatar name={m.alumni.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground leading-tight">{m.alumni.name}</div>
                          {(m.alumni.current_title || m.alumni.current_position) && (
                              <div className="text-xs text-muted-foreground truncate">
                                {[m.alumni.current_title, m.alumni.current_position].filter(Boolean).join(" · ")}
                              </div>
                          )}
                        </div>
                        {m.alumni.linkedin_url && (
                            <a href={m.alumni.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                               className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                              <Linkedin className="h-3 w-3" />
                            </a>
                        )}
                      </div>
                  ))}
                </div>
              </div>
          )}
          <div className="flex gap-2 mt-auto">
            <button onClick={onClick} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors",
                isPowerBI ? "border-accent/30 text-accent hover:bg-accent/10" : "border-primary/30 text-primary hover:bg-primary/10")}>
              Détails du projet <ArrowRight className="h-3 w-3" />
            </button>
            {project.access_link && (
                <a href={project.access_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                   className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-secondary/60 text-xs font-semibold text-foreground hover:bg-secondary transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> Démo
                </a>
            )}
          </div>
        </div>
      </div>
  );
}

function AlumniCard({ person, delay }: { person: AlumniPerson; delay: number }) {
  return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 opacity-0 animate-fade-in" style={{ animationDelay: `${delay}s` }}>
        <Avatar name={person.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground leading-tight">{person.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {person.current_title}{person.current_position && <> · <span className="font-medium">{person.current_position}</span></>}
          </div>
          {person.cohort && <div className="text-xs text-muted-foreground/60 mt-0.5">{person.cohort}</div>}
        </div>
        {person.linkedin_url && (
            <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer"
               className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0">
              <Linkedin className="h-3.5 w-3.5" />
            </a>
        )}
      </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const AlumniPage = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAllAlumni, setShowAllAlumni] = useState(false);

  // ── Témoignages → backend Spring Boot ────────────────────────────────────
  const { data: dbTestimonials } = usePublishedTestimonials();
  const testimonials: Testimonial[] =
      dbTestimonials && dbTestimonials.length > 0
          ? dbTestimonials
          : staticTestimonials;

  // ── Projets → Supabase (inchangé — à migrer quand l'endpoint sera prêt) ──
  const { data: dbProjects } = useQuery({
    queryKey: ["projects-public"],
    queryFn: async () => {
      const { data: pd, error } = await supabase
          .from("projects")
          .select("*")
          .eq("published", true)
          .order("year", { ascending: false });
      if (error || !pd || pd.length === 0) return null;
      const ids = pd.map(p => p.id);
      const [mr, sr] = await Promise.all([
        supabase.from("project_members").select("*, alumni:alumni_id(id, name, current_title, current_position, linkedin_url, photo_url)").in("project_id", ids).order("display_order"),
        supabase.from("project_screenshots").select("*").in("project_id", ids).order("display_order"),
      ]);
      return pd.map(p => ({
        ...p,
        members: (mr.data ?? []).filter(m => m.project_id === p.id) as ProjectMember[],
        screenshots: (sr.data ?? []).filter(s => s.project_id === p.id) as ProjectScreenshot[],
      })) as Project[];
    },
  });

  // ── Alumni → Supabase (inchangé) ──────────────────────────────────────────
  const { data: dbAlumni } = useQuery({
    queryKey: ["alumni-public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alumni")
          .select("id, name, current_title, current_position, linkedin_url, photo_url, cohort")
          .eq("published", true).order("display_order");
      if (error) return null;
      return data as AlumniPerson[];
    },
  });

  const projects = dbProjects ?? [];
  const alumni = dbAlumni ?? staticAlumni;
  const visibleAlumni = showAllAlumni ? alumni : alumni.slice(0, 12);

  return (
      <Layout>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-foreground pt-20 pb-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(hsl(199,89%,48%) 1px, transparent 1px), linear-gradient(to right, hsl(199,89%,48%) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
            <div className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/6 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <Trophy className="h-3.5 w-3.5" />
                30+ alumni · 90% en poste en 3 mois
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Leurs réussites parlent<br /><span className="text-accent">mieux que nous</span>
              </h1>
              <p className="text-lg text-background/65 leading-relaxed mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Découvrez les parcours de nos alumni, leurs projets concrets et ce que leur formation chez Model Technologie a réellement changé dans leur carrière.
              </p>
              <div className="flex flex-wrap justify-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold group">
                  <Link to="/bootcamps">Rejoindre la prochaine promo<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
                <Button asChild variant="outline" className="border-background/20 text-accent hover:bg-background/10">
                  <Link to="/contact"><Building2 className="h-4 w-4 mr-2" />Recruter nos alumni</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {impactStats.map(s => (
                  <div key={s.label} className="text-center p-5 rounded-2xl bg-background/6 border border-background/12">
                    <s.icon className={cn("h-5 w-5 mx-auto mb-2", s.color)} />
                    <div className="font-heading text-3xl font-bold text-background mb-1">{s.value}</div>
                    <div className="text-xs text-background/45">{s.label}</div>
                  </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* ── SOCIAL PROOF ─────────────────────────────────── */}
        <section className="py-12 border-b border-border bg-secondary/40">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
              {[
                { icon: Building2, label: "Ils recrutent nos alumni", companies: "BICIS · Wave · Sonatel · Baobab · Orange · Ecobank" },
                { icon: Clock, label: "Délai moyen pour trouver un poste", stat: "6 semaines", sub: "après la certification" },
                { icon: TrendingUp, label: "Augmentation salariale moyenne", stat: "+35%", sub: "constatée sur les reconversions" },
              ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-border bg-card">
                    <item.icon className="h-5 w-5 text-primary mx-auto mb-3" />
                    <div className="text-xs text-muted-foreground font-medium mb-2">{item.label}</div>
                    {"stat" in item
                        ? <><div className="font-heading text-3xl font-bold text-foreground">{item.stat}</div><div className="text-xs text-muted-foreground mt-1">{item.sub}</div></>
                        : <div className="text-xs font-semibold text-foreground leading-relaxed">{item.companies}</div>
                    }
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES SLIDER → BACKEND ─────────────────── */}
        <section className="py-20 lg:py-28 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                Ce qu'ils en disent
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                Les mots de nos alumni
              </h2>
              <p className="text-muted-foreground">
                Note moyenne{" "}
                <strong className="text-foreground">4.9/5</strong>{" "}
                sur {testimonials.length} avis vérifiés
              </p>
            </div>
          </div>
          {/* Le slider est rendu hors du container pour déborder plein-largeur */}
          <TestimonialSlider testimonials={testimonials} />
        </section>

        {/* ── PROJETS (Supabase — inchangé) ────────────────── */}
        {projects.length > 0 && (
            <section className="py-20 lg:py-28 bg-secondary/40 border-y border-border">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    Le travail parle de lui même
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Projets réalisés en bootcamp</h2>
                  <p className="text-muted-foreground">Chaque apprenant sort avec un ou plusieurs projets concrets — construits sur des données réelles, présentables en entretien.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project, i) => (
                      <div key={project.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.05 + i * 0.07}s` }}>
                        <ProjectCard project={project} onClick={() => setSelectedProject(project)} />
                      </div>
                  ))}
                </div>
                <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-primary/25 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0"><Building2 className="h-6 w-6 text-primary" /></div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="font-bold text-foreground mb-1">Vous êtes une entreprise ?</div>
                    <p className="text-sm text-muted-foreground">Nos alumni peuvent réaliser ce type de projet pour vous. Contactez-nous pour un devis gratuit.</p>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold flex-shrink-0">
                    <Link to="/contact">Demander un devis<ArrowRight className="h-4 w-4 ml-2" /></Link>
                  </Button>
                </div>
              </div>
            </section>
        )}

        {/* ── ANNUAIRE ALUMNI ───────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Users className="h-3.5 w-3.5 text-accent" />La communauté
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">Nos alumni en poste</h2>
              <p className="text-muted-foreground">Une communauté active de professionnels certifiés, disponibles pour des opportunités et des échanges.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto mb-8">
              {visibleAlumni.map((person, i) => <AlumniCard key={person.id} person={person} delay={0.05 + i * 0.04} />)}
            </div>
            {alumni.length > 12 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setShowAllAlumni(!showAllAlumni)}>
                    {showAllAlumni ? "Voir moins" : `Voir les ${alumni.length - 12} autres alumni`}
                    <ChevronRight className={cn("h-4 w-4 ml-2 transition-transform", showAllAlumni ? "rotate-90" : "")} />
                  </Button>
                </div>
            )}
          </div>
        </section>

        {/* ── CTAs ─────────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-secondary/40 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="rounded-3xl bg-foreground p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)]" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-5"><GraduationCap className="h-6 w-6 text-accent" /></div>
                  <div className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Pour les candidats</div>
                  <h3 className="font-heading text-2xl font-bold text-background mb-3">Rejoignez la prochaine promo</h3>
                  <p className="text-background/60 text-sm leading-relaxed mb-6">Places limitées · Prochaine session dans quelques semaines.</p>
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white font-bold group">
                      <Link to="/bootcamps">Voir les sessions disponibles<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full border-background/20 text-accent hover:bg-background/10">
                      <Link to="/orientation"><Zap className="h-4 w-4 mr-2 text-accent" />Quiz d'orientation (2 min)</Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5 text-xs text-background/40">
                    {["Financement possible", "Certification incluse", "Accès réseau alumni"].map(t => (
                        <div key={t} className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-accent/60" />{t}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border-2 border-primary/25 bg-primary/5 p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5"><Building2 className="h-6 w-6 text-primary" /></div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Pour les entreprises</div>
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-3">Recrutez ou externalisez</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">Accédez à notre vivier de talents certifiés ou confiez vos projets data à nos équipes.</p>
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold group">
                      <Link to="/contact">Découvrir nos services B2B<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                    <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                      <MessageCircle className="h-4 w-4 text-green-500" />Discussion rapide · WhatsApp
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5 text-xs text-muted-foreground">
                    {["Profils pré-sélectionnés", "Devis sous 24h", "Sans engagement"].map(t => (
                        <div key={t} className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-primary/60" />{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
              <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between p-6 border-b border-border">
                  <div className="flex-1 pr-4">
                    <h3 className="font-heading font-bold text-xl text-foreground leading-tight">{selectedProject.title}</h3>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-4">
                  {selectedProject.description && <p className="text-muted-foreground leading-relaxed">{selectedProject.description}</p>}
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.tools_technologies ?? []).map(t => (
                        <span key={t} className={cn("text-xs px-3 py-1 rounded-lg border font-semibold", getToolClass(t))}>{t}</span>
                    ))}
                  </div>
                  {selectedProject.access_link && (
                      <a href={selectedProject.access_link} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-secondary/40 text-sm font-medium hover:bg-secondary transition-colors">
                        <ExternalLink className="h-4 w-4 text-primary" />Voir le projet en ligne
                      </a>
                  )}
                </div>
              </div>
            </div>
        )}
      </Layout>
  );
};

export default AlumniPage;
