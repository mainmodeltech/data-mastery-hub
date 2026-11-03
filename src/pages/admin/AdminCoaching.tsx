/**
 * AdminCoaching.tsx — demandes de coaching (responsable pédagogique et Finance).
 * La pédagogie prend en charge la demande, l'analyse avec le formateur, puis la valide : elle fixe l'offre et le montant, et le lien de paiement
 * part par e-mail. La Finance confirme ou refuse un paiement manuel déclaré (séparation des tâches). Le serveur vérifie les droits ; l'écran
 * n'affiche que ce que la personne peut faire.
 */
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, ExternalLink, FileImage, Loader2, Mail, UserCheck, X } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  useCancelCoaching, useCoachingProof, useCoachingRequest, useCoachingRequests, useCoachingSummary, useConfirmCoachingPayment, useDeclineCoaching, useRejectCoachingPayment,
  useResendCoachingLink, useTakeCoaching, useUpdateCoaching, useValidateCoaching,
} from "@/hooks/useCoaching";
import { useTrainers } from "@/hooks/useSessionOps";
import { formatAmount } from "@/types/payment.type";
import { MANUAL_METHOD_LABELS } from "@/types/simulatorShop.type";
import { COACHING_STATUS_LABELS, type CoachingRequestView, type CoachingStatus } from "@/types/coaching.type";

const stamp = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "—");

const STATUS_VARIANT: Record<CoachingStatus, "success" | "warning" | "error" | "neutral" | "info"> = {
  NEW: "warning", IN_REVIEW: "info", AWAITING_PAYMENT: "info", PAYMENT_DECLARED: "warning", PAID: "success", DECLINED: "neutral", CANCELLED: "neutral", EXPIRED: "neutral",
};

/** Onglets de la liste, dans l'ordre du circuit. */
const TABS: CoachingStatus[] = ["NEW", "IN_REVIEW", "AWAITING_PAYMENT", "PAYMENT_DECLARED", "PAID", "DECLINED", "CANCELLED", "EXPIRED"];

// ── Validation : offre, montant, formateur confirmé ─────────────────────

