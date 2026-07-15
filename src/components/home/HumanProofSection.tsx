/**
 * HumanProofSection.tsx
 * Bloc "preuve humaine" avec photo réelle — remplace la carte de dashboard
 * décorative de l'ancien hero. Objectif : rendre l'accueil plus humain et
 * moins générique-tech (voir docs/redesign-diagnostic.md).
 */

import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import teamPhoto from "@/assets/gallery/bootcamp-2.jpg";

export function HumanProofSection() {
    return (
        <section className="py-20 lg:py-28">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
                    <div className="rounded-3xl overflow-hidden shadow-xl order-2 lg:order-1">
                        <img
                            src={teamPhoto}
                            alt="Alumni Model Technologie travaillant ensemble après leur bootcamp"
                            className="w-full h-full object-cover aspect-[4/3]"
                        />
                    </div>

                    <div className="order-1 lg:order-2">
                        <Quote className="h-10 w-10 text-accent/40 mb-6" />
                        <p className="font-heading text-2xl md:text-3xl font-semibold text-foreground leading-snug mb-6">
                            "Mon reporting mensuel prenait 2 jours. Maintenant 2 heures. Mon directeur m'a félicité pour ça."
                        </p>
                        <p className="text-lg text-muted-foreground mb-8">
                            Emmanuel Bouadi — Data Analyst, Wave
                        </p>
                        <Button asChild variant="outline" size="lg" className="group">
                            <Link to="/alumni">
                                Voir tous les résultats alumni
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
