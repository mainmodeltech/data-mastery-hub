import { useState, useEffect, useRef, useCallback } from "react";
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
  Briefcase, Wrench, Quote, Trophy, Clock, Play, Pause
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectMember = {
  id: string;
  alumni: {
    id: string;
    name: string;
    current_title: string | null;
    current_position: string | null;
    linkedin_url: string | null;
    photo_url: string | null;
  };
};

type ProjectScreenshot = {
  id: string;
  photo_url: string;
  caption: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  tools_technologies: string[] | null;
  access_link: string | null;
  cover_image_url: string | null;
  cohort: string | null;
  year: number | null;
  members: ProjectMember[];
  screenshots: ProjectScreenshot[];
};

type AlumniPerson = {
  id: string;
  name: string;
  current_title: string | null;
  current_position: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  cohort: string | null;
};

// ─── Static fallback data ────────────────────────────────────────────────────

const staticTestimonials = [
  {
    id: "1",
    name: "Fatou Ndiaye",
    role: "Analyste BI",
    company: "Sonatel",
    content: "Avant le bootcamp, je passais 2 jours à consolider nos reportings manuellement. Aujourd'hui, Power BI le fait en 2 heures. Le ROI a été immédiat dès le premier mois.",
    rating: 5,
    bootcamp: "Power BI",
    accent: "text-accent",
    photo: null,
  },
  {
    id: "2",
    name: "Moussa Sow",
    role: "Data Analyst",
    company: "Wave Mobile Money",
    content: "12 semaines après être entré sans aucune expérience technique, j'avais un poste. La formation est intense, les formateurs sont disponibles, et le réseau alumni fait vraiment la différence.",
    rating: 5,
    bootcamp: "Data Analyst",
    accent: "text-primary",
    photo: null,
  },
  {
    id: "3",
    name: "Aïssatou Fall",
    role: "Contrôleur de Gestion Senior",
    company: "Baobab Groupe",
    content: "J'avais des bases en Excel mais je plafonnais. Le bootcamp Power BI m'a donné les outils pour automatiser 80% de mes tâches récurrentes. Ma hiérarchie a remarqué la transformation.",
    rating: 5,
    bootcamp: "Power BI",
    accent: "text-accent",
    photo: null,
  },
  {
    id: "4",
    name: "Ibrahima Diallo",
    role: "SQL Developer",
    company: "BICIS",
    content: "La pédagogie par projets réels m'a permis d'avoir un portfolio concret à montrer en entretien. J'ai eu 3 offres dans les 6 semaines suivant ma certification.",
    rating: 5,
    bootcamp: "Data Analyst",
    accent: "text-primary",
    photo: null,
  },
  {
    id: "5",
    name: "Mariama Ba",
    role: "Business Analyst",
    company: "Orange Senegal",
    content: "La communauté alumni est un vrai atout. On s'entraide, on partage des opportunités, et les formateurs restent disponibles bien après la fin du bootcamp.",
    rating: 5,
    bootcamp: "Data Analyst",
    accent: "text-primary",
    photo: null,
  },
  {
    id: "6",
    name: "Cheikh Mbaye",
    role: "Reporting Manager",
    company: "Microfinance Institution",
    content: "En tant que manager, je cherchais à monter en compétences rapidement sans perdre trop de temps. Les séances soir/week-end et la pédagogie pratique m'ont permis de rester opérationnel.",
    rating: 5,
    bootcamp: "Power BI",
    accent: "text-accent",
    photo: null,
  },
];

