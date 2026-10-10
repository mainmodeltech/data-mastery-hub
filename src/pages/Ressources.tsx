/**
 * Ressources.tsx — Lot 2 (docs/design/README.md §2, screens/site/Ressources.dc.html)
 *
 * Articles, téléchargements, atelier et textes viennent du backend (contenu `page.ressources`, éditable depuis
 * l'administration). Aucun contenu d'illustration n'est affiché : tant qu'aucun article ni modèle n'est publié,
 * la page présente le quiz et la newsletter avec un message d'attente. La newsletter est un vrai formulaire.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Download, CheckCircle, Loader2 } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader, ContentGate } from "@/components/shared";
import { useSubscribeNewsletter } from "@/hooks/useSiteForms";
import { useSiteContent } from "@/hooks/useSiteContent";
import { submitErrorMessage } from "@/lib/formErrors";
import type { PageRessources, ResourceArticle } from "@/types/siteContent";

function ArticleLink({ article, readLabel, children }: { article: ResourceArticle; readLabel: string; children: React.ReactNode }) {
  if (!article.url) return <>{children}</>;
  const external = /^https?:\/\//.test(article.url);
  return external ? (
    <a href={article.url} target="_blank" rel="noreferrer" aria-label={`${readLabel} : ${article.title}`} className="block">
      {children}
    </a>
  ) : (
    <Link to={article.url} aria-label={`${readLabel} : ${article.title}`} className="block">
      {children}
    </Link>
  );
}

export default function Ressources() {
  const page = useSiteContent("page.ressources");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.ressources} />
      <ContentGate content={page.content} isLoading={page.isLoading} isError={page.isError} onRetry={() => page.refetch()}>
        {(c) => <RessourcesBody c={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function RessourcesBody({ c }: { c: PageRessources }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();
  const subscribed = subscribe.isSuccess;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribe.mutate({ email: email.trim(), source: "ressources" });
  };

  const hasContent = c.articles.items.length > 0 || c.downloads.items.length > 0 || Boolean(c.featured.item.title);
  const needle = query.trim().toLowerCase();
  const filteredArticles = c.articles.items.filter(
    (a) =>
      (!activeCategory || a.category === activeCategory) &&
      (!needle || `${a.title} ${a.summary ?? ""} ${a.category}`.toLowerCase().includes(needle)),
  );
  const featured = c.featured.item;
  const recent = c.articles.items.slice(0, 3);

  return (
    <>
      {/* Hero + recherche + filtres */}
      <section className="px-6 py-20 text-center lg:px-20">
        <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.hero.eyebrow}</span>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
          {c.hero.title}
        </h1>
        {hasContent ? (
          <>
            <form className="mx-auto mt-6 flex max-w-md items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-1 items-center gap-2 rounded-pill border border-[#D6CEC0] bg-white px-4 py-2.5">
                <Search className="h-4 w-4 text-ink-secondary" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={c.hero.searchPlaceholder}
                  aria-label="Rechercher une ressource"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <Button type="submit" variant="primary" shape="pill">{c.hero.searchLabel}</Button>
            </form>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[null, ...c.categories].map((cat) => (
                <button
                  key={cat ?? "all"}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={
                    cat === activeCategory
                      ? "rounded-pill bg-navy px-4 py-2 font-sans text-sm font-semibold text-white"
                      : "rounded-pill border border-[#D6CEC0] px-4 py-2 font-sans text-sm text-ink-secondary"
                  }
                >
                  {cat ?? c.hero.allLabel}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mx-auto mt-6 max-w-xl text-ink-secondary">{c.emptyNotice}</p>
        )}
      </section>

      {/* À la une + récents */}
      {featured.title && (
        <section className="grid gap-6 px-6 pb-16 lg:grid-cols-[1.3fr,1fr] lg:px-20">
          <ArticleLink article={featured} readLabel={c.articles.readLabel}>
            <Card radius="callout" className="flex flex-col gap-3 overflow-hidden p-0">
              <img
                src={featured.image || c.featured.imageFallback}
                alt=""
                loading="lazy"
                className="h-56 w-full object-cover"
              />
              <div className="flex flex-col gap-2 p-6">
                <Pill variant="error" className="w-fit">{c.featured.badge}{featured.category ? ` · ${featured.category}` : ""}</Pill>
                <p className="font-heading text-lg font-bold text-navy">{featured.title}</p>
                {featured.summary && <p className="text-sm text-ink-secondary">{featured.summary}</p>}
              </div>
            </Card>
          </ArticleLink>
          <div className="flex flex-col gap-4">
            {recent.map((a) => (
              <ArticleLink key={a.title} article={a} readLabel={c.articles.readLabel}>
                <div className="flex gap-4 rounded-card border border-[#E7E0D4] bg-white p-4">
                  {a.image && <img src={a.image} alt="" loading="lazy" className="h-16 w-20 shrink-0 rounded-[6px] object-cover" />}
                  <div>
                    <Pill variant="neutral">{a.category}</Pill>
                    <p className="mt-1 font-heading text-sm font-bold text-navy">{a.title}</p>
                    {a.readMin ? <p className="text-xs text-ink-secondary">Lecture {a.readMin} min</p> : null}
                  </div>
                </div>
              </ArticleLink>
            ))}
          </div>
        </section>
      )}

      {/* Boîte à outils gratuite */}
      {c.downloads.items.length > 0 && (
        <section className="bg-navy px-6 py-16 text-white lg:px-20">
          <SectionHeader eyebrow={c.downloads.eyebrow} title={c.downloads.title} />
          <p className="mt-2 text-sm text-[#C9D4E0]">{c.downloads.subtitle}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {c.downloads.items.map((d) => (
              <Card key={d.title} radius="card" className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <Pill variant="neutral">{d.category}</Pill>
                  <Pill variant="info">{d.format}</Pill>
                </div>
                <p className="font-heading font-bold text-navy">{d.title}</p>
                <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-cta hover:text-cta/80">
                  <Download className="h-4 w-4" /> {c.downloads.downloadLabel}
                </a>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Blog */}
      {c.articles.items.length > 0 && (
        <section className="px-6 py-16 lg:px-20">
          <SectionHeader eyebrow={c.articles.eyebrow} title={c.articles.title} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((a) => (
              <ArticleLink key={a.title} article={a} readLabel={c.articles.readLabel}>
                <Card radius="card" className="flex h-full flex-col gap-2 overflow-hidden p-0">
                  {a.image && <img src={a.image} alt="" loading="lazy" className="h-32 w-full object-cover" />}
                  <div className="flex flex-col gap-1 p-5">
                    <Pill variant="neutral" className="w-fit">{a.category}</Pill>
                    <p className="font-heading text-sm font-bold text-navy">{a.title}</p>
                    {a.summary && <p className="text-xs text-ink-secondary">{a.summary}</p>}
                    {(a.author || a.date) && (
                      <p className="text-xs text-ink-secondary">{[a.author, a.date].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </Card>
              </ArticleLink>
            ))}
            {filteredArticles.length === 0 && <p className="text-sm text-ink-secondary">{c.articles.empty}</p>}
          </div>
        </section>
      )}

      {/* Atelier + Quiz */}
      <section className={`grid gap-6 px-6 pb-16 lg:px-20 ${c.workshop.enabled ? "lg:grid-cols-2" : ""}`}>
        {c.workshop.enabled && (
          <Card radius="card" className="flex flex-col gap-3 p-8">
            <Pill variant="error" className="w-fit">{c.workshop.badge}</Pill>
            <p className="font-heading text-lg font-bold text-navy">{c.workshop.title}</p>
            <p className="text-sm text-ink-secondary">{[c.workshop.subject, c.workshop.date, c.workshop.time].filter(Boolean).join(" · ")}</p>
            <Button asChild variant="primary" shape="pill" className="w-fit">
              <Link to={c.workshop.cta.href}>{c.workshop.cta.label}</Link>
            </Button>
          </Card>
        )}
        <Card radius="card" variant="sand" className="flex flex-col gap-3 p-8">
          <p className="font-heading text-lg font-bold text-navy">{c.quiz.title}</p>
          <p className="text-sm text-ink-secondary">{c.quiz.description}</p>
          <Button asChild variant="navy" shape="pill" className="w-fit">
            <Link to={c.quiz.cta.href}>{c.quiz.cta.label}</Link>
          </Button>
        </Card>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="px-6 pb-20 lg:px-20">
        <Card radius="callout" className="flex flex-col items-center gap-4 p-10 text-center">
          <p className="font-heading text-xl font-bold text-navy">{c.newsletter.title}</p>
          <p className="text-sm text-ink-secondary">{c.newsletter.subtitle}</p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" /> {c.newsletter.successText}
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-sm gap-2">
              <input
                type="email"
                required
                placeholder={c.newsletter.placeholder}
                aria-label="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-pill border border-[#D6CEC0] px-4 py-2.5 text-sm outline-none focus:border-navy"
              />
              <Button type="submit" variant="primary" shape="pill" disabled={subscribe.isPending}>
                {subscribe.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : c.newsletter.submitLabel}
              </Button>
            </form>
          )}
          {subscribe.isError && (
            <p role="alert" className="text-sm text-error">{submitErrorMessage(subscribe.error)}</p>
          )}
        </Card>
      </section>
    </>
  );
}
