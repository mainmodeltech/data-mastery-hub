/**
 * RegistrationModal.tsx
 * Modale d'inscription à une session de bootcamp.
 *
 * Nouveautés :
 * - Champ "Pays de provenance" (select)
 * - Champ "Profil" (STUDENT | PROFESSIONAL | ENTREPRENEUR) avec boutons radio stylisés
 * - Logique conditionnelle : school obligatoire si STUDENT ; company + position obligatoires si PROFESSIONAL
 * - reCAPTCHA v3 invisible via useGoogleReCaptcha (même pattern que la masterclass)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { promoCodeService, registrationService } from "@/services/api";
import { useSessionAvailability } from "@/hooks/useRegistrations";
import { SessionAvailabilityBadge } from "./SessionAvailabilityBadge";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    BookOpen,
    Briefcase,
    Calendar,
    CheckCircle,
    Lightbulb,
    Loader2,
    X,
    XCircle,
} from "lucide-react";
import type { Bootcamp, BootcampSession } from "@/types/bootcamp.type";
import { StaticEnrichment } from "@/config/bootcamps.config.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileType = "STUDENT" | "PROFESSIONAL" | "ENTREPRENEUR";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateShort(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatSessionLabel(session: BootcampSession): string {
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

// ─── Données : pays ───────────────────────────────────────────────────────────

const COUNTRIES: string[] = [
    // Afrique de l'Ouest (prioritaires)
    "Sénégal",
    "Côte d'Ivoire",
    "Mali",
    "Guinée",
    "Burkina Faso",
    "Togo",
    "Bénin",
    "Niger",
    "Mauritanie",
    "Cap-Vert",
    "Gambie",
    "Sierra Leone",
    "Liberia",
    "Ghana",
    "Nigeria",
    // Afrique centrale & autres
    "Cameroun",
    "Gabon",
    "Congo",
    "République Démocratique du Congo",
    "Tchad",
    // Maghreb
    "Maroc",
    "Algérie",
    "Tunisie",
    // Autres
    "France",
    "Belgique",
    "Canada",
    "Autre",
];

// ─── Données : profils ────────────────────────────────────────────────────────

const PROFILES: { value: ProfileType; label: string; icon: React.ReactNode }[] = [
    { value: "STUDENT",      label: "Étudiant(e)",      icon: <BookOpen  className="h-4 w-4" /> },
    { value: "PROFESSIONAL", label: "Professionnel(le)", icon: <Briefcase className="h-4 w-4" /> },
    { value: "ENTREPRENEUR", label: "Entrepreneur(e)",   icon: <Lightbulb className="h-4 w-4" /> },
];

// ─── Hook : validation du code promo ─────────────────────────────────────────

interface PromoState {
    checking: boolean;
    valid: { discountPercent: number; message?: string } | null;
    error: string | null;
}

function usePromoCode() {
    const [state, setState] = useState<PromoState>({
        checking: false,
        valid: null,
        error: null,
    });
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const validate = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (trimmed.length < 3) {
            setState({ checking: false, valid: null, error: null });
            return;
        }
        setState((prev) => ({ ...prev, checking: true, error: null }));
        try {
            const result = await promoCodeService.check(trimmed);
            setState({
                checking: false,
                valid: { discountPercent: result.discountPercent, message: result.message },
                error: null,
            });
        } catch (err: unknown) {
            const message = (err as { message?: string })?.message ?? "Code promo non valide";
            setState({ checking: false, valid: null, error: message });
        }
    }, []);

    const handleChange = useCallback(
        (raw: string, setFormValue: (v: string) => void) => {
            const value = raw.toUpperCase();
            setFormValue(value);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => validate(value), 500);
        },
        [validate]
    );

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    const reset = useCallback(() => {
        setState({ checking: false, valid: null, error: null });
    }, []);

    return { ...state, handleChange, reset };
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

interface FormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    profile: ProfileType | "";
    school: string;    // obligatoire si STUDENT
    company: string;   // obligatoire si PROFESSIONAL, optionnel si ENTREPRENEUR
    position: string;  // obligatoire si PROFESSIONAL, optionnel si ENTREPRENEUR
    message: string;
    promoCode: string;
}

const INITIAL_FORM: FormValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    profile: "",
    school: "",
    company: "",
    position: "",
    message: "",
    promoCode: "",
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(form: FormValues): string | null {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
        return "Prénom, nom et email sont obligatoires.";
    }
    if (!form.country) return "Veuillez sélectionner votre pays de provenance.";
    if (!form.profile) return "Veuillez sélectionner votre profil.";
    if (form.profile === "STUDENT" && !form.school.trim()) {
        return "Veuillez renseigner votre école ou institution.";
    }
    if (form.profile === "PROFESSIONAL") {
        if (!form.company.trim()) return "Veuillez renseigner votre organisation.";
        if (!form.position.trim()) return "Veuillez renseigner votre poste actuel.";
    }
    return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RegistrationModalProps {
    bootcamp: Bootcamp;
    session: BootcampSession | null;
    staticData: StaticEnrichment;
    onClose: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function RegistrationModal({ bootcamp, session, staticData, onClose }: RegistrationModalProps) {
    const { toast }           = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const isAccent   = staticData.colorKey === "accent";
    const accentClass = isAccent ? "text-accent" : "text-primary";
    const btnClass    = isAccent
        ? "bg-accent hover:bg-accent/90 text-white"
        : "bg-primary hover:bg-primary/90 text-white";

    const [form, setForm]           = useState<FormValues>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const promo                       = usePromoCode();

    // Hook appelé inconditionnellement (règle des Hooks React)
    const sessionId = session?.id ?? "";
    const { data: availabilityRaw } = useSessionAvailability(sessionId);
    void availabilityRaw; // évite le warning "unused variable"

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleFieldChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSelect = (profile: ProfileType) => {
        setForm((prev) => ({ ...prev, profile, school: "", company: "", position: "" }));
    };

    const handlePromoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        promo.handleChange(e.target.value, (v) =>
            setForm((prev) => ({ ...prev, promoCode: v }))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm(form);
        if (validationError) {
            toast({ title: validationError, variant: "destructive" });
            return;
        }

        if (!executeRecaptcha) {
            toast({ title: "reCAPTCHA non initialisé. Veuillez recharger la page.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const recaptchaToken = await executeRecaptcha("bootcamp_register");

            await registrationService.create({
                bootcampId:    bootcamp.id,
                bootcampTitle: bootcamp.title,
                sessionId:     session?.id ?? null,
                promoCode:     form.promoCode.trim() || null,
                firstName:     form.firstName.trim(),
                lastName:      form.lastName.trim(),
                email:         form.email.trim(),
                phone:         form.phone.trim() || null,
                country:       form.country,
                profile:       form.profile as ProfileType,
                school:        form.profile === "STUDENT"       ? form.school.trim()   : null,
                company:       form.profile === "PROFESSIONAL"  ? form.company.trim()  : (form.company.trim() || null),
                position:      form.profile === "PROFESSIONAL"  ? form.position.trim() : (form.position.trim() || null),
                message:       form.message.trim() || null,
                recaptchaToken,
            });

            setSubmitted(true);
        } catch (err: unknown) {
            const status     = (err as { status?: number })?.status;
            const apiMessage = (err as { message?: string })?.message ?? "";

            if (status === 429) {
                toast({ title: "Trop de tentatives. Veuillez réessayer dans une heure.", variant: "destructive" });
            } else if (status === 403) {
                toast({ title: "Vérification anti-bot échouée. Veuillez réessayer.", variant: "destructive" });
            } else {
                toast({ title: apiMessage || "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
                    <div>
                        <h3 className="font-heading font-bold text-lg text-card-foreground">
                            Réserver ma place
                        </h3>
                        <p className={cn("text-sm font-medium", accentClass)}>{bootcamp.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6">
                    {/* ── Confirmation ─────────────────────────────── */}
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <h4 className="font-heading font-bold text-xl text-foreground mb-2">
                                Inscription envoyée ! 🎉
                            </h4>
                            <p className="text-muted-foreground mb-2">
                                Nous vous contacterons dans les <strong>24 heures</strong> pour confirmer votre place.
                            </p>
                            {session && (
                                <div className="flex flex-col items-center gap-2 mb-6">
                                    <p className="text-sm text-muted-foreground">
                                        Session : <strong>{formatSessionLabel(session)}</strong>
                                    </p>
                                    <SessionAvailabilityBadge sessionId={session.id} />
                                </div>
                            )}
                            <Button onClick={onClose} variant="outline" className="w-full">Fermer</Button>
                        </div>
                    ) : (
                        <>
                            {/* ── Récap session ─────────────────────────── */}
                            {session && (
                                <div className={cn(
                                    "flex items-start gap-3 p-4 rounded-xl border mb-6",
                                    isAccent ? "bg-accent/8 border-accent/20" : "bg-primary/8 border-primary/20"
                                )}>
                                    <Calendar className={cn("h-5 w-5 flex-shrink-0 mt-0.5", accentClass)} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-foreground mb-0.5">
                                            {formatSessionLabel(session)}
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {formatDateShort(session.startDate)} → {formatDateShort(session.endDate)} · {formatSessionFormat(session.format)}
                                        </div>
                                        <SessionAvailabilityBadge sessionId={session.id} />
                                    </div>
                                </div>
                            )}

                            {/* ── Formulaire ────────────────────────────── */}
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Prénom / Nom */}
                                <div className="grid grid-cols-2 gap-3">
                                    {([ { name: "firstName", label: "Prénom *", placeholder: "Amadou" },
                                        { name: "lastName",  label: "Nom *",    placeholder: "Diallo"  } ] as const).map((f) => (
                                        <div key={f.name}>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                                            <input
                                                name={f.name}
                                                value={form[f.name]}
                                                onChange={handleFieldChange}
                                                placeholder={f.placeholder}
                                                required
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                                    <input
                                        name="email" type="email" value={form.email}
                                        onChange={handleFieldChange} placeholder="amadou@example.com" required
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                        Téléphone (WhatsApp de préférence)
                                    </label>
                                    <input
                                        name="phone" type="tel" value={form.phone}
                                        onChange={handleFieldChange} placeholder="+221 77 000 00 00"
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>

                                {/* Pays */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                        Pays de provenance *
                                    </label>
                                    <select
                                        name="country" value={form.country}
                                        onChange={handleFieldChange} required
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                                    >
                                        <option value="" disabled>Sélectionnez votre pays…</option>
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Profil */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                                        Votre profil *
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PROFILES.map((p) => {
                                            const isSelected = form.profile === p.value;
                                            return (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    onClick={() => handleProfileSelect(p.value)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all text-xs font-medium",
                                                        isSelected
                                                            ? isAccent
                                                                ? "bg-accent/10 border-accent text-accent"
                                                                : "bg-primary/10 border-primary text-primary"
                                                            : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                                                    )}
                                                >
                                                    <span className={isSelected ? accentClass : "text-muted-foreground"}>
                                                        {p.icon}
                                                    </span>
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Champs conditionnels : STUDENT */}
                                {form.profile === "STUDENT" && (
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                            École / Institution *
                                        </label>
                                        <input
                                            name="school" value={form.school}
                                            onChange={handleFieldChange}
                                            placeholder="Ex: Université Cheikh Anta Diop, ISM, SUP'DE COM..."
                                            required
                                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                )}

                                {/* Champs conditionnels : PROFESSIONAL */}
                                {form.profile === "PROFESSIONAL" && (
                                    <>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                                Organisation *
                                            </label>
                                            <input
                                                name="company" value={form.company}
                                                onChange={handleFieldChange}
                                                placeholder="Ex: Orange, Wave, Société Générale..."
                                                required
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                                Poste actuel *
                                            </label>
                                            <input
                                                name="position" value={form.position}
                                                onChange={handleFieldChange}
                                                placeholder="Ex: Comptable, Analyste, Contrôleur de gestion..."
                                                required
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Champs optionnels : ENTREPRENEUR */}
                                {form.profile === "ENTREPRENEUR" && (
                                    <>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                                Entreprise / Projet *
                                            </label>
                                            <input
                                                name="company" value={form.company}
                                                onChange={handleFieldChange}
                                                placeholder="Nom de votre entreprise ou projet"
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                                Secteur d'activité *
                                            </label>
                                            <input
                                                name="position" value={form.position}
                                                onChange={handleFieldChange}
                                                placeholder="Ex: Commerce, Tech, Agri, Finance..."
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Code promo */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                        Code parrainage / promo (optionnel)
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="promoCode" value={form.promoCode}
                                            onChange={handlePromoChange}
                                            placeholder="Ex: AMADOU10"
                                            className={cn(
                                                "w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase",
                                                promo.valid  ? "border-green-500 focus:border-green-500"
                                                    : promo.error ? "border-red-500 focus:border-red-500"
                                                        : "border-border focus:border-primary"
                                            )}
                                        />
                                        {promo.checking && <Loader2    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                                        {promo.valid && !promo.checking && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                                        {promo.error && !promo.checking && <XCircle     className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
                                    </div>
                                    {promo.valid && (
                                        <p className="text-xs text-green-600 font-semibold mt-1">
                                            ✓ {promo.valid.message ?? `Code valide — Réduction de ${promo.valid.discountPercent}%`}
                                        </p>
                                    )}
                                    {promo.error && <p className="text-xs text-red-600 mt-1">{promo.error}</p>}
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                        Message ou question
                                    </label>
                                    <textarea
                                        name="message" value={form.message}
                                        onChange={handleFieldChange}
                                        placeholder="Vos questions, votre contexte, vos attentes..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit" disabled={submitting}
                                    className={cn("w-full font-bold h-12", btnClass)}
                                >
                                    {submitting
                                        ? <Loader2 className="h-5 w-5 animate-spin" />
                                        : <> Réserver ma place <ArrowRight className="h-4 w-4 ml-2" /> </>
                                    }
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Inscription sans engagement · Confirmation sous 24h · Paiement à la validation
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
