import { Link } from "react-router-dom";
import { Calendar, Clock, Users, ArrowRight, AlertCircle, BarChart3, Database, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {COMPANY} from "@/config/constants.ts";

const sessions = [
    {
        bootcamp: "Bootcamp Power BI & Excel",
        icon: BarChart3,
        iconColor: "text-accent",
        iconBg: "bg-accent/10",
        tag: "Places disponibles",
        tagColor: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
        startDate: "28 Mars 2025",
        endDate: "09 Mai 2025",
        duration: "8 semaines",
        schedule: "Soirs & Week-ends",
        format: "En Ligne et/ou Présentiel · Dakar",
        placesTotal: 15,
        placesFilled: 0,
        placesLeft: 15,
        urgency: false,
        price: "150 000 FCFA",
        href: "/bootcamps",
    },
    {
        bootcamp: "Bootcamp Data Analyst SQL & Python",
        icon: Database,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        tag: "Dernières places",
        tagColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        startDate: "25 Mars 2025",
        endDate: "30 Juin 2025",
        duration: "10 semaines",
        schedule: "Soirs & Week-ends",
        format: "En ligne et/ou Présentiel · Dakar",
        placesTotal: 15,
        placesFilled: 0,
        placesLeft: 15,
        urgency: true,
        price: "100 000 FCFA",
        href: "/bootcamps/",
    },
];

function PlacesBar({ filled, total }: { filled: number; total: number }) {
    const pct = Math.round((filled / total) * 100);
    const isUrgent = pct >= 80;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{filled}/{total} places occupées</span>
                <span className={isUrgent ? "text-orange-500 font-semibold" : "text-muted-foreground"}>
          {total - filled} restantes
        </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isUrgent ? "bg-orange-500" : "bg-green-500"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export function SessionsSection() {
    return (
        <section className="py-20 lg:py-28 bg-background">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                            <Calendar className="h-3.5 w-3.5" />
                            Prochaines sessions
                        </div>
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                            Rejoignez la prochaine session
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Les places sont limitées pour garantir un suivi personnalisé de chaque apprenant.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="lg" className="group flex-shrink-0">
                        <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                            Nous contacter sur WhatsApp
                        </a>
                    </Button>
                </div>

                {/* Session cards */}
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {sessions.map((s, index) => (
                        <div
                            key={s.bootcamp}
                            className={`
                relative rounded-2xl border-2 bg-card p-8 transition-all duration-300 hover:shadow-card
                opacity-0 animate-fade-in
                ${s.urgency ? "border-orange-500/30" : "border-border hover:border-primary/30"}
              `}
                            style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                        >
                            {/* Urgency banner */}
                            {s.urgency && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Plus que {s.placesLeft} places disponibles !
                                </div>
                            )}

                            <div className="mt-2">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                                            <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-card-foreground text-base leading-tight">
                                                {s.bootcamp}
                                            </h3>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`text-xs font-semibold border ${s.tagColor}`}>
                                        {s.tag}
                                    </Badge>
                                </div>

                                {/* Date info */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { icon: Calendar, label: "Début", value: s.startDate },
                                        { icon: Clock, label: "Durée", value: s.duration },
                                        { icon: Users, label: "Format", value: s.format },
                                        { icon: Calendar, label: "Horaires", value: s.schedule },
                                    ].map((info) => (
                                        <div key={info.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border">
                                            <info.icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">{info.label}</div>
                                                <div className="text-sm font-semibold text-foreground">{info.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Places bar */}
                                <div className="mb-6">
                                    <PlacesBar filled={s.placesFilled} total={s.placesTotal} />
                                </div>

                                {/* Price + CTA */}
                                <div className="flex items-center gap-4 pt-5 border-t border-border">
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground mb-0.5">Tarif</div>
                                        <div className="font-heading font-bold text-foreground">{s.price}</div>
                                    </div>
                                    <Button asChild className="group bg-foreground hover:bg-foreground/90 text-background font-semibold">
                                        <Link to={s.href}>
                                            Réserver ma place
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA band */}
                <div className="rounded-2xl bg-gradient-to-r from-primary via-[hsl(208,80%,45%)] to-accent p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
                    <div className="relative z-10">
                        <h3 className="font-heading text-2xl font-bold text-white mb-2">
                            Vous ne trouvez pas la session qui vous convient ?
                        </h3>
                        <p className="text-white/80 mb-6">
                            Inscrivez-vous à notre liste d'attente et soyez notifié en priorité pour les prochaines ouvertures.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-semibold group">
                                <Link to="/contact">
                                    Rejoindre la liste d'attente
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/40 text-white bg-black/80 hover:bg-black/80"
                            >
                                <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
