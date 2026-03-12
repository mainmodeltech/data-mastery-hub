/**
 * MasterclassPage.tsx
 * reCAPTCHA v3 — invisible, sans friction pour l'utilisateur.
 *
 * Install : npm install react-google-recaptcha-v3
 * Wrapper  : entourer <App /> de <GoogleReCaptchaProvider> dans main.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/ui/button";
import logoHorizontal from "@/assets/logo-black-horizontal.png";
import logoMark from "@/assets/logo-black.png";
import martinPhoto from "@/assets/martin-chokki.jpeg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Calendar,
    Clock,
    Video,
    Users,
    CheckCircle2,
    ArrowRight,
    Star,
    BarChart3,
    Zap,
    Award,
    ChevronRight,
    Loader2,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { httpClient } from "@/services/httpClient";

// ─── Config masterclass ────────────────────────────────────────────────────────

const MASTERCLASS_ID = "power-bi-dashboard-2026-03-24";
const EVENT_DATE     = new Date("2026-03-24T18:00:00+00:00");

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegistrationForm {
    firstName: string;
    lastName:  string;
    email:     string;
    phone:     string;
    profile:   string;
    company:   string;
}

const EMPTY_FORM: RegistrationForm = {
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    profile:   "",
    company:   "",
};

// ─── Service ──────────────────────────────────────────────────────────────────

const masterclassService = {
    register: async (form: RegistrationForm & { masterclassId: string; recaptchaToken: string }) => {
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
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            days:    Math.floor(diff / 86400000),
            hours:   Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000)  / 60000),
            seconds: Math.floor((diff % 60000)    / 1000),
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
        <div className="flex flex-col items-center">
            <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-center">
          <span className="text-2xl md:text-3xl font-black text-amber-400 tabular-nums leading-none">
            {String(value).padStart(2, "0")}
          </span>
                </div>
            </div>
            <span className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-medium">
        {label}
      </span>
        </div>
    );
}

// ─── Programme ────────────────────────────────────────────────────────────────

const PROGRAMME = [
    { time: "18h00", title: "Accueil & présentation", desc: "Tour de table, objectifs de la session" },
    { time: "18h15", title: "Interface Power BI Desktop", desc: "Découverte de l'environnement de travail" },
    { time: "18h30", title: "Importer et préparer vos données", desc: "Connexion à Excel, nettoyage avec Power Query" },
    { time: "19h00", title: "Créer vos premières visualisations", desc: "Graphiques, cartes, indicateurs KPI" },
    { time: "19h30", title: "Construire le dashboard complet", desc: "Mise en page, filtres, interactivité" },
    { time: "19h45", title: "Q&A et ressources", desc: "Questions libres, ressources pour continuer" },
    { time: "19h55", title: "Next Steps", desc: "Annonces au sujets de Model technologie et ses bootcamps" },
];

// ─── Formateur ────────────────────────────────────────────────────────────────

const SPEAKER = {
    name:  "Martin Komla CHOKKI",
    role:  "Data Strategist | Expert Power BI & IA Agent",
    bio:   "Spécialiste de la data et de l'automatisation, Martin accompagne les organisations du secteur bancaire dans la transformation de leurs données en outils de pilotage stratégique. Il conçoit des dashboards dynamiques et des solutions d'IA qui permettent aux décideurs d'agir avec précision, en temps réel.",
    photo: martinPhoto,
    tags:  ["Power BI", "IA Agent", "Secteur bancaire", "Data Strategy", "Automatisation"],
};

// ─── Formulaire ───────────────────────────────────────────────────────────────

function RegistrationForm() {
    const { toast }             = useToast();
    const { executeRecaptcha }  = useGoogleReCaptcha();      // ← hook reCAPTCHA v3
    const [form, setForm]       = useState<RegistrationForm>(EMPTY_FORM);
    const [status, setStatus]   = useState<"idle" | "success" | "duplicate">("idle");

    const set = (patch: Partial<RegistrationForm>) => setForm(f => ({ ...f, ...patch }));

    const mutation = useMutation({
        mutationFn: async () => {
            // 1. Obtenir le token reCAPTCHA (invisible pour l'utilisateur)
            if (!executeRecaptcha) {
                throw new Error("reCAPTCHA non initialisé. Rechargez la page.");
            }
            const recaptchaToken = await executeRecaptcha("masterclass_register");

            // 2. Envoyer avec le token
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
            if (res?.success === false) {
                setStatus("duplicate");
            } else {
                setStatus("success");
            }
        },
        onError: (err: any) => {
            const status: number     = err?.status ?? err?.response?.status;
            const apiMessage: string = err?.apiMessage ?? err?.response?.data?.message ?? "";

            if (status === 409 || apiMessage.toLowerCase().includes("déjà inscrit")) {
                setStatus("duplicate");
            } else if (status === 429) {
                toast({
                    title: "Trop de tentatives. Veuillez réessayer dans une heure.",
                    variant: "destructive",
                });
            } else if (status === 403) {
                toast({
                    title: "Vérification anti-bot échouée. Veuillez réessayer.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: apiMessage || "Une erreur est survenue.",
                    variant: "destructive",
                });
            }
        },
    });

    const handleSubmit = () => {
        if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.profile) {
            toast({ title: "Merci de remplir les champs obligatoires.", variant: "destructive" });
            return;
        }
        mutation.mutate();
    };

    // ── État : inscription réussie ─────────────────────────────────────────
    if (status === "success") {
        return (
            <div className="text-center py-8 px-4">
                <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">Inscription confirmée ! 🎉</h3>
                <p className="text-slate-300 mb-2">
                    Un email de confirmation avec le lien Google Meet vous a été envoyé à{" "}
                    <span className="text-amber-400 font-semibold">{form.email}</span>.
                </p>
                <p className="text-slate-400 text-sm">
                    Rendez-vous le <strong className="text-white">mardi 24 mars à 18h</strong> !
                </p>
            </div>
        );
    }

    // ── État : email déjà inscrit ──────────────────────────────────────────
    if (status === "duplicate") {
        return (
            <div className="text-center py-8 px-4">
                <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Mail className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">Vous êtes déjà inscrit(e) !</h3>
                <p className="text-slate-300 mb-2">
                    L'adresse <span className="text-amber-400 font-semibold">{form.email}</span>{" "}
                    est déjà enregistrée pour cette masterclass.
                </p>
                <p className="text-slate-400 text-sm mb-6">
                    Vérifiez votre boîte mail (et les spams) — le lien Google Meet vous y a été envoyé.
                </p>
                <button
                    onClick={() => { setStatus("idle"); setForm(EMPTY_FORM); }}
                    className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
                >
                    Utiliser une autre adresse email
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Prénom *</Label>
                    <Input
                        value={form.firstName}
                        onChange={e => set({ firstName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20"
                        placeholder="Amadou"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Nom *</Label>
                    <Input
                        value={form.lastName}
                        onChange={e => set({ lastName: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20"
                        placeholder="Diallo"
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Email *</Label>
                <Input
                    type="email"
                    value={form.email}
                    onChange={e => set({ email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20"
                    placeholder="amadou@exemple.com"
                />
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Téléphone *</Label>
                <Input
                    value={form.phone}
                    onChange={e => set({ phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20"
                    placeholder="+221 77 000 00 00"
                />
            </div>

            {/* Profil */}
            <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Vous êtes *</Label>
                <Select value={form.profile} onValueChange={v => set({ profile: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-amber-400/60">
                        <SelectValue placeholder="Sélectionner votre profil" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="Étudiant(e)"     className="text-slate-200 focus:bg-amber-400/10">Étudiant(e)</SelectItem>
                        <SelectItem value="Professionnel"   className="text-slate-200 focus:bg-amber-400/10">Professionnel(le)</SelectItem>
                        <SelectItem value="Entrepreneur"    className="text-slate-200 focus:bg-amber-400/10">Entrepreneur(se)</SelectItem>
                        <SelectItem value="En reconversion" className="text-slate-200 focus:bg-amber-400/10">En reconversion</SelectItem>
                        <SelectItem value="Autre"           className="text-slate-200 focus:bg-amber-400/10">Autre</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Entreprise */}
            <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Entreprise / École</Label>
                <Input
                    value={form.company}
                    onChange={e => set({ company: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/60 focus:ring-amber-400/20"
                    placeholder="Orange, UGB, UCAD…"
                />
            </div>

            {/* CTA */}
            <Button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-base mt-2 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(251,191,36,0.4)]"
            >
                {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Vérification en cours…</>
                ) : (
                    <>Je m'inscris gratuitement <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
            </Button>

            {/* Mentions légales reCAPTCHA + sécurité */}
            <div className="space-y-1.5 pt-1">
                <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    Lien Google Meet envoyé par email après inscription
                </p>
                <p className="text-center text-[10px] text-slate-600 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-slate-700" />
                    Protégé par reCAPTCHA ·{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer"
                       className="underline hover:text-slate-400 transition-colors">
                        Confidentialité
                    </a>
                    {" "}·{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer"
                       className="underline hover:text-slate-400 transition-colors">
                        CGU
                    </a>
                </p>
            </div>
        </div>
    );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function MasterclassPage() {
    const countdown = useCountdown(EVENT_DATE);

    return (
        <div className="min-h-screen bg-[#0d0f1a] text-white">

            {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
            <nav className="border-b border-white/5 bg-[#0d0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
                    <Link to="/"><img src={logoHorizontal} alt="Model Technologie" className="h-7 w-auto invert" /></Link>
                    <a href="#inscription" className="text-xs font-bold text-amber-400 border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-4 py-1.5 rounded-full transition-colors">
                        S'inscrire gratuitement
                    </a>
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                </div>

                <div className="container mx-auto px-4 lg:px-8 pt-16 pb-12 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">

                            {/* Colonne gauche */}
                            <div>
                                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Masterclass Gratuite · Places Limitées</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
                                    Construire son premier{" "}
                                    <span className="relative inline-block">
                                        <span className="relative z-10 text-amber-400">tableau de bord</span>
                                        <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-amber-400/40 rounded" />
                                    </span>{" "}
                                    <br />avec{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f2c811] to-amber-400">Microsoft Power BI</span>
                                </h1>

                                <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
                                    En 2 heures, apprenez à transformer vos données brutes en dashboards professionnels qui impressionnent. Une session 100% pratique, live et gratuite.
                                </p>

                                <div className="flex flex-wrap gap-4 mb-10">
                                    {[
                                        { icon: Calendar, text: "Mardi 24 mars 2026" },
                                        { icon: Clock,    text: "18h00 – 20h00 (GMT+0)" },
                                        { icon: Video,    text: "En ligne · Google Meet" },
                                        { icon: Users,    text: "Session live interactive" },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Icon className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-10">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">La session commence dans</p>
                                    <div className="flex items-center gap-3">
                                        <CountdownBlock value={countdown.days}    label="jours" />
                                        <span className="text-amber-400/60 text-2xl font-black pb-4">:</span>
                                        <CountdownBlock value={countdown.hours}   label="heures" />
                                        <span className="text-amber-400/60 text-2xl font-black pb-4">:</span>
                                        <CountdownBlock value={countdown.minutes} label="min" />
                                        <span className="text-amber-400/60 text-2xl font-black pb-4">:</span>
                                        <CountdownBlock value={countdown.seconds} label="sec" />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        "100% gratuit, aucune carte requise",
                                        "Session live avec Q&A en direct",
                                        "Exercice pratique inclus",
                                        "Replay disponible pour les inscrits",
                                        "Certificat de participation",
                                        "Ouvert à tous les niveaux",
                                    ].map(point => (
                                        <div key={point} className="flex items-center gap-2 text-sm text-slate-300">
                                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Colonne droite — Formulaire */}
                            <div className="lg:sticky lg:top-20" id="inscription">
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="text-center mb-6">
                                        <img src={logoMark} alt="Model Technologie" className="h-10 w-auto mx-auto mb-3 invert opacity-80" />
                                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-3">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                            <span className="text-green-400 text-xs font-semibold">Inscription gratuite</span>
                                        </div>
                                        <h2 className="text-xl font-black text-white mb-1">Réservez votre place</h2>
                                        <p className="text-slate-400 text-sm">Recevez le lien Meet directement par email</p>
                                    </div>
                                    <RegistrationForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CE QUE VOUS ALLEZ APPRENDRE ──────────────────────────────────── */}
            <section className="py-20 border-t border-white/5">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black mb-3">Ce que vous allez <span className="text-amber-400">maîtriser</span></h2>
                            <p className="text-slate-400 text-lg">Une progression logique de zéro au dashboard complet en 2 heures.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-5">
                            {[
                                { icon: BarChart3, title: "Visualisations pro", desc: "Créez des graphiques, jauges et KPI cards qui racontent vos données avec clarté." },
                                { icon: Zap,       title: "Zéro code requis",   desc: "Power BI est un outil no-code. Aucune compétence en programmation nécessaire." },
                                { icon: Award,     title: "Portfolio concret",  desc: "Repartez avec un vrai dashboard à montrer à vos recruteurs ou votre direction." },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-amber-400/20 transition-colors group">
                                    <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-400/15 transition-colors">
                                        <Icon className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <h3 className="font-black text-lg mb-2">{title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PROGRAMME ─────────────────────────────────────────────────────── */}
            <section className="py-20 border-t border-white/5 bg-white/[0.01]">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black mb-3">Programme de la <span className="text-amber-400">session</span></h2>
                            <p className="text-slate-400">Mardi 24 mars 2026 · 18h00 – 20h00</p>
                        </div>
                        <div className="space-y-0">
                            {PROGRAMME.map((item, i) => (
                                <div key={i} className="flex gap-5 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-4 group-hover:bg-amber-400/20 transition-colors">
                                            <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                                        </div>
                                        {i < PROGRAMME.length - 1 && <div className="w-px flex-1 bg-white/5 my-1" />}
                                    </div>
                                    <div className="pb-6 pt-3 flex-1">
                                        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                                            <span className="text-amber-400 text-xs font-black tracking-wide font-mono">{item.time}</span>
                                            <h3 className="font-bold text-white">{item.title}</h3>
                                        </div>
                                        <p className="text-slate-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FORMATEUR SPOTLIGHT ───────────────────────────────────────── */}
            <section className="py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-400/4 rounded-full blur-[140px] pointer-events-none" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="h-px flex-1 bg-white/8" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Votre formateur</span>
                            <div className="h-px flex-1 bg-white/8" />
                        </div>
                        <div className="grid lg:grid-cols-[320px_1fr] gap-12 lg:gap-16 items-center">
                            <div className="flex justify-center lg:justify-start">
                                <div className="relative">
                                    <div className="absolute -inset-3 rounded-3xl border border-amber-400/15 -rotate-2" />
                                    <div className="absolute -inset-3 rounded-3xl border border-white/5 rotate-1" />
                                    <div className="relative w-64 h-72 lg:w-72 lg:h-80 rounded-2xl overflow-hidden">
                                        <img src={SPEAKER.photo} alt={SPEAKER.name} className="w-full h-full object-cover object-top" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a]/60 via-transparent to-transparent" />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 bg-amber-400 text-slate-900 rounded-xl px-3 py-2 shadow-[0_8px_32px_rgba(251,191,36,0.4)]">
                                        <p className="text-xs font-black uppercase tracking-wide leading-none">Expert</p>
                                        <p className="text-xs font-black uppercase tracking-wide leading-none">Power BI</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] mb-2">{SPEAKER.name}</h2>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-[2px] bg-amber-400 rounded-full" />
                                    <p className="text-amber-400 font-semibold text-sm tracking-wide">{SPEAKER.role}</p>
                                </div>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8">{SPEAKER.bio}</p>
                                <div className="flex flex-wrap gap-2">
                                    {SPEAKER.tags.map(tag => (
                                        <span key={tag} className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:border-amber-400/30 hover:text-amber-400 transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
            <section className="py-20 border-t border-white/5 bg-gradient-to-b from-transparent to-amber-400/5">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <div className="max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Prêt à construire votre <span className="text-amber-400">premier dashboard ?</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-8">
                            Rejoignez des dizaines de professionnels et étudiants qui transforment leurs données en insights. C'est gratuit, en direct, le 24 mars.
                        </p>
                        <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                           className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-base px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_32px_rgba(251,191,36,0.35)]">
                            Je m'inscris gratuitement
                            <ArrowRight className="h-5 w-5" />
                        </a>
                        <p className="text-slate-500 text-sm mt-4">Aucune carte de crédit requise · Lien Meet envoyé par email</p>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-8">
                <div className="container mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src={logoHorizontal} alt="Model Technologie" className="h-6 w-auto invert opacity-50 group-hover:opacity-80 transition-opacity" />
                    </Link>
                    <p className="text-xs text-slate-600">© 2026 Model Technologie · Dakar, Sénégal</p>
                    <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                        Retour au site <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </footer>
        </div>
    );
}
