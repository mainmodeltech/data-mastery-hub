/**
 * Orientation.tsx — quiz d'orientation (5 questions → recommandation).
 * Migré sur le design system (SiteLayout + composants shared). Logique de scoring et
 * de résultat inchangée : contenu éditorial statique + données dynamiques du backend
 * (titre, durée, prix, prochaine session) quand le bootcamp correspondant existe.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowRight, ArrowLeft, BarChart3, Database, Building,
    Users, Compass, CheckCircle, Star, Clock, Target,
    Sparkles, Trophy, Zap, GraduationCap, MessageCircle,
    RotateCcw, TrendingUp, AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { PAGE_SEO, SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { bootcampService } from "@/services/bootcampService";
import { RegistrationModal } from "@/pages/RegistrationModal";
import { getBootcampStatic } from "@/config/bootcamps.config";
import type { Bootcamp } from "@/types/bootcamp.type";
import { COMPANY, QUERY_CONFIG } from "@/config/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    id: string; emoji: string; label: string; sublabel?: string; value: string;
}
interface Question {
    id: string; step: number; title: string; subtitle: string; options: Option[];
}

/**
 * Contenu ÉDITORIAL statique par résultat.
 * Ce qui ne change pas entre sessions : textes marketing, témoignages.
 * Les données DYNAMIQUES (titre, durée, prix, session) viennent du backend.
 */
interface ResultStatic {
    id:           string;
    icon:         React.ElementType;
    tag:          string;
    /** Sous-titre affiché si le backend ne retourne pas de durée */
    subtitleFallback: string;
    description:  string;
    highlights:   string[];
    secondaryLabel: string;
    secondaryHref:  string;
    testimonial: { name: string; role: string; content: string; initials: string };
    /** Catégorie backend pour matcher bootcamp.category */
    category:     string | null;
    /** Pour b2b/both : CTA navigue vers une URL au lieu d'ouvrir la modale */
    ctaHref?:     string;
    ctaLabel:     string;
}

// ─── Contenu éditorial statique ───────────────────────────────────────────────

