import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, Building, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
    {
        icon: Zap,
        tag: "Nouveau",
        tagColor: "bg-accent text-white",
        title: "Data Project Sprint",
        subtitle: "4 à 8 semaines",
        description:
            "Confiez vos projets data à nos équipes d'apprenants avancés encadrés par nos formateurs. Tableaux de bord, analyses, automatisations — livrés en mode sprint.",
        features: [
            "Équipe dédiée de 2-4 data analysts juniors",
            "Encadrement senior Model Technologie",
            "Méthodologie agile avec points hebdomadaires",
            "Livrables documentés et prise en main",
        ],
        useCases: ["Dashboard de suivi KPIs", "Analyse du portefeuille clients", "Automatisation des reportings"],
        cta: "Lancer un sprint",
        href: "/services",
        gradient: "from-accent/10 via-transparent to-transparent",
        border: "border-accent/20",
        accentColor: "text-accent",
    },
    {
        icon: Users,
        tag: "Placement",
        tagColor: "bg-primary text-white",
        title: "Model Talent Régie",
        subtitle: "Placement d'alumni qualifiés",
        description:
            "Accédez à notre réseau d'alumni certifiés, immédiatement opérationnels. Missions de renfort ponctuel ou intégration CDD/CDI — avec une garantie de résultat.",
        features: [
            "Sélection rigoureuse sur compétences réelles",
            "Profils validés Power BI, SQL, Python",
            "Disponibilité sous 2 semaines",
            "Accompagnement pendant la mission",
        ],
        useCases: ["Renfort data pour projet stratégique", "Remplacement congé maternité/maladie", "Intégration long terme"],
        cta: "Recruter un talent",
        href: "/services",
        gradient: "from-primary/10 via-transparent to-transparent",
        border: "border-primary/20",
        accentColor: "text-primary",
    },
];

const clients = ["BICIS", "Baobab Groupe", "Wave Mobile Money", "Sonatel", "CBAO", "BHS"];

export function B2BSection() {
    return (
        <section className="py-20 lg:py-28 bg-foreground relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `radial-gradient(circle, hsl(199,89%,48%) 1px, transparent 1px)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 border border-background/15 text-background/70 text-sm font-medium mb-4">
                            <Building className="h-3.5 w-3.5" />
                            Pour les entreprises
                        </div>
                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
                            Accélérez votre{" "}
                            <span className="text-accent">transformation data</span>
                        </h2>
                        <p className="text-background/60 text-lg">
                            Nos services B2B connectent vos besoins aux meilleurs talents data formés à Dakar.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-background/25 text-background hover:bg-background/10 group flex-shrink-0"
                    >
                        <Link to="/contact">
                            Parler à un expert
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                {/* Service Cards */}
                <div className="grid lg:grid-cols-2 gap-8 mb-16">
                    {services.map((s, index) => (
                        <div
                            key={s.title}
                            className={`relative rounded-2xl border ${s.border} bg-background/5 backdrop-blur-sm p-8 hover:bg-background/8 transition-all duration-300 opacity-0 animate-fade-in overflow-hidden group`}
                            style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                        >
                            {/* Gradient background */}
                            <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${s.gradient} pointer-events-none`} />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${s.tagColor === "bg-accent text-white" ? "bg-accent/20" : "bg-primary/20"} border border-background/10 flex items-center justify-center`}>
                                            <s.icon className={`h-6 w-6 ${s.accentColor}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-xl text-background">{s.title}</h3>
                                            <span className={`${s.accentColor} text-sm font-medium`}>{s.subtitle}</span>
                                        </div>
                                    </div>
                                    <span className={`${s.tagColor} text-xs font-bold px-3 py-1 rounded-full`}>{s.tag}</span>
                                </div>

                                {/* Description */}
                                <p className="text-background/60 text-sm leading-relaxed mb-6">{s.description}</p>

                                {/* Features */}
                                <ul className="space-y-2.5 mb-6">
                                    {s.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-background/80">
                                            <CheckCircle className={`h-4 w-4 ${s.accentColor} flex-shrink-0 mt-0.5`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* Use cases */}
                                <div className="mb-6">
                                    <div className="text-xs font-semibold text-background/40 uppercase tracking-widest mb-3">Exemples de missions</div>
                                    <div className="flex flex-wrap gap-2">
                                        {s.useCases.map((uc) => (
                                            <span key={uc} className="text-xs px-3 py-1.5 rounded-lg bg-background/8 border border-background/15 text-background/70">
                        {uc}
                      </span>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <Button
                                    asChild
                                    className={`group ${s.tagColor === "bg-accent text-white" ? "bg-accent hover:bg-accent/90" : "bg-primary hover:bg-primary/90"} text-white font-semibold w-full`}
                                >
                                    <Link to={s.href}>
                                        {s.cta}
                                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Social proof — ils nous font confiance */}
                <div className="text-center">
                    <div className="text-sm text-background/40 uppercase tracking-widest mb-6">
                        Ils nous font confiance
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                        {clients.map((c) => (
                            <span key={c} className="text-background/30 font-heading font-bold text-lg hover:text-background/50 transition-colors cursor-default">
                {c}
              </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
