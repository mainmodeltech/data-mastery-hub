/**
 * AdminEmails.tsx — journal des e-mails sortants et état de la messagerie.
 * Permet de retrouver un message (envoyé, en échec, ignoré), de lire l'erreur et, pour le SUPER_ADMIN,
 * d'envoyer un e-mail de test. Réservé SUPER_ADMIN et ADMIN.
 */
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, inputClass, Pager } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useEmailLogs, useMailStatus, useSendTestEmail } from "@/hooks/useAdminOps";
import { useToast } from "@/hooks/use-toast";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/roles";

const stamp = (iso: string | null | undefined) => (iso ? format(parseISO(iso), "d MMM yyyy HH:mm", { locale: fr }) : "—");

const FILTERS = [
  { key: "", label: "Tous" },
  { key: "FAILED", label: "En échec" },
  { key: "SENT", label: "Envoyés" },
  { key: "SKIPPED", label: "Ignorés" },
];

const STATUS_PILL: Record<string, { variant: "success" | "error" | "neutral"; label: string }> = {
  SENT: { variant: "success", label: "Envoyé" },
  FAILED: { variant: "error", label: "Échec" },
  SKIPPED: { variant: "neutral", label: "Ignoré" },
};

export default function AdminEmails() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuper = hasAnyRole(user?.roles, ROLE_GROUPS.SUPER);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [testTo, setTestTo] = useState("");
  const { data, isLoading, isError } = useEmailLogs(page, status || undefined, type.trim() || undefined);
  const { data: mail } = useMailStatus();
  const sendTest = useSendTestEmail();

  const logs = data?.items ?? [];

  const submitTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await sendTest.mutateAsync(testTo.trim());
      toast({ title: res.sent ? "E-mail de test envoyé" : "E-mail de test non envoyé", description: res.message });
    } catch (err) {
      toast({ title: "Envoi impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Journal d'e-mails" description="Tous les e-mails envoyés par la plateforme, et l'état de la messagerie">
      <div className="flex flex-col gap-5">
        {mail && (
          <Card radius="card" className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-3">
              {mail.configured
                ? <Pill variant="success"><CheckCircle2 className="h-3.5 w-3.5" /> Messagerie configurée</Pill>
                : <Pill variant="error"><AlertTriangle className="h-3.5 w-3.5" /> Messagerie non configurée</Pill>}
              <span className="text-sm text-ink-secondary">{mail.host}:{mail.port} · expéditeur {mail.from}</span>
            </div>
            {mail.redirectTo && (
              <p className="rounded-xl bg-warning-bg px-4 py-2.5 text-sm text-warning">
                Redirection active : tous les e-mails sont envoyés à {mail.redirectTo} (environnement de test).
              </p>
            )}
            <div className="grid gap-2 text-sm text-ink-secondary sm:grid-cols-2">
              <span>Dernier envoi réussi : <strong className="text-ink">{stamp(mail.lastSentAt)}</strong></span>
              <span>Dernier échec : <strong className="text-ink">{stamp(mail.lastFailureAt)}</strong></span>
            </div>
            {mail.lastError && <p className="text-xs text-error">Dernière erreur : {mail.lastError}</p>}
            {isSuper && (
              <form onSubmit={submitTest} className="flex flex-wrap items-center gap-2 border-t border-[#E7E0D4] pt-3">
                <input type="email" required aria-label="Adresse de test" placeholder="adresse@exemple.com" className={`${inputClass} max-w-xs`} value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <Button type="submit" variant="outline" shape="rounded" size="sm" disabled={sendTest.isPending}>
                  {sendTest.isPending ? <Loader2 className="animate-spin" /> : <Send />} Envoyer un e-mail de test
                </Button>
              </form>
            )}
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={status === f.key}
                onClick={() => { setStatus(f.key); setPage(0); }}
                className={status === f.key ? "rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white" : "rounded-pill border border-[#D6CEC0] bg-white px-4 py-2 text-sm text-ink-secondary"}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input type="search" aria-label="Filtrer par type" placeholder="Type (ex. PAYMENT_LINK)" className={`${inputClass} max-w-xs`} value={type} onChange={(e) => { setType(e.target.value); setPage(0); }} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : isError ? (
          <ErrorNotice>Impossible de charger le journal.</ErrorNotice>
        ) : logs.length === 0 ? (
          <EmptyState title="Aucun e-mail" text="Aucun message ne correspond à ce filtre." />
        ) : (
          <div className="overflow-x-auto rounded-card border border-[#E7E0D4] bg-white">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] bg-app-bg text-xs uppercase tracking-[0.5px] text-ink-secondary">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Destinataire</th>
                  <th className="px-4 py-3">Objet</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const pill = STATUS_PILL[l.status] ?? { variant: "neutral" as const, label: l.status };
                  return (
                    <tr key={l.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                      <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">{stamp(l.sentAt ?? l.createdAt)}</td>
                      <td className="px-4 py-3 text-ink">{l.recipient}</td>
                      <td className="px-4 py-3 text-ink">{l.subject}</td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">{l.type}</td>
                      <td className="px-4 py-3">
                        <Pill variant={pill.variant}>{pill.label}</Pill>
                        {l.attempts ? <span className="ml-2 text-xs text-ink-secondary">{l.attempts} essai{l.attempts > 1 ? "s" : ""}</span> : null}
                        {l.error && <div className="mt-1 max-w-[260px] text-xs text-error">{l.error}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pager page={data.pagination.page} totalPages={data.pagination.totalPages} totalElements={data.pagination.totalElements} onChange={setPage} />}
      </div>
    </AdminLayout>
  );
}
