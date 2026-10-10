/**
 * Entreprises.tsx — Lot 2 (docs/design/README.md §2, screens/site/Entreprises.dc.html)
 *
 * Textes, offres, méthode, étude de cas et photos viennent du backend (contenu `page.entreprises`).
 * Le formulaire « diagnostic gratuit » est envoyé via useSendDiagnostic (endpoint dédié du backend).
 * La plaquette et l'étude de cas sont masquées tant qu'elles ne sont pas renseignées.
 */
import { useState } from "react";
import { Check, Loader2, CheckCircle, Download } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, SectionHeader, ContentGate } from "@/components/shared";
import { useSendDiagnostic } from "@/hooks/useSiteForms";
import { useSiteContent } from "@/hooks/useSiteContent";
import { PEOPLE_COUNTS, TRAINING_NEEDS, splitName, type DiagnosticRequestPayload } from "@/services/api/siteFormsService";
import { submitErrorMessage } from "@/lib/formErrors";
import type { PageEntreprises, SiteCompany } from "@/types/siteContent";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

export default function Entreprises() {
  const page = useSiteContent("page.entreprises");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.entreprises} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <EntreprisesBody c={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function EntreprisesBody({ c, company }: { c: PageEntreprises; company: SiteCompany }) {
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendDiagnostic();
  const d = c.diagnostic;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const text = (k: string) => ((data.get(k) as string | null) ?? "").trim();
    const { firstName, lastName } = splitName(text("name"));

    const payload: DiagnosticRequestPayload = {
      firstName,
      lastName,
      email: text("email"),
      phone: text("phone") || undefined,
      company: text("company"),
      role: text("role"),
      peopleCount: text("peopleCount") as DiagnosticRequestPayload["peopleCount"],
      need: text("need") as DiagnosticRequestPayload["need"],
      context: text("context") || undefined,
    };

    sendMessage.mutate(payload, { onSuccess: () => setSubmitted(true) });
  };

  const showReference = c.reference.enabled && Boolean(c.reference.name);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy px-6 py-20 text-white lg:px-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta-on-navy">{c.hero.eyebrow}</span>
            <h1 className="font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px]">{c.hero.title}</h1>
            <p className="text-[#C9D4E0]">{c.hero.description}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="primary" shape="pill">
                <a href={c.hero.primary.href}>{c.hero.primary.label}</a>
              </Button>
              {c.hero.brochure.url && (
                <Button asChild variant="outline" shape="pill" className="border-white text-white hover:bg-white/10">
                  <a href={c.hero.brochure.url} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" /> {c.hero.brochure.label}
                  </a>
                </Button>
              )}
            </div>
          </div>
          {c.hero.image.url && (
            <img
              src={c.hero.image.url}
              alt={c.hero.image.alt}
              loading="eager"
              className="h-64 w-full rounded-hero object-cover lg:h-80"
            />
          )}
        </div>
      </section>

      {/* Secteurs */}
      {c.sectors.items.length > 0 && (
        <section className="px-6 py-10 lg:px-20">
          <p className="text-center text-xs font-bold uppercase tracking-[1px] text-ink-secondary">{c.sectors.label}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-navy">
            {c.sectors.items.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      )}

      {/* Par service */}
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.departments.eyebrow} title={c.departments.title} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.departments.items.map((dept) => (
            <Card key={dept.name} radius="card" className="flex flex-col gap-3 p-6">
              <p className="font-heading font-bold text-navy">{dept.name}</p>
              <div>
                <p className="text-xs font-semibold uppercase text-ink-secondary">{c.departments.todayLabel}</p>
                <p className="text-sm text-ink-secondary">{dept.before}</p>
              </div>
              <div className="border-t border-[#E7E0D4] pt-3">
                <p className="text-xs font-semibold uppercase text-success">{c.departments.afterLabel}</p>
                <p className="text-sm text-ink">{dept.after}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Nos offres */}
      <section className="bg-surface-sand px-6 py-14 lg:px-20">
        <SectionHeader eyebrow={c.offers.eyebrow} title={c.offers.title} />
        <div className="mt-8 flex flex-col gap-6">
          {c.offers.items.map((offer, i) => (
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
                    <p className="font-semibold text-navy">{c.offers.specLabels.public}</p>
                    <p className="text-ink-secondary">{offer.public}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{c.offers.specLabels.format}</p>
                    <p className="text-ink-secondary">{offer.format}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{c.offers.specLabels.duration}</p>
                    <p className="text-ink-secondary">{offer.duration}</p>
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
                  <a href={c.offers.cta.href}>{c.offers.cta.label}</a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Méthode */}
      <section className="bg-navy px-6 py-14 text-white lg:px-20">
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

      {/* Référence (masquée tant qu'aucune étude de cas n'est renseignée) */}
      {showReference && (
        <section className="px-6 py-14 lg:px-20">
          <SectionHeader eyebrow={c.reference.eyebrow} title={c.reference.title} />
          <Card radius="card" variant="sand" className="mt-8 grid gap-6 p-8 lg:grid-cols-3">
            <div>
              <p className="font-heading text-2xl font-extrabold text-navy">{c.reference.name}</p>
              <p className="text-sm text-ink-secondary">{[c.reference.sector, c.reference.size].filter(Boolean).join(" · ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-secondary">{c.reference.needLabel}</p>
              <p className="text-sm text-ink">{c.reference.need}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-secondary">{c.reference.resultLabel}</p>
              <p className="text-sm text-ink">{c.reference.result}</p>
            </div>
          </Card>
        </section>
      )}

      {/* Diagnostic form */}
      <section id="diagnostic" className="grid gap-10 px-6 py-20 lg:grid-cols-2 lg:px-20">
        <div className="flex flex-col gap-4">
          <SectionHeader eyebrow={d.eyebrow} title={d.title} />
          <ul className="flex flex-col gap-2">
            {d.points.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink-secondary">
                <Check className="h-4 w-4 text-success" /> {f}
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-secondary">
            {company.phone} · {company.email}
          </p>
          {d.image && (
            <img src={d.image} alt={d.imageAlt} loading="lazy" className="mt-2 hidden aspect-[4/3] w-full rounded-hero object-cover lg:block" />
          )}
        </div>

        <Card radius="card" className="self-start p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="font-heading text-lg font-bold text-navy">{d.successTitle}</p>
              <p className="text-sm text-ink-secondary">{d.successText}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder={d.namePlaceholder} className={inputClass} aria-label="Nom et prénom" />
                <input name="role" required placeholder={d.rolePlaceholder} className={inputClass} aria-label="Fonction" />
                <input name="company" required placeholder={d.companyPlaceholder} className={inputClass} aria-label="Entreprise" />
                <select name="peopleCount" required defaultValue="" className={inputClass} aria-label="Nombre de personnes à former">
                  <option value="" disabled>{d.peoplePlaceholder}</option>
                  {PEOPLE_COUNTS.map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
                <input name="email" type="email" required placeholder={d.emailPlaceholder} className={inputClass} aria-label="E-mail professionnel" />
                <input name="phone" type="tel" placeholder={d.phonePlaceholder} className={inputClass} aria-label="Téléphone / WhatsApp" />
              </div>
              <select name="need" required defaultValue="" className={inputClass} aria-label="Besoin principal">
                <option value="" disabled>{d.needPlaceholder}</option>
                {TRAINING_NEEDS.map((o) => (
                  <option key={o.code} value={o.code}>{o.label}</option>
                ))}
              </select>
              <textarea
                name="context"
                rows={4}
                placeholder={d.contextPlaceholder}
                className={inputClass}
                aria-label="Votre contexte"
              />
              {sendMessage.isError && (
                <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(sendMessage.error)}</p>
              )}
              <Button type="submit" variant="primary" shape="pill" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : d.submitLabel}
              </Button>
              <p className="text-center text-xs text-ink-secondary">{d.note}</p>
            </form>
          )}
        </Card>
      </section>
    </>
  );
}
