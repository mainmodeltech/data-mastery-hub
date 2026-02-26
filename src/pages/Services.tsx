import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Zap, Users, GraduationCap, ArrowRight, CheckCircle,
  Building2, BarChart3, Database, Clock, Target,
  MessageCircle, Star, TrendingUp, Shield, ChevronRight,
  Sparkles, Calendar, Award, Briefcase, X, Loader2,
  Phone, Mail, FileText
} from "lucide-react";

// ─── Static data ─────────────────────────────────────────────────────────────

const services = [
  {
    id: "sprint",
    icon: Zap,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    accentBg: "bg-primary/6",
    accentBorder: "border-primary/25",
    accentText: "text-primary",
    gradient: "from-primary/15 via-primary/4 to-transparent",
    tag: "Consulting",
    tagColor: "bg-primary/15 text-primary",
    title: "Data Project Sprint",
    subtitle: "Livrez vos projets data sans recruter",
    pitch: "Externalisez vos projets d'analyse, de reporting ou d'automatisation à une équipe d'analystes seniors formés et certifiés. En 4 à 8 semaines, vous obtenez un livrable concret et opérationnel.",
    duration: "4 à 8 semaines",
    team: "1 senior + 1-2 analystes",
    format: "Présentiel ou distanciel",
    useCases: [
      { emoji: "📊", title: "Tableau de bord exécutif", desc: "KPIs, Power BI, consolidation multi-sources" },
      { emoji: "🔄", title: "Automatisation des reportings", desc: "Réduire les tâches manuelles récurrentes" },
      { emoji: "🔬", title: "Analyse de données métier", desc: "Segmentation clients, prévisions, anomalies" },
      { emoji: "🏗️", title: "Migration & structuration", desc: "Nettoyage, modélisation, base de données" },
    ],
    features: [
      "Cadrage du besoin en 48h avec votre équipe",
      "Équipe dédiée : 1 senior + analystes junior certifiés",
      "Points d'avancement bi-hebdomadaires",
      "Livrable documenté et transférable à vos équipes",
      "Formation de vos collaborateurs sur les outils livrés",
      "Support post-livraison (30 jours inclus)",
    ],
    deliverables: ["Rapport d'analyse complet", "Dashboard Power BI opérationnel", "Documentation technique", "Session de transfert de compétences"],
    price: "Sur devis",
    priceHint: "À partir de 500 000 FCFA selon la complexité",
    ctaLabel: "Décrire mon projet",
    testimonial: {
      name: "Directeur Financier",
      company: "Groupe Baobab, Dakar",
      content: "Model Technologie a livré notre tableau de bord de pilotage en 6 semaines. L'équipe était réactive, professionnelle et le résultat dépasse nos attentes.",
      initials: "DF",
    },
  },
  {
    id: "regie",
    icon: Users,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    accentBg: "bg-accent/6",
    accentBorder: "border-accent/25",
    accentText: "text-accent",
    gradient: "from-accent/15 via-accent/4 to-transparent",
    tag: "Placement",
    tagColor: "bg-accent/15 text-accent",
    title: "Model Talent Régie",
    subtitle: "Des analystes certifiés, disponibles dès demain",
    pitch: "Renforcez temporairement vos équipes avec nos meilleurs alumni. Sélectionnés, formés et certifiés par Model Technologie, ils sont opérationnels immédiatement et s'intègrent à vos outils existants.",
    duration: "1 mois à 12 mois",
    team: "1 à 3 analystes placés",
    format: "Chez vous, en présentiel",
    useCases: [
      { emoji: "📈", title: "Renfort temporaire", desc: "Projet, pic d'activité, congé maternité" },
      { emoji: "🧪", title: "Mission d'analyse", desc: "Analyste dédié sur une problématique ciblée" },
      { emoji: "🚀", title: "Montée en puissance", desc: "Construire la capacité data de votre équipe" },
      { emoji: "🔍", title: "Pré-recrutement", desc: "Tester avant de recruter en CDI" },
    ],
    features: [
      "Profils pré-sélectionnés selon vos outils et secteur",
      "Opérationnels en 48h après validation du profil",
      "Certifiés Power BI, SQL & Python par Model Technologie",
      "Suivi mensuel par un senior Model Technologie",
      "Remplacement garanti si le profil ne convient pas",
      "Possibilité de conversion en CDI après la mission",
    ],
    deliverables: ["CV et portfolio de chaque candidat", "Rapport mensuel d'activité", "Évaluation des compétences", "Accompagnement de l'intégration"],
    price: "À partir de 350 000 FCFA/mois",
    priceHint: "Selon le profil et la durée de mission",
    ctaLabel: "Trouver mon profil",
    testimonial: {
      name: "DRH",
      company: "Institution financière, Dakar",
      content: "Nous avons placé deux analystes Power BI en régie pendant 6 mois. La qualité des profils et le suivi de Model Technologie ont été exemplaires.",
      initials: "DH",
    },
  },
  {
    id: "intra",
    icon: GraduationCap,
    iconBg: "bg-foreground/10",
    iconColor: "text-foreground",
    accentBg: "bg-secondary/60",
    accentBorder: "border-border",
    accentText: "text-foreground",
    gradient: "from-foreground/8 via-foreground/2 to-transparent",
    tag: "Formation",
    tagColor: "bg-secondary text-foreground border border-border",
    title: "Formation Intra-Entreprise",
    subtitle: "Le bootcamp, adapté à vos équipes",
    pitch: "Nos formateurs se déplacent dans vos locaux avec un programme 100% adapté à votre secteur, vos outils et le niveau de vos équipes. Du débutant à l'expert, sur 2 jours à 6 semaines.",
    duration: "2 jours à 6 semaines",
    team: "De 5 à 30 participants",
    format: "Dans vos locaux · Dakar et région",
    useCases: [
      { emoji: "📊", title: "Excel & Power BI", desc: "Pour les équipes finance, contrôle de gestion" },
      { emoji: "💻", title: "Python & SQL", desc: "Pour les équipes IT, DSI, analyse" },
      { emoji: "🎯", title: "Data literacy", desc: "Sensibilisation pour tous les collaborateurs" },
      { emoji: "🏗️", title: "Programme sur mesure", desc: "Curriculum entièrement créé pour vous" },
    ],
    features: [
      "Audit des compétences initiales de vos équipes",
      "Programme entièrement adapté à votre contexte",
      "Cas pratiques sur vos données réelles",
      "Formateurs experts avec expérience enterprise",
      "Supports de cours aux couleurs de votre entreprise",
      "Support post-formation inclus (3 mois)",
    ],
    deliverables: ["Rapport d'évaluation avant/après", "Supports de cours personnalisés", "Attestations de formation", "Plan de progression individuel"],
    price: "Sur devis",
    priceHint: "À partir de 750 000 FCFA pour un groupe",
    ctaLabel: "Demander un programme",
    testimonial: {
      name: "Responsable Formation",
      company: "Télécommunications, Dakar",
      content: "Model Technologie a formé 18 de nos collaborateurs en 3 semaines intensives. Résultat : les reportings sont automatisés et toute l'équipe est autonome sur Power BI.",
      initials: "RF",
    },
  },
];

