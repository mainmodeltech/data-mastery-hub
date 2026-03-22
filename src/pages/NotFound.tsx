/**
 * NotFoundPage.tsx
 *
 * Page 404 — design aligné avec la charte graphique du site
 * Utilise le Layout (Header + Footer) et les couleurs du design system
 */

import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, BookOpen, Mail, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <Layout>
      <section className="py-20 lg:py-32 relative overflow-hidden">
        {/* Halos decoratifs (meme style que About/Bootcamps) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/6 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">

            {/* Code 404 */}
            <div className="relative inline-block mb-6">
              <span className="text-[clamp(6rem,20vw,10rem)] font-black leading-none tracking-tighter select-none text-primary/10">
                404
              </span>
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent -translate-y-1/2" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6">
              <Search className="h-3.5 w-3.5" />
              Page introuvable
            </div>

            {/* Titre */}
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Oups, cette page n'existe pas
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              La page que vous recherchez a peut-etre ete deplacee, supprimee, ou n'a jamais existe.
              Pas d'inquietude, voici quelques liens utiles.
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Retour a l'accueil
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a onClick={() => window.history.back()} className="cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                  Page precedente
                </a>
              </Button>
            </div>

            {/* Suggestions */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                {
                  to: "/bootcamps",
                  icon: BookOpen,
                  label: "Nos bootcamps",
                  desc: "Decouvrez nos formations data",
                },
                {
                  to: "/a-propos",
                  icon: Search,
                  label: "A propos",
                  desc: "En savoir plus sur nous",
                },
                {
                  to: "/contact",
                  icon: Mail,
                  label: "Contact",
                  desc: "Besoin d'aide ? Ecrivez-nous",
                },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group p-5 rounded-2xl border border-border bg-card hover:border-accent/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 mx-auto group-hover:bg-accent/20 transition-colors">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <p className="font-semibold text-card-foreground text-sm mb-1">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
