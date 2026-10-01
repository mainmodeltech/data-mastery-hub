/**
 * Entreprises.tsx — Lot 2 (docs/design/README.md §2, screens/site/Entreprises.dc.html)
 *
 * Le formulaire "diagnostic gratuit" (champ nouveau, pas d'endpoint dédié côté
 * backend — voir README §4) est envoyé via contactService/useSendContactMessage
 * (endpoint existant) avec un sujet dédié, plutôt que mocké : la soumission
 * fonctionne réellement dès aujourd'hui.
 */
import { useState } from "react";
import { Check, Loader2, CheckCircle } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, SectionHeader } from "@/components/shared";
import { useSendContactMessage } from "@/hooks/useContacts";
import { COMPANY } from "@/config/constants";
import type { CreateContactMessageDTO } from "@/types";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

const SECTORS = ["Banque", "Assurance", "Audit", "Institutions & ONG"];

const DEPARTMENTS = [
  { name: "Direction financière", before: "Reporting manuel chaque fin de mois", after: "Tableaux de bord automatisés" },
  { name: "Audit & conformité", before: "Contrôles sur fichiers Excel dispersés", after: "Suivi centralisé et traçable" },
  { name: "Ressources humaines", before: "Indicateurs calculés à la main", after: "Dashboards RH en temps réel" },
  { name: "Équipes commerciales", before: "Pipeline suivi sur plusieurs fichiers", after: "Vue consolidée et partagée" },
];

const OFFERS = [
  {
    title: "Mise à niveau Excel",
    tagline: "Un socle solide pour toute l'équipe",
    description: "Remise à niveau collective avec test de positionnement en amont pour adapter le contenu.",
    specs: { public: "Toute l'équipe", format: "Présentiel ou hybride", duree: "2 à 3 jours" },
    features: ["Test de positionnement", "Exercices sur vos propres fichiers", "Support après formation"],
  },
  {
    title: "Power BI sur mesure",
    tagline: "Des tableaux de bord sur vos données",
    description: "Formation construite directement sur vos sources de données et vos cas d'usage métier.",
    specs: { public: "Équipes data/finance", format: "Présentiel ou distanciel", duree: "3 à 5 jours" },
    features: ["Modélisation sur vos données", "DAX et Power Query", "Dashboards livrés en fin de formation"],
  },
  {
    title: "Parcours data sur mesure",
    tagline: "Un programme multi-outils complet",
    description: "Un parcours combinant Excel, SQL, Python et Power BI selon les besoins de vos équipes.",
    specs: { public: "Profils mixtes", format: "Sur plusieurs semaines", duree: "Sur devis" },
    features: ["Programme conçu avec vous", "Suivi pédagogique dédié", "Projets réels fil rouge"],
  },
];

const METHOD_STEPS = [
  { title: "Diagnostic gratuit", description: "Un échange pour comprendre vos outils et vos besoins." },
  { title: "Programme sur vos données", description: "Un contenu construit sur vos cas d'usage réels." },
  { title: "Formation", description: "Sessions animées par nos formateurs certifiés." },
  { title: "Suivi à 30 jours", description: "Un point pour consolider les acquis." },
];

const PEOPLE_OPTIONS = ["1 à 5", "6 à 15", "16 à 50", "Plus de 50"];
const NEEDS_OPTIONS = ["Mise à niveau Excel", "Power BI sur mesure", "Parcours data sur mesure", "Je ne sais pas encore"];

