import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import teamPhoto from "@/assets/gallery/bootcamp-3.jpg";

export function HeroSection() {
  return (
      <section className="relative bg-foreground overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — Content */}
            <div className="max-w-xl">
              <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/25 mb-8 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-accent text-base font-medium tracking-wide">Dakar, Sénégal · Depuis 2023</span>
              </div>

              <h1
                  className="font-heading text-5xl md:text-6xl font-bold text-background leading-[1.08] mb-6 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
              >
                Devenez <span className="text-accent">Data Analyst</span>
                <br />ou expert Power BI
              </h1>

              <p
                  className="text-xl text-background/70 mb-10 leading-relaxed opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
              >
                4 bootcamps pratiques à Dakar. Power BI, Python, SQL, Excel — du zéro à l'emploi.
              </p>

              <div
                  className="flex flex-col sm:flex-row gap-4 mb-8 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
              >
                <Button
                    asChild
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 h-14 text-lg shadow-glow group"
                >
                  <Link to="/bootcamps">
                    Voir les formations
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <p
                  className="text-base text-background/50 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.5s" }}
              >
                <Compass className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                Pas sûr du choix ? <Link to="/orientation" className="text-accent underline underline-offset-4 hover:text-accent/80">Faites le quiz d'orientation</Link>
              </p>
            </div>

            {/* Right — Real photo */}
            <div
                className="opacity-0 animate-fade-in-right"
                style={{ animationDelay: "0.3s" }}
            >
              <div className="relative rounded-3xl overflow-hidden border border-background/10 shadow-2xl">
                <img
                    src={teamPhoto}
                    alt="Alumni Model Technologie réunis après un bootcamp"
                    className="w-full h-full object-cover aspect-[4/5] lg:aspect-[5/6]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 bg-background/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl">
                  <div className="text-3xl font-heading font-bold text-primary">30+</div>
                  <div className="text-sm text-foreground/70 leading-tight">
                    alumni ont déjà transformé leur carrière avec nous
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>
  );
}
