/**
 * /espace/ressources — toutes les ressources des leçons des formations ouvertes. Une ressource
 * `lockedUntilQuiz` n'a pas d'adresse tant que le quiz du module n'est pas réussi (le serveur ne
 * la fournit qu'ensuite) ; une formation dont l'accès n'est pas ouvert affiche le message du serveur.
 */
import { Link } from "react-router-dom";
import { Download, FileText, Loader2, Lock } from "lucide-react";

import { Card } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useOpenCourses } from "@/hooks/useCourse";
import { accessMessage } from "@/lib/accessErrors";

export default function EspaceRessources() {
  const { isLoading, isError, upcoming, courses } = useOpenCourses();

  const groups = courses
    .map(({ summary, course, error }) => ({
      summary,
      error,
      items: (course?.content.modules ?? []).flatMap((m) =>
        m.lessons.flatMap((l) => l.resources.map((r) => ({ r, lesson: l, moduleTitle: m.title })))
      ),
    }))
    .filter((g) => g.items.length > 0 || g.error);

  return (
    <LearnerShell title="Ressources" description="Les fichiers de vos formations">
      <div className="flex flex-col gap-6">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger vos ressources pour le moment.
          </div>
        )}

        {groups.map((g) => (
          <Card key={g.summary.formationId} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">{g.summary.title}</h2>
            {g.error ? (
              <p role="status" className="text-sm text-warning">{accessMessage(g.error) ?? "Ressources momentanément indisponibles."}</p>
            ) : (
              <ul className="flex flex-col">
                {g.items.map(({ r, lesson, moduleTitle }) => {
                  const locked = !!r.lockedUntilQuiz && !r.url;
                  return (
                    <li key={r.id} className="flex items-center gap-3 border-t border-[#E7E0D4] py-3 first:border-t-0">
                      <FileText className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-semibold text-ink">{r.name}</span>
                        <span className="truncate text-xs text-ink-secondary">
                          {moduleTitle} · <Link to={`/espace/formations/${g.summary.formationId}/lecons/${lesson.id}`} className="underline">{lesson.title}</Link>
                          {r.sizeLabel ? ` · ${r.sizeLabel}` : ""}
                        </span>
                      </span>
                      {locked ? (
                        <span className="flex items-center gap-1 text-xs text-ink-secondary"><Lock className="h-4 w-4" aria-hidden="true" />Après le quiz</span>
                      ) : r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Télécharger ${r.name}`}
                          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E7E0D4] text-navy"
                        >
                          <Download className="h-[18px] w-[18px]" />
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        ))}

        {!isLoading && !isError && groups.length === 0 && (
          <Card radius="stat" variant="sand" className="flex flex-col gap-2 p-8">
            <p className="font-heading text-lg font-bold text-navy">Aucune ressource pour le moment</p>
            <p className="text-sm text-ink-secondary">
              {upcoming.length > 0
                ? "Vos formations ne sont pas encore ouvertes : les ressources apparaîtront dès l'ouverture de l'accès."
                : "Les ressources de vos formations apparaîtront ici dès qu'elles seront publiées."}
            </p>
          </Card>
        )}
      </div>
    </LearnerShell>
  );
}
