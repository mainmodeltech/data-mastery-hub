/**
 * Formulaire d'une leçon du programme (éditeur de formation).
 * Contrat : api-contract.md §3.D quater et decies.
 *  - vidéo : un seul champ « Lien de la vidéo » (Vimeo ou YouTube). `videoProvider` et
 *    `videoEmbedUrl` sont en lecture seule, calculés par le serveur à l'enregistrement : l'aperçu
 *    n'utilise que `videoEmbedUrl`, jamais une adresse construite depuis le lien saisi ;
 *  - quiz : `questionCount`, `passThreshold` (1–100) et `maxAttempts` (vide = illimité) ;
 *    les questions se saisissent dans la banque de questions (leçon déjà enregistrée) ;
 *  - ressources : 30 par leçon au plus, liens http(s).
 */
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/shared";
import {
  LESSON_STATUS_LABELS, LESSON_TYPE_LABELS,
  type Lesson, type LessonResource, type LessonStatus, type LessonType,
} from "@/types/course.type";

const fieldClass = "w-full rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy";
const labelClass = "flex flex-col gap-1 text-xs font-semibold text-ink-secondary";
export const MAX_RESOURCES = 30;
const FILE_TYPES = ["PDF", "XLSX", "PBIX", "DOCX", "PPTX", "ZIP", "CSV", "LIEN"];

export const newClientId = () => `new-${crypto.randomUUID()}`;
export const isSaved = (id: string) => !id.startsWith("new-");

