/**
 * Partenaires.tsx — Lot 2 (docs/design/README.md §2, screens/site/Partenaires.dc.html)
 * Nouvelle page, pas de nav principale (lien uniquement en pied de page, comme la
 * référence). Formulaire "proposer une formation" envoyé via contactService
 * (endpoint existant), sujet dédié — même approche que Entreprises.tsx.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, CheckCircle } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader } from "@/components/shared";
import { useSendPartnerApplication } from "@/hooks/useSiteForms";
import { PARTNER_DOMAINS, splitName, type PartnerApplicationPayload } from "@/services/api/siteFormsService";
import { submitErrorMessage } from "@/lib/formErrors";
import { COMPANY } from "@/config/constants";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

const YOU_PROVIDE = ["Expertise et programme pédagogique", "Animation des séances", "Évaluation des apprenants", "Certifications reconnues"];
const WE_PROVIDE = ["Plateforme et supports", "Paiement et facturation", "Communication aux apprenants", "Accès à nos clients entreprises", "Suivi et attestations"];

const BENEFITS = [
  { title: "Zéro logistique", description: "Nous gérons l'inscription, le paiement et le suivi administratif." },
  { title: "Une audience existante", description: "Accédez à notre communauté d'apprenants et d'entreprises partenaires." },
  { title: "Un revenu partagé clair", description: "[x]% de reversement, paiement sous [x] jours après la session." },
  { title: "Des contrats entreprises", description: "Accès aux formations intra-entreprise vendues par Model Technologie." },
];

const METHOD_STEPS = [
  { title: "Proposition", description: "Vous soumettez votre formation via le formulaire." },
  { title: "Validation pédagogique", description: "Nous évaluons le contenu et vos références." },
  { title: "Lancement", description: "La formation est publiée sur le catalogue." },
  { title: "Session & reversement", description: "Vous animez, nous gérons le reste et vous reversons votre part." },
];

const REQUIREMENTS = [
  "Expertise démontrée dans votre domaine",
  "Pédagogie pratique, orientée cas réels",
  "Note de satisfaction ≥ [x]/5",
  "Respect des marques et agréments (PMI, Scrum.org, Microsoft…)",
  "Supports de formation à jour",
];

const DOMAINS = PARTNER_DOMAINS.map((d) => d.label);

export default function Partenaires() {
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendPartnerApplication();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));

    const payload: PartnerApplicationPayload = {
      firstName,
      lastName,
      email: text("email"),
      phone: text("phone") || undefined,
      organization: text("org") || undefined,
      domain: text("domain") as PartnerApplicationPayload["domain"],
      linkedinUrl: text("linkedin") || undefined,
      proposal: text("proposal"),
      references: text("references") || undefined,
    };

    sendMessage.mutate(payload, { onSuccess: () => setSubmitted(true) });
  };

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.partenaires} />

      {/* Hero */}
      <section className="bg-navy px-6 py-20 text-white lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">
            DEVENIR PARTENAIRE FORMATEUR
          </span>
          <h1 className="mt-3 font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px]">
            Vous avez l'expertise. Nous avons la plateforme.
          </h1>
          <p className="mt-3 text-[#C9D4E0]">
            Formateurs indépendants, cabinets ou organismes certifiés : proposez votre formation à notre communauté.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild variant="primary" shape="pill">
              <a href="#proposer">Proposer une formation</a>
            </Button>
            <Button asChild variant="outline" shape="pill" className="border-white text-white hover:bg-white/10">
              <a href="#fonctionnement">Comment ça marche</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Le principe */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="LE PRINCIPE" title="Chacun son métier." />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card radius="card" className="p-8">
            <p className="font-heading text-lg font-bold text-navy">Vous apportez</p>
            <ul className="mt-4 flex flex-col gap-2">
              {YOU_PROVIDE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          </Card>
          <Card radius="card" variant="sand" className="p-8">
            <p className="font-heading text-lg font-bold text-navy">Model Technologie apporte</p>
            <ul className="mt-4 flex flex-col gap-2">
              {WE_PROVIDE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Ce que vous y gagnez */}
      <section className="bg-surface-sand px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="CE QUE VOUS Y GAGNEZ" title="Plus de participants, moins d'administratif." />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <Card key={b.title} radius="card" className="p-6">
              <p className="font-heading font-bold text-navy">{b.title}</p>
              <p className="mt-2 text-sm text-ink-secondary">{b.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="fonctionnement" className="bg-navy px-6 py-14 text-white lg:px-20">
        <SectionHeader eyebrow="COMMENT ÇA MARCHE" title="De la proposition à la première session." />
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

      {/* Exigences + Domaines */}
      <section className="grid gap-10 px-6 py-14 lg:grid-cols-2 lg:px-20">
        <div>
          <SectionHeader eyebrow="NOS EXIGENCES" title="Un label qualité à protéger." />
          <ul className="mt-6 flex flex-col gap-2">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-ink-secondary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeader eyebrow="DOMAINES RECHERCHÉS" title="Nous cherchons des experts en…" />
          <div className="mt-6 flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <Pill key={d} variant="neutral">{d}</Pill>
            ))}
          </div>
          <Card radius="card" variant="sand" className="mt-6 p-5">
            <p className="text-sm text-ink-secondary">Déjà partenaire</p>
            <p className="font-heading font-bold text-navy">Agile Sénégal — Gestion de projet &amp; Agile</p>
            <Link to="/formations/scrum-master-certifie-psm1" className="mt-1 inline-block text-sm font-semibold text-navy hover:text-cta">
              Voir la formation PSM I →
            </Link>
          </Card>
        </div>
      </section>

      {/* Proposer une formation */}
      <section id="proposer" className="grid gap-10 px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-4">
          <SectionHeader eyebrow="PROPOSER UNE FORMATION" title="Parlons de votre formation." />
          <p className="text-sm text-ink-secondary">
            {COMPANY.phone} · {COMPANY.email}
          </p>
        </div>

        <Card radius="card" className="p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="font-heading text-lg font-bold text-navy">Candidature envoyée !</p>
              <p className="text-sm text-ink-secondary">Nous étudions chaque proposition et revenons vers vous rapidement.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder="Nom et prénom" className={inputClass} aria-label="Nom et prénom" />
                <input name="org" placeholder="Organisme (si applicable)" className={inputClass} aria-label="Organisme" />
                <input name="email" type="email" required placeholder="vous@exemple.com" className={inputClass} aria-label="E-mail" />
                <input name="phone" type="tel" placeholder="+221 …" className={inputClass} aria-label="Téléphone / WhatsApp" />
                <select name="domain" required defaultValue="" className={inputClass} aria-label="Domaine">
                  <option value="" disabled>Domaine</option>
                  {PARTNER_DOMAINS.map((d) => (
                    <option key={d.code} value={d.code}>{d.label}</option>
                  ))}
                </select>
                <input name="linkedin" type="url" placeholder="linkedin.com/in/…" className={inputClass} aria-label="Profil LinkedIn" />
              </div>
              <input name="proposal" required placeholder="Titre, public visé, durée envisagée" className={inputClass} aria-label="Formation proposée" />
              <textarea
                name="references"
                rows={4}
                placeholder="Certifications, entreprises formées, nombre de participants…"
                className={inputClass}
                aria-label="Vos références"
              />
              {sendMessage.isError && (
                <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(sendMessage.error)}</p>
              )}
              <Button type="submit" variant="primary" shape="pill" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Proposer ma formation"}
              </Button>
              <p className="text-center text-xs text-ink-secondary">
                Nous étudions chaque proposition et revenons vers vous rapidement.
              </p>
            </form>
          )}
        </Card>
      </section>
    </SiteLayout>
  );
}
