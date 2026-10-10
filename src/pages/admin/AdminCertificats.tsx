/**
 * AdminCertificats.tsx — certificats délivrés : liste, lien de vérification, PDF, renvoi de l'e-mail à
 * l'apprenant, révocation (motif). La délivrance se fait depuis le suivi de session.
 * Réservé SUPER_ADMIN et ADMIN.
 */
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, ExternalLink, Loader2, Mail } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Pill } from "@/components/shared";
import { useAdminCertificates, useResendCertificate, useRevokeCertificate } from "@/hooks/useAdminOps";
import { useToast } from "@/hooks/use-toast";
import { saveBlob } from "@/lib/download";
import { certificateService } from "@/services/api/certificateService";
import type { AdminCertificate } from "@/services/api/adminOpsService";

const day = (iso: string | null | undefined) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");

const FILTERS = [
  { key: "", label: "Tous" },
  { key: "VALID", label: "Valides" },
  { key: "REVOKED", label: "Révoqués" },
];

export default function AdminCertificats() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const { data, isLoading, isError } = useAdminCertificates(page, status || undefined);
  const revoke = useRevokeCertificate();
  const resend = useResendCertificate();
  const [revoking, setRevoking] = useState<AdminCertificate | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const certificates = data?.items ?? [];

  const copyLink = async (c: AdminCertificate) => {
    try {
      await navigator.clipboard.writeText(c.verifyUrl);
      toast({ title: "Lien de vérification copié" });
    } catch {
      toast({ title: "Copie impossible", description: c.verifyUrl, variant: "destructive" });
    }
  };

  const downloadPdf = async (c: AdminCertificate) => {
    setBusy(`pdf-${c.publicId}`);
    try {
      saveBlob(await certificateService.downloadPdf(c.publicId), `Certificat-${c.publicId}.pdf`);
    } catch (err) {
      toast({ title: "Téléchargement impossible", description: errorMessage(err), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const sendAgain = async (c: AdminCertificate) => {
    setBusy(`mail-${c.publicId}`);
    try {
      await resend.mutateAsync(c.publicId);
      toast({ title: "E-mail renvoyé", description: `Certificat renvoyé à ${c.learnerEmail}.` });
    } catch (err) {
      toast({ title: "Envoi impossible", description: errorMessage(err), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout title="Certificats" description="Certificats délivrés aux apprenants : vérification, renvoi et révocation">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les certificats">
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

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : isError ? (
          <ErrorNotice>Impossible de charger les certificats.</ErrorNotice>
        ) : certificates.length === 0 ? (
          <EmptyState title="Aucun certificat" text="Les certificats sont délivrés depuis le suivi de session, quand l'apprenant remplit les conditions (ou par dérogation motivée)." />
        ) : (
          <div className="overflow-x-auto rounded-card border border-[#E7E0D4] bg-white">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] bg-app-bg text-xs uppercase tracking-[0.5px] text-ink-secondary">
                <tr>
                  <th className="px-4 py-3">Apprenant</th>
                  <th className="px-4 py-3">Formation</th>
                  <th className="px-4 py-3">Délivré</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{c.learnerName}</div>
                      <div className="text-xs text-ink-secondary">{c.learnerEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{c.formationTitle}</div>
                      {c.sessionName && <div className="text-xs text-ink-secondary">{c.sessionName}</div>}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {day(c.issuedAt)}
                      {c.forced && <div className="text-xs text-warning" title={c.forceReason ?? undefined}>Par dérogation</div>}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === "REVOKED"
                        ? <><Pill variant="error">Révoqué</Pill>{c.revokedReason && <div className="mt-1 max-w-[220px] text-xs text-ink-secondary">{c.revokedReason}</div>}</>
                        : <Pill variant="success">Valide</Pill>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => void copyLink(c)}><Copy /> Lien</Button>
                        <Button asChild variant="outline" shape="rounded" size="sm">
                          <a href={c.verifyUrl} target="_blank" rel="noreferrer"><ExternalLink /> Vérifier</a>
                        </Button>
                        {c.status !== "REVOKED" && (
                          <>
                            <Button type="button" variant="outline" shape="rounded" size="sm" disabled={busy === `pdf-${c.publicId}`} onClick={() => void downloadPdf(c)}>PDF</Button>
                            <Button type="button" variant="outline" shape="rounded" size="sm" disabled={busy === `mail-${c.publicId}`} onClick={() => void sendAgain(c)}>
                              {busy === `mail-${c.publicId}` ? <Loader2 className="animate-spin" /> : <Mail />} Renvoyer
                            </Button>
                            <Button type="button" variant="outline" shape="rounded" size="sm" className="border-transparent text-error" onClick={() => setRevoking(c)}>Révoquer</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pager page={data.pagination.page} totalPages={data.pagination.totalPages} totalElements={data.pagination.totalElements} onChange={setPage} />}
      </div>

      {revoking && (
        <ReasonDialog
          title={`Révoquer le certificat de ${revoking.learnerName}`}
          description="Le certificat devient invalide : la page publique de vérification indiquera qu'il a été révoqué. Cette action est tracée."
          confirmLabel="Révoquer"
          onClose={() => setRevoking(null)}
          onSubmit={async (reason) => {
            try {
              await revoke.mutateAsync({ publicId: revoking.publicId, reason });
              toast({ title: "Certificat révoqué" });
              setRevoking(null);
            } catch (err) {
              toast({ title: "Révocation impossible", description: errorMessage(err), variant: "destructive" });
            }
          }}
        />
      )}
    </AdminLayout>
  );
}