export function LessonForm({ lesson, onChange }: { lesson: Lesson; onChange: (l: Lesson) => void }) {
  const set = <K extends keyof Lesson>(k: K, v: Lesson[K]) => onChange({ ...lesson, [k]: v });

  const changeType = (type: LessonType) =>
    onChange({
      ...lesson,
      type,
      quiz: type === "QUIZ" ? lesson.quiz ?? { questionCount: 10, passThreshold: 70, maxAttempts: 3 } : lesson.quiz,
    });

  const setQuiz = (patch: Partial<NonNullable<Lesson["quiz"]>>) =>
    set("quiz", { questionCount: 10, passThreshold: 70, maxAttempts: 3, ...lesson.quiz, ...patch });

  const setResource = (id: string, patch: Partial<LessonResource>) =>
    set("resources", lesson.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="grid gap-3 border-t border-[#E7E0D4] bg-white p-4 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Titre *
        <input className={fieldClass} value={lesson.title} maxLength={255} onChange={(e) => set("title", e.target.value)} />
      </label>
      <label className={labelClass}>
        Type
        <select className={fieldClass} value={lesson.type} onChange={(e) => changeType(e.target.value as LessonType)}>
          {(Object.keys(LESSON_TYPE_LABELS) as LessonType[]).map((t) => <option key={t} value={t}>{LESSON_TYPE_LABELS[t]}</option>)}
        </select>
      </label>
      <label className={labelClass}>
        Statut
        <select className={fieldClass} value={lesson.status} onChange={(e) => set("status", e.target.value as LessonStatus)}>
          {(Object.keys(LESSON_STATUS_LABELS) as LessonStatus[]).map((s) => <option key={s} value={s}>{LESSON_STATUS_LABELS[s]}</option>)}
        </select>
        <span className="font-normal">Brouillon : invisible des apprenants. Programmé : visible sans vidéo.</span>
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Sous-titre
        <input className={fieldClass} value={lesson.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value || null)} />
      </label>

      {lesson.type === "VIDEO" && (
        <>
          <label className={`${labelClass} sm:col-span-2`}>
            Lien de la vidéo (Vimeo ou YouTube)
            <input
              type="url"
              className={fieldClass}
              placeholder="https://vimeo.com/123456789"
              value={lesson.videoUrl ?? ""}
              onChange={(e) => set("videoUrl", e.target.value || null)}
            />
          </label>
          <div className="sm:col-span-2">
            {lesson.videoEmbedUrl ? (
              <iframe
                src={lesson.videoEmbedUrl}
                title={`Aperçu : ${lesson.title}`}
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="aspect-video w-full max-w-md rounded-[14px] border-0 bg-navy-dark"
              />
            ) : (
              <p className="text-xs text-ink-secondary">
                {lesson.videoUrl
                  ? "L'aperçu apparaît après l'enregistrement du programme (le serveur reconnaît l'hébergeur)."
                  : "Collez le lien de partage de la vidéo : l'aperçu apparaîtra après l'enregistrement."}
              </p>
            )}
          </div>
          <label className={labelClass}>
            Durée (minutes)
            <input type="number" min={0} className={fieldClass} value={lesson.durationSeconds ? Math.round(lesson.durationSeconds / 60) : ""}
              onChange={(e) => set("durationSeconds", e.target.value ? Number(e.target.value) * 60 : null)} />
          </label>
        </>
      )}

      {lesson.type === "LIVE" && (
        <>
          <label className={labelClass}>
            Date et heure (heure du site)
            <input type="datetime-local" className={fieldClass} value={lesson.liveAt ? lesson.liveAt.slice(0, 16) : ""} onChange={(e) => set("liveAt", e.target.value || null)} />
          </label>
          <label className={labelClass}>
            Lien (Google Meet, Zoom…)
            <input type="url" className={fieldClass} value={lesson.liveUrl ?? ""} onChange={(e) => set("liveUrl", e.target.value || null)} />
          </label>
        </>
      )}

      {lesson.type === "QUIZ" && (
        <>
          <label className={labelClass}>
            Questions tirées au sort
            <input type="number" min={1} className={fieldClass} value={lesson.quiz?.questionCount ?? ""}
              onChange={(e) => setQuiz({ questionCount: Number(e.target.value) })} />
          </label>
          <label className={labelClass}>
            Seuil de réussite (%)
            <input type="number" min={1} max={100} className={fieldClass} value={lesson.quiz?.passThreshold ?? ""}
              onChange={(e) => setQuiz({ passThreshold: Number(e.target.value) })} />
          </label>
          <label className={labelClass}>
            Tentatives max (vide = illimité)
            <input type="number" min={1} className={fieldClass} value={lesson.quiz?.maxAttempts ?? ""}
              onChange={(e) => setQuiz({ maxAttempts: e.target.value ? Number(e.target.value) : null })} />
          </label>
          <div className="flex items-end">
            {isSaved(lesson.id) ? (
              <Button asChild variant="navy" shape="rounded" size="sm">
                <Link to={`/admin/lessons/${lesson.id}/quiz`}>Gérer les questions</Link>
              </Button>
            ) : (
              <p className="text-xs text-ink-secondary">Enregistrez le programme pour pouvoir saisir les questions de ce quiz.</p>
            )}
          </div>
        </>
      )}

      <label className={`${labelClass} sm:col-span-2`}>
        Description
        <textarea rows={3} className={fieldClass} value={lesson.description ?? ""} onChange={(e) => set("description", e.target.value || null)} />
      </label>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-ink-secondary">Ressources ({lesson.resources.length}/{MAX_RESOURCES})</span>
          <Button
            type="button"
            variant="outline"
            shape="rounded"
            size="sm"
            disabled={lesson.resources.length >= MAX_RESOURCES}
            onClick={() => set("resources", [...lesson.resources, { id: newClientId(), name: "", fileType: "PDF", url: "", lockedUntilQuiz: false }])}
          >
            <Plus className="h-4 w-4" /> Ajouter une ressource
          </Button>
        </div>
        {lesson.resources.map((r) => (
          <div key={r.id} className="grid gap-2 rounded-[10px] border border-[#E7E0D4] p-3 sm:grid-cols-[minmax(0,1.2fr)_110px_minmax(0,1.6fr)_auto]">
            <input aria-label="Nom de la ressource" placeholder="Nom (ex. Support du module 1)" className={fieldClass} value={r.name} onChange={(e) => setResource(r.id, { name: e.target.value })} />
            <select aria-label="Type de fichier" className={fieldClass} value={FILE_TYPES.includes(r.fileType) ? r.fileType : "LIEN"} onChange={(e) => setResource(r.id, { fileType: e.target.value })}>
              {FILE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input aria-label="Adresse du fichier" type="url" placeholder="https://…" className={fieldClass} value={r.url ?? ""} onChange={(e) => setResource(r.id, { url: e.target.value })} />
            <button type="button" aria-label="Supprimer la ressource" className="justify-self-end p-2" onClick={() => set("resources", lesson.resources.filter((x) => x.id !== r.id))}>
              <Trash2 className="h-4 w-4 text-error" />
            </button>
            <label className="flex items-center gap-2 text-xs text-ink-secondary sm:col-span-4">
              <input type="checkbox" className="h-4 w-4 accent-[#1A3A5B]" checked={!!r.lockedUntilQuiz} onChange={(e) => setResource(r.id, { lockedUntilQuiz: e.target.checked })} />
              Débloquer seulement après la réussite du quiz du module
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
