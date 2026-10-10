/**
 * Partenaires.tsx — Lot 2 (docs/design/README.md §2, screens/site/Partenaires.dc.html)
 * Textes et photo viennent du backend (contenu `page.partenaires`) ; les partenaires actifs et leurs formations
 * viennent de l'API catalogue. Formulaire « proposer une formation » envoyé via useSendPartnerApplication.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, CheckCircle } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader, ContentGate } from "@/components/shared";
import { useSendPartnerApplication } from "@/hooks/useSiteForms";
import { useFormations, usePartners } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { PARTNER_DOMAINS, splitName, type PartnerApplicationPayload } from "@/services/api/siteFormsService";
import { submitErrorMessage } from "@/lib/formErrors";
import type { PagePartenaires, SiteCompany } from "@/types/siteContent";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

export default function Partenaires() {
  const page = useSiteContent("page.partenaires");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.partenaires} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <PartenairesBody c={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function PartenairesBody({ c, company }: { c: PagePartenaires; company: SiteCompany }) {
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendPartnerApplication();
  const { data: partners = [] } = usePartners();
  const { data: formations = [] } = useFormations();
  const f = c.form;

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
    <>
      {/* Hero */}
      <section className="bg-navy px-6 py-20 text-white lg:px-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">{c.hero.eyebrow}</span>
            <h1 className="mt-3 font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px]">{c.hero.title}</h1>
            <p className="mt-3 text-[#C9D4E0]">{c.hero.description}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild variant="primary" shape="pill">
                <a href={c.hero.primary.href}>{c.hero.primary.label}</a>
              </Button>
              <Button asChild variant="outline" shape="pill" className="border-white text-white hover:bg-white/10">
                <a href={c.hero.secondary.href}>{c.hero.secondary.label}</a>
              </Button>
            </div>
          </div>
          {c.hero.image && (
            <img src={c.hero.image} alt={c.hero.imageAlt} loading="eager" className="h-64 w-full rounded-hero object-cover lg:h-80" />
          )}
        </div>
      </section>

      {/* Le principe */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.principle.eyebrow} title={c.principle.title} />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card radius="card" className="p-8">
            <p className="font-heading text-lg font-bold text-navy">{c.principle.youTitle}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {c.principle.you.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card radius="card" variant="sand" className="p-8">
            <p className="font-heading text-lg font-bold text-navy">{c.principle.weTitle}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {c.principle.we.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Ce que vous y gagnez */}
      <section className="bg-surface-sand px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.benefits.eyebrow} title={c.benefits.title} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.benefits.items.map((b) => (
            <Card key={b.title} radius="card" className="p-6">
              <p className="font-heading font-bold text-navy">{b.title}</p>
              <p className="mt-2 text-sm text-ink-secondary">{b.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="fonctionnement" className="bg-navy px-6 py-14 text-white lg:px-20">
        <SectionHeader eyebrow={c.method.eyebrow} title={c.method.title} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.method.steps.map((step, i) => (
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
          <SectionHeader eyebrow={c.requirements.eyebrow} title={c.requirements.title} />
          <ul className="mt-6 flex flex-col gap-2">
            {c.requirements.items.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-ink-secondary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHeader eyebrow={c.domains.eyebrow} title={c.domains.title} />
          <div className="mt-6 flex flex-wrap gap-2">
            {PARTNER_DOMAINS.map((d) => (
              <Pill key={d.code} variant="neutral">{d.label}</Pill>
            ))}
          </div>
          {partners.map((partner) => {
            const theirs = formations.filter((x) => x.partnerId === partner.id);
            return (
              <Card key={partner.id} radius="card" variant="sand" className="mt-6 p-5">
                <p className="text-sm text-ink-secondary">{c.domains.alreadyPartner}</p>
                <p className="font-heading font-bold text-navy">{partner.name}</p>
                {theirs.map((x) => (
                  <Link key={x.id} to={`/formations/${x.slug}`} className="mt-1 block text-sm font-semibold text-navy hover:text-cta">
                    {c.domains.seeFormation} — {x.title} →
                  </Link>
                ))}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Proposer une formation */}
      <section id="proposer" className="grid gap-10 px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-4">
          <SectionHeader eyebrow={f.eyebrow} title={f.title} />
          <p className="text-sm text-ink-secondary">
            {company.phone} · {company.email}
          </p>
        </div>

        <Card radius="card" className="p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="font-heading text-lg font-bold text-navy">{f.successTitle}</p>
              <p className="text-sm text-ink-secondary">{f.successText}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder={f.namePlaceholder} className={inputClass} aria-label="Nom et prénom" />
                <input name="org" placeholder={f.orgPlaceholder} className={inputClass} aria-label="Organisme" />
                <input name="email" type="email" required placeholder={f.emailPlaceholder} className={inputClass} aria-label="E-mail" />
                <input name="phone" type="tel" placeholder={f.phonePlaceholder} className={inputClass} aria-label="Téléphone / WhatsApp" />
                <select name="domain" required defaultValue="" className={inputClass} aria-label="Domaine">
                  <option value="" disabled>{f.domainPlaceholder}</option>
                  {PARTNER_DOMAINS.map((d) => (
                    <option key={d.code} value={d.code}>{d.label}</option>
                  ))}
                </select>
                <input name="linkedin" type="url" placeholder={f.linkedinPlaceholder} className={inputClass} aria-label="Profil LinkedIn" />
              </div>
              <input name="proposal" required placeholder={f.proposalPlaceholder} className={inputClass} aria-label="Formation proposée" />
              <textarea
                name="references"
                rows={4}
                placeholder={f.referencesPlaceholder}
                className={inputClass}
                aria-label="Vos références"
              />
              {sendMessage.isError && (
                <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(sendMessage.error)}</p>
              )}
              <Button type="submit" variant="primary" shape="pill" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : f.submitLabel}
              </Button>
              <p className="text-center text-xs text-ink-secondary">{f.note}</p>
            </form>
          )}
        </Card>
      </section>
    </>
  );
}
