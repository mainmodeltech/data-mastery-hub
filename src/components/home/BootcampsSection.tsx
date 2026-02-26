import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Database, Clock, Users, Target, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const bootcamps = [
    {
        id: "powerbi",
        badge: "Bestseller",
        badgeColor: "bg-accent text-white",
        icon: BarChart3,
        iconBg: "bg-accent/10",
        iconColor: "text-accent",
        accentColor: "accent",
        borderHover: "hover:border-accent/50",
        title: "Bootcamp Power BI & Excel",
        subtitle: "Business Intelligence & Reporting",
        description:
            "Maîtrisez Power BI et Excel pour créer des tableaux de bord professionnels, automatiser vos rapports et piloter la performance de votre entreprise.",
        duration: "8 semaines",
        level: "Débutant → Confirmé",
        audience: "12 apprenants max",
        price: "À partir de 350 000 FCFA",
        tools: ["Power BI", "Excel", "DAX", "Power Query", "SharePoint"],
        outcomes: [
            "Créer des dashboards interactifs",
            "Automatiser les rapports mensuels",
            "Maîtriser le langage DAX",
            "Préparer la certification PL-300",
        ],
        profiles: ["Contrôleurs de gestion", "Responsables RH", "Managers", "Commerciaux"],
        href: "/bootcamps/powerbi",
        highlighted: false,
    },
    {
        id: "data-analyst",
        badge: "Complet",
        badgeColor: "bg-primary text-white",
        icon: Database,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        accentColor: "primary",
        borderHover: "hover:border-primary/50",
        title: "Bootcamp Data Analyst",
        subtitle: "SQL, Python & Visualisation",
        description:
            "Devenez Data Analyst full-stack : collectez, nettoyez, analysez et visualisez des données réelles avec les outils utilisés dans les meilleures entreprises.",
        duration: "12 semaines",
        level: "Débutant → Opérationnel",
        audience: "10 apprenants max",
        price: "À partir de 450 000 FCFA",
        tools: ["Python", "SQL", "Power BI", "Pandas", "Matplotlib", "PostgreSQL"],
        outcomes: [
            "Interroger des bases de données SQL",
            "Analyser des données avec Python",
            "Visualiser et storyteller avec les données",
            "Réaliser un projet data end-to-end",
        ],
        profiles: ["Reconversions professionnelles", "Développeurs", "Financiers", "Diplômés récents"],
        href: "/bootcamps/data-analyst",
        highlighted: true,
    },
];

export function BootcampsSection() {
    return (
        <section className="py-20 lg:py-28 bg-secondary/50">
            <div className="container mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                        <Sparkles className="h-3.5 w-3.5" />
                        Nos formations phares
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        2 bootcamps pour{" "}
                        <span className="text-primary">décrocher votre premier poste</span>
                        <br />en data
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Des programmes intensifs construits avec les entreprises qui recrutent à Dakar.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {bootcamps.map((bc, index) => (
                        <div
                            key={bc.id}
                            className={`
                relative flex flex-col rounded-2xl border-2 bg-card transition-all duration-300
                ${bc.highlighted
                                ? "border-primary shadow-[0_0_40px_hsl(217,72%,42%,0.15)] scale-[1.01]"
                                : "border-border shadow-card"
                            }
                ${bc.borderHover}
                hover:shadow-xl
                opacity-0 animate-fade-in
              `}
                            style={{ animationDelay: `${0.15 + index * 0.15}s` }}
                        >
                            {/* Top badge */}
                            <div className="absolute -top-3.5 left-6">
                <span className={`${bc.badgeColor} text-xs font-bold px-4 py-1.5 rounded-full shadow-sm uppercase tracking-wide`}>
                  {bc.badge}
                </span>
                            </div>

                            <div className="p-8 flex flex-col h-full">
                                {/* Icon + Title */}
                                <div className="flex items-start gap-4 mb-6 mt-2">
                                    <div className={`w-14 h-14 rounded-2xl ${bc.iconBg} border border-border flex items-center justify-center flex-shrink-0`}>
                                        <bc.icon className={`h-7 w-7 ${bc.iconColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-xl font-bold text-card-foreground">{bc.title}</h3>
                                        <p className={`text-sm font-medium ${bc.iconColor} mt-0.5`}>{bc.subtitle}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{bc.description}</p>

                                {/* Info pills */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {[
                                        { icon: Clock, text: bc.duration },
                                        { icon: Target, text: bc.level },
                                        { icon: Users, text: bc.audience },
                                    ].map((info) => (
                                        <div
                                            key={info.text}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs text-foreground font-medium"
                                        >
                                            <info.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            {info.text}
                                        </div>
                                    ))}
                                </div>

                                {/* Outcomes */}
                                <div className="mb-6">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                        Ce que vous apprendrez
                                    </div>
                                    <ul className="space-y-2">
                                        {bc.outcomes.map((o) => (
                                            <li key={o} className="flex items-start gap-2.5 text-sm text-card-foreground">
                                                <CheckCircle className={`h-4 w-4 ${bc.iconColor} flex-shrink-0 mt-0.5`} />
                                                {o}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tools */}
                                <div className="mb-6">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                        Outils maîtrisés
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {bc.tools.map((tool) => (
                                            <Badge key={tool} variant="secondary" className="text-xs font-medium">
                                                {tool}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* Price + CTA */}
                                <div className="pt-6 border-t border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-0.5">Tarif</div>
                                            <div className="font-heading font-bold text-foreground text-base">{bc.price}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground mb-0.5">Profils cibles</div>
                                            <div className="text-xs text-foreground">{bc.profiles[0]} &amp; +</div>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        className={`w-full group font-semibold ${
                                            bc.highlighted
                                                ? "bg-primary hover:bg-primary/90 text-white"
                                                : "bg-foreground hover:bg-foreground/90 text-background"
                                        }`}
                                        size="lg"
                                    >
                                        <Link to={bc.href}>
                                            En savoir plus
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compare link */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Pas sûr du choix ?{" "}
                    <Link to="/orientation" className="text-primary hover:underline font-medium">
                        Répondez à 5 questions pour trouver votre parcours →
                    </Link>
                </p>
            </div>
        </section>
    );
}
