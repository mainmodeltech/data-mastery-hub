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
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useMatch, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronDown, ChevronUp, CircleHelp, FileText, Loader2, Play, Plus, Radio, Trash2,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button, Card, Pill } from "@/components/shared";
import { errorMessage } from "@/components/admin/AdminKit";
import { LessonForm, isSaved, newClientId, type LessonProposalMode } from "@/components/admin/LessonForm";
import { ProposalActions, ProposalBanner } from "@/components/admin/ProposalBar";
import { validateQuestions } from "@/components/admin/QuizQuestionsEditor";
import { ProjectBriefCard } from "@/components/admin/ProjectBriefCard";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCourseContent, useSaveAdminCourseContent } from "@/hooks/useCourse";
import { useFormations } from "@/hooks/useFormations";
import { useMyProposal, useSaveProposal, useSubmitProposal, useWithdrawProposal } from "@/hooks/useProposals";
import { useToast } from "@/hooks/use-toast";
import { moduleDurationLabel } from "@/lib/course";
import { ApiError } from "@/services/httpClient";
import type { QuizQuestionEdit } from "@/types/authoring.type";
import { PROPOSAL_EDITABLE, type QuizBankDraft } from "@/types/proposal.type";
import {
  LESSON_STATUS_LABELS, LESSON_TYPE_LABELS, formatDuration,
  type CertificateRules, type CourseContent, type CourseModule, type CourseSettings, type Lesson, type LessonStatus, type LessonType,
} from "@/types/course.type";

const STATUS_VARIANT: Record<LessonStatus, "success" | "info" | "warning"> = { PUBLISHED: "success", SCHEDULED: "info", DRAFT: "warning" };

const newId = newClientId;
const reorder = <T extends { order: number }>(items: T[]): T[] => items.map((it, i) => ({ ...it, order: i + 1 }));

function move<T>(arr: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= arr.length) return arr;
  const copy = arr.slice();
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

const isHttp = (url: string | null | undefined) => !!url && /^https?:\/\//i.test(url.trim());

/** Contrôles avant envoi (le serveur revalide) : titres, quiz, liens http(s). Renvoie le 1er problème. */
function validateContent(modules: CourseModule[]): string | null {
  for (const m of modules) {
    if (!m.title.trim()) return "Un module n'a pas de titre.";
    for (const l of m.lessons) {
      const where = `« ${l.title.trim() || "Leçon sans titre"} » (${m.title})`;
      if (!l.title.trim()) return `Une leçon du module « ${m.title} » n'a pas de titre.`;
      if (l.type === "QUIZ" && (!l.quiz || l.quiz.questionCount < 1 || l.quiz.passThreshold < 1 || l.quiz.passThreshold > 100))
        return `${where} : renseignez le nombre de questions (≥ 1) et un seuil entre 1 et 100 %.`;
      if (l.videoUrl && !isHttp(l.videoUrl)) return `${where} : le lien de la vidéo doit commencer par http:// ou https://.`;
      if (l.liveUrl && !isHttp(l.liveUrl)) return `${where} : le lien du live doit commencer par http:// ou https://.`;
      for (const r of l.resources) {
        if (!r.name.trim()) return `${where} : une ressource n'a pas de nom.`;
        if (r.url && !isHttp(r.url)) return `${where} : le lien de la ressource « ${r.name} » doit commencer par http:// ou https://.`;
      }
    }
  }
  return null;
}

function TypeIcon({ type }: { type: LessonType }) {
  const cls = "h-[18px] w-[18px] text-navy";
  if (type === "QUIZ") return <CircleHelp className={cls} />;
  if (type === "RESOURCE") return <FileText className={cls} />;
  if (type === "LIVE") return <Radio className={cls} />;
  return <Play className={cls} />;
}

function lessonSubtitle(l: Lesson): string {
  if (l.type === "QUIZ" && l.quiz) return `${l.quiz.questionCount} questions · ${l.quiz.passThreshold} % requis · ${l.quiz.maxAttempts ?? "∞"} tentatives`;
  if (l.type === "LIVE") return l.liveAt ? format(new Date(l.liveAt), "EEE d MMM · HH'h'mm", { locale: fr }) : "Date à définir";
  if (l.type === "RESOURCE") return `${l.resources.length} fichier(s)`;
  return [l.durationSeconds ? formatDuration(l.durationSeconds) : null, l.subtitle].filter(Boolean).join(" · ") || "—";
}

