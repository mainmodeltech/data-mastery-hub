import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar, Clock, Users, ArrowRight, AlertCircle,
    BarChart3, Database, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/config/constants.ts";
import { httpClient } from "@/services/httpClient";
import { RegistrationModal } from "@/pages/RegistrationModal";
import { getBootcampStatic } from "@/config/bootcamps.config.ts";
import type { Bootcamp, BootcampSession } from "@/types/bootcamp.type";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// ─── Types du backend ─────────────────────────────────────────────────────────
// Reflète exactement BootcampResponse + BootcampSessionResponse Java

interface BackendSession {
    id:                  string;
    sessionName:         string | null;
    startDate:           string | null;
    endDate:             string | null;
    schedule:            string | null;
    format:              "PRESENTIEL" | "REMOTE" | "HYBRID" | null;
    maxParticipants:     number | null;
    currentParticipants: number | null;
    spotsRemaining:      number | null;
    price:               string | null;
    status:              string | null;
}

interface BackendBootcamp {
    id:           string;
    title:        string;
    description:  string | null;
    duration:     string | null;
    price:        string | null;
    benefits:     string[] | null;
    category:     string | null;
    tag:          string | null;
    iconName:     string | null;
    featured:     boolean | null;
    published:    boolean | null;
    displayOrder: number | null;
    nextSession:  BackendSession | null;
    sessions:     BackendSession[] | null;
}

// ─── Mapping backend → type Bootcamp de l'app ────────────────────────────────
// Convertit BootcampResponse en type attendu par RegistrationModal

function toAppBootcamp(b: BackendBootcamp): Bootcamp {
    const ns = b.nextSession;

    const appSession: BootcampSession | null = ns
        ? {
            id:                  ns.id,
            sessionName:         ns.sessionName ?? null,
            startDate:           ns.startDate ?? null,
            endDate:             ns.endDate ?? null,
            schedule:            ns.schedule ?? null,
            format:              ns.format ?? "HYBRID",
            maxParticipants:     ns.maxParticipants ?? 20,
            currentParticipants: ns.currentParticipants ?? 0,
            spotsRemaining:      ns.spotsRemaining ?? null,
            price:               ns.price ?? b.price ?? null,
            status:              (ns.status as BootcampSession["status"]) ?? "OPEN",
        }
        : null;

    return {
        id:           b.id,
        title:        b.title,
        description:  b.description ?? null,
        duration:     b.duration ?? null,
        price:        b.price ?? null,
        benefits:     b.benefits ?? [],
        category:     b.category ?? "data",
        tag:          b.tag ?? null,
        featured:     b.featured ?? false,
        published:    b.published ?? true,
        displayOrder: b.displayOrder ?? 0,
        nextSession:  appSession,
        sessions:     null,
        audience:     null,
        prerequisites: null,
    };
}

// ─── Fallback statique ────────────────────────────────────────────────────────

const STATIC_BOOTCAMPS: BackendBootcamp[] = [
    {
        id: "static-1", title: "Bootcamp Power BI & Excel",
        description: "Maîtrisez Power BI et Excel : tableaux de bord, DAX, Power Query.",
        duration: "8 semaines", price: "150 000 FCFA",
        benefits: ["Tableaux de bord interactifs", "DAX & Power Query", "Certification incluse"],
        category: "bi", tag: null, iconName: null,
        featured: false, published: true, displayOrder: 1,
        nextSession: { id: "s1", sessionName: "Prochainement", startDate: null, endDate: null,
            schedule: "Soirs & Week-ends", format: "HYBRID",
            maxParticipants: 15, currentParticipants: 0, spotsRemaining: 15,
            price: "150 000 FCFA", status: "OPEN" },
        sessions: null,
    },
    {
        id: "static-2", title: "Bootcamp Data Analyst SQL & Python",
        description: "Devenez Data Analyst : Python, SQL, visualisation et projets réels.",
        duration: "10 semaines", price: "100 000 FCFA",
        benefits: ["Python & SQL", "Projets réels", "Portfolio certifié"],
        category: "data", tag: null, iconName: null,
        featured: true, published: true, displayOrder: 0,
        nextSession: { id: "s2", sessionName: "Prochainement", startDate: null, endDate: null,
            schedule: "Soirs & Week-ends", format: "HYBRID",
            maxParticipants: 15, currentParticipants: 0, spotsRemaining: 15,
            price: "100 000 FCFA", status: "OPEN" },
        sessions: null,
    },
];

// ─── Helpers d'affichage ──────────────────────────────────────────────────────

