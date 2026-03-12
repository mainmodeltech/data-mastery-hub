import { Link } from "react-router-dom";
import { ArrowRight, Compass, BarChart3, Database, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

const questions = [
    { icon: "💼", text: "Salarié en poste", tag: "powerbi" },
    { icon: "🔄", text: "En reconversion", tag: "data" },
    { icon: "🚀", text: "Entrepreneur", tag: "b2b" },
];

const results = [
    {
        icon: BarChart3,
        label: "Power BI",
        color: "text-accent",
        bg: "bg-accent/10",
        border: "border-accent/20",
        desc: "Idéal pour les salariés",
    },
    {
        icon: Database,
        label: "SQL & Python",
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        desc: "Pour les reconversions",
    },
    {
        icon: Building,
        label: "Formation B2B",
        color: "text-foreground",
        bg: "bg-secondary",
        border: "border-border",
        desc: "Pour les entreprises",
    },
];

export function OrientationTeaser() {
    return (
        <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Left — Text */}
                        <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                                <Compass className="h-3.5 w-3.5" />
                                Parcours d'orientation
                            </div>
                            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Pas sûr du bootcamp
                                <br />
                                <span className="text-accent">qui vous convient ?</span>
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                                En 5 questions rapides, découvrez exactement quel programme correspond
                                à votre profil, vos objectifs et votre niveau actuel.
                            </p>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex -space-x-2">
                                    {["AM", "FD", "MS", "KT"].map((initials, i) => (
                                        <div
                                            key={initials}
                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                                            style={{ zIndex: 4 - i }}
                                        >
                                            {initials[0]}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <strong className="text-foreground">+120 personnes</strong> ont déjà utilisé ce parcours
                                </p>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className="bg-accent hover:bg-accent/90 text-white font-semibold group shadow-glow"
                            >
                                <Link to="/orientation">
                                    <Compass className="h-5 w-5 mr-2" />
                                    Trouver mon bootcamp
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>

                        {/* Right — Interactive preview */}
                        <div className="opacity-0 animate-fade-in-right" style={{ animationDelay: "0.2s" }}>
                            <div className="relative rounded-2xl border-2 border-border bg-card p-6 shadow-card">
                                {/* Progress bar */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="text-xs font-semibold text-muted-foreground">Question 1 sur 5</div>
                                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                        <div className="h-full w-1/5 rounded-full bg-gradient-to-r from-primary to-accent" />
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="mb-6">
                                    <div className="font-heading font-bold text-lg text-card-foreground mb-1">
                                        Vous êtes plutôt...
                                    </div>
                                    <div className="text-sm text-muted-foreground">Choisissez votre situation actuelle</div>
                                </div>

                                {/* Options */}
                                <div className="space-y-3 mb-6">
                                    {questions.map((q, i) => (
                                        <div
                                            key={q.text}
                                            className={`
                        flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${i === 0
                                                ? "border-accent bg-accent/5 shadow-sm"
                                                : "border-border bg-secondary/50 hover:border-accent/30 hover:bg-accent/3"
                                            }
                      `}
                                        >
                                            <span className="text-xl">{q.icon}</span>
                                            <span className={`font-medium text-sm ${i === 0 ? "text-accent" : "text-foreground"}`}>
                        {q.text}
                      </span>
                                            {i === 0 && (
                                                <div className="ml-auto w-5 h-5 rounded-full border-2 border-accent bg-accent flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Result preview */}
                                <div className="rounded-xl bg-secondary/50 border border-border p-4">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                                        Résultats possibles
                                    </div>
                                    <div className="flex gap-2">
                                        {results.map((r) => (
                                            <div
                                                key={r.label}
                                                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl ${r.bg} border ${r.border}`}
                                            >
                                                <r.icon className={`h-4 w-4 ${r.color}`} />
                                                <span className={`text-xs font-bold ${r.color}`}>{r.label}</span>
                                                <span className="text-xs text-muted-foreground text-center leading-tight">{r.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
