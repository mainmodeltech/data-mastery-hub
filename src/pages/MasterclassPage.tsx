/**
 * MasterclassPage.tsx — landing de la masterclass.
 * Tout le contenu (événement, date, programme, formateur, textes, photo) vient du backend (contenu
 * `page.masterclass`, modifiable depuis l'administration) : changer de masterclass ne demande plus de
 * déploiement. Inscription : reCAPTCHA v3 invisible (GoogleReCaptchaProvider dans main.tsx) puis
 * POST /masterclass/register avec l'identifiant de l'événement.
 */
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
    Calendar, Clock, Video, Users, CheckCircle2, ArrowRight, Star,
    BarChart3, Zap, Award, Loader2, Mail, ShieldCheck, Bell, type LucideIcon,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/useSiteContent";
import { httpClient } from "@/services/httpClient";
import { fill } from "@/lib/template";
import { PAGE_SEO, SeoHead } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, Pill, SectionHeader, ContentGate } from "@/components/shared";
import { useNextMasterclass } from "@/hooks/useMasterclasses";
import { FORMAT_LABELS, type PublicMasterclass } from "@/services/api/masterclassService";
import type { PageMasterclass, SiteCompany } from "@/types/siteContent";

/** Complète l'événement du contenu avec la masterclass publiée par l'équipe (date, durée, lieu, places) ; sans masterclass publiée, les inscriptions sont closes. */
function withLiveEvent(c: PageMasterclass, next: PublicMasterclass | null | undefined): PageMasterclass {
    if (!next) return { ...c, event: { ...c.event, registrationsClosed: true } };
    const startsAt = new Date(`${next.startsAt}Z`);   // heure du serveur (UTC), affichée en UTC comme le reste de la page
    const hours = Math.floor(next.durationMinutes / 60);
    const minutes = next.durationMinutes % 60;
    return {
        ...c,
        event: {
            ...c.event,
            id: next.code,
            startsAt: startsAt.toISOString(),
            durationLabel: `${hours} h${minutes ? ` ${minutes}` : ""}`,
            timeLabel: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(startsAt).replace(":", "h"),
            place: next.place ?? c.event.place,
            format: FORMAT_LABELS[next.format] ?? c.event.format,
            registrationsClosed: !next.registrationOpen,
        },
    };
}

const ICONS: Record<string, LucideIcon> = { chart: BarChart3, zap: Zap, award: Award };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target.getTime()]);

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

// ─── Encart « inscriptions closes » ───────────────────────────────────────────

