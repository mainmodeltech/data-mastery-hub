import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Database, Clock, Users, Target, CheckCircle,
  ArrowRight, Star, Calendar, Award, Layers, Code2,
  TrendingUp, Briefcase, ChevronDown, ChevronUp, MessageCircle,
  Sparkles, MapPin, Shield, Download, X, Loader2,
  BookOpen, Zap, Trophy, GraduationCap
} from "lucide-react";

// ─── Static data ────────────────────────────────────────────────────────────────

const bootcampsStatic = [
  {
    id: "powerbi",
    slug: "powerbi",
    title: "Bootcamp Power BI & Excel",
    tagline: "Maîtrisez la Business Intelligence en 8 semaines",
    description:
        "Le bootcamp Power BI & Excel de Model Technologie est le programme le plus complet de Dakar pour maîtriser les outils de reporting et de business intelligence. Du débutant à l'expert, vous apprendrez à transformer des données brutes en décisions.",
    featured: true,
    duration: "8 semaines",
    audience: "Professionnels en activité",
    prerequisites: "Notions de base Excel (tableaux, formules simples)",
    price: "350 000 FCFA",
    next_session: "10 Mars 2025",
    end_session: "2 Mai 2025",
    schedule: "Mardi, Jeudi 18h-21h · Samedi 9h-12h",
    format: "Présentiel · Dakar",
    places_total: 12,
    places_filled: 8,
    color: "accent",
    icon: BarChart3,
    benefits: [
      "Créer des dashboards interactifs professionnels",
      "Automatiser les rapports mensuels",
      "Maîtriser le langage DAX avancé",
      "Connecter Power BI à toutes vos sources de données",
      "Préparer et réussir la certification Microsoft PL-300",
      "Déployer vos rapports sur Power BI Service",
    ],
    profiles: [
      { icon: "💼", label: "Contrôleurs de gestion" },
      { icon: "📊", label: "Responsables financiers" },
      { icon: "👥", label: "Managers & chefs de projet" },
      { icon: "📈", label: "Commerciaux & marketing" },
    ],
    tools: [
      { name: "Power BI", level: 100 },
      { name: "Excel Avancé", level: 90 },
      { name: "DAX", level: 85 },
      { name: "Power Query", level: 80 },
      { name: "Power BI Service", level: 70 },
      { name: "SharePoint", level: 60 },
    ],
    curriculum: [
      {
        week: "Semaines 1-2",
        title: "Fondamentaux & Excel Avancé",
        hours: "18h",
        topics: [
          "Excel : tableaux croisés dynamiques avancés",
          "Formules complexes : INDEX, MATCH, SUMIFS",
          "Power Query : import et transformation de données",
          "Premiers pas avec Power BI Desktop",
        ],
        project: "Tableau de bord financier Excel",
      },
      {
        week: "Semaines 3-4",
        title: "Modélisation des données",
        hours: "18h",
        topics: [
          "Modèle en étoile et relations entre tables",
          "Introduction au langage DAX",
          "Mesures calculées et colonnes personnalisées",
          "Gestion des dates et calendrier",
        ],
        project: "Modèle de données multi-sources",
      },
      {
        week: "Semaines 5-6",
        title: "Visualisation & Storytelling",
        hours: "18h",
        topics: [
          "Choix du bon visuel selon le message",
          "Interactivité : filtres, slicers, drill-through",
          "Design de dashboards professionnels",
          "DAX avancé : fonctions Time Intelligence",
        ],
        project: "Dashboard commercial interactif",
      },
      {
        week: "Semaines 7-8",
        title: "Déploiement & Certification",
        hours: "18h",
        topics: [
          "Power BI Service : partage et collaboration",
          "Sécurité au niveau des lignes (RLS)",
          "Préparation certification Microsoft PL-300",
          "Projet final de certification",
        ],
        project: "🏆 Projet final · Présentation devant jury",
      },
    ],
    outcomes: [
      { stat: "94%", label: "taux de satisfaction alumni" },
      { stat: "8 sem.", label: "pour devenir opérationnel" },
      { stat: "100%", label: "pratique sur cas réels" },
    ],
    testimonial: {
      name: "Fatou Ndiaye",
      role: "Contrôleur de Gestion",
      company: "Groupe Sonatel",
      content:
          "Mon reporting mensuel prenait 2 jours de travail. Après le bootcamp Power BI, je l'automatise en 2 heures. Mon directeur m'a demandé de former toute l'équipe.",
      initials: "FN",
    },
    certification: {
      name: "Microsoft Power BI Data Analyst (PL-300)",
      logo: "🏅",
      description: "Certification reconnue mondialement, préparée tout au long du programme",
    },
  },
  {
    id: "dataanalyst",
    slug: "dataanalyst",
    title: "Bootcamp Data Analyst",
    tagline: "De zéro à Data Analyst opérationnel en 12 semaines",
    description:
        "Le programme le plus complet de Dakar pour devenir Data Analyst. SQL, Python, visualisation, et projets réels — tout ce qu'il vous faut pour décrocher votre premier poste ou booster votre carrière dans la data.",
    featured: false,
    duration: "12 semaines",
    audience: "Reconversions & diplômés",
    prerequisites: "Aucun prérequis technique · Curiosité et motivation",
    price: "450 000 FCFA",
    next_session: "17 Mars 2025",
    end_session: "9 Juin 2025",
    schedule: "Lundi, Mercredi, Vendredi 18h-21h · Samedi 9h-13h",
    format: "Présentiel · Dakar",
    places_total: 10,
    places_filled: 8,
    color: "primary",
    icon: Database,
    benefits: [
      "Maîtriser SQL pour interroger n'importe quelle base de données",
      "Analyser et manipuler des données avec Python & Pandas",
      "Créer des visualisations percutantes avec Matplotlib et Power BI",
      "Nettoyer et préparer des données réelles (data wrangling)",
      "Construire un portfolio de 3 projets complets",
      "Être accompagné dans votre recherche d'emploi",
    ],
    profiles: [
      { icon: "🔄", label: "En reconversion professionnelle" },
      { icon: "🎓", label: "Jeunes diplômés (toute filière)" },
      { icon: "⚙️", label: "Développeurs souhaitant se spécialiser" },
      { icon: "💼", label: "Professionnels voulant évoluer" },
    ],
    tools: [
      { name: "Python", level: 100 },
      { name: "SQL", level: 100 },
      { name: "Pandas", level: 85 },
      { name: "Power BI", level: 80 },
      { name: "Matplotlib", level: 75 },
      { name: "PostgreSQL", level: 70 },
    ],
    curriculum: [
      {
        week: "Semaines 1-3",
        title: "Fondamentaux de la Data",
        hours: "36h",
        topics: [
          "Introduction à la data : types, sources, usages",
          "SQL de base : SELECT, WHERE, JOIN, GROUP BY",
          "SQL avancé : sous-requêtes, window functions",
          "Bases de données relationnelles et PostgreSQL",
        ],
        project: "Analyse de données e-commerce en SQL",
      },
      {
        week: "Semaines 4-6",
        title: "Python pour la Data",
        hours: "36h",
        topics: [
          "Python : variables, fonctions, structures de données",
          "Pandas : import, nettoyage et transformation",
          "Numpy : calculs numériques et statistiques",
          "Visualisation avec Matplotlib & Seaborn",
        ],
        project: "Analyse exploratoire d'un dataset réel",
      },
      {
        week: "Semaines 7-9",
        title: "Analyse Avancée & Visualisation",
        hours: "36h",
        topics: [
          "Statistiques descriptives et inférentielles",
          "Corrélation, régression, segmentation",
          "Power BI : dashboards et storytelling data",
          "Automatisation des pipelines de données",
        ],
        project: "Dashboard Power BI connecté à Python",
      },
      {
        week: "Semaines 10-12",
        title: "Projets Réels & Emploi",
        hours: "36h",
        topics: [
          "Méthodologie projet data end-to-end",
          "Git et bonnes pratiques professionnelles",
          "Construction du portfolio GitHub",
          "Préparation aux entretiens data analyst",
        ],
        project: "🏆 Projet final certifiant · Présentation devant jury d'entreprises",
      },
    ],
    outcomes: [
      { stat: "3+", label: "projets dans le portfolio" },
      { stat: "12 sem.", label: "du zéro à l'opérationnel" },
      { stat: "90%", label: "trouvent un poste en 3 mois" },
    ],
    testimonial: {
      name: "Moussa Sow",
      role: "Chef de Projet Data",
      company: "Wave Mobile Money",
      content:
          "J'étais développeur web et je voulais me reconvertir en data. En 12 semaines, j'ai appris Python, SQL, réalisé 3 projets réels que j'ai mis en portfolio. J'ai décroché un poste chez Wave.",
      initials: "MS",
    },
    certification: {
      name: "Certificat Data Analyst Model Technologie",
      logo: "🎓",
      description: "Certificat reconnu par les entreprises partenaires à Dakar et en Afrique de l'Ouest",
    },
  },
];

