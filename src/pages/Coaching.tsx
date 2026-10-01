/**
 * Coaching.tsx — Lot 2 (docs/design/README.md §2, screens/site/Coaching.dc.html)
 * Page neuve, pas de données backend dédiées. Le bouton "Réserver" envoie vers le
 * formulaire de contact (sujet pré-rempli), faute d'un flux de réservation dédié.
 */
import { Link } from "react-router-dom";
import { Check, Linkedin } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader, FaqAccordion } from "@/components/shared";
import { COMPANY } from "@/config/constants";

const SLOTS: { day: string; time: string; available: boolean }[] = [
  { day: "Lun", time: "18h", available: true },
  { day: "Mar", time: "18h", available: false },
  { day: "Mer", time: "20h", available: true },
  { day: "Jeu", time: "18h", available: true },
  { day: "Sam", time: "10h", available: true },
  { day: "Sam", time: "14h", available: false },
];

const WHO_FOR = [
  { title: "Un rapport à livrer vite", description: "Vous avez un fichier urgent et pas le temps d'attendre une cohorte." },
  { title: "Aucune cohorte à la bonne date", description: "Les prochaines sessions ne correspondent pas à votre calendrier." },
  { title: "Un blocage précis", description: "Vous êtes bloqué sur un point technique précis, pas besoin d'un programme complet." },
];

const PRICING_TIERS = [
  {
    name: "Séance déblocage",
    sessions: "1 séance",
    price: "[prix] FCFA",
    features: ["1h30 en visio ou à Dakar", "Sur votre propre fichier", "Support écrit après la séance"],
    highlight: false,
  },
  {
    name: "Pack Progression",
    sessions: "5 séances",
    price: "[prix] FCFA",
    features: ["1h30 par séance", "Support WhatsApp entre les séances", "Plan personnalisé", "Certificat de suivi"],
    highlight: true,
  },
  {
    name: "Accompagnement projet",
    sessions: "10 séances",
    price: "[prix] FCFA",
    features: ["Suivi d'un projet complet", "Préparation PL-300 possible", "Support WhatsApp illimité"],
    highlight: false,
  },
];

const PROCESS_STEPS = [
  { title: "Appel diagnostic offert", description: "20 minutes pour cerner votre besoin." },
  { title: "Plan sur mesure", description: "Un programme de séances adapté à votre objectif." },
  { title: "Séances en visio ou à Dakar", description: "1h30 par séance, sur votre propre fichier." },
  { title: "Livrable et support", description: "Un fichier fonctionnel et un support écrit." },
];

const FAQ_ITEMS = [
  { question: "Dois-je préparer quelque chose avant la séance ?", answer: "Envoyez-nous votre fichier et une description du besoin au moins 24h avant." },
  { question: "Mes données sont-elles confidentielles ?", answer: "Oui, vos fichiers ne sont utilisés que pour la séance et ne sont jamais partagés." },
  { question: "Puis-je reporter une séance ?", answer: "Oui, avec au moins 24h de préavis, sans frais." },
  { question: "Le coaching prépare-t-il à la certification PL-300 ?", answer: "Oui, le pack Accompagnement projet peut inclure une préparation ciblée PL-300." },
];

