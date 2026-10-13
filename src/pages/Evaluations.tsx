/**
 * Evaluations.tsx — Lot 6 (docs/design/screens/app/App-Evaluations.dc.html)
 * Route : /espace/formations/:id/evaluations
 *
 * Quiz (statut, score, tentatives), projet final (dépôt de fichiers + historique du formateur)
 * et conditions du certificat. Données réelles via GET /learner/formations/{id}/evaluations ;
 * démonstration signalée par un bandeau tant que l'endpoint n'existe pas.
 */
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";

import { Button, Card, Pill } from "@/components/shared";
import { DemoDataBanner, LearnerShell } from "@/components/learner/LearnerShell";
import { useDeleteProjectFile, useEvaluationsOverview, useUploadProjectFile } from "@/hooks/useEvaluations";
import { accessMessage } from "@/lib/accessErrors";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  attemptsLabel,
  attemptsRemaining,
  PROJECT_STATUS_LABELS,
  quizFormatLabel,
  type CertificateCondition,
  type ProjectOverview,
  type ProjectStatus,
  type QuizSummary,
} from "@/types/evaluation.type";

const ROW_GRID = "lg:grid lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_120px] lg:items-center lg:gap-3";

function quizPill(q: QuizSummary) {
  switch (q.status) {
    case "PASSED":
      return <Pill variant="success">Réussi</Pill>;
    case "TO_DO":
      return <Pill variant="warning">{q.dueLabel ? `À faire ${q.dueLabel.toLowerCase()}` : "À faire"}</Pill>;
    case "AVAILABLE":
      return <Pill variant="info">Disponible</Pill>;
    case "FAILED":
      return <Pill variant="error">À repasser</Pill>;
    default:
      return <Pill variant="neutral">Verrouillé</Pill>;
  }
}

function QuizAction({ q, formationId }: { q: QuizSummary; formationId: string }) {
  const to = `/espace/formations/${formationId}/evaluations/${q.id}`;
  const remaining = attemptsRemaining(q);
  if (q.status === "LOCKED") return null;
  if (q.status === "PASSED") {
    return <Button asChild variant="outline" shape="rounded" size="sm"><Link to={to}>Revoir</Link></Button>;
  }
  if (remaining === 0) return null;
  if (q.status === "TO_DO" || q.status === "FAILED") {
    return (
      <Button asChild variant="primary" shape="rounded" size="sm">
        <Link to={to}>{q.attemptsUsed > 0 ? "Réessayer" : "Commencer"}</Link>
      </Button>
    );
  }
  return <Button asChild variant="outline" shape="rounded" size="sm"><Link to={to}>Lancer</Link></Button>;
}

