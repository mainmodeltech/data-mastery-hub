import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Target, Eye, Heart, Award, ArrowRight, Users, MapPin,
  Sparkles, TrendingUp, GraduationCap, Building2, BarChart3,
  CheckCircle, Linkedin, MessageCircle, Star, Zap,
  BookOpen, Globe
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const timeline = [
  {
    year: "2022",
    label: "Fondation",
    desc: "Création de Model Technologie à Dakar, avec une première promotion de 8 apprenants Power BI.",
    icon: "🚀",
  },
  {
    year: "2023",
    label: "Expansion",
    desc: "Lancement du bootcamp Data Analyst SQL/Python. 60+ apprenants formés. Premiers partenariats entreprises.",
    icon: "📈",
  },
  {
    year: "2024",
    label: "Maturité",
    desc: "150+ alumni en poste. Lancement des services B2B : consulting et placement. 20+ clients entreprises.",
    icon: "🏆",
  },
  {
    year: "2025",
    label: "Référence régionale",
    desc: "Ambition : devenir la référence data en Afrique francophone de l'Ouest. Expansion prévue.",
    icon: "🌍",
  },
];

const values = [
  {
    icon: Target,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    title: "Excellence",
    desc: "Des contenus actualisés en permanence, calqués sur ce que les entreprises attendent vraiment de leurs analystes.",
  },
  {
    icon: Eye,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    title: "Pragmatisme",
    desc: "100% des exercices sont basés sur des données réelles. Vous sortez avec un portfolio, pas juste un certificat.",
  },
  {
    icon: Heart,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    title: "Proximité",
    desc: "Des promotions volontairement limitées (10-12 apprenants) pour un suivi individualisé et une vraie communauté.",
  },
  {
    icon: Award,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    title: "Impact mesurable",
    desc: "Nous mesurons notre succès au taux de placement de nos alumni et à l'impact concret sur les entreprises clientes.",
  },
];

const team = [
  {
    initials: "LM",
    name: "Lionnel",
    role: "Fondateur & Directeur",
    desc: "Expert en data analytics avec plus de 10 ans d'expérience en banque et conseil en transformation digitale.",
    gradient: "from-primary to-accent",
    linkedin: "#",
    tags: ["Power BI", "Stratégie", "Banque & Finance"],
  },
  {
    initials: "PM",
    name: "Primaël",
    role: "Directeur Administratif & Financier",
    desc: "Garant de la structure opérationnelle et financière. Pilote la croissance et les partenariats stratégiques.",
    gradient: "from-accent to-primary",
    linkedin: "#",
    tags: ["Finance", "Administration", "Partenariats"],
  },
  {
    initials: "ZN",
    name: "Zeinab",
    role: "Responsable Marketing & Communication",
    desc: "Architecte de la présence digitale de Model Technologie. Pilote la communauté alumni et les partenariats.",
    gradient: "from-primary/80 to-accent/80",
    linkedin: "#",
    tags: ["Marketing Digital", "Community", "Contenu"],
  },
  {
    initials: "CD",
    name: "Cédric",
    role: "Formateur Power BI & Excel",
    desc: "Certifié Microsoft PL-300. Formateur principal du bootcamp Power BI avec une approche ultra-pratique.",
    gradient: "from-accent/90 to-primary/90",
    linkedin: "#",
    tags: ["Power BI", "DAX", "Excel Avancé"],
  },
  {
    initials: "MK",
    name: "Mardochée",
    role: "Formateur SQL & Python",
    desc: "Data Analyst senior avec expérience en fintech. Formateur principal du bootcamp Data Analyst.",
    gradient: "from-primary to-primary/70",
    linkedin: "#",
    tags: ["Python", "SQL", "Data Engineering"],
  },
];

const stats = [
  { value: "3", label: "ans d'existence", icon: Star },
  { value: "150+", label: "alumni formés", icon: GraduationCap },
  { value: "90%", label: "en poste en 3 mois", icon: TrendingUp },
  { value: "20+", label: "entreprises clientes", icon: Building2 },
];

