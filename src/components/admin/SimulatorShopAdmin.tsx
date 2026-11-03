/**
 * Vente du simulateur (administration) : forfaits (prix, durée, quota), commandes et état de la passerelle de paiement.
 * Paiements manuels (Wave, Orange Money, virement) : l'équipe vérifie le justificatif puis confirme (l'accès s'ouvre) ou refuse avec un motif.
 * Les droits sont vérifiés par le serveur : forfaits et revérification = SIMULATOR_MANAGE ; lecture des commandes = SIMULATOR_MANAGE ou PAYMENTS_VIEW ;
 * confirmer ou refuser un paiement manuel = SIMULATOR_MANAGE ou PAYMENTS_MANAGE.
 */
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, FileImage, Loader2, Pencil, RefreshCw, X } from "lucide-react";

import { EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminPlans, useConfirmOrder, useGatewayStatus, useOrderProof, useRejectOrder, useSimOrders, useUpdatePlan, useVerifyOrder } from "@/hooks/useSimulatorAdmin";
import { formatAmount } from "@/types/payment.type";
import { MANUAL_METHOD_LABELS, ORDER_STATUS_LABELS, type AdminOrder, type AdminPlan, type OrderStatus } from "@/types/simulatorShop.type";

const stamp = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "—");

const STATUS_VARIANT: Record<OrderStatus, "success" | "warning" | "error" | "neutral" | "info"> = {
  PAID: "success", PENDING: "warning", DECLARED: "info", FAILED: "error", CANCELLED: "neutral", EXPIRED: "neutral",
};

// ── Passerelle ────────────────────────────────────────────────────────

