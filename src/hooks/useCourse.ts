import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { courseService } from "@/services/courseService";
import type { CourseContent, LearnerCourse, LessonProgress, WithDemo } from "@/types/course.type";
import { QUERY_CONFIG } from "@/config/constants";

export const COURSE_KEYS = {
  dashboard: ["learner", "dashboard"] as const,
  course: (formationId: string) => ["learner", "course", formationId] as const,
  adminContent: (formationId: string) => ["admin", "course-content", formationId] as const,
};

export function useLearnerDashboard() {
  return useQuery({
    queryKey: COURSE_KEYS.dashboard,
    queryFn: courseService.getDashboard,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useLearnerCourse(formationId: string | undefined) {
  return useQuery({
    queryKey: COURSE_KEYS.course(formationId ?? ""),
    queryFn: () => courseService.getLearnerCourse(formationId as string),
    enabled: !!formationId,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Met à jour la progression : cache local immédiat, appel API sauf en mode démonstration. */
export function useSetLessonProgress(formationId: string) {
  const qc = useQueryClient();
  const key = COURSE_KEYS.course(formationId);

  return useMutation({
    mutationFn: async ({ lessonId, completed, positionSeconds }: LessonProgress) => {
      const cached = qc.getQueryData<WithDemo<LearnerCourse>>(key);
      if (cached?.demo) return;
      await courseService.setLessonProgress(lessonId, { completed, positionSeconds });
    },
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WithDemo<LearnerCourse>>(key);
      if (previous) {
        const others = previous.data.progress.filter((p) => p.lessonId !== next.lessonId);
        qc.setQueryData<WithDemo<LearnerCourse>>(key, {
          ...previous,
          data: { ...previous.data, progress: [...others, next] },
        });
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
  });
}

export function useAdminCourseContent(formationId: string | undefined, title?: string) {
  return useQuery({
    queryKey: COURSE_KEYS.adminContent(formationId ?? ""),
    queryFn: () => courseService.getAdminContent(formationId as string, title),
    enabled: !!formationId,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

export function useSaveAdminCourseContent(formationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: CourseContent) => courseService.saveAdminContent(formationId, content),
    onSuccess: (saved) => {
      qc.setQueryData<WithDemo<CourseContent>>(COURSE_KEYS.adminContent(formationId), { data: saved, demo: false });
    },
  });
}

/**
 * Formations dont l'accès est ouvert, avec leur programme (cache partagé avec le lecteur de cours).
 * Les formations « à venir » n'ont pas encore d'accès : le serveur répond 403 jusqu'à la date
 * d'ouverture, on ne les interroge donc pas.
 */
export function useOpenCourses() {
  const dashboard = useLearnerDashboard();
  const all = dashboard.data?.data.courses ?? [];
  const open = all.filter((c) => c.status !== "UPCOMING");
  const upcoming = all.filter((c) => c.status === "UPCOMING");
  const queries = useQueries({
    queries: open.map((c) => ({
      queryKey: COURSE_KEYS.course(c.formationId),
      queryFn: () => courseService.getLearnerCourse(c.formationId),
      staleTime: QUERY_CONFIG.staleTime,
    })),
  });
  return {
    isLoading: dashboard.isLoading || queries.some((q) => q.isLoading),
    isError: dashboard.isError,
    upcoming,
    courses: open.map((summary, i) => ({ summary, course: queries[i]?.data?.data, error: queries[i]?.error })),
  };
}
