/**
 * Panneau « Programme » : barre latérale du lecteur (desktop) et feuille basse (mobile)
 * — App-Cours.dc.html / M-Programme.dc.html.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, CircleHelp, Lock, Play, Radio, FileText } from "lucide-react";

import { ProgressBar } from "@/components/shared";
import type { CourseContent, Lesson } from "@/types/course.type";
import type { CourseView } from "@/lib/course";
import { cn } from "@/lib/utils";

function TypeIcon({ lesson }: { lesson: Lesson }) {
  const cls = "h-3.5 w-3.5 shrink-0 text-ink-secondary";
  if (lesson.type === "QUIZ") return <CircleHelp className={cls} />;
  if (lesson.type === "RESOURCE") return <FileText className={cls} />;
  if (lesson.type === "LIVE") return <Radio className={cls} />;
  return <Play className={cls} />;
}

export interface ProgrammePanelProps {
  formationId: string;
  content: CourseContent;
  view: CourseView;
  currentLessonId: string | undefined;
  /** Desktop : tous les modules ouverts ; mobile : seulement le module courant. */
  expandAll?: boolean;
  onNavigate?: () => void;
}

export function ProgrammePanel({ formationId, content, view, currentLessonId, expandAll = true, onNavigate }: ProgrammePanelProps) {
  const currentModuleId = view.lessons.find((l) => l.lesson.id === currentLessonId)?.module.id;
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(expandAll ? content.modules.map((m) => m.id) : currentModuleId ? [currentModuleId] : [])
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2.5 p-5">
        <span className="font-heading text-lg font-bold text-navy">Programme</span>
        <ProgressBar value={view.percent} aria-label="Progression du cours" className="h-2" />
        <span className="text-[0.8125rem] text-ink-secondary">
          {view.doneCount} leçons sur {view.totalCount} · {view.percent} %
        </span>
      </div>

      {content.modules.map((m) => {
        const locked = view.lockedModules.has(m.id);
        const done = m.lessons.filter((l) => view.completed.has(l.id)).length;
        const isOpen = open.has(m.id) && !locked;
        return (
          <div key={m.id} className="border-t border-[#E7E0D4]">
            <button
              type="button"
              disabled={locked}
              onClick={() => toggle(m.id)}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left text-sm font-bold",
                locked ? "cursor-not-allowed text-[#8A93A0]" : "text-navy"
              )}
            >
              <span>{m.title}</span>
              {locked ? (
                <Lock className="h-4 w-4" aria-label="Module verrouillé" />
              ) : (
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-pill px-2 py-0.5 text-xs",
                      done === m.lessons.length ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                    )}
                  >
                    {done}/{m.lessons.length}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </span>
              )}
            </button>

            {isOpen &&
              m.lessons.map((l) => {
                const isDone = view.completed.has(l.id);
                const isCurrent = l.id === currentLessonId;
                return (
                  <Link
                    key={l.id}
                    to={`/espace/formations/${formationId}/lecons/${l.id}`}
                    onClick={onNavigate}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 py-2.5 pl-6 pr-5 text-sm text-ink hover:bg-app-bg",
                      isCurrent && "bg-error-bg hover:bg-error-bg"
                    )}
                  >
                    {isDone ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-success">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "h-5 w-5 shrink-0 rounded-pill border-2",
                          isCurrent ? "border-cta" : "border-[#D6CEC0]"
                        )}
                      />
                    )}
                    <span className="flex-1">{l.title}</span>
                    <TypeIcon lesson={l} />
                  </Link>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
