/**
 * AdminCertificats.tsx — certificats : « à valider » (prêts, invisibles de l'apprenant), délivrés, révoqués.
 * Un apprenant qui remplit les conditions obtient un certificat « à valider » : l'équipe le relit (aperçu PDF),
 * puis le valide (il devient visible et est envoyé par e-mail) ou le refuse (motif). Rien ne part automatiquement.
 */
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCheck, Copy, ExternalLink, Eye, Loader2, Mail } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Pager, ReasonDialog } from "@/components/admin/AdminKit";
import { Button, Pill } from "@/components/shared";
import { useAdminActions } from "@/hooks/useAdminStats";
import {
  useAdminCertificates, useResendCertificate, useRevokeCertificate, useValidateCertificate, useValidateCertificates,
} from "@/hooks/useAdminOps";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { saveBlob } from "@/lib/download";
import { certificateService } from "@/services/api/certificateService";
import { certificateAdminService, type AdminCertificate } from "@/services/api/adminOpsService";

const day = (iso: string | null | undefined) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");

const TABS = [
  { key: "PENDING", label: "À valider" },
  { key: "VALID", label: "Délivrés" },
  { key: "REVOKED", label: "Refusés / révoqués" },
  { key: "", label: "Tous" },
];

export default function AdminCertificats() {
  const { can } = useAuth();
  const canManage = can("CERTIFICATES_MANAGE");
  const { toast } = useToast();
  const todo = useAdminActions();
  const toValidate = todo.data?.certificatesToValidate ?? 0;

  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("PENDING");
  const { data, isLoading, isError } = useAdminCertificates(page, status || undefined);
  const revoke = useRevokeCertificate();
  const resend = useResendCertificate();
  const validate = useValidateCertificate();
  const validateMany = useValidateCertificates();
  const [revoking, setRevoking] = useState<AdminCertificate | null>(null);
  const [confirming, setConfirming] = useState<AdminCertificate | null>(null);
  const [confirmingBatch, setConfirmingBatch] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const certificates = useMemo(() => data?.items ?? [], [data]);
  const pendingOnPage = certificates.filter((c) => c.status === "PENDING");
  const allSelected = pendingOnPage.length > 0 && pendingOnPage.every((c) => selected.has(c.publicId));

  const toggle = (id: string) => setSelected((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(pendingOnPage.map((c) => c.publicId)));

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

  /** Ouvre l'aperçu dans un nouvel onglet ; la fenêtre est ouverte tout de suite (sinon le navigateur bloque l'ouverture après l'attente). */
  const openPreview = async (c: AdminCertificate) => {
    const win = window.open("", "_blank");
    setBusy(`prev-${c.publicId}`);
    try {
      const blob = await certificateAdminService.preview(c.publicId);
      const url = URL.createObjectURL(blob);
      if (win) win.location.href = url; else saveBlob(blob, `Apercu-${c.publicId}.pdf`);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      win?.close();
      toast({ title: "Aperçu impossible", description: errorMessage(err), variant: "destructive" });
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
    <AdminLayout title="Certificats" description="Relire, valider puis envoyer : aucun certificat ne part sans une action de l'équipe">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrer les certificats">
          {TABS.map((t) => (
            <Button
              key={t.key}
              type="button"
              role="tab"
              size="sm"
              shape="pill"
              variant={status === t.key ? "navy" : "outline"}
              aria-selected={status === t.key}
              onClick={() => { setStatus(t.key); setPage(0); setSelected(new Set()); }}
            >
              {t.label}
              {t.key === "PENDING" && toValidate > 0 && <span className="ml-1.5 rounded-pill bg-cta px-1.5 text-[0.6875rem] font-bold text-white">{toValidate}</span>}
            </Button>
          ))}
          <span className="flex-1" />
          {canManage && status === "PENDING" && selected.size > 0 && (
            <Button type="button" size="sm" shape="rounded" variant="navy" onClick={() => setConfirmingBatch(true)}>
              <CheckCheck />Valider et envoyer la sélection ({selected.size})
            </Button>
          )}
        </div>

        {status === "PENDING" && (
          <p className="rounded-xl bg-info-bg px-4 py-3 text-sm text-navy">
            Ces certificats sont prêts mais <strong>invisibles de l'apprenant</strong> et <strong>non envoyés</strong>. Ouvrez l'aperçu pour vérifier le nom et la formation, puis validez.
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-secondary" /></div>
        ) : isError ? (
          <ErrorNotice>Impossible de charger les certificats.</ErrorNotice>
        ) : certificates.length === 0 ? (
          <EmptyState
            title={status === "PENDING" ? "Aucun certificat à valider" : "Aucun certificat"}
            text="Un certificat apparaît ici dès qu'un apprenant remplit toutes les conditions (ou quand vous le délivrez depuis le suivi de session)."
          />
        ) : (
          <div className="overflow-x-auto rounded-card border border-[#E7E0D4] bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] bg-app-bg text-xs uppercase tracking-[0.5px] text-ink-secondary">
                <tr>
                  {canManage && status === "PENDING" && (
                    <th scope="col" className="w-10 px-4 py-3">
                      <input type="checkbox" aria-label="Tout sélectionner" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-[#1A3A5B]" />
                    </th>
                  )}
                  <th scope="col" className="px-4 py-3">Apprenant</th>
                  <th scope="col" className="px-4 py-3">Formation</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Statut</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => {
                  const pending = c.status === "PENDING";
                  return (
                    <tr key={c.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                      {canManage && status === "PENDING" && (
                        <td className="px-4 py-3">
                          {pending && <input type="checkbox" aria-label={`Sélectionner ${c.learnerName}`} checked={selected.has(c.publicId)} onChange={() => toggle(c.publicId)} className="h-4 w-4 accent-[#1A3A5B]" />}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{c.learnerName}</div>
                        <div className="text-xs text-ink-secondary">{c.learnerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink">{c.formationTitle}</div>
                        {c.sessionName && <div className="text-xs text-ink-secondary">{c.sessionName}</div>}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {pending ? <>Éligible le {day(c.eligibleAt ?? c.issuedAt)}</> : <>Délivré le {day(c.issuedAt)}</>}
                        {c.forced && <div className="text-xs text-warning" title={c.forceReason ?? undefined}>Par dérogation</div>}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "REVOKED"
                          ? <><Pill variant="error">{c.revokedReason ? "Refusé / révoqué" : "Révoqué"}</Pill>{c.revokedReason && <div className="mt-1 max-w-[220px] text-xs text-ink-secondary">{c.revokedReason}</div>}</>
                          : pending ? <Pill variant="warning">À valider</Pill> : <Pill variant="success">Délivré</Pill>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {pending ? (
                            <>
                              <Button type="button" variant="outline" shape="rounded" size="sm" disabled={busy === `prev-${c.publicId}`} onClick={() => void openPreview(c)}>
                                {busy === `prev-${c.publicId}` ? <Loader2 className="animate-spin" /> : <Eye />} Aperçu
                              </Button>
                              {canManage && (
                                <>
                                  <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => setConfirming(c)}><CheckCheck /> Valider et envoyer</Button>
                                  <Button type="button" variant="outline" shape="rounded" size="sm" className="border-transparent text-error" onClick={() => setRevoking(c)}>Refuser</Button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => void copyLink(c)}><Copy /> Lien</Button>
                              <Button asChild variant="outline" shape="rounded" size="sm">
                                <a href={c.verifyUrl} target="_blank" rel="noreferrer"><ExternalLink /> Vérifier</a>
                              </Button>
                              {c.status !== "REVOKED" && (
                                <>
                                  <Button type="button" variant="outline" shape="rounded" size="sm" disabled={busy === `pdf-${c.publicId}`} onClick={() => void downloadPdf(c)}>PDF</Button>
                                  {canManage && (
                                    <>
                                      <Button type="button" variant="outline" shape="rounded" size="sm" disabled={busy === `mail-${c.publicId}`} onClick={() => void sendAgain(c)}>
                                        {busy === `mail-${c.publicId}` ? <Loader2 className="animate-spin" /> : <Mail />} Renvoyer
                                      </Button>
                                      <Button type="button" variant="outline" shape="rounded" size="sm" className="border-transparent text-error" onClick={() => setRevoking(c)}>Révoquer</Button>
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
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

      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(o) => !o && setConfirming(null)}
        title={`Valider le certificat de ${confirming?.learnerName ?? ""} ?`}
        description="Le certificat devient visible dans l'espace de l'apprenant, vérifiable publiquement, et lui est envoyé par e-mail avec le PDF."
        confirmLabel="Valider et envoyer"
        onConfirm={async () => {
          if (!confirming) return;
          try {
            await validate.mutateAsync(confirming.publicId);
            toast({ title: "Certificat validé et envoyé", description: confirming.learnerEmail });
            setSelected((cur) => { const n = new Set(cur); n.delete(confirming.publicId); return n; });
          } catch (err) {
            toast({ title: "Validation impossible", description: errorMessage(err), variant: "destructive" });
          }
        }}
      />
      <ConfirmDialog
        open={confirmingBatch}
        onOpenChange={setConfirmingBatch}
        title={`Valider ${selected.size} certificat${selected.size > 1 ? "s" : ""} ?`}
        description="Chaque apprenant reçoit son certificat par e-mail et le voit dans son espace. Vérifiez les aperçus avant de continuer."
        confirmLabel="Valider et envoyer"
        onConfirm={async () => {
          try {
            const result = await validateMany.mutateAsync([...selected]);
            toast({
              title: `${result.validated} certificat${result.validated > 1 ? "s" : ""} validé${result.validated > 1 ? "s" : ""}`,
              description: result.failed.length > 0 ? `${result.failed.length} n'a pas pu être validé : ${result.failed.join(", ")}` : undefined,
              variant: result.failed.length > 0 ? "destructive" : undefined,
            });
            setSelected(new Set());
          } catch (err) {
            toast({ title: "Validation impossible", description: errorMessage(err), variant: "destructive" });
          }
        }}
      />
      {revoking && (
        <ReasonDialog
          title={revoking.status === "PENDING" ? `Refuser le certificat de ${revoking.learnerName}` : `Révoquer le certificat de ${revoking.learnerName}`}
          description={revoking.status === "PENDING"
            ? "Le certificat ne sera jamais envoyé ni visible et ne sera pas recréé automatiquement. Le motif est conservé."
            : "Le certificat devient invalide : la page publique de vérification indiquera qu'il a été révoqué. Cette action est tracée."}
          confirmLabel={revoking.status === "PENDING" ? "Refuser" : "Révoquer"}
          onClose={() => setRevoking(null)}
          onSubmit={async (reason) => {
            try {
              await revoke.mutateAsync({ publicId: revoking.publicId, reason });
              toast({ title: revoking.status === "PENDING" ? "Certificat refusé" : "Certificat révoqué" });
              setRevoking(null);
            } catch (err) {
              toast({ title: "Action impossible", description: errorMessage(err), variant: "destructive" });
            }
          }}
        />
      )}
    </AdminLayout>
  );
}
