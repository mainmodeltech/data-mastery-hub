/**
 * HomeHero — la vitrine. Une boucle vidéo « data » en fond, une promesse en grand, une action, et les diplômés eux-mêmes formant les barres
 * d'un tableau de bord qui monte. Tous les textes viennent du contenu `page.home` (modifiable depuis l'administration).
 */
import { Link } from "react-router-dom";

import { HeroVideo } from "@/components/home/HeroVideo";
import { PeopleBars } from "@/components/home/PeopleBars";
import { Button } from "@/components/shared";
import type { PageHome } from "@/types/siteContent";

interface Props {
  c: PageHome;
  /** Une cohorte est ouverte aux candidatures (donnée réelle de l'API). */
  cohortOpen: boolean;
}

const delay = (ms: number) => ({ ["--d" as string]: ms });

export function HomeHero({ c, cohortOpen }: Props) {
  const h = c.hero;
  return (
    <section className="relative isolate overflow-hidden bg-navy-dark text-white">
      <HeroVideo />
      {/* Voile neutre : garde le texte lisible quelle que soit l'image de la vidéo */}
      <div className="absolute inset-0 -z-10 bg-navy-dark/55" aria-hidden="true" />

      <div className="grid items-end gap-10 px-5 pt-14 lg:min-h-[calc(100svh-76px)] lg:grid-cols-12 lg:gap-6 lg:px-20 lg:pt-20">
        <div className="flex flex-col gap-6 pb-4 lg:col-span-7 lg:pb-24">
          <h1 className="font-heading text-[clamp(32px,3.8vw,64px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            <span className="sm:hidden">{h.titleMobile.before} {h.titleMobile.accent}</span>
            <span className="hidden sm:inline">{h.titleDesktop.before} {h.titleDesktop.accent}</span>
          </h1>
          <p className="home-hero-in max-w-xl text-lg leading-relaxed text-white/90" style={delay(40)}>
            <span className="sm:hidden">{h.subtitleMobile}</span>
            <span className="hidden sm:inline">{h.subtitleDesktop}</span>
          </p>
          <div className="home-hero-in flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={delay(100)}>
            <Button asChild variant="primary" shape="pill" size="lg" className="home-press">
              <a href="#cohorte">{cohortOpen ? h.primaryOpen : h.primaryClosed}</a>
            </Button>
            <Link to={h.secondary.href} className="home-press text-base font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
              {h.secondary.label}
            </Link>
          </div>
          <p className="home-hero-in flex items-center gap-3 text-base text-white/85" style={delay(160)}>
            <span className="h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
            {cohortOpen ? h.badgeOpen : h.badgeClosed}
          </p>
          <Link to={h.quiz.href} className="home-hero-in w-fit text-sm text-white/80 underline underline-offset-4 hover:text-white" style={delay(200)}>
            {h.quiz.label}
          </Link>
        </div>

        <div className="lg:col-span-5">
          <PeopleBars stat={c.proof.alumniStat} alt="Des alumni de Model Technologie, posés comme les barres d'un tableau de bord qui monte" />
        </div>
      </div>
    </section>
  );
}
