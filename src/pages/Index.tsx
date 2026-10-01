/**
 * Index.tsx — Accueil, Lot 2 (docs/design/README.md §2, screens/site/Main.dc.html)
 *
 * Reconstruction fidèle à la référence : copie, structure et ordre des sections
 * repris directement de Main.dc.html (hero, visuel+citation, bandeau preuve,
 * bloc cohorte, par métier, parcours Data & BI, nouveau domaine, coaching,
 * témoignages, certif+communauté, entreprises, FAQ+CTA). Les 4 cartes
 * "parcours" (Power BI/Excel VBA/Python/SQL) et les 3 témoignages sont le
 * contenu exact de la référence — distincts du catalogue de formations du
 * Lot 1 (granularité différente : mini-formations 4 semaines vs bootcamps
 * complets) — leurs CTA renvoient vers /formations plutôt que des slugs
 * inexistants.
 */
import { Link } from "react-router-dom";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, FaqAccordion } from "@/components/shared";
import { COMPANY } from "@/config/constants";

const PROOF_STATS = [
  { value: "30+", label: "alumni formés depuis 2023" },
  { value: "[X] %", label: "en poste ou promus en moins de 6 mois" },
  { value: "6", label: "formations en Data & BI et gestion de projet" },
  { value: "1 projet", label: "réel de votre métier par parcours" },
];

const COMPANIES = ["Wave", "UBA Sénégal", "CETUD", "Afrika Banque", "[+ logos validés]"];

const COHORT_FACTS = [
  { label: "Démarrage", value: "[date de démarrage]", mobile: true },
  { label: "Rythme", value: "[soirs / samedi] — compatible emploi", mobile: true },
  { label: "Format", value: "Présentiel Dakar ou en ligne", mobile: false },
  { label: "Prérequis", value: "Aucun pour Excel · bases Excel pour Power BI", mobile: false },
  { label: "Tarif", value: "dès 75 000 FCFA · [facilités de paiement]", mobile: true },
  { label: "Sélection", value: "un cas d'usage de votre métier", mobile: false },
];

const BY_ROLE = [
  { title: "Banque & Finance", description: "Reporting réglementaire, suivi du PNB, tableaux de bord agences.", path: "Excel avancé → Power BI" },
  { title: "Comptabilité & Audit", description: "Rapprochements, clôtures, états automatisés sans copier-coller.", path: "Excel VBA → Power BI" },
  { title: "Ressources humaines", description: "Masse salariale, absentéisme, bilan social en un clic.", path: "Excel avancé → Power BI" },
  { title: "Marketing & Commercial", description: "Pipeline, performance des ventes, segmentation clients.", path: "Power BI → Python / SQL" },
];

const PARCOURS = [
  { badge: "LE PLUS DEMANDÉ", title: "Power BI", description: "Des tableaux de bord interactifs et fiables : Power Query, modélisation, DAX, publication. Prépare au PL-300.", duration: "4 semaines", price: "150 000 FCFA", highlight: true },
  { badge: "AUTOMATISATION", title: "Excel VBA", description: "Automatisez vos tâches répétitives avec les macros : imports, mises en forme, rapports générés en un clic.", duration: "4 semaines", price: "75 000 FCFA", highlight: false },
  { badge: "ANALYSE", title: "Python pour l'analyse", description: "pandas, visualisation et projets réels : traitez des volumes qu'Excel ne supporte plus.", duration: "4 semaines", price: "75 000 FCFA", highlight: false },
  { badge: "DONNÉES", title: "SQL", description: "Interrogez directement les bases de votre entreprise au lieu d'attendre les extractions.", duration: "4 semaines", price: "75 000 FCFA", highlight: false },
];

const TESTIMONIALS = [
  { initials: "DL", avatarBg: "bg-navy", content: "Ce bootcamp ne m'a pas seulement formée, il m'a ouvert des portes : je suis passée de l'apprentissage à l'exercice concret du métier.", name: "Lysiane Nawaal Diawara", role: "Data analyst · CETUD" },
  { initials: "GS", avatarBg: "bg-cta", content: "Je n'avais aucune notion de code. Aujourd'hui ça me sert à chaque instant de mon travail.", name: "Fatima Gounougo Sohmon", role: "Assistante juridique · Afrika Banque" },
  { initials: "LC", avatarBg: "bg-success", content: "Une réelle compréhension de l'analyse et du traitement des données, et une meilleure visibilité sur les opportunités.", name: "Lamine Chaibou", role: "Data Analyst · UBA Sénégal" },
];

