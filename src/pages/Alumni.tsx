/**
 * Alumni.tsx — Lot 2 (docs/design/README.md §2, screens/site/Alumni.dc.html)
 *
 * Textes, libellés, statistiques et photo viennent du backend (contenu `page.alumni`). Aucun témoignage de
 * remplacement : seuls les témoignages réellement publiés sont affichés. Données réelles :
 * usePublishedTestimonials / usePublishedProjects / usePublishedAlumni /
 * usePublishedProjectDetail (backend Spring Boot). ProjectDetailModal réutilisée
 * telle quelle (logique complexe, déjà fonctionnelle, non montrée dans l'écran de
 * référence). Le répertoire alumni en grille de l'ancienne page n'existe plus
 * dans Alumni.dc.html (remplacé par témoignages filtrables + projets) — le compte
 * d'alumni réel alimente toujours le bandeau de stats.
 */
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Linkedin, ExternalLink, ChevronLeft, ChevronRight, X, Users, Loader2 } from "lucide-react";

import { SeoHead, PAGE_SEO } from "@/components/SeoHead";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Pill, Card, SectionHeader, ContentGate } from "@/components/shared";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { useSiteContent } from "@/hooks/useSiteContent";
import { fill } from "@/lib/template";
import type { PageAlumni } from "@/types/siteContent";
import { usePublishedAlumni, usePublishedProjects, usePublishedProjectDetail } from "@/hooks/useAlumni";
import type { AlumniSummary } from "@/services/api/networkingService";
import { getInitials, getGradientFromName } from "@/types/testimonial.types";

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-pill font-sans text-xs font-bold text-white"
      style={{ width: size, height: size, background: getGradientFromName(name) }}
    >
      {getInitials(name)}
    </span>
  );
}

function AlumniAvatar({ alumni, size = 36 }: { alumni: Pick<AlumniSummary, "name" | "photoUrl">; size?: number }) {
  if (alumni.photoUrl) {
    return <img src={alumni.photoUrl} alt={alumni.name} className="shrink-0 rounded-pill object-cover" style={{ width: size, height: size }} />;
  }
  return <Avatar name={alumni.name} size={size} />;
}

export default function Alumni() {
  const page = useSiteContent("page.alumni");

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.alumni} />
      <ContentGate content={page.content} isLoading={page.isLoading} isError={page.isError} onRetry={() => page.refetch()}>
        {(c) => <AlumniBody c={c} />}
      </ContentGate>
    </SiteLayout>
  );
}

