import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/config/constants";

export function FinalCtaSection() {
    return (
        <section className="py-20 lg:py-28">
            <div className="container mx-auto px-4 lg:px-8 max-w-xl text-center">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Prêt à commencer ?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                    Places limitées par session. Inscrivez-vous en quelques minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 text-lg group">
                        <Link to="/bootcamps">
                            Voir les formations
                            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg">
                        <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
                            WhatsApp
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}