// ─── Shared types ─────────────────────────────────────────────────────────────

type Bootcamp = typeof bootcampsStatic[0];

// ─── Registration Modal ────────────────────────────────────────────────────────

function RegistrationModal({
                             bootcamp,
                             onClose,
                           }: {
  bootcamp: Bootcamp;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "", position: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;
    setSubmitting(true);
    const { error } = await supabase.from("registrations").insert({
      bootcamp_title: bootcamp.title,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      position: form.position.trim() || null,
      message: form.message.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const accentClass = bootcamp.color === "accent" ? "text-accent" : "text-primary";
  const btnClass = bootcamp.color === "accent"
      ? "bg-accent hover:bg-accent/90 text-white"
      : "bg-primary hover:bg-primary/90 text-white";

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-card-foreground">Réserver ma place</h3>
              <p className={cn("text-sm font-medium", accentClass)}>{bootcamp.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-foreground mb-2">Inscription envoyée ! 🎉</h4>
                  <p className="text-muted-foreground mb-2">
                    Nous vous contacterons dans les <strong>24 heures</strong> pour confirmer votre place.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Session du <strong>{bootcamp.next_session}</strong> · {bootcamp.places_total - bootcamp.places_filled} places restantes
                  </p>
                  <Button onClick={onClose} variant="outline" className="w-full">Fermer</Button>
                </div>
            ) : (
                <>
                  {/* Session recap */}
                  <div className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border mb-6",
                      bootcamp.color === "accent" ? "bg-accent/8 border-accent/20" : "bg-primary/8 border-primary/20"
                  )}>
                    <Calendar className={cn("h-5 w-5 flex-shrink-0", accentClass)} />
                    <div>
                      <div className="font-semibold text-sm text-foreground">Prochaine session</div>
                      <div className="text-xs text-muted-foreground">{bootcamp.next_session} → {bootcamp.end_session} · {bootcamp.places_total - bootcamp.places_filled} places restantes</div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: "firstName", label: "Prénom *", placeholder: "Amadou" },
                        { name: "lastName", label: "Nom *", placeholder: "Diallo" },
                      ].map(f => (
                          <div key={f.name}>
                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                            <input
                                name={f.name}
                                value={form[f.name as keyof typeof form]}
                                onChange={handleChange}
                                placeholder={f.placeholder}
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                          </div>
                      ))}
                    </div>
                    {[
                      { name: "email", label: "Email *", placeholder: "amadou@example.com", type: "email" },
                      { name: "phone", label: "Téléphone (WhatsApp de préférence)", placeholder: "+221 77 000 00 00", type: "tel" },
                      { name: "company", label: "Entreprise / Organisation", placeholder: "Mon entreprise (optionnel)", type: "text" },
                      { name: "position", label: "Poste actuel", placeholder: "Comptable, Analyste... (optionnel)", type: "text" },
                    ].map(f => (
                        <div key={f.name}>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                          <input
                              name={f.name}
                              type={f.type}
                              value={form[f.name as keyof typeof form]}
                              onChange={handleChange}
                              placeholder={f.placeholder}
                              required={f.name === "email"}
                              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message ou question</label>
                      <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Vos questions, votre contexte, vos attentes..."
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                      />
                    </div>
                    <Button type="submit" disabled={submitting} className={cn("w-full font-bold h-12", btnClass)}>
                      {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Réserver ma place <ArrowRight className="h-4 w-4 ml-2" /></>}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Inscription sans engagement · Confirmation sous 24h · Paiement à la validation
                    </p>
                  </form>
                </>
            )}
          </div>
        </div>
      </div>
  );
}

