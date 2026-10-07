/**
 * AdminFormationEditor.tsx — éditeur de formation, Lot 5
 * (docs/design/screens/app/App-Admin-Formation.dc.html).
 *
 * L'onglet « Programme » édite l'arbre modules → leçons (contrat course.type.ts : PUT
 * /admin/formations/{id}/content). Les infos catalogue (domaine, partenaire, niveau, prix,
 * visibilité) viennent de la vraie formation en lecture seule : elles se modifient dans la
 * fiche formation existante. Le réordonnancement se fait par boutons haut/bas (accessible
 * au clavier) plutôt qu'au glisser-déposer.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronDown, ChevronUp, CircleHelp, FileText, Loader2, Play, Plus, Radio, Trash2,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button, Card, Pill } from "@/components/shared";
import { ComingSoonLink } from "@/components/layouts/ComingSoonLink";
import { useAdminCourseContent, useSaveAdminCourseContent } from "@/hooks/useCourse";
import { useFormations } from "@/hooks/useFormations";
import { useToast } from "@/hooks/use-toast";
import { moduleDurationLabel } from "@/lib/course";
import { ApiError } from "@/services/httpClient";
import {
  LESSON_STATUS_LABELS, LESSON_TYPE_LABELS, formatDuration,
  type CourseContent, type CourseModule, type CourseSettings, type Lesson, type LessonStatus, type LessonType,
} from "@/types/course.type";

const fieldClass = "w-full rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy";
const STATUS_VARIANT: Record<LessonStatus, "success" | "info" | "warning"> = { PUBLISHED: "success", SCHEDULED: "info", DRAFT: "warning" };

const newId = () => `new-${crypto.randomUUID()}`;
const reorder = <T extends { order: number }>(items: T[]): T[] => items.map((it, i) => ({ ...it, order: i + 1 }));

function move<T>(arr: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= arr.length) return arr;
  const copy = arr.slice();
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

function TypeIcon({ type }: { type: LessonType }) {
  const cls = "h-[18px] w-[18px] text-navy";
  if (type === "QUIZ") return <CircleHelp className={cls} />;
  if (type === "RESOURCE") return <FileText className={cls} />;
  if (type === "LIVE") return <Radio className={cls} />;
  return <Play className={cls} />;
}

function lessonSubtitle(l: Lesson): string {
  if (l.type === "QUIZ" && l.quiz) return `${l.quiz.questionCount} questions · ${l.quiz.passThreshold} % requis · ${l.quiz.maxAttempts} tentatives`;
  if (l.type === "LIVE") return l.liveAt ? format(new Date(l.liveAt), "EEE d MMM · HH'h'mm", { locale: fr }) : "Date à définir";
  if (l.type === "RESOURCE") return `${l.resources.length} fichier(s)`;
  return [l.durationSeconds ? formatDuration(l.durationSeconds) : null, l.subtitle].filter(Boolean).join(" · ") || "—";
}

function LessonForm({ lesson, onChange }: { lesson: Lesson; onChange: (l: Lesson) => void }) {
  const set = <K extends keyof Lesson>(k: K, v: Lesson[K]) => onChange({ ...lesson, [k]: v });
  return (
    <div className="grid gap-3 border-t border-[#E7E0D4] bg-white p-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary sm:col-span-2">
        Titre
        <input className={fieldClass} value={lesson.title} onChange={(e) => set("title", e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
        Type
        <select className={fieldClass} value={lesson.type} onChange={(e) => set("type", e.target.value as LessonType)}>
          {(Object.keys(LESSON_TYPE_LABELS) as LessonType[]).map((t) => <option key={t} value={t}>{LESSON_TYPE_LABELS[t]}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
        Statut
        <select className={fieldClass} value={lesson.status} onChange={(e) => set("status", e.target.value as LessonStatus)}>
          {(Object.keys(LESSON_STATUS_LABELS) as LessonStatus[]).map((s) => <option key={s} value={s}>{LESSON_STATUS_LABELS[s]}</option>)}
        </select>
      </label>
      {lesson.type === "VIDEO" && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Durée (minutes)
            <input type="number" min={0} className={fieldClass} value={lesson.durationSeconds ? Math.round(lesson.durationSeconds / 60) : ""}
              onChange={(e) => set("durationSeconds", e.target.value ? Number(e.target.value) * 60 : null)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Identifiant hébergeur vidéo
            <input className={fieldClass} placeholder="ID chez la plateforme vidéo" value={lesson.videoProviderId ?? ""}
              onChange={(e) => set("videoProviderId", e.target.value || null)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary sm:col-span-2">
            Description
            <textarea rows={3} className={fieldClass} value={lesson.description ?? ""} onChange={(e) => set("description", e.target.value || null)} />
          </label>
        </>
      )}
      {lesson.type === "LIVE" && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Date et heure
            <input type="datetime-local" className={fieldClass} value={lesson.liveAt ? lesson.liveAt.slice(0, 16) : ""} onChange={(e) => set("liveAt", e.target.value || null)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Lien (Google Meet…)
            <input type="url" className={fieldClass} value={lesson.liveUrl ?? ""} onChange={(e) => set("liveUrl", e.target.value || null)} />
          </label>
        </>
      )}
      {lesson.type === "QUIZ" && (
        <>
          {([["questionCount", "Questions"], ["passThreshold", "Seuil de réussite (%)"], ["maxAttempts", "Tentatives max"]] as const).map(([k, label]) => (
            <label key={k} className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
              {label}
              <input type="number" min={1} className={fieldClass}
                value={lesson.quiz?.[k] ?? ""}
                onChange={(e) =>
                  set("quiz", { questionCount: 10, passThreshold: 70, maxAttempts: 3, ...lesson.quiz, [k]: Number(e.target.value) })
                } />
            </label>
          ))}
        </>
      )}
    </div>
  );
}

export default function AdminFormationEditor() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: formations = [] } = useFormations();
  const formation = formations.find((f) => f.id === id);

  const { data: result, isLoading, isError } = useAdminCourseContent(id, formation?.title);
  const save = useSaveAdminCourseContent(id ?? "");

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [settings, setSettings] = useState<CourseSettings | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!result) return;
    setModules(result.data.modules);
    setSettings(result.data.settings);
    setDirty(false);
  }, [result]);

  const content: CourseContent | null = useMemo(
    () => (result && settings ? { ...result.data, title: formation?.title ?? result.data.title, settings, modules: reorder(modules) } : null),
    [result, settings, modules, formation]
  );

  const edit = (fn: (m: CourseModule[]) => CourseModule[]) => { setModules(fn); setDirty(true); };
  const patchModule = (mid: string, fn: (m: CourseModule) => CourseModule) => edit((ms) => ms.map((m) => (m.id === mid ? fn(m) : m)));
  const toggle = (mid: string) => setCollapsed((s) => { const n = new Set(s); n.has(mid) ? n.delete(mid) : n.add(mid); return n; });

  const handleSave = () => {
    if (!content) return;
    save.mutate(content, {
      onSuccess: () => { setDirty(false); toast({ title: "Programme enregistré" }); },
      onError: (e) =>
        toast({
          title: "Enregistrement impossible",
          description: e instanceof ApiError && (e.status === 404 || e.status === 501)
            ? "L'enregistrement du contenu de cours n'est pas encore disponible côté serveur."
            : "Réessayez dans un instant.",
          variant: "destructive",
        }),
    });
  };

  const updatedAt = result?.data.updatedAt ? formatDistanceToNow(new Date(result.data.updatedAt), { locale: fr, addSuffix: true }) : null;
  const breadcrumb = ["Formations", formation?.domain.name, formation?.title].filter(Boolean).join(" / ");

  return (
    <AdminLayout
      title={formation?.title ?? "Formation"}
      description={`${breadcrumb}${updatedAt ? ` · dernière modification ${updatedAt}` : ""}`}
      actions={
        <>
          {formation && <Pill variant={formation.published ? "success" : "warning"}>{formation.published ? "Publiée" : "Brouillon"}</Pill>}
          <Button variant="primary" shape="rounded" size="sm" onClick={handleSave} disabled={!dirty || save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div role="tablist" className="flex gap-7 overflow-x-auto border-b border-[#E7E0D4] text-[15px] font-semibold">
          {id && <Link to={`/admin/bootcamps/${id}/edit`} className="whitespace-nowrap py-3 text-ink-secondary">Informations</Link>}
          <span role="tab" aria-selected="true" className="-mb-px whitespace-nowrap border-b-2 border-cta py-3 font-bold text-navy">Programme</span>
          <ComingSoonLink title="Évaluations" className="whitespace-nowrap py-3 text-ink-secondary">Évaluations</ComingSoonLink>
          <ComingSoonLink title="Certificat" className="whitespace-nowrap py-3 text-ink-secondary">Certificat</ComingSoonLink>
          <Link to="/admin/bootcamp-sessions" className="whitespace-nowrap py-3 text-ink-secondary">Sessions</Link>
          {formation && <Link to={`/formations/${formation.slug}`} className="whitespace-nowrap py-3 text-ink-secondary">Page du site</Link>}
        </div>

        {result?.demo && (
          <div role="status" className="rounded-card bg-warning-bg px-4 py-3 text-sm text-warning">
            <span className="font-bold">Aperçu :</span> programme de démonstration — le contenu de cours n'est pas encore disponible
            côté serveur, l'enregistrement échouera tant que l'endpoint n'existe pas.
          </div>
        )}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">Impossible de charger le programme de cette formation.</div>}

        {content && settings && (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
            <Card radius="stat" className="flex flex-col gap-4 p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-bold text-navy">Programme</h2>
                <div className="flex gap-2">
                  <Button asChild variant="outline" shape="rounded" size="sm">
                    <Link to={`/espace/formations/${id}`}>Aperçu apprenant</Link>
                  </Button>
                  <Button
                    variant="navy"
                    shape="rounded"
                    size="sm"
                    onClick={() => edit((ms) => [...ms, { id: newId(), order: ms.length + 1, title: `Module ${ms.length + 1} — Nouveau module`, lessons: [] }])}
                  >
                    <Plus className="h-4 w-4" /> Ajouter un module
                  </Button>
                </div>
              </div>

              {modules.length === 0 && <p className="text-sm text-ink-secondary">Aucun module. Ajoutez-en un pour commencer.</p>}

              {modules.map((m, mi) => {
                const open = !collapsed.has(m.id);
                const dur = moduleDurationLabel(m.lessons);
                return (
                  <div key={m.id} className="overflow-hidden rounded-[14px] bg-app-bg">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                      <button type="button" aria-label={open ? "Replier le module" : "Déplier le module"} onClick={() => toggle(m.id)}>
                        <ChevronDown className={`h-5 w-5 text-navy transition-transform ${open ? "" : "-rotate-90"}`} />
                      </button>
                      <input
                        aria-label="Titre du module"
                        className="min-w-0 flex-1 bg-transparent font-bold text-navy outline-none"
                        value={m.title}
                        onChange={(e) => patchModule(m.id, (x) => ({ ...x, title: e.target.value }))}
                      />
                      <span className="text-[13px] text-ink-secondary">{m.lessons.length} éléments{dur ? ` · ${dur}` : ""}</span>
                      <button type="button" aria-label="Monter le module" disabled={mi === 0} onClick={() => edit((ms) => move(ms, mi, -1))}><ChevronUp className="h-4 w-4 disabled:opacity-30" /></button>
                      <button type="button" aria-label="Descendre le module" disabled={mi === modules.length - 1} onClick={() => edit((ms) => move(ms, mi, 1))}><ChevronDown className="h-4 w-4 disabled:opacity-30" /></button>
                      <Button
                        variant="outline"
                        shape="rounded"
                        size="sm"
                        onClick={() => {
                          const lesson: Lesson = { id: newId(), order: m.lessons.length + 1, title: "Nouvelle leçon", type: "VIDEO", status: "DRAFT", resources: [] };
                          patchModule(m.id, (x) => ({ ...x, lessons: [...x.lessons, lesson] }));
                          setEditing(lesson.id);
                          setCollapsed((s) => { const n = new Set(s); n.delete(m.id); return n; });
                        }}
                      >
                        <Plus className="h-4 w-4" /> Ajouter
                      </Button>
                      <button
                        type="button"
                        aria-label="Supprimer le module"
                        onClick={() => { if (window.confirm(`Supprimer « ${m.title} » et ses ${m.lessons.length} éléments ?`)) edit((ms) => ms.filter((x) => x.id !== m.id)); }}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </button>
                    </div>

                    {open && m.lessons.map((l, li) => (
                      <div key={l.id} className="border-t border-[#E7E0D4] bg-white">
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                          <div className="flex flex-col">
                            <button type="button" aria-label="Monter" disabled={li === 0} onClick={() => patchModule(m.id, (x) => ({ ...x, lessons: reorder(move(x.lessons, li, -1)) }))}><ChevronUp className="h-3.5 w-3.5 disabled:opacity-30" /></button>
                            <button type="button" aria-label="Descendre" disabled={li === m.lessons.length - 1} onClick={() => patchModule(m.id, (x) => ({ ...x, lessons: reorder(move(x.lessons, li, 1)) }))}><ChevronDown className="h-3.5 w-3.5 disabled:opacity-30" /></button>
                          </div>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-app-bg"><TypeIcon type={l.type} /></span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[15px] font-semibold text-ink">{l.title}</span>
                            <span className="truncate text-[13px] text-ink-secondary">{lessonSubtitle(l)}</span>
                          </span>
                          <span className="hidden w-[90px] text-sm text-ink-secondary sm:block">{LESSON_TYPE_LABELS[l.type]}</span>
                          <Pill variant={STATUS_VARIANT[l.status]}>{LESSON_STATUS_LABELS[l.status]}</Pill>
                          <button type="button" className="text-sm font-semibold text-navy hover:text-cta" onClick={() => setEditing(editing === l.id ? null : l.id)}>
                            {editing === l.id ? "Fermer" : "Modifier"}
                          </button>
                          <button
                            type="button"
                            aria-label="Supprimer la leçon"
                            onClick={() => patchModule(m.id, (x) => ({ ...x, lessons: reorder(x.lessons.filter((y) => y.id !== l.id)) }))}
                          >
                            <Trash2 className="h-4 w-4 text-error" />
                          </button>
                        </div>
                        {editing === l.id && (
                          <LessonForm lesson={l} onChange={(nl) => patchModule(m.id, (x) => ({ ...x, lessons: x.lessons.map((y) => (y.id === l.id ? nl : y)) }))} />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </Card>

            <div className="flex flex-col gap-6">
              <Card radius="stat" className="flex flex-col gap-4 p-5">
                <h2 className="font-heading text-lg font-bold text-navy">Réglages</h2>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-ink-secondary">Domaine</dt><dd className="text-right font-semibold">{formation?.domain.name ?? "—"}</dd>
                  <dt className="text-ink-secondary">Dispensé par</dt>
                  <dd className="text-right font-semibold">{formation ? (formation.deliveredBy === "PARTNER" ? formation.partner?.name ?? "Partenaire" : "Model Technologie") : "—"}</dd>
                  <dt className="text-ink-secondary">Niveau</dt><dd className="text-right font-semibold">{formation?.level ?? "—"}</dd>
                  <dt className="text-ink-secondary">Prix</dt><dd className="text-right font-semibold">{formation?.price ?? "—"}</dd>
                  <dt className="text-ink-secondary">Visible sur le site</dt><dd className="text-right font-semibold">{formation?.published ? "Oui" : "Non"}</dd>
                </dl>
                {id && <Link to={`/admin/bootcamps/${id}/edit`} className="text-sm font-semibold text-navy hover:text-cta">Modifier dans la fiche formation →</Link>}

                <div className="flex flex-col gap-3 rounded-card border border-[#E7E0D4] p-3">
                  <label className="flex items-center justify-between gap-3 text-sm">
                    Débloquer les modules dans l'ordre
                    <input type="checkbox" className="h-[18px] w-[18px] accent-[#1A3A5B]" checked={settings.sequentialUnlock}
                      onChange={(e) => { setSettings({ ...settings, sequentialUnlock: e.target.checked }); setDirty(true); }} />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm">
                    Accès après la fin de session
                    <select className="rounded-[10px] border border-[#D6CEC0] bg-white px-2 py-1.5 text-sm" value={settings.accessDuration}
                      onChange={(e) => { setSettings({ ...settings, accessDuration: e.target.value as CourseSettings["accessDuration"] }); setDirty(true); }}>
                      <option value="12_MONTHS">12 mois</option>
                      <option value="LIFETIME">À vie</option>
                    </select>
                  </label>
                </div>
              </Card>

              <Card radius="stat" className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-navy">Règles du certificat</h2>
                  <Pill variant="warning">à venir</Pill>
                </div>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-ink-secondary">Leçons terminées</dt><dd className="text-right font-semibold">≥ {content.certificateRules.lessonsCompletedPercent} %</dd>
                  <dt className="text-ink-secondary">Quiz réussis</dt><dd className="text-right font-semibold">tous · ≥ {content.certificateRules.quizPassPercent} %</dd>
                  <dt className="text-ink-secondary">Présence aux lives</dt><dd className="text-right font-semibold">≥ {content.certificateRules.livePresencePercent} %</dd>
                  <dt className="text-ink-secondary">Projet final</dt><dd className="text-right font-semibold">{content.certificateRules.finalProjectValidated ? "validé par le formateur" : "non requis"}</dd>
                  <dt className="text-ink-secondary">Modèle</dt><dd className="text-right font-semibold">{content.certificateRules.template}</dd>
                </dl>
                <p className="text-xs text-ink-secondary">
                  Dès que les conditions seront remplies : certificat généré, e-mail + WhatsApp envoyés (module certificats à venir).
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
