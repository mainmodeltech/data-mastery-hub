/**
 * FormationDetail.tsx — Lot 1 (docs/design/README.md §2, screens/site/FicheFormation.dc.html)
 *
 * Gabarit unique : seul le bloc "Dispensé par" change entre une formation
 * interne et une formation partenaire (voir DeliveredByBlock). Construit contre
 * des données de démonstration en attendant le backend Domain/Partner.
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";

import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button } from "@/components/shared/Button";
import { Pill } from "@/components/shared/Pill";
import { Card } from "@/components/shared/Card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { FormationCard } from "@/components/formations/FormationCard";
import { DeliveredByBlock } from "@/components/formations/DeliveredByBlock";
import { useFormationBySlug, useFormations } from "@/hooks/useFormations";
import { LEVEL_LABELS, FORMAT_LABELS } from "@/types/formation.type";
import type { StaticEnrichment } from "@/config/bootcamps.config";
import { RegistrationModal } from "./RegistrationModal";

function formatDateLong(iso: string | null): string {
  if (!iso) return "Date à venir";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function FormationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: formation, isLoading } = useFormationBySlug(slug);
  const { data: allFormations = [] } = useFormations();
  const [registering, setRegistering] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="px-6 py-20 text-center text-sm text-ink-secondary">Chargement…</p>
      </SiteLayout>
    );
  }

  if (!formation) {
    return (
      <SiteLayout>
        <div className="px-6 py-20 text-center">
          <p className="text-sm text-ink-secondary">Formation introuvable.</p>
          <Link to="/formations" className="mt-4 inline-block font-semibold text-navy hover:text-cta">
            ← Retour au catalogue
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const session = formation.nextSession;
  const related = allFormations.filter((f) => formation.relatedFormationIds.includes(f.id));

  const staticDataAdapter: StaticEnrichment = {
    tagline: formation.title,
    colorKey: "accent",
    icon: BookOpen,
    profiles: formation.profiles,
    tools: formation.tools,
    curriculum: formation.curriculum,
    outcomes: formation.outcomes,
    testimonial: formation.testimonial ?? { name: "", role: "", company: "", content: "", initials: "" },
    certification: formation.certification ?? { name: "", logo: "🎓", description: "" },
  };

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="px-6 pt-8 text-sm text-ink-secondary lg:px-20">
        <Link to="/formations" className="hover:text-cta">
          Formations
        </Link>
        {" / "}
        <span>{formation.domain.name}</span>
        {" / "}
        <span className="text-ink">{formation.title}</span>
      </div>

      {/* Hero */}
      <section className="grid gap-10 px-6 py-10 lg:grid-cols-[2fr,1fr] lg:px-20">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Pill variant="info">{formation.domain.name}</Pill>
            {formation.deliveredBy === "PARTNER" && formation.partner && (
              <Pill variant="neutral">En partenariat avec {formation.partner.name}</Pill>
            )}
          </div>

          <h1 className="font-heading text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-navy">
            {formation.title}
          </h1>
          <p className="text-base text-ink-secondary">{formation.description}</p>

          <div className="grid grid-cols-2 gap-4 border-t border-[#E7E0D4] pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-ink-secondary">Durée</p>
              <p className="font-semibold text-navy">{formation.duration}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-secondary">Niveau</p>
              <p className="font-semibold text-navy">{LEVEL_LABELS[formation.level]}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-secondary">Format</p>
              <p className="font-semibold text-navy">{FORMAT_LABELS[formation.format]}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-ink-secondary">Langue</p>
              <p className="font-semibold text-navy">Français</p>
            </div>
          </div>
        </div>

        {/* Sticky session card */}
        <div className="h-fit lg:sticky lg:top-6">
          <Card radius="callout" shadow className="flex flex-col gap-4 p-6">
            <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">PROCHAINE SESSION</span>
            <p className="font-heading text-2xl font-extrabold text-navy">{formatDateLong(session?.startDate ?? null)}</p>

            <div className="flex flex-col gap-2 border-y border-[#E7E0D4] py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Places</span>
                <span className="font-semibold text-navy">
                  {session ? `${session.spotsRemaining ?? session.maxParticipants - session.currentParticipants} restantes sur ${session.maxParticipants}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Tarif</span>
                <span className="font-semibold text-navy">{formation.price}</span>
              </div>
              {formation.certificationPrep && (
                <div className="flex justify-between gap-4">
                  <span className="text-ink-secondary">Prépare à</span>
                  <span className="text-right font-semibold text-navy">{formation.certificationPrep}</span>
                </div>
              )}
            </div>

            {session && (
              <ProgressBar
                value={session.currentParticipants}
                max={session.maxParticipants}
                aria-label="Places occupées"
              />
            )}

            <Button variant="primary" shape="pill" onClick={() => setRegistering(true)}>
              Candidater
            </Button>
            {formation.curriculum.length > 0 && (
              <Button asChild variant="outline" shape="pill">
                <a href="#programme">Voir le programme</a>
              </Button>
            )}
            <p className="text-center text-xs text-ink-secondary">
              Inscription, paiement (Wave, Orange Money, virement) et suivi gérés par Model Technologie.
            </p>
          </Card>
        </div>
      </section>

      {/* Pour qui */}
      {formation.profiles.length > 0 && (
      <section className="px-6 py-14 lg:px-20">
        <SectionHeader eyebrow="POUR QUI" title="Cette formation est faite pour vous si…" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {formation.profiles.map((p) => (
            <Card key={p.label} radius="card" className="flex items-center gap-3 p-5">
              <span className="text-2xl">{p.icon}</span>
              <span className="font-medium text-ink">{p.label}</span>
            </Card>
          ))}
        </div>
      </section>
      )}

      {/* Vous saurez / Programme */}
      {(formation.outcomes.length > 0 || formation.curriculum.length > 0) && (
      <section id="programme" className="grid gap-10 px-6 py-14 lg:grid-cols-[1fr,2fr] lg:px-20">
        {formation.outcomes.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">À la fin de la formation</h2>
          <ul className="mt-4 space-y-3">
            {formation.outcomes.map((o) => (
              <li key={o.label} className="flex items-baseline gap-2">
                <span className="font-heading text-lg font-extrabold text-cta">{o.stat}</span>
                <span className="text-sm text-ink-secondary">{o.label}</span>
              </li>
            ))}
          </ul>
        </div>
        )}
        {formation.curriculum.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-bold text-navy">Programme</h2>
          {formation.curriculum.map((mod, i) => (
            <Card key={mod.title} radius="card" className="p-5">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpenModule(openModule === i ? null : i)}
              >
                <span className="font-heading font-bold text-navy">
                  {mod.week} · {mod.title}
                </span>
                <span className="text-ink-secondary">{openModule === i ? "−" : "+"}</span>
              </button>
              {openModule === i && (
                <div className="mt-3 flex flex-col gap-2 text-sm text-ink-secondary">
                  <p className="font-medium text-ink">{mod.hours}</p>
                  <ul className="list-inside list-disc space-y-1">
                    {mod.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="font-medium text-navy">{mod.project}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
        )}
      </section>
      )}

      {/* Dispensé par */}
      <section className="px-6 py-14 lg:px-20">
        <DeliveredByBlock formation={formation} />
      </section>

      {/* Ce que vous obtenez */}
      {formation.certification && (
        <section className="bg-navy px-6 py-16 text-white lg:px-20">
          <div className="grid gap-8 sm:grid-cols-3">
            <h2 className="font-heading text-2xl font-extrabold">
              Attestation + préparation à l'examen officiel
            </h2>
            <div>
              <p className="text-xs uppercase text-cta-on-navy">Attestation</p>
              <p className="mt-1 text-sm text-[#C9D4E0]">
                {formation.deliveredBy === "PARTNER" && formation.partner
                  ? `Co-signée Model Technologie et ${formation.partner.name}.`
                  : "Délivrée par Model Technologie."}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-cta-on-navy">Examen officiel</p>
              <p className="mt-1 text-sm text-[#C9D4E0]">{formation.certification.name}</p>
            </div>
          </div>
        </section>
      )}

      {/* Vous aimerez aussi */}
      {related.length > 0 && (
        <section className="px-6 py-16 lg:px-20">
          <SectionHeader eyebrow="À DÉCOUVRIR AUSSI" title="Vous aimerez aussi" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((f) => (
              <FormationCard key={f.id} formation={f} />
            ))}
          </div>
        </section>
      )}

      {registering && (
        <RegistrationModal
          bootcamp={formation}
          session={session}
          staticData={staticDataAdapter}
          onClose={() => setRegistering(false)}
        />
      )}
    </SiteLayout>
  );
}