function AlumniBody({ c }: { c: PageAlumni }) {
  const { data: testimonials = [] } = usePublishedTestimonials();
  const { data: projects = [], isLoading: loadingProjects } = usePublishedProjects();
  const { data: alumni = [] } = usePublishedAlumni();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(testimonials.map((t) => t.bootcamp).filter(Boolean) as string[])),
    [testimonials]
  );
  const filteredTestimonials = activeCategory ? testimonials.filter((t) => t.bootcamp === activeCategory) : testimonials;
  const featured = testimonials[0];
  const featuredAlumni = featured ? alumni.find((a) => a.name === featured.name) : undefined;

  // Variables des statistiques : calculées sur les données réelles ; une statistique non calculable est masquée.
  const rated = testimonials.filter((t) => typeof t.rating === "number" && t.rating > 0);
  const vars = {
    alumniCount: alumni.length > 0 ? alumni.length : null,
    rating: rated.length > 0 ? (rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length).toFixed(1) : null,
  };
  const stats = c.stats
    .map((s) => ({ value: fill(s.value, vars), label: s.label }))
    .filter((s) => !/\{\w+\}/.test(s.value));

  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-10 pt-20 text-center lg:px-20">
        <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">{c.hero.eyebrow}</span>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
          {c.hero.title}
        </h1>
        {c.hero.image && (
          <img
            src={c.hero.image}
            alt={c.hero.imageAlt}
            loading="eager"
            className="mx-auto mt-10 h-56 w-full max-w-5xl rounded-hero object-cover object-[center_60%] sm:h-72 lg:h-96"
          />
        )}
      </section>

      {/* Stat strip */}
      {stats.length > 0 && (
        <section className="px-6 pb-16 lg:px-20">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-[#E7E0D4] bg-[#E7E0D4] lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 bg-white p-6 text-center">
                <p className="font-heading text-2xl font-extrabold text-navy">{s.value}</p>
                <p className="text-xs text-ink-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured story */}
      {featured && (
        <section className="px-6 pb-16 lg:px-20">
          <div className="grid gap-8 rounded-hero bg-navy p-10 text-white lg:grid-cols-[1fr,1.3fr]">
            <div className="flex h-56 items-center justify-center overflow-hidden rounded-callout bg-white/10 lg:h-auto">
              {featuredAlumni?.photoUrl ? (
                <img src={featuredAlumni.photoUrl} alt={featured.name} className="h-full w-full object-cover" />
              ) : (
                <Avatar name={featured.name} size={96} />
              )}
            </div>
            <div className="flex flex-col justify-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[1px] text-cta-on-navy">{c.featured.label}</span>
              <p className="font-heading text-xl font-bold">« {featured.content} »</p>
              {featured.result && (
                <div className="flex gap-3">
                  <div className="rounded-card bg-navy-dark px-4 py-3">
                    <p className="text-xs text-[#C9D4E0]">{c.featured.resultLabel}</p>
                    <p className="font-heading font-bold">{featured.result}</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-[#C9D4E0]">
                {featured.name} · {[featured.role, featured.company].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Témoignages filtrables */}
      <section className="px-6 pb-16 lg:px-20">
        <SectionHeader eyebrow={c.testimonials.eyebrow} title={c.testimonials.title} />
        {testimonials.length === 0 ? (
          <p className="mt-8 text-sm text-ink-secondary">{c.testimonials.empty}</p>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {[null, ...categories].map((cat) => (
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
                    {cat ?? c.testimonials.allLabel}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTestimonials.map((t) => (
                <Card key={t.id} radius="card" className="flex flex-col gap-4 p-6">
                  <p className="text-sm text-ink-secondary">« {t.content} »</p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#E7E0D4] pt-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} size={36} />
                      <div>
                        <p className="font-heading text-sm font-bold text-navy">{t.name}</p>
                        <p className="text-xs text-ink-secondary">
                          {[t.role, t.company].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    {t.bootcamp && <Pill variant="neutral">{t.bootcamp}</Pill>}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Projets finaux */}
      {(loadingProjects || projects.length > 0) && (
        <section className="bg-surface-sand px-6 py-16 lg:px-20">
          <SectionHeader eyebrow={c.projects.eyebrow} title={c.projects.title} />
          {loadingProjects ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-ink-secondary" />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <button key={project.id} type="button" onClick={() => setSelectedProjectId(project.id)} className="text-left">
                  <Card radius="card" className="flex h-full flex-col gap-0 overflow-hidden p-0 transition-shadow hover:shadow-[0_20px_40px_rgba(26,58,91,0.08)]">
                    <div className="relative flex h-[180px] items-center justify-center bg-white">
                      {project.coverImageUrl ? (
                        <img src={project.coverImageUrl} alt={project.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-ink-secondary">{c.projects.fallbackCapture}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-5">
                      <Pill variant="info" className="w-fit">{(project.toolsTechnologies?.[0] ?? c.projects.fallbackTag).toUpperCase()}</Pill>
                      <p className="font-heading text-sm font-bold text-navy">{project.title}</p>
                      <p className="text-xs text-ink-secondary">
                        {[project.members[0]?.alumni.name, project.cohort ?? project.year].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CTAs */}
      {c.ctas.length > 0 && (
        <section className="px-6 py-16 lg:px-20">
          <div className="grid gap-6 lg:grid-cols-2">
            {c.ctas.map((cta) => (
              <Card key={cta.title} radius="card" variant={cta.style === "navy" ? "sand" : "default"} className="flex flex-col gap-3 p-8">
                <p className="font-heading text-lg font-bold text-navy">{cta.title}</p>
                <p className="text-sm text-ink-secondary">{cta.description}</p>
                <Button asChild variant={cta.style === "navy" ? "navy" : "outline"} shape="pill" className="w-fit">
                  <Link to={cta.href}>{cta.label}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="px-6 pb-20 lg:px-20">
        <Card radius="callout" shadow className="flex flex-col items-center gap-4 p-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="font-heading text-xl font-bold text-navy">{c.closing.title}</p>
          <Button asChild variant="primary" shape="pill">
            <Link to={c.closing.cta.href}>{c.closing.cta.label}</Link>
          </Button>
        </Card>
      </section>

      <AlumniProjectModal projectId={selectedProjectId} onClose={() => setSelectedProjectId(null)} />
    </>
  );
}

function AlumniProjectModal({ projectId, onClose }: { projectId: string | null; onClose: () => void }) {
  const { data: project, isLoading } = usePublishedProjectDetail(projectId);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => setPhotoIdx(0), [projectId]);

  if (!projectId) return null;
  const screenshots = project?.screenshots ?? [];
  const prevPhoto = () => setPhotoIdx((i) => (i === 0 ? screenshots.length - 1 : i - 1));
  const nextPhoto = () => setPhotoIdx((i) => (i === screenshots.length - 1 ? 0 : i + 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-callout bg-white">
        <div className="flex items-start justify-between border-b border-[#E7E0D4] p-6">
          <div className="pr-4">
            {isLoading ? (
              <div className="h-6 w-48 animate-pulse rounded bg-surface-sand" />
            ) : (
              <>
                {project?.cohort && <Pill variant="info">{project.cohort}</Pill>}
                <h3 className="mt-2 font-heading text-xl font-bold text-navy">{project?.title}</h3>
              </>
            )}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface-sand">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-ink-secondary" />
            </div>
          ) : project ? (
            <div className="flex flex-col gap-5">
              {project.description && <p className="text-sm text-ink-secondary">{project.description}</p>}

              {(project.toolsTechnologies?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.toolsTechnologies!.map((t) => (
                    <Pill key={t} variant="neutral">{t}</Pill>
                  ))}
                </div>
              )}

              {project.members.length > 0 && (
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-ink-secondary">
                    <Users className="h-3.5 w-3.5" /> L'équipe
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {project.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-card border border-[#E7E0D4] p-3">
                        <AlumniAvatar alumni={m.alumni} size={36} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-navy">{m.alumni.name}</p>
                          {m.alumni.currentTitle && <p className="truncate text-xs text-ink-secondary">{m.alumni.currentTitle}</p>}
                        </div>
                        {m.alumni.linkedinUrl && (
                          <a href={m.alumni.linkedinUrl} target="_blank" rel="noreferrer" className="shrink-0 text-navy hover:text-cta">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {screenshots.length > 0 && (
                <div className="relative overflow-hidden rounded-card border border-[#E7E0D4]">
                  <img src={screenshots[photoIdx].photoUrl} alt={screenshots[photoIdx].caption ?? ""} className="h-56 w-full object-cover" />
                  {screenshots.length > 1 && (
                    <>
                      <button onClick={prevPhoto} className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-white/90">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={nextPhoto} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-pill bg-white/90">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {project.accessLink && (
                <a href={project.accessLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-card border border-[#E7E0D4] p-3 text-sm font-medium text-navy hover:bg-surface-sand">
                  <ExternalLink className="h-4 w-4" /> Voir le projet en ligne
                </a>
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-ink-secondary">Projet introuvable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
