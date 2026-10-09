/**
 * CoursePlayer.tsx — lecteur de leçon, Lot 5 (docs/design/screens/app/App-Cours.dc.html
 * + M-Cours.dc.html + M-Programme.dc.html).
 *
 * Lecture vidéo : <iframe> si le serveur fournit `videoEmbedUrl` (Vimeo / YouTube) ; sinon
 * <video> natif sur `videoUrl` ; sinon un état « vidéo pas encore hébergée » — aucun faux lecteur.
 * Les notes sont enregistrées sur l'appareil (localStorage) ; les questions à l'équipe passent
 * par LessonQuestions ; les quiz se passent depuis /evaluations (Lot 6).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Download, ListTree, Loader2, Lock, MessageCircle, Play, X,
} from "lucide-react";

import { Button, Card } from "@/components/shared";
import { DemoDataBanner, LearnerShell } from "@/components/learner/LearnerShell";
import { ProgrammePanel } from "@/components/learner/ProgrammePanel";
import { LessonQuestions } from "@/components/learner/LessonQuestions";
import { useLearnerCourse, useSetLessonProgress } from "@/hooks/useCourse";
import { accessMessage } from "@/lib/accessErrors";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/use-toast";
import { buildCourseView, findResumeLessonId, lessonLabel, lessonTitleWithoutLabel } from "@/lib/course";
import { formatDuration, type Lesson, type LessonResource } from "@/types/course.type";

const FILE_COLORS: Record<string, string> = { PDF: "#9A2E06", XLSX: "#1F6B4F", PBIX: "#8A5A00" };

function ResourceRow({ r, locked }: { r: LessonResource; locked: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#E7E0D4] py-3">
      <span
        className="w-[38px] shrink-0 rounded-lg py-1.5 text-center text-[11px] font-extrabold text-white"
        style={{ background: FILE_COLORS[r.fileType] ?? "#4A5566" }}
      >
        {r.fileType}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-semibold text-ink">{r.name}</span>
        <span className="text-[13px] text-ink-secondary">{locked ? "Disponible après le quiz" : r.sizeLabel ?? r.note ?? ""}</span>
      </span>
      {locked ? (
        <Lock className="h-4 w-4 text-ink-secondary" aria-label="Verrouillé" />
      ) : r.url ? (
        <a
          href={r.url}
          download
          aria-label={`Télécharger ${r.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E7E0D4] text-navy"
        >
          <Download className="h-[18px] w-[18px]" />
        </a>
      ) : (
        <span className="rounded-pill bg-warning-bg px-2 py-0.5 text-[10px] font-bold uppercase text-warning">bientôt</span>
      )}
    </div>
  );
}

function Notes({ lessonId }: { lessonId: string }) {
  const key = `notes:${lessonId}`;
  const [value, setValue] = useState("");
  useEffect(() => {
    try { setValue(localStorage.getItem(key) ?? ""); } catch { setValue(""); }
  }, [key]);
  return (
    <div className="flex flex-col gap-2">
      <textarea
        aria-label="Mes notes"
        rows={6}
        value={value}
        placeholder="Vos notes sur cette leçon…"
        onChange={(e) => {
          setValue(e.target.value);
          try { localStorage.setItem(key, e.target.value); } catch { /* stockage indisponible */ }
        }}
        className="w-full rounded-card border border-[#D6CEC0] bg-white p-3 text-sm outline-none focus:border-navy"
      />
      <span className="text-xs text-ink-secondary">Notes enregistrées sur cet appareil uniquement.</span>
    </div>
  );
}

