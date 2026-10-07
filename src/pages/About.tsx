/**
 * About.tsx — page « À propos » migrée sur le design system (SiteLayout, tokens navy/cta).
 * Pas d'écran de référence dans docs/design : composition construite avec les mêmes
 * primitives que les autres pages publiques ; contenu repris de l'ancienne page.
 */
import { Link } from "react-router-dom";
import { Linkedin, MessageCircle } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, Pill, SectionHeader } from "@/components/shared";
import { COMPANY } from "@/config/constants";

const STATS = [
  { value: "3", label: "ans d'existence" },
  { value: "30+", label: "alumni formés" },
  { value: "90%", label: "en poste en 3 mois" },
  { value: "02", label: "entreprises partenaires" },
];

const MISSION_VISION = [
  {
    label: "NOTRE MISSION",
    title: "Démocratiser la data en Afrique",
    content:
      "Accompagner les entreprises et professionnels africains dans leur transformation data en leur fournissant des formations de qualité internationale, ancrées dans les réalités du marché local et orientées vers l'emploi.",
  },
  {
    label: "NOTRE VISION",
    title: "La référence data francophone",
    content:
      "Devenir le premier centre de formation Data & Business Intelligence en Afrique francophone de l'Ouest, en contribuant à l'émergence d'une nouvelle génération de professionnels capables de transformer les données en décisions stratégiques.",
  },
];

const TIMELINE = [
  { year: "2023", label: "Fondation", desc: "Création de Model Technologie à Dakar, avec une première promotion de 6 apprenants." },
  { year: "2024", label: "Expansion", desc: "Lancement du bootcamp Data Analyst SQL/Python. 15+ apprenants formés. Premiers partenariats entreprises." },
  { year: "2025", label: "Maturité", desc: "30+ alumni en poste. Consolidation des acquis : structuration de l'équipe et des formateurs." },
  { year: "2026", label: "Référence régionale", desc: "Ambition : devenir la référence data en Afrique francophone de l'Ouest. Expansion prévue." },
];

const VALUES = [
  { title: "Excellence", desc: "Des contenus actualisés en permanence, calqués sur ce que les entreprises attendent vraiment de leurs analystes." },
  { title: "Pragmatisme", desc: "100% des exercices sont basés sur des données très proches de la réalité. Vous sortez avec un portfolio, pas juste un certificat." },
  { title: "Proximité", desc: "Des promotions volontairement limitées (10-20 apprenants) pour un suivi individualisé et une vraie communauté." },
  { title: "Impact mesurable", desc: "Nous mesurons notre succès au taux de placement de nos alumni et à l'impact concret sur les entreprises clientes." },
];

const TEAM = [
  {
    initials: "LM", avatarBg: "bg-navy", name: "Lionnel", role: "Fondateur & Directeur",
    desc: "Expert en data analytics avec plus de 10 ans d'expérience en banque et conseil en transformation digitale.",
    linkedin: "https://www.linkedin.com/in/lionnel-code/", tags: ["Power BI", "Stratégie", "Banque & Finance"],
  },
  {
    initials: "PK", avatarBg: "bg-cta", name: "Primaël KOUADIO", role: "Responsable Administratif & Financier",
    desc: "Garant de la structure opérationnelle et financière. Pilote la croissance et les partenariats stratégiques.",
    linkedin: "https://www.linkedin.com/in/attowla-prima%C3%ABl-armand-othniel-kouadio-515261212/", tags: ["Finance", "Administration", "Partenariats"],
  },
  {
    initials: "ZT", avatarBg: "bg-success", name: "Zeinab TRAORÉ", role: "Responsable Marketing & Communication",
    desc: "Architecte de la présence digitale de Model Technologie. Pilote la communauté alumni et les partenariats.",
    linkedin: "https://www.linkedin.com/in/ze%C3%AFnab-traore-b46a34249/", tags: ["Marketing Digital", "Community", "Contenu"],
  },
  {
    initials: "CZ", avatarBg: "bg-navy-medium", name: "Cédric ZAGBA", role: "Formateur Power BI & Excel",
    desc: "Formateur principal du bootcamp Power BI avec une approche ultra-pratique.",
    linkedin: "https://www.linkedin.com/in/aboubacar-gohoun-c%C3%A9dric-zagba-89219616a/", tags: ["Power BI", "DAX", "Excel Avancé"],
  },
  {
    initials: "MG", avatarBg: "bg-warning", name: "Mardochée K. GBANBAN", role: "Formateur SQL & Python",
    desc: "Data Analyst senior avec expérience en fintech. Formateur principal du bootcamp Data Analyst.",
    linkedin: "https://www.linkedin.com/in/mardocheekg/", tags: ["Python", "SQL", "Data Engineering"],
  },
];

const PARTNERS = [
  { name: "CESAG", sector: "Business School" },
  { name: "KPMG", sector: "Audit" },
  { name: "INTOUCH", sector: "Fintech" },
  { name: "CETUD", sector: "Transport" },
  { name: "AFRIKA BANK", sector: "Banque" },
  { name: "SONATEL", sector: "Télécoms" },
  { name: "Forvis Mazars", sector: "Consulting" },
  { name: "WAVE", sector: "Fintech" },
  { name: "BDK", sector: "Banque" },
  { name: "SGSN", sector: "Banque" },
];

