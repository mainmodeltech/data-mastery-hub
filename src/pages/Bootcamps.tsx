/**
 * Bootcamps.tsx
 *
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { bootcampService } from "@/services/bootcampService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Calendar,
  Award,
  Layers,
  Code2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MapPin,
  Shield,
  Loader2,
  BookOpen,
  Zap,
  Trophy,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import type { Bootcamp, BootcampSession } from "@/types/bootcamp.type";
import { COMPANY, QUERY_CONFIG } from "@/config/constants";
import { RegistrationModal } from "./RegistrationModal";
import {getBootcampStatic, StaticEnrichment} from "@/config/bootcamps.config.ts";
import {PAGE_SEO, SeoHead} from "@/components/SeoHead.tsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSessionLabel(session: BootcampSession | null): string {
  if (!session) return "Session à venir";
  if (session.sessionName) return session.sessionName;
  if (session.startDate) return formatDateShort(session.startDate);
  return "Session à venir";
}

function formatSessionFormat(fmt: BootcampSession["format"]): string {
  const map: Record<BootcampSession["format"], string> = {
    PRESENTIEL: "Présentiel · Dakar",
    REMOTE: "En ligne",
    HYBRID: "Hybride",
  };
  return map[fmt];
}

// ─── CurriculumAccordion ──────────────────────────────────────────────────────

function CurriculumAccordion({ curriculum, colorKey, }: {
  curriculum: StaticEnrichment["curriculum"];
  colorKey: StaticEnrichment["colorKey"];
}) {
  const [open, setOpen] = useState<number | null>(0);
  const accentClass = colorKey === "accent" ? "text-accent" : "text-primary";
  const accentBg =
      colorKey === "accent"
          ? "bg-accent/10 border-accent/20"
          : "bg-primary/10 border-primary/20";

  return (
      <div className="space-y-3">
        {curriculum.map((item, i) => (
            <div
                key={i}
                className="rounded-2xl border border-border overflow-hidden"
            >
              <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                      className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border flex-shrink-0",
                          accentBg,
                          accentClass
                      )}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.week} · {item.hours}
                    </div>
                  </div>
                </div>
                {open === i ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {open === i && (
                  <div className="px-5 pb-5 bg-card">
                    <div className="pl-14">
                      <ul className="space-y-2 mb-4">
                        {item.topics.map((t, ti) => (
                            <li
                                key={ti}
                                className="flex items-start gap-2.5 text-sm text-muted-foreground"
                            >
                              <div
                                  className={cn(
                                      "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0",
                                      colorKey === "accent" ? "bg-accent" : "bg-primary"
                                  )}
                              />
                              {t}
                            </li>
                        ))}
                      </ul>
                      <div
                          className={cn(
                              "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border",
                              accentBg,
                              accentClass
                          )}
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        Projet : {item.project}
                      </div>
                    </div>
                  </div>
              )}
            </div>
        ))}
      </div>
  );
}

// ─── StickyCard ───────────────────────────────────────────────────────────────

function StickyCard({
                      bootcamp,
                      staticData,
                      onRegister,
                    }: {
  bootcamp: Bootcamp;
  staticData: StaticEnrichment;
  onRegister: () => void;
}) {
  const isAccent = staticData.colorKey === "accent";
  const session = bootcamp.nextSession;

  const maxParticipants = session?.maxParticipants ?? 20;
  const currentParticipants = session?.currentParticipants ?? 0;
  const spotsLeft = session?.spotsRemaining ?? null;
  const pct =
      maxParticipants > 0
          ? Math.round((currentParticipants / maxParticipants) * 100)
          : 0;
  const isUrgent =
      pct >= 80 || (spotsLeft !== null && spotsLeft <= 3);

  const accentClass = isAccent ? "text-accent" : "text-primary";
  const btnClass = isAccent
      ? "bg-accent hover:bg-accent/90 text-white shadow-glow"
      : "bg-primary hover:bg-primary/90 text-white";

  const displayPrice = session?.price ?? bootcamp.price ?? "—";

  return (
      <div className="rounded-2xl border-2 border-border bg-card shadow-card overflow-hidden">
        {/* Prix */}
        <div
            className={cn(
                "p-6 border-b border-border",
                isAccent ? "bg-accent/5" : "bg-primary/5"
            )}
        >
          <div className="text-xs text-muted-foreground mb-1">Tarif bootcamp</div>
          <div className="font-heading text-3xl font-bold text-foreground">
            {displayPrice}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Supports et certification inclus
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Infos session */}
          {(
              [
                {
                  icon: Calendar,
                  label: "Prochaine session",
                  value: formatDateShort(session?.startDate ?? null),
                },
                {
                  icon: Clock,
                  label: "Durée",
                  value: bootcamp.duration ?? "—",
                },
                {
                  icon: MapPin,
                  label: "Format",
                  value: session
                      ? formatSessionFormat(session.format)
                      : "Présentiel · Dakar",
                },
                {
                  icon: Users,
                  label: "Promo",
                  value: session ? `${session.maxParticipants} apprenants max` : "—",
                },
              ] as const
          ).map((info) => (
              <div key={info.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <info.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{info.label}</div>
                  <div className="text-sm font-semibold text-foreground">
                    {info.value}
                  </div>
                </div>
              </div>
          ))}

          {/* Barre de places */}
          {session && (
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {currentParticipants}/{maxParticipants} places occupées
              </span>
                  <span
                      className={cn(
                          "font-semibold",
                          isUrgent ? "text-orange-500" : "text-green-500"
                      )}
                  >
                {spotsLeft !== null
                    ? `${spotsLeft} restantes`
                    : "Places disponibles"}
              </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                      className={cn(
                          "h-full rounded-full transition-all duration-700",
                          isUrgent ? "bg-orange-500" : "bg-green-500"
                      )}
                      style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
          )}

          {!session && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Aucune session planifiée pour le moment
              </div>
          )}

          {/* CTAs */}
          <Button
              onClick={onRegister}
              className={cn("w-full font-bold h-12 group", btnClass)}
              disabled={!session}
          >
            Réserver ma place
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a
                href={COMPANY.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
              Poser une question
            </a>
          </Button>

          {/* Trust badges */}
          <div className="pt-2 space-y-2">
            {[
              {
                icon: Shield,
                text: "Sans engagement · Paiement à la confirmation",
              },
              { icon: Award, text: staticData.certification.name },
            ].map((t, i) => (
                <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <t.icon
                      className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", accentClass)}
                  />
                  {t.text}
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

// ─── BootcampDetail ───────────────────────────────────────────────────────────

function BootcampDetail({
                          bootcamp,
                          onRegister,
                        }: {
  bootcamp: Bootcamp;
  onRegister: (b: Bootcamp) => void;
}) {
  const staticData = getBootcampStatic(bootcamp.category);
  const isAccent = staticData.colorKey === "accent";
  const Icon = staticData.icon;
  const session = bootcamp.nextSession;

  const accentClass = isAccent ? "text-accent" : "text-primary";
  const accentBg = isAccent ? "bg-accent/10" : "bg-primary/10";
  const accentBorder = isAccent ? "border-accent/25" : "border-primary/25";
  const btnClass = isAccent
      ? "bg-accent hover:bg-accent/90 text-white shadow-glow"
      : "bg-primary hover:bg-primary/90 text-white";

  const benefits = bootcamp.benefits?.length ? bootcamp.benefits : [];
  const spotsLeft = session?.spotsRemaining ?? null;

  return (
      <div className="pt-24 pb-20" id={bootcamp.id}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,380px] gap-12 items-start">

            {/* ── Colonne gauche ──────────────────────────── */}
            <div>
              {/* Hero */}
              <div
                  className="mb-12 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                      className={cn(
                          "w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0",
                          accentBg,
                          accentBorder
                      )}
                  >
                    <Icon className={cn("h-7 w-7", accentClass)} />
                  </div>
                  {bootcamp.featured && (
                      <Badge className="bg-accent text-white font-bold">
                        ★ Programme phare
                      </Badge>
                  )}
                  {bootcamp.tag && (
                      <Badge variant="secondary">{bootcamp.tag}</Badge>
                  )}
                </div>
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {bootcamp.title}
                </h2>
                <p className={cn("text-lg font-semibold mb-4", accentClass)}>
                  {staticData.tagline}
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {bootcamp.description}
                </p>
              </div>

              {/* Outcomes */}
              {staticData.outcomes.length > 0 && (
                  <div
                      className="grid grid-cols-3 gap-4 mb-12 opacity-0 animate-fade-in"
                      style={{ animationDelay: "0.15s" }}
                  >
                    {staticData.outcomes.map((o) => (
                        <div
                            key={o.label}
                            className={cn(
                                "text-center p-5 rounded-2xl border",
                                accentBg,
                                accentBorder
                            )}
                        >
                          <div
                              className={cn(
                                  "font-heading text-3xl font-bold mb-1",
                                  accentClass
                              )}
                          >
                            {o.stat}
                          </div>
                          <div className="text-xs text-muted-foreground leading-snug">
                            {o.label}
                          </div>
                        </div>
                    ))}
                  </div>
              )}

              {/* Pour qui */}
              {staticData.profiles.length > 0 && (
                  <div
                      className="mb-12 opacity-0 animate-fade-in"
                      style={{ animationDelay: "0.2s" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Users className={cn("h-5 w-5", accentClass)} />
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Pour qui est ce bootcamp ?
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {staticData.profiles.map((p) => (
                          <div
                              key={p.label}
                              className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border"
                          >
                            <span className="text-2xl">{p.icon}</span>
                            <span className="font-medium text-sm text-foreground">
                        {p.label}
                      </span>
                          </div>
                      ))}
                    </div>
                    {bootcamp.prerequisites && (
                        <div className="mt-4 flex items-start gap-2.5 p-4 rounded-xl bg-secondary/30 border border-border">
                          <Shield
                              className={cn("h-4 w-4 flex-shrink-0 mt-0.5", accentClass)}
                          />
                          <div className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Prérequis :</strong>{" "}
                            {bootcamp.prerequisites}
                          </div>
                        </div>
                    )}
                  </div>
              )}

              {/* Ce qu'on apprend */}
              {benefits.length > 0 && (
                  <div
                      className="mb-12 opacity-0 animate-fade-in"
                      style={{ animationDelay: "0.25s" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <BookOpen className={cn("h-5 w-5", accentClass)} />
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Ce que vous apprendrez
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {benefits.map((b) => (
                          <div key={b} className="flex items-start gap-3">
                            <CheckCircle
                                className={cn("h-5 w-5 flex-shrink-0 mt-0.5", accentClass)}
                            />
                            <span className="text-sm text-foreground leading-snug">
                        {b}
                      </span>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* Outils */}
              {staticData.tools.length > 0 && (
                  <div
                      className="mb-12 opacity-0 animate-fade-in"
                      style={{ animationDelay: "0.3s" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Code2 className={cn("h-5 w-5", accentClass)} />
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Outils maîtrisés
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {staticData.tools.map((tool) => (
                          <div key={tool.name}>
                            <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-foreground">
                          {tool.name}
                        </span>
                              <span className="text-muted-foreground text-xs">
                          {tool.level}%
                        </span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                  className={cn(
                                      "h-full rounded-full transition-all duration-1000",
                                      isAccent
                                          ? "bg-gradient-to-r from-accent/60 to-accent"
                                          : "bg-gradient-to-r from-primary/60 to-primary"
                                  )}
                                  style={{ width: `${tool.level}%` }}
                              />
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* Programme */}
              {staticData.curriculum.length > 0 && (
                  <div
                      className="mb-12 opacity-0 animate-fade-in"
                      style={{ animationDelay: "0.35s" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Layers className={cn("h-5 w-5", accentClass)} />
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Programme semaine par semaine
                      </h3>
                    </div>
                    <CurriculumAccordion
                        curriculum={staticData.curriculum}
                        colorKey={staticData.colorKey}
                    />
                  </div>
              )}

              {/* Certification */}
              {staticData.certification.name && (
                  <div
                      className={cn(
                          "mb-12 p-6 rounded-2xl border opacity-0 animate-fade-in",
                          accentBg,
                          accentBorder
                      )}
                      style={{ animationDelay: "0.4s" }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">
                        {staticData.certification.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className={cn("h-4 w-4", accentClass)} />
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Certification
                      </span>
                        </div>
                        <h4 className="font-heading font-bold text-foreground mb-1">
                          {staticData.certification.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {staticData.certification.description}
                        </p>
                      </div>
                    </div>
                  </div>
              )}

              {/* Témoignage */}
              {staticData.testimonial.name && (
                  <div
                      className="mb-12 opacity-0 animate-fade-in"
                      style={{ animationDelay: "0.45s" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Star className={cn("h-5 w-5", accentClass)} />
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Ils l'ont fait
                      </h3>
                    </div>
                    <div className="relative rounded-2xl border border-border bg-card p-7">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className="h-4 w-4 text-yellow-400 fill-yellow-400"
                            />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic leading-relaxed mb-6">
                        "{staticData.testimonial.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "w-11 h-11 rounded-full flex items-center justify-center text-white font-bold",
                                isAccent
                                    ? "bg-gradient-to-br from-accent to-primary"
                                    : "bg-gradient-to-br from-primary to-accent"
                            )}
                        >
                          {staticData.testimonial.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {staticData.testimonial.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {staticData.testimonial.role} ·{" "}
                            {staticData.testimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Bottom CTA */}
              <div
                  className={cn(
                      "rounded-2xl p-8 text-center border opacity-0 animate-fade-in",
                      accentBg,
                      accentBorder
                  )}
                  style={{ animationDelay: "0.5s" }}
              >
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Prêt à rejoindre la prochaine session ?
                </h3>
                {session ? (
                    <p className="text-muted-foreground mb-6">
                      Prochaine session :{" "}
                      <strong className={accentClass}>
                        {formatDateShort(session.startDate)}
                      </strong>
                      {spotsLeft !== null && (
                          <>
                            {" "}
                            ·{" "}
                            <strong className="text-orange-500">
                              {spotsLeft} places restantes
                            </strong>
                          </>
                      )}
                    </p>
                ) : (
                    <p className="text-muted-foreground mb-6">
                      Inscrivez-vous pour être notifié dès l'ouverture des
                      inscriptions.
                    </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                      onClick={() => onRegister(bootcamp)}
                      className={cn("font-bold group", btnClass)}
                  >
                    Réserver ma place
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/orientation">
                      Je veux d'abord valider mon choix →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Colonne droite sticky ────────────────────── */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <StickyCard
                    bootcamp={bootcamp}
                    staticData={staticData}
                    onRegister={() => onRegister(bootcamp)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BootcampsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [registerFor, setRegisterFor] = useState<Bootcamp | null>(null);

  const { data: bootcamps, isLoading, isError } = useQuery({
    queryKey: ["bootcamps", "public"],
    queryFn: bootcampService.list,
    staleTime: QUERY_CONFIG.staleTime,
  });

  const activeBootcamp = bootcamps?.[activeIndex];
  const activeStatic = activeBootcamp
      ? getBootcampStatic(activeBootcamp.category)
      : null;

  return (
      <Layout>
        <SeoHead {...PAGE_SEO.bootcamps} />
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative bg-foreground pt-20 pb-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)]" />
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `linear-gradient(hsl(199,89%,48%) 1px, transparent 1px), linear-gradient(to right, hsl(199,89%,48%) 1px, transparent 1px)`,
                  backgroundSize: "60px 60px",
                }}
            />
            <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center pb-16">
              <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Nos bootcamps · Dakar, Sénégal
              </div>
              <h1
                  className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
              >
                {bootcamps?.length === 1
                    ? "1 bootcamp pour"
                    : `${bootcamps?.length ?? 2} bootcamps pour`}{" "}
                <span className="text-accent">transformer</span>
                <br />
                votre carrière data
              </h1>
              <p
                  className="text-lg text-background/65 mb-8 leading-relaxed opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
              >
                Des programmes intensifs, conçus avec les entreprises qui recrutent
                à Dakar. De la théorie à l'employabilité — en 8 ou 12 semaines.
              </p>

              {/* Trust strip */}
              <div
                  className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-background/40 text-sm mb-10 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.35s" }}
              >
                {(
                    [
                      { icon: Users, text: "150+ alumni formés" },
                      { icon: TrendingUp, text: "90% en poste en 3 mois" },
                      { icon: MapPin, text: "Présentiel · Dakar" },
                      { icon: Award, text: "Certification incluse" },
                    ] as const
                ).map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <t.icon className="h-3.5 w-3.5" />
                      {t.text}
                    </div>
                ))}
              </div>
            </div>

            {/* Tab switcher */}
            {isLoading ? (
                <div className="flex justify-center pb-16">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
            ) : isError ? (
                <div className="flex justify-center pb-16 text-amber-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Erreur de chargement. Veuillez rafraîchir la page.
                </div>
            ) : bootcamps && bootcamps.length > 1 ? (
                <div
                    className="flex justify-center pb-0 opacity-0 animate-fade-in"
                    style={{ animationDelay: "0.4s" }}
                >
                  <div className="inline-flex bg-background/8 border border-background/15 rounded-2xl p-1.5 gap-1.5">
                    {bootcamps.map((bc, idx) => {
                      const s = getBootcampStatic(bc.category);
                      const isActive = activeIndex === idx;
                      const TabIcon = s.icon;
                      const tabSession = bc.nextSession;
                      const urgentSpots =
                          tabSession?.spotsRemaining !== null &&
                          tabSession?.spotsRemaining !== undefined &&
                          tabSession.spotsRemaining <= 3;

                      return (
                          <button
                              key={bc.id}
                              onClick={() => setActiveIndex(idx)}
                              className={cn(
                                  "flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200",
                                  isActive
                                      ? "bg-background text-foreground shadow-sm"
                                      : "text-amber-500/60 hover:text-amber-400/80 hover:bg-background/5"
                              )}
                          >
                            <TabIcon
                                className={cn(
                                    "h-4 w-4",
                                    isActive
                                        ? s.colorKey === "accent"
                                            ? "text-accent"
                                            : "text-primary"
                                        : ""
                                )}
                            />
                            <span className="hidden sm:block">{bc.title}</span>
                            <span className="sm:hidden">
                        {bc.category === "bi" ? "Power BI" : "Data & Python"}
                      </span>
                            {urgentSpots && tabSession && (
                                <span className="hidden sm:block text-xs bg-orange-500/15 text-orange-500 font-bold px-2 py-0.5 rounded-full">
                          {tabSession.spotsRemaining} places
                        </span>
                            )}
                          </button>
                      );
                    })}
                  </div>
                </div>
            ) : null}
          </div>

          {/* Wave */}
          <div className="relative z-10">
            <svg
                viewBox="0 0 1440 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
            >
              <path
                  d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z"
                  fill="hsl(var(--background))"
              />
            </svg>
          </div>
        </section>

        {/* ── Détail bootcamp ─────────────────────────────── */}
        {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : isError ? (
            <div className="text-center py-32 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-4" />
              <p>Impossible de charger les bootcamps.</p>
              <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </div>
        ) : activeBootcamp ? (
            <BootcampDetail
                key={activeBootcamp.id}
                bootcamp={activeBootcamp}
                onRegister={setRegisterFor}
            />
        ) : null}

        {/* ── CTA mobile sticky ───────────────────────────── */}
        {activeBootcamp && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
              <Button
                  onClick={() => setRegisterFor(activeBootcamp)}
                  disabled={!activeBootcamp.nextSession}
                  className={cn(
                      "w-full h-12 font-bold",
                      activeStatic?.colorKey === "accent"
                          ? "bg-accent hover:bg-accent/90 text-white"
                          : "bg-primary hover:bg-primary/90 text-white"
                  )}
              >
                Réserver ma place
                {activeBootcamp.price ? ` · ${activeBootcamp.price}` : ""}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
        )}

        {/* ── Compare strip ───────────────────────────────── */}
        <section className="py-12 bg-secondary/50 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
              <div>
                <p className="font-semibold text-foreground">
                  Indécis entre les deux bootcamps ?
                </p>
                <p className="text-sm text-muted-foreground">
                  Notre quiz d'orientation vous guide en 2 minutes.
                </p>
              </div>
              <Button asChild variant="outline" className="group flex-shrink-0">
                <Link to="/orientation">
                  <Zap className="h-4 w-4 mr-2 text-accent" />
                  Trouver mon parcours
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Modale d'inscription ────────────────────────── */}
        {registerFor && (
            <RegistrationModal
                bootcamp={registerFor}
                session={registerFor.nextSession}
                staticData={getBootcampStatic(registerFor.category)}
                onClose={() => setRegisterFor(null)}
            />
        )}

      </Layout>
  );
}
