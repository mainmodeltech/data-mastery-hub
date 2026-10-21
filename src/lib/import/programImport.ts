/**
 * Import en masse d'un programme (modules / leçons) depuis un tableau — fonctions pures.
 * Colonnes : Module ; Leçon ; Type ; Durée (min) ; Description ; Lien vidéo ; Date du live ;
 * Lien du live ; Ressource (nom) ; Ressource (lien). Ajout seulement, nouvelles leçons en brouillon.
 */
import type { CourseModule, Lesson, LessonType } from "../../types/course.type.ts";
import { toRecords } from "./sheet.ts";

export interface ImportError { line: number; message: string }

export interface ParsedLesson {
  line: number;
  moduleTitle: string;
  lesson: Omit<Lesson, "id" | "order">;
}

export interface ParsedProgram { lessons: ParsedLesson[]; errors: ImportError[] }

const TYPES: Record<string, LessonType> = { video: "VIDEO", ressource: "RESOURCE", live: "LIVE", quiz: "QUIZ" };
const TYPE_LABEL: Record<LessonType, string> = { VIDEO: "Vidéo", RESOURCE: "Ressource", LIVE: "Live", QUIZ: "Quiz" };
export const lessonTypeLabel = (t: LessonType) => TYPE_LABEL[t];

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const isHttp = (u: string) => /^https?:\/\/\S+$/i.test(u);

const newKey = () => globalThis.crypto.randomUUID();

/** « 25/12/2026 18:30 » -> « 2026-12-25T18:30 » (heure locale, comme le champ de l'éditeur) ou null. */
export function parseLiveDate(s: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/.exec(s.trim());
  if (!m) return null;
  const [d, mo, y, h = "0", mi = "0"] = m.slice(1);
  const dt = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi));
  if (dt.getUTCFullYear() !== +y || dt.getUTCMonth() !== +mo - 1 || dt.getUTCDate() !== +d || +h > 23 || +mi > 59) return null;
  const p = (n: number | string, l = 2) => String(n).padStart(l, "0");
  return `${p(y, 4)}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}`;
}

function fileTypeOf(url: string): string {
  const m = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url.split("?")[0]);
  const ext = m?.[1]?.toUpperCase();
  return ext && ["PDF", "XLSX", "PBIX", "ZIP", "DOCX", "PPTX", "CSV"].includes(ext) ? ext : "LIEN";
}

const REQUIRED = ["module", "lecon", "type"];