const ENTERPRISE_OFFERS = [
  { eyebrow: "MISE À NIVEAU EXCEL", title: "Un socle Excel commun pour toute l'entreprise", description: "Débutant, intermédiaire, avancé : chaque collaborateur au bon palier, après un test de positionnement." },
  { eyebrow: "POWER BI SUR MESURE", title: "Du tableur au tableau de bord interactif", description: "Modélisation, DAX, publication et gouvernance, sur vos propres rapports." },
  { eyebrow: "PARCOURS DATA SUR MESURE", title: "Toute la chaîne : collecte, nettoyage, analyse, restitution", description: "Adapté aux outils déjà en place, avec un projet réel de votre équipe comme fil rouge." },
];

const FOR_WHOM = ["Directions financières", "Audit & conformité", "RH", "Équipes commerciales", "Institutions & ONG"];

const FAQ_ITEMS = [
  { question: "Je travaille à temps plein, est-ce compatible ?", answer: "Oui — les cohortes se déroulent le soir et le samedi, pensées pour les professionnels en poste." },
  { question: "Quel parcours choisir selon mon niveau ?", answer: "Chaque formation précise son niveau de prérequis. En cas de doute, faites le quiz d'orientation ou écrivez-nous." },
  { question: "Mon employeur peut-il financer la formation ?", answer: "Oui, nous émettons une facture ou un bon de commande entreprise sur demande." },
  { question: "Paiement : Wave, Orange Money, virement ?", answer: "Les trois sont acceptés, avec des facilités de paiement possibles selon le parcours." },
];

