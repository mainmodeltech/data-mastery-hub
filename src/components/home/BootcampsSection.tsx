/**
 * BootcampsSection.tsx — Vitrine des formations sur l'accueil.
 *
 * Rebâtie pour deux raisons :
 * 1. L'ancienne version affichait un tableau statique en dur ("2 bootcamps",
 *    anciens titres) totalement déconnecté du catalogue réel — corrigé en
 *    branchant sur bootcampService (même queryKey que Header.tsx → cache partagé).
 * 2. Cartes simplifiées à l'essentiel (titre, 1 phrase, durée, prix, 1 CTA) —
 *    voir docs/redesign-diagnostic.md pour le raisonnement.
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Code2, Table2, Calculator, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bootcampService } from "@/services/bootcampService";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";
import type { Bootcamp } from "@/types/bootcamp.type";

const CATEGORY_ICON: Record<string, ElementType> = {
    bi: BarChart3,
    python: Code2,
    sql: Table2,
    "excel-finance": Calculator,
};

const CATEGORY_COLOR: Record<string, "accent" | "primary"> = {
    bi: "accent",
    python: "primary",
    sql: "accent",
    "excel-finance": "primary",
};

/** Fallback statique si l'API est indisponible — mêmes 4 formations que le catalogue */
const FALLBACK_BOOTCAMPS: Bootcamp[] = [
    { id: "f-bi", title: "Bootcamp Power BI", description: "Du tableur au tableau de bord interactif, certification PL-300.", duration: "8 semaines", price: "150 000 FCFA", category: "bi", audience: null, prerequisites: null, benefits: [], tag: null, iconName: null, featured: true, published: true, displayOrder: 0, nextSession: null, createdAt: "", updatedAt: "" },
    { id: "f-python", title: "Bootcamp Python pour la data", description: "Python, Pandas et un portfolio de projets réels.", duration: "10 semaines", price: "100 000 FCFA", category: "python", audience: null, prerequisites: null, benefits: [], tag: null, iconName: null, featured: false, published: true, displayOrder: 1, nextSession: null, createdAt: "", updatedAt: "" },
    { id: "f-sql", title: "Bootcamp SQL pour la data", description: "La brique fondamentale pour interroger vos bases de données.", duration: "2 à 3 semaines", price: "60 000 FCFA", category: "sql", audience: null, prerequisites: null, benefits: [], tag: null, iconName: null, featured: false, published: true, displayOrder: 2, nextSession: null, createdAt: "", updatedAt: "" },
    { id: "f-excel", title: "Excel Financiers & Contrôle de gestion", description: "Modélisation financière, EBITDA, passerelle vers Power BI.", duration: "5 à 8 jours", price: "120 000 FCFA", category: "excel-finance", audience: null, prerequisites: null, benefits: [], tag: null, iconName: null, featured: false, published: true, displayOrder: 3, nextSession: null, createdAt: "", updatedAt: "" },
];

export function BootcampsSection() {
    const { data: bootcamps, isLoading } = useQuery({
        queryKey: ["bootcamps", "public"],
        queryFn: bootcampService.list,
        staleTime: 5 * 60 * 1000,
    });

    const items = bootcamps && bootcamps.length > 0 ? bootcamps : FALLBACK_BOOTCAMPS;
    const visible = [...items].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 4);

    return (
        <section className="py-20 lg:py-28 bg-secondary/50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                        <Sparkles className="h-3.5 w-3.5" />
                        Nos formations
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Choisissez votre bootcamp
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Contenu, durée et prix en un coup d'œil.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl border-2 border-border bg-card p-7 h-80 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {visible.map((bc, index) => {
                            const Icon = CATEGORY_ICON[bc.category] ?? BookOpen;
                            const isAccent = (CATEGORY_COLOR[bc.category] ?? "primary") === "accent";
                            return (
                                <div
                                    key={bc.id}
                                    className={cn(
                                        "rounded-2xl border-2 bg-card p-7 flex flex-col hover:shadow-lg transition-shadow opacity-0 animate-fade-in",
                                        isAccent ? "border-accent/25" : "border-primary/25",
                                    )}
                                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
                                        isAccent ? "bg-accent/15" : "bg-primary/15",
                                    )}>
                                        <Icon className={cn("h-6 w-6", isAccent ? "text-accent" : "text-primary")} />
                                    </div>

                                    <h3 className="font-heading text-lg font-bold text-card-foreground mb-2 leading-snug">{bc.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{bc.description}</p>

                                    <div className="flex items-center justify-between mb-5 pt-5 border-t border-border">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Durée</div>
                                            <div className="text-base font-bold text-foreground">{bc.duration ?? "—"}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground">Prix</div>
                                            <div className="text-base font-bold text-foreground">{bc.nextSession?.price ?? bc.price ?? "—"}</div>
                                        </div>
                                    </div>

                                    <Button
                                        asChild
                                        className={cn(
                                            "w-full font-bold h-11 text-sm",
                                            isAccent ? "bg-accent hover:bg-accent/90 text-white" : "bg-primary hover:bg-primary/90 text-white",
                                        )}
                                    >
                                        <Link to={`/bootcamps?tab=${bc.category}`}>
                                            Voir le programme
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-center text-base text-muted-foreground mt-10">
                    Pas sûr du choix ?{" "}
                    <Link to="/orientation" className="text-primary hover:underline font-medium">
                        Répondez à 5 questions pour trouver votre parcours →
                    </Link>
                </p>
            </div>
        </section>
    );
}
