/**
 * Bandeau d'état et boutons d'une proposition de modification du programme (éditeur en mode proposition).
 * Le formateur modifie une copie : rien n'est publié tant que la pédagogie n'a pas validé.
 */
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Send, Undo2 } from "lucide-react";

import { Button, Pill } from "@/components/shared";
import { PROPOSAL_EDITABLE, PROPOSAL_STATUS_LABELS, type ProposalPayload, type ProposalStatus } from "@/types/proposal.type";

export const PROPOSAL_VARIANT: Record<ProposalStatus, "success" | "info" | "warning" | "neutral" | "error"> = {
  DRAFT: "neutral", SUBMITTED: "info", CHANGES_REQUESTED: "warning", APPROVED: "success", REJECTED: "error",
};

const stamp = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : null);

export function ProposalBanner({ proposal }: { proposal: ProposalPayload }) {
  const { status } = proposal;
  const comment = proposal.reviewComment?.trim();
  return (
    <div className="flex flex-col gap-3">
      <div role="status" className="flex flex-col gap-2 rounded-card bg-app-bg px-4 py-3 text-sm text-ink">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-navy">Proposition de modification</span>
          {status ? <Pill variant={PROPOSAL_VARIANT[status]}>{PROPOSAL_STATUS_LABELS[status]}</Pill> : <Pill variant="neutral">Non enregistrée</Pill>}
          {status === "SUBMITTED" && stamp(proposal.submittedAt) && <span className="text-ink-secondary">envoyée le {stamp(proposal.submittedAt)}</span>}
        </div>
        <p className="text-ink-secondary">
          {status === "SUBMITTED"
            ? "Votre proposition est en cours d'examen par la pédagogie. Retirez-la pour la modifier à nouveau."
            : status === "APPROVED"
              ? "Votre proposition a été validée et appliquée au programme en ligne."
              : status === "REJECTED"
                ? "Votre proposition a été refusée."
                : "Vous modifiez une copie du programme : rien n'est publié tant que la pédagogie n'a pas validé. Vous ne pouvez rien supprimer de ce qui est en ligne ; une leçon se passe en brouillon."}
        </p>
      </div>
      {comment && (
        <div role="note" className={`rounded-card px-4 py-3 text-sm ${status === "CHANGES_REQUESTED" || status === "REJECTED" ? "bg-warning-bg text-warning" : "bg-app-bg text-ink"}`}>
          <span className="font-bold">Commentaire de la pédagogie{proposal.reviewerName ? ` (${proposal.reviewerName})` : ""} :</span> {comment}
        </div>
      )}
      {proposal.stale && PROPOSAL_EDITABLE.includes(status) && (
        <div role="status" className="rounded-card bg-warning-bg px-4 py-3 text-sm text-warning">
          Le programme en ligne a été modifié depuis le début de votre proposition. La pédagogie fusionnera vos changements avec la version actuelle.
        </div>
      )}
    </div>
  );
}

export function ProposalActions({ status, dirty, busy, onSave, onSubmit, onWithdraw }: {
  status: ProposalStatus | null;
  dirty: boolean;
  busy: boolean;
  onSave: () => void;
  onSubmit: () => void;
  onWithdraw: () => void;
}) {
  const editable = PROPOSAL_EDITABLE.includes(status);
  return (
    <>
      {status === "SUBMITTED" && (
        <Button variant="outline" shape="rounded" size="sm" onClick={onWithdraw} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Undo2 className="h-4 w-4" /> Retirer</>}
        </Button>
      )}
      {editable && (
        <>
          <Button variant="outline" shape="rounded" size="sm" onClick={onSave} disabled={!dirty || busy}>Enregistrer</Button>
          <Button variant="primary" shape="rounded" size="sm" onClick={onSubmit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Soumettre</>}
          </Button>
        </>
      )}
    </>
  );
}
