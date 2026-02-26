import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
    ArrowRight, ArrowLeft, BarChart3, Database, Building,
    Users, Compass, CheckCircle, Star, Clock, Target,
    Sparkles, Trophy, Zap, GraduationCap, MessageCircle,
    RotateCcw, ChevronRight, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    id: string;
    emoji: string;
    label: string;
    sublabel?: string;
    value: string;
}

interface Question {
    id: string;
    step: number;
    title: string;
    subtitle: string;
    options: Option[];
}

interface Result {
    id: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    gradient: string;
    tag: string;
    tagColor: string;
    title: string;
    subtitle: string;
    description: string;
    duration: string;
    level: string;
    audience: string;
    highlights: string[];
    nextStep: string;
    ctaLabel: string;
    ctaHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    testimonial: {
        name: string;
        role: string;
        content: string;
        initials: string;
    };
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const questions: Question[] = [
    {
        id: "situation",
        step: 1,
        title: "Quelle est votre situation actuelle ?",
        subtitle: "Choisissez ce qui vous correspond le mieux",
        options: [
            { id: "a", emoji: "💼", label: "Salarié en poste", sublabel: "Je travaille et veux progresser", value: "employed" },
            { id: "b", emoji: "🔄", label: "En reconversion", sublabel: "Je change de secteur ou de métier", value: "reorientation" },
            { id: "c", emoji: "🎓", label: "Étudiant / Jeune diplômé", sublabel: "Je cherche à me spécialiser", value: "student" },
            { id: "d", emoji: "🏢", label: "Manager / Responsable", sublabel: "Je pilote une équipe ou un budget", value: "manager" },
        ],
    },
    {
        id: "tools",
        step: 2,
        title: "Votre rapport aux outils numériques aujourd'hui ?",
        subtitle: "Soyez honnête, il n'y a pas de mauvaise réponse",
        options: [
            { id: "a", emoji: "📊", label: "J'utilise Excel au quotidien", sublabel: "Formules, tableaux croisés, graphiques", value: "excel" },
            { id: "b", emoji: "🖥️", label: "Je connais les bases de l'informatique", sublabel: "À l'aise avec les outils bureautiques", value: "basic" },
            { id: "c", emoji: "⚙️", label: "J'ai touché à un peu de code", sublabel: "SQL, Python ou autre langage", value: "code" },
            { id: "d", emoji: "🚀", label: "Je suis à l'aise techniquement", sublabel: "Développeur ou profil tech", value: "tech" },
        ],
    },
    {
        id: "goal",
        step: 3,
        title: "Quel est votre objectif principal ?",
        subtitle: "Ce que vous voulez accomplir grâce à cette formation",
        options: [
            { id: "a", emoji: "📈", label: "Créer des tableaux de bord & rapports", sublabel: "Piloter la performance visuellement", value: "dashboard" },
            { id: "b", emoji: "🔬", label: "Analyser des données & automatiser", sublabel: "Extraire des insights avec du code", value: "analysis" },
            { id: "c", emoji: "💼", label: "Décrocher un poste en data", sublabel: "Changer de carrière vers la data", value: "job" },
            { id: "d", emoji: "🏗️", label: "Améliorer les outils de mon équipe", sublabel: "Former mes collaborateurs", value: "team" },
        ],
    },
    {
        id: "availability",
        step: 4,
        title: "Quelle est votre disponibilité ?",
        subtitle: "Nos sessions s'adaptent à votre rythme de vie",
        options: [
            { id: "a", emoji: "🌙", label: "Soirs & week-ends seulement", sublabel: "2-3 soirs par semaine + samedi", value: "evenings" },
            { id: "b", emoji: "☀️", label: "Disponible en journée", sublabel: "Format intensif en semaine", value: "fulltime" },
            { id: "c", emoji: "🔀", label: "Flexible selon le programme", sublabel: "Je m'adapte", value: "flexible" },
            { id: "d", emoji: "🏢", label: "Formation pour mon entreprise", sublabel: "Format intra sur mesure", value: "corporate" },
        ],
    },
    {
        id: "timeline",
        step: 5,
        title: "Votre horizon de transformation ?",
        subtitle: "Dans combien de temps vous projetez-vous ?",
        options: [
            { id: "a", emoji: "⚡", label: "Le plus tôt possible", sublabel: "Je suis prêt à commencer maintenant", value: "now" },
            { id: "b", emoji: "📅", label: "Dans 1 à 3 mois", sublabel: "Je prépare ma transition", value: "soon" },
            { id: "c", emoji: "🌱", label: "Dans 3 à 6 mois", sublabel: "Je veux bien me préparer", value: "later" },
            { id: "d", emoji: "🔍", label: "Je veux juste explorer", sublabel: "Pas encore décidé", value: "explore" },
        ],
    },
];

// ─── Results mapping ───────────────────────────────────────────────────────────

const results: Record<string, Result> = {
    powerbi: {
        id: "powerbi",
        icon: BarChart3,
        iconBg: "bg-accent/15",
        iconColor: "text-accent",
        accentBg: "bg-accent/8",
        accentBorder: "border-accent/25",
        accentText: "text-accent",
        gradient: "from-accent/20 via-accent/5 to-transparent",
        tag: "✦ Votre match idéal",
        tagColor: "bg-accent text-white",
        title: "Bootcamp Power BI & Excel",
        subtitle: "Business Intelligence · 8 semaines",
        description:
            "Votre profil correspond parfaitement à notre bootcamp Power BI. Vous avez une base en outils bureautiques et voulez passer au niveau supérieur en business intelligence. Ce bootcamp est conçu exactement pour vous.",
        duration: "8 semaines",
        level: "Débutant → Confirmé",
        audience: "12 apprenants max",
        highlights: [
            "Maîtriser Power BI du débutant à l'expert",
            "Créer des dashboards qui impressionnent votre direction",
            "Automatiser vos reportings mensuels",
            "Préparer la certification Microsoft PL-300",
        ],
        nextStep: "Prochaine session : 10 Mars 2025 · 4 places restantes",
        ctaLabel: "Réserver ma place",
        ctaHref: "/bootcamps/powerbi",
        secondaryLabel: "Parler à un conseiller",
        secondaryHref: "/contact",
        testimonial: {
            name: "Fatou Ndiaye",
            role: "Contrôleur de Gestion · Sonatel",
            content: "Mon reporting mensuel prenait 2 jours. Maintenant 2 heures. Mon directeur m'a demandé de former toute l'équipe.",
            initials: "FN",
        },
    },
    dataanalyst: {
        id: "dataanalyst",
        icon: Database,
        iconBg: "bg-primary/15",
        iconColor: "text-primary",
        accentBg: "bg-primary/8",
        accentBorder: "border-primary/25",
        accentText: "text-primary",
        gradient: "from-primary/20 via-primary/5 to-transparent",
        tag: "✦ Votre match idéal",
        tagColor: "bg-primary text-white",
        title: "Bootcamp Data Analyst",
        subtitle: "SQL & Python · 12 semaines",
        description:
            "Votre profil et vos objectifs pointent clairement vers le bootcamp Data Analyst. Ce programme intensif vous donnera toutes les armes pour devenir un data analyst opérationnel et décrocher le poste que vous visez.",
        duration: "12 semaines",
        level: "Débutant → Opérationnel",
        audience: "10 apprenants max",
        highlights: [
            "Maîtriser SQL pour interroger n'importe quelle base de données",
            "Analyser des données réelles avec Python & Pandas",
            "Construire un portfolio de projets pour vos entretiens",
            "Bénéficier du réseau alumni Model Technologie",
        ],
        nextStep: "Prochaine session : 17 Mars 2025 · 2 places restantes",
        ctaLabel: "Réserver ma place",
        ctaHref: "/bootcamps/data-analyst",
        secondaryLabel: "Parler à un conseiller",
        secondaryHref: "/contact",
        testimonial: {
            name: "Moussa Sow",
            role: "Chef de Projet Data · Wave",
            content: "En 12 semaines j'ai appris Python et SQL, réalisé 3 projets réels et décroché un poste chez Wave. Meilleur investissement de ma carrière.",
            initials: "MS",
        },
    },
    both: {
        id: "both",
        icon: GraduationCap,
        iconBg: "bg-gradient-to-br from-accent/20 to-primary/20",
        iconColor: "text-primary",
        accentBg: "bg-secondary/50",
        accentBorder: "border-border",
        accentText: "text-foreground",
        gradient: "from-primary/15 via-accent/8 to-transparent",
        tag: "✦ Parcours complet recommandé",
        tagColor: "bg-gradient-to-r from-primary to-accent text-white",
        title: "Parcours Data Complet",
        subtitle: "Power BI + SQL & Python · 20 semaines",
        description:
            "Votre ambition et votre profil vous positionnent pour un parcours data complet. En combinant les deux bootcamps, vous deviendrez un data analyst polyvalent, capable de gérer la donnée de A à Z.",
        duration: "20 semaines (2 bootcamps)",
        level: "Zéro → Expert",
        audience: "Tarif préférentiel pack",
        highlights: [
            "Power BI pour la visualisation et le reporting",
            "SQL & Python pour l'analyse et l'automatisation",
            "Portfolio solide avec 6+ projets réels",
            "Accompagnement carrière dédié jusqu'au recrutement",
        ],
        nextStep: "Tarif pack : économisez 15% sur les 2 bootcamps",
        ctaLabel: "Découvrir le pack",
        ctaHref: "/bootcamps",
        secondaryLabel: "Appeler un conseiller",
        secondaryHref: "/contact",
        testimonial: {
            name: "Amadou Diallo",
            role: "Data Analyst · CBAO",
            content: "J'ai fait les deux bootcamps successivement. Aujourd'hui je maîtrise tout l'écosystème data et j'ai été promu en 6 mois.",
            initials: "AD",
        },
    },
    b2b: {
        id: "b2b",
        icon: Building,
        iconBg: "bg-foreground/10",
        iconColor: "text-foreground",
        accentBg: "bg-secondary/50",
        accentBorder: "border-border",
        accentText: "text-foreground",
        gradient: "from-foreground/10 via-foreground/3 to-transparent",
        tag: "✦ Solution entreprise",
        tagColor: "bg-foreground text-background",
        title: "Formation Intra-Entreprise",
        subtitle: "Sur mesure · Votre timing",
        description:
            "Vous cherchez à monter en compétence toute une équipe ? Notre formule intra-entreprise est conçue pour vous. Nous adaptons le programme, les horaires et les cas pratiques à votre secteur et à vos outils.",
        duration: "Sur mesure (2j à 6 semaines)",
        level: "Adapté au niveau de l'équipe",
        audience: "De 5 à 30 personnes",
        highlights: [
            "Programme 100% adapté à votre secteur",
            "Cas pratiques sur vos données réelles",
            "Formateurs experts avec expérience entreprise",
            "Support post-formation inclus (3 mois)",
        ],
        nextStep: "Devis gratuit sous 48h · Disponible toute l'année",
        ctaLabel: "Demander un devis",
        ctaHref: "/contact",
        secondaryLabel: "Voir nos services B2B",
        secondaryHref: "/services",
        testimonial: {
            name: "Directeur RH",
            role: "Institution Financière · Dakar",
            content: "Model Technologie a formé toute notre équipe finance en 3 semaines. Résultat : nos reportings sont automatisés et notre DG est bluffé.",
            initials: "DG",
        },
    },
};

// ─── Scoring logic ─────────────────────────────────────────────────────────────

function computeResult(answers: Record<string, string>): string {
    const { situation, tools, goal, availability } = answers;

    // Corporate signals
    if (availability === "corporate" || situation === "manager" && goal === "team") return "b2b";

    // Both bootcamps
    if (goal === "job" && (situation === "reorientation" || situation === "student")) {
        if (tools === "code" || tools === "tech") return "dataanalyst";
        return "both";
    }

    // Data analyst signals
    if (
        goal === "analysis" || goal === "job" ||
        tools === "code" || tools === "tech" ||
        situation === "reorientation"
    ) return "dataanalyst";

    // Power BI signals
    if (
        goal === "dashboard" ||
        tools === "excel" ||
        situation === "employed" ||
        situation === "manager"
    ) return "powerbi";

    // Default
    return "both";
}

// ─── Components ────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Question {current} sur {total}
        </span>
                <span className="text-xs text-muted-foreground">{Math.round((current / total) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                    style={{ width: `${(current / total) * 100}%` }}
                />
            </div>
        </div>
    );
}

function QuestionCard({
                          question,
                          selected,
                          onSelect,
                      }: {
    question: Question;
    selected: string | undefined;
    onSelect: (value: string) => void;
}) {
    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Question text */}
            <div className="text-center mb-10">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {question.title}
                </h2>
                <p className="text-muted-foreground">{question.subtitle}</p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((option, i) => {
                    const isSelected = selected === option.value;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.value)}
                            className={cn(
                                "group relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer opacity-0 animate-fade-in",
                                "hover:border-primary/40 hover:bg-primary/3 hover:shadow-md hover:-translate-y-0.5",
                                isSelected
                                    ? "border-primary bg-primary/8 shadow-md -translate-y-0.5"
                                    : "border-border bg-card"
                            )}
                            style={{ animationDelay: `${i * 0.06}s` }}
                        >
                            {/* Emoji */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-200",
                                isSelected ? "bg-primary/15 scale-110" : "bg-secondary group-hover:bg-primary/8"
                            )}>
                                {option.emoji}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    "font-semibold text-base leading-tight mb-1 transition-colors",
                                    isSelected ? "text-primary" : "text-card-foreground group-hover:text-primary"
                                )}>
                                    {option.label}
                                </div>
                                {option.sublabel && (
                                    <div className="text-sm text-muted-foreground leading-snug">{option.sublabel}</div>
                                )}
                            </div>

                            {/* Check */}
                            <div className={cn(
                                "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0",
                                isSelected
                                    ? "border-primary bg-primary"
                                    : "border-border group-hover:border-primary/50"
                            )}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ResultScreen({
                          resultKey,
                          answers,
                          onRestart,
                      }: {
    resultKey: string;
    answers: Record<string, string>;
    onRestart: () => void;
}) {
    const result = results[resultKey] || results.both;
    const Icon = result.icon;

    return (
        <div className="w-full max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>

            {/* Result header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-accent font-semibold text-sm">Analyse complète</span>
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Votre parcours idéal est trouvé !
                </h2>
                <p className="text-muted-foreground">Basé sur vos réponses, voici notre recommandation personnalisée</p>
            </div>

            {/* Main result card */}
            <div className={cn(
                "relative rounded-3xl border-2 overflow-hidden mb-6",
                result.accentBorder
            )}>
                {/* Gradient top */}
                <div className={cn("absolute top-0 left-0 right-0 h-64 bg-gradient-to-b pointer-events-none", result.gradient)} />

                <div className="relative z-10 p-8 md:p-10">
                    {/* Tag */}
                    <div className="mb-6">
            <span className={cn("inline-block text-xs font-bold px-4 py-2 rounded-full", result.tagColor)}>
              {result.tag}
            </span>
                    </div>

                    {/* Title block */}
                    <div className="flex items-start gap-5 mb-8">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border border-border", result.iconBg)}>
                            <Icon className={cn("h-8 w-8", result.iconColor)} />
                        </div>
                        <div>
                            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight">
                                {result.title}
                            </h3>
                            <p className={cn("font-semibold mt-1", result.accentText)}>{result.subtitle}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-base leading-relaxed mb-8">{result.description}</p>

                    {/* Metadata pills */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {[
                            { icon: Clock, text: result.duration },
                            { icon: Target, text: result.level },
                            { icon: Users, text: result.audience },
                        ].map((info) => (
                            <div key={info.text} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm font-medium">
                                <info.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                {info.text}
                            </div>
                        ))}
                    </div>

                    {/* Highlights */}
                    <div className="mb-8">
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                            Ce que vous allez accomplir
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {result.highlights.map((h) => (
                                <div key={h} className="flex items-start gap-3">
                                    <CheckCircle className={cn("h-5 w-5 flex-shrink-0 mt-0.5", result.accentText)} />
                                    <span className="text-sm text-foreground leading-snug">{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Urgency band */}
                    <div className={cn("flex items-center gap-3 p-4 rounded-xl border mb-8", result.accentBorder, result.accentBg)}>
                        <div className="relative flex-shrink-0">
                            <div className={cn("w-2.5 h-2.5 rounded-full animate-ping absolute", resultKey === "b2b" ? "bg-foreground/40" : "bg-green-400")} />
                            <div className={cn("w-2.5 h-2.5 rounded-full relative", resultKey === "b2b" ? "bg-foreground/60" : "bg-green-400")} />
                        </div>
                        <span className={cn("text-sm font-semibold", result.accentText)}>{result.nextStep}</span>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild size="lg" className={cn(
                            "flex-1 font-bold text-base group",
                            resultKey === "powerbi" ? "bg-accent hover:bg-accent/90 text-white" :
                                resultKey === "dataanalyst" ? "bg-primary hover:bg-primary/90 text-white" :
                                    "bg-foreground hover:bg-foreground/90 text-background"
                        )}>
                            <Link to={result.ctaHref}>
                                {result.ctaLabel}
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="flex-1 group">
                            <Link to={result.secondaryHref}>
                                {result.secondaryLabel}
                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Testimonial */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-muted-foreground italic text-sm leading-relaxed mb-4">
                    "{result.testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{result.testimonial.initials}</span>
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-card-foreground">{result.testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{result.testimonial.role}</div>
                    </div>
                </div>
            </div>

            {/* Secondary actions */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                    <MessageCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">Une question ?</div>
                        <a href="https://wa.me/221770000000" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            Discutez avec nous sur WhatsApp →
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                    <Trophy className="h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                        <div className="text-sm font-semibold text-foreground">Voir tous nos alumni</div>
                        <Link to="/alumni" className="text-xs text-primary hover:underline">
                            +150 réussites documentées →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Restart */}
            <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <button
                    onClick={onRestart}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    Recommencer le questionnaire
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Orientation = () => {
    const [currentStep, setCurrentStep] = useState(0); // 0 = intro
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | undefined>();
    const [showResult, setShowResult] = useState(false);
    const [resultKey, setResultKey] = useState<string>("");
    const [isAnimating, setIsAnimating] = useState(false);

    const totalSteps = questions.length;
    const currentQuestion = questions[currentStep - 1];

    const handleStart = () => {
        setCurrentStep(1);
    };

    const handleSelect = (value: string) => {
        setSelectedOption(value);
    };

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
                const key = computeResult(newAnswers);
                setResultKey(key);
                setShowResult(true);
            }
            setIsAnimating(false);
        }, 200);
    };

    const handleBack = () => {
        if (currentStep <= 1) {
            setCurrentStep(0);
        } else {
            const prevQ = questions[currentStep - 2];
            setSelectedOption(answers[prevQ.id]);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setAnswers({});
        setSelectedOption(undefined);
        setShowResult(false);
        setResultKey("");
    };

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep, showResult]);

    return (
        <Layout>
            <div className="min-h-screen bg-background">

                {/* ── INTRO ─────────────────────────────────────────────────── */}
                {currentStep === 0 && !showResult && (
                    <section className="relative py-20 lg:py-32 overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
                            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
                            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                        </div>

                        <div className="container mx-auto px-4 lg:px-8 relative z-10">
                            <div className="max-w-2xl mx-auto text-center">
                                {/* Icon */}
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-8 shadow-glow opacity-0 animate-scale-in" style={{ animationDelay: "0.1s" }}>
                                    <Compass className="h-10 w-10 text-white" />
                                </div>

                                {/* Headline */}
                                <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Parcours d'orientation personnalisé
                                    </div>
                                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                        Trouvez le bootcamp
                                        <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      fait pour vous
                    </span>
                                    </h1>
                                    <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
                                        En <strong className="text-foreground">5 questions</strong>, nous analysons votre profil, vos objectifs et votre niveau pour vous recommander la formation exacte qui va transformer votre carrière.
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="grid sm:grid-cols-3 gap-4 mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                                    {[
                                        { icon: Zap, text: "2 minutes", sub: "Pas plus" },
                                        { icon: Target, text: "100% personnalisé", sub: "Selon votre profil" },
                                        { icon: TrendingUp, text: "Résultat immédiat", sub: "Avec recommandation" },
                                    ].map((f) => (
                                        <div key={f.text} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/50 border border-border">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <f.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="font-bold text-foreground text-sm">{f.text}</div>
                                            <div className="text-xs text-muted-foreground">{f.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Proof */}
                                <div className="flex items-center justify-center gap-3 mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                                    <div className="flex -space-x-2">
                                        {["AM", "FD", "MS", "KT", "BN"].map((init, i) => (
                                            <div
                                                key={init}
                                                className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold"
                                                style={{ zIndex: 5 - i }}
                                            >
                                                {init[0]}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">+120 personnes</strong> ont trouvé leur parcours
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                                    <Button
                                        onClick={handleStart}
                                        size="lg"
                                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold px-10 py-4 h-auto text-lg group shadow-glow"
                                    >
                                        Commencer maintenant
                                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-4">Aucune inscription requise · Résultat immédiat</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── QUIZ ──────────────────────────────────────────────────── */}
                {currentStep > 0 && !showResult && (
                    <section className="py-16 lg:py-24">
                        <div className="container mx-auto px-4 lg:px-8">
                            {/* Top bar */}
                            <div className="max-w-2xl mx-auto mb-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                                    >
                                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        Retour
                                    </button>
                                    <div className="flex-1">
                                        <ProgressBar current={currentStep} total={totalSteps} />
                                    </div>
                                </div>
                            </div>

                            {/* Question */}
                            <div className={cn("transition-opacity duration-200", isAnimating ? "opacity-0" : "opacity-100")}>
                                {currentQuestion && (
                                    <QuestionCard
                                        question={currentQuestion}
                                        selected={selectedOption}
                                        onSelect={handleSelect}
                                    />
                                )}
                            </div>

                            {/* Next button */}
                            <div className="max-w-2xl mx-auto mt-8 flex justify-end">
                                <Button
                                    onClick={handleNext}
                                    disabled={!selectedOption}
                                    size="lg"
                                    className={cn(
                                        "font-bold group min-w-[180px] transition-all duration-200",
                                        selectedOption
                                            ? "bg-primary hover:bg-primary/90 text-white shadow-soft"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    {currentStep === totalSteps ? (
                                        <>
                                            Voir mon résultat
                                            <Sparkles className="h-4 w-4 ml-2" />
                                        </>
                                    ) : (
                                        <>
                                            Suivant
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Step indicators */}
                            <div className="flex justify-center gap-2 mt-8">
                                {questions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            i + 1 < currentStep
                                                ? "w-2 h-2 bg-primary"
                                                : i + 1 === currentStep
                                                    ? "w-6 h-2 bg-primary"
                                                    : "w-2 h-2 bg-border"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── RESULT ────────────────────────────────────────────────── */}
                {showResult && (
                    <section className="py-16 lg:py-24 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/4 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/4 blur-3xl" />
                        </div>
                        <div className="container mx-auto px-4 lg:px-8 relative z-10">
                            <ResultScreen
                                resultKey={resultKey}
                                answers={answers}
                                onRestart={handleRestart}
                            />
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
};

export default Orientation;
