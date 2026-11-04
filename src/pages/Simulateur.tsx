/**
 * Simulateur.tsx — page d'offre du simulateur de certification PL-300. Trois chemins, un ordre : l'essai gratuit (test de 15 minutes, posé dans
 * le haut de page, c'est la porte d'entrée), l'achat d'un forfait (prix et moyens de paiement fournis par le serveur) et, tant que l'achat n'est
 * pas ouvert, la liste d'attente. Aucune impasse : un forfait qui ne s'achète pas encore mène à la liste d'attente, un forfait « sur devis » à
 * la page Entreprises.
 *
 * Idée visuelle : un tableau de bord. La couverture de l'examen devient quatre barres dont la hauteur suit le poids de chaque domaine, les
 * forfaits montent avec la préparation, les étapes montent jusqu'à l'examen.
 *
 * Textes, forfaits, tarifs prévisionnels, FAQ et libellés des formulaires viennent du backend (contenu `page.simulateur`, modifiable depuis
 * « Pages du site ») ; les libellés d'action de config/simulateurPage.ts. Un tarif, un badge ou une image vides sont masqués.
 */
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ClosingLayout } from "@/components/formations/ClosingBand";
import { TOP } from "@/components/formations/CohortBars";
import { StickyBar } from "@/components/formations/StickyBar";
import { HeroVideo } from "@/components/home/HeroVideo";
import { HomeFaq } from "@/components/home/HomeFaq";
import { useReveal } from "@/components/home/useReveal";
import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, ContentGate } from "@/components/shared";
import { PurchaseDialog } from "@/components/simulator/PurchaseDialog";
import { TrialForm, WaitlistForm } from "@/components/simulator/SimulatorForms";
import { SIMULATEUR_UI as UI } from "@/config/simulateurPage";
import { usePlans } from "@/hooks/useSimulatorShop";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useStickyHidden } from "@/hooks/useStickyHidden";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/types/payment.type";
import type { PageSimulateur } from "@/types/siteContent";
import type { ShopPlan } from "@/types/simulatorShop.type";
import "@/styles/home.css";

const SECTION = "px-5 py-20 lg:px-20 lg:py-24";
const H2 = "font-heading text-[clamp(22px,3.4vw,48px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance max-w-4xl";
const delay = (ms: number) => ({ ["--d" as string]: ms });
const underline = "underline decoration-white/50 underline-offset-4 hover:decoration-white";

const DEFAULT_TRIAL: NonNullable<PageSimulateur["trial"]> = {
  eyebrow: "Essai gratuit",
  title: "Testez-vous en 15 minutes, gratuitement",
  points: [
    "10 questions représentatives de l'examen, 15 minutes chrono",
    "Votre niveau domaine par domaine dès la fin du test",
    "3 corrections détaillées en français offertes",
    "Sans carte bancaire, une seule tentative",
  ],
  namePlaceholder: "Nom et prénom",
  emailPlaceholder: "E-mail (vous y recevrez votre lien de connexion)",
  phonePlaceholder: "Téléphone / WhatsApp (facultatif)",
  consentLabel: "J'accepte d'être contacté(e) au sujet du simulateur PL-300.",
  submitLabel: "Commencer l'essai gratuit",
  successTitle: "Vérifiez votre boîte mail",
  successText: "Nous venons de vous envoyer un lien de connexion (valable 10 minutes). Cliquez dessus pour démarrer votre essai. Pensez à regarder vos courriers indésirables.",
  note: "Un seul essai par personne. Vos données servent uniquement à vous donner accès au simulateur et à vous informer.",
};

/** Poids d'un domaine pour la hauteur de sa barre : le premier nombre de « 25–30 % » (30 par défaut si la saisie est libre). */
const weightOf = (weight: string): number => {
  const m = /\d+/.exec(weight);
  return m ? Math.min(60, Number(m[0])) : 30;
};