export default function Coaching() {
  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.coaching} />

      {/* Hero */}
      <section className="grid gap-10 px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-5">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
            COACHING INDIVIDUEL · EXCEL &amp; POWER BI
          </span>
          <h1 className="font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
            Votre fichier. Votre rythme. Un coach.
          </h1>
          <p className="text-ink-secondary">
            Un accompagnement 1:1 sur vos propres données, sans attendre la prochaine cohorte.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="primary" shape="pill">
              <Link to="/contact?sujet=coaching">Réserver un appel diagnostic</Link>
            </Button>
            <Button asChild variant="outline" shape="pill">
              <a href="#formules">Voir les formules</a>
            </Button>
          </div>
          <p className="text-xs text-ink-secondary">Appel de 20 minutes offert</p>
        </div>

        <Card radius="callout" shadow className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-navy">Créneaux cette semaine</span>
            <Pill variant="info">3 places / semaine</Pill>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map((s) => (
              <button
                key={`${s.day}-${s.time}`}
                type="button"
                disabled={!s.available}
                className={
                  s.available
                    ? "rounded-card border border-navy px-3 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white"
                    : "rounded-card border border-[#E7E0D4] px-3 py-2 text-sm text-ink-secondary line-through"
                }
              >
                {s.day} {s.time}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#E7E0D4] pt-4 text-xs text-ink-secondary">
            <span>Visio ou présentiel à Dakar</span>
            <span>1h30 par séance</span>
          </div>
        </Card>
      </section>

      {/* Pour qui */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="POUR QUI" title="Le coaching est fait pour vous si…" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {WHO_FOR.map((item) => (
            <Card key={item.title} radius="card" className="p-6">
              <p className="font-heading font-bold text-navy">{item.title}</p>
              <p className="mt-2 text-sm text-ink-secondary">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Formules */}
      <section id="formules" className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="FORMULES" title="Choisissez votre formule." />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.name}
              radius="callout"
              variant={tier.highlight ? "navy" : "default"}
              shadow={tier.highlight}
              className="flex flex-col gap-4 p-8"
            >
              {tier.highlight && <Pill variant="success">RECOMMANDÉ</Pill>}
              <div>
                <p className={tier.highlight ? "font-heading text-lg font-bold text-white" : "font-heading text-lg font-bold text-navy"}>
                  {tier.name}
                </p>
                <p className={tier.highlight ? "text-sm text-cta-on-navy" : "text-sm text-ink-secondary"}>{tier.sessions}</p>
              </div>
              <p className={tier.highlight ? "font-heading text-2xl font-extrabold text-white" : "font-heading text-2xl font-extrabold text-navy"}>
                {tier.price}
              </p>
              <ul className="flex flex-col gap-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={tier.highlight ? "mt-0.5 h-4 w-4 shrink-0 text-cta-on-navy" : "mt-0.5 h-4 w-4 shrink-0 text-success"} />
                    <span className={tier.highlight ? "text-[#C9D4E0]" : "text-ink-secondary"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={tier.highlight ? "navy" : "outline"}
                shape="pill"
                className={tier.highlight ? "bg-white text-navy hover:bg-white/90" : undefined}
              >
                <Link to="/contact?sujet=coaching">Choisir cette formule</Link>
              </Button>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink-secondary">
          Paiement Wave, Orange Money ou virement · Facturation entreprise possible.
        </p>
      </section>

      {/* Déroulé */}
      <section className="bg-surface-sand px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="DÉROULÉ" title="Comment ça marche." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-card border-t-2 border-cta bg-white p-6">
              <span className="font-heading text-2xl font-extrabold text-cta">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-heading text-base font-bold text-navy">{step.title}</p>
              <p className="text-sm text-ink-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coach + testimonial */}
      <section className="grid gap-6 px-6 py-14 lg:grid-cols-2 lg:px-20">
        <Card radius="card" className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-pill bg-surface-sand font-heading text-2xl font-extrabold text-navy">
            MT
          </span>
          <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">VOTRE COACH</span>
          <p className="font-heading text-lg font-bold text-navy">[Nom du coach]</p>
          <p className="text-sm text-ink-secondary">
            Formateur Power BI certifié, accompagne des professionnels sur leurs projets data depuis plusieurs années.
          </p>
          <a href={COMPANY.social.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-navy hover:text-cta">
            <Linkedin className="h-4 w-4" /> Profil LinkedIn
          </a>
        </Card>
        <Card radius="card" variant="sand" className="flex flex-col justify-center gap-4 p-8">
          <p className="font-heading text-lg text-navy">« [Témoignage d'un participant au coaching individuel] »</p>
          <p className="text-sm font-semibold text-ink-secondary">— [Nom], [Poste] chez [Entreprise]</p>
        </Card>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[1fr,2fr]">
          <div>
            <SectionHeader eyebrow="AVANT DE RÉSERVER" title="Vos questions" />
            <Button asChild variant="primary" shape="pill" className="mt-6">
              <Link to="/contact?sujet=coaching">Réserver mon appel</Link>
            </Button>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </SiteLayout>
  );
}