const clients = [
  { name: "BICIS", sector: "Banque" },
  { name: "Baobab", sector: "Microfinance" },
  { name: "Wave", sector: "Fintech" },
  { name: "Sonatel", sector: "Télécoms" },
  { name: "CBAO", sector: "Banque" },
  { name: "BHS", sector: "Habitat" },
];

const stats = [
  { value: "50+", label: "Projets livrés", icon: Briefcase },
  { value: "20+", label: "Entreprises clientes", icon: Building2 },
  { value: "98%", label: "Satisfaction client", icon: Star },
  { value: "48h", label: "Délai de démarrage", icon: Zap },
];

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({
                        service,
                        onClose,
                      }: {
  service: typeof services[0];
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
    const { error } = await supabase.from("contact_messages").insert({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      subject: `Service B2B : ${service.title}`,
      message: form.message.trim() || `Demande de contact pour le service : ${service.title}`,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-card-foreground">{service.ctaLabel}</h3>
              <p className={cn("text-sm font-medium", service.accentText)}>{service.title}</p>
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
                  <h4 className="font-heading font-bold text-xl text-foreground mb-2">Message envoyé ! 🎉</h4>
                  <p className="text-muted-foreground mb-6">
                    Notre équipe vous contacte dans les <strong>24 heures ouvrées</strong> pour discuter de votre projet.
                  </p>
                  <Button onClick={onClose} variant="outline" className="w-full">Fermer</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className={cn("flex items-center gap-3 p-4 rounded-xl border mb-2", service.accentBg, service.accentBorder)}>
                    <service.icon className={cn("h-5 w-5 flex-shrink-0", service.accentText)} />
                    <div className="text-sm">
                      <span className="font-semibold text-foreground">{service.tag} · </span>
                      <span className="text-muted-foreground">{service.priceHint}</span>
                    </div>
                  </div>
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
                    { name: "email", label: "Email professionnel *", placeholder: "amadou@entreprise.com", type: "email" },
                    { name: "phone", label: "Téléphone (WhatsApp)", placeholder: "+221 77 000 00 00", type: "tel" },
                    { name: "company", label: "Entreprise *", placeholder: "Nom de votre organisation", type: "text" },
                    { name: "position", label: "Votre poste", placeholder: "DG, DRH, Responsable Data...", type: "text" },
                  ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                        <input
                            name={f.name}
                            type={f.type}
                            value={form[f.name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            required={f.name === "email" || f.name === "company"}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Décrivez votre besoin</label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Votre projet, vos contraintes, votre calendrier, vos attentes..."
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    />
                  </div>
                  <Button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                          "w-full font-bold h-12",
                          service.id === "regie"
                              ? "bg-accent hover:bg-accent/90 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                      )}
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>{service.ctaLabel} <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Réponse sous 24h · Devis gratuit et sans engagement
                  </p>
                </form>
            )}
          </div>
        </div>
      </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
                       service,
                       index,
                       onContact,
                     }: {
  service: typeof services[0];
  index: number;
  onContact: (s: typeof services[0]) => void;
}) {
  const Icon = service.icon;
  const isReversed = index % 2 !== 0;

  return (
      <div
          id={service.id}
          className={cn(
              "relative rounded-3xl border-2 overflow-hidden opacity-0 animate-fade-in",
              service.accentBorder
          )}
          style={{ animationDelay: `${0.1 + index * 0.1}s` }}
      >
        {/* Top gradient */}
        <div className={cn("absolute top-0 left-0 right-0 h-48 bg-gradient-to-b pointer-events-none", service.gradient)} />

        <div className="relative z-10 p-8 lg:p-10">
          <div className={cn("grid lg:grid-cols-2 gap-12 items-start", isReversed && "")}>

            {/* ── LEFT: Description ── */}
            <div className={cn(isReversed && "lg:order-2")}>
              {/* Tag + Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-border", service.iconBg)}>
                  <Icon className={cn("h-7 w-7", service.iconColor)} />
                </div>
                <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full border", service.tagColor)}>
                {service.tag}
              </span>
              </div>

              {/* Title */}
              <h2 className="font-heading text-3xl font-bold text-foreground mb-2">{service.title}</h2>
              <p className={cn("font-semibold text-lg mb-4", service.accentText)}>{service.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed mb-8">{service.pitch}</p>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: Clock, text: service.duration },
                  { icon: Users, text: service.team },
                  { icon: Target, text: service.format },
                ].map((m) => (
                    <div key={m.text} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm font-medium">
                      <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {m.text}
                    </div>
                ))}
              </div>

              {/* Use cases */}
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Cas d'usage</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.useCases.map((uc) => (
                      <div key={uc.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                        <span className="text-xl flex-shrink-0">{uc.emoji}</span>
                        <div>
                          <div className="font-semibold text-sm text-foreground leading-tight">{uc.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{uc.desc}</div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">"{service.testimonial.content}"</p>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                      service.id === "regie"
                          ? "bg-gradient-to-br from-accent to-primary"
                          : "bg-gradient-to-br from-primary to-accent"
                  )}>
                    {service.testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-card-foreground">{service.testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{service.testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Features + Deliverables + CTA ── */}
            <div className={cn(isReversed && "lg:order-1")}>

              {/* Features */}
              <div className={cn("rounded-2xl p-6 border mb-6", service.accentBg, service.accentBorder)}>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Ce qui est inclus</div>
                <div className="space-y-3">
                  {service.features.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <CheckCircle className={cn("h-5 w-5 flex-shrink-0 mt-0.5", service.accentText)} />
                        <span className="text-sm text-foreground leading-snug">{f}</span>
                      </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div className="rounded-2xl border border-border bg-card p-6 mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Livrables
                  </div>
                </div>
                <div className="space-y-2">
                  {service.deliverables.map((d) => (
                      <div key={d} className="flex items-center gap-2.5 text-sm text-foreground">
                        <ChevronRight className={cn("h-4 w-4 flex-shrink-0", service.accentText)} />
                        {d}
                      </div>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div className="rounded-2xl border-2 border-border bg-card p-6">
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1">Tarif</div>
                  <div className="font-heading text-2xl font-bold text-foreground">{service.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">{service.priceHint}</div>
                </div>
                <Button
                    onClick={() => onContact(service)}
                    className={cn(
                        "w-full font-bold h-12 group mb-3",
                        service.id === "regie"
                            ? "bg-accent hover:bg-accent/90 text-white"
                            : "bg-primary hover:bg-primary/90 text-white"
                    )}
                >
                  {service.ctaLabel}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a
                    href="https://wa.me/221770000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  Discussion rapide sur WhatsApp
                </a>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className={cn("h-3.5 w-3.5", service.accentText)} />
                  Devis gratuit · Sans engagement · Réponse sous 24h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Services = () => {
  const [contactFor, setContactFor] = useState<typeof services[0] | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
      <Layout>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-foreground pt-20 pb-24 overflow-hidden">
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
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <Building2 className="h-3.5 w-3.5" />
                Services B2B · Pour les entreprises
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Accélérez votre{" "}
                <span className="text-accent">transformation data</span>
              </h1>
              <p className="text-lg text-background/65 mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                Confiez vos projets data à nos équipes d'analystes certifiés. Consulting, placement de talent ou formation sur mesure — nous avons la solution adaptée à votre besoin.
              </p>

              {/* Service quick nav */}
              <div className="flex flex-wrap justify-center gap-3 mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                {services.map((s) => {
                  const Icon = s.icon;
                  return (
                      <button
                          key={s.id}
                          onClick={() => scrollTo(s.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/8 border border-background/15 text-background/70 hover:bg-background/15 hover:text-background text-sm font-medium transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        {s.title}
                      </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {stats.map((s) => (
                  <div key={s.label} className="text-center p-5 rounded-2xl bg-background/6 border border-background/12">
                    <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                    <div className="font-heading text-3xl font-bold text-background mb-1">{s.value}</div>
                    <div className="text-xs text-background/45">{s.label}</div>
                  </div>
              ))}
            </div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* ── SERVICES ─────────────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="space-y-10">
              {services.map((service, index) => (
                  <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                      onContact={setContactFor}
                  />
              ))}
            </div>
          </div>
        </section>

        {/* ── CLIENTS LOGOS ────────────────────────────────── */}
        <section className="py-16 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
              Ils nous font confiance
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {clients.map((c) => (
                  <div key={c.name} className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-card border border-border min-w-[100px]">
                    <div className="font-heading font-bold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.sector}</div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl bg-foreground p-10 lg:p-14 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-accent font-semibold text-sm">Besoin d'un accompagnement personnalisé ?</span>
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-background mb-4">
                    Parlons de votre projet data
                  </h2>
                  <p className="text-background/60 text-lg mb-8 max-w-xl mx-auto">
                    Notre équipe analyse votre besoin et vous propose la solution la plus adaptée — consultation gratuite et sans engagement.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold group">
                      <Link to="/contact">
                        <Calendar className="h-4 w-4 mr-2" />
                        Prendre rendez-vous
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-background/20 text-background hover:bg-background/10">
                      <a href="https://wa.me/221770000000" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 mt-8 text-background/40 text-sm">
                    {[
                      { icon: Phone, text: "+221 77 000 00 00" },
                      { icon: Mail, text: "contact@modeltechnologie.com" },
                      { icon: Award, text: "Devis sous 24h" },
                    ].map((c) => (
                        <div key={c.text} className="flex items-center gap-1.5">
                          <c.icon className="h-4 w-4" />
                          {c.text}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT MODAL ────────────────────────────────── */}
        {contactFor && (
            <ContactModal service={contactFor} onClose={() => setContactFor(null)} />
        )}
      </Layout>
  );
};

export default Services;