function LessonBody({ lesson, formationId, onProgress, onEnded, startAt }: {
  lesson: Lesson; formationId: string; onProgress: (s: number) => void; onEnded: () => void; startAt: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSent = useRef(0);

  useEffect(() => {
    if (videoRef.current && startAt > 0) videoRef.current.currentTime = startAt;
  }, [lesson.id, startAt]);

  if (lesson.type === "VIDEO") {
    // Vimeo / YouTube : l'adresse d'intégration vient du serveur, jamais construite depuis videoUrl.
    // Le lecteur tiers ne remonte pas la position : la leçon se marque terminée à la main.
    if (lesson.videoEmbedUrl) {
      return (
        <iframe
          key={lesson.id}
          src={lesson.videoEmbedUrl}
          title={lesson.title}
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full rounded-[18px] border-0 bg-navy-dark"
        />
      );
    }
    if (lesson.videoUrl) {
      return (
        <video
          ref={videoRef}
          key={lesson.id}
          src={lesson.videoUrl}
          controls
          playsInline
          className="aspect-video w-full rounded-[18px] bg-navy-dark"
          onTimeUpdate={(e) => {
            const t = Math.floor(e.currentTarget.currentTime);
            if (Math.abs(t - lastSent.current) >= 10) {
              lastSent.current = t;
              onProgress(t);
            }
          }}
          onEnded={onEnded}
        />
      );
    }
    return (
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[18px] bg-navy-dark text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-cta/40 lg:h-[84px] lg:w-[84px]">
          <Play className="h-7 w-7 text-white/70 lg:h-9 lg:w-9" />
        </span>
        <p className="px-6 text-sm text-[#D5DEE8]">
          Vidéo pas encore hébergée{lesson.durationSeconds ? ` · durée prévue ${formatDuration(lesson.durationSeconds)}` : ""}.
        </p>
      </div>
    );
  }

  const info: Record<string, { title: string; text: string }> = {
    QUIZ: { title: "Quiz", text: lesson.quiz ? `${lesson.quiz.questionCount} questions · ${lesson.quiz.passThreshold} % requis pour valider.` : "Ce quiz se passe depuis vos évaluations." },
    LIVE: { title: "Session en direct", text: lesson.liveAt ? `Prévue le ${new Date(lesson.liveAt).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}.` : "Date à venir." },
    RESOURCE: { title: "Ressources", text: "Retrouvez les fichiers de cette étape ci-dessous." },
  };
  const i = info[lesson.type];
  return (
    <Card radius="stat" variant="sand" className="flex flex-col items-start gap-2 p-8">
      <p className="font-heading text-lg font-bold text-navy">{i.title}</p>
      <p className="text-sm text-ink-secondary">{i.text}</p>
      {lesson.type === "QUIZ" && (
        <Button asChild variant="navy" shape="rounded" size="sm">
          <Link to={`/espace/formations/${formationId}/evaluations`}>Voir mes évaluations</Link>
        </Button>
      )}
      {lesson.type === "LIVE" && lesson.liveUrl && (
        <Button asChild variant="navy" shape="rounded" size="sm">
          <a href={lesson.liveUrl} target="_blank" rel="noreferrer">Rejoindre le live</a>
        </Button>
      )}
    </Card>
  );
}

export default function CoursePlayer() {
  const { id: formationId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { data: result, isLoading, isError, error } = useLearnerCourse(formationId);
  const setProgress = useSetLessonProgress(formationId ?? "");

  const [tab, setTab] = useState<"resources" | "description" | "notes" | "questions">("resources");
  const [sheetOpen, setSheetOpen] = useState(false);

  const course = result?.data;
  const view = useMemo(() => (course ? buildCourseView(course.content, course.progress) : null), [course]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>;
  }
  if (isError || !course || !view || !formationId) {
    return (
      <LearnerShell title="Formation">
        <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
          {accessMessage(error) ?? "Cette formation est introuvable ou n'est pas accessible avec votre compte."}{" "}
          <Link to="/espace" className="font-semibold underline">Retour à mon espace</Link>
        </div>
      </LearnerShell>
    );
  }

  if (!lessonId) {
    const resume = findResumeLessonId(course.content, course.progress);
    return resume ? <Navigate to={`/espace/formations/${formationId}/lecons/${resume}`} replace /> : <Navigate to="/espace" replace />;
  }

  const idx = view.lessons.findIndex((l) => l.lesson.id === lessonId);
  if (idx === -1) return <Navigate to={`/espace/formations/${formationId}`} replace />;
  const current = view.lessons[idx];
  const { lesson, module, moduleIndex, indexInModule } = current;
  if (view.lockedModules.has(module.id)) {
    return <Navigate to={`/espace/formations/${formationId}`} replace />;
  }

  const prev = view.lessons[idx - 1];
  const next = view.lessons.slice(idx + 1).find((l) => !view.lockedModules.has(l.module.id));
  const isDone = view.completed.has(lesson.id);
  const position = view.positions.get(lesson.id) ?? 0;
  const duration = lesson.durationSeconds ?? 0;
  const videoPercent = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  const goTo = (l?: typeof next) => l && navigate(`/espace/formations/${formationId}/lecons/${l.lesson.id}`);

  const save = (completed: boolean, positionSeconds: number) =>
    setProgress.mutate(
      { lessonId: lesson.id, completed, positionSeconds },
      { onError: () => toast({ title: "Progression non enregistrée", description: "Réessayez dans un instant.", variant: "destructive" }) }
    );

  const quizLesson = module.lessons.find((l) => l.type === "QUIZ");
  const heading = `MODULE ${moduleIndex + 1} · LEÇON ${indexInModule + 1} SUR ${module.lessons.length}`;
  const label = lessonLabel(lesson.title);
  const title = lessonTitleWithoutLabel(lesson.subtitle ?? lesson.title);
  const resources = lesson.resources;

  const body = (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold tracking-[1px] text-cta">{heading}</span>
        <h2 className="font-heading text-2xl font-extrabold text-navy lg:text-[30px]">{label && `${label} · `}{title}</h2>
      </div>

      <LessonBody
        lesson={lesson}
        formationId={formationId}
        startAt={position}
        onProgress={(s) => save(isDone, s)}
        onEnded={() => save(true, duration)}
      />
      {lesson.type === "VIDEO" && !lesson.videoEmbedUrl && duration > 0 && (
        <div className="flex justify-between text-[13px] text-ink-secondary">
          <span>{formatDuration(position)} / {formatDuration(duration)}</span>
          <span>{videoPercent} % vu</span>
        </div>
      )}

      <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex">
        <Button variant="outline" shape="rounded" size="sm" className="border-transparent" disabled={!prev} onClick={() => goTo(prev)}>
          <ArrowLeft className="h-4 w-4" /> Leçon précédente
        </Button>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            shape="rounded"
            size="sm"
            aria-pressed={isDone}
            onClick={() => save(!isDone, position)}
          >
            <Check className="h-4 w-4" /> {isDone ? "Terminée" : "Marquer comme terminée"}
          </Button>
          <Button variant="navy" shape="rounded" size="sm" disabled={!next} onClick={() => goTo(next)}>
            Leçon suivante <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div role="tablist" className="flex gap-7 overflow-x-auto border-b border-[#E7E0D4] text-[15px] font-semibold">
        {([
          ["resources", `Ressources (${resources.length})`],
          ["description", "Description"],
          ["notes", "Mes notes"],
          ["questions", "Questions"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`-mb-px whitespace-nowrap border-b-2 py-3 ${tab === k ? "border-cta font-bold text-navy" : "border-transparent text-ink-secondary"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div>
        {tab === "resources" &&
          (resources.length === 0 ? (
            <p className="text-sm text-ink-secondary">Aucune ressource pour cette leçon.</p>
          ) : (
            resources.map((r) => (
              <ResourceRow key={r.id} r={r} locked={!!r.lockedUntilQuiz} />
            ))
          ))}
        {tab === "description" && (
          <p className="text-sm leading-relaxed text-ink-secondary">{lesson.description ?? "Pas de description pour cette leçon."}</p>
        )}
        {tab === "notes" && <Notes lessonId={lesson.id} />}
        {tab === "questions" && <LessonQuestions lessonId={lesson.id} disabled={result?.demo} />}
      </div>

      {!isDesktop && next && (
        <div className="rounded-card bg-warning-bg px-4 py-3 text-[13px] text-warning">
          Suivant : {next.lesson.title}.
        </div>
      )}
    </div>
  );

  const sidebar = (
    <Card radius="stat" className="overflow-hidden p-0">
      <ProgrammePanel formationId={formationId} content={course.content} view={view} currentLessonId={lesson.id} />
      {quizLesson && quizLesson.quiz && (
        <Link
          to={`/espace/formations/${formationId}/evaluations`}
          className="m-4 flex flex-col gap-1.5 rounded-[14px] bg-warning-bg p-4"
        >
          <span className="text-sm font-bold text-warning">{quizLesson.title}</span>
          <span className="text-[13px] text-ink">
            {course.content.settings.sequentialUnlock
              ? `${quizLesson.quiz.passThreshold} % requis pour ouvrir le module suivant.`
              : `${quizLesson.quiz.questionCount} questions · ${quizLesson.quiz.passThreshold} % requis.`}
          </span>
        </Link>
      )}
    </Card>
  );

  if (isDesktop) {
    return (
      <LearnerShell
        title={course.content.title}
        description={[course.cohortLabel, course.trainerName && `formateur : ${course.trainerName}`].filter(Boolean).join(" · ")}
        withTabBar={false}
      >
        <div className="flex flex-col gap-5">
          {result?.demo && <DemoDataBanner />}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setTab("questions")}
              className="flex items-center gap-2 rounded-card border border-[#D6CEC0] bg-white px-4 py-2.5 text-sm font-semibold text-navy"
            >
              <MessageCircle className="h-4 w-4" /> Poser une question
            </button>
          </div>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
            {body}
            {sidebar}
          </div>
        </div>
      </LearnerShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7E0D4] bg-white px-3 py-2">
        <Link to="/espace" aria-label="Retour" className="flex h-11 w-11 items-center justify-center text-navy">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="font-heading font-bold text-navy">{course.content.title}</span>
        <button
          type="button"
          aria-label="Programme"
          onClick={() => setSheetOpen(true)}
          className="flex h-11 w-11 items-center justify-center text-navy"
        >
          <ListTree className="h-5 w-5" />
        </button>
      </header>
      <div className="flex flex-col gap-4 p-4">
        {result?.demo && <DemoDataBanner />}
        {body}
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-30 flex items-end bg-navy-dark/50" onClick={() => setSheetOpen(false)}>
          <div
            role="dialog"
            aria-label="Programme"
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-[24px] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between bg-white px-5 pt-3">
              <span className="mx-auto mb-2 h-[5px] w-10 rounded-pill bg-[#D6CEC0]" />
              <button type="button" aria-label="Fermer" onClick={() => setSheetOpen(false)} className="absolute right-3 top-2 flex h-10 w-10 items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProgrammePanel
              formationId={formationId}
              content={course.content}
              view={view}
              currentLessonId={lesson.id}
              expandAll={false}
              onNavigate={() => setSheetOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-[1fr,2fr] gap-2.5 border-t border-[#E7E0D4] bg-white p-3">
        <Button variant="outline" shape="rounded" disabled={!prev} onClick={() => goTo(prev)}>Préc.</Button>
        <Button
          variant="primary"
          shape="rounded"
          onClick={() => {
            save(true, position);
            goTo(next);
          }}
        >
          Terminer et suivant
        </Button>
      </div>
    </div>
  );
}
