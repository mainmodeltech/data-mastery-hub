/**
 * AuthShell — la coque des écrans d'authentification (connexion, lien reçu par e-mail, mot de passe oublié ou à réinitialiser) : une colonne
 * de formulaire à gauche, un panneau de marque à droite sur grand écran. Le panneau ne montre que des données réelles : le témoignage d'un
 * ancien (API) et la prochaine cohorte ouverte (API) ; sans l'une ou l'autre, le bloc correspondant est simplement absent.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { TOP } from "@/components/formations/CohortBars";
import { Logo } from "@/components/shared/Logo";
import { CONNEXION_UI as UI } from "@/config/connexionPage";
import { useAllFormationSessions } from "@/hooks/useFormations";
import { useSiteContent } from "@/hooks/useSiteContent";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { openCohorts, pluralSpots, spotsLeft, todayIso } from "@/lib/cohorts";

const dateShort = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "Date à venir";

function AuthPanel() {
  const { data: testimonials = [] } = usePublishedTestimonials();
  const { data: sessions = [] } = useAllFormationSessions();
  const { content: company } = useSiteContent("site.company");

  const quote = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder).find((t) => t.content) ?? null;
  const next = openCohorts(sessions, todayIso())[0] ?? null;

  return (
    <aside className="relative isolate hidden flex-col justify-between gap-10 overflow-hidden bg-navy-dark pt-24 text-white lg:flex">
      <img src="/media/hero-data-poster.jpg" alt="" aria-hidden="true" width={1280} height={720} loading="lazy" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-navy-dark/80" aria-hidden="true" />

      <div className="px-16">
        {quote ? (
          <figure className="flex flex-col gap-5">
            <blockquote className="max-w-[28ch] font-heading text-[clamp(26px,2.4vw,36px)] font-bold leading-snug text-balance">« {quote.content} »</blockquote>
            <figcaption className="text-base text-white/85">
              <span className="font-semibold text-white">{quote.name}</span>
              {quote.role ? `, ${quote.role}` : ""}{quote.company ? ` · ${quote.company}` : ""}
            </figcaption>
          </figure>
        ) : (
          company?.tagline && <p className="max-w-[20ch] font-heading text-[clamp(30px,3vw,44px)] font-extrabold leading-tight text-balance">{company.tagline}</p>
        )}
      </div>

      {next && (
        <Link
          to={`/formations/${next.formationSlug}`}
          className={`${TOP} home-bar-in group mx-16 flex flex-col gap-2 bg-cta p-8 pt-14 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
        >
          <span className="font-heading text-[40px] font-extrabold leading-none">{dateShort(next.startDate)}</span>
          <span className="font-heading text-xl font-bold leading-snug">{next.formationTitle}</span>
          <span className="text-base text-white/90">{UI.panel.nextCohort} · {pluralSpots(spotsLeft(next))}</span>
          <span className="mt-2 text-base font-semibold underline decoration-white/50 underline-offset-4 group-hover:decoration-white">{UI.panel.see}</span>
        </Link>
      )}
    </aside>
  );
}

interface Props {
  children: ReactNode;
}

export function AuthShell({ children }: Props) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-site-bg lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-10 px-5 py-8 lg:px-24 lg:py-12">
        <Link to="/" aria-label="Model Technologie — accueil" className="flex w-fit items-center">
          <Logo className="h-14 lg:h-16" />
        </Link>

        <div className="my-auto flex w-full max-w-[440px] flex-col gap-5">{children}</div>

        <p className="text-base text-ink-secondary">
          © {new Date().getFullYear()} Model Technologie ·{" "}
          <Link to="/contact" className="underline decoration-navy/30 underline-offset-4 hover:decoration-navy">{UI.help}</Link>
        </p>
      </div>
      <AuthPanel />
    </div>
  );
}
