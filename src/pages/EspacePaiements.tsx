/**
 * /espace/paiements — mes paiements : échéances à régler (lien de paiement), reçus PDF des paiements
 * confirmés, et attestations d'inscription par formation (GET /learner/payments, /learner/enrollments).
 */
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, ExternalLink, Loader2 } from "lucide-react";

import { Button, Card, Pill } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerEnrollments, useLearnerPayments } from "@/hooks/useLearner";
import { useToast } from "@/hooks/use-toast";
import { saveBlob } from "@/lib/download";
import { learnerService, type LearnerPayment } from "@/services/api/learnerService";
import { formatAmount } from "@/types/payment.type";

const day = (iso: string | null | undefined) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");

const STATUS: Record<string, { label: string; variant: "success" | "warning" | "info" | "neutral" }> = {
  PENDING: { label: "À régler", variant: "warning" },
  DECLARED: { label: "En vérification", variant: "info" },
  CONFIRMED: { label: "Payé", variant: "success" },
  REFUNDED: { label: "Remboursé", variant: "neutral" },
};

export default function EspacePaiements() {
  const { toast } = useToast();
  const payments = useLearnerPayments();
  const enrollments = useLearnerEnrollments();
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (key: string, load: () => Promise<Blob>, filename: string) => {
    setBusy(key);
    try {
      saveBlob(await load(), filename);
    } catch {
      toast({ title: "Téléchargement impossible", description: "Réessayez dans un instant.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const items = payments.data ?? [];
  const toPay = items.filter((p) => p.payUrl);
  const byRegistration = new Map<string, LearnerPayment[]>();
  for (const p of items) byRegistration.set(p.registrationId, [...(byRegistration.get(p.registrationId) ?? []), p]);

  return (
    <LearnerShell title="Mes paiements" description="Échéances, reçus et attestations d'inscription">
      <div className="flex flex-col gap-6">
        {(payments.isLoading || enrollments.isLoading) && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {(payments.isError || enrollments.isError) && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger vos paiements pour le moment.
          </div>
        )}

        {toPay.length > 0 && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] bg-warning-bg p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">À régler</h2>
            <ul className="flex flex-col">
              {toPay.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 border-t border-[#E7C98A] py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-1 basis-56 flex-col">
                    <span className="font-semibold text-ink">{p.formationTitle} · échéance {p.installmentNumber}/{p.installmentCount}</span>
                    <span className="text-xs text-ink-secondary">{formatAmount(p.amount, p.currency)}{p.dueDate ? ` · avant le ${day(p.dueDate)}` : ""}</span>
                  </span>
                  <Button asChild variant="navy" shape="rounded" size="sm">
                    <a href={p.payUrl as string} target="_blank" rel="noopener noreferrer"><ExternalLink />{p.status === "DECLARED" ? "Voir mon paiement" : "Payer"}</a>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {!payments.isLoading && !payments.isError && items.length === 0 && (
          <Card radius="stat" variant="sand" className="flex flex-col gap-2 p-8">
            <p className="font-heading text-lg font-bold text-navy">Aucun paiement pour le moment</p>
            <p className="text-sm text-ink-secondary">Vos échéances et reçus apparaîtront ici dès que votre inscription aura été acceptée.</p>
          </Card>
        )}

        {Array.from(byRegistration.entries()).map(([registrationId, list]) => {
          const first = list[0];
          return (
            <Card key={registrationId} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-navy">{first.formationTitle}</h2>
                <p className="text-xs text-ink-secondary">
                  {first.sessionName ?? "Session"}{first.totalAmount ? ` · total ${formatAmount(first.totalAmount, first.currency)}` : ""}
                </p>
              </div>
              <ul className="flex flex-col">
                {list.map((p) => {
                  const st = STATUS[p.status] ?? { label: p.status, variant: "neutral" as const };
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-3 border-t border-[#E7E0D4] py-3 first:border-t-0">
                      <span className="flex min-w-0 flex-1 basis-48 flex-col">
                        <span className="font-semibold text-ink">Échéance {p.installmentNumber}/{p.installmentCount} · {formatAmount(p.amount, p.currency)}</span>
                        <span className="text-xs text-ink-secondary">
                          {p.status === "CONFIRMED" ? `Réglée le ${day(p.confirmedAt)}` : p.dueDate ? `À régler avant le ${day(p.dueDate)}` : ""}
                        </span>
                      </span>
                      <Pill variant={st.variant}>{st.label}</Pill>
                      {p.receiptUrl && (
                        <Button
                          type="button" variant="outline" shape="rounded" size="sm"
                          disabled={busy === `r-${p.id}`}
                          onClick={() => void download(`r-${p.id}`, () => learnerService.receipt(p.id), `Recu-${p.installmentNumber}-${p.installmentCount}.pdf`)}
                        >
                          {busy === `r-${p.id}` ? <Loader2 className="animate-spin" /> : <Download />}Reçu
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}

        {(enrollments.data ?? []).length > 0 && (
          <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
            <h2 className="font-heading text-xl font-bold text-navy">Mes inscriptions</h2>
            <ul className="flex flex-col">
              {(enrollments.data ?? []).map((e) => (
                <li key={e.formationId} className="flex flex-wrap items-center gap-3 border-t border-[#E7E0D4] py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-1 basis-48 flex-col">
                    <span className="font-semibold text-ink">{e.title}</span>
                    <span className="text-xs text-ink-secondary">
                      {e.sessionName ?? ""}{e.accessStartsAt ? ` · accès du ${day(e.accessStartsAt)}${e.accessEndsAt ? ` au ${day(e.accessEndsAt)}` : ""}` : ""}
                    </span>
                  </span>
                  <Pill variant={e.status === "COMPLETED" ? "info" : "success"}>{e.status === "COMPLETED" ? "Terminée" : "Active"}</Pill>
                  {e.attestationUrl && (
                    <Button
                      type="button" variant="outline" shape="rounded" size="sm"
                      disabled={busy === `a-${e.formationId}`}
                      onClick={() => void download(`a-${e.formationId}`, () => learnerService.attestation(e.formationId), "Attestation-d-inscription.pdf")}
                    >
                      {busy === `a-${e.formationId}` ? <Loader2 className="animate-spin" /> : <Download />}Attestation
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </LearnerShell>
  );
}