function GatewayBanner() {
  const { data, isError } = useGatewayStatus();
  if (isError || !data) return null;
  const sandbox = data.mode === "sandbox";
  return (
    <Card radius="stat" className={`flex flex-col gap-1.5 border p-4 ${data.configured ? "border-[#E7E0D4]" : "border-warning/50 bg-warning-bg"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {data.configured ? <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /> : <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />}
        <strong className="text-sm text-ink">{data.provider === "PAYDUNYA" ? "PayDunya" : data.provider}</strong>
        <Pill variant={data.configured ? (sandbox ? "warning" : "success") : "error"}>
          {data.configured ? (sandbox ? "Mode test (sandbox) : aucun argent réel" : "Mode production") : "Non configuré"}
        </Pill>
      </div>
      {!data.configured && <p className="text-sm text-warning">Les clés ne sont pas renseignées : la page publique n'affiche pas le bouton « Acheter ».</p>}
      <p className="text-xs text-ink-secondary">
        Adresse de notification (IPN) à déclarer chez PayDunya :{" "}
        {data.notificationUrl ? <code className="break-all rounded bg-surface-sand px-1.5 py-0.5">{data.notificationUrl}</code> : <em>non définie sur ce serveur</em>}
      </p>
    </Card>
  );
}

// ── Forfaits ──────────────────────────────────────────────────────────

function PlanDialog({ plan, onClose }: { plan: AdminPlan; onClose: () => void }) {
  const { toast } = useToast();
  const update = useUpdatePlan();
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.priceXof);
  const [days, setDays] = useState(plan.durationDays);
  const [exams, setExams] = useState(plan.examAttempts);
  const [active, setActive] = useState(plan.active);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({ code: plan.code, body: { name: name.trim(), priceXof: price, durationDays: days, examAttempts: exams, active } });
      toast({ title: "Forfait mis à jour", description: name });
      onClose();
    } catch (err) {
      toast({ title: "Modification impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !update.isPending && onClose()}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Modifier le forfait {plan.name}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Le changement ne touche pas les commandes déjà ouvertes : elles gardent leur prix. Il est consigné dans l'audit.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Nom *" htmlFor="pl-name"><input id="pl-name" required maxLength={80} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Prix (FCFA) *" htmlFor="pl-price"><input id="pl-price" type="number" min={100} max={5000000} step={1} required className={inputClass} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
            <Field label="Durée (jours) *" htmlFor="pl-days"><input id="pl-days" type="number" min={1} max={365} required className={inputClass} value={days} onChange={(e) => setDays(Number(e.target.value))} /></Field>
            <Field label="Examens blancs *" htmlFor="pl-exams"><input id="pl-exams" type="number" min={0} max={50} required className={inputClass} value={exams} onChange={(e) => setExams(Number(e.target.value))} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#1A3A5B]" />En vente
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={update.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={update.isPending}>{update.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SimulatorPlans() {
  const { data, isLoading, isError, error } = useAdminPlans();
  const [editing, setEditing] = useState<AdminPlan | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-secondary">Les prix affichés sur la page publique et facturés au paiement viennent d'ici. Les montants actuels sont des hypothèses à valider.</p>
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les forfaits.")}</ErrorNotice>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((p) => (
          <Card key={p.code} radius="stat" className="flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-lg font-bold text-navy">{p.name}</h3>
              <Pill variant={p.active ? "success" : "neutral"}>{p.active ? "En vente" : "Retiré"}</Pill>
            </div>
            <p className="font-heading text-2xl font-extrabold text-ink">{formatAmount(p.priceXof)}</p>
            <p className="text-sm text-ink-secondary">{p.durationDays} jours · {p.examAttempts} examen{p.examAttempts > 1 ? "s" : ""} blanc{p.examAttempts > 1 ? "s" : ""}</p>
            {p.updatedAt && <p className="text-xs text-ink-secondary">Modifié le {stamp(p.updatedAt)} par {p.updatedBy}</p>}
            <Button type="button" size="sm" variant="outline" shape="rounded" className="mt-auto w-fit" onClick={() => setEditing(p)}><Pencil />Modifier</Button>
          </Card>
        ))}
      </div>
      {editing && <PlanDialog plan={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

// ── Commandes ─────────────────────────────────────────────────────────

export function SimulatorOrders({ canVerify, canConfirm }: { canVerify: boolean; canConfirm: boolean }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error } = useSimOrders(status || undefined, page);
  const verify = useVerifyOrder();
  const confirm = useConfirmOrder();
  const reject = useRejectOrder();
  const proof = useOrderProof();
  const [rejecting, setRejecting] = useState<AdminOrder | null>(null);

  const confirmPayment = async (o: AdminOrder) => {
    try {
      await confirm.mutateAsync(o.id);
      toast({ title: "Paiement confirmé", description: `${o.learnerEmail} : accès ouvert.` });
    } catch (err) {
      toast({ title: "Confirmation impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const rejectPayment = async (reason: string) => {
    if (!rejecting) return;
    try {
      await reject.mutateAsync({ id: rejecting.id, reason });
      toast({ title: "Paiement refusé", description: "L'acheteur voit le motif et peut déclarer de nouveau." });
      setRejecting(null);
    } catch (err) {
      toast({ title: "Refus impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const openProof = async (o: AdminOrder) => {
    try {
      const url = await proof.mutateAsync(o.id);
      if (url.startsWith("https://") || url.startsWith("http://localhost")) window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast({ title: "Justificatif indisponible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const recheck = async (o: AdminOrder) => {
    try {
      const res = await verify.mutateAsync(o.id);
      toast({ title: "Commande revérifiée", description: `${o.learnerEmail} : ${ORDER_STATUS_LABELS[res.status]}` });
    } catch (err) {
      toast({ title: "Vérification impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GatewayBanner />
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Statut" className={`${inputClass} w-48`} value={status} onChange={(e) => { setStatus(e.target.value as OrderStatus | ""); setPage(0); }}>
          <option value="">Toutes les commandes</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les commandes.")}</ErrorNotice>}
      {data && data.items.length === 0 && <EmptyState title="Aucune commande" text="Les achats, en ligne ou manuels, apparaîtront ici." />}
      {data && data.items.length > 0 && (
        <>
          <Card radius="stat" className="overflow-x-auto border border-[#E7E0D4] p-0">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] text-xs uppercase tracking-wide text-ink-secondary">
                <tr>
                  <th className="px-4 py-3 font-semibold">Acheteur</th><th className="px-4 py-3 font-semibold">Forfait</th><th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Créée</th><th className="px-4 py-3 font-semibold">État</th><th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((o) => (
                  <tr key={o.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                    <td className="px-4 py-3"><div className="font-semibold text-ink">{o.learnerName}</div><div className="text-xs text-ink-secondary">{o.learnerEmail}</div></td>
                    <td className="px-4 py-3">{o.planName}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatAmount(o.chargedXof)}
                      {o.feeXof > 0 && <div className="text-xs text-ink-secondary">dont {formatAmount(o.feeXof)} de frais</div>}
                      <div className="text-xs text-ink-secondary">{o.channel === "MANUAL" ? "Manuel" : "En ligne"}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{stamp(o.createdAt)}{o.paidAt && <div className="text-xs">payée le {stamp(o.paidAt)}</div>}</td>
                    <td className="px-4 py-3">
                      <Pill variant={STATUS_VARIANT[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Pill>
                      {o.providerMode === "sandbox" && <div className="mt-1 text-xs text-warning">test</div>}
                      {o.failureReason && <div className="mt-1 max-w-56 text-xs text-ink-secondary">{o.failureReason}</div>}
                      {o.channel === "MANUAL" && o.manualMethod && (
                        <div className="mt-1 max-w-56 text-xs text-ink-secondary">
                          {MANUAL_METHOD_LABELS[o.manualMethod]} · réf. <span className="break-all font-mono">{o.manualReference}</span>
                          {o.declaredAt && <div>déclaré le {stamp(o.declaredAt)}</div>}
                        </div>
                      )}
                      {o.confirmedBy && <div className="mt-1 text-xs text-ink-secondary">confirmé par {o.confirmedBy}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {o.proofUploaded && (
                        <Button type="button" size="sm" variant="outline" shape="rounded" className="mr-2" disabled={proof.isPending} onClick={() => openProof(o)}><FileImage />Justificatif</Button>
                      )}
                      {canConfirm && o.status === "DECLARED" && (
                        <span className="inline-flex gap-2">
                          <Button type="button" size="sm" shape="rounded" disabled={confirm.isPending} onClick={() => confirmPayment(o)}><CheckCircle2 />Confirmer</Button>
                          <Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setRejecting(o)}><X />Refuser</Button>
                        </span>
                      )}
                      {canVerify && o.status === "PENDING" && o.providerToken && (
                        <Button type="button" size="sm" variant="outline" shape="rounded" disabled={verify.isPending} onClick={() => recheck(o)}><RefreshCw />Revérifier</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pager page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
        </>
      )}
      {rejecting && (
        <ReasonDialog
          title="Refuser ce paiement"
          description={`${rejecting.learnerEmail} verra ce motif et pourra déclarer son paiement de nouveau. Aucun accès n'est ouvert.`}
          confirmLabel="Refuser"
          onClose={() => setRejecting(null)}
          onSubmit={rejectPayment}
        />
      )}
    </div>
  );
}
