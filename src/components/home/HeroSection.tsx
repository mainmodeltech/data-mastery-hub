import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
      <section className="relative min-h-screen flex items-center overflow-hidden bg-foreground">
        {/* Background geometric shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,18%)] to-[hsl(199,89%,12%)]" />
          {/* Decorative circles */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-accent/8 blur-3xl" />
          {/* Grid pattern */}
          <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(hsl(199,89%,48%) 1px, transparent 1px), linear-gradient(to right, hsl(199,89%,48%) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
          />
          {/* Diagonal accent line */}
          <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
          <div className="absolute top-0 right-[40%] w-px h-full bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen lg:min-h-[80vh]">

            {/* Left — Content */}
            <div className="max-w-2xl">

              {/* Badge location */}
              <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/25 mb-8 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span className="text-accent text-sm font-medium tracking-wide">Dakar, Sénégal · Depuis 2022</span>
              </div>

              {/* Headline */}
              <h1
                  className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-[1.1] mb-6 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
              >
                Devenez{" "}
                <span className="relative inline-block">
                <span className="text-accent">Data Analyst</span>
                <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                  <path
                      d="M2 6 C50 2, 150 2, 198 6"
                      stroke="hsl(199,89%,48%)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.7"
                  />
                </svg>
              </span>{" "}
                au Sénégal
                <br />
                <span className="text-background/80">en 12 semaines</span>
              </h1>

              {/* Sub */}
              <p
                  className="text-lg md:text-xl text-background/65 mb-10 leading-relaxed max-w-xl opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
              >
                Les bootcamps intensifs qui ont lancé +150 carrières data à Dakar.
                Power BI, SQL & Python — du zéro à l'emploi.
              </p>

              {/* CTAs */}
              <div
                  className="flex flex-col sm:flex-row gap-4 mb-12 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
              >
                <Button
                    asChild
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 h-auto text-base shadow-glow group"
                >
                  <Link to="/bootcamps">
                    Voir les bootcamps
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-background/30 text-background hover:bg-background/10 hover:border-background/50 font-semibold px-8 py-4 h-auto text-base group"
                >
                  <Link to="/orientation">
                    <Compass className="h-5 w-5 mr-2 group-hover:rotate-45 transition-transform duration-300" />
                    Quel parcours me convient ?
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.5s" }}
              >
                {[
                  { icon: Star, text: "150+ alumni placés" },
                  { icon: null, text: "3 ans d'expérience" },
                  { icon: null, text: "Dakar, Sénégal" },
                ].map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 text-background/50 text-sm">
                      {i > 0 && <span className="w-1 h-1 rounded-full bg-background/25" />}
                      {badge.icon ? (
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      ) : null}
                      <span>{badge.text}</span>
                    </div>
                ))}
              </div>
            </div>

            {/* Right — Visual card stack */}
            <div
                className="hidden lg:flex items-center justify-center opacity-0 animate-fade-in-right"
                style={{ animationDelay: "0.4s" }}
            >
              <div className="relative w-full max-w-md">
                {/* Background card */}
                <div className="absolute -top-4 -right-4 w-full h-full rounded-2xl bg-primary/20 border border-primary/15" />
                <div className="absolute -top-2 -right-2 w-full h-full rounded-2xl bg-primary/30 border border-primary/20" />

                {/* Main card */}
                <div className="relative rounded-2xl bg-background/5 backdrop-blur-sm border border-background/15 p-8 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-sm bg-accent" />
                    </div>
                    <div>
                      <div className="text-background font-semibold text-sm">Model Technologie</div>
                      <div className="text-background/40 text-xs">Tableau de bord Alumni</div>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                    </div>
                  </div>

                  {/* Fake chart bars */}
                  <div className="mb-6">
                    <div className="text-background/40 text-xs mb-3 uppercase tracking-widest">Placements Alumni 2024</div>
                    <div className="flex items-end gap-2 h-24">
                      {[45, 65, 55, 80, 70, 90, 75, 95, 85, 100, 88, 96].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end">
                            <div
                                className="rounded-sm"
                                style={{
                                  height: `${h}%`,
                                  background: i >= 9
                                      ? "linear-gradient(to top, hsl(199,89%,48%), hsl(217,72%,55%))"
                                      : "hsl(0,0%,100%,0.12)",
                                }}
                            />
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "94%", label: "Taux de placement" },
                      { value: "12 sem.", label: "Durée bootcamp" },
                      { value: "+150", label: "Alumni actifs" },
                    ].map((s) => (
                        <div key={s.label} className="text-center p-3 rounded-xl bg-background/5 border border-background/10">
                          <div className="text-accent font-bold text-lg font-heading">{s.value}</div>
                          <div className="text-background/40 text-xs mt-0.5 leading-tight">{s.label}</div>
                        </div>
                    ))}
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -bottom-5 -left-5 flex items-center gap-2 bg-foreground border border-background/20 rounded-xl px-4 py-2.5 shadow-xl">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping absolute" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 relative" />
                    </div>
                    <span className="text-background text-sm font-medium">Session en cours · 24 apprenants</span>
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
