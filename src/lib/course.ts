import type { CourseContent, CourseModule, Lesson, LessonProgress } from "@/types/course.type";

export type LessonState = "done" | "current" | "todo" | "locked";

export interface CourseView {
  completed: Set<string>;
  positions: Map<string, number>;
  lessons: { lesson: Lesson; module: CourseModule; moduleIndex: number; indexInModule: number }[];
  lockedModules: Set<string>;
  totalCount: number;
  doneCount: number;
  percent: number;
}

/**
 * Déblocage séquentiel : un module s'ouvre quand toutes les leçons publiées du précédent sont
 * terminées, quiz compris (Lot 6). Une tentative réussie marque la leçon QUIZ comme terminée
 * côté serveur (contrat : src/types/evaluation.type.ts).
 */
export function buildCourseView(content: CourseContent, progress: LessonProgress[]): CourseView {
  const completed = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const positions = new Map(progress.map((p) => [p.lessonId, p.positionSeconds]));

  const lessons = content.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, indexInModule) => ({ lesson, module, moduleIndex, indexInModule }))
  );

  const lockedModules = new Set<string>();
  if (content.settings.sequentialUnlock) {
    let previousComplete = true;
    for (const m of content.modules) {
      if (!previousComplete) lockedModules.add(m.id);
      const required = m.lessons.filter((l) => l.status !== "DRAFT");
      previousComplete = previousComplete && required.every((l) => completed.has(l.id));
    }
  }

  const doneCount = lessons.filter((l) => completed.has(l.lesson.id)).length;
  const totalCount = lessons.length;
  return {
    completed,
    positions,
    lessons,
    lockedModules,
    totalCount,
    doneCount,
    percent: totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100),
  };
}

export function lessonLabel(title: string): string {
  const m = title.match(/^(\d+(?:\.\d+)?)\s/);
  return m ? m[1] : "";
}

export function lessonTitleWithoutLabel(title: string): string {
  return title.replace(/^\d+(?:\.\d+)?\s+/, "");
}

/** Première leçon non terminée d'un module déverrouillé (reprise du parcours). */
export function findResumeLessonId(content: CourseContent, progress: LessonProgress[]): string | null {
  const view = buildCourseView(content, progress);
  const next = view.lessons.find(
    (l) => !view.completed.has(l.lesson.id) && !view.lockedModules.has(l.module.id) && l.lesson.status !== "DRAFT"
  );
  return (next ?? view.lessons[0])?.lesson.id ?? null;
}

export function moduleDurationLabel(lessons: Lesson[]): string {
  const seconds = lessons.reduce((acc, l) => acc + (l.durationSeconds ?? 0), 0);
  const minutes = Math.round(seconds / 60);
  if (minutes === 0) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
