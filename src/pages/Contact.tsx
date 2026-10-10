/**
 * Contact.tsx — Lot 2 (docs/design/README.md §2, screens/site/Contact.dc.html)
 * Réutilise useSendContactMessage/contactService (inchangés).
 * Textes, coordonnées, FAQ, photo et carte viennent du backend (contenus `page.contact` et `site.company`).
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, Clock, MessageCircle, CheckCircle, Loader2 } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, SectionHeader, FaqAccordion, ContentGate, GoogleMapCard } from "@/components/shared";
import { useSendContactMessage } from "@/hooks/useContacts";
import { useSiteContent } from "@/hooks/useSiteContent";
import { splitName } from "@/services/api/siteFormsService";
import { submitErrorMessage } from "@/lib/formErrors";
import type { CreateContactMessageDTO } from "@/types";
import type { PageContact, SiteCompany } from "@/types/siteContent";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

type Role = "particulier" | "entreprise";

function contactMethods(company: SiteCompany) {
  return [
    { icon: MessageCircle, label: "WhatsApp", value: company.phone, helper: company.whatsappHelper, href: company.whatsappUrl, highlight: true },
    { icon: Mail, label: "E-mail", value: company.email, helper: company.emailHelper, href: `mailto:${company.email}`, highlight: false },
    { icon: MapPin, label: "Adresse", value: company.address, helper: company.addressHelper, href: null, highlight: false },
    { icon: Clock, label: "Horaires", value: company.hours, helper: company.hoursHelper, href: null, highlight: false },
  ];
}

export default function Contact() {
  const page = useSiteContent("page.contact");
  const company = useSiteContent("site.company");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.contact} />
      <ContentGate
        content={page.content && company.content ? { page: page.content, company: company.content } : undefined}
        isLoading={page.isLoading || company.isLoading}
        isError={page.isError || company.isError}
        onRetry={() => { page.refetch(); company.refetch(); }}
      >
        {({ page: p, company: c }) => <ContactBody content={p} company={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function ContactBody({ content, company }: { content: PageContact; company: SiteCompany }) {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get("sujet") ?? "";
  // Liens du site (?sujet=coaching…) → sujet pré-sélectionné.
  const defaultSubject = content.form.subjects.find((s) => s.param && s.param === subjectParam)?.value ?? "";
  const [role, setRole] = useState<Role>(subjectParam === "entreprise" ? "entreprise" : "particulier");
  // Pré-remplissage venant de la page Coaching (créneau ou formule choisis)
  const slot = searchParams.get("creneau");
  const plan = searchParams.get("formule");
  const defaultMessage = [slot && `Créneau souhaité : ${slot}.`, plan && `Formule choisie : ${plan}.`].filter(Boolean).join("\n");
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendContactMessage();
  const form = content.form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const { firstName, lastName } = splitName((data.get("name") as string) ?? "");

    const payload: CreateContactMessageDTO = {
      firstName,
      lastName,
      email: (data.get("email") as string).trim(),
      phone: (data.get("phone") as string)?.trim() || null,
      company: role === "entreprise" ? ((data.get("company") as string)?.trim() || null) : null,
      subject: (data.get("subject") as string) || null,
      requesterType: role === "entreprise" ? "ENTREPRISE" : "PARTICULIER",
      message: (data.get("message") as string).trim(),
    };

    sendMessage.mutate(payload, {
      onSuccess: () => setSubmitted(true),
    });
  };

  return (
    <>
      <section className="grid gap-10 px-6 py-20 lg:grid-cols-[1fr,1.2fr] lg:px-20">
        {/* Left: intro + contact methods */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{content.eyebrow}</span>
            <h1 className="mt-3 font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
              {content.title}
            </h1>
            <p className="mt-3 text-ink-secondary">{content.intro}</p>
          </div>

          <div className="flex flex-col gap-3">
            {contactMethods(company).map((m) => {
              const inner = (
                <div
                  className={
                    m.highlight
                      ? "flex items-center gap-4 rounded-card bg-navy p-5 text-white"
                      : "flex items-center gap-4 rounded-card border border-[#E7E0D4] bg-white p-5"
                  }
                >
                  <span
                    className={
                      m.highlight
                        ? "flex h-11 w-11 items-center justify-center rounded-card bg-white/10"
                        : "flex h-11 w-11 items-center justify-center rounded-card bg-app-bg"
                    }
                  >
                    <m.icon className={m.highlight ? "h-5 w-5 text-white" : "h-5 w-5 text-navy"} />
                  </span>
                  <div>
                    <p className={m.highlight ? "text-xs text-cta-on-navy" : "text-xs text-ink-secondary"}>{m.label}</p>
                    <p className={m.highlight ? "font-semibold text-white" : "font-semibold text-navy"}>{m.value}</p>
                    <p className={m.highlight ? "text-xs text-[#C9D4E0]" : "text-xs text-ink-secondary"}>{m.helper}</p>
                  </div>
                </div>
              );
              return m.href ? (
                <a key={m.label} href={m.href} target="_blank" rel="noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={m.label}>{inner}</div>
              );
            })}
          </div>

          {content.image && (
            <img
              src={content.image}
              alt={content.imageAlt}
              loading="lazy"
              className="hidden aspect-[4/3] w-full rounded-hero object-cover lg:block"
            />
          )}
        </div>

        {/* Right: form */}
        <Card radius="card" className="self-start p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="font-heading text-lg font-bold text-navy">{form.successTitle}</p>
              <p className="text-sm text-ink-secondary">{form.successText}</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                {form.successAgain}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {(["particulier", "entreprise"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                    className={
                      role === r
                        ? "rounded-pill bg-navy px-4 py-2 font-sans text-sm font-semibold text-white"
                        : "rounded-pill border border-[#D6CEC0] px-4 py-2 font-sans text-sm text-ink-secondary"
                    }
                  >
                    {r === "particulier" ? form.particulierLabel : form.entrepriseLabel}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder={form.namePlaceholder} className={inputClass} aria-label="Nom et prénom" />
                <input name="phone" type="tel" placeholder={form.phonePlaceholder} className={inputClass} aria-label="Téléphone / WhatsApp" />
                <input name="email" type="email" required placeholder={form.emailPlaceholder} className={inputClass} aria-label="E-mail" />
                <select name="subject" required defaultValue={defaultSubject} className={inputClass} aria-label="Sujet">
                  <option value="" disabled>{form.subjectPlaceholder}</option>
                  {form.subjects.map((s) => (
                    <option key={s.value} value={s.value}>{s.value}</option>
                  ))}
                </select>
              </div>

              {role === "entreprise" && (
                <input name="company" placeholder={form.companyPlaceholder} className={inputClass} aria-label="Entreprise" />
              )}

              <textarea
                name="message"
                required
                rows={4}
                defaultValue={defaultMessage}
                placeholder={form.messagePlaceholder}
                className={inputClass}
                aria-label="Votre message"
              />

              {sendMessage.isError && (
                <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(sendMessage.error)}</p>
              )}
              <Button type="submit" variant="primary" shape="pill" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : form.submitLabel}
              </Button>
              <p className="text-center text-xs text-ink-secondary">{form.note}</p>
            </form>
          )}
        </Card>
      </section>

      {/* Carte Google Maps */}
      {company.map.enabled && company.map.query && (
        <section className="px-6 pb-16 lg:px-20">
          <GoogleMapCard query={company.map.query} zoom={company.map.zoom} title={company.map.title} />
        </section>
      )}

      {/* FAQ */}
      {content.faq.items.length > 0 && (
        <section className="px-6 pb-20 lg:px-20">
          <SectionHeader eyebrow={content.faq.eyebrow} title={content.faq.title} />
          <div className="mx-auto mt-8 max-w-3xl">
            <FaqAccordion items={content.faq.items} />
          </div>
        </section>
      )}
    </>
  );
}
