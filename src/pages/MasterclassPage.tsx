/**
 * MasterclassPage.tsx — landing de la masterclass Power BI.
 * Migrée sur le design system (SiteLayout + composants shared). Logique d'inscription
 * inchangée : reCAPTCHA v3 invisible (GoogleReCaptchaProvider dans main.tsx) puis
 * POST /masterclass/register. Une fois l'événement passé ou les inscriptions closes,
 * le formulaire est remplacé par un encart « inscriptions closes » (plus de modale bloquante).
 */
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
    Calendar, Clock, Video, Users, CheckCircle2, ArrowRight, Star,
    BarChart3, Zap, Award, Loader2, Mail, ShieldCheck, Bell,
} from "lucide-react";

import martinPhoto from "@/assets/martin-chokki.jpeg";
import { useToast } from "@/hooks/use-toast";
import { httpClient } from "@/services/httpClient";
import { PAGE_SEO, SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, Pill, SectionHeader } from "@/components/shared";
import { COMPANY } from "@/config/constants";

// ─── 🔒 Interrupteur inscriptions ─────────────────────────────────────────────
// Passer à false pour rouvrir les inscriptions (et mettre à jour EVENT_DATE / MASTERCLASS_ID)
const REGISTRATIONS_CLOSED = true;
// ──────────────────────────────────────────────────────────────────────────────

// ─── Config masterclass ────────────────────────────────────────────────────────

const MASTERCLASS_ID = "power-bi-dashboard-2026-03-24";
const EVENT_DATE     = new Date("2026-03-24T18:00:00+00:00");

const dateLong = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
const dateShort = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(d);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegistrationFormValues {
    firstName: string;
    lastName:  string;
    email:     string;
    phone:     string;
    profile:   string;
    company:   string;
}

const EMPTY_FORM: RegistrationFormValues = {
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    profile:   "",
    company:   "",
};

// ─── Service ──────────────────────────────────────────────────────────────────

const masterclassService = {
    register: async (form: RegistrationFormValues & { masterclassId: string; recaptchaToken: string }) => {
        const res = await httpClient.post(
            "/masterclass/register",
            form,
            { skipAuth: true } as never,
        );
        return res;
    },
};

// ─── Countdown ────────────────────────────────────────────────────────────────

function useCountdown(target: Date) {
    const calc = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
        return {
            days:    Math.floor(diff / 86400000),
            hours:   Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000)  / 60000),
            seconds: Math.floor((diff % 60000)    / 1000),
            over:    false,
        };
    };

    const [time, setTime] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, []);

    return time;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-stat bg-navy font-heading text-2xl font-extrabold tabular-nums text-white md:h-20 md:w-20 md:text-3xl">
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[1px] text-ink-secondary">{label}</span>
        </div>
    );
}

// ─── Programme & formateur ────────────────────────────────────────────────────

const PROGRAMME = [
    { time: "18h00", title: "Accueil & présentation", desc: "Tour de table, objectifs de la session" },
    { time: "18h15", title: "Interface Power BI Desktop", desc: "Découverte de l'environnement de travail" },
    { time: "18h30", title: "Importer et préparer vos données", desc: "Connexion à Excel, nettoyage avec Power Query" },
    { time: "19h00", title: "Créer vos premières visualisations", desc: "Graphiques, cartes, indicateurs KPI" },
    { time: "19h30", title: "Construire le dashboard complet", desc: "Mise en page, filtres, interactivité" },
    { time: "19h45", title: "Q&A et ressources", desc: "Questions libres, ressources pour continuer" },
    { time: "19h55", title: "Next Steps", desc: "Annonces au sujet de Model Technologie et de ses formations" },
];

const SPEAKER = {
    name:  "Martin Komla CHOKKI",
    role:  "Data Strategist | Expert Power BI & IA Agent",
    bio:   "Spécialiste de la data et de l'automatisation, Martin accompagne les organisations du secteur bancaire dans la transformation de leurs données en outils de pilotage stratégique. Il conçoit des dashboards dynamiques et des solutions d'IA qui permettent aux décideurs d'agir avec précision, en temps réel.",
    photo: martinPhoto,
    tags:  ["Power BI", "IA Agent", "Secteur bancaire", "Data Strategy", "Automatisation"],
};

// ─── Encart « inscriptions closes » ───────────────────────────────────────────