// ─── Curriculum Accordion ──────────────────────────────────────────────────────

function CurriculumAccordion({ curriculum, color }: { curriculum: Bootcamp["curriculum"]; color: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const accentClass = color === "accent" ? "text-accent" : "text-primary";
  const accentBg = color === "accent" ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20";

  return (
      <div className="space-y-3">
        {curriculum.map((item, i) => (
            <div
                key={i}
                className={cn(
                    "rounded-2xl border overflow-hidden transition-all duration-300",
                    open === i ? "border-border shadow-card" : "border-border"
                )}
            >
              <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border flex-shrink-0", accentBg, accentClass)}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.week} · {item.hours}</div>
                  </div>
                </div>
                {open === i
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                }
              </button>

              {open === i && (
                  <div className="px-5 pb-5 bg-card">
                    <div className="pl-14">
                      <ul className="space-y-2 mb-4">
                        {item.topics.map((t, ti) => (
                            <li key={ti} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                              <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", color === "accent" ? "bg-accent" : "bg-primary")} />
                              {t}
                            </li>
                        ))}
                      </ul>
                      <div className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border", accentBg, accentClass)}>
                        <Trophy className="h-3.5 w-3.5" />
                        Projet : {item.project}
                      </div>
                    </div>
                  </div>
              )}
            </div>
        ))}
      </div>
  );
}

// ─── Sticky CTA Sidebar ────────────────────────────────────────────────────────

function StickyCard({
                      bootcamp,
                      onRegister,
                    }: {
  bootcamp: Bootcamp;
  onRegister: () => void;
}) {
  const pct = Math.round((bootcamp.places_filled / bootcamp.places_total) * 100);
  const isUrgent = pct >= 80;
  const accentClass = bootcamp.color === "accent" ? "text-accent" : "text-primary";
  const btnClass = bootcamp.color === "accent"
      ? "bg-accent hover:bg-accent/90 text-white"
      : "bg-primary hover:bg-primary/90 text-white";

  return (
      <div className="rounded-2xl border-2 border-border bg-card shadow-card overflow-hidden">
        {/* Price block */}
        <div className={cn(
            "p-6 border-b border-border",
            bootcamp.color === "accent" ? "bg-accent/5" : "bg-primary/5"
        )}>
          <div className="text-xs text-muted-foreground mb-1">Tarif bootcamp</div>
          <div className="font-heading text-3xl font-bold text-foreground">{bootcamp.price}</div>
          <div className="text-xs text-muted-foreground mt-1">Supports et certification inclus</div>
        </div>

        <div className="p-6 space-y-4">
          {/* Session info */}
          {[
            { icon: Calendar, label: "Début", value: bootcamp.next_session },
            { icon: Clock, label: "Durée", value: bootcamp.duration },
            { icon: MapPin, label: "Format", value: bootcamp.format },
            { icon: Users, label: "Promo", value: `${bootcamp.places_total} apprenants max` },
          ].map((info) => (
              <div key={info.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <info.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{info.label}</div>
                  <div className="text-sm font-semibold text-foreground">{info.value}</div>
                </div>
              </div>
          ))}

          {/* Places bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{bootcamp.places_filled}/{bootcamp.places_total} places occupées</span>
              <span className={cn("font-semibold", isUrgent ? "text-orange-500" : "text-green-500")}>
              {bootcamp.places_total - bootcamp.places_filled} restantes
            </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                  className={cn("h-full rounded-full", isUrgent ? "bg-orange-500" : "bg-green-500")}
                  style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* CTAs */}
          <Button onClick={onRegister} className={cn("w-full font-bold h-12 group", btnClass)}>
            Réserver ma place
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="https://wa.me/221770000000" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
              Poser une question
            </a>
          </Button>

          {/* Trust */}
          <div className="pt-2 space-y-2">
            {[
              { icon: Shield, text: "Sans engagement · Paiement à la confirmation" },
              { icon: Award, text: bootcamp.certification.name },
            ].map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <t.icon className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", accentClass)} />
                  {t.text}
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

// ─── Single Bootcamp Detail ───────────────────────────────────────────────────

function BootcampDetail({
                          bootcamp,
                          onRegister,
                        }: {
  bootcamp: Bootcamp;
  onRegister: (b: Bootcamp) => void;
}) {
  const accentClass = bootcamp.color === "accent" ? "text-accent" : "text-primary";
  const accentBg = bootcamp.color === "accent" ? "bg-accent/10" : "bg-primary/10";
  const accentBorder = bootcamp.color === "accent" ? "border-accent/25" : "border-primary/25";
  const btnClass = bootcamp.color === "accent"
      ? "bg-accent hover:bg-accent/90 text-white shadow-glow"
      : "bg-primary hover:bg-primary/90 text-white";
  const Icon = bootcamp.icon;

  return (
      <div className="pt-24 pb-20" id={bootcamp.slug}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,380px] gap-12 items-start">

            {/* ── LEFT CONTENT ─────────────────────────────── */}
            <div>

              {/* Hero block */}
              <div className="mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0", accentBg, accentBorder)}>
                    <Icon className={cn("h-7 w-7", accentClass)} />
                  </div>
                  {bootcamp.featured && (
                      <Badge className="bg-accent text-white font-bold">★ Programme phare</Badge>
                  )}
                </div>
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {bootcamp.title}
                </h2>
                <p className={cn("text-lg font-semibold mb-4", accentClass)}>{bootcamp.tagline}</p>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{bootcamp.description}</p>
              </div>

              {/* Outcomes */}
              <div className="grid grid-cols-3 gap-4 mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                {bootcamp.outcomes.map((o) => (
                    <div key={o.label} className={cn("text-center p-5 rounded-2xl border", accentBg, accentBorder)}>
                      <div className={cn("font-heading text-3xl font-bold mb-1", accentClass)}>{o.stat}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{o.label}</div>
                    </div>
                ))}
              </div>

              {/* Pour qui */}
              <div className="mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2 mb-6">
                  <Users className={cn("h-5 w-5", accentClass)} />
                  <h3 className="font-heading text-xl font-bold text-foreground">Pour qui est ce bootcamp ?</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {bootcamp.profiles.map((p) => (
                      <div key={p.label} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-medium text-sm text-foreground">{p.label}</span>
                      </div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-2.5 p-4 rounded-xl bg-secondary/30 border border-border">
                  <Shield className={cn("h-4 w-4 flex-shrink-0 mt-0.5", accentClass)} />
                  <div className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Prérequis :</strong> {bootcamp.prerequisites}
                  </div>
                </div>
              </div>

              {/* Ce que vous apprendrez */}
              <div className="mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.25s" }}>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className={cn("h-5 w-5", accentClass)} />
                  <h3 className="font-heading text-xl font-bold text-foreground">Ce que vous apprendrez</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {bootcamp.benefits.map((b) => (
                      <div key={b} className="flex items-start gap-3">
                        <CheckCircle className={cn("h-5 w-5 flex-shrink-0 mt-0.5", accentClass)} />
                        <span className="text-sm text-foreground leading-snug">{b}</span>
                      </div>
                  ))}
                </div>
              </div>

              {/* Outils maîtrisés */}
              <div className="mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-2 mb-6">
                  <Code2 className={cn("h-5 w-5", accentClass)} />
                  <h3 className="font-heading text-xl font-bold text-foreground">Outils maîtrisés</h3>
                </div>
                <div className="space-y-3">
                  {bootcamp.tools.map((tool) => (
                      <div key={tool.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-foreground">{tool.name}</span>
                          <span className="text-muted-foreground text-xs">{tool.level}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                              className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  bootcamp.color === "accent"
                                      ? "bg-gradient-to-r from-accent/60 to-accent"
                                      : "bg-gradient-to-r from-primary/60 to-primary"
                              )}
                              style={{ width: `${tool.level}%` }}
                          />
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Programme */}
              <div className="mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                <div className="flex items-center gap-2 mb-6">
                  <Layers className={cn("h-5 w-5", accentClass)} />
                  <h3 className="font-heading text-xl font-bold text-foreground">Programme semaine par semaine</h3>
                </div>
                <CurriculumAccordion curriculum={bootcamp.curriculum} color={bootcamp.color} />
              </div>

              {/* Certification */}
              <div className={cn("mb-12 p-6 rounded-2xl border opacity-0 animate-fade-in", accentBg, accentBorder)} style={{ animationDelay: "0.4s" }}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{bootcamp.certification.logo}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={cn("h-4 w-4", accentClass)} />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Certification</span>
                    </div>
                    <h4 className="font-heading font-bold text-foreground mb-1">{bootcamp.certification.name}</h4>
                    <p className="text-sm text-muted-foreground">{bootcamp.certification.description}</p>
                  </div>
                </div>
              </div>

              {/* Témoignage */}
              <div className="mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.45s" }}>
                <div className="flex items-center gap-2 mb-6">
                  <Star className={cn("h-5 w-5", accentClass)} />
                  <h3 className="font-heading text-xl font-bold text-foreground">Ils l'ont fait</h3>
                </div>
                <div className="relative rounded-2xl border border-border bg-card p-7">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed mb-6">
                    "{bootcamp.testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-white font-bold",
                        bootcamp.color === "accent"
                            ? "bg-gradient-to-br from-accent to-primary"
                            : "bg-gradient-to-br from-primary to-accent"
                    )}>
                      {bootcamp.testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{bootcamp.testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bootcamp.testimonial.role} · {bootcamp.testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className={cn(
                  "rounded-2xl p-8 text-center border opacity-0 animate-fade-in",
                  accentBg, accentBorder
              )} style={{ animationDelay: "0.5s" }}>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Prêt à rejoindre la prochaine session ?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Prochaine session : <strong className={accentClass}>{bootcamp.next_session}</strong> ·{" "}
                  <strong className="text-orange-500">{bootcamp.places_total - bootcamp.places_filled} places restantes</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => onRegister(bootcamp)} className={cn("font-bold group", btnClass)}>
                    Réserver ma place
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/orientation">Je veux d'abord valider mon choix →</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* ── RIGHT STICKY ─────────────────────────────── */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <StickyCard bootcamp={bootcamp} onRegister={() => onRegister(bootcamp)} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Bootcamps = () => {
  const [activeTab, setActiveTab] = useState<"powerbi" | "dataanalyst">("powerbi");
  const [registerFor, setRegisterFor] = useState<Bootcamp | null>(null);

  const { data: dbBootcamps } = useQuery({
    queryKey: ["bootcamps"],
    queryFn: async () => {
      const { data, error } = await supabase
          .from("bootcamps")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Use static data enriched with any DB overrides on price/next_session
  const bootcamps = bootcampsStatic.map(bc => {
    const db = dbBootcamps?.find(d => d.title?.toLowerCase().includes(bc.id === "powerbi" ? "power" : "python") || d.title?.toLowerCase().includes(bc.id === "powerbi" ? "excel" : "sql"));
    if (!db) return bc;
    return {
      ...bc,
      price: db.price || bc.price,
      next_session: db.next_session || bc.next_session,
      benefits: db.benefits?.length ? db.benefits : bc.benefits,
    };
  });

  const activeBootcamp = bootcamps.find(b => b.slug === activeTab)!;

  return (
      <Layout>
        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="relative bg-foreground pt-20 pb-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)]" />
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(hsl(199,89%,48%) 1px, transparent 1px), linear-gradient(to right, hsl(199,89%,48%) 1px, transparent 1px)`,
                  backgroundSize: "60px 60px",
                }}
            />
            <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center pb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <GraduationCap className="h-3.5 w-3.5" />
                Nos bootcamps · Dakar, Sénégal
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                2 bootcamps pour{" "}
                <span className="text-accent">transformer</span>
                <br />
                votre carrière data
              </h1>
              <p className="text-lg text-background/65 mb-8 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Des programmes intensifs, conçus avec les entreprises qui recrutent à Dakar.
                De la théorie à l'employabilité — en 8 ou 12 semaines.
              </p>

              {/* Trust strip */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-background/40 text-sm mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                {[
                  { icon: Users, text: "150+ alumni formés" },
                  { icon: TrendingUp, text: "90% en poste en 3 mois" },
                  { icon: MapPin, text: "Présentiel · Dakar" },
                  { icon: Award, text: "Certification incluse" },
                ].map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <t.icon className="h-3.5 w-3.5" />
                      {t.text}
                    </div>
                ))}
              </div>
            </div>

            {/* ── TAB SWITCHER ─────────────────────── */}
            <div className="flex justify-center pb-0 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="inline-flex bg-background/8 border border-background/15 rounded-2xl p-1.5 gap-1.5">
                {bootcamps.map((bc) => {
                  const isActive = activeTab === bc.slug;
                  const Icon = bc.icon;
                  return (
                      <button
                          key={bc.slug}
                          onClick={() => setActiveTab(bc.slug as typeof activeTab)}
                          className={cn(
                              "flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200",
                              isActive
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-background/60 hover:text-background/80 hover:bg-background/5"
                          )}
                      >
                        <Icon className={cn("h-4 w-4", isActive ? (bc.color === "accent" ? "text-accent" : "text-primary") : "")} />
                        <span className="hidden sm:block">{bc.title}</span>
                        <span className="sm:hidden">{bc.color === "accent" ? "Power BI" : "SQL & Python"}</span>
                        {bc.places_total - bc.places_filled <= 3 && (
                            <span className="hidden sm:block text-xs bg-orange-500/15 text-orange-500 font-bold px-2 py-0.5 rounded-full">
                        {bc.places_total - bc.places_filled} places
                      </span>
                        )}
                      </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wave transition */}
          <div className="relative z-10">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* ── BOOTCAMP DETAIL ───────────────────────────────── */}
        <BootcampDetail
            key={activeBootcamp.slug}
            bootcamp={activeBootcamp}
            onRegister={setRegisterFor}
        />

        {/* ── MOBILE CTA ────────────────────────────────────── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <Button
              onClick={() => setRegisterFor(activeBootcamp)}
              className={cn(
                  "w-full h-12 font-bold",
                  activeBootcamp.color === "accent"
                      ? "bg-accent hover:bg-accent/90 text-white"
                      : "bg-primary hover:bg-primary/90 text-white"
              )}
          >
            Réserver ma place · {activeBootcamp.price}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* ── COMPARE STRIP ─────────────────────────────────── */}
        <section className="py-12 bg-secondary/50 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
              <div>
                <p className="font-semibold text-foreground">Indécis entre les deux bootcamps ?</p>
                <p className="text-sm text-muted-foreground">Notre quiz d'orientation vous guide en 2 minutes.</p>
              </div>
              <Button asChild variant="outline" className="group flex-shrink-0">
                <Link to="/orientation">
                  <Zap className="h-4 w-4 mr-2 text-accent" />
                  Trouver mon parcours
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── REGISTRATION MODAL ────────────────────────────── */}
        {registerFor && (
            <RegistrationModal
                bootcamp={registerFor}
                onClose={() => setRegisterFor(null)}
            />
        )}
      </Layout>
  );
};

export default Bootcamps;
