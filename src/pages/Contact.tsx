/**
 * Contact.tsx — Lot 2 (docs/design/README.md §2, screens/site/Contact.dc.html)
 * Réutilise useSendContactMessage/contactService (inchangés).
 */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, Clock, MessageCircle, CheckCircle, Loader2 } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card, SectionHeader, FaqAccordion } from "@/components/shared";
import { useSendContactMessage } from "@/hooks/useContacts";
import { COMPANY } from "@/config/constants";
import { splitName } from "@/services/api/siteFormsService";
import { submitErrorMessage } from "@/lib/formErrors";
import type { CreateContactMessageDTO } from "@/types";

const inputClass =
  "w-full rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

const CONTACT_METHODS = [
  { icon: MessageCircle, label: "WhatsApp", value: COMPANY.phone, helper: "Réponse dans la journée", href: COMPANY.whatsappUrl, highlight: true },
  { icon: Mail, label: "E-mail", value: COMPANY.email, helper: "Pour les devis et documents", href: `mailto:${COMPANY.email}`, highlight: false },
  { icon: MapPin, label: "Adresse", value: COMPANY.address, helper: "Sur rendez-vous", href: null, highlight: false },
  { icon: Clock, label: "Horaires", value: "Lun–Ven 9h–18h · Sam 9h–13h", helper: "Heure de Dakar (GMT)", href: null, highlight: false },
];

const FAQ_ITEMS = [
  { question: "Quand démarre la prochaine cohorte ?", answer: "Consultez le calendrier des sessions sur la page Formations pour la prochaine date disponible." },
  { question: "Quels moyens de paiement acceptez-vous ?", answer: "Wave, Orange Money et virement bancaire." },
  { question: "Proposez-vous des facilités de paiement ?", answer: "Oui, un paiement en plusieurs fois est possible — précisez-le dans votre message." },
  { question: "Les formations sont-elles accessibles à distance ?", answer: "Cela dépend de la formation — le format est indiqué sur chaque fiche formation." },
  { question: "Pouvez-vous facturer mon entreprise ?", answer: "Oui, nous émettons une facture ou un bon de commande entreprise sur demande." },
];

type Role = "particulier" | "entreprise";

/** Liens du site (?sujet=coaching…) → libellé du sujet pré-sélectionné. */
const SUBJECT_BY_PARAM: Record<string, string> = {
  coaching: "Réserver un coaching",
  cohorte: "Candidater à une cohorte",
  entreprise: "Formation pour mon entreprise",
  partenariat: "Partenariat",
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const defaultSubject = SUBJECT_BY_PARAM[searchParams.get("sujet") ?? ""] ?? "";
  const [role, setRole] = useState<Role>(searchParams.get("sujet") === "entreprise" ? "entreprise" : "particulier");
  const [submitted, setSubmitted] = useState(false);
  const sendMessage = useSendContactMessage();

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
    <SiteLayout>
      <SeoHead {...PAGE_SEO.contact} />

      <section className="grid gap-10 px-6 py-20 lg:grid-cols-[1fr,1.2fr] lg:px-20">
        {/* Left: intro + contact methods */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">CONTACT</span>
            <h1 className="mt-3 font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
              Parlons de votre projet.
            </h1>
            <p className="mt-3 text-ink-secondary">Le plus rapide reste WhatsApp.</p>
          </div>

          <div className="flex flex-col gap-3">
            {CONTACT_METHODS.map((m) => {
              const content = (
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
                  {content}
                </a>
              ) : (
                <div key={m.label}>{content}</div>
              );
            })}
          </div>
        </div>

        {/* Right: form */}
        <Card radius="card" className="p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="font-heading text-lg font-bold text-navy">Message envoyé !</p>
              <p className="text-sm text-ink-secondary">Nous vous répondrons sous 24h ouvrées.</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Envoyer un autre message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2">
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
                    {r === "particulier" ? "Je suis un particulier" : "Je représente une entreprise"}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input name="name" required placeholder="Awa Ndiaye" className={inputClass} aria-label="Nom et prénom" />
                <input name="phone" type="tel" placeholder="+221 …" className={inputClass} aria-label="Téléphone / WhatsApp" />
                <input name="email" type="email" required placeholder="vous@exemple.com" className={inputClass} aria-label="E-mail" />
                <select name="subject" required defaultValue={defaultSubject} className={inputClass} aria-label="Sujet">
                  <option value="" disabled>Sujet</option>
                  <option value="Candidater à une cohorte">Candidater à une cohorte</option>
                  <option value="Réserver un coaching">Réserver un coaching</option>
                  <option value="Formation pour mon entreprise">Formation pour mon entreprise</option>
                  <option value="Partenariat">Partenariat</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {role === "entreprise" && (
                <input name="company" placeholder="Nom de l'entreprise" className={inputClass} aria-label="Entreprise" />
              )}

              <textarea
                name="message"
                required
                rows={4}
                placeholder="Dites-nous en quelques lignes ce dont vous avez besoin."
                className={inputClass}
                aria-label="Votre message"
              />

              {sendMessage.isError && (
                <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(sendMessage.error)}</p>
              )}
              <Button type="submit" variant="primary" shape="pill" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le message"}
              </Button>
              <p className="text-center text-xs text-ink-secondary">
                Réponse sous 24h ouvrées. Vos données ne sont utilisées que pour vous répondre.
              </p>
            </form>
          )}
        </Card>
      </section>

      {/* Map placeholder */}
      <section className="px-6 pb-16 lg:px-20">
        <div className="flex h-64 items-center justify-center rounded-hero border border-[#E7E0D4] bg-surface-sand text-sm text-ink-secondary">
          Carte — emplacement des locaux à Dakar
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20 lg:px-20">
        <SectionHeader eyebrow="QUESTIONS FRÉQUENTES" title="Les réponses aux questions les plus courantes" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </SiteLayout>
  );
}