const RESULTS_STATIC: Record<string, ResultStatic> = {
    powerbi: {
        id: "powerbi",
        icon: BarChart3,
        tag: "Votre match idéal",
        subtitleFallback: "Business Intelligence",
        description: "Votre profil correspond parfaitement à notre bootcamp Power BI. Vous avez une base en outils bureautiques et voulez passer au niveau supérieur en business intelligence. Ce bootcamp est conçu exactement pour vous.",
        highlights: [
            "Maîtriser Power BI du débutant à l'expert",
            "Créer des dashboards qui impressionnent votre direction",
            "Automatiser vos reportings mensuels",
            "Préparer la certification Microsoft PL-300",
        ],
        ctaLabel: "Réserver ma place",
        secondaryLabel: "En savoir plus", secondaryHref: "/formations",
        testimonial: {
            name: "Emmanuel BOUADI", role: "Compliance Admin · Wave",
            content: "Mon reporting mensuel prenait 2 jours. Maintenant 2 heures. Mon directeur m'a félicité pour cela!.",
            initials: "EM",
        },
        category: "bi",
    },
    dataanalyst: {
        id: "dataanalyst",
        icon: Database,
        tag: "Votre match idéal",
        subtitleFallback: "SQL & Python",
        description: "Votre profil et vos objectifs pointent clairement vers le bootcamp Data Analyst. Ce programme intensif vous donnera toutes les armes pour devenir un data analyst opérationnel et décrocher le poste que vous visez.",
        highlights: [
            "Maîtriser SQL pour interroger n'importe quelle base de données",
            "Analyser des données réelles avec Python & Pandas",
            "Construire un portfolio de projets pour vos entretiens",
            "Bénéficier du réseau alumni Model Technologie",
        ],
        ctaLabel: "Réserver ma place",
        secondaryLabel: "En savoir plus", secondaryHref: "/formations",
        testimonial: {
            name: "Khoudia DIAO", role: "Investment Analyst · Mazars",
            content: "En 10 semaines j'ai appris Python et SQL, réalisé 3 projets réels et décroché un poste chez Mazars. Meilleur investissement de ma carrière.",
            initials: "KD",
        },
        category: "data",
    },
    both: {
        id: "both",
        icon: GraduationCap,
        tag: "Parcours complet recommandé",
        subtitleFallback: "Power BI + SQL & Python",
        description: "Votre ambition et votre profil vous positionnent pour un parcours data complet. En combinant les deux bootcamps, vous deviendrez un data analyst polyvalent, capable de gérer la donnée de A à Z.",
        highlights: [
            "Power BI pour la visualisation et le reporting",
            "SQL & Python pour l'analyse et l'automatisation",
            "Portfolio solide avec 6+ projets réels",
            "Accompagnement carrière dédié jusqu'au recrutement",
        ],
        ctaLabel: "Voir les formations", ctaHref: "/formations",
        secondaryLabel: "Parler à un conseiller", secondaryHref: "/contact",
        testimonial: {
            name: "Cedric Zagba", role: "Data Analyst · INTOUCH",
            content: "J'ai fait les deux bootcamps successivement. Aujourd'hui je maîtrise tout l'écosystème data et j'ai la reconnaissance de ma hiérarchie.",
            initials: "CZ",
        },
        category: null,
    },
    b2b: {
        id: "b2b",
        icon: Building,
        tag: "Solution entreprise",
        subtitleFallback: "Sur mesure · Votre timing",
        description: "Vous cherchez à monter en compétence toute une équipe ? Notre formule intra-entreprise est conçue pour vous. Nous adaptons le programme, les horaires et les cas pratiques à votre secteur et à vos outils.",
        highlights: [
            "Programme 100% adapté à votre secteur",
            "Cas pratiques sur vos données réelles",
            "Formateurs experts avec expérience entreprise",
            "Support post-formation inclus (3 mois)",
        ],
        ctaLabel: "Demander un devis", ctaHref: "/entreprises",
        secondaryLabel: "Nous contacter", secondaryHref: "/contact",
        testimonial: {
            name: "Directeur RH", role: "Institution Financière · Dakar",
            content: "Model Technologie a formé toute notre équipe finance en 3 semaines. Résultat : nos reportings sont automatisés et notre DG est bluffé.",
            initials: "DG",
        },
        category: null,
    },
};

// ─── Questions (inchangées) ───────────────────────────────────────────────────