function getBootcampStyle(b: BackendBootcamp) {
    const isPowerBI =
        b.title.toLowerCase().includes("power bi") ||
        b.title.toLowerCase().includes("excel") ||
        b.category?.toLowerCase() === "bi";
    return isPowerBI
        ? { icon: BarChart3, iconColor: "text-accent",  iconBg: "bg-accent/10"  }
        : { icon: Database,  iconColor: "text-primary", iconBg: "bg-primary/10" };
}

function formatSessionDate(session: BackendSession | null): string {
    if (!session) return "À confirmer";
    if (session.sessionName) return session.sessionName;
    if (!session.startDate)  return "À confirmer";
    if (session.startDate.includes("-") && session.startDate.length === 10) {
        const [y, m, d] = session.startDate.split("-");
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
            "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        return `${d} ${months[parseInt(m) - 1]} ${y}`;
    }
    return session.startDate;
}

// ─── Barre de places ──────────────────────────────────────────────────────────

function PlacesBar({ session }: { session: BackendSession | null }) {
    if (!session?.maxParticipants) return null;
    const filled = session.currentParticipants ?? 0;
    const total  = session.maxParticipants;
    const left   = session.spotsRemaining ?? (total - filled);
    const pct    = Math.round((filled / total) * 100);
    const isUrgent = pct >= 60;

    return (
        <div>
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{filled}/{total} places occupées</span>
                <span className={cn("font-semibold", isUrgent ? "text-orange-500" : "text-green-500")}>
                    {left} restante{left > 1 ? "s" : ""}
                </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-500",
                        isUrgent ? "bg-orange-500" : "bg-green-500")}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ─── Badge statut ─────────────────────────────────────────────────────────────

function StatusBadge({ bootcamp }: { bootcamp: BackendBootcamp }) {
    const session = bootcamp.nextSession;
    if (bootcamp.tag) {
        return <Badge variant="outline" className="text-xs font-semibold border bg-green-500/10 text-green-600 border-green-500/20">{bootcamp.tag}</Badge>;
    }
    const status = session?.status?.toUpperCase();
    if (status === "FULL")   return <Badge variant="outline" className="text-xs font-semibold border bg-red-500/10 text-red-600 border-red-500/20">Complet</Badge>;
    if (status === "CLOSED") return <Badge variant="outline" className="text-xs font-semibold border bg-gray-500/10 text-gray-600 border-gray-500/20">Inscriptions fermées</Badge>;
    const pct = session?.maxParticipants
        ? Math.round(((session.currentParticipants ?? 0) / session.maxParticipants) * 100)
        : 0;
    if (pct >= 60) return <Badge variant="outline" className="text-xs font-semibold border bg-orange-500/10 text-orange-600 border-orange-500/20">Dernières places</Badge>;
    return <Badge variant="outline" className="text-xs font-semibold border bg-green-500/10 text-green-600 border-green-500/20">Places disponibles</Badge>;
}

// ─── Carte bootcamp ───────────────────────────────────────────────────────────

