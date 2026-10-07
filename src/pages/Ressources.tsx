/**
 * Ressources.tsx — Lot 2 (docs/design/README.md §2, screens/site/Ressources.dc.html)
 *
 * Blog/outils/newsletter : pas de backend CMS/blog aujourd'hui — contenu
 * illustratif (placeholders), comme la référence design elle-même. Le quiz
 * d'orientation reste le moteur existant à /orientation (803 lignes de logique
 * réelle) : cette page ne fait que le teaser/lien, pas une réécriture.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Download, CheckCircle, Loader2 } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader } from "@/components/shared";
import { useSubscribeNewsletter } from "@/hooks/useSiteForms";
import { submitErrorMessage } from "@/lib/formErrors";

const CATEGORIES = ["Tout", "Excel", "Power BI", "Python", "SQL", "Carrière data", "Études de cas"];

const RECENT_ARTICLES = [
  { category: "Power BI", title: "5 fonctions DAX à connaître absolument", readMin: 6 },
  { category: "Excel", title: "RECHERCHEV vs INDEX/MATCH : lequel choisir ?", readMin: 4 },
  { category: "Carrière data", title: "Comment préparer un entretien Data Analyst", readMin: 8 },
];

const BLOG_ARTICLES = [
  { category: "Python", title: "Nettoyer un dataset avec Pandas en 10 lignes", author: "Model Technologie", date: "Jan. 2026" },
  { category: "SQL", title: "Les window functions expliquées simplement", author: "Model Technologie", date: "Déc. 2025" },
  { category: "Carrière data", title: "Construire son portfolio data sans expérience", author: "Model Technologie", date: "Déc. 2025" },
  { category: "Étude de cas", title: "Comment un reporting de 2 jours est passé à 2 heures", author: "Model Technologie", date: "Nov. 2025" },
  { category: "Power BI", title: "Modèle en étoile : les bases en 5 minutes", author: "Model Technologie", date: "Nov. 2025" },
  { category: "Excel", title: "Automatiser un reporting mensuel avec Power Query", author: "Model Technologie", date: "Oct. 2025" },
];

const DOWNLOADS = [
  { category: "Excel", format: "XLSX", title: "Modèle de tableau de bord financier" },
  { category: "Power BI", format: "PDF", title: "Checklist de modélisation de données" },
  { category: "Carrière data", format: "PDF", title: "Template de CV Data Analyst" },
];

export default function Ressources() {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();
  const subscribed = subscribe.isSuccess;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribe.mutate({ email: email.trim(), source: "ressources" });
  };

  const filteredArticles =
    activeCategory === "Tout" ? BLOG_ARTICLES : BLOG_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.ressources} />

      {/* Hero + recherche + filtres */}
      <section className="px-6 py-20 text-center lg:px-20">
        <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">RESSOURCES</span>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
          Apprenez un peu chaque semaine.
        </h1>
        <form className="mx-auto mt-6 flex max-w-md items-center gap-2" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-1 items-center gap-2 rounded-pill border border-[#D6CEC0] bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-ink-secondary" />
            <input
              type="search"
              placeholder="RECHERCHEV, DAX, pandas…"
              aria-label="Rechercher une ressource"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Button type="submit" variant="primary" shape="pill">Rechercher</Button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={
                c === activeCategory
                  ? "rounded-pill bg-navy px-4 py-2 font-sans text-sm font-semibold text-white"
                  : "rounded-pill border border-[#D6CEC0] px-4 py-2 font-sans text-sm text-ink-secondary"
              }
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* À la une + récents */}
      <section className="grid gap-6 px-6 pb-16 lg:grid-cols-[1.3fr,1fr] lg:px-20">
        <Card radius="callout" className="flex flex-col gap-3 p-0 overflow-hidden">
          <div className="flex h-56 items-center justify-center bg-surface-sand text-sm text-ink-secondary">
            Image — étude de cas
          </div>
          <div className="flex flex-col gap-2 p-6">
            <Pill variant="error" className="w-fit">À LA UNE · ÉTUDE DE CAS</Pill>
            <p className="font-heading text-lg font-bold text-navy">
              Comment un reporting de 2 jours est passé à 2 heures avec Power BI
            </p>
            <p className="text-sm text-ink-secondary">
              Le détail de la refonte d'un reporting financier chez un de nos clients entreprise.
            </p>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          {RECENT_ARTICLES.map((a) => (
            <div key={a.title} className="flex gap-4 rounded-card border border-[#E7E0D4] bg-white p-4">
              <div className="h-16 w-20 shrink-0 rounded-[6px] bg-surface-sand" />
              <div>
                <Pill variant="neutral">{a.category}</Pill>
                <p className="mt-1 font-heading text-sm font-bold text-navy">{a.title}</p>
                <p className="text-xs text-ink-secondary">Lecture {a.readMin} min</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Boîte à outils gratuite */}
      <section className="bg-navy px-6 py-16 text-white lg:px-20">
        <SectionHeader eyebrow="BOÎTE À OUTILS GRATUITE" title="Des modèles prêts à utiliser dès demain." />
        <p className="mt-2 text-sm text-[#C9D4E0]">Téléchargement par e-mail, aucun engagement.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {DOWNLOADS.map((d) => (
            <Card key={d.title} radius="card" className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <Pill variant="neutral">{d.category}</Pill>
                <Pill variant="info">{d.format}</Pill>
              </div>
              <p className="font-heading font-bold text-navy">{d.title}</p>
              <a href="#newsletter" className="flex items-center gap-1 text-sm font-semibold text-cta hover:text-cta/80">
                <Download className="h-4 w-4" /> Télécharger gratuitement
              </a>
            </Card>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="px-6 py-16 lg:px-20">
        <SectionHeader eyebrow="LE BLOG" title="Derniers articles" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((a) => (
            <Card key={a.title} radius="card" className="flex flex-col gap-2 p-0 overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-surface-sand text-xs text-ink-secondary">
                Image
              </div>
              <div className="flex flex-col gap-1 p-5">
                <Pill variant="neutral" className="w-fit">{a.category}</Pill>
                <p className="font-heading text-sm font-bold text-navy">{a.title}</p>
                <p className="text-xs text-ink-secondary">{a.author} · {a.date}</p>
              </div>
            </Card>
          ))}
          {filteredArticles.length === 0 && (
            <p className="text-sm text-ink-secondary">Aucun article dans cette catégorie pour le moment.</p>
          )}
        </div>
      </section>

      {/* Atelier + Quiz */}
      <section className="grid gap-6 px-6 pb-16 lg:grid-cols-2 lg:px-20">
        <Card radius="card" className="flex flex-col gap-3 p-8">
          <Pill variant="error" className="w-fit">En direct</Pill>
          <p className="font-heading text-lg font-bold text-navy">ATELIER GRATUIT EN LIGNE</p>
          <p className="text-sm text-ink-secondary">[Titre de l'atelier] · [date] · [heure] (GMT)</p>
          <Button variant="primary" shape="pill" className="w-fit">Réserver ma place</Button>
        </Card>
        <Card radius="card" variant="sand" className="flex flex-col gap-3 p-8">
          <p className="font-heading text-lg font-bold text-navy">QUIZ D'ORIENTATION</p>
          <p className="text-sm text-ink-secondary">5 questions, 2 minutes — trouvez la formation faite pour vous.</p>
          <Button asChild variant="navy" shape="pill" className="w-fit">
            <Link to="/orientation">Commencer le quiz</Link>
          </Button>
        </Card>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="px-6 pb-20 lg:px-20">
        <Card radius="callout" className="flex flex-col items-center gap-4 p-10 text-center">
          <p className="font-heading text-xl font-bold text-navy">Une astuce data par mois, dans votre boîte mail.</p>
          <p className="text-sm text-ink-secondary">Pas de spam. Désinscription en un clic.</p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" /> Merci ! Confirmez votre adresse via l'e-mail que nous venons de vous envoyer.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-sm gap-2">
              <input
                type="email"
                required
                placeholder="vous@exemple.com"
                aria-label="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-pill border border-[#D6CEC0] px-4 py-2.5 text-sm outline-none focus:border-navy"
              />
              <Button type="submit" variant="primary" shape="pill" disabled={subscribe.isPending}>
                {subscribe.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'abonner"}
              </Button>
            </form>
          )}
          {subscribe.isError && (
            <p role="alert" className="text-sm text-error">{submitErrorMessage(subscribe.error)}</p>
          )}
        </Card>
      </section>
    </SiteLayout>
  );
}