function ValidateDialog({ request, onClose }: { request: CoachingRequestView; onClose: () => void }) {
  const { toast } = useToast();
  const validate = useValidateCoaching();
  const trainers = useTrainers(true);
  const [offer, setOffer] = useState(request.offerLabel ?? request.tier ?? "");
  const [amount, setAmount] = useState(request.amountXof ?? 0);
  const [trainerName, setTrainerName] = useState(request.trainerName ?? "");
  const [trainerEmail, setTrainerEmail] = useState(request.trainerEmail ?? "");
  const [notes, setNotes] = useState(request.internalNotes ?? "");
  const [confirmed, setConfirmed] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await validate.mutateAsync({
        id: request.id,
        body: { offerLabel: offer.trim(), amountXof: amount, trainerName: trainerName.trim(), trainerEmail: trainerEmail.trim() || undefined, internalNotes: notes.trim() || undefined, trainerConfirmed: confirmed },
      });
      toast({ title: "Coaching validé", description: `Le lien de paiement est envoyé à ${request.email}.` });
      onClose();
    } catch (err) {
      toast({ title: "Validation impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !validate.isPending && onClose()}>
      <DialogContent className="max-w-lg rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Valider le coaching de {request.firstName}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Le montant et l'offre sont fixés ici. Le client reçoit aussitôt par e-mail son lien de paiement personnel ; l'action est tracée dans l'audit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Offre convenue *" htmlFor="co-offer" hint="Ce que le client achète, repris dans son e-mail (ex. « 2 séances d'1 h sur DAX »).">
            <input id="co-offer" required maxLength={255} className={inputClass} value={offer} onChange={(e) => setOffer(e.target.value)} />
          </Field>
          <Field label="Montant (FCFA) *" htmlFor="co-amount">
            <input id="co-amount" type="number" min={100} max={10000000} step={1} required className={inputClass} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
          </Field>
          {trainers.data && trainers.data.length > 0 && (
            <Field label="Formateur de l'équipe" htmlFor="co-trainer-pick">
              <select
                id="co-trainer-pick" className={inputClass} value=""
                onChange={(e) => { const t = trainers.data?.find((x) => x.id === e.target.value); if (t) { setTrainerName(t.fullName); setTrainerEmail(t.email); } }}
              >
                <option value="">Choisir dans la liste pour remplir les champs…</option>
                {trainers.data.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom du formateur *" htmlFor="co-trainer-name"><input id="co-trainer-name" required maxLength={255} className={inputClass} value={trainerName} onChange={(e) => setTrainerName(e.target.value)} /></Field>
            <Field label="E-mail du formateur" htmlFor="co-trainer-email" hint="Il est prévenu quand le paiement est confirmé."><input id="co-trainer-email" type="email" maxLength={255} className={inputClass} value={trainerEmail} onChange={(e) => setTrainerEmail(e.target.value)} /></Field>
          </div>
          <Field label="Notes internes" htmlFor="co-notes"><textarea id="co-notes" rows={2} maxLength={4000} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
            <span>J'ai confirmé la disponibilité avec le formateur et l'offre avec le client si nécessaire.</span>
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={validate.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={validate.isPending || !confirmed || !offer.trim() || amount < 100 || !trainerName.trim()}>
              {validate.isPending ? <Loader2 className="animate-spin" /> : "Valider et envoyer le lien"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Fiche d'une demande ─────────────────────────────────────────────────

type Reasoning = "decline" | "cancel" | "reject" | null;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{label}</span>
      <span className="break-words text-ink">{children}</span>
    </div>
  );
}

function Drawer({ request, onClose }: { request: CoachingRequestView; onClose: () => void }) {
  const { toast } = useToast();
  const { can } = useAuth();
  const canHandle = can("COACHING_MANAGE");
  const canMoney = can("PAYMENTS_MANAGE");
  const take = useTakeCoaching();
  const update = useUpdateCoaching();
  const decline = useDeclineCoaching();
  const cancel = useCancelCoaching();
  const resend = useResendCoachingLink();
  const confirm = useConfirmCoachingPayment();
  const reject = useRejectCoachingPayment();
  const proof = useCoachingProof();
  const [validating, setValidating] = useState(false);
  const [reasoning, setReasoning] = useState<Reasoning>(null);
  const [trainerName, setTrainerName] = useState(request.trainerName ?? "");
  const [trainerEmail, setTrainerEmail] = useState(request.trainerEmail ?? "");
  const [notes, setNotes] = useState(request.internalNotes ?? "");
  useEffect(() => { setTrainerName(request.trainerName ?? ""); setTrainerEmail(request.trainerEmail ?? ""); setNotes(request.internalNotes ?? ""); }, [request]);

  const open = request.status === "NEW" || request.status === "IN_REVIEW";
  const toastError = (title: string) => (err: unknown) => toast({ title, description: errorMessage(err), variant: "destructive" });

  const run = async (fn: () => Promise<unknown>, ok: string, fail: string) => {
    try { await fn(); toast({ title: ok }); } catch (err) { toastError(fail)(err); }
  };

  const reasonSubmit = async (reason: string) => {
    const id = request.id;
    try {
      if (reasoning === "decline") { await decline.mutateAsync({ id, reason }); toast({ title: "Demande refusée", description: "Le client reçoit le motif par e-mail." }); }
      if (reasoning === "cancel") { await cancel.mutateAsync({ id, reason }); toast({ title: "Coaching annulé", description: "Le lien de paiement n'est plus utilisable." }); }
      if (reasoning === "reject") { await reject.mutateAsync({ id, reason }); toast({ title: "Paiement refusé", description: "Le client voit le motif et peut déclarer de nouveau." }); }
      setReasoning(null);
    } catch (err) { toastError("Action impossible")(err); }
  };

  const reasonText = {
    decline: { title: "Refuser cette demande", description: "Le client reçoit ce motif par e-mail.", confirm: "Refuser" },
    cancel: { title: "Annuler ce coaching", description: "Le lien de paiement devient inutilisable. Un paiement en ligne qui arriverait quand même serait signalé, jamais compté.", confirm: "Annuler le coaching" },
    reject: { title: "Refuser ce paiement", description: "Le client verra ce motif et pourra déclarer son paiement de nouveau. Rien n'est confirmé.", confirm: "Refuser le paiement" },
  } as const;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl font-bold text-navy">{request.firstName} {request.lastName}</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap items-center gap-2"><Pill variant={STATUS_VARIANT[request.status]}>{COACHING_STATUS_LABELS[request.status]}</Pill><span className="text-xs text-ink-secondary">demandé le {stamp(request.createdAt)}</span></div>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Row label="E-mail"><a className="text-navy underline" href={`mailto:${request.email}`}>{request.email}</a></Row>
            <Row label="Téléphone">{request.phone ?? "—"}</Row>
            <Row label="Entreprise">{request.company ?? "—"}</Row>
            <Row label="Formule souhaitée">{request.tier ?? "—"}</Row>
            <Row label="Créneau souhaité">{request.slot ?? "—"}</Row>
            <Row label="Conditions acceptées le">{stamp(request.termsAcceptedAt)}</Row>
          </div>
          {request.message && <Row label="Message du client"><span className="whitespace-pre-wrap">{request.message}</span></Row>}

          {request.offerLabel && (
            <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-4">
              <Row label="Offre convenue">{request.offerLabel}</Row>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Montant"><strong>{request.amountXof ? formatAmount(request.amountXof) : "—"}</strong></Row>
                <Row label="Formateur">{request.trainerName}{request.trainerEmail ? ` (${request.trainerEmail})` : ""}</Row>
                <Row label="Validé par">{request.validatedBy} · {stamp(request.validatedAt)}</Row>
                {request.tokenExpiresAt && request.status.startsWith("AWAITING") && <Row label="Lien valable jusqu'au">{stamp(request.tokenExpiresAt)}</Row>}
              </div>
              {request.paymentLink && (
                <Row label="Lien de paiement"><a className="inline-flex items-center gap-1 break-all text-navy underline" href={request.paymentLink} target="_blank" rel="noopener noreferrer">{request.paymentLink}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a></Row>
              )}
            </Card>
          )}

          {request.status === "PAYMENT_DECLARED" && (
            <Card radius="stat" className="flex flex-col gap-2 border border-warning/50 bg-warning-bg p-4">
              <strong className="text-sm text-ink">Paiement manuel déclaré, à vérifier</strong>
              <p className="text-sm text-ink">
                {request.manualMethod ? MANUAL_METHOD_LABELS[request.manualMethod] : "Paiement"} · réf. <span className="break-all font-mono">{request.manualReference}</span> · déclaré le {stamp(request.declaredAt)}
              </p>
              <div className="flex flex-wrap gap-2">
                {request.proofUploaded && (
                  <Button type="button" size="sm" variant="outline" shape="rounded" disabled={proof.isPending}
                    onClick={() => proof.mutate(request.id, { onSuccess: (url) => { if (url.startsWith("https://") || url.startsWith("http://localhost")) window.open(url, "_blank", "noopener,noreferrer"); }, onError: toastError("Justificatif indisponible") })}>
                    <FileImage />Voir le justificatif
                  </Button>
                )}
                {canMoney ? (
                  <>
                    <Button type="button" size="sm" shape="rounded" disabled={confirm.isPending} onClick={() => run(() => confirm.mutateAsync(request.id), "Paiement confirmé", "Confirmation impossible")}><CheckCircle2 />Confirmer le paiement</Button>
                    <Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setReasoning("reject")}><X />Refuser</Button>
                  </>
                ) : <span className="text-xs text-ink-secondary">La confirmation est faite par la Finance.</span>}
              </div>
            </Card>
          )}

          {request.status === "PAID" && (
            <Card radius="stat" className="flex flex-col gap-1 border border-success/40 bg-success-bg p-4 text-sm text-ink">
              <strong>Payé le {stamp(request.paidAt)}</strong>
              <span>{request.paidAmountXof ? formatAmount(request.paidAmountXof) : ""} · {request.paidChannel === "ONLINE" ? "en ligne" : `manuel, confirmé par ${request.confirmedBy}`}</span>
              <span className="text-xs text-ink-secondary">Le formateur et le responsable ont été prévenus par e-mail pour planifier les séances.</span>
            </Card>
          )}

          {request.closingReason && <Row label={request.status === "DECLINED" ? "Motif du refus" : "Motif"}>{request.closingReason}</Row>}
          {request.rejectNote && request.status === "AWAITING_PAYMENT" && <Row label="Dernier paiement refusé">{request.rejectNote}</Row>}

          {open && canHandle && (
            <div className="flex flex-col gap-3 rounded-card border border-[#E7E0D4] p-4">
              <h3 className="font-heading text-base font-bold text-navy">Analyse et formateur</h3>
              <Row label="Pris en charge par">{request.assignedTo ?? "personne pour le moment"}</Row>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Formateur envisagé" htmlFor="dr-trainer"><input id="dr-trainer" className={inputClass} value={trainerName} maxLength={255} onChange={(e) => setTrainerName(e.target.value)} /></Field>
                <Field label="E-mail du formateur" htmlFor="dr-trainer-email"><input id="dr-trainer-email" type="email" className={inputClass} value={trainerEmail} maxLength={255} onChange={(e) => setTrainerEmail(e.target.value)} /></Field>
              </div>
              <Field label="Notes internes (jamais vues du client)" htmlFor="dr-notes"><textarea id="dr-notes" rows={3} className={inputClass} value={notes} maxLength={4000} onChange={(e) => setNotes(e.target.value)} /></Field>
              <Button type="button" size="sm" variant="outline" shape="rounded" className="w-fit" disabled={update.isPending}
                onClick={() => run(() => update.mutateAsync({ id: request.id, body: { trainerName: trainerName.trim() || undefined, trainerEmail: trainerEmail.trim() || undefined, internalNotes: notes.trim() || undefined } }), "Enregistré", "Enregistrement impossible")}>
                {update.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}
              </Button>
            </div>
          )}
          {!open && request.internalNotes && <Row label="Notes internes"><span className="whitespace-pre-wrap">{request.internalNotes}</span></Row>}

          {canHandle && (
            <div className="flex flex-wrap gap-2 border-t border-[#E7E0D4] pt-4">
              {request.status === "NEW" && (
                <Button type="button" size="sm" shape="rounded" disabled={take.isPending} onClick={() => run(() => take.mutateAsync(request.id), "Demande prise en charge", "Action impossible")}><UserCheck />Prendre en charge</Button>
              )}
              {open && <Button type="button" size="sm" shape="rounded" onClick={() => setValidating(true)}><CheckCircle2 />Valider et envoyer le lien</Button>}
              {open && <Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setReasoning("decline")}><X />Refuser</Button>}
              {request.status === "AWAITING_PAYMENT" && (
                <Button type="button" size="sm" variant="outline" shape="rounded" disabled={resend.isPending} onClick={() => run(() => resend.mutateAsync(request.id), "Lien renvoyé", "Envoi impossible")}><Mail />Renvoyer le lien</Button>
              )}
              {(request.status === "AWAITING_PAYMENT" || request.status === "PAYMENT_DECLARED") && (
                <Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setReasoning("cancel")}><X />Annuler le coaching</Button>
              )}
            </div>
          )}
        </div>

        {validating && <ValidateDialog request={request} onClose={() => setValidating(false)} />}
        {reasoning && (
          <ReasonDialog title={reasonText[reasoning].title} description={reasonText[reasoning].description} confirmLabel={reasonText[reasoning].confirm}
            onClose={() => setReasoning(null)} onSubmit={reasonSubmit} />
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function AdminCoaching() {
  const [status, setStatus] = useState<CoachingStatus | undefined>("NEW");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useCoachingRequests(status, page);
  const summary = useCoachingSummary();
  const opened = useCoachingRequest(openId).data ?? null;

  return (
    <AdminLayout title="Demandes de coaching" description="Analyser une demande, confirmer le formateur, valider et envoyer le lien de paiement ; la Finance vérifie les paiements manuels.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Statut des demandes">
          {TABS.map((s) => (
            <button
              key={s} type="button" role="tab" aria-selected={status === s} onClick={() => { setStatus(s); setPage(0); }}
              className={`rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors ${status === s ? "border-navy bg-navy text-white" : "border-[#D6CEC0] bg-white text-ink hover:border-navy"}`}
            >
              {COACHING_STATUS_LABELS[s]}{summary.data ? ` · ${summary.data.counts[s] ?? 0}` : ""}
            </button>
          ))}
        </div>
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les demandes.")}</ErrorNotice>}
        {data && data.items.length === 0 && <EmptyState title="Aucune demande" text="Les demandes de coaching de ce statut apparaîtront ici." />}
        {data && data.items.length > 0 && (
          <>
            <Card radius="stat" className="overflow-x-auto border border-[#E7E0D4] p-0">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#E7E0D4] text-xs uppercase tracking-wide text-ink-secondary">
                  <tr><th className="px-4 py-3 font-semibold">Demandeur</th><th className="px-4 py-3 font-semibold">Demande</th><th className="px-4 py-3 font-semibold">Offre</th><th className="px-4 py-3 font-semibold">État</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody>
                  {data.items.map((r) => (
                    <tr key={r.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                      <td className="px-4 py-3"><div className="font-semibold text-ink">{r.firstName} {r.lastName}</div><div className="text-xs text-ink-secondary">{r.email}</div>{r.company && <div className="text-xs text-ink-secondary">{r.company}</div>}</td>
                      <td className="px-4 py-3 text-ink-secondary"><div>{r.tier ?? "—"}</div><div className="text-xs">{stamp(r.createdAt)}</div>{r.assignedTo && <div className="text-xs">pris par {r.assignedTo}</div>}</td>
                      <td className="px-4 py-3">{r.offerLabel ? <><div>{r.offerLabel}</div><div className="text-xs text-ink-secondary">{r.amountXof ? formatAmount(r.amountXof) : ""} · {r.trainerName}</div></> : <span className="text-ink-secondary">—</span>}</td>
                      <td className="px-4 py-3"><Pill variant={STATUS_VARIANT[r.status]}>{COACHING_STATUS_LABELS[r.status]}</Pill></td>
                      <td className="px-4 py-3 text-right"><Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setOpenId(r.id)}>Ouvrir</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Pager page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
          </>
        )}
      </div>
      {opened && <Drawer request={opened} onClose={() => setOpenId(null)} />}
    </AdminLayout>
  );
}