function QuizTable({ quizzes, passThreshold, formationId }: { quizzes: QuizSummary[]; passThreshold: number; formationId: string }) {
  return (
    <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-bold text-navy">Quiz</h2>
        <span className="text-sm text-ink-secondary">Score minimum pour valider : {passThreshold} %</span>
      </div>

      <div className="flex flex-col">
        <div className={cn("hidden rounded-[10px] bg-app-bg px-4 py-3 text-xs font-bold tracking-[0.8px] text-ink-secondary", ROW_GRID)}>
          <span>QUIZ</span><span>FORMAT</span><span>STATUT</span><span>SCORE</span><span>TENTATIVES</span><span />
        </div>
        {quizzes.map((q) => (
          <div
            key={q.id}
            className={cn("flex flex-col gap-3 border-b border-[#E7E0D4] py-4 text-sm last:border-b-0 lg:px-4 lg:py-3.5", ROW_GRID)}
          >
            <span className="font-semibold text-ink">{q.title}</span>
            <span className="text-ink-secondary lg:text-ink">{quizFormatLabel(q)}</span>
            <span>{quizPill(q)}</span>
            <span className="font-bold text-ink">
              <span className="font-normal text-ink-secondary lg:hidden">Score : </span>
              {q.bestScore != null ? `${q.bestScore} %` : "—"}
            </span>
            <span className="text-ink">
              <span className="text-ink-secondary lg:hidden">Tentatives : </span>
              {q.status === "LOCKED" ? "—" : attemptsLabel(q.attemptsUsed, q.maxAttempts)}
            </span>
            <span><QuizAction q={q} formationId={formationId} /></span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const PROJECT_PILL: Record<ProjectStatus, "neutral" | "info" | "warning" | "success"> = {
  NOT_STARTED: "warning",
  SUBMITTED: "info",
  CHANGES_REQUESTED: "warning",
  VALIDATED: "success",
};

function ProjectCard({ project, formationId }: { project: ProjectOverview; formationId: string }) {
  const { toast } = useToast();
  const upload = useUploadProjectFile(formationId);
  const remove = useDeleteProjectFile(formationId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = project.acceptedExtensions.map((e) => `.${e}`).join(",");
  const validated = project.status === "VALIDATED";

  const handleFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!project.acceptedExtensions.includes(ext)) {
        toast({ title: `Format non accepté : .${ext || "?"}`, description: `Formats : ${accept.split(",").join(", ")}`, variant: "destructive" });
        continue;
      }
      if (file.size > project.maxSizeMb * 1024 * 1024) {
        toast({ title: `${file.name} dépasse ${project.maxSizeMb} Mo`, variant: "destructive" });
        continue;
      }
      try {
        await upload.mutateAsync(file);
        toast({ title: "Fichier déposé", description: file.name });
      } catch (err) {
        // Motif renvoyé par le serveur (taille, format, stockage indisponible…) quand il est explicite
        const reason = err instanceof Error && err.message && !/^Erreur \d+$/.test(err.message) ? err.message : null;
        toast({ title: "Échec du dépôt", description: reason ? `${file.name} — ${reason}` : file.name, variant: "destructive" });
      }
    }
  };

  return (
    <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-bold text-navy">Projet final</h2>
        <Pill variant={PROJECT_PILL[project.status]}>
          {project.status === "NOT_STARTED" && project.deadlineLabel ? project.deadlineLabel : PROJECT_STATUS_LABELS[project.status]}
        </Pill>
      </div>
      <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">{project.brief}</p>

      {!validated && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); void handleFiles(e.dataTransfer.files); }}
          className={cn(
            "flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed p-7 text-center",
            dragging ? "border-navy bg-info-bg" : "border-[#D6CEC0] bg-app-bg"
          )}
        >
          <Upload className="h-7 w-7 text-navy" aria-hidden="true" />
          <span className="font-bold text-navy">Glissez vos fichiers ici</span>
          <span className="text-[0.8125rem] text-ink-secondary">
            {project.acceptedExtensions.map((e) => `.${e}`).join(", ")} — {project.maxSizeMb} Mo max
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            className="sr-only"
            aria-label="Choisir des fichiers"
            onChange={(e) => { if (e.target.files) void handleFiles(e.target.files); e.target.value = ""; }}
          />
          <Button type="button" variant="outline" shape="rounded" size="sm" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
            {upload.isPending ? <Loader2 className="animate-spin" /> : "Choisir des fichiers"}
          </Button>
        </div>
      )}

      {project.files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {project.files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-xl bg-app-bg px-4 py-3 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{f.name}</span>
              <span className="shrink-0 text-ink-secondary">{f.sizeLabel}</span>
              {!validated && (
                <button
                  type="button"
                  aria-label={`Retirer ${f.name}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(f.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-white hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {project.feedback.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[0.8125rem] font-bold tracking-[1px] text-ink-secondary">HISTORIQUE</span>
          {project.feedback.map((fb) => (
            <div key={fb.id} className="flex items-start gap-3 rounded-xl bg-app-bg p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-[#0F5C73] text-xs font-bold text-white">
                {fb.authorName.replace(/[^A-Za-zÀ-ÿ ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "FM"}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-sm">
                  <span className="font-bold">{fb.authorName}</span> a commenté votre projet ·{" "}
                  {format(new Date(fb.createdAt), "d MMM", { locale: fr })}
                </span>
                <span className="text-sm text-ink-secondary">« {fb.message} »</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ConditionRow({ c }: { c: CertificateCondition }) {
  const partial = !c.met && c.percent > 0;
  const color = c.met ? "#1F6B4F" : partial ? "#8A5A00" : "#B9AE9C";
  const valueColor = c.met ? "text-success" : partial ? "text-warning" : "text-ink-secondary";
  return (
    <div className="flex flex-col gap-2 border-b border-[#E7E0D4] py-3 last:border-b-0">
      <div className="flex justify-between gap-3 text-[0.9375rem]">
        <span className="font-semibold">{c.label}</span>
        <span className={cn("shrink-0 font-bold", valueColor)}>{c.valueLabel}</span>
      </div>
      <div
        role="progressbar"
        aria-label={c.label}
        aria-valuenow={c.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-pill bg-[#ECE6DB]"
      >
        <div className="h-full rounded-pill" style={{ width: `${c.percent}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Evaluations() {
  const { id } = useParams<{ id: string }>();
  const { data: result, isLoading, isError, error } = useEvaluationsOverview(id);
  const overview = result?.data;

  return (
    <LearnerShell
      title="Évaluations"
      description={overview ? [overview.formationTitle, overview.cohortLabel].filter(Boolean).join(" · ") : undefined}
    >
      <div className="flex flex-col gap-6">
        {result?.demo && <DemoDataBanner />}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            {accessMessage(error) ?? "Impossible de charger vos évaluations pour le moment."}
          </div>
        )}
        {overview && id && (
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-5">
              <QuizTable quizzes={overview.quizzes} passThreshold={overview.passThreshold} formationId={id} />
              {overview.project && <ProjectCard project={overview.project} formationId={id} />}
            </div>
            <Card radius="stat" className="flex min-w-0 flex-col gap-1 border border-[#E7E0D4] p-5 lg:p-6">
              <h2 className="mb-2 font-heading text-xl font-bold text-navy">Conditions pour obtenir le certificat</h2>
              {overview.conditions.map((c) => <ConditionRow key={c.key} c={c} />)}
              <p className="pt-3 text-[0.8125rem] text-ink-secondary">
                Dès que tout est vert, votre certificat est généré et vous recevez le lien par e-mail.
              </p>
            </Card>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
