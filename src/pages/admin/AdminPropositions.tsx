/**
 * AdminPropositions.tsx — validation des propositions de modification du programme (pédagogie).
 * Liste filtrable des propositions des formateurs ; le détail montre les différences avec le programme en ligne
 * (ajouté / modifié / passé en brouillon). Valider applique TOUTE la proposition, par fusion avec le contenu en ligne actuel.
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, ReasonDialog, errorMessage, inputClass } from "@/components/admin/AdminKit";
import { PROPOSAL_VARIANT } from "@/components/admin/ProposalBar";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useProposalDetail, useProposals, useReviewProposal } from "@/hooks/useProposals";
import { diffProposal, hasNewLessons, summarizeDiff, type DiffEntry, type DiffKind, type DiffScope } from "@/lib/proposalDiff";
import { PROPOSAL_STATUS_LABELS, type ProposalDetail, type ProposalStatus } from "@/types/proposal.type";

const stamp = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "—");

const FILTERS: { value: ProposalStatus | ""; label: string }[] = [
  { value: "SUBMITTED", label: "À relire" },
  { value: "CHANGES_REQUESTED", label: "Modifications demandées" },
  { value: "APPROVED", label: "Validées" },
  { value: "REJECTED", label: "Refusées" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "", label: "Toutes" },
];

const KIND_LABELS: Record<DiffKind, string> = { added: "Ajouté", modified: "Modifié", draft: "Passé en brouillon" };
const KIND_VARIANT: Record<DiffKind, "success" | "info" | "warning"> = { added: "success", modified: "info", draft: "warning" };
const SCOPE_LABELS: Record<DiffScope, string> = { module: "Module", lesson: "Leçon", resource: "Ressource", question: "Question" };

function DiffView({ entries }: { entries: DiffEntry[] }) {
  if (entries.length === 0) return <EmptyState title="Aucune différence" text="Cette proposition est identique au programme en ligne." />;
  return (
    <ul className="flex flex-col gap-3">
      {entries.map((e, i) => (
        <li key={i} className="flex flex-col gap-2 rounded-card border border-[#E7E0D4] bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill variant={KIND_VARIANT[e.kind]}>{KIND_LABELS[e.kind]}</Pill>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{SCOPE_LABELS[e.scope]}</span>
            <span className="font-semibold text-ink">{e.title}</span>
            {e.path.length > 0 && <span className="text-xs text-ink-secondary">{e.path.join(" › ")}</span>}
          </div>
          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[160px_minmax(0,1fr)]">
            {e.changes.map((c) => (
              <div key={c.label} className="contents">
                <dt className="text-ink-secondary">{c.label}</dt>
                <dd className="min-w-0 break-words">
                  {e.kind === "added" ? (
                    <span className="text-success">{c.after}</span>
                  ) : (
                    <>
                      <span className="text-ink-secondary line-through">{c.before}</span>
                      <span aria-hidden="true"> → </span>
                      <span className="sr-only"> devient </span>
                      <span className="font-semibold text-ink">{c.after}</span>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function ApproveDialog({ newLessons, onClose, onSubmit }: {
  newLessons: boolean; onClose: () => void; onSubmit: (publishNewLessons: boolean, comment: string) => Promise<void>;
}) {
  const [publish, setPublish] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Valider la proposition</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Toute la proposition est appliquée au programme en ligne, fusionnée avec son état actuel. Cette action est enregistrée dans le journal d'audit.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try { await onSubmit(publish, comment.trim()); } finally { setBusy(false); }
          }}
        >
          {newLessons && (
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1A3A5B]" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
              <span>Publier les nouvelles leçons<span className="block text-xs text-ink-secondary">Sinon elles arrivent en brouillon et vous les publierez ensuite.</span></span>
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm font-semibold text-ink-secondary">
            Commentaire (facultatif)
            <textarea rows={3} className={inputClass} value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={busy} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : "Valider"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProposalDetailView({ proposal, onDone }: { proposal: ProposalDetail; onDone: () => void }) {
  const { toast } = useToast();
  const review = useReviewProposal();
  const [dialog, setDialog] = useState<"approve" | "changes" | "reject" | null>(null);

  const entries = useMemo(
    () => diffProposal(proposal.live, { content: proposal.content, quizBanks: proposal.quizBanks }),
    [proposal]
  );
  const totals = summarizeDiff(entries);
  const reviewable = proposal.status === "SUBMITTED" && !!proposal.id;
  // Le serveur refuse l'auto-validation (403) ; le bouton est masqué pour l'auteur
  const own = proposal.own;

  const run = async (fn: () => Promise<unknown>, title: string) => {
    try { await fn(); toast({ title }); setDialog(null); onDone(); }
    catch (e) { toast({ title: "Action impossible", description: errorMessage(e, "Réessayez dans un instant."), variant: "destructive" }); throw e; }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-bold text-navy">{proposal.formationTitle}</h2>
          {proposal.status && <Pill variant={PROPOSAL_VARIANT[proposal.status]}>{PROPOSAL_STATUS_LABELS[proposal.status]}</Pill>}
        </div>
        <p className="text-sm text-ink-secondary">
          Par {proposal.authorName ?? "—"} · soumise le {stamp(proposal.submittedAt)}
          {proposal.reviewedAt && <> · examinée le {stamp(proposal.reviewedAt)}{proposal.reviewerName ? ` par ${proposal.reviewerName}` : ""}</>}
        </p>
        <p className="text-sm">
          <strong>{totals.added}</strong> ajout{totals.added > 1 ? "s" : ""} · <strong>{totals.modified}</strong> modification{totals.modified > 1 ? "s" : ""} · <strong>{totals.draft}</strong> passage{totals.draft > 1 ? "s" : ""} en brouillon
        </p>
        {proposal.reviewComment && (
          <div role="note" className="rounded-card bg-app-bg px-4 py-3 text-sm"><span className="font-bold">Commentaire :</span> {proposal.reviewComment}</div>
        )}
        {proposal.stale && (
          <div role="alert" className="rounded-card bg-warning-bg px-4 py-3 text-sm text-warning">
            <span className="font-bold">Le contenu en ligne a été modifié depuis cette proposition</span>
            {proposal.liveContentUpdatedAt ? ` (le ${stamp(proposal.liveContentUpdatedAt)})` : ""}. À la validation, la proposition est fusionnée avec la version actuelle :
            les éléments ajoutés entre-temps sont conservés, ceux de la proposition remplacent leurs équivalents.
          </div>
        )}
        {reviewable && (
          <div className="flex flex-wrap gap-2 pt-1">
            {!own && <Button shape="rounded" size="sm" onClick={() => setDialog("approve")}>Valider</Button>}
            <Button variant="outline" shape="rounded" size="sm" onClick={() => setDialog("changes")}>Demander des modifications</Button>
            <Button variant="outline" shape="rounded" size="sm" onClick={() => setDialog("reject")}>Refuser</Button>
            {own && <span className="self-center text-xs text-ink-secondary">Vous ne pouvez pas valider votre propre proposition.</span>}
          </div>
        )}
      </Card>

      <DiffView entries={entries} />

      {dialog === "approve" && (
        <ApproveDialog
          newLessons={hasNewLessons(entries)}
          onClose={() => setDialog(null)}
          onSubmit={(publishNewLessons, comment) =>
            run(() => review.approve.mutateAsync({ id: proposal.id as string, body: { publishNewLessons, comment: comment || undefined } }), "Proposition validée : le programme est à jour").catch(() => undefined)}
        />
      )}
      {dialog === "changes" && (
        <ReasonDialog
          title="Demander des modifications"
          description="Le formateur pourra corriger sa proposition puis la soumettre à nouveau. Votre commentaire lui est transmis."
          confirmLabel="Envoyer la demande"
          onClose={() => setDialog(null)}
          onSubmit={(comment) => run(() => review.requestChanges.mutateAsync({ id: proposal.id as string, comment }), "Modifications demandées").catch(() => undefined)}
        />
      )}
      {dialog === "reject" && (
        <ReasonDialog
          title="Refuser la proposition"
          description="La proposition est clôturée sans modifier le programme. Votre commentaire est transmis au formateur."
          confirmLabel="Refuser"
          onClose={() => setDialog(null)}
          onSubmit={(comment) => run(() => review.reject.mutateAsync({ id: proposal.id as string, comment }), "Proposition refusée").catch(() => undefined)}
        />
      )}
    </div>
  );
}

export default function AdminPropositions() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("id") ?? undefined;
  const [status, setStatus] = useState<ProposalStatus | "">("SUBMITTED");
  const list = useProposals(status || undefined);
  const detail = useProposalDetail(selected);

  const select = (id?: string) => setParams(id ? { id } : {}, { replace: true });

  return (
    <AdminLayout title="Propositions de programme" description="Modifications proposées par les formateurs, à relire et valider">
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Afficher
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as ProposalStatus | "")}>
              {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          {list.isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-ink-secondary" />}
          {list.isError && <ErrorNotice>{errorMessage(list.error, "Impossible de charger les propositions.")}</ErrorNotice>}
          {list.data && list.data.length === 0 && <EmptyState title="Aucune proposition" text="Rien à afficher pour ce filtre." />}
          {list.data && list.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {list.data.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => select(p.id)}
                    aria-current={selected === p.id}
                    className={`flex w-full flex-col gap-1 rounded-card border bg-white p-3 text-left ${selected === p.id ? "border-navy" : "border-[#E7E0D4] hover:border-navy/50"}`}
                  >
                    <span className="font-semibold text-ink">{p.formationTitle}</span>
                    <span className="text-xs text-ink-secondary">{p.authorName} · {stamp(p.submittedAt ?? p.updatedAt)}</span>
                    <span className="flex flex-wrap gap-2">
                      <Pill variant={PROPOSAL_VARIANT[p.status]}>{PROPOSAL_STATUS_LABELS[p.status]}</Pill>
                      {p.stale && <Pill variant="warning">Contenu en ligne modifié depuis</Pill>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0">
          {!selected && <EmptyState title="Sélectionnez une proposition" text="Choisissez une proposition dans la liste pour voir ses différences avec le programme en ligne." />}
          {selected && detail.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
          {selected && detail.isError && <ErrorNotice>{errorMessage(detail.error, "Impossible de charger cette proposition.")}</ErrorNotice>}
          {selected && detail.data && <ProposalDetailView key={detail.data.id ?? selected} proposal={detail.data} onDone={() => detail.refetch()} />}
        </div>
      </div>
    </AdminLayout>
  );
}
