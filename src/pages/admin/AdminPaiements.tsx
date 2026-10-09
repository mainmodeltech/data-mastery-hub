/**
 * AdminPaiements.tsx — suivi de tous les paiements reçus et de leur avancement par formation et
 * par session (GET /admin/payments, toutes pages). Actions : confirmer un paiement déclaré,
 * le refuser (motif), relancer une échéance en attente, rembourser un paiement confirmé.
 * Réservé SUPER_ADMIN et ADMIN (403 côté serveur sinon).
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, ChevronRight, ExternalLink, Loader2, Search } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, inputClass, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import {
  useAllPayments, useConfirmPayment, useRefundPayment, useRejectPayment, useRemindPayment,
} from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatAmount, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type AdminPayment, type PaymentStatus,
} from "@/types/payment.type";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "info" | "neutral" | "error"> = {
  CONFIRMED: "success",
  DECLARED: "info",
  PENDING: "warning",
  REJECTED: "error",
  CANCELLED: "neutral",
  REFUNDED: "neutral",
};

const FILTERS: { key: "ALL" | PaymentStatus | "OVERDUE"; label: string }[] = [
  { key: "ALL", label: "Tous" },
  { key: "DECLARED", label: "À confirmer" },
  { key: "PENDING", label: "En attente" },
  { key: "OVERDUE", label: "En retard" },
  { key: "CONFIRMED", label: "Confirmés" },
  { key: "REFUNDED", label: "Remboursés" },
];

const day = (iso: string | null | undefined) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");
const todayIso = () => format(new Date(), "yyyy-MM-dd");

const isOverdue = (p: AdminPayment) => p.status === "PENDING" && !!p.dueDate && p.dueDate < todayIso();
const sum = (items: AdminPayment[], pick: (p: AdminPayment) => boolean) => items.filter(pick).reduce((s, p) => s + p.amount, 0);

/** Agrégats d'un ensemble d'échéances : « attendu » exclut les échéances annulées et remboursées. */
function summarize(items: AdminPayment[]) {
  const expected = sum(items, (p) => p.status !== "CANCELLED" && p.status !== "REFUNDED");
  const collected = sum(items, (p) => p.status === "CONFIRMED");
  return {
    expected,
    collected,
    declared: sum(items, (p) => p.status === "DECLARED"),
    pending: sum(items, (p) => p.status === "PENDING"),
    overdue: sum(items, isOverdue),
    refunded: sum(items, (p) => p.status === "REFUNDED"),
    percent: expected > 0 ? Math.round((collected / expected) * 100) : 0,
    candidates: new Set(items.map((p) => p.registrationId)).size,
  };
}

interface FormationGroup {
  title: string;
  items: AdminPayment[];
  sessions: { name: string; items: AdminPayment[] }[];
}

function groupByFormation(payments: AdminPayment[]): FormationGroup[] {
  const map = new Map<string, FormationGroup>();
  for (const p of payments) {
    const title = p.bootcampTitle ?? "Formation non renseignée";
    const group = map.get(title) ?? { title, items: [], sessions: [] };
    group.items.push(p);
    const sessionName = p.sessionName ?? "Sans session";
    let session = group.sessions.find((s) => s.name === sessionName);
    if (!session) {
      session = { name: sessionName, items: [] };
      group.sessions.push(session);
    }
    session.items.push(p);
    map.set(title, group);
  }
  return [...map.values()].sort((a, b) => summarize(b.items).collected - summarize(a.items).collected);
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "error" }) {
  return (
    <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-5">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className={cn("font-heading text-[26px] font-extrabold leading-none", tone === "error" ? "text-error" : "text-navy")}>{value}</span>
      {hint && <span className="text-xs text-ink-secondary">{hint}</span>}
    </Card>
  );
}

function ProgressRow({ label, sub, items, nested }: { label: string; sub?: string; items: AdminPayment[]; nested?: boolean }) {
  const s = summarize(items);
  return (
    <div className={cn("grid items-center gap-x-4 gap-y-1.5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_auto]", nested && "pl-6")}>
      <div className="flex min-w-0 flex-col">
        <span className={cn("truncate", nested ? "text-sm text-ink" : "font-semibold text-ink")}>{label}</span>
        <span className="truncate text-xs text-ink-secondary">{sub ?? `${s.candidates} candidat${s.candidates > 1 ? "s" : ""}`}</span>
      </div>
      <div className="flex flex-col gap-1">
        <ProgressBar value={s.percent} aria-label={`Avancement des paiements ${label}`} className="h-2" />
        <span className="text-xs text-ink-secondary">
          {formatAmount(s.collected)} sur {formatAmount(s.expected)} · {s.percent} %
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {s.declared > 0 && <Pill variant="info">À confirmer {formatAmount(s.declared)}</Pill>}
        {s.overdue > 0 && <Pill variant="error">En retard {formatAmount(s.overdue)}</Pill>}
      </div>
    </div>
  );
}