const partners = [
  { name: "BICIS", sector: "Banque" },
  { name: "Baobab", sector: "Microfinance" },
  { name: "Wave", sector: "Fintech" },
  { name: "Sonatel", sector: "Télécoms" },
  { name: "CBAO", sector: "Banque" },
  { name: "BHS", sector: "Habitat" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const About = () => {
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
            <div className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <MapPin className="h-3.5 w-3.5" />
                  Dakar, Sénégal · Depuis 2022
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  Former la génération data
                  <br />
                  <span className="text-accent">d'Afrique de l'Ouest</span>
                </h1>
                <p className="text-lg text-background/65 leading-relaxed mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  Model Technologie est née d'un constat simple : les entreprises africaines avaient besoin de talents data locaux, formés sur des données réelles, avec un accès à l'emploi dès la sortie.
                </p>
                <div className="flex flex-wrap gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                  <Button asChild className="bg-accent hover:bg-accent/90 text-white font-bold group">
                    <Link to="/bootcamps">
                      Nos bootcamps
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-background/20 text-background hover:bg-background/10">
                    <Link to="/contact">Nous contacter</Link>
                  </Button>
                </div>
              </div>

              {/* Right — stats */}
              <div className="grid grid-cols-2 gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {stats.map((s) => (
                    <div key={s.label} className="p-6 rounded-2xl bg-background/6 border border-background/12 text-center">
                      <s.icon className="h-5 w-5 text-accent mx-auto mb-3" />
                      <div className="font-heading text-4xl font-bold text-background mb-1">{s.value}</div>
                      <div className="text-sm text-background/45">{s.label}</div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* ── MISSION & VISION ─────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Target,
                  iconBg: "bg-primary/10",
                  iconColor: "text-primary",
                  label: "Notre Mission",
                  title: "Démocratiser la data en Afrique",
                  content: "Accompagner les entreprises et professionnels africains dans leur transformation data en leur fournissant des formations de qualité internationale, ancrées dans les réalités du marché local et orientées vers l'emploi.",
                },
                {
                  icon: Globe,
                  iconBg: "bg-accent/10",
                  iconColor: "text-accent",
                  label: "Notre Vision",
                  title: "La référence data francophone",
                  content: "Devenir le premier centre de formation Data & Business Intelligence en Afrique francophone de l'Ouest, en contribuant à l'émergence d'une nouvelle génération de professionnels capables de transformer les données en décisions stratégiques.",
                },
              ].map((item, i) => (
                  <div
                      key={item.label}
                      className="p-8 lg:p-10 rounded-3xl border-2 border-border bg-card opacity-0 animate-fade-in"
                      style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", item.iconBg)}>
                      <item.icon className={cn("h-7 w-7", item.iconColor)} />
                    </div>
                    <div className={cn("text-xs font-bold uppercase tracking-widest mb-2", item.iconColor)}>
                      {item.label}
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.content}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STORY TIMELINE ───────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Notre parcours
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                  Une startup née du terrain
                </h2>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[28px] lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-px" />

                <div className="space-y-10">
                  {timeline.map((item, i) => {
                    const isRight = i % 2 === 0;
                    return (
                        <div
                            key={item.year}
                            className={cn(
                                "relative flex items-start gap-6 lg:gap-0 opacity-0 animate-fade-in",
                                "lg:grid lg:grid-cols-2"
                            )}
                            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                        >
                          {/* Left content (desktop even) */}
                          <div className={cn("hidden lg:flex", isRight ? "justify-end pr-12" : "pl-12 lg:order-2")}>
                            {isRight && (
                                <div className="max-w-xs text-right">
                                  <div className="font-heading text-5xl font-bold text-primary/20 mb-1">{item.year}</div>
                                  <div className="font-bold text-foreground mb-2">{item.label}</div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            )}
                          </div>

                          {/* Dot */}
                          <div className="relative z-10 w-14 h-14 rounded-2xl bg-card border-2 border-border flex items-center justify-center text-2xl flex-shrink-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-0">
                            {item.icon}
                          </div>

                          {/* Right content (desktop odd) */}
                          <div className={cn("flex-1 lg:flex", isRight ? "lg:pl-12 lg:order-2" : "lg:justify-end lg:pr-12")}>
                            <div className="max-w-xs">
                              {/* Mobile always shows */}
                              <div className="lg:hidden font-heading text-4xl font-bold text-primary/20 mb-1">{item.year}</div>
                              <div className="lg:hidden font-bold text-foreground mb-2">{item.label}</div>
                              <p className="lg:hidden text-sm text-muted-foreground leading-relaxed">{item.desc}</p>

                              {/* Desktop: only show on odd */}
                              {!isRight && (
                                  <>
                                    <div className="hidden lg:block font-heading text-5xl font-bold text-primary/20 mb-1">{item.year}</div>
                                    <div className="hidden lg:block font-bold text-foreground mb-2">{item.label}</div>
                                    <p className="hidden lg:block text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                  </>
                              )}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALEURS ──────────────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Heart className="h-3.5 w-3.5 text-primary" />
                Ce qui nous guide
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Nos valeurs
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                  <div
                      key={value.title}
                      className="p-7 rounded-2xl border border-border bg-card hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 opacity-0 animate-fade-in"
                      style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5", value.iconBg)}>
                      <value.icon className={cn("h-6 w-6", value.iconColor)} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ÉQUIPE ───────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Users className="h-3.5 w-3.5 text-accent" />
                Les humains derrière Model Technologie
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                L'équipe
              </h2>
              <p className="text-muted-foreground">
                5 passionnés de data, anciens du secteur bancaire, de la fintech et du conseil,
                unis par la même mission.
              </p>
            </div>

            {/* Top row - founder + DAF */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-6">
              {team.slice(0, 2).map((member, i) => (
                  <TeamCard key={member.name} member={member} delay={0.1 + i * 0.08} />
              ))}
            </div>
            {/* Bottom row - 3 */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {team.slice(2).map((member, i) => (
                  <TeamCard key={member.name} member={member} delay={0.25 + i * 0.08} />
              ))}
            </div>
          </div>
        </section>

        {/* ── PARTENAIRES ──────────────────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
              Entreprises qui font confiance à nos alumni
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {partners.map((p) => (
                  <div
                      key={p.name}
                      className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="font-heading font-bold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sector}</div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-secondary/40 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl bg-foreground p-10 lg:p-14 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)] pointer-events-none" />
                <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-4">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-accent text-sm font-semibold">Rejoignez l'aventure</span>
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-background mb-4">
                      Prêt à transformer votre carrière ?
                    </h2>
                    <p className="text-background/60 leading-relaxed">
                      Rejoignez les 150+ alumni qui ont déjà fait le saut. La prochaine promotion commence bientôt.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold group">
                      <Link to="/bootcamps">
                        Voir les bootcamps
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-background/20 text-background hover:bg-background/10">
                      <Link to="/orientation">
                        <Zap className="h-4 w-4 mr-2 text-accent" />
                        Quiz d'orientation (2 min)
                      </Link>
                    </Button>
                    <a
                        href="https://wa.me/221770000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-background/15 text-background/60 hover:text-background hover:bg-background/8 text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-green-400" />
                      Nous contacter sur WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </Layout>
  );
};

// ─── TeamCard subcomponent ────────────────────────────────────────────────────

function TeamCard({ member, delay }: { member: typeof team[0]; delay: number }) {
  return (
      <div
          className="rounded-2xl border border-border bg-card p-7 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 opacity-0 animate-fade-in"
          style={{ animationDelay: `${delay}s` }}
      >
        {/* Avatar */}
        <div className="flex items-start justify-between mb-5">
          <div
              className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br",
                  member.gradient
              )}
          >
            {member.initials}
          </div>
          <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </div>

        <h3 className="font-heading font-bold text-foreground text-lg leading-tight mb-0.5">{member.name}</h3>
        <p className="text-sm font-medium text-primary mb-3">{member.role}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{member.desc}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {member.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-secondary border border-border text-muted-foreground font-medium">
            {tag}
          </span>
          ))}
        </div>
      </div>
  );
}

export default About;
