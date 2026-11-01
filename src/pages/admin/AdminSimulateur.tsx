/**
 * AdminSimulateur.tsx — banque de questions du simulateur de certification (lot S1).
 * Rédaction → relecture par une autre personne → publication par une autre personne que l'auteur ; une version publiée
 * est figée (on en ouvre une nouvelle). L'onglet « Couverture » suit la production par compétence mesurée.
 * Le serveur vérifie les droits et la séparation des tâches ; l'écran n'affiche que ce qui est possible.
 */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, FileUp, Loader2, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCreateSimItem, useSimBlueprint, useSimCoverage, useSimItem, useSimItems, useSimWorkflow, useUpdateSimItem } from "@/hooks/useSimulatorAdmin";
import { cn } from "@/lib/utils";
import {
  DIFFICULTY_LABELS, ITEM_STATUS_LABELS, ITEM_TYPE_LABELS,
  type Choice, type ItemFilters, type ItemPayload, type ItemRequest, type ItemStatus, type ItemType, type ItemVersion, type Statement,
} from "@/types/simulator.type";

const STATUS_VARIANT: Record<ItemStatus, "neutral" | "info" | "warning" | "success" | "error"> = {
  DRAFT: "neutral", IN_REVIEW: "warning", APPROVED: "info", PUBLISHED: "success", RETIRED: "error",
};

const stamp = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "—");
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── Éditeur ───────────────────────────────────────────────────────────

function blankPayload(type: ItemType): ItemPayload {
  if (type === "YES_NO_SERIES") return { statements: [{ id: "S1", text: "", answer: true }, { id: "S2", text: "", answer: false }] };
  const n = type === "MULTIPLE_CHOICE" ? 5 : 4;
  return { choices: LETTERS.slice(0, n).map((id, i) => ({ id, text: "", correct: type === "SINGLE_CHOICE" ? i === 0 : i < 2 })) };
}

