/**
 * Entreprises.tsx
 * Page catalogue B2B — remplace l'ancienne page Services.tsx (jamais routée,
 * contenu obsolète, appel Supabase direct).
 *
 * Contenu piloté par src/config/b2b-offers.config.ts (3 fiches produit B2B).
 * Formulaire de contact branché sur l'API via useSendContactMessage
 * (httpClient), plus de Supabase.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSendContactMessage } from "@/hooks/useContacts";
import { ReferencesSection } from "@/components/home/ReferencesSection";
import {
  ArrowRight, CheckCircle, Building2, Clock, Users2,
  MessageCircle, Sparkles, Calendar, Award, X, Loader2,
  Phone, Mail, FileText, Target, Wallet,
} from "lucide-react";
import { PAGE_SEO, SeoHead } from "@/components/SeoHead.tsx";
import { COMPANY } from "@/config/constants";
import { B2B_OFFERS, type B2BOffer } from "@/config/b2b-offers.config";
import type { CreateContactMessageDTO } from "@/types";

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ offer, onClose }: { offer: B2BOffer; onClose: () => void }) {
  const { toast } = useToast();
  const sendMessage = useSendContactMessage();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", company: "", position: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.company) return;

    const payload: CreateContactMessageDTO = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      subject: `Offre B2B : ${offer.title}`,
      message: form.message.trim() || `Demande de contact pour l'offre : ${offer.title}`,
    };

    sendMessage.mutate(payload, {
      onSuccess: () => setSubmitted(true),
      onError: () => {
        toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" });
      },
    });
  };

  const isAccent = offer.colorKey === "accent";

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-card-foreground">{offer.ctaLabel}</h3>
              <p className={cn("text-sm font-medium", isAccent ? "text-accent" : "text-primary")}>{offer.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-foreground mb-2">Message envoyé !</h4>
                  <p className="text-muted-foreground mb-6">
                    Notre équipe vous contacte dans les <strong>24 heures ouvrées</strong> pour discuter de votre projet.
                  </p>
                  <Button onClick={onClose} variant="outline" className="w-full">Fermer</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border mb-2",
                      isAccent ? "bg-accent/6 border-accent/25" : "bg-primary/6 border-primary/25",
                  )}>
                    <offer.icon className={cn("h-5 w-5 flex-shrink-0", isAccent ? "text-accent" : "text-primary")} />
                    <div className="text-sm">
                      <span className="font-semibold text-foreground">{offer.ref} · </span>
                      <span className="text-muted-foreground">{offer.positionnementPrix}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "firstName", label: "Prénom *", placeholder: "Amadou" },
                      { name: "lastName", label: "Nom *", placeholder: "Diallo" },
                    ].map((f) => (
                        <div key={f.name}>
                          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                          <input
                              name={f.name}
                              value={form[f.name as keyof typeof form]}
                              onChange={handleChange}
                              placeholder={f.placeholder}
                              required
                              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                    ))}
                  </div>
                  {[
                    { name: "email", label: "Email professionnel *", placeholder: "amadou@entreprise.com", type: "email" },
                    { name: "phone", label: "Téléphone (WhatsApp)", placeholder: "+221 77 000 00 00", type: "tel" },
                    { name: "company", label: "Entreprise *", placeholder: "Nom de votre organisation", type: "text" },
                    { name: "position", label: "Votre poste", placeholder: "DG, DRH, Responsable Data...", type: "text" },
                  ].map((f) => (
                      <div key={f.name}>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.label}</label>
                        <input
                            name={f.name}
                            type={f.type}
                            value={form[f.name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            required={f.name === "email" || f.name === "company"}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Décrivez votre besoin</label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Votre contexte, vos outils actuels, vos contraintes, votre calendrier..."
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    />
                  </div>
                  <Button
                      type="submit"
                      disabled={sendMessage.isPending}
                      className={cn(
                          "w-full font-bold h-12",
                          isAccent ? "bg-accent hover:bg-accent/90 text-white" : "bg-primary hover:bg-primary/90 text-white",
                      )}
                  >
                    {sendMessage.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <>{offer.ctaLabel} <ArrowRight className="h-4 w-4 ml-2" /></>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Réponse sous 24h ouvrées
                  </p>
                </form>
            )}
          </div>
        </div>
      </div>
  );
}

// ─── Offer Card ───────────────────────────────────────────────────────────────

function OfferCard({ offer, index, onContact }: { offer: B2BOffer; index: number; onContact: (o: B2BOffer) => void }) {
  const Icon = offer.icon;
  const isAccent = offer.colorKey === "accent";
  const isReversed = index % 2 !== 0;
  const accentText = isAccent ? "text-accent" : "text-primary";
  const accentBg = isAccent ? "bg-accent/6" : "bg-primary/6";
  const accentBorder = isAccent ? "border-accent/25" : "border-primary/25";

  return (
      <div
          id={offer.id}
          className={cn("relative rounded-3xl border-2 overflow-hidden opacity-0 animate-fade-in", accentBorder)}
          style={{ animationDelay: `${0.1 + index * 0.1}s` }}
      >
        <div className={cn(
            "absolute top-0 left-0 right-0 h-48 bg-gradient-to-b pointer-events-none",
            isAccent ? "from-accent/15 via-accent/4 to-transparent" : "from-primary/15 via-primary/4 to-transparent",
        )} />

        <div className="relative z-10 p-8 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* ── Colonne gauche : description ── */}
            <div className={cn(isReversed && "lg:order-2")}>
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-border", accentBg)}>
                  <Icon className={cn("h-7 w-7", accentText)} />
                </div>
                <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full border", accentBg, accentBorder, accentText)}>
                  {offer.ref}
                </span>
              </div>

              <h2 className="font-heading text-3xl font-bold text-foreground mb-2">{offer.title}</h2>
              <p className={cn("font-semibold text-lg mb-4", accentText)}>{offer.tagline}</p>
              <p className="text-muted-foreground leading-relaxed mb-8">{offer.objectif}</p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: Clock, text: offer.formatDuree },
                  { icon: Users2, text: offer.publicCible },
                ].map((m) => (
                    <div key={m.text} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm font-medium max-w-full">
                      <m.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="leading-snug">{m.text}</span>
                    </div>
                ))}
              </div>

              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Contenu type</div>
                <div className="space-y-2.5">
                  {offer.contenuType.map((c) => (
                      <div key={c} className="flex items-start gap-3">
                        <Target className={cn("h-4 w-4 flex-shrink-0 mt-0.5", accentText)} />
                        <span className="text-sm text-foreground leading-snug">{c}</span>
                      </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Différenciateurs</div>
                <div className="space-y-2.5">
                  {offer.differenciateurs.map((d) => (
                      <div key={d} className="flex items-start gap-2.5">
                        <Sparkles className={cn("h-4 w-4 flex-shrink-0 mt-0.5", accentText)} />
                        <span className="text-sm text-muted-foreground leading-snug">{d}</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Colonne droite : livrables + prix + CTA ── */}
            <div className={cn(isReversed && "lg:order-1")}>
              <div className={cn("rounded-2xl p-6 border mb-6", accentBg, accentBorder)}>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Livrables
                </div>
                <div className="space-y-3">
                  {offer.livrables.map((l) => (
                      <div key={l} className="flex items-start gap-3">
                        <CheckCircle className={cn("h-5 w-5 flex-shrink-0 mt-0.5", accentText)} />
                        <span className="text-sm text-foreground leading-snug">{l}</span>
                      </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-border bg-card p-6">
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" />
                    Positionnement prix
                  </div>
                  <div className="font-heading text-base font-semibold text-foreground leading-snug">
                    {offer.positionnementPrix}
                  </div>
                </div>
                <Button
                    onClick={() => onContact(offer)}
                    className={cn(
                        "w-full font-bold h-12 group mb-3",
                        isAccent ? "bg-accent hover:bg-accent/90 text-white" : "bg-primary hover:bg-primary/90 text-white",
                    )}
                >
                  {offer.ctaLabel}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a
                    href={COMPANY.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  Discussion rapide sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Entreprises = () => {
  const [contactFor, setContactFor] = useState<B2BOffer | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
      <Layout>
        <SeoHead {...PAGE_SEO.entreprises} />

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-foreground pt-20 pb-24 overflow-hidden">
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
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/6 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-sm font-medium mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <Building2 className="h-3.5 w-3.5" />
                Offre entreprises
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                Rendez vos équipes{" "}
                <span className="text-accent">autonomes sur la donnée</span>
              </h1>
              <p className="text-lg text-background/65 mb-10 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                De l'Excel au Power BI, jusqu'à la formation data sur mesure. Un diagnostic gratuit,
                un contenu construit sur vos données réelles, un livrable mesurable.
              </p>

              <div className="flex flex-wrap justify-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
                {B2B_OFFERS.map((o) => {
                  const Icon = o.icon;
                  return (
                      <button
                          key={o.id}
                          onClick={() => scrollTo(o.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/8 border border-background/15 text-background/70 hover:bg-background/15 hover:text-background text-sm font-medium transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        {o.title}
                      </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* ── OFFRES ────────────────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="space-y-10">
              {B2B_OFFERS.map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} index={index} onContact={setContactFor} />
              ))}
            </div>
          </div>
        </section>

        {/* ── ILS NOUS FONT CONFIANCE ─────────────────────────── */}
        <ReferencesSection />

        {/* ── CTA FINAL ────────────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl bg-foreground p-10 lg:p-14 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[hsl(217,45%,16%)] to-[hsl(199,89%,10%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-accent font-semibold text-sm">Besoin d'un accompagnement personnalisé ?</span>
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-background mb-4">
                    Parlons de votre projet data
                  </h2>
                  <p className="text-background/60 text-lg mb-8 max-w-xl mx-auto">
                    Diagnostic gratuit et sans engagement — notre équipe analyse votre besoin et vous propose l'offre la plus adaptée.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold group">
                      <Link to="/contact">
                        <Calendar className="h-4 w-4 mr-2" />
                        Demander mon diagnostic gratuit
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-background/20 text-background hover:bg-background/10">
                      <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 mt-8 text-background/40 text-sm">
                    {[
                      { icon: Phone, text: COMPANY.phone },
                      { icon: Mail, text: COMPANY.email },
                      { icon: Award, text: "Réponse sous 24h ouvrées" },
                    ].map((c) => (
                        <div key={c.text} className="flex items-center gap-1.5">
                          <c.icon className="h-4 w-4" />
                          {c.text}
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {contactFor && (
            <ContactModal offer={contactFor} onClose={() => setContactFor(null)} />
        )}
      </Layout>
  );
};

export default Entreprises;
