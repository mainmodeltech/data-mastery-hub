/**
 * Droits d'usage du simulateur : octroi manuel (geste commercial, test, paiement hors ligne) et révocation.
 * Chaque action exige un motif et est tracée dans le journal d'audit. Réservé à SIMULATOR_MANAGE (contrôlé aussi par le serveur).
 */
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Plus } from "lucide-react";

import { EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useGrantAccess, useRevokeGrant, useSimGrants } from "@/hooks/useSimulatorAdmin";
import { PLAN_LABELS, type GrantView, type PlanCode } from "@/types/simulator.type";

const day = (iso: string) => format(new Date(iso), "d MMM yyyy", { locale: fr });

function statusOf(g: GrantView): { label: string; variant: "success" | "neutral" | "error" } {
  if (g.status === "REVOKED") return { label: "Révoqué", variant: "error" };
  if (new Date(g.expiresAt).getTime() <= Date.now()) return { label: "Expiré", variant: "neutral" };
  return { label: "Actif", variant: "success" };
}

function GrantDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const grant = useGrantAccess();
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanCode>("PRO");
  const [days, setDays] = useState(90);
  const [exams, setExams] = useState(5);
  const [reason, setReason] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await grant.mutateAsync({ learnerEmail: email.trim(), plan, days, examAttempts: exams, reason: reason.trim() });
      toast({ title: "Droit d'usage accordé", description: email.trim() });
      onClose();
    } catch (err) {
      toast({ title: "Octroi impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !grant.isPending && onClose()}>
      <DialogContent className="max-w-lg rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Accorder un droit d'usage</DialogTitle>
          <DialogDescription className="text-ink-secondary">L'apprenant doit déjà avoir un compte. L'action est consignée dans le journal d'audit.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Field label="E-mail de l'apprenant *" htmlFor="g-email">
            <input id="g-email" type="email" required autoFocus className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Forfait *" htmlFor="g-plan">
              <select id="g-plan" className={inputClass} value={plan} onChange={(e) => setPlan(e.target.value as PlanCode)}>
                {(Object.keys(PLAN_LABELS) as PlanCode[]).map((p) => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
              </select>
            </Field>
            <Field label="Durée (jours) *" htmlFor="g-days">
              <input id="g-days" type="number" min={1} max={365} required className={inputClass} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </Field>
            <Field label="Examens blancs *" htmlFor="g-exams" hint="0 = étude seule">
              <input id="g-exams" type="number" min={0} max={50} required className={inputClass} value={exams} onChange={(e) => setExams(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Motif *" htmlFor="g-reason" hint="Ex. : paiement reçu par Wave, geste commercial, testeur.">
            <textarea id="g-reason" rows={2} required maxLength={1000} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={grant.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={grant.isPending || !email.trim() || !reason.trim()}>
              {grant.isPending ? <Loader2 className="animate-spin" /> : "Accorder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SimulatorGrants() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<GrantView | null>(null);
  const query = useSimGrants(page);
  const revoke = useRevokeGrant();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-secondary">Qui peut s'entraîner, jusqu'à quand et avec combien d'examens blancs.</p>
        <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Accorder un droit</Button>
      </div>

      {query.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {query.isError && <ErrorNotice>{errorMessage(query.error, "Impossible de charger les droits d'usage.")}</ErrorNotice>}
      {query.data && query.data.items.length === 0 && <EmptyState title="Aucun droit d'usage" text="Accordez un accès à un testeur ou à un apprenant pour ouvrir le simulateur." />}
      {query.data && query.data.items.length > 0 && (
        <>
          <Card radius="stat" className="overflow-x-auto border border-[#E7E0D4] p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] text-xs uppercase tracking-wide text-ink-secondary">
                <tr>
                  <th className="px-4 py-3 font-semibold">Apprenant</th>
                  <th className="px-4 py-3 font-semibold">Forfait</th>
                  <th className="px-4 py-3 font-semibold">Période</th>
                  <th className="px-4 py-3 font-semibold">Examens</th>
                  <th className="px-4 py-3 font-semibold">État</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((g) => {
                  const st = statusOf(g);
                  return (
                    <tr key={g.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                      <td className="px-4 py-3"><div className="font-semibold text-ink">{g.learnerName}</div><div className="text-xs text-ink-secondary">{g.learnerEmail}</div></td>
                      <td className="px-4 py-3">{PLAN_LABELS[g.plan]}</td>
                      <td className="px-4 py-3 text-ink-secondary">{day(g.startsAt)} → {day(g.expiresAt)}</td>
                      <td className="px-4 py-3">{g.examAttemptsUsed} / {g.examAttemptsTotal}</td>
                      <td className="px-4 py-3">
                        <Pill variant={st.variant}>{st.label}</Pill>
                        {g.revokeReason && <div className="mt-1 max-w-48 text-xs text-ink-secondary">{g.revokeReason}</div>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {g.status === "ACTIVE" && <Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setRevoking(g)}>Révoquer</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <Pager page={page} totalPages={query.data.totalPages} totalElements={query.data.totalElements} onChange={setPage} />
        </>
      )}

      {creating && <GrantDialog onClose={() => setCreating(false)} />}
      {revoking && (
        <ReasonDialog
          title="Révoquer ce droit d'usage"
          description={`${revoking.learnerName} perdra immédiatement l'accès au simulateur. Les tentatives passées restent consultables.`}
          confirmLabel="Révoquer"
          onClose={() => setRevoking(null)}
          onSubmit={async (reason) => {
            try {
              await revoke.mutateAsync({ id: revoking.id, reason });
              toast({ title: "Droit révoqué" });
              setRevoking(null);
            } catch (err) {
              toast({ title: "Révocation impossible", description: errorMessage(err), variant: "destructive" });
            }
          }}
        />
      )}
    </div>
  );
}
