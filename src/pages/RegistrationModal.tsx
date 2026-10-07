/**
 * RegistrationModal.tsx
 * Modale d'inscription à une session de bootcamp, sur le design system
 * (tokens navy/cta, champs arrondis, boutons pilule).
 *
 * - Champ "Pays de provenance" (select)
 * - Champ "Profil" (STUDENT | PROFESSIONAL | ENTREPRENEUR) avec boutons radio stylisés
 * - Logique conditionnelle : school obligatoire si STUDENT ; company + position obligatoires si PROFESSIONAL
 * - reCAPTCHA v3 invisible via useGoogleReCaptcha (même pattern que la masterclass)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Button } from "@/components/shared/Button";
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
import type { StaticEnrichment } from "@/config/bootcamps.config";

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

// ─── Styles partagés ──────────────────────────────────────────────────────────

const fieldClass =
    "w-full rounded-xl border border-[#D6CEC0] bg-white px-3.5 py-3 font-sans text-sm text-ink outline-none transition-colors focus:border-navy";
const labelClass = "mb-1.5 block font-sans text-xs font-semibold text-ink";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RegistrationModalProps {
    bootcamp: Bootcamp;
    session: BootcampSession | null;
    /** Conservé pour compatibilité des appelants : le design unifié n'utilise plus la couleur par catégorie. */
    staticData?: StaticEnrichment;
    onClose: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function RegistrationModal({ bootcamp, session, onClose }: RegistrationModalProps) {
    const { toast }           = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [form, setForm]           = useState<FormValues>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const promo                       = usePromoCode();

    // Hook appelé inconditionnellement (règle des Hooks React)
    const sessionId = session?.id ?? "";
    const { data: availabilityRaw } = useSessionAvailability(sessionId);
    void availabilityRaw; // évite le warning "unused variable"

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

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
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm" onClick={onClose} />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="registration-title"
                className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] border border-[#E7E0D4] bg-white shadow-[0_20px_40px_rgba(26,58,91,0.18)] sm:rounded-callout"
            >

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7E0D4] bg-white px-6 py-5">
                    <div>
                        <h3 id="registration-title" className="font-heading text-xl font-extrabold text-navy">
                            Réserver ma place
                        </h3>
                        <p className="text-sm font-medium text-cta">{bootcamp.title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="flex h-10 w-10 items-center justify-center rounded-pill bg-app-bg text-navy transition-colors hover:bg-surface-sand"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6">
                    {/* ── Confirmation ─────────────────────────────── */}
                    {submitted ? (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-pill bg-success-bg">
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                            <h4 className="mb-2 font-heading text-xl font-extrabold text-navy">
                                Inscription envoyée !
                            </h4>
                            <p className="mb-2 text-ink-secondary">
                                Nous vous contacterons dans les <strong className="text-ink">24 heures</strong> pour confirmer votre place.
                            </p>
                            {session && (
                                <div className="mb-6 flex flex-col items-center gap-2">
                                    <p className="text-sm text-ink-secondary">
                                        Session : <strong className="text-ink">{formatSessionLabel(session)}</strong>
                                    </p>
                                    <SessionAvailabilityBadge sessionId={session.id} />
                                </div>
                            )}
                            <Button onClick={onClose} variant="outline" shape="pill" className="w-full">Fermer</Button>
                        </div>
                    ) : (
                        <>
                            {/* ── Récap session ─────────────────────────── */}
                            {session && (
                                <div className="mb-6 flex items-start gap-3 rounded-card border border-[#E7E0D4] bg-app-bg p-4">
                                    <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-cta" />
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-0.5 text-sm font-bold text-navy">
                                            {formatSessionLabel(session)}
                                        </div>
                                        <div className="mb-2 text-xs text-ink-secondary">
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
                                            <label htmlFor={`reg-${f.name}`} className={labelClass}>{f.label}</label>
                                            <input
                                                id={`reg-${f.name}`}
                                                name={f.name}
                                                value={form[f.name]}
                                                onChange={handleFieldChange}
                                                placeholder={f.placeholder}
                                                required
                                                className={fieldClass}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="reg-email" className={labelClass}>Email *</label>
                                    <input
                                        id="reg-email"
                                        name="email" type="email" value={form.email}
                                        onChange={handleFieldChange} placeholder="amadou@example.com" required
                                        className={fieldClass}
                                    />
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label htmlFor="reg-phone" className={labelClass}>
                                        Téléphone (WhatsApp de préférence)
                                    </label>
                                    <input
                                        id="reg-phone"
                                        name="phone" type="tel" value={form.phone}
                                        onChange={handleFieldChange} placeholder="+221 77 000 00 00"
                                        className={fieldClass}
                                    />
                                </div>

                                {/* Pays */}
                                <div>
                                    <label htmlFor="reg-country" className={labelClass}>
                                        Pays de provenance *
                                    </label>
                                    <select
                                        id="reg-country"
                                        name="country" value={form.country}
                                        onChange={handleFieldChange} required
                                        className={cn(fieldClass, "appearance-none")}
                                    >
                                        <option value="" disabled>Sélectionnez votre pays…</option>
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Profil */}
                                <div role="radiogroup" aria-label="Votre profil">
                                    <span className={labelClass}>Votre profil *</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PROFILES.map((p) => {
                                            const isSelected = form.profile === p.value;
                                            return (
                                                <button
                                                    key={p.value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    onClick={() => handleProfileSelect(p.value)}
                                                    className={cn(
                                                        "flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center font-sans text-xs font-semibold transition-colors",
                                                        isSelected
                                                            ? "border-navy bg-navy text-white"
                                                            : "border-[#D6CEC0] bg-white text-ink-secondary hover:border-navy"
                                                    )}
                                                >
                                                    {p.icon}
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Champs conditionnels : STUDENT */}
                                {form.profile === "STUDENT" && (
                                    <div>
                                        <label htmlFor="reg-school" className={labelClass}>
                                            École / Institution *
                                        </label>
                                        <input
                                            id="reg-school"
                                            name="school" value={form.school}
                                            onChange={handleFieldChange}
                                            placeholder="Ex: Université Cheikh Anta Diop, ISM, SUP'DE COM..."
                                            required
                                            className={fieldClass}
                                        />
                                    </div>
                                )}

                                {/* Champs conditionnels : PROFESSIONAL */}
                                {form.profile === "PROFESSIONAL" && (
                                    <>
                                        <div>
                                            <label htmlFor="reg-company" className={labelClass}>
                                                Organisation *
                                            </label>
                                            <input
                                                id="reg-company"
                                                name="company" value={form.company}
                                                onChange={handleFieldChange}
                                                placeholder="Ex: Orange, Wave, Société Générale..."
                                                required
                                                className={fieldClass}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="reg-position" className={labelClass}>
                                                Poste actuel *
                                            </label>
                                            <input
                                                id="reg-position"
                                                name="position" value={form.position}
                                                onChange={handleFieldChange}
                                                placeholder="Ex: Comptable, Analyste, Contrôleur de gestion..."
                                                required
                                                className={fieldClass}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Champs optionnels : ENTREPRENEUR */}
                                {form.profile === "ENTREPRENEUR" && (
                                    <>
                                        <div>
                                            <label htmlFor="reg-company" className={labelClass}>
                                                Entreprise / Projet
                                            </label>
                                            <input
                                                id="reg-company"
                                                name="company" value={form.company}
                                                onChange={handleFieldChange}
                                                placeholder="Nom de votre entreprise ou projet"
                                                className={fieldClass}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="reg-position" className={labelClass}>
                                                Secteur d'activité
                                            </label>
                                            <input
                                                id="reg-position"
                                                name="position" value={form.position}
                                                onChange={handleFieldChange}
                                                placeholder="Ex: Commerce, Tech, Agri, Finance..."
                                                className={fieldClass}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Code promo */}
                                <div>
                                    <label htmlFor="reg-promo" className={labelClass}>
                                        Code parrainage / promo (optionnel)
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="reg-promo"
                                            name="promoCode" value={form.promoCode}
                                            onChange={handlePromoChange}
                                            placeholder="Ex: AMADOU10"
                                            className={cn(
                                                fieldClass,
                                                "pr-10 uppercase",
                                                promo.valid ? "border-success focus:border-success"
                                                    : promo.error ? "border-error focus:border-error"
                                                        : ""
                                            )}
                                        />
                                        {promo.checking && <Loader2    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-secondary" />}
                                        {promo.valid && !promo.checking && <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />}
                                        {promo.error && !promo.checking && <XCircle     className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-error" />}
                                    </div>
                                    {promo.valid && (
                                        <p className="mt-1 text-xs font-semibold text-success">
                                            ✓ {promo.valid.message ?? `Code valide — Réduction de ${promo.valid.discountPercent}%`}
                                        </p>
                                    )}
                                    {promo.error && <p className="mt-1 text-xs text-error">{promo.error}</p>}
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="reg-message" className={labelClass}>
                                        Message ou question
                                    </label>
                                    <textarea
                                        id="reg-message"
                                        name="message" value={form.message}
                                        onChange={handleFieldChange}
                                        placeholder="Vos questions, votre contexte, vos attentes..."
                                        rows={3}
                                        className={cn(fieldClass, "resize-none")}
                                    />
                                </div>

                                <Button type="submit" variant="primary" shape="pill" size="lg" disabled={submitting} className="w-full">
                                    {submitting
                                        ? <Loader2 className="h-5 w-5 animate-spin" />
                                        : <> Réserver ma place <ArrowRight className="h-4 w-4" /> </>
                                    }
                                </Button>
                                <p className="text-center text-xs text-ink-secondary">
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