const staticAlumni: AlumniPerson[] = [
  { id: "a1", name: "Fatou Ndiaye", current_title: "Analyste BI", current_position: "Sonatel", linkedin_url: "#", photo_url: null, cohort: "Promo Mars 2024" },
  { id: "a2", name: "Moussa Sow", current_title: "Data Analyst", current_position: "Wave Mobile Money", linkedin_url: "#", photo_url: null, cohort: "Promo Jan 2024" },
  { id: "a3", name: "Aïssatou Fall", current_title: "Contrôleur de Gestion", current_position: "Baobab Groupe", linkedin_url: "#", photo_url: null, cohort: "Promo Nov 2023" },
  { id: "a4", name: "Ibrahima Diallo", current_title: "SQL Developer", current_position: "BICIS", linkedin_url: "#", photo_url: null, cohort: "Promo Sept 2023" },
  { id: "a5", name: "Mariama Ba", current_title: "Business Analyst", current_position: "Orange Senegal", linkedin_url: "#", photo_url: null, cohort: "Promo Sept 2023" },
  { id: "a6", name: "Cheikh Mbaye", current_title: "Reporting Manager", current_position: "CBAO", linkedin_url: "#", photo_url: null, cohort: "Promo Juin 2023" },
  { id: "a7", name: "Rokhaya Diop", current_title: "Data Analyst", current_position: "Ecobank", linkedin_url: "#", photo_url: null, cohort: "Promo Mars 2023" },
  { id: "a8", name: "Oumar Traoré", current_title: "BI Developer", current_position: "Cabinet Conseil", linkedin_url: "#", photo_url: null, cohort: "Promo Mars 2024" },
];

const staticProjects: Project[] = [
  {
    id: "p1", title: "Dashboard de pilotage RH — Analyse de la masse salariale",
    description: "Tableau de bord interactif analysant les indicateurs RH d'une PME : effectifs, masse salariale, absentéisme, turnover. Données simulées sur 3 ans.",
    tools_technologies: ["Power BI", "DAX", "Excel", "Power Query"],
    access_link: null, cover_image_url: null, cohort: "Promo Mars 2024", year: 2024,
    members: [
      { id: "m1", alumni: { id: "a1", name: "Fatou Ndiaye", current_title: "Analyste BI", current_position: "Sonatel", linkedin_url: "#", photo_url: null } },
      { id: "m2", alumni: { id: "a8", name: "Oumar Traoré", current_title: "BI Developer", current_position: "Cabinet Conseil", linkedin_url: "#", photo_url: null } },
    ],
    screenshots: [],
  },
  {
    id: "p2", title: "Pipeline de données — Analyse des transactions mobiles",
    description: "Pipeline Python/SQL pour analyser des transactions de mobile money. Détection d'anomalies, segmentation clients, visualisation avec Matplotlib.",
    tools_technologies: ["Python", "SQL", "Pandas", "Matplotlib", "PostgreSQL"],
    access_link: null, cover_image_url: null, cohort: "Promo Jan 2024", year: 2024,
    members: [
      { id: "m3", alumni: { id: "a2", name: "Moussa Sow", current_title: "Data Analyst", current_position: "Wave", linkedin_url: "#", photo_url: null } },
      { id: "m4", alumni: { id: "a5", name: "Mariama Ba", current_title: "Business Analyst", current_position: "Orange", linkedin_url: "#", photo_url: null } },
    ],
    screenshots: [],
  },
  {
    id: "p3", title: "Reporting financier automatisé — Institution de microfinance",
    description: "Automatisation complète du reporting mensuel d'une institution de microfinance. Connexion directe à la base SQL, rafraîchissement automatique, KPIs en temps réel.",
    tools_technologies: ["Power BI", "SQL Server", "DAX", "Power BI Service"],
    access_link: null, cover_image_url: null, cohort: "Promo Nov 2023", year: 2023,
    members: [
      { id: "m5", alumni: { id: "a3", name: "Aïssatou Fall", current_title: "Contrôleur de Gestion", current_position: "Baobab", linkedin_url: "#", photo_url: null } },
    ],
    screenshots: [],
  },
  {
    id: "p4", title: "Analyse prédictive — Score de crédit simplifié",
    description: "Modèle Python de scoring crédit sur données anonymisées. Preprocessing avec Pandas, régression logistique, visualisation des résultats et rapport final.",
    tools_technologies: ["Python", "Scikit-learn", "Pandas", "Matplotlib"],
    access_link: null, cover_image_url: null, cohort: "Promo Sept 2023", year: 2023,
    members: [
      { id: "m6", alumni: { id: "a4", name: "Ibrahima Diallo", current_title: "SQL Developer", current_position: "BICIS", linkedin_url: "#", photo_url: null } },
      { id: "m7", alumni: { id: "a7", name: "Rokhaya Diop", current_title: "Data Analyst", current_position: "Ecobank", linkedin_url: "#", photo_url: null } },
    ],
    screenshots: [],
  },
  {
    id: "p5", title: "Dashboard commercial — Suivi des ventes d'une enseigne retail",
    description: "Tableau de bord multidimensionnel pour suivre les ventes par région, produit, vendeur et période. Alertes automatiques sur les objectifs.",
    tools_technologies: ["Power BI", "Excel", "DAX", "Power Query"],
    access_link: null, cover_image_url: null, cohort: "Promo Juin 2023", year: 2023,
    members: [
      { id: "m8", alumni: { id: "a6", name: "Cheikh Mbaye", current_title: "Reporting Manager", current_position: "CBAO", linkedin_url: "#", photo_url: null } },
    ],
    screenshots: [],
  },
];

