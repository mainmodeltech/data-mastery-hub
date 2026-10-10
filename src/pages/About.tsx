/**
 * About.tsx — page « À propos » (SiteLayout, tokens navy/cta).
 * Pas d'écran de référence dans docs/design : composition construite avec les mêmes primitives que les autres
 * pages publiques. Tous les textes, chiffres, équipe, partenaires et images viennent du backend
 * (contenu `page.about`, modifiable depuis l'administration).
 */
import { Link } from "react-router-dom";
import { Linkedin, MessageCircle } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, Pill, SectionHeader, ContentGate } from "@/components/shared";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { PageAbout, SiteCompany } from "@/types/siteContent";

const AVATAR_BG: Record<string, string> = {
  navy: "bg-navy",
  cta: "bg-cta",
  success: "bg-success",
  "navy-medium": "bg-navy-medium",
  warning: "bg-warning",
};

type Member = PageAbout["team"]["members"][number];

function TeamCard({ member }: { member: Member }) {
  return (
    <Card radius="card" className="flex flex-col gap-3 p-6">
      <div className="flex items-start justify-between">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} loading="lazy" className="h-14 w-14 rounded-pill object-cover" />
        ) : (
          <span className={`flex h-14 w-14 items-center justify-center rounded-pill font-sans text-base font-bold text-white ${AVATAR_BG[member.color] ?? "bg-navy"}`}>
            {member.initials}
          </span>
        )}
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Profil LinkedIn de ${member.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-card border border-[#E7E0D4] text-navy hover:text-cta"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
      </div>
      <div>
        <h3 className="font-heading text-lg font-bold leading-tight text-navy">{member.name}</h3>
        <p className="text-sm font-semibold text-cta">{member.role}</p>
      </div>
      <p className="text-sm text-ink-secondary">{member.description}</p>
      <div className="mt-auto flex flex-wrap gap-2">
        {member.tags.map((t) => (
          <Pill key={t} variant="neutral">{t}</Pill>
        ))}
      </div>
    </Card>
  );
}

export default function About() {
  const page = useSiteContent("page.about");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.about} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <AboutBody c={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function AboutBody({ c, company }: { c: PageAbout; company: SiteCompany }) {
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-20 lg:py-24">
        <div className="flex flex-col gap-6">
          <Pill variant="info" className="w-fit">{c.hero.badge}</Pill>
          <h1 className="font-heading text-[clamp(36px,5vw,64px)] font-extrabold leading-[1] tracking-[-2px] text-navy">
            {c.hero.titleBefore} <span className="text-cta">{c.hero.titleAccent}</span>
          </h1>
          <p className="max-w-xl text-lg text-ink-secondary">{c.hero.description}</p>
          <div className="flex flex-wrap gap-3.5">
            <Button asChild variant="primary" shape="pill" size="lg">
              <Link to={c.hero.primary.href}>{c.hero.primary.label}</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg">
              <Link to={c.hero.secondary.href}>{c.hero.secondary.label}</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {c.hero.image && (
            <img
              src={c.hero.image}
              alt={c.hero.imageAlt}
              loading="eager"
              className="aspect-[16/10] w-full rounded-hero object-cover"
            />
          )}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-[#E7E0D4] bg-[#E7E0D4] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {c.hero.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 bg-white p-5">
                <span className="font-heading text-3xl font-extrabold text-navy">{s.value}</span>
                <span className="text-xs text-ink-secondary">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="grid gap-6 px-6 pb-20 lg:grid-cols-2 lg:px-20">
        {c.missionVision.map((m) => (
          <Card key={m.label} radius="callout" className="flex flex-col gap-3 p-8 lg:p-10">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{m.label}</span>
            <h2 className="font-heading text-2xl font-bold text-navy">{m.title}</h2>
            <p className="text-ink-secondary">{m.content}</p>
          </Card>
        ))}
      </section>

      {/* Parcours */}
      <section className="bg-surface-sand px-6 py-20 lg:px-20">
        <SectionHeader eyebrow={c.timeline.eyebrow} title={c.timeline.title} align="center" />
        <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.timeline.items.map((t) => (
            <li key={t.year} className="flex flex-col gap-2 rounded-card border-t-2 border-cta bg-white p-6">
              <span className="font-heading text-3xl font-extrabold text-navy">{t.year}</span>
              <span className="font-bold text-cta">{t.label}</span>
              <p className="text-sm text-ink-secondary">{t.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Valeurs */}
      <section className="px-6 py-20 lg:px-20">
        <SectionHeader eyebrow={c.values.eyebrow} title={c.values.title} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.values.items.map((v) => (
            <Card key={v.title} radius="card" className="flex flex-col gap-3 p-7">
              <h3 className="font-heading text-xl font-bold text-navy">{v.title}</h3>
              <p className="text-sm text-ink-secondary">{v.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Équipe */}
      <section className="bg-surface-sand px-6 py-20 lg:px-20">
        <SectionHeader eyebrow={c.team.eyebrow} title={c.team.title} description={c.team.description} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.team.members.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      {/* Partenaires */}
      {c.partners.items.length > 0 && (
        <section className="px-6 py-16 lg:px-20">
          <p className="text-center text-xs font-bold uppercase tracking-[1.5px] text-ink-secondary">{c.partners.label}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {c.partners.items.map((p) => (
              <div key={p.name} className="flex min-w-[140px] flex-col items-center gap-0.5 rounded-card border border-[#E7E0D4] bg-white px-6 py-4 text-center">
                <span className="font-heading text-sm font-bold text-navy">{p.name}</span>
                <span className="text-xs text-ink-secondary">{p.sector}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-6 pb-20 lg:px-20">
        <div className="grid items-center gap-8 rounded-hero bg-navy p-10 text-white lg:grid-cols-2 lg:p-14">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">{c.cta.eyebrow}</span>
            <h2 className="font-heading text-3xl font-extrabold">{c.cta.title}</h2>
            <p className="text-[#D5DEE8]">{c.cta.description}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="primary" shape="pill" size="lg">
              <Link to={c.cta.primary.href}>{c.cta.primary.label}</Link>
            </Button>
            <Button asChild variant="outline" shape="pill" size="lg" className="border-white/40 text-white hover:bg-white/10">
              <Link to={c.cta.secondary.href}>{c.cta.secondary.label}</Link>
            </Button>
            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#D5DEE8] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" /> {c.cta.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
