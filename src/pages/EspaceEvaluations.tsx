/**
 * /espace/evaluations — entrée « Évaluations » de la sidebar : redirige vers les évaluations
 * de la formation en cours (ou, à défaut, la première), sinon vers « Mes formations ».
 */
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

import { LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerDashboard } from "@/hooks/useCourse";

export default function EspaceEvaluations() {
  const { data, isLoading } = useLearnerDashboard();

  if (isLoading) {
    return (
      <LearnerShell title="Évaluations">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />
      </LearnerShell>
    );
  }

  const courses = data?.data.courses ?? [];
  const target = courses.find((c) => c.status === "IN_PROGRESS") ?? courses.find((c) => c.status !== "UPCOMING");
  return <Navigate to={target ? `/espace/formations/${target.formationId}/evaluations` : "/espace/formations"} replace />;
}