function ItemEditor({ item, onClose, onSaved }: { item: ItemVersion | null; onClose: () => void; onSaved: (code: string) => void }) {
  const { toast } = useToast();
  const { data: blueprint } = useSimBlueprint();
  const create = useCreateSimItem();
  const update = useUpdateSimItem();
  const [skill, setSkill] = useState(item?.skillCode ?? "");
  const [type, setType] = useState<ItemType>(item?.type ?? "SINGLE_CHOICE");
  const [difficulty, setDifficulty] = useState(item?.difficulty ?? 2);
  const [stem, setStem] = useState(item?.stemEn ?? "");
  const [explanation, setExplanation] = useState(item?.explanationFr ?? "");
  const [payload, setPayload] = useState<ItemPayload>(item?.payload ?? blankPayload("SINGLE_CHOICE"));
  const [error, setError] = useState("");
  const pending = create.isPending || update.isPending;

  const changeType = (t: ItemType) => { setType(t); setPayload(blankPayload(t)); };
  const choices = payload.choices ?? [];
  const statements = payload.statements ?? [];
  const setChoice = (i: number, patch: Partial<Choice>) =>
    setPayload({ choices: choices.map((c, k) => (k === i ? { ...c, ...patch } : type === "SINGLE_CHOICE" && patch.correct ? { ...c, correct: false } : c)) });
  const setStatement = (i: number, patch: Partial<Statement>) => setPayload({ statements: statements.map((s, k) => (k === i ? { ...s, ...patch } : s)) });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!item && !skill) return setError("Choisissez la compétence mesurée.");
    const body: ItemRequest = { skillCode: skill || undefined, type, difficulty, stemEn: stem, payload, explanationFr: explanation || undefined };
    try {
      const saved = item ? await update.mutateAsync({ code: item.code, version: item.versionNo, body }) : await create.mutateAsync(body);
      toast({ title: item ? "Brouillon enregistré" : "Brouillon créé", description: saved.code });
      onSaved(saved.code);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{item ? `Modifier ${item.code} (v${item.versionNo})` : "Nouvelle question"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Énoncé et choix en anglais (comme l'examen), explication en français.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Compétence mesurée *" htmlFor="sq-skill" className="sm:col-span-3">
              <select id="sq-skill" className={inputClass} value={skill} disabled={!!item} onChange={(e) => setSkill(e.target.value)}>
                <option value="">Choisir…</option>
                {blueprint?.domains.map((d) => (
                  <optgroup key={d.code} label={d.name}>
                    {d.skills.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Type" htmlFor="sq-type">
              <select id="sq-type" className={inputClass} value={type} onChange={(e) => changeType(e.target.value as ItemType)}>
                {(Object.keys(ITEM_TYPE_LABELS) as ItemType[]).map((t) => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
              </select>
            </Field>
            <Field label="Difficulté" htmlFor="sq-diff">
              <select id="sq-diff" className={inputClass} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
                {[1, 2, 3].map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Énoncé (EN) *" htmlFor="sq-stem">
            <textarea id="sq-stem" rows={4} required maxLength={4000} className={inputClass} value={stem} onChange={(e) => setStem(e.target.value)} />
          </Field>

          {type !== "YES_NO_SERIES" ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">
                Choix (EN) — {type === "SINGLE_CHOICE" ? "cochez la seule bonne réponse" : "cochez au moins deux bonnes réponses"}
              </legend>
              {choices.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <input type={type === "SINGLE_CHOICE" ? "radio" : "checkbox"} name="sq-correct" checked={c.correct}
                    aria-label={`Choix ${c.id} correct`} onChange={(e) => setChoice(i, { correct: e.target.checked })} className="h-4 w-4 accent-[#1A3A5B]" />
                  <span className="w-5 text-sm font-bold text-navy">{c.id}</span>
                  <input className={inputClass} value={c.text} maxLength={1000} aria-label={`Texte du choix ${c.id}`} onChange={(e) => setChoice(i, { text: e.target.value })} />
                  {choices.length > 2 && (
                    <button type="button" aria-label={`Retirer le choix ${c.id}`} className="text-ink-secondary hover:text-error"
                      onClick={() => setPayload({ choices: choices.filter((_, k) => k !== i).map((x, k) => ({ ...x, id: LETTERS[k] })) })}><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
              {choices.length < (type === "SINGLE_CHOICE" ? 6 : 8) && (
                <Button type="button" size="sm" shape="rounded" variant="outline" className="w-fit"
                  onClick={() => setPayload({ choices: [...choices, { id: LETTERS[choices.length], text: "", correct: false }] })}><Plus />Ajouter un choix</Button>
              )}
            </fieldset>
          ) : (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">Affirmations (EN) et réponse attendue</legend>
              {statements.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-6 text-sm font-bold text-navy">{s.id}</span>
                  <input className={inputClass} value={s.text} maxLength={1000} aria-label={`Texte de l'affirmation ${s.id}`} onChange={(e) => setStatement(i, { text: e.target.value })} />
                  <select aria-label={`Réponse de ${s.id}`} className={cn(inputClass, "w-24")} value={s.answer ? "yes" : "no"} onChange={(e) => setStatement(i, { answer: e.target.value === "yes" })}>
                    <option value="yes">Yes</option><option value="no">No</option>
                  </select>
                </div>
              ))}
              {statements.length < 6 && (
                <Button type="button" size="sm" shape="rounded" variant="outline" className="w-fit"
                  onClick={() => setPayload({ statements: [...statements, { id: `S${statements.length + 1}`, text: "", answer: true }] })}><Plus />Ajouter une affirmation</Button>
              )}
            </fieldset>
          )}

          <Field label="Explication (FR)" htmlFor="sq-exp" hint="Obligatoire avant la relecture : pourquoi la bonne réponse est bonne, pourquoi les autres sont fausses.">
            <textarea id="sq-exp" rows={4} maxLength={4000} className={inputClass} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : "Enregistrer le brouillon"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Import ────────────────────────────────────────────────────────────

function ImportDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const { importItems } = useSimWorkflow();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ created: number; errors: { index: number; message: string }[] } | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    setError("");
    let items: ItemRequest[];
    try {
      const parsed = JSON.parse(text);
      items = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(items)) throw new Error();
    } catch {
      return setError("JSON invalide : attendu un tableau de questions, ou { \"items\": [...] }.");
    }
    try {
      const r = await importItems.mutateAsync(items);
      setResult(r);
      toast({ title: `${r.created} brouillon(s) créé(s)`, description: r.errors.length ? `${r.errors.length} refusée(s)` : undefined });
    } catch (e) {
      setError(errorMessage(e, "Import impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !importItems.isPending && onClose()}>
      <DialogContent className="max-w-2xl rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Importer des questions (JSON)</DialogTitle>
          <DialogDescription className="text-ink-secondary">200 questions au plus. Elles arrivent en brouillon et passent par la relecture habituelle.</DialogDescription>
        </DialogHeader>
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <textarea aria-label="Contenu JSON" rows={10} className={cn(inputClass, "font-mono text-xs")} value={text} onChange={(e) => setText(e.target.value)}
          placeholder='[{"skillCode":"MOD-DAX","type":"SINGLE_CHOICE","difficulty":2,"stemEn":"…","explanationFr":"…","payload":{"choices":[{"id":"A","text":"…","correct":true}, …]}}]' />
        {result && (
          <div role="status" className="rounded-card bg-app-bg p-3 text-sm">
            <p className="font-semibold text-ink">{result.created} créée(s), {result.errors.length} refusée(s).</p>
            {result.errors.length > 0 && <ul className="mt-1 list-disc pl-5 text-error">{result.errors.map((e) => <li key={e.index}>Question {e.index + 1} : {e.message}</li>)}</ul>}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" shape="rounded" onClick={onClose}>Fermer</Button>
          <Button type="button" shape="rounded" disabled={importItems.isPending || !text.trim()} onClick={() => void run()}>
            {importItems.isPending ? <Loader2 className="animate-spin" /> : <FileUp />}Importer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Détail et workflow ───────────────────────────────────────────────

function ReviewDialog({ item, onClose, onDone }: { item: ItemVersion; onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const { review } = useSimWorkflow();
  const [verified, setVerified] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const decide = async (approve: boolean) => {
    setError("");
    try {
      await review.mutateAsync({ code: item.code, version: item.versionNo, approve, verified, note: note || undefined });
      toast({ title: approve ? "Question approuvée" : "Corrections demandées", description: item.code });
      onDone();
    } catch (e) {
      setError(errorMessage(e, "Action impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !review.isPending && onClose()}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Relire {item.code}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Vous n'êtes pas l'auteur : vous pouvez approuver ou renvoyer la question à son auteur.</DialogDescription>
        </DialogHeader>
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
          <span>J'ai <strong>vérifié techniquement</strong> la question (DAX, M ou réglage exécuté dans Power BI) et la bonne réponse est la seule défendable.</span>
        </label>
        <Field label="Commentaire" htmlFor="rv-note" hint="Obligatoire pour demander des corrections.">
          <textarea id="rv-note" rows={3} className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" shape="rounded" disabled={review.isPending || !note.trim()} onClick={() => void decide(false)}><XCircle />Demander des corrections</Button>
          <Button type="button" shape="rounded" disabled={review.isPending || !verified} onClick={() => void decide(true)}>
            {review.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}Approuver
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ItemSheet({ code, onClose }: { code: string | null; onClose: () => void }) {
  const { can, user } = useAuth();
  const { toast } = useToast();
  const me = user?.email?.toLowerCase() ?? "";
  const [version, setVersion] = useState<number | undefined>(undefined);
  const { data: item, isLoading } = useSimItem(code, version);
  const w = useSimWorkflow();
  const [editing, setEditing] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [retiring, setRetiring] = useState(false);

  const isAuthor = !!item && item.author.toLowerCase() === me;
  const latest = item ? Math.max(...item.versions) : 0;
  const run = async (action: () => Promise<unknown>, success: string) => {
    try { await action(); toast({ title: success, description: item?.code }); } catch (e) { toast({ title: "Action impossible", description: errorMessage(e), variant: "destructive" }); }
  };
  const close = () => { setVersion(undefined); onClose(); };

  return (
    <Sheet open={!!code} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading || !item ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : (
          <div className="flex flex-col gap-5">
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-xl font-bold text-navy">{item.code} <span className="text-sm font-normal text-ink-secondary">v{item.versionNo}</span></SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-1.5">
                <Pill variant={STATUS_VARIANT[item.status]}>{ITEM_STATUS_LABELS[item.status]}</Pill>
                <Pill variant="info">{ITEM_TYPE_LABELS[item.type]}</Pill>
                <Pill variant="neutral">{DIFFICULTY_LABELS[item.difficulty]}</Pill>
                <span className="text-xs">{item.skillCode}</span>
              </SheetDescription>
            </SheetHeader>

            {item.versions.length > 1 && (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Versions">
                {item.versions.map((n) => (
                  <Button key={n} type="button" size="sm" shape="pill" variant={n === item.versionNo ? "navy" : "outline"} onClick={() => setVersion(n)}>v{n}</Button>
                ))}
              </div>
            )}

            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.6px] text-ink-secondary">Énoncé</h3>
              <p className="whitespace-pre-wrap text-sm text-ink">{item.stemEn}</p>
              <ul className="flex flex-col gap-1.5">
                {(item.payload.choices ?? []).map((c) => (
                  <li key={c.id} className={cn("flex gap-2 rounded-card border px-3 py-2 text-sm", c.correct ? "border-success bg-success-bg" : "border-[#E7E0D4]")}>
                    <span className="font-bold text-navy">{c.id}</span><span className="flex-1">{c.text}</span>
                    {c.correct && <span className="text-xs font-semibold text-success">Bonne réponse</span>}
                  </li>
                ))}
                {(item.payload.statements ?? []).map((s) => (
                  <li key={s.id} className="flex gap-2 rounded-card border border-[#E7E0D4] px-3 py-2 text-sm">
                    <span className="font-bold text-navy">{s.id}</span><span className="flex-1">{s.text}</span>
                    <span className={cn("text-xs font-semibold", s.answer ? "text-success" : "text-error")}>{s.answer ? "Yes" : "No"}</span>
                  </li>
                ))}
              </ul>
              {item.payload.selectCount ? <p className="text-xs text-ink-secondary">Choose {item.payload.selectCount}</p> : null}
            </section>

            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.6px] text-ink-secondary">Explication (FR)</h3>
              <p className="whitespace-pre-wrap text-sm text-ink">{item.explanationFr ?? "—"}</p>
            </section>

            <dl className="grid gap-x-4 gap-y-1 rounded-card bg-app-bg p-3 text-xs sm:grid-cols-[auto_1fr]">
              <dt className="text-ink-secondary">Auteur</dt><dd className="text-ink">{item.author}</dd>
              <dt className="text-ink-secondary">Relecteur</dt><dd className="text-ink">{item.reviewer ?? "—"}</dd>
              <dt className="text-ink-secondary">Vérification technique</dt><dd className="text-ink">{item.verifiedBy ? `${item.verifiedBy} · ${stamp(item.verifiedAt)}` : "—"}</dd>
              <dt className="text-ink-secondary">Publication</dt><dd className="text-ink">{item.publisher ? `${item.publisher} · ${stamp(item.publishedAt)}` : "—"}</dd>
              <dt className="text-ink-secondary">Guide</dt><dd className="text-ink">{item.blueprintLabel}</dd>
              {item.reviewNote && (<><dt className="text-ink-secondary">Note de relecture</dt><dd className="text-ink">{item.reviewNote}</dd></>)}
              {item.retireReason && (<><dt className="text-ink-secondary">Motif du retrait</dt><dd className="text-ink">{item.retireReason}</dd></>)}
            </dl>

            <div className="flex flex-wrap gap-2 border-t border-[#E7E0D4] pt-4">
              {item.status === "DRAFT" && isAuthor && can("SIMULATOR_AUTHOR") && (
                <>
                  <Button type="button" size="sm" shape="rounded" variant="outline" onClick={() => setEditing(true)}><Pencil />Modifier</Button>
                  <Button type="button" size="sm" shape="rounded" variant="navy" disabled={w.submit.isPending}
                    onClick={() => void run(() => w.submit.mutateAsync({ code: item.code, version: item.versionNo }), "Soumise à relecture")}>Soumettre à relecture</Button>
                  <Button type="button" size="sm" shape="rounded" variant="outline"
                    onClick={() => { if (window.confirm("Supprimer ce brouillon ?")) void run(async () => { await w.deleteDraft.mutateAsync({ code: item.code, version: item.versionNo }); close(); }, "Brouillon supprimé"); }}><Trash2 />Supprimer</Button>
                </>
              )}
              {item.status === "IN_REVIEW" && !isAuthor && can("SIMULATOR_REVIEW") && (
                <Button type="button" size="sm" shape="rounded" variant="navy" onClick={() => setReviewing(true)}>Relire</Button>
              )}
              {item.status === "IN_REVIEW" && isAuthor && <p className="text-xs text-ink-secondary">En attente d'une relecture par une autre personne.</p>}
              {item.status === "APPROVED" && !isAuthor && can("SIMULATOR_MANAGE") && (
                <Button type="button" size="sm" shape="rounded" variant="navy" disabled={w.publish.isPending}
                  onClick={() => void run(() => w.publish.mutateAsync({ code: item.code, version: item.versionNo }), "Question publiée")}>Publier</Button>
              )}
              {item.status === "APPROVED" && isAuthor && <p className="text-xs text-ink-secondary">Approuvée : une autre personne doit la publier.</p>}
              {item.status === "PUBLISHED" && can("SIMULATOR_MANAGE") && (
                <Button type="button" size="sm" shape="rounded" variant="outline" onClick={() => setRetiring(true)}>Retirer</Button>
              )}
              {(item.status === "PUBLISHED" || item.status === "RETIRED") && item.versionNo === latest && can("SIMULATOR_AUTHOR") && (
                <Button type="button" size="sm" shape="rounded" variant="outline" disabled={w.newVersion.isPending}
                  onClick={() => void run(async () => { const v = await w.newVersion.mutateAsync(item.code); setVersion(v.versionNo); }, "Nouvelle version ouverte")}>Nouvelle version</Button>
              )}
            </div>
          </div>
        )}
        {editing && item && <ItemEditor item={item} onClose={() => setEditing(false)} onSaved={() => undefined} />}
        {reviewing && item && <ReviewDialog item={item} onClose={() => setReviewing(false)} onDone={() => setReviewing(false)} />}
        {retiring && item && (
          <ReasonDialog title={`Retirer ${item.code}`} description="La question ne sera plus proposée dans les nouveaux examens. L'historique est conservé." confirmLabel="Retirer"
            onClose={() => setRetiring(false)}
            onSubmit={async (reason) => { await run(() => w.retire.mutateAsync({ code: item.code, version: item.versionNo, reason }), "Question retirée"); setRetiring(false); }} />
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function AdminSimulateur() {
  const { can } = useAuth();
  const [tab, setTab] = useState<"questions" | "coverage">("questions");
  const [filters, setFilters] = useState<ItemFilters>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [openCode, setOpenCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  const { data: blueprint } = useSimBlueprint();
  const { data: coverage = [] } = useSimCoverage();
  const query = useSimItems({ ...filters, q: search.trim() || undefined }, page);
  const skills = useMemo(() => blueprint?.domains.flatMap((d) => d.skills.map((s) => ({ ...s, domain: d.code }))) ?? [], [blueprint]);
  const set = (patch: Partial<ItemFilters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(0); };

  const totals = useMemo(() => coverage.reduce((a, r) => ({ target: a.target + r.target, published: a.published + r.published }), { target: 0, published: 0 }), [coverage]);

  return (
    <AdminLayout
      title="Simulateur — banque de questions"
      description={blueprint ? `${blueprint.certification} · ${blueprint.label} · ${blueprint.durationMinutes} min · réussite ${blueprint.passScore}/1000` : "Questions du simulateur de certification"}
      actions={(
        <div className="flex gap-2">
          {can("SIMULATOR_MANAGE") && <Button type="button" size="sm" shape="rounded" variant="outline" onClick={() => setImporting(true)}><FileUp />Importer</Button>}
          {can("SIMULATOR_AUTHOR") && <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouvelle question</Button>}
        </div>
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Simulateur">
          <Button type="button" role="tab" aria-selected={tab === "questions"} size="sm" shape="pill" variant={tab === "questions" ? "navy" : "outline"} onClick={() => setTab("questions")}>Questions</Button>
          <Button type="button" role="tab" aria-selected={tab === "coverage"} size="sm" shape="pill" variant={tab === "coverage" ? "navy" : "outline"} onClick={() => setTab("coverage")}>
            Couverture<span className="ml-1.5 rounded-pill bg-surface-sand px-1.5 text-[0.6875rem] font-bold text-ink-secondary">{totals.published}/{totals.target}</span>
          </Button>
        </div>

        {tab === "questions" && (
          <>
            <Card radius="stat" className="flex flex-wrap items-center gap-3 border border-[#E7E0D4] p-4">
              <label className="relative min-w-52 flex-1">
                <span className="sr-only">Rechercher une question</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" aria-hidden="true" />
                <input className={cn(inputClass, "pl-9")} placeholder="Code ou texte de l'énoncé" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
              </label>
              <select aria-label="Statut" className={cn(inputClass, "w-40")} value={filters.status ?? ""} onChange={(e) => set({ status: (e.target.value || undefined) as ItemStatus | undefined })}>
                <option value="">Tous les statuts</option>
                {(Object.keys(ITEM_STATUS_LABELS) as ItemStatus[]).map((s) => <option key={s} value={s}>{ITEM_STATUS_LABELS[s]}</option>)}
              </select>
              <select aria-label="Compétence" className={cn(inputClass, "w-52")} value={filters.skill ?? ""} onChange={(e) => set({ skill: e.target.value || undefined })}>
                <option value="">Toutes les compétences</option>
                {skills.map((s) => <option key={s.code} value={s.code}>{s.code}</option>)}
              </select>
              <select aria-label="Type" className={cn(inputClass, "w-40")} value={filters.type ?? ""} onChange={(e) => set({ type: (e.target.value || undefined) as ItemType | undefined })}>
                <option value="">Tous les types</option>
                {(Object.keys(ITEM_TYPE_LABELS) as ItemType[]).map((t) => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={!!filters.mine} onChange={(e) => set({ mine: e.target.checked || undefined })} className="h-4 w-4 accent-[#1A3A5B]" />Mes questions
              </label>
            </Card>

            {query.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
            {query.isError && <ErrorNotice>{errorMessage(query.error, "Impossible de charger la banque de questions.")}</ErrorNotice>}
            {query.data && query.data.items.length === 0 && <EmptyState title="Aucune question" text="Rédigez la première question ou importez un lot de brouillons." />}
            {query.data && query.data.items.length > 0 && (
              <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
                <ul>
                  {query.data.items.map((it) => (
                    <li key={`${it.code}-${it.versionNo}`} className="border-b border-[#E7E0D4] last:border-b-0">
                      <button type="button" onClick={() => setOpenCode(it.code)} className="flex w-full flex-wrap items-start gap-3 px-4 py-3 text-left hover:bg-app-bg">
                        <span className="w-28 shrink-0 font-heading text-sm font-bold text-navy">{it.code}<span className="ml-1 text-xs font-normal text-ink-secondary">v{it.versionNo}</span></span>
                        <span className="min-w-0 flex-1 basis-64 text-sm text-ink">{it.stemPreview}</span>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <Pill variant="info">{ITEM_TYPE_LABELS[it.type]}</Pill>
                          <Pill variant={STATUS_VARIANT[it.status]}>{ITEM_STATUS_LABELS[it.status]}</Pill>
                        </span>
                        <span className="w-36 shrink-0 truncate text-xs text-ink-secondary">{it.skillCode} · {it.author}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {query.data && <Pager page={page} totalPages={query.data.totalPages} totalElements={query.data.totalElements} onChange={setPage} />}
          </>
        )}

        {tab === "coverage" && (
          <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[#E7E0D4] bg-app-bg text-left text-xs text-ink-secondary">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Compétence</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Brouillons</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">En relecture</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Approuvées</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Publiées</th>
                    <th scope="col" className="w-56 px-4 py-2.5 font-semibold">Avancement (publiées / cible)</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((r) => (
                    <tr key={r.skillCode} className="border-b border-[#E7E0D4] last:border-b-0">
                      <td className="px-4 py-2.5"><span className="font-semibold text-navy">{r.skillCode}</span><span className="block text-xs text-ink-secondary">{r.skillName}</span></td>
                      <td className="px-3 py-2.5 text-right">{r.draft}</td>
                      <td className="px-3 py-2.5 text-right">{r.inReview}</td>
                      <td className="px-3 py-2.5 text-right">{r.approved}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{r.published}</td>
                      <td className="px-4 py-2.5">
                        <ProgressBar value={r.target > 0 ? Math.min(100, Math.round((r.published / r.target) * 100)) : 0} aria-label={`Avancement ${r.skillCode}`} className="h-2" />
                        <span className="text-xs text-ink-secondary">{r.published} / {r.target}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <ItemSheet code={openCode} onClose={() => setOpenCode(null)} />
      {creating && <ItemEditor item={null} onClose={() => setCreating(false)} onSaved={(code) => setOpenCode(code)} />}
      {importing && <ImportDialog onClose={() => setImporting(false)} />}
    </AdminLayout>
  );
}
