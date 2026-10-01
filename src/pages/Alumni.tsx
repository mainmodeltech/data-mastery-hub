/**
 * Alumni.tsx — Lot 2 (docs/design/README.md §2, screens/site/Alumni.dc.html)
 *
 * Redesign complet sur le nouveau design system, données réelles inchangées :
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
import { Button, Pill, Card, SectionHeader } from "@/components/shared";
import { usePublishedTestimonials } from "@/hooks/useTestimonials";
import { usePublishedAlumni, usePublishedProjects, usePublishedProjectDetail } from "@/hooks/useAlumni";
import type { AlumniSummary } from "@/services/api/networkingService";
import type { Testimonial } from "@/types/testimonial.types";
import { getInitials, getGradientFromName } from "@/types/testimonial.types";

const STATIC_TESTIMONIALS: Testimonial[] = [
  { id: "s1", name: "Fatou Ndiaye", role: "Analyste BI", company: "Sonatel", bootcamp: "Power BI", result: "Reportings réduits de 2 jours à 2 heures", content: "Avant le bootcamp, je passais 2 jours à consolider nos reportings manuellement. Aujourd'hui, Power BI le fait en 2 heures.", rating: 5, published: true, displayOrder: 1, createdAt: "", updatedAt: "" },
  { id: "s2", name: "Moussa Sow", role: "Data Analyst", company: "Wave Mobile Money", bootcamp: "Data Analyst", result: "Poste décroché en 12 semaines", content: "12 semaines après être entré sans aucune expérience technique, j'avais un poste. Le réseau alumni fait vraiment la différence.", rating: 5, published: true, displayOrder: 2, createdAt: "", updatedAt: "" },
  { id: "s3", name: "Aïssatou Fall", role: "Contrôleur de Gestion Senior", company: "Baobab Groupe", bootcamp: "Power BI", result: "80% des tâches récurrentes automatisées", content: "J'avais des bases en Excel mais je plafonnais. Le bootcamp Power BI m'a donné les outils pour automatiser 80% de mes tâches.", rating: 5, published: true, displayOrder: 3, createdAt: "", updatedAt: "" },
  { id: "s4", name: "Ibrahima Diallo", role: "SQL Developer", company: "BICIS", bootcamp: "Data Analyst", result: "3 offres d'emploi en 6 semaines", content: "La pédagogie par projets réels m'a permis d'avoir un portfolio concret à montrer en entretien.", rating: 5, published: true, displayOrder: 4, createdAt: "", updatedAt: "" },
  { id: "s5", name: "Mariama Ba", role: "Business Analyst", company: "Orange Senegal", bootcamp: "Data Analyst", result: "Intégrée dans la communauté alumni active", content: "La communauté alumni est un vrai atout. On s'entraide, on partage des opportunités.", rating: 5, published: true, displayOrder: 5, createdAt: "", updatedAt: "" },
  { id: "s6", name: "Cheikh Mbaye", role: "Reporting Manager", company: "Microfinance Institution", bootcamp: "Power BI", result: "Formation compatible avec un emploi à plein temps", content: "Les séances soir/week-end et la pédagogie pratique m'ont permis de rester opérationnel.", rating: 5, published: true, displayOrder: 6, createdAt: "", updatedAt: "" },
];

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
  const { data: dbTestimonials } = usePublishedTestimonials();
  const testimonials = dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : STATIC_TESTIMONIALS;
  const { data: projects = [], isLoading: loadingProjects } = usePublishedProjects();
  const { data: alumni = [] } = usePublishedAlumni();

  const [activeCategory, setActiveCategory] = useState("Tous");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(testimonials.map((t) => t.bootcamp).filter(Boolean) as string[]))],
    [testimonials]
  );
  const filteredTestimonials =
    activeCategory === "Tous" ? testimonials : testimonials.filter((t) => t.bootcamp === activeCategory);
  const featured = testimonials[0];

  return (
    <SiteLayout>
      <SeoHead {...PAGE_SEO.alumni} />

      {/* Hero */}
      <section className="px-6 py-20 text-center lg:px-20">
        <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">ALUMNI</span>
        <h1 className="mx-auto mt-4 max-w-2xl font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-navy">
          Ils ont changé leur façon de travailler.
        </h1>
      </section>

      {/* Stat strip */}
      <section className="px-6 pb-16 lg:px-20">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-[#E7E0D4] bg-[#E7E0D4] lg:grid-cols-4">
          {[
            { value: alumni.length > 0 ? `${alumni.length}+` : "30+", label: "alumni depuis 2023" },
            { value: "90%", label: "en poste ou promus < 6 mois" },
            { value: "10+", label: "entreprises où travaillent les alumni" },
            { value: "4.9/5", label: "note moyenne" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 bg-white p-6 text-center">
              <p className="font-heading text-2xl font-extrabold text-navy">{s.value}</p>
              <p className="text-xs text-ink-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured story */}
      {featured && (
        <section className="px-6 pb-16 lg:px-20">
          <div className="grid gap-8 rounded-hero bg-navy p-10 text-white lg:grid-cols-[1fr,1.3fr]">
            <div className="flex h-56 items-center justify-center rounded-callout bg-white/10 text-sm text-[#C9D4E0] lg:h-auto">
              Photo — {featured.name}
            </div>
            <div className="flex flex-col justify-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[1px] text-cta-on-navy">HISTOIRE À LA UNE</span>
              <p className="font-heading text-xl font-bold">« {featured.content} »</p>
              {featured.result && (
                <div className="flex gap-3">
                  <div className="rounded-card bg-navy-dark px-4 py-3">
                    <p className="text-xs text-[#C9D4E0]">Résultat</p>
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
        <SectionHeader eyebrow="TÉMOIGNAGES" title="En leurs propres mots." />
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
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
      </section>

      {/* Projets finaux */}
      {(loadingProjects || projects.length > 0) && (
        <section className="bg-surface-sand px-6 py-16 lg:px-20">
          <SectionHeader eyebrow="PROJETS FINAUX" title="Ce qu'ils ont construit." />
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
                        <span className="text-xs text-ink-secondary">Capture du projet</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-5">
                      <Pill variant="info" className="w-fit">{(project.toolsTechnologies?.[0] ?? "Projet").toUpperCase()}</Pill>
                      <p className="font-heading text-sm font-bold text-navy">{project.title}</p>
                      <p className="text-xs text-ink-secondary">
                        {project.members[0]?.alumni.name ?? "Équipe"} · {project.cohort ?? project.year}
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
      <section className="px-6 py-16 lg:px-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card radius="card" variant="sand" className="flex flex-col gap-3 p-8">
            <p className="font-heading text-lg font-bold text-navy">VOUS ÊTES ALUMNI</p>
            <p className="text-sm text-ink-secondary">Partagez votre expérience avec la prochaine cohorte.</p>
            <Button asChild variant="navy" shape="pill" className="w-fit">
              <Link to="/contact">Partager mon témoignage</Link>
            </Button>
          </Card>
          <Card radius="card" className="flex flex-col gap-3 p-8">
            <p className="font-heading text-lg font-bold text-navy">VOUS RECRUTEZ</p>
            <p className="text-sm text-ink-secondary">Accédez à notre vivier de talents certifiés.</p>
            <Button asChild variant="outline" shape="pill" className="w-fit">
              <Link to="/contact">Publier une offre</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-20 lg:px-20">
        <Card radius="callout" shadow className="flex flex-col items-center gap-4 p-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="font-heading text-xl font-bold text-navy">Votre histoire commence à la prochaine cohorte.</p>
          <Button asChild variant="primary" shape="pill">
            <Link to="/formations">Candidater</Link>
          </Button>
        </Card>
      </section>

      <AlumniProjectModal projectId={selectedProjectId} onClose={() => setSelectedProjectId(null)} />
    </SiteLayout>
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