function TeamCard({ member }: { member: (typeof TEAM)[number] }) {
  return (
    <Card radius="card" className="flex flex-col gap-3 p-6">
      <div className="flex items-start justify-between">
        <span className={`flex h-14 w-14 items-center justify-center rounded-pill font-sans text-base font-bold text-white ${member.avatarBg}`}>
          {member.initials}
        </span>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Profil LinkedIn de ${member.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-card border border-[#E7E0D4] text-navy hover:text-cta"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </div>
      <div>
        <h3 className="font-heading text-lg font-bold leading-tight text-navy">{member.name}</h3>
        <p className="text-sm font-semibold text-cta">{member.role}</p>
      </div>
      <p className="text-sm text-ink-secondary">{member.desc}</p>
      <div className="mt-auto flex flex-wrap gap-2">
        {member.tags.map((t) => (
          <Pill key={t} variant="neutral">{t}</Pill>
        ))}
      </div>
    </Card>
  );
}

export default function About() {
  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.about} />

      {/* Hero */}
      <section className="grid items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-20 lg:py-24">
        <div className="flex flex-col gap-6">
          <Pill variant="info" className="w-fit">Dakar, Sénégal · Depuis 2023</Pill>
          <h1 className="font-heading text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-2px] text-navy">
            Former la génération data <span className="text-cta">d'Afrique de l'Ouest.</span>
          </h1>
          <p className="max-w-xl text-lg text-ink-secondary">
            Model Technologie est née d'un constat simple : les entreprises africaines avaient besoin de talents data locaux,
            formés sur des données réelles, avec un accès à l'emploi dès la sortie.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Button asChild variant="primary" shape="pill" size="lg">
              <Link to="/formations">Nos formations</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-[#E7E0D4] bg-[#E7E0D4]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 bg-white p-6">
              <span className="font-heading text-4xl font-extrabold text-navy">{s.value}</span>
              <span className="text-sm text-ink-secondary">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & vision */}
      <section className="grid gap-6 px-6 pb-20 lg:grid-cols-2 lg:px-20">
        {MISSION_VISION.map((m) => (
          <Card key={m.label} radius="callout" className="flex flex-col gap-3 p-8 lg:p-10">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{m.label}</span>
            <h2 className="font-heading text-2xl font-bold text-navy">{m.title}</h2>
            <p className="text-ink-secondary">{m.content}</p>
          </Card>
        ))}
      </section>

      {/* Parcours */}
      <section className="bg-surface-sand px-6 py-20 lg:px-20">
        <SectionHeader eyebrow="NOTRE PARCOURS" title="Une structure née du terrain" align="center" />
        <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((t) => (
            <li key={t.year} className="flex flex-col gap-2 rounded-card border-t-2 border-cta bg-white p-6">
              <span className="font-heading text-3xl font-extrabold text-navy">{t.year}</span>
              <span className="font-bold text-cta">{t.label}</span>
              <p className="text-sm text-ink-secondary">{t.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Valeurs */}
      <section className="px-6 py-20 lg:px-20">
        <SectionHeader eyebrow="CE QUI NOUS GUIDE" title="Nos valeurs" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <Card key={v.title} radius="card" className="flex flex-col gap-3 p-7">
              <h3 className="font-heading text-xl font-bold text-navy">{v.title}</h3>
              <p className="text-sm text-ink-secondary">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Équipe */}
      <section className="bg-surface-sand px-6 py-20 lg:px-20">
        <SectionHeader
          eyebrow="LES HUMAINS DERRIÈRE MODEL TECHNOLOGIE"
          title="L'équipe"
          description="5 passionnés de data, anciens du secteur bancaire, de la fintech et du conseil, unis par la même mission."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      {/* Partenaires */}
      <section className="px-6 py-16 lg:px-20">
        <p className="text-center text-xs font-bold uppercase tracking-[1.5px] text-ink-secondary">
          Entreprises qui font confiance à nos alumni
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex min-w-[140px] flex-col items-center gap-0.5 rounded-card border border-[#E7E0D4] bg-white px-6 py-4 text-center">
              <span className="font-heading text-sm font-bold text-navy">{p.name}</span>
              <span className="text-xs text-ink-secondary">{p.sector}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-20 lg:px-20">
        <div className="grid items-center gap-8 rounded-hero bg-navy p-10 text-white lg:grid-cols-2 lg:p-14">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">REJOIGNEZ L'AVENTURE</span>
            <h2 className="font-heading text-3xl font-extrabold">Prêt à transformer votre carrière ?</h2>
            <p className="text-[#D5DEE8]">Rejoignez les 30+ alumni qui ont déjà fait le saut. La prochaine promotion commence bientôt.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="primary" shape="pill" size="lg">
              <Link to="/formations">Voir les formations</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg" className="border-white/40 text-white hover:bg-white/10">
              <Link to="/orientation">Quiz d'orientation (2 min)</Link>
            </Button>
            <a
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#D5DEE8] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" /> Nous contacter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