function ClosedCard({ eventOver }: { eventOver: boolean }) {
    return (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-warning-bg">
                <Bell className="h-6 w-6 text-warning" />
            </span>
            <Pill variant="error">Inscriptions closes</Pill>
            <h3 className="font-heading text-2xl font-extrabold leading-tight text-navy">
                {eventOver ? "Cette masterclass a eu lieu" : "Les inscriptions sont terminées"}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary">
                Avec <strong className="text-ink">150+ inscrits</strong>, nous avons atteint notre capacité maximale
                pour la session du {dateShort(EVENT_DATE)}. La prochaine masterclass sera annoncée sur nos réseaux
                sociaux.
            </p>
            <div className="grid w-full grid-cols-2 gap-3">
                <Button asChild variant="outline" shape="rounded">
                    <a href={COMPANY.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </Button>
                <Button asChild variant="outline" shape="rounded">
                    <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </Button>
            </div>
            <Button asChild shape="rounded" className="w-full">
                <Link to="/formations">Voir nos formations <ArrowRight /></Link>
            </Button>
        </div>
    );
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

const fieldClass =
    "w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3 font-sans text-base text-ink outline-none focus:border-navy";
const labelClass = "text-xs font-bold uppercase tracking-[0.8px] text-ink-secondary";

function RegistrationForm() {
    const { toast }             = useToast();
    const { executeRecaptcha }  = useGoogleReCaptcha();
    const [form, setForm]       = useState<RegistrationFormValues>(EMPTY_FORM);
    const [status, setStatus]   = useState<"idle" | "success" | "duplicate">("idle");

    const set = (patch: Partial<RegistrationFormValues>) => setForm(f => ({ ...f, ...patch }));

    const mutation = useMutation({
        mutationFn: async () => {
            if (!executeRecaptcha) {
                throw new Error("reCAPTCHA non initialisé. Rechargez la page.");
            }
            const recaptchaToken = await executeRecaptcha("masterclass_register");
            try {
                return await masterclassService.register({
                    ...form,
                    masterclassId: MASTERCLASS_ID,
                    recaptchaToken,
                });
            } catch (err: any) {
                const status: number  = err?.response?.status ?? err?.status;
                const message: string = err?.response?.data?.message ?? err?.message ?? "";
                const enriched        = new Error(message) as any;
                enriched.status       = status;
                enriched.apiMessage   = message;
                throw enriched;
            }
        },
        onSuccess: (res: any) => {
            setStatus(res?.success === false ? "duplicate" : "success");
        },
        onError: (err: any) => {
            const status: number     = err?.status ?? err?.response?.status;
            const apiMessage: string = err?.apiMessage ?? err?.response?.data?.message ?? "";

            if (status === 409 || apiMessage.toLowerCase().includes("déjà inscrit")) {
                setStatus("duplicate");
            } else if (status === 429) {
                toast({ title: "Trop de tentatives. Veuillez réessayer dans une heure.", variant: "destructive" });
            } else if (status === 403) {
                toast({ title: "Vérification anti-bot échouée. Veuillez réessayer.", variant: "destructive" });
            } else {
                toast({ title: apiMessage || "Une erreur est survenue.", variant: "destructive" });
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.profile) {
            toast({ title: "Merci de remplir les champs obligatoires.", variant: "destructive" });
            return;
        }
        mutation.mutate();
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-success-bg">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                </span>
                <h3 className="font-heading text-xl font-extrabold text-navy">Inscription confirmée !</h3>
                <p className="text-ink-secondary">
                    Un e-mail de confirmation avec le lien Google Meet vous a été envoyé à{" "}
                    <strong className="text-ink">{form.email}</strong>.
                </p>
                <p className="text-sm text-ink-secondary">
                    Rendez-vous le <strong className="text-ink">{dateShort(EVENT_DATE)} à 18h</strong> !
                </p>
            </div>
        );
    }

    if (status === "duplicate") {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-warning-bg">
                    <Mail className="h-7 w-7 text-warning" />
                </span>
                <h3 className="font-heading text-xl font-extrabold text-navy">Vous êtes déjà inscrit(e) !</h3>
                <p className="text-ink-secondary">
                    L'adresse <strong className="text-ink">{form.email}</strong> est déjà enregistrée pour cette masterclass.
                </p>
                <p className="mb-2 text-sm text-ink-secondary">
                    Vérifiez votre boîte mail (et les spams) — le lien Google Meet vous y a été envoyé.
                </p>
                <button
                    type="button"
                    onClick={() => { setStatus("idle"); setForm(EMPTY_FORM); }}
                    className="text-sm font-semibold text-navy underline underline-offset-4"
                >
                    Utiliser une autre adresse e-mail
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="mc-first" className={labelClass}>Prénom *</label>
                    <input id="mc-first" value={form.firstName} onChange={e => set({ firstName: e.target.value })} className={fieldClass} placeholder="Amadou" autoComplete="given-name" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="mc-last" className={labelClass}>Nom *</label>
                    <input id="mc-last" value={form.lastName} onChange={e => set({ lastName: e.target.value })} className={fieldClass} placeholder="Diallo" autoComplete="family-name" />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-mail" className={labelClass}>E-mail *</label>
                <input id="mc-mail" type="email" value={form.email} onChange={e => set({ email: e.target.value })} className={fieldClass} placeholder="amadou@exemple.com" autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-phone" className={labelClass}>Téléphone *</label>
                <input id="mc-phone" type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })} className={fieldClass} placeholder="+221 77 000 00 00" autoComplete="tel" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-profile" className={labelClass}>Vous êtes *</label>
                <select id="mc-profile" value={form.profile} onChange={e => set({ profile: e.target.value })} className={fieldClass}>
                    <option value="" disabled>Sélectionner votre profil</option>
                    <option value="Étudiant(e)">Étudiant(e)</option>
                    <option value="Professionnel">Professionnel(le)</option>
                    <option value="Entrepreneur">Entrepreneur(se)</option>
                    <option value="En reconversion">En reconversion</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-company" className={labelClass}>Entreprise / École</label>
                <input id="mc-company" value={form.company} onChange={e => set({ company: e.target.value })} className={fieldClass} placeholder="Orange, UGB, UCAD…" autoComplete="organization" />
            </div>
            <Button type="submit" size="lg" shape="rounded" disabled={mutation.isPending} className="mt-2 w-full">
                {mutation.isPending ? (
                    <><Loader2 className="animate-spin" /> Vérification en cours…</>
                ) : (
                    <>Je m'inscris gratuitement <ArrowRight /></>
                )}
            </Button>
            <div className="flex flex-col gap-1.5 pt-1 text-center text-xs text-ink-secondary">
                <p className="flex items-center justify-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    Lien Google Meet envoyé par e-mail après inscription
                </p>
                <p className="flex items-center justify-center gap-1 text-[11px]">
                    <ShieldCheck className="h-3 w-3" />
                    Protégé par reCAPTCHA ·{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Confidentialité</a>
                    {" "}·{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">CGU</a>
                </p>
            </div>
        </form>
    );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function MasterclassPage() {
    const countdown = useCountdown(EVENT_DATE);
    const eventOver = countdown.over;
    const closed    = REGISTRATIONS_CLOSED || eventOver;

    return (
        <SiteLayout>
            <SeoHead {...PAGE_SEO.masterclass} />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="px-6 py-14 lg:px-20 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="flex min-w-0 flex-col gap-7">
                        <div>
                            <Pill variant={closed ? "neutral" : "success"}>
                                {closed ? "Masterclass gratuite · Inscriptions closes" : "Masterclass gratuite · Places limitées"}
                            </Pill>
                        </div>
                        <h1 className="font-heading text-[40px] font-extrabold leading-[1.05] tracking-[-1.5px] text-navy md:text-[56px]">
                            Construire son premier <span className="text-cta">tableau de bord</span> avec Microsoft Power BI
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed text-ink-secondary">
                            En 2 heures, apprenez à transformer vos données brutes en dashboards professionnels qui impressionnent.
                            Une session 100 % pratique, live et gratuite.
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                            {[
                                { icon: Calendar, text: capitalize(dateLong(EVENT_DATE)) },
                                { icon: Clock,    text: "18h00 – 20h00 (GMT+0)" },
                                { icon: Video,    text: "En ligne · Google Meet" },
                                { icon: Users,    text: "Session live interactive" },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2 text-sm text-ink">
                                    <Icon className="h-4 w-4 shrink-0 text-cta" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>

                        {!eventOver && (
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[1px] text-ink-secondary">La session commence dans</p>
                                <div className="flex items-start gap-3">
                                    <CountdownBlock value={countdown.days}    label="jours" />
                                    <CountdownBlock value={countdown.hours}   label="heures" />
                                    <CountdownBlock value={countdown.minutes} label="min" />
                                    <CountdownBlock value={countdown.seconds} label="sec" />
                                </div>
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                "100 % gratuit, aucune carte requise",
                                "Session live avec Q&A en direct",
                                "Exercice pratique inclus",
                                "Replay disponible pour les inscrits",
                                "Certificat de participation",
                                "Ouvert à tous les niveaux",
                            ].map(point => (
                                <div key={point} className="flex items-center gap-2 text-sm text-ink">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                    {point}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formulaire / encart clos */}
                    <div id="inscription" className="min-w-0 lg:sticky lg:top-28">
                        <Card radius="callout" className="border border-[#E7E0D4] p-6 md:p-8">
                            {closed ? (
                                <ClosedCard eventOver={eventOver} />
                            ) : (
                                <>
                                    <div className="mb-6 flex flex-col items-center gap-2 text-center">
                                        <Pill variant="success">Inscription gratuite</Pill>
                                        <h2 className="font-heading text-xl font-extrabold text-navy">Réservez votre place</h2>
                                        <p className="text-sm text-ink-secondary">Recevez le lien Meet directement par e-mail</p>
                                    </div>
                                    <RegistrationForm />
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </section>

            {/* ── CE QUE VOUS ALLEZ APPRENDRE ──────────────────────────────── */}
            <section className="bg-surface-sand px-6 py-16 lg:px-20 lg:py-20">
                <SectionHeader
                    align="center"
                    eyebrow="Au programme"
                    title="Ce que vous allez maîtriser"
                    description="Une progression logique de zéro au dashboard complet en 2 heures."
                />
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {[
                        { icon: BarChart3, title: "Visualisations pro", desc: "Créez des graphiques, jauges et KPI cards qui racontent vos données avec clarté." },
                        { icon: Zap,       title: "Zéro code requis",   desc: "Power BI est un outil no-code. Aucune compétence en programmation nécessaire." },
                        { icon: Award,     title: "Portfolio concret",  desc: "Repartez avec un vrai dashboard à montrer à vos recruteurs ou votre direction." },
                    ].map(({ icon: Icon, title, desc }) => (
                        <Card key={title} radius="card" className="flex flex-col gap-3 p-6">
                            <span className="flex h-12 w-12 items-center justify-center rounded-stat bg-info-bg">
                                <Icon className="h-6 w-6 text-navy" />
                            </span>
                            <h3 className="font-heading text-lg font-bold text-navy">{title}</h3>
                            <p className="text-sm leading-relaxed text-ink-secondary">{desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── PROGRAMME ────────────────────────────────────────────────── */}
            <section className="px-6 py-16 lg:px-20 lg:py-20">
                <SectionHeader
                    align="center"
                    eyebrow="Déroulé"
                    title="Programme de la session"
                    description={`${capitalize(dateLong(EVENT_DATE))} · 18h00 – 20h00`}
                />
                <ol className="mx-auto mt-12 flex max-w-3xl flex-col">
                    {PROGRAMME.map((item, i) => (
                        <li key={item.time} className="flex gap-5">
                            <div className="flex flex-col items-center">
                                <span className="mt-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-navy text-xs font-bold text-white">
                                    {i + 1}
                                </span>
                                {i < PROGRAMME.length - 1 && <span className="my-1 w-px flex-1 bg-[#E7E0D4]" />}
                            </div>
                            <div className="min-w-0 flex-1 pb-6 pt-3">
                                <div className="mb-1 flex flex-wrap items-baseline gap-3">
                                    <span className="font-mono text-xs font-bold text-cta">{item.time}</span>
                                    <h3 className="font-heading font-bold text-navy">{item.title}</h3>
                                </div>
                                <p className="text-sm text-ink-secondary">{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ── FORMATEUR ────────────────────────────────────────────────── */}
            <section className="bg-surface-sand px-6 py-16 lg:px-20 lg:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
                    <div className="mx-auto w-full max-w-[280px] lg:mx-0">
                        <img
                            src={SPEAKER.photo}
                            alt={SPEAKER.name}
                            className="aspect-[4/5] w-full rounded-callout object-cover object-top"
                        />
                    </div>
                    <div className="flex min-w-0 flex-col gap-4">
                        <span className="text-sm font-bold uppercase tracking-[1.5px] text-cta">Votre formateur</span>
                        <h2 className="font-heading text-[34px] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[44px]">
                            {SPEAKER.name}
                        </h2>
                        <p className="font-semibold text-navy">{SPEAKER.role}</p>
                        <p className="text-base leading-relaxed text-ink-secondary">{SPEAKER.bio}</p>
                        <div className="flex flex-wrap gap-2">
                            {SPEAKER.tags.map(tag => <Pill key={tag} variant="info">{tag}</Pill>)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ────────────────────────────────────────────────── */}
            <section className="px-6 py-16 lg:px-20 lg:py-20">
                <div className="rounded-hero bg-navy px-6 py-14 text-center lg:px-20">
                    <div className="mb-4 flex justify-center gap-1" aria-hidden="true">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F5B301] text-[#F5B301]" />)}
                    </div>
                    <h2 className="mx-auto mb-4 max-w-2xl font-heading text-[30px] font-extrabold leading-tight tracking-[-0.5px] text-white md:text-[40px]">
                        {closed ? "Continuez avec nos formations" : "Prêt à construire votre premier dashboard ?"}
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-lg text-[#D5DEE8]">
                        {closed
                            ? "Cette session est terminée. Découvrez nos formations Power BI, SQL et Python pour aller plus loin."
                            : `Rejoignez des dizaines de professionnels et d'étudiants qui transforment leurs données en insights. C'est gratuit, en direct, le ${dateShort(EVENT_DATE)}.`}
                    </p>
                    <Button asChild size="lg">
                        {closed
                            ? <Link to="/formations">Voir les formations <ArrowRight /></Link>
                            : <a href="#inscription">Je m'inscris gratuitement <ArrowRight /></a>}
                    </Button>
                </div>
            </section>
        </SiteLayout>
    );
}
