/**
 * Orientation.tsx — quiz d'orientation (5 questions → recommandation).
 * Questions, règles de recommandation, textes des résultats et photo viennent du backend (contenu
 * `page.orientation`, modifiable depuis l'administration). Chaque résultat peut être relié à une formation du
 * catalogue (`formationSlug`) : titre, durée, prix, bénéfices et prochaine session viennent alors de l'API.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight, ArrowLeft, BarChart3, Database, Building,
    Users, Compass, CheckCircle, Star, Clock, Target,
    Sparkles, Trophy, Zap, GraduationCap, MessageCircle,
    RotateCcw, TrendingUp, type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { fill } from "@/lib/template";
import { PAGE_SEO, SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, Pill, ProgressBar, ContentGate } from "@/components/shared";
import { useFormations } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { LEVEL_LABELS, type Formation } from "@/types/formation.type";
import type { OrientationResult, PageOrientation, SiteCompany } from "@/types/siteContent";

const RESULT_ICONS: Record<string, LucideIcon> = {
    chart: BarChart3, database: Database, graduation: GraduationCap, building: Building,
};
const FEATURE_ICONS: Record<string, LucideIcon> = { zap: Zap, target: Target, trending: TrendingUp };

type Question = PageOrientation["questions"][number];

// ─── Scoring (règles issues du contenu) ───────────────────────────────────────

function computeResult(answers: Record<string, string>, c: PageOrientation): string {
    for (const rule of c.rules) {
        const matched = rule.anyOf.some((clause) =>
            Object.entries(clause).every(([questionId, values]) => values.includes(answers[questionId])),
        );
        if (matched) return rule.result;
    }
    return c.defaultResult;
}

function formatDateFr(iso: string | null): string {
    if (!iso) return "Prochainement";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Bande urgence dynamique ──────────────────────────────────────────────────

function UrgencyBand({ formation, result }: { formation: Formation | null; result: OrientationResult }) {
    if (!formation) {
        if (!result.urgencyText) return null;
        return (
            <div className="mb-8 flex items-center gap-3 rounded-stat bg-info-bg p-4">
                <span className="h-2.5 w-2.5 shrink-0 rounded-pill bg-navy/50" />
                <span className="text-sm font-semibold text-navy">{result.urgencyText}</span>
            </div>
        );
    }

    const session    = formation.nextSession;
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

// ─── Metadata pills (uniquement des données du catalogue) ─────────────────────

function MetaPills({ formation }: { formation: Formation | null }) {
    if (!formation) return null;
    const maxPartic = formation.nextSession?.maxParticipants;

    const pills: { icon: React.ElementType; text: string }[] = [
        ...(formation.duration ? [{ icon: Clock, text: formation.duration }] : []),
        { icon: Target, text: LEVEL_LABELS[formation.level] ?? formation.level },
        ...(maxPartic ? [{ icon: Users, text: `${maxPartic} apprenants max` }] : []),
        ...(formation.price ? [{ icon: Target, text: formation.price }] : []),
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

// ─── ResultScreen ─────────────────────────────────────────────────────────────

function ResultScreen({
    c, company, resultKey, formations, onRestart,
}: {
    c:          PageOrientation;
    company:    SiteCompany;
    resultKey:  string;
    formations: Formation[];
    onRestart:  () => void;
}) {
    const result = c.results[resultKey] ?? c.results[c.defaultResult];
    const Icon   = RESULT_ICONS[result.icon] ?? GraduationCap;
    const ui     = c.ui;

    const formation = result.formationSlug
        ? formations.find((f) => f.slug === result.formationSlug) ?? null
        : null;

    const displayTitle    = formation?.title ?? result.title;
    const displaySubtitle = formation?.duration ? `${result.subtitle} · ${formation.duration}` : result.subtitle;
    const highlights      = formation?.benefits && formation.benefits.length >= 3 ? formation.benefits : result.highlights;
    const ctaHref         = formation ? `/formations/${formation.slug}` : (result.cta.href || "/formations");

    return (
        <div className="mx-auto w-full max-w-3xl animate-fade-in">

            {/* Header */}
            <div className="mb-10 text-center">
                <div className="mb-4 inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cta" />
                    <span className="text-sm font-semibold text-cta">{ui.analysis}</span>
                </div>
                <h2 className="mb-2 font-heading text-[32px] font-extrabold leading-tight tracking-[-1px] text-navy md:text-[40px]">
                    {ui.resultTitle}
                </h2>
                <p className="text-ink-secondary">{ui.resultSubtitle}</p>
            </div>

            {/* Carte résultat */}
            <Card radius="callout" className="mb-6 border border-[#E7E0D4] p-6 md:p-10">
                <Pill variant="success" className="mb-6">{result.tag}</Pill>

                <div className="mb-8 flex items-start gap-5">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-info-bg">
                        <Icon className="h-8 w-8 text-navy" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-heading text-2xl font-bold leading-tight text-navy md:text-[30px]">{displayTitle}</h3>
                        <p className="mt-1 font-semibold text-cta">{displaySubtitle}</p>
                    </div>
                </div>

                <p className="mb-8 text-base leading-relaxed text-ink-secondary">{result.description}</p>

                <MetaPills formation={formation} />

                <div className="mb-8">
                    <div className="mb-4 text-xs font-bold uppercase tracking-[1px] text-ink-secondary">{ui.accomplish}</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {highlights.slice(0, 4).map((h) => (
                            <div key={h} className="flex items-start gap-3">
                                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                                <span className="text-sm leading-snug text-ink">{h}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <UrgencyBand formation={formation} result={result} />

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button asChild size="lg" className="flex-1">
                        <Link to={ctaHref}>
                            {result.cta.label}
                            <ArrowRight />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="flex-1">
                        <Link to={result.secondary.href}>{result.secondary.label}</Link>
                    </Button>
                </div>
            </Card>

            {/* Témoignage */}
            {result.testimonial.content && (
                <Card radius="card" className="mb-6 border border-[#E7E0D4] p-6">
                    <div className="mb-3 flex gap-1" aria-label="5 étoiles sur 5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F5B301] text-[#F5B301]" />)}
                    </div>
                    <p className="mb-4 text-sm italic leading-relaxed text-ink-secondary">« {result.testimonial.content} »</p>
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-navy text-xs font-bold text-white">
                            {result.testimonial.initials}
                        </span>
                        <div>
                            <div className="text-sm font-semibold text-ink">{result.testimonial.name}</div>
                            <div className="text-xs text-ink-secondary">{result.testimonial.role}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Actions secondaires */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-stat bg-surface-sand p-4">
                    <MessageCircle className="h-5 w-5 shrink-0 text-success" />
                    <div>
                        <div className="text-sm font-semibold text-ink">{ui.questionLabel}</div>
                        <a href={company.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-navy hover:underline">
                            {ui.whatsappLink}
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-stat bg-surface-sand p-4">
                    <Trophy className="h-5 w-5 shrink-0 text-cta" />
                    <div>
                        <div className="text-sm font-semibold text-ink">{ui.alumniLabel}</div>
                        <Link to="/alumni" className="text-xs font-semibold text-navy hover:underline">{ui.alumniLink}</Link>
                    </div>
                </div>
            </div>

            {/* Recommencer */}
            <div className="text-center">
                <button onClick={onRestart} className="group inline-flex items-center gap-2 text-sm text-ink-secondary transition-colors hover:text-navy">
                    <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                    {ui.restart}
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
                            key={option.value}
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
    const page = useSiteContent("page.orientation");
    const company = useSiteContent("site.company");

    return (
        <SiteLayout>
            <SeoHead {...PAGE_SEO.orientation} />
            <ContentGate
                content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
                isLoading={page.isLoading || company.isLoading}
                isError={page.isError || company.isError}
                onRetry={() => { page.refetch(); company.refetch(); }}
            >
                {({ page: p, company: c }) => <OrientationBody c={p} company={c} />}
            </ContentGate>
        </SiteLayout>
    );
};

function OrientationBody({ c, company }: { c: PageOrientation; company: SiteCompany }) {
    const [currentStep, setCurrentStep]       = useState(0);
    const [answers, setAnswers]               = useState<Record<string, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | undefined>();
    const [showResult, setShowResult]         = useState(false);
    const [resultKey, setResultKey]           = useState<string>("");
    const [isAnimating, setIsAnimating]       = useState(false);

    const questions       = c.questions;
    const totalSteps      = questions.length;
    const currentQuestion = questions[currentStep - 1];

    // Précharge le catalogue pour que le résultat soit immédiat ; en cas d'échec, le résultat
    // s'affiche avec les textes du contenu (sans durée ni prix).
    const { data: formations = [] } = useFormations();

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
                setResultKey(computeResult(newAnswers, c));
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
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep, showResult]);

    const intro = c.intro;

    return (
        <>
            {/* ── INTRO ────────────────────────────────────────────────── */}
            {currentStep === 0 && !showResult && (
                <section className="px-6 py-16 lg:px-20 lg:py-24">
                    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
                        <div className="text-center lg:text-left">
                            <span className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-callout bg-navy">
                                <Compass className="h-10 w-10 text-white" />
                            </span>
                            <div className="mb-6">
                                <Pill variant="info">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {intro.badge}
                                </Pill>
                            </div>
                            <h1 className="mb-6 font-heading text-[40px] font-extrabold leading-[1.05] tracking-[-1.5px] text-navy md:text-[56px]">
                                {intro.titleBefore} <span className="text-cta">{intro.titleAccent}</span>
                            </h1>
                            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-ink-secondary lg:mx-0">{intro.description}</p>

                            <div className="mb-10 grid gap-4 sm:grid-cols-3">
                                {intro.features.map((f) => {
                                    const FeatureIcon = FEATURE_ICONS[f.icon] ?? Zap;
                                    return (
                                        <Card key={f.text} radius="stat" className="flex flex-col items-center gap-2 border border-[#E7E0D4] p-4">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg">
                                                <FeatureIcon className="h-5 w-5 text-navy" />
                                            </span>
                                            <div className="text-sm font-bold text-navy">{f.text}</div>
                                            <div className="text-xs text-ink-secondary">{f.sub}</div>
                                        </Card>
                                    );
                                })}
                            </div>

                            {intro.social && <p className="mb-10 text-sm text-ink-secondary">{intro.social}</p>}

                            <Button onClick={handleStart} size="lg" className="px-10 text-[17px]">
                                {intro.start}
                                <ArrowRight />
                            </Button>
                            <p className="mt-4 text-xs text-ink-secondary">{intro.note}</p>
                        </div>
                        {intro.image && (
                            <img
                                src={intro.image}
                                alt={intro.imageAlt}
                                loading="eager"
                                className="hidden aspect-[4/5] w-full rounded-hero object-cover lg:block"
                            />
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
                                {c.ui.back}
                            </button>
                            <span>{fill(c.ui.questionOf, { current: currentStep, total: totalSteps })}</span>
                        </div>
                        <ProgressBar value={currentStep} max={totalSteps} aria-label={fill(c.ui.questionOf, { current: currentStep, total: totalSteps })} />
                    </div>

                    <div className={cn("transition-opacity duration-200", isAnimating ? "opacity-0" : "opacity-100")}>
                        {currentQuestion && (
                            <QuestionCard question={currentQuestion} selected={selectedOption} onSelect={handleSelect} />
                        )}
                    </div>

                    <div className="mx-auto mt-8 flex max-w-2xl justify-end">
                        <Button onClick={handleNext} disabled={!selectedOption} size="lg" className="min-w-[180px]">
                            {currentStep === totalSteps
                                ? <><span>{c.ui.seeResult}</span><Sparkles /></>
                                : <><span>{c.ui.next}</span><ArrowRight /></>}
                        </Button>
                    </div>
                </section>
            )}

            {/* ── RÉSULTAT ─────────────────────────────────────────────── */}
            {showResult && (
                <section className="px-6 py-12 lg:px-20 lg:py-20">
                    <ResultScreen c={c} company={company} resultKey={resultKey} formations={formations} onRestart={handleRestart} />
                </section>
            )}
        </>
    );
}

export default Orientation;