export function parseProgramRows(rows: string[][]): ParsedProgram {
  const { headers, records } = toRecords(rows);
  const errors: ImportError[] = [];
  const lessons: ParsedLesson[] = [];

  if (headers.length === 0) return { lessons, errors: [{ line: 1, message: "le fichier est vide" }] };
  const missing = REQUIRED.filter((h) => !headers.includes(h));
  if (missing.length) {
    const label: Record<string, string> = { module: "Module", lecon: "Leçon", type: "Type" };
    return { lessons, errors: [{ line: 1, message: `colonne obligatoire manquante : ${missing.map((m) => label[m]).join(", ")}` }] };
  }
  if (records.length === 0) return { lessons, errors: [{ line: 1, message: "aucune leçon dans le fichier" }] };

  for (const { line, cells: c } of records) {
    const err = (message: string) => errors.push({ line, message });
    const before = errors.length;
    const moduleTitle = c["module"] ?? "";
    const title = c["lecon"] ?? "";
    if (!moduleTitle) err("le module est obligatoire");
    if (!title) err("le titre de la leçon est obligatoire");

    const typeRaw = c["type"] ?? "";
    const type = TYPES[norm(typeRaw)];
    if (!typeRaw) err("le type est obligatoire (Vidéo, Ressource, Live ou Quiz)");
    else if (!type) err(`type inconnu "${typeRaw}" (attendu : Vidéo, Ressource, Live ou Quiz)`);

    let durationSeconds: number | null = null;
    const dur = c["duree min"] ?? "";
    if (dur) {
      const n = Number(dur.replace(",", "."));
      if (!Number.isFinite(n) || n <= 0 || n > 1440) err(`durée invalide "${dur}" (minutes, nombre positif)`);
      else durationSeconds = Math.round(n * 60);
    }

    const videoUrl = c["lien video"] ?? "";
    if (videoUrl && !isHttp(videoUrl)) err(`lien vidéo invalide "${videoUrl}" (doit commencer par http:// ou https://)`);
    const liveUrl = c["lien du live"] ?? "";
    if (liveUrl && !isHttp(liveUrl)) err(`lien du live invalide "${liveUrl}" (doit commencer par http:// ou https://)`);

    let liveAt: string | null = null;
    const liveRaw = c["date du live"] ?? "";
    if (liveRaw) {
      liveAt = parseLiveDate(liveRaw);
      if (!liveAt) err(`date du live invalide "${liveRaw}" (format JJ/MM/AAAA HH:MM)`);
    }

    const resName = c["ressource nom"] ?? "";
    const resUrl = c["ressource lien"] ?? "";
    if (resUrl && !isHttp(resUrl)) err(`lien de la ressource invalide "${resUrl}" (doit commencer par http:// ou https://)`);
    if (resUrl && !resName) err("le nom de la ressource est obligatoire quand un lien est fourni");
    if (resName && !resUrl) err("le lien de la ressource est obligatoire quand un nom est fourni");

    if (errors.length > before || !type) continue;
    lessons.push({
      line,
      moduleTitle,
      lesson: {
        title,
        type,
        status: "DRAFT",
        durationSeconds,
        description: c["description"] || null,
        videoUrl: videoUrl || null,
        liveAt,
        liveUrl: liveUrl || null,
        quiz: type === "QUIZ" ? { questionCount: 5, passThreshold: 70, maxAttempts: null } : null,
        resources: resName && resUrl ? [{ id: `new-${newKey()}`, name: resName, fileType: fileTypeOf(resUrl), url: resUrl, lockedUntilQuiz: false }] : [],
      },
    });
  }
  return { lessons, errors };
}

const sameTitle = (a: string, b: string) => norm(a) === norm(b);

export interface ProgramPreviewModule { title: string; isNew: boolean; lessons: { title: string; type: LessonType }[] }

/** Aperçu : modules touchés (nouveaux ou existants) et leçons qui seront ajoutées, dans l'ordre du fichier. */
export function previewProgramImport(modules: CourseModule[], parsed: ParsedProgram): ProgramPreviewModule[] {
  const out: ProgramPreviewModule[] = [];
  for (const { moduleTitle, lesson } of parsed.lessons) {
    let m = out.find((x) => sameTitle(x.title, moduleTitle));
    if (!m) {
      const existing = modules.find((x) => sameTitle(x.title, moduleTitle));
      m = { title: existing?.title ?? moduleTitle, isNew: !existing, lessons: [] };
      out.push(m);
    }
    m.lessons.push({ title: lesson.title, type: lesson.type });
  }
  return out;
}

/** Ajout seulement : module de même titre -> leçons à la suite ; sinon nouveau module. Ne modifie pas `modules`. */
export function applyProgramImport(modules: CourseModule[], parsed: ParsedProgram): CourseModule[] {
  const result: CourseModule[] = modules.map((m) => ({ ...m, lessons: [...m.lessons] }));
  for (const { moduleTitle, lesson } of parsed.lessons) {
    let m = result.find((x) => sameTitle(x.title, moduleTitle));
    if (!m) {
      m = { id: `new-${newKey()}`, order: result.length + 1, title: moduleTitle, lessons: [] };
      result.push(m);
    }
    m.lessons.push({ ...lesson, id: `new-${newKey()}`, clientKey: newKey(), order: m.lessons.length + 1 });
  }
  return result;
}