const questions: Question[] = [
    {
        id: "situation", step: 1,
        title: "Quelle est votre situation actuelle ?",
        subtitle: "Choisissez ce qui vous correspond le mieux",
        options: [
            { id: "a", emoji: "💼", label: "Salarié en poste",        sublabel: "Je travaille et veux progresser",   value: "employed"      },
            { id: "b", emoji: "🔄", label: "En reconversion",          sublabel: "Je change de secteur ou de métier", value: "reorientation" },
            { id: "c", emoji: "🎓", label: "Étudiant / Jeune diplômé", sublabel: "Je cherche à me spécialiser",       value: "student"       },
            { id: "d", emoji: "🏢", label: "Manager / Responsable",    sublabel: "Je pilote une équipe ou un budget", value: "manager"       },
        ],
    },
    {
        id: "tools", step: 2,
        title: "Votre rapport aux outils numériques aujourd'hui ?",
        subtitle: "Soyez honnête, il n'y a pas de mauvaise réponse",
        options: [
            { id: "a", emoji: "📊", label: "J'utilise Excel au quotidien",      sublabel: "Formules, tableaux croisés, graphiques", value: "excel" },
            { id: "b", emoji: "🖥️", label: "Je connais les bases de l'info",    sublabel: "À l'aise avec les outils bureautiques",  value: "basic" },
            { id: "c", emoji: "⚙️", label: "J'ai touché à un peu de code",     sublabel: "SQL, Python ou autre langage",           value: "code"  },
            { id: "d", emoji: "🚀", label: "Je suis à l'aise techniquement",   sublabel: "Développeur ou profil tech",             value: "tech"  },
        ],
    },
    {
        id: "goal", step: 3,
        title: "Quel est votre objectif principal ?",
        subtitle: "Ce que vous voulez accomplir grâce à cette formation",
        options: [
            { id: "a", emoji: "📈", label: "Créer des tableaux de bord & rapports", sublabel: "Piloter la performance visuellement",  value: "dashboard" },
            { id: "b", emoji: "🔬", label: "Analyser des données & automatiser",    sublabel: "Extraire des insights avec du code",   value: "analysis"  },
            { id: "c", emoji: "💼", label: "Décrocher un poste en data",            sublabel: "Changer de carrière vers la data",     value: "job"       },
            { id: "d", emoji: "🏗️", label: "Améliorer les outils de mon équipe",  sublabel: "Former mes collaborateurs",            value: "team"      },
        ],
    },
    {
        id: "availability", step: 4,
        title: "Quelle est votre disponibilité ?",
        subtitle: "Nos sessions s'adaptent à votre rythme de vie",
        options: [
            { id: "a", emoji: "🌙", label: "Soirs & week-ends seulement", sublabel: "2-3 soirs par semaine + samedi", value: "evenings"  },
            { id: "b", emoji: "☀️", label: "Disponible en journée",       sublabel: "Format intensif en semaine",     value: "fulltime"  },
            { id: "c", emoji: "🔀", label: "Flexible selon le programme", sublabel: "Je m'adapte",                    value: "flexible"  },
            { id: "d", emoji: "🏢", label: "Formation pour mon entreprise",sublabel: "Format intra sur mesure",       value: "corporate" },
        ],
    },
    {
        id: "timeline", step: 5,
        title: "Votre horizon de transformation ?",
        subtitle: "Dans combien de temps vous projetez-vous ?",
        options: [
            { id: "a", emoji: "⚡", label: "Le plus tôt possible",  sublabel: "Je suis prêt à commencer maintenant", value: "now"     },
            { id: "b", emoji: "📅", label: "Dans 1 à 3 mois",       sublabel: "Je prépare ma transition",            value: "soon"    },
            { id: "c", emoji: "🌱", label: "Dans 3 à 6 mois",       sublabel: "Je veux bien me préparer",            value: "later"   },
            { id: "d", emoji: "🔍", label: "Je veux juste explorer", sublabel: "Pas encore décidé",                  value: "explore" },
        ],
    },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

function computeResult(answers: Record<string, string>): string {
    const { situation, tools, goal, availability } = answers;
    if (availability === "corporate" || (situation === "manager" && goal === "team")) return "b2b";
    if (goal === "job" && (situation === "reorientation" || situation === "student")) {
        return (tools === "code" || tools === "tech") ? "dataanalyst" : "both";
    }
    if (goal === "analysis" || goal === "job" || tools === "code" || tools === "tech" || situation === "reorientation") return "dataanalyst";
    if (goal === "dashboard" || tools === "excel" || situation === "employed" || situation === "manager") return "powerbi";
    return "both";
}

// ─── Helper : formater une date ISO ──────────────────────────────────────────

function formatDateFr(iso: string | null): string {
    if (!iso) return "Prochainement";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Bande urgence dynamique ──────────────────────────────────────────────────

function UrgencyBand({ bootcamp, config }: { bootcamp: Bootcamp | null; config: ResultStatic }) {
    const isNavOnly = !!config.ctaHref; // b2b ou both → pas de session

    if (isNavOnly || !bootcamp) {
        const msg = config.id === "b2b"
            ? "Devis gratuit sous 48h · Disponible toute l'année"
            : "Tarif pack disponible · Économisez 15% sur les 2 bootcamps";
        return (
            <div className="mb-8 flex items-center gap-3 rounded-stat bg-info-bg p-4">
                <span className="h-2.5 w-2.5 shrink-0 rounded-pill bg-navy/50" />
                <span className="text-sm font-semibold text-navy">{msg}</span>
            </div>
        );
    }

    const session    = bootcamp.nextSession;
    const spotsLeft  = session?.spotsRemaining ?? null;
    const status     = session?.status?.toUpperCase();

    let msg: string;
    let tone: "warning" | "error" | "success";

    if (!session) {
        msg  = "Prochaine session en cours de planification — Soyez notifié en priorité";
        tone = "warning";
    } else if (status === "FULL") {
        msg  = "Session complète — Inscrivez-vous sur liste d'attente";
        tone = "error";
    } else if (spotsLeft !== null && spotsLeft <= 3) {
        msg  = `Plus que ${spotsLeft} place${spotsLeft > 1 ? "s" : ""} disponible${spotsLeft > 1 ? "s" : ""} !`;
        tone = "warning";
    } else {
        const date  = formatDateFr(session.startDate);
        const spots = spotsLeft !== null ? ` · ${spotsLeft} places restantes` : " · Places disponibles";
        msg  = `Prochaine session : ${date}${spots}`;
        tone = "success";
    }

    const palette = {
        warning: { box: "bg-warning-bg text-warning", dot: "bg-warning" },
        error:   { box: "bg-error-bg text-error",     dot: "bg-error" },
        success: { box: "bg-success-bg text-success", dot: "bg-success" },
    }[tone];

    return (
        <div className={cn("mb-8 flex items-center gap-3 rounded-stat p-4", palette.box)}>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-pill opacity-60", palette.dot)} />
                <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-pill", palette.dot)} />
            </span>
            <span className="text-sm font-semibold">{msg}</span>
        </div>
    );
}

// ─── Metadata pills dynamiques ────────────────────────────────────────────────

function MetaPills({ bootcamp, config }: { bootcamp: Bootcamp | null; config: ResultStatic }) {
    // Données backend si disponibles, sinon valeurs de fallback
    const duration  = bootcamp?.duration   ?? (config.id === "both" ? "20 semaines (2 bootcamps)" : config.id === "b2b" ? "Sur mesure" : "—");
    const price     = bootcamp?.price      ?? null;
    const audience  = bootcamp?.audience   ?? (config.id === "both" ? "Tarif préférentiel pack" : config.id === "b2b" ? "De 5 à 20 personnes" : "15 apprenants max");
    const session   = bootcamp?.nextSession;
    const maxPartic = session?.maxParticipants;

    const pills: { icon: React.ElementType; text: string }[] = [
        { icon: Clock,  text: duration },
        { icon: Target, text: config.id === "b2b" ? "Adapté au niveau de l'équipe" : "Débutant → Opérationnel" },
        { icon: Users,  text: maxPartic ? `${maxPartic} apprenants max` : audience },
        ...(price ? [{ icon: Target, text: price }] : []),
    ];

    return (
        <div className="mb-8 flex flex-wrap gap-3">
            {pills.map((p) => (
                <span key={p.text} className="inline-flex items-center gap-2 rounded-pill bg-surface-sand px-4 py-2 text-sm font-medium text-ink">
                    <p.icon className="h-3.5 w-3.5 text-ink-secondary" />
                    {p.text}
                </span>
            ))}
        </div>
    );
}

// ─── Highlights : backend si disponible, sinon éditorial ─────────────────────

function Highlights({ bootcamp, config }: { bootcamp: Bootcamp | null; config: ResultStatic }) {
    // On utilise les benefits du backend s'ils existent et sont suffisants
    const items = (bootcamp?.benefits && bootcamp.benefits.length >= 3)
        ? bootcamp.benefits
        : config.highlights;

    return (
        <div className="mb-8">
            <div className="mb-4 text-xs font-bold uppercase tracking-[1px] text-ink-secondary">
                Ce que vous allez accomplir
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {items.slice(0, 4).map((h) => (
                    <div key={h} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        <span className="text-sm leading-snug text-ink">{h}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────

function ResultScreen({
                          resultKey,
                          bootcamps,
                          onRestart,
                          onRegister,
                      }: {
    resultKey:          string;
    bootcamps:          Bootcamp[] | undefined;
    onRestart:          () => void;
    onRegister:         (b: Bootcamp) => void;
}) {
    const config = RESULTS_STATIC[resultKey] ?? RESULTS_STATIC.both;
    const Icon   = config.icon;

    // Bootcamp backend correspondant à ce résultat
    const matchedBootcamp = config.category && bootcamps
        ? (bootcamps.find((b) => b.category === config.category) ?? null)
        : null;

    // Titre dynamique : priorité au backend, fallback au titre config
    const displayTitle = matchedBootcamp?.title ?? {
        powerbi:    "Bootcamp Microsoft Power BI",
        dataanalyst:"Bootcamp Data Analyst Python & SQL",
        both:       "Parcours Data Complet",
        b2b:        "Formation Intra-Entreprise",
    }[resultKey] ?? "Bootcamp";

    // Sous-titre : catégorie + durée backend
    const displaySubtitle = matchedBootcamp?.duration
        ? `${config.subtitleFallback} · ${matchedBootcamp.duration}`
        : config.subtitleFallback;

    // CTA : ouvre la modale si session disponible, sinon navigue
    const canOpenModal = !config.ctaHref && matchedBootcamp && matchedBootcamp.nextSession;

    return (
        <div className="mx-auto w-full max-w-3xl animate-fade-in">

            {/* Header */}
            <div className="mb-10 text-center">
                <div className="mb-4 inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cta" />
                    <span className="text-sm font-semibold text-cta">Analyse complète</span>
                </div>
                <h2 className="mb-2 font-heading text-[32px] font-extrabold leading-tight tracking-[-1px] text-navy md:text-[40px]">
                    Votre parcours idéal est trouvé !
                </h2>
                <p className="text-ink-secondary">Basé sur vos réponses, voici notre recommandation personnalisée</p>
            </div>

            {/* Carte résultat */}
            <Card radius="callout" className="mb-6 border border-[#E7E0D4] p-6 md:p-10">
                <Pill variant="success" className="mb-6">{config.tag}</Pill>

                <div className="mb-8 flex items-start gap-5">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-info-bg">
                        <Icon className="h-8 w-8 text-navy" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-heading text-2xl font-bold leading-tight text-navy md:text-[30px]">
                            {displayTitle}
                        </h3>
                        <p className="mt-1 font-semibold text-cta">{displaySubtitle}</p>
                    </div>
                </div>

                <p className="mb-8 text-base leading-relaxed text-ink-secondary">{config.description}</p>

                <MetaPills bootcamp={matchedBootcamp} config={config} />
                <Highlights bootcamp={matchedBootcamp} config={config} />
                <UrgencyBand bootcamp={matchedBootcamp} config={config} />

                <div className="flex flex-col gap-4 sm:flex-row">
                    {canOpenModal ? (
                        <Button onClick={() => onRegister(matchedBootcamp!)} size="lg" className="flex-1">
                            {config.ctaLabel}
                            <ArrowRight />
                        </Button>
                    ) : (
                        <Button asChild size="lg" className="flex-1">
                            <Link to={config.ctaHref ?? "/formations"}>
                                {config.ctaLabel}
                                <ArrowRight />
                            </Link>
                        </Button>
                    )}
                    <Button asChild size="lg" variant="outline" className="flex-1">
                        <Link to={config.secondaryHref}>{config.secondaryLabel}</Link>
                    </Button>
                </div>
            </Card>

            {/* Témoignage */}
            <Card radius="card" className="mb-6 border border-[#E7E0D4] p-6">
                <div className="mb-3 flex gap-1" aria-label="5 étoiles sur 5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F5B301] text-[#F5B301]" />)}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed text-ink-secondary">« {config.testimonial.content} »</p>
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-navy text-xs font-bold text-white">
                        {config.testimonial.initials}
                    </span>
                    <div>
                        <div className="text-sm font-semibold text-ink">{config.testimonial.name}</div>
                        <div className="text-xs text-ink-secondary">{config.testimonial.role}</div>
                    </div>
                </div>
            </Card>

            {/* Actions secondaires */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-stat bg-surface-sand p-4">
                    <MessageCircle className="h-5 w-5 shrink-0 text-success" />
                    <div>
                        <div className="text-sm font-semibold text-ink">Une question ?</div>
                        <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-navy hover:underline">
                            Discutez avec nous sur WhatsApp →
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-stat bg-surface-sand p-4">
                    <Trophy className="h-5 w-5 shrink-0 text-cta" />
                    <div>
                        <div className="text-sm font-semibold text-ink">Voir tous nos alumni</div>
                        <Link to="/alumni" className="text-xs font-semibold text-navy hover:underline">+150 réussites documentées →</Link>
                    </div>
                </div>
            </div>

            {/* Recommencer */}
            <div className="text-center">
                <button onClick={onRestart} className="group inline-flex items-center gap-2 text-sm text-ink-secondary transition-colors hover:text-navy">
                    <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                    Recommencer le questionnaire
                </button>
            </div>
        </div>
    );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({ question, selected, onSelect }: {
    question: Question; selected: string | undefined; onSelect: (v: string) => void;
}) {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-10 text-center">
                <h2 className="mb-3 font-heading text-[26px] font-extrabold leading-tight tracking-[-0.5px] text-navy md:text-[34px]">
                    {question.title}
                </h2>
                <p className="text-ink-secondary">{question.subtitle}</p>
            </div>
            <div role="radiogroup" aria-label={question.title} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {question.options.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onSelect(option.value)}
                            className={cn(
                                "relative flex items-start gap-4 rounded-card border-2 p-5 text-left transition-all duration-200",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2",
                                isSelected
                                    ? "border-navy bg-info-bg"
                                    : "border-[#E7E0D4] bg-white hover:border-navy/40 hover:bg-white"
                            )}
                        >
                            <span className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-stat text-2xl",
                                isSelected ? "bg-white" : "bg-surface-sand"
                            )}>
                                {option.emoji}
                            </span>
                            <span className="min-w-0 flex-1 pr-6">
                                <span className="mb-1 block text-base font-semibold leading-tight text-navy">{option.label}</span>
                                {option.sublabel && (
                                    <span className="block text-sm leading-snug text-ink-secondary">{option.sublabel}</span>
                                )}
                            </span>
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-pill border-2",
                                    isSelected ? "border-navy bg-navy" : "border-[#D6CEC0]"
                                )}
                            >
                                {isSelected && <span className="h-2 w-2 rounded-pill bg-white" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const Orientation = () => {
    const [currentStep, setCurrentStep]       = useState(0);
    const [answers, setAnswers]               = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | undefined>();
    const [showResult, setShowResult]         = useState(false);
    const [resultKey, setResultKey]           = useState<string>("");
    const [isAnimating, setIsAnimating]       = useState(false);
    const [registerFor, setRegisterFor]       = useState<Bootcamp | null>(null);

    const totalSteps    = questions.length;
    const currentQuestion = questions[currentStep - 1];

    // ── Bootcamps depuis le backend ───────────────────────────────────────────
    // Préchargé dès le montage pour que le résultat soit immédiat
    const {
        data: bootcamps,
        isError: isErrorBootcamps,
    } = useQuery({
        queryKey:  ["bootcamps", "public"],
        queryFn:   bootcampService.list,
        staleTime: QUERY_CONFIG.staleTime,
    });

    const handleStart  = () => setCurrentStep(1);
    const handleSelect = (v: string) => setSelectedOption(v);

    const handleNext = () => {
        if (!selectedOption) return;
        const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
        setAnswers(newAnswers);
        setIsAnimating(true);
        setTimeout(() => {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
                setSelectedOption(undefined);
            } else {
                setResultKey(computeResult(newAnswers));
                setShowResult(true);
            }
            setIsAnimating(false);
        }, 200);
    };

    const handleBack = () => {
        if (currentStep <= 1) { setCurrentStep(0); return; }
        const prevQ = questions[currentStep - 2];
        setSelectedOption(answers[prevQ.id]);
        setCurrentStep(currentStep - 1);
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setAnswers({});
        setSelectedOption(undefined);
        setShowResult(false);
        setResultKey("");
        setRegisterFor(null);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep, showResult]);

    return (
        <SiteLayout>
            <SeoHead {...PAGE_SEO.orientation} />

            {/* ── INTRO ────────────────────────────────────────────────── */}
            {currentStep === 0 && !showResult && (
                <section className="px-6 py-16 lg:px-20 lg:py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-callout bg-navy">
                            <Compass className="h-10 w-10 text-white" />
                        </span>
                        <div className="mb-6">
                            <Pill variant="info">
                                <Sparkles className="h-3.5 w-3.5" />
                                Parcours d'orientation personnalisé
                            </Pill>
                        </div>
                        <h1 className="mb-6 font-heading text-[40px] font-extrabold leading-[1.05] tracking-[-1.5px] text-navy md:text-[56px]">
                            Trouvez la formation <span className="text-cta">faite pour vous</span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-ink-secondary">
                            En <strong className="text-ink">5 questions</strong>, nous analysons votre profil, vos objectifs et votre niveau pour vous recommander la formation exacte qui va transformer votre carrière.
                        </p>

                        <div className="mb-10 grid gap-4 sm:grid-cols-3">
                            {[
                                { icon: Zap,        text: "2 minutes",         sub: "Pas plus"            },
                                { icon: Target,     text: "100% personnalisé", sub: "Selon votre profil"  },
                                { icon: TrendingUp, text: "Résultat immédiat", sub: "Avec recommandation" },
                            ].map((f) => (
                                <Card key={f.text} radius="stat" className="flex flex-col items-center gap-2 border border-[#E7E0D4] p-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg">
                                        <f.icon className="h-5 w-5 text-navy" />
                                    </span>
                                    <div className="text-sm font-bold text-navy">{f.text}</div>
                                    <div className="text-xs text-ink-secondary">{f.sub}</div>
                                </Card>
                            ))}
                        </div>

                        <p className="mb-10 text-sm text-ink-secondary">
                            <strong className="text-ink">+30 personnes</strong> ont déjà trouvé leur parcours
                        </p>

                        <Button onClick={handleStart} size="lg" className="px-10 text-[17px]">
                            Commencer maintenant
                            <ArrowRight />
                        </Button>
                        <p className="mt-4 text-xs text-ink-secondary">Aucune inscription requise · Résultat immédiat</p>

                        {/* Erreur backend non bloquante */}
                        {isErrorBootcamps && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-secondary">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Les données en direct ne sont pas disponibles — les résultats seront affichés avec des informations générales.
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── QUIZ ─────────────────────────────────────────────────── */}
            {currentStep > 0 && !showResult && (
                <section className="px-6 py-12 lg:px-20 lg:py-20">
                    <div className="mx-auto mb-10 max-w-2xl">
                        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-secondary">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="group flex items-center gap-1.5 text-sm transition-colors hover:text-navy"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Retour
                            </button>
                            <span>Question {currentStep} sur {totalSteps}</span>
                        </div>
                        <ProgressBar value={currentStep} max={totalSteps} aria-label={`Question ${currentStep} sur ${totalSteps}`} />
                    </div>

                    <div className={cn("transition-opacity duration-200", isAnimating ? "opacity-0" : "opacity-100")}>
                        {currentQuestion && (
                            <QuestionCard question={currentQuestion} selected={selectedOption} onSelect={handleSelect} />
                        )}
                    </div>

                    <div className="mx-auto mt-8 flex max-w-2xl justify-end">
                        <Button onClick={handleNext} disabled={!selectedOption} size="lg" className="min-w-[180px]">
                            {currentStep === totalSteps
                                ? <><span>Voir mon résultat</span><Sparkles /></>
                                : <><span>Suivant</span><ArrowRight /></>}
                        </Button>
                    </div>
                </section>
            )}

            {/* ── RÉSULTAT ─────────────────────────────────────────────── */}
            {showResult && (
                <section className="px-6 py-12 lg:px-20 lg:py-20">
                    <ResultScreen
                        resultKey={resultKey}
                        bootcamps={bootcamps}
                        onRestart={handleRestart}
                        onRegister={setRegisterFor}
                    />
                </section>
            )}

            {/* ── Modale d'inscription ─────────────────────────────────────── */}
            {registerFor && (
                <RegistrationModal
                    bootcamp={registerFor}
                    session={registerFor.nextSession}
                    staticData={getBootcampStatic(registerFor.category ?? "data")}
                    onClose={() => setRegisterFor(null)}
                />
            )}
        </SiteLayout>
    );
};

export default Orientation;