function SessionCard({
                         bootcamp,
                         index,
                         onRegister,
                     }: {
    bootcamp: BackendBootcamp;
    index:    number;
    onRegister: (b: BackendBootcamp) => void;
}) {
    const style    = getBootcampStyle(bootcamp);
    const Icon     = style.icon;
    const session  = bootcamp.nextSession;
    const isUrgent = bootcamp.featured ||
        (session?.maxParticipants
            ? Math.round(((session.currentParticipants ?? 0) / session.maxParticipants) * 100) >= 60
            : false);
    const spotsLeft = session?.spotsRemaining;
    const canRegister = session && session.status !== "FULL" && session.status !== "CLOSED";

    return (
        <div
            className={cn(
                "relative rounded-2xl border-2 bg-card p-8 transition-all duration-300 hover:shadow-card opacity-0 animate-fade-in",
                isUrgent ? "border-orange-500/30" : "border-border hover:border-primary/30"
            )}
            style={{ animationDelay: `${0.1 + index * 0.15}s` }}
        >
            {/* Bannière urgence */}
            {isUrgent && spotsLeft !== null && spotsLeft !== undefined && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Plus que {spotsLeft} place{spotsLeft > 1 ? "s" : ""} !
                </div>
            )}

            <div className="mt-2">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", style.iconBg)}>
                            <Icon className={cn("h-6 w-6", style.iconColor)} />
                        </div>
                        <h3 className="font-heading font-bold text-card-foreground text-base leading-tight">
                            {bootcamp.title}
                        </h3>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                        <StatusBadge bootcamp={bootcamp} />
                    </div>
                </div>

                {/* Infos clés */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                        { icon: Calendar, label: "Prochaine session", value: formatSessionDate(session) },
                        { icon: Clock,    label: "Durée",             value: bootcamp.duration ?? "—" },
                        { icon: Users,    label: "Format",            value: session?.format === "PRESENTIEL" ? "Présentiel · Dakar" : session?.format === "REMOTE" ? "En ligne" : "Hybride · Dakar" },
                        { icon: Calendar, label: "Horaires",          value: session?.schedule ?? "Soirs & Week-ends" },
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

                {/* Barre de places */}
                {session?.maxParticipants && (
                    <div className="mb-6">
                        <PlacesBar session={session} />
                    </div>
                )}

                {/* Bénéfices */}
                {bootcamp.benefits && bootcamp.benefits.length > 0 && (
                    <ul className="space-y-1.5 mb-6">
                        {bootcamp.benefits.slice(0, 3).map((b) => (
                            <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {b}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Prix + CTA */}
                <div className="flex items-center gap-4 pt-5 border-t border-border">
                    <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-0.5">Tarif</div>
                        <div className="font-heading font-bold text-foreground">
                            {session?.price ?? bootcamp.price ?? "Sur devis"}
                        </div>
                    </div>
                    <Button
                        onClick={() => onRegister(bootcamp)}
                        disabled={!canRegister}
                        className="group bg-foreground hover:bg-foreground/90 text-background font-semibold"
                    >
                        {canRegister ? "Réserver ma place" : "Complet"}
                        {canRegister && <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SessionSkeleton() {
    return (
        <div className="rounded-2xl border-2 border-border bg-card p-8 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-muted" />
                <div className="h-5 w-52 bg-muted rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted" />)}
            </div>
            <div className="h-2 rounded-full bg-muted mb-6" />
            <div className="flex items-center justify-between pt-5 border-t border-border">
                <div className="h-5 w-28 bg-muted rounded" />
                <div className="h-9 w-36 bg-muted rounded-lg" />
            </div>
        </div>
    );
}

// ─── Section principale ───────────────────────────────────────────────────────

export function SessionsSection() {
    // Bootcamp sélectionné pour la modale d'inscription
    const [registerFor, setRegisterFor] = useState<Bootcamp | null>(null);

    const { data: backendData, isLoading, isError } = useQuery({
        queryKey:  ["bootcamps-published"],
        queryFn:   () => httpClient.get<BackendBootcamp[]>("/bootcamps", { skipAuth: true }),
        staleTime: 5 * 60 * 1000,
    });

    // Trier : featured en premier, puis displayOrder
    const bootcamps = [...(backendData ?? [])].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.displayOrder ?? 99) - (b.displayOrder ?? 99);
    });

    const display =
        bootcamps.length > 0 ? bootcamps :
            (isError || (!isLoading && !backendData)) ? STATIC_BOOTCAMPS : [];

    const handleRegister = (b: BackendBootcamp) => {
        // Mapper BackendBootcamp → type Bootcamp attendu par RegistrationModal
        setRegisterFor(toAppBootcamp(b));
    };

    return (
        <>
            <section className="py-20 lg:py-28 bg-background">
                <div className="container mx-auto px-4 lg:px-8">

                    {/* En-tête */}
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

                    {/* Cartes */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {isLoading ? (
                            <><SessionSkeleton /><SessionSkeleton /></>
                        ) : display.length === 0 ? (
                            <div className="lg:col-span-2 text-center py-16 text-muted-foreground">
                                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Aucune session disponible pour le moment.</p>
                                <p className="text-xs mt-1">Contactez-nous pour être informé des prochaines dates.</p>
                            </div>
                        ) : (
                            display.map((b, i) => (
                                <SessionCard
                                    key={b.id}
                                    bootcamp={b}
                                    index={i}
                                    onRegister={handleRegister}
                                />
                            ))
                        )}
                    </div>

                    {/* Bandeau liste d'attente */}
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
                                <Button asChild size="lg" variant="outline" className="border-white/40 text-white bg-black/80 hover:bg-black/80">
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

            {/* ── Modale d'inscription ─────────────────────────────────────────── */}
            {registerFor && (
                <RegistrationModal
                    bootcamp={registerFor}
                    session={registerFor.nextSession}
                    staticData={getBootcampStatic(registerFor.category ?? "data")}
                    onClose={() => setRegisterFor(null)}
                />
            )}
        </>
    );
}