export default function Entreprises() {
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendContactMessage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const message = [
      `Fonction : ${data.get("role")}`,
      `Nombre de personnes à former : ${data.get("peopleCount")}`,
      `Besoin principal : ${data.get("need")}`,
      `Contexte : ${data.get("context") || "—"}`,
    ].join("\n");

    const fullName = (data.get("name") as string).trim();
    const [firstName, ...rest] = fullName.split(" ");

    const payload: CreateContactMessageDTO = {
      firstName: firstName || fullName,
      lastName: rest.join(" ") || "",
      email: (data.get("email") as string).trim(),
      phone: (data.get("phone") as string)?.trim() || null,
      company: (data.get("company") as string)?.trim() || null,
      subject: "Diagnostic entreprise",
      message,
    };

    sendMessage.mutate(payload, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.entreprises} />

      {/* Hero */}
      <section className="bg-navy px-6 py-20 text-white lg:px-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">
              ENTREPRISES &amp; INSTITUTIONS
            </span>
            <h1 className="font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px]">
              Rendez vos équipes autonomes sur la donnée.
            </h1>
            <p className="text-[#C9D4E0]">
              Des formations Excel et Power BI construites sur vos données, avec un diagnostic gratuit en amont.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="primary" shape="pill">
                <a href="#diagnostic">Demander un diagnostic gratuit</a>
              </Button>
              <Button variant="outline" shape="pill" className="border-white text-white hover:bg-white/10">
                Télécharger la plaquette
              </Button>
            </div>
          </div>
          <div className="flex h-64 items-center justify-center rounded-hero bg-white/10 text-sm text-[#C9D4E0] lg:h-80">
            Photo — formation intra-entreprise
          </div>
        </div>
      </section>

      {/* Secteurs */}
      <section className="px-6 py-10 lg:px-20">
        <p className="text-center text-xs font-bold uppercase tracking-[1px] text-ink-secondary">
          SECTEURS ACCOMPAGNÉS
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-navy">
          {SECTORS.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </section>

      {/* Par service */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="PAR SERVICE" title="Ce qui change concrètement dans vos équipes." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS.map((d) => (
            <Card key={d.name} radius="card" className="flex flex-col gap-3 p-6">
              <p className="font-heading font-bold text-navy">{d.name}</p>
              <div>
                <p className="text-xs font-semibold uppercase text-ink-secondary">Aujourd'hui</p>
                <p className="text-sm text-ink-secondary">{d.before}</p>
              </div>
              <div className="border-t border-[#E7E0D4] pt-3">
                <p className="text-xs font-semibold uppercase text-success">Après la formation</p>
                <p className="text-sm text-ink">{d.after}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Nos offres */}
      <section className="bg-surface-sand px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="NOS OFFRES" title="Trois façons de former vos équipes." />
        <div className="mt-8 flex flex-col gap-6">
          {OFFERS.map((offer, i) => (
            <Card key={offer.title} radius="card" className="grid gap-6 p-8 lg:grid-cols-3">
              <div>
                <span className="font-heading text-2xl font-extrabold text-cta">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-1 font-heading text-lg font-bold text-navy">{offer.title}</p>
                <p className="text-sm text-ink-secondary">{offer.tagline}</p>
              </div>
              <div>
                <p className="text-sm text-ink-secondary">{offer.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="font-semibold text-navy">Public</p>
                    <p className="text-ink-secondary">{offer.specs.public}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Format</p>
                    <p className="text-ink-secondary">{offer.specs.format}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Durée</p>
                    <p className="text-ink-secondary">{offer.specs.duree}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1.5">
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-secondary">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" shape="pill">
                  <a href="#diagnostic">Demander un programme</a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Méthode */}
      <section className="bg-navy px-6 py-14 text-white lg:px-20">
        <SectionHeader eyebrow="NOTRE MÉTHODE" title="Du diagnostic au suivi à 30 jours." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD_STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-card border-t-2 border-cta-on-navy bg-white/5 p-6">
              <span className="font-heading text-2xl font-extrabold text-cta-on-navy">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-heading text-base font-bold text-white">{step.title}</p>
              <p className="text-sm text-[#C9D4E0]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Référence */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="RÉFÉRENCE" title="Ils nous ont fait confiance." />
        <Card radius="card" variant="sand" className="mt-8 grid gap-6 p-8 lg:grid-cols-3">
          <div>
            <p className="font-heading text-2xl font-extrabold text-navy">CORAF</p>
            <p className="text-sm text-ink-secondary">[Secteur] · [Taille]</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-ink-secondary">Le besoin</p>
            <p className="text-sm text-ink">[Description du besoin initial]</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-ink-secondary">Le résultat</p>
            <p className="text-sm text-ink">[Résultat mesuré après la formation]</p>
          </div>
        </Card>
      </section>

      {/* Diagnostic form */}
      <section id="diagnostic" className="grid gap-10 px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-4">
          <SectionHeader eyebrow="DIAGNOSTIC GRATUIT" title="Parlons de votre équipe." />
          <ul className="flex flex-col gap-2">
            {["Sans engagement", "Adapté à vos outils", "Facturation entreprise"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink-secondary">
                <Check className="h-4 w-4 text-success" /> {f}
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-secondary">
            {COMPANY.phone} · {COMPANY.email}
          </p>
        </div>

        <Card radius="card" className="p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="font-heading text-lg font-bold text-navy">Demande envoyée !</p>
              <p className="text-sm text-ink-secondary">Nous vous recontactons sous 48h ouvrées.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder="Awa Ndiaye" className={inputClass} aria-label="Nom et prénom" />
                <input name="role" required placeholder="DRH, DAF, manager…" className={inputClass} aria-label="Fonction" />
                <input name="company" required placeholder="Nom de l'organisation" className={inputClass} aria-label="Entreprise" />
                <select name="peopleCount" required defaultValue="" className={inputClass} aria-label="Nombre de personnes à former">
                  <option value="" disabled>Personnes à former</option>
                  {PEOPLE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <input name="email" type="email" required placeholder="vous@entreprise.sn" className={inputClass} aria-label="E-mail professionnel" />
                <input name="phone" type="tel" placeholder="+221 …" className={inputClass} aria-label="Téléphone / WhatsApp" />
              </div>
              <select name="need" required defaultValue="" className={inputClass} aria-label="Besoin principal">
                <option value="" disabled>Besoin principal</option>
                {NEEDS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <textarea
                name="context"
                rows={4}
                placeholder="Outils utilisés, difficultés, échéance…"
                className={inputClass}
                aria-label="Votre contexte"
              />
              <Button type="submit" variant="primary" shape="pill" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Demander mon diagnostic gratuit"}
              </Button>
              <p className="text-center text-xs text-ink-secondary">Nous vous recontactons sous 48h ouvrées.</p>
            </form>
          )}
        </Card>
      </section>
    </SiteLayout>
  );
}