export default function Index() {
  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.home} />

      {/* Hero */}
      <section className="flex flex-col items-center gap-7 px-6 pb-14 pt-16 text-center lg:px-40 lg:pt-24">
        <span className="flex items-center gap-2.5 rounded-pill border border-[#E7E0D4] bg-white px-4 py-2 font-sans text-sm text-[#3E4A5C]">
          <span className="h-2 w-2 rounded-pill bg-success" />
          Prochaine cohorte — candidatures ouvertes · Dakar &amp; en ligne
        </span>
        {/* Copie mobile dédiée (plus courte, cf. Mobile.dc.html) */}
        <h1 className="max-w-4xl font-heading text-[40px] font-extrabold leading-[1] tracking-[-1.2px] text-navy sm:hidden">
          La data au service de <span className="text-cta">votre métier.</span>
        </h1>
        <p className="max-w-2xl text-lg text-ink-secondary sm:hidden">
          Banquiers, comptables, RH, commerciaux : maîtrisez Excel, Power BI et Python sur vos propres cas.
        </p>
        {/* Copie desktop (Main.dc.html) */}
        <h1 className="hidden max-w-4xl font-heading text-[clamp(44px,6vw,84px)] font-extrabold leading-[0.98] tracking-[-2.5px] text-navy sm:block">
          Des compétences concrètes pour <span className="text-cta">votre métier.</span>
        </h1>
        <p className="hidden max-w-2xl text-xl text-ink-secondary sm:block">
          Data, Power BI, gestion de projet : des formations courtes, sur vos propres cas, pour les banquiers, comptables, RH et managers en poste.
        </p>
        <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          <Button asChild variant="primary" shape="pill" size="lg">
            <a href="#cohorte">Rejoindre la prochaine cohorte</a>
          </Button>
          <Button asChild variant="outline" shape="pill" size="lg">
            <Link to="/entreprises">Former mon équipe</Link>
          </Button>
        </div>
        <Link to="/orientation" className="text-sm text-ink-secondary underline">
          Pas sûr du parcours ? Faites le quiz en 5 questions
        </Link>
      </section>

      {/* Visuel + citation */}
      <section className="px-5 pb-16 sm:px-6 lg:pb-24 lg:px-20">
        <div className="relative flex h-[240px] items-end overflow-hidden rounded-hero bg-navy sm:h-[320px] lg:h-[520px]">
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm tracking-wide text-[#9FB3C8]">
            [ PHOTO RÉELLE — session de cohorte à Dakar, apprenants au travail sur Power BI ]
          </div>
          <Card radius="card" className="relative m-4 flex max-w-xl flex-col gap-2 p-5 sm:m-6 sm:gap-3 sm:p-7">
            <p className="font-heading text-lg font-bold leading-tight text-navy sm:text-2xl">
              « Mon reporting mensuel prenait 2 jours. Maintenant 2 heures. »
            </p>
            <p className="text-sm text-ink-secondary">
              Emmanuel Bouadi — Data Analyst, Wave<span className="hidden sm:inline"> · alumni Power BI</span>
            </p>
          </Card>
        </div>
      </section>

      {/* Bandeau preuve */}
      <section className="px-5 pb-16 sm:px-6 lg:pb-24 lg:px-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden border-y border-[#E7E0D4] bg-[#E7E0D4] lg:grid-cols-4">
          {PROOF_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-1.5 bg-site-bg p-5 sm:p-7 ${i >= 2 ? "hidden lg:flex" : ""}`}
            >
              <span className="font-heading text-[34px] font-extrabold text-navy lg:text-[52px]">{s.value}</span>
              <span className="text-sm text-ink-secondary">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10 pt-7">
          <span className="text-xs font-semibold uppercase tracking-[1.5px] text-ink-secondary">
            NOS ALUMNI TRAVAILLENT CHEZ
          </span>
          {COMPANIES.map((c) => (
            <span key={c} className="text-lg font-bold text-[#8A93A0]">{c}</span>
          ))}
        </div>
      </section>

      {/* Cohorte */}
      <section id="cohorte" className="px-6 pb-28 lg:px-20">
        <Card radius="hero" className="grid gap-16 p-8 lg:grid-cols-2 lg:p-16">
          <div className="flex flex-col gap-5">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
              PROCHAINE COHORTE · CANDIDATURES OUVERTES
            </span>
            <h2 className="font-heading text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.02] tracking-[-1.5px] text-navy">
              [15] places par parcours. Vos données, vos cas.
            </h2>
            <p className="text-lg text-ink-secondary">
              4 semaines, en petit groupe, avec un formateur qui pratique en entreprise. Vous arrivez avec un problème
              de votre travail — vous repartez avec le tableau de bord ou l'automatisation qui le règle.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Button asChild variant="primary" shape="pill" size="lg" className="w-full sm:w-auto">
                <Link to="/formations">Candidater</Link>
              </Button>
              <Button asChild variant="outline" shape="pill" size="lg" className="hidden border-transparent sm:inline-flex">
                <Link to="/formations">Comparer les parcours →</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col border-t border-[#E7E0D4]">
            {COHORT_FACTS.map((f) => (
              <div
                key={f.label}
                className={`flex justify-between gap-4 border-b border-[#E7E0D4] py-5 text-base last:border-b-0 ${f.mobile ? "" : "hidden sm:flex"}`}
              >
                <span className="text-ink-secondary">{f.label}</span>
                <span className="text-right font-semibold text-navy">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Par métier */}
      <section className="flex flex-col gap-10 px-6 pb-28 lg:px-20">
        <div className="flex max-w-3xl flex-col gap-3.5">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">PAR MÉTIER</span>
          <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
            Commencez par ce qui vous fait perdre du temps.
          </h2>
        </div>
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BY_ROLE.map((r) => (
            <Link key={r.title} to="/formations">
              <Card radius="card" className="flex h-full flex-row items-center justify-between gap-3 p-5 sm:flex-col sm:items-stretch sm:justify-start sm:gap-3.5 sm:p-7">
                <span className="font-heading text-lg font-bold text-navy sm:text-2xl">{r.title}</span>
                <span className="hidden text-base text-ink-secondary sm:block">{r.description}</span>
                <span className="shrink-0 text-right text-sm font-semibold text-cta sm:mt-auto sm:text-left">{r.path}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Parcours Data & BI */}
      <section className="flex flex-col gap-10 px-6 pb-28 lg:px-20">
        <div className="flex items-end justify-between gap-6">
          <div className="flex max-w-xl flex-col gap-3.5">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
              DATA &amp; BI — NOTRE SPÉCIALITÉ
            </span>
            <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
              4 semaines. Un livrable concret à la fin.
            </h2>
          </div>
          <Link to="/formations" className="shrink-0 font-sans text-sm font-semibold text-navy hover:text-cta">
            Voir le catalogue complet →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PARCOURS.map((p) => (
            <Card
              key={p.title}
              radius="card"
              variant={p.highlight ? "navy" : "default"}
              className="flex flex-col gap-4 p-7"
            >
              <span
                className={
                  p.highlight
                    ? "w-fit rounded-pill bg-white px-2.5 py-1.5 font-sans text-xs font-bold tracking-[1px] text-navy"
                    : "w-fit rounded-pill bg-surface-sand px-2.5 py-1.5 font-sans text-xs font-bold tracking-[1px] text-ink-secondary"
                }
              >
                {p.badge}
              </span>
              <h3 className={p.highlight ? "font-heading text-[28px] font-bold text-white" : "font-heading text-[28px] font-bold text-navy"}>
                {p.title}
              </h3>
              <p className={p.highlight ? "text-base text-[#D5DEE8]" : "text-base text-ink-secondary"}>{p.description}</p>
              <div
                className={
                  p.highlight
                    ? "mt-auto flex justify-between border-t border-navy-medium pt-4 text-sm text-white"
                    : "mt-auto flex justify-between border-t border-[#E7E0D4] pt-4 text-sm text-ink"
                }
              >
                <span>{p.duration}</span>
                <span className="font-bold">{p.price}</span>
              </div>
              <Button asChild variant={p.highlight ? "navy" : "outline"} shape="pill" className={p.highlight ? "bg-white text-navy hover:bg-white/90" : undefined}>
                <Link to="/formations">Voir le programme</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Nouveau domaine */}
      <section className="px-6 pb-28 lg:px-20">
        <Card radius="hero" className="grid items-center gap-10 p-10 lg:grid-cols-3 lg:p-14">
          <div className="flex flex-col gap-3.5 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Pill variant="error">NOUVEAU</Pill>
              <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
                GESTION DE PROJET &amp; AGILE
              </span>
            </div>
            <h2 className="font-heading text-[clamp(26px,3vw,40px)] font-extrabold leading-tight tracking-[-1px] text-navy">
              Préparez PSM I ou CAPM avec nos partenaires experts.
            </h2>
            <p className="text-lg text-ink-secondary">
              Des formations dispensées par [Partenaire], avec l'inscription, le paiement et le suivi assurés par Model Technologie.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="navy" shape="pill">
              <Link to="/formations">Voir les formations</Link>
            </Button>
            <Link to="/partenaires" className="text-center text-sm font-semibold text-navy hover:text-cta">
              Vous êtes formateur ? Devenez partenaire →
            </Link>
          </div>
        </Card>
      </section>

      {/* Coaching */}
      <section id="coaching" className="px-6 pb-28 lg:px-20">
        <Card radius="hero" variant="sand" className="flex flex-col items-center gap-8 p-10 text-center lg:flex-row lg:justify-between lg:p-16 lg:text-left">
          <div className="flex max-w-xl flex-col gap-4">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">COACHING INDIVIDUEL</span>
            <h2 className="font-heading text-[clamp(26px,3.5vw,44px)] font-extrabold leading-tight tracking-[-1px] text-navy">
              Pas de cohorte à la bonne date ? Avancez en 1:1.
            </h2>
            <p className="text-lg text-ink-secondary">
              Séances Excel avancé ou Power BI, sur votre fichier, à votre rythme. 3 places par semaine seulement.
            </p>
          </div>
          <div className="flex min-w-[260px] flex-col gap-3">
            <Button asChild variant="navy" shape="pill" size="lg">
              <Link to="/coaching">Réserver un créneau</Link>
            </Button>
            <span className="text-center text-sm text-ink-secondary">[tarif / séance ou pack]</span>
          </div>
        </Card>
      </section>

      {/* Témoignages */}
      <section id="alumni" className="flex flex-col gap-10 px-6 pb-28 lg:px-20">
        <div className="flex items-end justify-between gap-6">
          <div className="flex max-w-xl flex-col gap-3.5">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">ILS L'ONT FAIT</span>
            <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
              Des résultats, pas des promesses.
            </h2>
          </div>
          <Link to="/alumni" className="shrink-0 font-sans text-sm font-semibold text-navy hover:text-cta">
            Tous les parcours alumni →
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} radius="card" className="flex flex-col gap-6 p-8">
              <blockquote className="font-sans text-lg leading-relaxed text-ink">« {t.content} »</blockquote>
              <figcaption className="mt-auto flex items-center gap-3.5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-pill font-bold text-white ${t.avatarBg}`}>
                  {t.initials}
                </span>
                <span className="flex flex-col">
                  <span className="font-bold text-navy">{t.name}</span>
                  <span className="text-sm text-ink-secondary">{t.role}</span>
                </span>
              </figcaption>
            </Card>
          ))}
        </div>
      </section>

      {/* Certif + Communauté */}
      <section className="grid gap-5 px-6 pb-28 lg:grid-cols-2 lg:px-20">
        <Card radius="callout" className="flex flex-col gap-3.5 p-10">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">CERTIFICATION</span>
          <h3 className="font-heading text-[32px] font-bold leading-tight text-navy">
            Un certificat vérifiable, à afficher sur LinkedIn.
          </h3>
          <p className="text-lg text-ink-secondary">
            Délivré après validation du projet final. Préparation à la certification Microsoft PL-300 pour le parcours Power BI.
          </p>
        </Card>
        <Card radius="callout" className="flex flex-col gap-3.5 p-10">
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">COMMUNAUTÉ</span>
          <h3 className="font-heading text-[32px] font-bold leading-tight text-navy">
            Le réseau alumni, après la formation.
          </h3>
          <p className="text-lg text-ink-secondary">
            Entraide, offres d'emploi data et [ateliers] entre anciens de toutes les cohortes.
          </p>
        </Card>
      </section>

      {/* Entreprises */}
      <section id="entreprises" className="flex flex-col gap-12 bg-navy px-6 py-28 text-white lg:px-20">
        <div className="flex flex-wrap items-end justify-between gap-12">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">ENTREPRISES</span>
            <h2 className="font-heading text-[clamp(28px,4vw,56px)] font-extrabold leading-[1.02] tracking-[-1.5px]">
              Rendez vos équipes autonomes sur la donnée.
            </h2>
            <p className="text-lg text-[#D5DEE8]">
              Un diagnostic gratuit, puis un programme construit sur vos fichiers et vos outils. En présentiel dans vos locaux ou à distance.
            </p>
          </div>
          <Button asChild variant="primary" shape="pill" size="lg" className="shrink-0 bg-white text-navy hover:bg-white/90">
            <Link to="/entreprises">Demander un diagnostic gratuit</Link>
          </Button>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {ENTERPRISE_OFFERS.map((o) => (
            <div key={o.eyebrow} className="flex flex-col gap-3.5 rounded-card bg-navy-medium p-8">
              <span className="text-xs font-bold uppercase tracking-[1px] text-cta-on-navy">{o.eyebrow}</span>
              <h3 className="font-heading text-[26px] font-bold leading-snug">{o.title}</h3>
              <p className="text-base text-[#D5DEE8]">{o.description}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-10 border-t border-navy-medium pt-8 text-base text-[#D5DEE8]">
          <span className="font-bold text-white">Pour qui :</span>
          {FOR_WHOM.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      </section>

      {/* FAQ + CTA */}
      <section id="contact" className="grid gap-20 px-6 py-28 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-5">
          <h2 className="font-heading text-[clamp(28px,4vw,52px)] font-extrabold leading-tight tracking-[-1.5px] text-navy">
            Prêt à gagner des heures chaque semaine ?
          </h2>
          <p className="text-lg text-ink-secondary">
            Candidatez à la prochaine cohorte ou écrivez-nous sur WhatsApp : réponse sous 24h.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Button asChild variant="primary" shape="pill" size="lg">
              <Link to="/formations">Candidater</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg">
              <a href={COMPANY.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
            </Button>
          </div>
        </div>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>
    </SiteLayout>
  );
}