export default function Simulateur() {
  const page = useSiteContent("page.simulateur");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.simulateur} />
      <ContentGate content={page.content} isLoading={page.isLoading} isError={page.isError} onRetry={() => page.refetch()}>
        {(c) => <SimulateurBody c={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function SimulateurBody({ c }: { c: PageSimulateur }) {
  const t = c.trial ?? DEFAULT_TRIAL;
  const shop = usePlans();
  const [buying, setBuying] = useState<ShopPlan | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const closing = useRef<HTMLElement>(null);
  const hideWhenVisible = useMemo(() => [hero], []);
  const stickyHidden = useStickyHidden(hideWhenVisible, closing);
  useReveal(root);

  const plans = c.plans.items;
  // « Réussissez le PL-300 : Microsoft Power BI Data Analyst » → la promesse en grand, le nom de la certification en dessous
  const [head, ...rest] = c.hero.title.split(/\s:\s/);
  const headline = { head, tail: rest.join(" : ") };

  return (
    <div ref={root}>
      {/* Héros : la promesse et l'essai gratuit, côte à côte */}
      <section ref={hero} className="relative isolate overflow-hidden bg-navy-dark text-white">
        <HeroVideo />
        <div className="absolute inset-0 -z-10 bg-navy-dark/75" aria-hidden="true" />

        <div className="grid items-end gap-10 px-5 pb-16 pt-14 lg:grid-cols-12 lg:gap-12 lg:px-20 lg:pb-0 lg:pt-20">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-6 lg:pb-24">
            <h1 className="font-heading text-[clamp(32px,3.8vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance">
              {headline.head}
              {headline.tail && <span className="mt-3 block text-[clamp(18px,1.7vw,24px)] font-semibold leading-snug tracking-normal text-white/90">{headline.tail}</span>}
            </h1>
            {c.hero.badge && <p><span className="rounded-full bg-cta px-3 py-1 text-sm font-bold">{c.hero.badge}</span></p>}
            <p className="home-hero-in max-w-[60ch] text-lg leading-relaxed text-white/90" style={delay(40)}>{c.hero.description}</p>
            <ul className="home-hero-in flex flex-col gap-2 text-base text-white/90" style={delay(100)}>
              {c.hero.points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="home-hero-in flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" style={delay(160)}>
              <Button asChild variant="primary" shape="pill" size="lg" className="home-press lg:hidden">
                <a href={c.hero.primary.href}>{c.hero.primary.label}</a>
              </Button>
              <a href={c.hero.secondary.href} className={cn("home-press inline-flex min-h-11 items-center text-base font-semibold text-white", underline)}>
                {c.hero.secondary.label}
              </a>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <TrialForm t={t} className="home-bar-in" />
          </div>
        </div>
      </section>

      {/* Pour qui */}
      {c.audience.items.length > 0 && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.audience.title}</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {c.audience.items.map((a, i) => (
              <li key={a.title} className={cn(TOP, "reveal bg-surface-sand p-6 pt-12")} style={delay(i * 70)}>
                <h3 className="font-heading text-xl font-bold">{a.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-secondary">{a.description}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid items-end gap-4 lg:grid-cols-12 lg:gap-6">
            {c.hero.image.url && (
              <img
                src={c.hero.image.url}
                alt={c.hero.image.alt}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="reveal aspect-[4/3] w-full rounded-t-[72px] object-cover lg:col-span-7 lg:aspect-[3/2]"
              />
            )}
            <img
              src="/images/photos/picture-1.jpg"
              alt="Une analyste construisant un tableau de bord"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              style={delay(90)}
              className={cn("reveal aspect-[4/3] w-full rounded-t-[72px] object-cover", c.hero.image.url ? "lg:col-span-5" : "lg:col-span-7 lg:aspect-[3/2]")}
            />
            {!c.hero.image.url && (
              <img
                src="/images/photos/cohorte-travail.jpg"
                alt="Apprenantes d'une cohorte Model Technologie travaillant ensemble sur un exercice, en salle à Dakar"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                style={delay(180)}
                className="reveal aspect-[4/3] w-full rounded-t-[72px] object-cover lg:col-span-5"
              />
            )}
          </div>
        </section>
      )}

      {/* Couverture de l'examen : une barre par domaine, haute comme son poids */}
      {c.coverage.domains.length > 0 && (
        <section id="contenu" className={cn(SECTION, "scroll-mt-20 bg-navy-dark text-white")}>
          <h2 className={cn(H2, "reveal")}>{c.coverage.title}</h2>
          <p className="reveal mt-4 max-w-[60ch] text-lg leading-relaxed text-white/90" style={delay(40)}>{c.coverage.intro}</p>
          <p className="reveal mt-2 text-base font-semibold text-cta-on-navy" style={delay(70)}>{c.coverage.version}</p>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end lg:gap-4">
            {c.coverage.domains.map((d, i) => (
              <li
                key={d.name}
                style={{ ["--w" as string]: weightOf(d.weight), ...delay(i * 90) }}
                className={cn(TOP, "reveal flex flex-col gap-4 bg-navy-medium p-6 pt-12 lg:min-h-[calc(200px+var(--w)*9px)]")}
              >
                <p className="font-heading text-[40px] font-extrabold leading-none text-cta-on-navy">{d.weight}</p>
                <h3 className="font-heading text-xl font-bold leading-snug">{d.name}</h3>
                <ul className="flex flex-col gap-2">
                  {d.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3 text-base text-white/90">
                      <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ce que vous aurez */}
      {c.features.items.length > 0 && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.features.title}</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {c.features.items.map((f, i) => (
              <li key={f.title} className={cn(TOP, "reveal bg-surface-sand p-6 pt-12")} style={delay(i * 70)}>
                <h3 className="font-heading text-xl font-bold">{f.title}</h3>
                {f.status && <p className="mt-1 text-base font-semibold text-navy">{f.status}</p>}
                <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-ink-secondary">{f.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Forfaits : ils montent avec la préparation */}
      {plans.length > 0 && (
        <section id="forfaits" className={cn(SECTION, "scroll-mt-20 bg-surface-sand pt-16 text-navy lg:pt-20")}>
          <h2 className={cn(H2, "reveal")}>{c.plans.title}</h2>
          <p className="reveal mt-4 max-w-[60ch] text-base leading-relaxed text-ink-secondary" style={delay(40)}>{c.plans.note}</p>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end lg:gap-4">
            {plans.map((p, i) => {
              // Le prix affiché est celui que le serveur facturera ; à défaut (serveur injoignable), le texte de la page.
              const live = shop.data?.plans.find((x) => x.code === p.code);
              const canBuy = !!live && !!shop.data && (shop.data.online || shop.data.manual);
              const onQuote = p.code === UI.quoteCode;
              return (
                <li
                  key={p.code}
                  style={{ ["--i" as string]: i, ...delay(i * 80) }}
                  className={cn(
                    TOP,
                    "reveal flex flex-col gap-4 p-6 pt-14 lg:min-h-[calc(440px+var(--i)*36px)]",
                    p.highlighted ? "bg-navy text-white" : "bg-white",
                  )}
                >
                  <h3 className="font-heading text-2xl font-extrabold leading-tight">{p.name}</h3>
                  {(live || p.price) && (
                    <p className={cn("font-heading font-extrabold leading-none", onQuote ? "text-2xl" : "text-[40px]")}>{live ? formatAmount(live.priceXof) : p.price}</p>
                  )}
                  <p className={cn("text-base font-semibold", p.highlighted ? "text-cta-on-navy" : "text-ink-secondary")}>
                    {live ? `${live.durationDays} jours · ${live.examAttempts} examen${live.examAttempts > 1 ? "s" : ""} blanc${live.examAttempts > 1 ? "s" : ""}` : p.duration}
                  </p>
                  {p.badge && <p><span className="rounded-full bg-cta px-3 py-1 text-sm font-bold text-white">{p.badge}</span></p>}
                  <ul className="flex flex-col gap-2">
                    {p.features.map((f) => (
                      <li key={f} className={cn("flex items-start gap-3 text-base", p.highlighted ? "text-white/90" : "text-ink-secondary")}>
                        <span className={cn("mt-1.5 h-4 w-2 shrink-0 rounded-t-full", p.highlighted ? "bg-cta-on-navy" : "bg-cta")} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {onQuote ? (
                      <Button asChild variant="navy" shape="pill" size="lg" className="home-press w-full"><Link to={UI.quoteHref}>{UI.quote}</Link></Button>
                    ) : canBuy && live ? (
                      <Button type="button" variant={p.highlighted ? "primary" : "navy"} shape="pill" size="lg" className="home-press w-full" onClick={() => setBuying(live)}>{UI.buy}</Button>
                    ) : (
                      <Button asChild variant={p.highlighted ? "primary" : "navy"} shape="pill" size="lg" className="home-press w-full"><a href="#liste-attente">{UI.joinWaitlist}</a></Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Étapes : on monte jusqu'à l'examen */}
      {c.steps.items.length > 0 && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.steps.title}</h2>
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end lg:gap-4">
            {c.steps.items.map((s, i) => (
              <li
                key={s.title}
                style={{ ["--i" as string]: i, ...delay(i * 90) }}
                className={cn(TOP, "reveal flex flex-col gap-3 p-6 pt-12 text-white lg:min-h-[calc(240px+var(--i)*56px)]", i === c.steps.items.length - 1 ? "bg-cta" : "bg-navy")}
              >
                <span className="font-heading text-[40px] font-extrabold leading-none">{i + 1}</span>
                <h3 className="font-heading text-xl font-bold">{s.title}</h3>
                <p className="text-base leading-relaxed text-white/90">{s.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Liste d'attente */}
      <section id="liste-attente" className={cn(SECTION, "scroll-mt-20 bg-navy-dark pb-0 text-white lg:pb-0")}>
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-6 pb-4 lg:col-span-5 lg:pb-20">
            <h2 className={cn(H2, "reveal")}>{c.waitlist.title}</h2>
            <ul className="reveal flex flex-col gap-2 text-base text-white/90" style={delay(60)}>
              {c.waitlist.points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-1.5 h-4 w-2 shrink-0 rounded-t-full bg-cta-on-navy" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal min-w-0 lg:col-span-7" style={delay(90)}>
            <WaitlistForm w={c.waitlist} />
          </div>
        </div>
      </section>

      {/* Questions */}
      {c.faq.items.length > 0 && (
        <section className={cn(SECTION, "text-navy")}>
          <h2 className={cn(H2, "reveal")}>{c.faq.title}</h2>
          <div className="reveal mt-10 max-w-4xl"><HomeFaq items={c.faq.items} /></div>
        </section>
      )}

      {/* Mentions */}
      {c.disclaimer && (
        <section className="px-5 pb-16 lg:px-20">
          <p className="max-w-[75ch] text-sm leading-relaxed text-ink-secondary">{c.disclaimer}</p>
        </section>
      )}

      {/* Dernier appel : l'essai, ou les forfaits */}
      <ClosingLayout
        ref={closing}
        title={UI.closingTitle}
        actions={
          <>
            <Button asChild variant="navy" shape="pill" size="lg" className="home-press">
              <a href="#essai">{c.hero.primary.label}</a>
            </Button>
            {plans.length > 0 && (
              <a href="#forfaits" className={cn("home-press inline-flex min-h-11 items-center text-base font-semibold text-white", underline)}>{UI.closingMore}</a>
            )}
          </>
        }
      />

      <StickyBar hidden={stickyHidden}>
        <p className="min-w-0 flex-1 truncate font-heading text-base font-bold">{t.title}</p>
        <Button asChild variant="primary" shape="pill" className="home-press shrink-0">
          <a href="#essai">{c.hero.primary.label}</a>
        </Button>
      </StickyBar>

      {buying && shop.data && (
        <PurchaseDialog plan={buying} options={shop.data} termsLabel="J'accepte les conditions d'utilisation et de vente du simulateur." onClose={() => setBuying(null)} />
      )}
    </div>
  );
}