function ClosedCard({ c, company, eventDate, eventOver }: { c: PageMasterclass; company: SiteCompany; eventDate: Date; eventOver: boolean }) {
    return (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-warning-bg">
                <Bell className="h-6 w-6 text-warning" />
            </span>
            <Pill variant="error">{c.closed.badge}</Pill>
            <h3 className="font-heading text-2xl font-extrabold leading-tight text-navy">
                {eventOver ? c.closed.titleOver : c.closed.titleClosed}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary">
                {fill(c.closed.message, { count: c.event.registeredCount, date: dateShort(eventDate) })}
            </p>
            <div className="grid w-full grid-cols-2 gap-3">
                <Button asChild variant="outline" shape="rounded">
                    <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </Button>
                <Button asChild variant="outline" shape="rounded">
                    <a href={company.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </Button>
            </div>
            <Button asChild shape="rounded" className="w-full">
                <Link to="/formations">{c.closed.formations} <ArrowRight /></Link>
            </Button>
        </div>
    );
}

// ─── Formulaire ───────────────────────────────────────────────────────────────

const fieldClass =
    "w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3 font-sans text-base text-ink outline-none focus:border-navy";
const labelClass = "text-xs font-bold uppercase tracking-[0.8px] text-ink-secondary";

function RegistrationForm({ c, eventDate }: { c: PageMasterclass; eventDate: Date }) {
    const { toast }             = useToast();
    const { executeRecaptcha }  = useGoogleReCaptcha();
    const [form, setForm]       = useState<RegistrationFormValues>(EMPTY_FORM);
    const [status, setStatus]   = useState<"idle" | "success" | "duplicate">("idle");
    const f = c.form;

    const set = (patch: Partial<RegistrationFormValues>) => setForm(prev => ({ ...prev, ...patch }));

    const mutation = useMutation({
        mutationFn: async () => {
            if (!executeRecaptcha) {
                throw new Error("reCAPTCHA non initialisé. Rechargez la page.");
            }
            const recaptchaToken = await executeRecaptcha("masterclass_register");
            try {
                return await masterclassService.register({
                    ...form,
                    masterclassId: c.event.id,
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
                <h3 className="font-heading text-xl font-extrabold text-navy">{f.successTitle}</h3>
                <p className="text-ink-secondary">{fill(f.successText, { email: form.email })}</p>
                <p className="text-sm text-ink-secondary">
                    {fill(f.successDate, { date: dateShort(eventDate), time: c.event.timeLabel })}
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
                <h3 className="font-heading text-xl font-extrabold text-navy">{f.duplicateTitle}</h3>
                <p className="text-ink-secondary">{fill(f.duplicateText, { email: form.email })}</p>
                <p className="mb-2 text-sm text-ink-secondary">{f.duplicateHint}</p>
                <button
                    type="button"
                    onClick={() => { setStatus("idle"); setForm(EMPTY_FORM); }}
                    className="text-sm font-semibold text-navy underline underline-offset-4"
                >
                    {f.duplicateReset}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="mc-first" className={labelClass}>{f.firstName}</label>
                    <input id="mc-first" value={form.firstName} onChange={e => set({ firstName: e.target.value })} className={fieldClass} placeholder={f.firstNamePlaceholder} autoComplete="given-name" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="mc-last" className={labelClass}>{f.lastName}</label>
                    <input id="mc-last" value={form.lastName} onChange={e => set({ lastName: e.target.value })} className={fieldClass} placeholder={f.lastNamePlaceholder} autoComplete="family-name" />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-mail" className={labelClass}>{f.email}</label>
                <input id="mc-mail" type="email" value={form.email} onChange={e => set({ email: e.target.value })} className={fieldClass} placeholder={f.emailPlaceholder} autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-phone" className={labelClass}>{f.phone}</label>
                <input id="mc-phone" type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })} className={fieldClass} placeholder={f.phonePlaceholder} autoComplete="tel" />
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-profile" className={labelClass}>{f.profile}</label>
                <select id="mc-profile" value={form.profile} onChange={e => set({ profile: e.target.value })} className={fieldClass}>
                    <option value="" disabled>{f.profilePlaceholder}</option>
                    {f.profiles.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="mc-company" className={labelClass}>{f.company}</label>
                <input id="mc-company" value={form.company} onChange={e => set({ company: e.target.value })} className={fieldClass} placeholder={f.companyPlaceholder} autoComplete="organization" />
            </div>
            <Button type="submit" size="lg" shape="rounded" disabled={mutation.isPending} className="mt-2 w-full">
                {mutation.isPending ? (
                    <><Loader2 className="animate-spin" /> {f.pending}</>
                ) : (
                    <>{f.submit} <ArrowRight /></>
                )}
            </Button>
            <div className="flex flex-col gap-1.5 pt-1 text-center text-xs text-ink-secondary">
                <p className="flex items-center justify-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {f.meetNote}
                </p>
                <p className="flex items-center justify-center gap-1 text-[0.6875rem]">
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
    const page = useSiteContent("page.masterclass");
    const company = useSiteContent("site.company");
    const next = useNextMasterclass();

    return (
        <SiteLayout>
            <SeoHead {...PAGE_SEO.masterclass} />
            <ContentGate
                content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
                isLoading={page.isLoading || company.isLoading || next.isLoading}
                isError={page.isError || company.isError}
                onRetry={() => { page.refetch(); company.refetch(); }}
            >
                {({ page: p, company: c }) => <MasterclassBody c={withLiveEvent(p, next.data)} company={c} />}
            </ContentGate>
        </SiteLayout>
    );
}

function MasterclassBody({ c, company }: { c: PageMasterclass; company: SiteCompany }) {
    const eventDate = new Date(c.event.startsAt);
    const countdown = useCountdown(eventDate);
    const eventOver = countdown.over;
    const closed    = c.event.registrationsClosed || eventOver;
    const dateText  = dateShort(eventDate);

    return (
        <>
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="px-6 py-14 lg:px-20 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="flex min-w-0 flex-col gap-7">
                        <div>
                            <Pill variant={closed ? "neutral" : "success"}>
                                {closed ? c.hero.badgeClosed : c.hero.badgeOpen}
                            </Pill>
                        </div>
                        <h1 className="font-heading text-[2.5rem] font-extrabold leading-[1.05] tracking-[-1.5px] text-navy md:text-[3.5rem]">
                            {c.hero.titleBefore} <span className="text-cta">{c.hero.titleAccent}</span> {c.hero.titleAfter}
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed text-ink-secondary">{c.hero.description}</p>

                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                            {[
                                { icon: Calendar, text: capitalize(dateLong(eventDate)) },
                                { icon: Clock,    text: c.event.durationLabel },
                                { icon: Video,    text: c.event.place },
                                { icon: Users,    text: c.event.format },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2 text-sm text-ink">
                                    <Icon className="h-4 w-4 shrink-0 text-cta" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>

                        {!eventOver && (
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[1px] text-ink-secondary">{c.hero.countdownLabel}</p>
                                <div className="flex items-start gap-3">
                                    <CountdownBlock value={countdown.days}    label="jours" />
                                    <CountdownBlock value={countdown.hours}   label="heures" />
                                    <CountdownBlock value={countdown.minutes} label="min" />
                                    <CountdownBlock value={countdown.seconds} label="sec" />
                                </div>
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {c.hero.points.map(point => (
                                <div key={point} className="flex items-center gap-2 text-sm text-ink">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                                    {point}
                                </div>
                            ))}
                        </div>

                        {c.hero.image && (
                            <img
                                src={c.hero.image}
                                alt={c.hero.imageAlt}
                                loading="eager"
                                className="hidden aspect-[16/9] w-full rounded-hero object-cover lg:block"
                            />
                        )}
                    </div>

                    {/* Formulaire / encart clos */}
                    <div id="inscription" className="min-w-0 lg:sticky lg:top-28">
                        <Card radius="callout" className="border border-[#E7E0D4] p-6 md:p-8">
                            {closed ? (
                                <ClosedCard c={c} company={company} eventDate={eventDate} eventOver={eventOver} />
                            ) : (
                                <>
                                    <div className="mb-6 flex flex-col items-center gap-2 text-center">
                                        <Pill variant="success">{c.form.badge}</Pill>
                                        <h2 className="font-heading text-xl font-extrabold text-navy">{c.form.title}</h2>
                                        <p className="text-sm text-ink-secondary">{c.form.subtitle}</p>
                                    </div>
                                    <RegistrationForm c={c} eventDate={eventDate} />
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </section>

            {/* ── CE QUE VOUS ALLEZ APPRENDRE ──────────────────────────────── */}
            <section className="bg-surface-sand px-6 py-16 lg:px-20 lg:py-20">
                <SectionHeader align="center" eyebrow={c.learn.eyebrow} title={c.learn.title} description={c.learn.description} />
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {c.learn.items.map(({ icon, title, description }) => {
                        const Icon = ICONS[icon] ?? BarChart3;
                        return (
                            <Card key={title} radius="card" className="flex flex-col gap-3 p-6">
                                <span className="flex h-12 w-12 items-center justify-center rounded-stat bg-info-bg">
                                    <Icon className="h-6 w-6 text-navy" />
                                </span>
                                <h3 className="font-heading text-lg font-bold text-navy">{title}</h3>
                                <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* ── PROGRAMME ────────────────────────────────────────────────── */}
            <section className="px-6 py-16 lg:px-20 lg:py-20">
                <SectionHeader
                    align="center"
                    eyebrow={c.programme.eyebrow}
                    title={c.programme.title}
                    description={`${capitalize(dateLong(eventDate))} · ${c.event.durationLabel}`}
                />
                <ol className="mx-auto mt-12 flex max-w-3xl flex-col">
                    {c.programme.items.map((item, i) => (
                        <li key={item.time} className="flex gap-5">
                            <div className="flex flex-col items-center">
                                <span className="mt-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-navy text-xs font-bold text-white">
                                    {i + 1}
                                </span>
                                {i < c.programme.items.length - 1 && <span className="my-1 w-px flex-1 bg-[#E7E0D4]" />}
                            </div>
                            <div className="min-w-0 flex-1 pb-6 pt-3">
                                <div className="mb-1 flex flex-wrap items-baseline gap-3">
                                    <span className="font-mono text-xs font-bold text-cta">{item.time}</span>
                                    <h3 className="font-heading font-bold text-navy">{item.title}</h3>
                                </div>
                                <p className="text-sm text-ink-secondary">{item.description}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ── FORMATEUR ────────────────────────────────────────────────── */}
            <section className="bg-surface-sand px-6 py-16 lg:px-20 lg:py-20">
                <div className="grid items-center gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
                    {c.speaker.photoUrl && (
                        <div className="mx-auto w-full max-w-[280px] lg:mx-0">
                            <img
                                src={c.speaker.photoUrl}
                                alt={c.speaker.name}
                                loading="lazy"
                                className="aspect-[4/5] w-full rounded-callout object-cover object-top"
                            />
                        </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-4">
                        <span className="text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.speaker.label}</span>
                        <h2 className="font-heading text-[2.125rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.75rem]">
                            {c.speaker.name}
                        </h2>
                        <p className="font-semibold text-navy">{c.speaker.role}</p>
                        <p className="text-base leading-relaxed text-ink-secondary">{c.speaker.bio}</p>
                        <div className="flex flex-wrap gap-2">
                            {c.speaker.tags.map(tag => <Pill key={tag} variant="info">{tag}</Pill>)}
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
                    <h2 className="mx-auto mb-4 max-w-2xl font-heading text-[1.875rem] font-extrabold leading-tight tracking-[-0.5px] text-white md:text-[2.5rem]">
                        {closed ? c.cta.titleClosed : c.cta.titleOpen}
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-lg text-[#D5DEE8]">
                        {closed ? c.cta.textClosed : fill(c.cta.textOpen, { date: dateText })}
                    </p>
                    <Button asChild size="lg">
                        {closed
                            ? <Link to="/formations">{c.cta.buttonClosed} <ArrowRight /></Link>
                            : <a href="#inscription">{c.cta.buttonOpen} <ArrowRight /></a>}
                    </Button>
                </div>
            </section>
        </>
    );
}
