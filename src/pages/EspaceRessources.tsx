/**
 * /espace/ressources — bibliothèque de l'apprenant (GET /learner/resources) : toutes les ressources des
 * leçons de ses formations ouvertes. Une ressource verrouillée n'a pas d'adresse tant que le quiz du module
 * n'est pas réussi (le serveur ne la fournit qu'ensuite).
 */
import { Link } from "react-router-dom";
import { Download, FileText, Loader2, Lock } from "lucide-react";

import { Card } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerResources } from "@/hooks/useLearner";
import type { ResourceEntry } from "@/services/api/learnerService";

export default function EspaceRessources() {
  const { data = [], isLoading, isError } = useLearnerResources();

  const groups = new Map<string, { title: string; items: ResourceEntry[] }>();
  for (const r of data) {
    const g = groups.get(r.formationId) ?? { title: r.formationTitle, items: [] };
    g.items.push(r);
    groups.set(r.formationId, g);
  }

  return (
    <LearnerShell title="Ressources" description="Les fichiers de vos formations">
      <div className="flex flex-col gap-6">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger vos ressources pour le moment.
          </div>
        )}

        {Array.from(groups.entries()).map(([formationId, g]) => (
          <Card key={formationId} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">{g.title}</h2>
            <ul className="flex flex-col">
              {g.items.map((r) => (
                <li key={r.id} className="flex items-center gap-3 border-t border-[#E7E0D4] py-3 first:border-t-0">
                  <FileText className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold text-ink">{r.name}</span>
                    <span className="truncate text-xs text-ink-secondary">
                      {r.moduleTitle ? `${r.moduleTitle} · ` : ""}
                      {r.lessonId ? <Link to={`/espace/formations/${formationId}/lecons/${r.lessonId}`} className="underline">{r.lessonTitle ?? "Leçon"}</Link> : null}
                      {r.sizeLabel ? ` · ${r.sizeLabel}` : ""}
                    </span>
                    {r.note && <span className="truncate text-xs text-ink-secondary">{r.note}</span>}
                  </span>
                  {r.locked && !r.url ? (
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
              ))}
            </ul>
          </Card>
        ))}

        {!isLoading && !isError && data.length === 0 && (
          <Card radius="stat" variant="sand" className="flex flex-col gap-2 p-8">
            <p className="font-heading text-lg font-bold text-navy">Aucune ressource pour le moment</p>
            <p className="text-sm text-ink-secondary">Les ressources de vos formations apparaîtront ici dès qu'elles seront publiées et que votre accès sera ouvert.</p>
          </Card>
        )}
      </div>
    </LearnerShell>
  );
}
