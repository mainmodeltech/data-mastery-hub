import { Loader2 } from "lucide-react";

import { Card } from "@/components/shared";
import { CourseList } from "@/components/learner/CourseList";
import { DemoDataBanner, LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerDashboard } from "@/hooks/useCourse";

export default function MesFormations() {
  const { data: result, isLoading, isError } = useLearnerDashboard();

  return (
    <LearnerShell title="Mes formations" description="Toutes vos formations, en cours et à venir">
      <div className="flex flex-col gap-6">
        {result?.demo && <DemoDataBanner />}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger vos formations pour le moment.
          </div>
        )}
        {result && (
          <Card radius="stat" className="p-5 lg:p-6">
            <CourseList courses={result.data.courses} />
          </Card>
        )}
      </div>
    </LearnerShell>
  );
}