export default function AdminFormationEditor() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  // Un partenaire n'édite que le programme de ses formations : pas la fiche catalogue ni les sessions
  const canManageCatalog = can("CATALOG_MANAGE");
  const { toast } = useToast();
  const { data: formations = [] } = useFormations();
  const formation = formations.find((f) => f.id === id);

  // Mode proposition (formateur) : même éditeur, sur une copie du programme soumise à la pédagogie
  const proposalMode = !!useMatch("/admin/espace/formations/:id/proposition");
  const adminContent = useAdminCourseContent(proposalMode ? undefined : id, formation?.title);
  const proposalQuery = useMyProposal(proposalMode ? id : undefined);
  const proposalData = proposalQuery.data;
  const result = useMemo(
    () => (proposalMode ? (proposalData ? { data: proposalData.content, demo: false } : undefined) : adminContent.data),
    [proposalMode, proposalData, adminContent.data]
  );
  const isLoading = proposalMode ? proposalQuery.isLoading : adminContent.isLoading;
  const isError = proposalMode ? proposalQuery.isError : adminContent.isError;
  const save = useSaveAdminCourseContent(id ?? "");
  const saveProposal = useSaveProposal(id ?? "");
  const submitProposal = useSubmitProposal(id ?? "");
  const withdrawProposal = useWithdrawProposal(id ?? "");
  const proposalStatus = proposalData?.status ?? null;
  const locked = proposalMode && !PROPOSAL_EDITABLE.includes(proposalStatus);
  const [banks, setBanks] = useState<Record<string, QuizQuestionEdit[]>>({});
  const liveStatus = useRef<Record<string, LessonStatus>>({});

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [settings, setSettings] = useState<CourseSettings | null>(null);
  const [rules, setRules] = useState<CertificateRules | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!result) return;
    if (proposalMode && proposalData) {
      // Une leçon nouvelle (id « new-… ») garde un identifiant stable : sa clientKey
      const loaded = result.data.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => {
          if (isSaved(l.id) && l.status !== "DRAFT" && !liveStatus.current[l.id]) liveStatus.current[l.id] = l.status;
          return !isSaved(l.id) && !l.clientKey ? { ...l, clientKey: l.id } : l;
        }),
      }));
      setModules(loaded);
      setBanks(Object.fromEntries(proposalData.quizBanks.map((b) => [b.lessonRef, b.questions ?? []])));
    } else setModules(result.data.modules);
    setSettings(result.data.settings);
    setRules(result.data.certificateRules);
    setDirty(false);
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const content: CourseContent | null = useMemo(
    () => (result && settings && rules ? { ...result.data, title: formation?.title ?? result.data.title, settings, certificateRules: rules, modules: reorder(modules) } : null),
    [result, settings, rules, modules, formation]
  );

  const edit = (fn: (m: CourseModule[]) => CourseModule[]) => { setModules(fn); setDirty(true); };
  const patchModule = (mid: string, fn: (m: CourseModule) => CourseModule) => edit((ms) => ms.map((m) => (m.id === mid ? fn(m) : m)));
  const toggle = (mid: string) => setCollapsed((s) => { const n = new Set(s); n.has(mid) ? n.delete(mid) : n.add(mid); return n; });

  const bankRef = (l: Lesson) => (isSaved(l.id) ? l.id : l.clientKey ?? l.id);
  const lessonProposal = (l: Lesson): LessonProposalMode => ({
    allowedStatuses: isSaved(l.id) && liveStatus.current[l.id] ? [liveStatus.current[l.id], "DRAFT"] : ["DRAFT"],
    questions: banks[bankRef(l)] ?? [],
    onQuestions: (q) => { setBanks((b) => ({ ...b, [bankRef(l)]: q })); setDirty(true); },
  });

  /** Corps de la proposition : programme + une banque de questions par leçon quiz. Renvoie aussi le 1er problème de saisie. */
  const proposalBody = (): { body: { content: CourseContent; quizBanks: QuizBankDraft[] }; problem: string | null } | null => {
    if (!content) return null;
    let problem = validateContent(content.modules);
    const quizBanks: QuizBankDraft[] = [];
    for (const m of content.modules) for (const l of m.lessons) {
      if (l.type !== "QUIZ") continue;
      const questions = banks[bankRef(l)] ?? [];
      const q = validateQuestions(questions);
      if (q && !problem) problem = `Quiz « ${l.title} » : ${q}`;
      quizBanks.push({ lessonRef: bankRef(l), questions: questions.map((x) => ({ ...x, explanation: x.explanation?.trim() || null })) });
    }
    return { body: { content, quizBanks }, problem };
  };

  const saveDraftProposal = async (): Promise<boolean> => {
    const p = proposalBody();
    if (!p) return false;
    if (p.problem) { toast({ title: "Proposition incomplète", description: p.problem, variant: "destructive" }); return false; }
    try { await saveProposal.mutateAsync(p.body); setDirty(false); return true; }
    catch (e) { toast({ title: "Enregistrement impossible", description: errorMessage(e, "Réessayez dans un instant."), variant: "destructive" }); return false; }
  };

  const handleProposalSave = async () => { if (await saveDraftProposal()) toast({ title: "Proposition enregistrée" }); };
  const handleProposalSubmit = async () => {
    if ((dirty || !proposalData?.id) && !(await saveDraftProposal())) return;
    try { await submitProposal.mutateAsync(); toast({ title: "Proposition soumise à la pédagogie" }); }
    catch (e) { toast({ title: "Envoi impossible", description: errorMessage(e, "Réessayez dans un instant."), variant: "destructive" }); }
  };
  const handleProposalWithdraw = async () => {
    try { await withdrawProposal.mutateAsync(); toast({ title: "Proposition retirée", description: "Vous pouvez à nouveau la modifier." }); }
    catch (e) { toast({ title: "Retrait impossible", description: errorMessage(e, "Réessayez dans un instant."), variant: "destructive" }); }
  };

  const handleSave = () => {
    if (!content) return;
    const problem = validateContent(content.modules);
    if (problem) {
      toast({ title: "Programme incomplet", description: problem, variant: "destructive" });
      return;
    }
    save.mutate(content, {
      onSuccess: () => { setDirty(false); toast({ title: "Programme enregistré" }); },
      onError: (e) =>
        toast({
          title: "Enregistrement impossible",
          description: e instanceof ApiError && (e.status === 404 || e.status === 501)
            ? "L'enregistrement du contenu de cours n'est pas disponible côté serveur."
            : errorMessage(e, "Réessayez dans un instant."),
          variant: "destructive",
        }),
    });
  };

  const updatedAt = result?.data.updatedAt ? formatDistanceToNow(new Date(result.data.updatedAt), { locale: fr, addSuffix: true }) : null;
  const breadcrumb = ["Formations", formation?.domain.name, formation?.title].filter(Boolean).join(" / ");

  return (
    <AdminLayout
      title={formation?.title ?? proposalData?.formationTitle ?? "Formation"}
      description={`${breadcrumb}${updatedAt ? ` · dernière modification ${updatedAt}` : ""}`}
      actions={proposalMode ? (
        <ProposalActions
          status={proposalStatus} dirty={dirty}
          busy={saveProposal.isPending || submitProposal.isPending || withdrawProposal.isPending}
          onSave={handleProposalSave} onSubmit={handleProposalSubmit} onWithdraw={handleProposalWithdraw}
        />
      ) : (
        <>
          {formation && <Pill variant={formation.published ? "success" : "warning"}>{formation.published ? "Publiée" : "Brouillon"}</Pill>}
          <Button variant="primary" shape="rounded" size="sm" onClick={handleSave} disabled={!dirty || save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
          </Button>
        </>
      )}
    >
      <div className="flex min-w-0 max-w-full flex-col gap-6">
        <div role="tablist" className="flex max-w-full gap-7 overflow-x-auto border-b border-[#E7E0D4] text-[0.9375rem] font-semibold">
          {id && canManageCatalog && !proposalMode && <Link to={`/admin/bootcamps/${id}/edit`} className="whitespace-nowrap py-3 text-ink-secondary">Informations</Link>}
          <span role="tab" aria-selected="true" className="-mb-px whitespace-nowrap border-b-2 border-cta py-3 font-bold text-navy">Programme</span>
          {!proposalMode && (
            <>
              <a href="#projet" className="whitespace-nowrap py-3 text-ink-secondary">Projet final</a>
              <a href="#certificat" className="whitespace-nowrap py-3 text-ink-secondary">Certificat</a>
              {canManageCatalog && <Link to={`/admin/bootcamp-sessions?bootcamp=${id}`} className="whitespace-nowrap py-3 text-ink-secondary">Sessions</Link>}
              {formation && <Link to={`/formations/${formation.slug}`} className="whitespace-nowrap py-3 text-ink-secondary">Page du site</Link>}
            </>
          )}
        </div>

        {proposalMode && proposalData && <ProposalBanner proposal={proposalData} />}
        {result?.demo && (
          <div role="status" className="rounded-card bg-warning-bg px-4 py-3 text-sm text-warning">
            <span className="font-bold">Aperçu :</span> programme de démonstration — le contenu de cours n'est pas encore disponible
            côté serveur, l'enregistrement échouera tant que l'endpoint n'existe pas.
          </div>
        )}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">Impossible de charger le programme de cette formation.</div>}

        {content && settings && (
          <fieldset disabled={locked} className="m-0 min-w-0 border-0 p-0">
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr),360px]">
            <Card radius="stat" className="flex min-w-0 flex-col gap-4 p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-bold text-navy">Programme</h2>
                <div className="flex flex-wrap gap-2">
                  {!proposalMode && (
                    <Button asChild variant="outline" shape="rounded" size="sm">
                      <Link to={`/espace/formations/${id}`}>Aperçu apprenant</Link>
                    </Button>
                  )}
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
                      <span className="text-[0.8125rem] text-ink-secondary">{m.lessons.length} éléments{dur ? ` · ${dur}` : ""}</span>
                      <button type="button" aria-label="Monter le module" disabled={mi === 0} onClick={() => edit((ms) => move(ms, mi, -1))}><ChevronUp className="h-4 w-4 disabled:opacity-30" /></button>
                      <button type="button" aria-label="Descendre le module" disabled={mi === modules.length - 1} onClick={() => edit((ms) => move(ms, mi, 1))}><ChevronDown className="h-4 w-4 disabled:opacity-30" /></button>
                      <Button
                        variant="outline"
                        shape="rounded"
                        size="sm"
                        onClick={() => {
                          const lessonId = newId();
                          const lesson: Lesson = { id: lessonId, order: m.lessons.length + 1, title: "Nouvelle leçon", type: "VIDEO", status: "DRAFT", resources: [], ...(proposalMode ? { clientKey: lessonId } : {}) };
                          patchModule(m.id, (x) => ({ ...x, lessons: [...x.lessons, lesson] }));
                          setEditing(lesson.id);
                          setCollapsed((s) => { const n = new Set(s); n.delete(m.id); return n; });
                        }}
                      >
                        <Plus className="h-4 w-4" /> Ajouter
                      </Button>
                      {proposalMode && (
                        <Button
                          variant="outline" shape="rounded" size="sm"
                          onClick={() => patchModule(m.id, (x) => ({ ...x, lessons: x.lessons.map((l) => ({ ...l, status: "DRAFT" as const })) }))}
                        >
                          Tout passer en brouillon
                        </Button>
                      )}
                      {!(proposalMode && isSaved(m.id)) && (
                        <button
                          type="button"
                          aria-label="Supprimer le module"
                          onClick={() => { if (window.confirm(`Supprimer « ${m.title} » et ses ${m.lessons.length} éléments ?`)) edit((ms) => ms.filter((x) => x.id !== m.id)); }}
                        >
                          <Trash2 className="h-4 w-4 text-error" />
                        </button>
                      )}
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
                            <span className="truncate text-[0.9375rem] font-semibold text-ink">{l.title}</span>
                            <span className="truncate text-[0.8125rem] text-ink-secondary">{lessonSubtitle(l)}</span>
                          </span>
                          <span className="hidden w-[90px] text-sm text-ink-secondary sm:block">{LESSON_TYPE_LABELS[l.type]}</span>
                          <Pill variant={STATUS_VARIANT[l.status]}>{LESSON_STATUS_LABELS[l.status]}</Pill>
                          <button type="button" className="text-sm font-semibold text-navy hover:text-cta" onClick={() => setEditing(editing === l.id ? null : l.id)}>
                            {editing === l.id ? "Fermer" : "Modifier"}
                          </button>
                          {!(proposalMode && isSaved(l.id)) && (
                            <button
                              type="button"
                              aria-label="Supprimer la leçon"
                              onClick={() => patchModule(m.id, (x) => ({ ...x, lessons: reorder(x.lessons.filter((y) => y.id !== l.id)) }))}
                            >
                              <Trash2 className="h-4 w-4 text-error" />
                            </button>
                          )}
                        </div>
                        {editing === l.id && (
                          <LessonForm lesson={l} proposal={proposalMode ? lessonProposal(l) : undefined} onChange={(nl) => patchModule(m.id, (x) => ({ ...x, lessons: x.lessons.map((y) => (y.id === l.id ? nl : y)) }))} />
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
                {id && canManageCatalog && <Link to={`/admin/bootcamps/${id}/edit`} className="text-sm font-semibold text-navy hover:text-cta">Modifier dans la fiche formation →</Link>}

                {proposalMode && <p className="text-xs text-ink-secondary">Réglages et certificat : en lecture seule, ils ne se modifient pas dans une proposition.</p>}
                <fieldset disabled={proposalMode} className="m-0 flex min-w-0 flex-col gap-3 rounded-card border border-[#E7E0D4] p-3">
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
                </fieldset>
              </Card>

              {rules && (
                <Card id="certificat" radius="stat" className="flex flex-col gap-3 p-5">
                  <fieldset disabled={proposalMode} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
                  <h2 className="font-heading text-lg font-bold text-navy">Règles du certificat</h2>
                  {([
                    ["lessonsCompletedPercent", "Leçons terminées (%)"],
                    ["quizPassPercent", "Réussite aux quiz (%)"],
                    ["livePresencePercent", "Présence aux lives (%)"],
                  ] as const).map(([k, label]) => (
                    <label key={k} className="flex items-center justify-between gap-3 text-sm">
                      {label}
                      <input
                        type="number" min={0} max={100}
                        className="w-20 rounded-[10px] border border-[#D6CEC0] bg-white px-2 py-1.5 text-right text-sm"
                        value={rules[k]}
                        onChange={(e) => { setRules({ ...rules, [k]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }); setDirty(true); }}
                      />
                    </label>
                  ))}
                  <label className="flex items-center justify-between gap-3 text-sm">
                    Projet final validé par le formateur
                    <input type="checkbox" className="h-[18px] w-[18px] accent-[#1A3A5B]" checked={rules.finalProjectValidated}
                      onChange={(e) => { setRules({ ...rules, finalProjectValidated: e.target.checked }); setDirty(true); }} />
                  </label>
                  <label className="flex items-center justify-between gap-3 text-sm">
                    Modèle
                    <input
                      className="w-40 rounded-[10px] border border-[#D6CEC0] bg-white px-2 py-1.5 text-sm"
                      value={rules.template}
                      onChange={(e) => { setRules({ ...rules, template: e.target.value }); setDirty(true); }}
                    />
                  </label>
                  <p className="text-xs text-ink-secondary">
                    Dès que toutes les conditions sont remplies, le certificat est généré et envoyé par e-mail à l'apprenant.
                    Pensez à enregistrer le programme.
                  </p>
                  </fieldset>
                </Card>
              )}

              {id && !proposalMode && <ProjectBriefCard formationId={id} />}
            </div>
          </div>
          </fieldset>
        )}
      </div>
    </AdminLayout>
  );
}