function FormationProgress({ group }: { group: FormationGroup }) {
  const [open, setOpen] = useState(false);
  const multi = group.sessions.length > 1 || group.sessions[0]?.name !== "Sans session";
  return (
    <div className="flex flex-col gap-3 border-t border-[#E7E0D4] py-3 first:border-t-0">
      <div className="flex items-start gap-2">
        {multi ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? "Masquer" : "Afficher"} les sessions de ${group.title}`}
            onClick={() => setOpen((v) => !v)}
            className="mt-1 text-ink-secondary hover:text-navy"
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <div className="min-w-0 flex-1"><ProgressRow label={group.title} items={group.items} /></div>
      </div>
      {open && group.sessions.map((s) => <ProgressRow key={s.name} label={s.name} items={s.items} nested />)}
    </div>
  );
}

type Pending = { kind: "reject" | "refund"; payment: AdminPayment } | null;

export default function AdminPaiements() {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useAllPayments();
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();
  const refund = useRefundPayment();
  const remind = useRemindPayment();

  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");
  const [formation, setFormation] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Pending>(null);

  const payments = data ?? [];
  const groups = useMemo(() => groupByFormation(payments), [payments]);
  const total = useMemo(() => summarize(payments), [payments]);
  const toConfirm = payments.filter((p) => p.status === "DECLARED").length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (formation && (p.bootcampTitle ?? "Formation non renseignée") !== formation) return false;
      if (filter === "OVERDUE" ? !isOverdue(p) : filter !== "ALL" && p.status !== filter) return false;
      if (!q) return true;
      return [p.firstName, p.lastName, p.email, p.reference, p.invoiceRef].some((v) => v?.toLowerCase().includes(q));
    });
  }, [payments, filter, formation, query]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast({ title: success });
    } catch (e) {
      toast({ title: "Action impossible", description: errorMessage(e), variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Paiements" description="Tous les paiements reçus et leur avancement par formation">
      <div className="flex flex-col gap-6">
        {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les paiements. Vérifiez la connexion au serveur puis rechargez la page.")}</ErrorNotice>}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <Kpi label="Encaissé" value={formatAmount(total.collected)} hint={total.refunded > 0 ? `Remboursé ${formatAmount(total.refunded)}` : `Sur ${formatAmount(total.expected)} attendus`} />
              <Kpi label="À confirmer" value={formatAmount(total.declared)} hint={`${toConfirm} paiement${toConfirm > 1 ? "s" : ""} déclaré${toConfirm > 1 ? "s" : ""}`} />
              <Kpi label="En attente" value={formatAmount(total.pending)} hint="Échéances non payées" />
              <Kpi label="En retard" value={formatAmount(total.overdue)} hint="Échéance dépassée" tone={total.overdue > 0 ? "error" : undefined} />
            </div>

            <Card radius="stat" className="flex flex-col border border-[#E7E0D4] p-5 lg:p-6">
              <h2 className="mb-2 font-heading text-xl font-bold text-navy">Avancement par formation</h2>
              {groups.length === 0 ? (
                <p className="text-sm text-ink-secondary">Aucun paiement enregistré pour le moment.</p>
              ) : (
                groups.map((g) => <FormationProgress key={g.title} group={g} />)
              )}
            </Card>

            <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-bold text-navy">Détail des paiements</h2>
                <span className="text-sm text-ink-secondary">{visible.length} sur {payments.length}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par statut">
                {FILTERS.map((f) => (
                  <Button key={f.key} type="button" size="sm" shape="pill" variant={filter === f.key ? "navy" : "outline"} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                    {f.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="relative min-w-52 flex-1">
                  <span className="sr-only">Rechercher un candidat, une référence ou une facture</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, e-mail, référence, facture…" className={cn(inputClass, "pl-9")} />
                </label>
                <label className="min-w-52">
                  <span className="sr-only">Filtrer par formation</span>
                  <select value={formation} onChange={(e) => setFormation(e.target.value)} className={inputClass}>
                    <option value="">Toutes les formations</option>
                    {groups.map((g) => <option key={g.title} value={g.title}>{g.title}</option>)}
                  </select>
                </label>
              </div>

              {visible.length === 0 ? (
                <EmptyState title="Aucun paiement" text="Aucun paiement ne correspond à ces filtres." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-[#E7E0D4] text-left text-xs text-ink-secondary">
                        <th scope="col" className="pb-2 font-semibold">Candidat</th>
                        <th scope="col" className="pb-2 font-semibold">Formation / session</th>
                        <th scope="col" className="pb-2 font-semibold">Échéance</th>
                        <th scope="col" className="pb-2 text-right font-semibold">Montant</th>
                        <th scope="col" className="pb-2 font-semibold">Statut</th>
                        <th scope="col" className="pb-2 font-semibold">Moyen · référence</th>
                        <th scope="col" className="pb-2 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((p) => {
                        const overdue = isOverdue(p);
                        return (
                          <tr key={p.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                            <td className="py-3 pr-3">
                              <div className="font-semibold text-ink">{p.firstName} {p.lastName}</div>
                              <div className="text-xs text-ink-secondary">{p.email}</div>
                            </td>
                            <td className="max-w-[220px] py-3 pr-3">
                              <div className="truncate text-ink" title={p.bootcampTitle ?? ""}>{p.bootcampTitle ?? "—"}</div>
                              <div className="truncate text-xs text-ink-secondary">{p.sessionName ?? "—"}</div>
                            </td>
                            <td className="py-3 pr-3 whitespace-nowrap">
                              <div>{p.installmentNumber} / {p.installmentCount}</div>
                              <div className={cn("text-xs", overdue ? "font-semibold text-error" : "text-ink-secondary")}>
                                {p.status === "CONFIRMED" ? `Payée le ${day(p.confirmedAt)}` : `Avant le ${day(p.dueDate)}`}
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-right font-semibold text-navy whitespace-nowrap">{formatAmount(p.amount, p.currency)}</td>
                            <td className="py-3 pr-3">
                              <div className="flex flex-col items-start gap-1">
                                <Pill variant={STATUS_VARIANT[p.status]}>{PAYMENT_STATUS_LABELS[p.status]}</Pill>
                                {overdue && <Pill variant="error">En retard</Pill>}
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <div>{p.method ? PAYMENT_METHOD_LABELS[p.method] ?? p.method : "—"}</div>
                              <div className="break-all text-xs text-ink-secondary">{p.reference ?? ""}</div>
                              {p.proofUrl && (
                                <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-navy">
                                  Justificatif <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex flex-wrap justify-end gap-1.5">
                                {p.status === "DECLARED" && (
                                  <>
                                    <Button size="sm" shape="rounded" variant="navy" disabled={confirm.isPending} onClick={() => void run(() => confirm.mutateAsync(p.id), "Paiement confirmé")}>Confirmer</Button>
                                    <Button size="sm" shape="rounded" variant="outline" onClick={() => setPending({ kind: "reject", payment: p })}>Refuser</Button>
                                  </>
                                )}
                                {p.status === "PENDING" && (
                                  <Button size="sm" shape="rounded" variant="outline" disabled={remind.isPending} onClick={() => void run(() => remind.mutateAsync(p.id), "Relance envoyée")}>Relancer</Button>
                                )}
                                {p.status === "CONFIRMED" && (
                                  <Button size="sm" shape="rounded" variant="outline" onClick={() => setPending({ kind: "refund", payment: p })}>Rembourser</Button>
                                )}
                                <Button asChild size="sm" shape="rounded" variant="outline">
                                  <Link to="/admin/candidatures" aria-label={`Candidature de ${p.firstName} ${p.lastName}`}>Candidature</Link>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {pending && (
        <ReasonDialog
          title={pending.kind === "reject" ? "Refuser ce paiement" : "Rembourser ce paiement"}
          description={
            pending.kind === "reject"
              ? `Le candidat ${pending.payment.firstName} ${pending.payment.lastName} est prévenu par e-mail et l'échéance repasse « en attente ».`
              : `Remboursement de ${formatAmount(pending.payment.amount, pending.payment.currency)} pour ${pending.payment.firstName} ${pending.payment.lastName}.`
          }
          confirmLabel={pending.kind === "reject" ? "Refuser" : "Rembourser"}
          onClose={() => setPending(null)}
          onSubmit={async (reason) => {
            const { kind, payment } = pending;
            await run(
              () => (kind === "reject" ? reject.mutateAsync({ id: payment.id, reason }) : refund.mutateAsync({ id: payment.id, reason })),
              kind === "reject" ? "Paiement refusé" : "Paiement remboursé"
            );
            setPending(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
