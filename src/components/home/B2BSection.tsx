import { Link } from "react-router-dom";
import { ArrowRight, Building, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { B2B_OFFERS } from "@/config/b2b-offers.config";

export function B2BSection() {
    return (
        <section className="py-20 lg:py-28 bg-foreground relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `radial-gradient(circle, hsl(16,92%,47%) 1px, transparent 1px)`,
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
                            Rendez vos équipes{" "}
                            <span className="text-accent">autonomes sur la donnée</span>
                        </h2>
                        <p className="text-background/60 text-lg">
                            De l'Excel au Power BI, jusqu'à la formation data sur mesure — un diagnostic gratuit et un contenu construit sur vos données réelles.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-background/25 text-background hover:bg-background/10 group flex-shrink-0"
                    >
                        <Link to="/entreprises">
                            Voir l'offre entreprises
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                {/* Offer Cards */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {B2B_OFFERS.map((offer, index) => {
                        const isAccent = offer.colorKey === "accent";
                        return (
                            <div
                                key={offer.id}
                                className={`relative rounded-2xl border ${isAccent ? "border-accent/20" : "border-primary/20"} bg-background/5 backdrop-blur-sm p-8 hover:bg-background/8 transition-all duration-300 opacity-0 animate-fade-in overflow-hidden group`}
                                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                            >
                                {/* Gradient background */}
                                <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${isAccent ? "from-accent/15" : "from-primary/15"} via-transparent to-transparent pointer-events-none`} />

                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-xl ${isAccent ? "bg-accent/20" : "bg-primary/20"} border border-background/10 flex items-center justify-center`}>
                                            <offer.icon className={`h-6 w-6 ${isAccent ? "text-accent" : "text-primary"}`} />
                                        </div>
                                        <span className={`${isAccent ? "bg-accent text-white" : "bg-primary text-white"} text-xs font-bold px-3 py-1 rounded-full`}>{offer.ref}</span>
                                    </div>

                                    <h3 className="font-heading font-bold text-xl text-background mb-1">{offer.title}</h3>
                                    <p className={`${isAccent ? "text-accent" : "text-primary"} text-sm font-medium mb-4`}>{offer.tagline}</p>

                                    {/* Description */}
                                    <p className="text-background/60 text-sm leading-relaxed mb-6">{offer.objectif}</p>

                                    {/* Différenciateurs */}
                                    <ul className="space-y-2.5 mb-6">
                                        {offer.differenciateurs.slice(0, 2).map((d) => (
                                            <li key={d} className="flex items-start gap-2.5 text-sm text-background/80">
                                                <CheckCircle className={`h-4 w-4 ${isAccent ? "text-accent" : "text-primary"} flex-shrink-0 mt-0.5`} />
                                                {d}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Button
                                        asChild
                                        className={`group ${isAccent ? "bg-accent hover:bg-accent/90" : "bg-primary hover:bg-primary/90"} text-white font-semibold w-full`}
                                    >
                                        <Link to={`/entreprises#${offer.id}`}>
                                            {offer.ctaLabel}
                                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