const impactStats = [
  { value: "150+", label: "Alumni certifiés", icon: GraduationCap, color: "text-accent" },
  { value: "90%", label: "En poste en 3 mois", icon: TrendingUp, color: "text-primary" },
  { value: "25+", label: "Entreprises recrutent", icon: Building2, color: "text-accent" },
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

// ─── Initials avatar ─────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.substring(0, 2);

  // Generate a consistent gradient from name
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const gradient = `hsl(${hue}, 65%, 45%), hsl(${(hue + 40) % 360}, 70%, 50%)`;

  const sizes = { sm: "w-9 h-9 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-lg" };

  return (
      <div
          className={cn("rounded-full flex items-center justify-center font-bold text-white flex-shrink-0", sizes[size])}
          style={{ background: `linear-gradient(135deg, ${gradient})` }}
      >
        {initials.toUpperCase()}
      </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const isPowerBI = project.tools_technologies?.some(t => ["Power BI", "DAX", "Excel"].includes(t));
  const accentColor = isPowerBI ? "text-accent" : "text-primary";
  const accentBg = isPowerBI ? "bg-accent/15" : "bg-primary/15";
  const accentBorder = isPowerBI ? "border-accent/25" : "border-primary/25";

  return (
      <div className="rounded-2xl border border-border bg-card hover:shadow-card hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
        {/* Cover — clickable to open modal */}
        <button onClick={onClick} className="group relative w-full text-left flex-shrink-0">
          <div className={cn(
              "h-44 flex items-center justify-center relative overflow-hidden",
              isPowerBI
                  ? "bg-gradient-to-br from-accent/15 via-accent/5 to-transparent"
                  : "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
          )}>
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(${isPowerBI ? "hsl(199,89%,48%)" : "hsl(217,71%,53%)"} 1px, transparent 1px), linear-gradient(to right, ${isPowerBI ? "hsl(199,89%,48%)" : "hsl(217,71%,53%)"} 1px, transparent 1px)`,
              backgroundSize: "30px 30px"
            }} />
            {isPowerBI ? <BarChart3 className="h-16 w-16 text-accent/25" /> : <Database className="h-16 w-16 text-primary/25" />}

            {/* Cohort badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-background/85 backdrop-blur-sm border border-border text-xs font-medium text-foreground">
              {project.cohort ?? `${project.year}`}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded-xl bg-background/90 backdrop-blur text-sm font-semibold text-foreground flex items-center gap-2">
                Voir les détails <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </button>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Title — clickable */}
          <button onClick={onClick} className="text-left mb-2 group">
            <h3 className={cn("font-heading font-bold text-base text-foreground leading-tight group-hover:transition-colors", `group-hover:${accentColor}`)}>
              {project.title}
            </h3>
          </button>

          {project.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {project.description}
              </p>
          )}

          {/* Tools */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(project.tools_technologies ?? []).slice(0, 4).map(t => (
                <span key={t} className={cn("text-xs px-2 py-0.5 rounded-md border font-medium", getToolClass(t))}>
              {t}
            </span>
            ))}
            {(project.tools_technologies?.length ?? 0) > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-md border border-border text-muted-foreground">
              +{(project.tools_technologies?.length ?? 0) - 4}
            </span>
            )}
          </div>

          {/* Alumni list */}
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
                            <a
                                href={m.alumni.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                            >
                              <Linkedin className="h-3 w-3" />
                            </a>
                        )}
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Footer actions */}
          <div className="flex gap-2 mt-auto">
            <button
                onClick={onClick}
                className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors",
                    isPowerBI
                        ? "border-accent/30 text-accent hover:bg-accent/10"
                        : "border-primary/30 text-primary hover:bg-primary/10"
                )}
            >
              Détails du projet <ArrowRight className="h-3 w-3" />
            </button>
            {project.access_link && (
                <a
                    href={project.access_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-secondary/60 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                    title="Voir le projet déployé"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Démo
                </a>
            )}
          </div>
        </div>
      </div>
  );
}

// ─── Project Modal ─────────────────────────────────────────────────────────────

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const hasScreenshots = project.screenshots.length > 0;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                {(project.tools_technologies ?? []).some(t => ["Power BI", "DAX", "Excel"].includes(t))
                    ? <BarChart3 className="h-4 w-4 text-accent" />
                    : <Database className="h-4 w-4 text-primary" />
                }
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {project.cohort ?? project.year}
              </span>
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground leading-tight">{project.title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Screenshot gallery */}
            {hasScreenshots && (
                <div className="relative h-52 bg-secondary">
                  <img src={project.screenshots[photoIdx].photo_url} alt="" className="w-full h-full object-cover" />
                  {project.screenshots.length > 1 && (
                      <>
                        <button onClick={() => setPhotoIdx(i => i === 0 ? project.screenshots.length - 1 : i - 1)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => setPhotoIdx(i => i === project.screenshots.length - 1 ? 0 : i + 1)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {project.screenshots.map((_, i) => (
                              <button key={i} onClick={() => setPhotoIdx(i)}
                                      className={cn("w-1.5 h-1.5 rounded-full transition-all", i === photoIdx ? "bg-white w-4" : "bg-white/50")} />
                          ))}
                        </div>
                      </>
                  )}
                </div>
            )}

            <div className="p-6 space-y-6">
              {/* Description */}
              {project.description && (
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              )}

              {/* Tools */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Wrench className="h-3.5 w-3.5" />
                  Technologies utilisées
                </div>
                <div className="flex flex-wrap gap-2">
                  {(project.tools_technologies ?? []).map(t => (
                      <span key={t} className={cn("text-xs px-3 py-1 rounded-lg border font-semibold", getToolClass(t))}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Team */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  <Users className="h-3.5 w-3.5" />
                  Réalisé par
                </div>
                <div className="flex flex-col gap-3">
                  {project.members.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                        <Avatar name={m.alumni.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">{m.alumni.name}</div>
                          <div className="text-xs text-muted-foreground">{m.alumni.current_title} · {m.alumni.current_position}</div>
                        </div>
                        {m.alumni.linkedin_url && (
                            <a href={m.alumni.linkedin_url} target="_blank" rel="noopener noreferrer"
                               className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                              <Linkedin className="h-3.5 w-3.5" />
                            </a>
                        )}
                      </div>
                  ))}
                </div>
              </div>

              {/* Link */}
              {project.access_link && (
                  <a href={project.access_link} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-secondary/40 text-sm font-medium hover:bg-secondary transition-colors">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    Voir le projet en ligne
                  </a>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Alumni Card ──────────────────────────────────────────────────────────────

function AlumniCard({ person, delay }: { person: AlumniPerson; delay: number }) {
  return (
      <div
          className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 opacity-0 animate-fade-in"
          style={{ animationDelay: `${delay}s` }}
      >
        <Avatar name={person.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground leading-tight">{person.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            {person.current_title}
            {person.current_position && <> · <span className="font-medium">{person.current_position}</span></>}
          </div>
          {person.cohort && (
              <div className="text-xs text-muted-foreground/60 mt-0.5">{person.cohort}</div>
          )}
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

// ─── Testimonial Slider ───────────────────────────────────────────────────────

type TestimonialItem = typeof staticTestimonials[0];

function TestimonialCard({ t }: { t: TestimonialItem }) {
  const isBI = t.bootcamp === "Power BI";
  return (
      <div className="flex-shrink-0 w-[340px] md:w-[400px] p-6 rounded-2xl border border-border bg-card flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-0.5">
            {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1",
              isBI ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
          )}>
          {isBI ? <BarChart3 className="h-3 w-3" /> : <Database className="h-3 w-3" />}
            {t.bootcamp}
        </span>
        </div>

        {/* Quote */}
        <div className="relative mb-5 flex-1">
          <Quote className="absolute -top-1 -left-1 h-5 w-5 text-muted-foreground/20" />
          <p className="text-sm text-foreground leading-relaxed pl-4 italic">
            {t.content}
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Avatar name={t.name} size="sm" />
          <div>
            <div className="font-semibold text-sm text-foreground leading-tight">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
          </div>
        </div>
      </div>
  );
}

function TestimonialSlider({ testimonials }: { testimonials: TestimonialItem[] }) {
  const CARD_W = 416; // card width + gap (400 + 16)
  const SPEED = 0.5; // px per frame
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Duplicate list for infinite loop
  const items = [...testimonials, ...testimonials];
  const total = testimonials.length;

  const animate = useCallback(() => {
    if (!pausedRef.current && trackRef.current) {
      posRef.current += SPEED;
      // Reset when we've scrolled one full set
      if (posRef.current >= CARD_W * total) {
        posRef.current = 0;
      }
      trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      // Update active dot
      setActiveIdx(Math.floor(posRef.current / CARD_W) % total);
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [total]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(p => !p);
  };

  const goTo = (idx: number) => {
    posRef.current = idx * CARD_W;
    setActiveIdx(idx);
  };

  const prev = () => {
    const next = (activeIdx - 1 + total) % total;
    posRef.current = next * CARD_W;
    setActiveIdx(next);
  };

  const next = () => {
    const n = (activeIdx + 1) % total;
    posRef.current = n * CARD_W;
    setActiveIdx(n);
  };

  return (
      <div
          className="relative"
          onMouseEnter={() => { pausedRef.current = true; setPaused(true); }}
          onMouseLeave={() => { pausedRef.current = false; setPaused(false); }}
      >
        {/* Left / right gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
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

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* Prev */}
          <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5 items-center">
            {testimonials.map((_, i) => (
                <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                        "rounded-full transition-all duration-300",
                        i === activeIdx
                            ? "w-6 h-2 bg-primary"
                            : "w-2 h-2 bg-border hover:bg-muted-foreground"
                    )}
                />
            ))}
          </div>

          {/* Next */}
          <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Play / Pause */}
          <button
              onClick={togglePause}
              className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors ml-2"
              title={paused ? "Reprendre" : "Pause"}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const AlumniPage = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAllAlumni, setShowAllAlumni] = useState(false);

  // Supabase queries
  const { data: dbProjects } = useQuery({
    queryKey: ["projects-public"],
    queryFn: async () => {
      const { data: pd, error } = await supabase.from("projects").select("*").eq("published", true).order("year", { ascending: false });
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

  const { data: dbAlumni } = useQuery({
    queryKey: ["alumni-public"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alumni").select("id, name, current_title, current_position, linkedin_url, photo_url, cohort").eq("published", true).order("display_order");
      if (error) return null;
      return data as AlumniPerson[];
    },
  });

  const { data: dbTestimonials } = useQuery({
    queryKey: ["testimonials-alumni"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").eq("published", true).order("display_order");
      if (error) return null;
      return data;
    },
  });

  const projects = dbProjects ?? staticProjects;
  const alumni = dbAlumni ?? staticAlumni;
  const testimonials = dbTestimonials ?? staticTestimonials;

  const visibleAlumni = showAllAlumni ? alumni : alumni.slice(0, 12);

  return (
      <Layout>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-foreground pt-20 pb-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `linear-gradient(hsl(199,89%,48%) 1px, transparent 1px), linear-gradient(to right, hsl(199,89%,48%) 1px, transparent 1px)`,
              backgroundSize: "60px 60px"
            }} />
            <div className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <Trophy className="h-3.5 w-3.5" />
                150+ alumni · 90% en poste en 3 mois
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Leurs réussites parlent
                <br />
                <span className="text-accent">mieux que nous</span>
              </h1>
              <p className="text-lg text-background/65 leading-relaxed mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Découvrez les parcours de nos alumni, leurs projets concrets et ce que leur formation chez Model Technologie a réellement changé dans leur carrière.
              </p>

              <div className="flex flex-wrap justify-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold group">
                  <Link to="/bootcamps">
                    Rejoindre la prochaine promo
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-background/20 text-background hover:bg-background/10">
                  <Link to="/services">
                    <Building2 className="h-4 w-4 mr-2" />
                    Recruter nos alumni
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {impactStats.map((s) => (
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

        {/* ── SOCIAL PROOF STRIP ───────────────────────────── */}
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
                        ? <><div className="font-heading text-3xl font-bold text-foreground">{item.stat}</div>
                          <div className="text-xs text-muted-foreground mt-1">{item.sub}</div></>
                        : <div className="text-xs font-semibold text-foreground leading-relaxed">{item.companies}</div>
                    }
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES SLIDER ───────────────────────────── */}
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
              <p className="text-muted-foreground">Note moyenne <strong className="text-foreground">4.9/5</strong> sur {(testimonials as typeof staticTestimonials).length || 6} avis vérifiés</p>
            </div>
          </div>

          <TestimonialSlider testimonials={testimonials as typeof staticTestimonials} />
        </section>

        {/* ── PROJETS ──────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Le travail parle d'ui-même
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Projets réalisés en bootcamp
              </h2>
              <p className="text-muted-foreground">
                Chaque apprenant sort avec un ou plusieurs projets concrets — construits sur des données réelles, présentables en entretien.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                  <div
                      key={project.id}
                      className="opacity-0 animate-fade-in"
                      style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                  >
                    <ProjectCard project={project} onClick={() => setSelectedProject(project)} />
                  </div>
              ))}
            </div>

            {/* B2B nudge */}
            <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-primary/25 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="font-bold text-foreground mb-1">Vous êtes une entreprise ?</div>
                <p className="text-sm text-muted-foreground">Nos alumni peuvent réaliser ce type de projet pour vous. Contactez-nous pour un devis gratuit.</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold flex-shrink-0">
                <Link to="/services">
                  Demander un devis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── ANNUAIRE ALUMNI ───────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Users className="h-3.5 w-3.5 text-accent" />
                La communauté
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nos alumni en poste
              </h2>
              <p className="text-muted-foreground">
                Une communauté active de professionnels certifiés, disponibles pour des opportunités et des échanges.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto mb-8">
              {visibleAlumni.map((person, i) => (
                  <AlumniCard key={person.id} person={person} delay={0.05 + i * 0.04} />
              ))}
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

        {/* ── CTAs DOUBLE ──────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-secondary/40 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">

              {/* CTA Particulier */}
              <div className="rounded-3xl bg-foreground p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)]" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-5">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Pour les candidats</div>
                  <h3 className="font-heading text-2xl font-bold text-background mb-3">
                    Rejoignez la prochaine promo
                  </h3>
                  <p className="text-background/60 text-sm leading-relaxed mb-6">
                    Places limitées · Prochaine session dans quelques semaines. Découvrez le bootcamp qui correspond à votre profil.
                  </p>
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white font-bold group">
                      <Link to="/bootcamps">
                        Voir les sessions disponibles
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full border-background/20 text-background hover:bg-background/10">
                      <Link to="/orientation">
                        <Zap className="h-4 w-4 mr-2 text-accent" />
                        Quiz d'orientation (2 min)
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5 text-xs text-background/40">
                    {["Financement possible", "Certification incluse", "Accès réseau alumni"].map(t => (
                        <div key={t} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-accent/60" />
                          {t}
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Entreprise */}
              <div className="rounded-3xl border-2 border-primary/25 bg-primary/5 p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Pour les entreprises</div>
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                    Recrutez ou externalisez
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Accédez à notre vivier de talents certifiés ou confiez vos projets data à nos équipes. Résultats garantis.
                  </p>
                  <div className="space-y-3">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold group">
                      <Link to="/services">
                        Découvrir nos services B2B
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <a
                        href="https://wa.me/221770000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      Discussion rapide · WhatsApp
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5 text-xs text-muted-foreground">
                    {["Profils pré-sélectionnés", "Devis sous 24h", "Sans engagement"].map(t => (
                        <div key={t} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-primary/60" />
                          {t}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECT MODAL ─────────────────────────────────── */}
        {selectedProject && (
            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </Layout>
  );
};

export default AlumniPage;
