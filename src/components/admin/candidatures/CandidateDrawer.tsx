/**
 * CandidateDrawer — fiche complète d'une candidature (panneau latéral) : contact, candidature, paiement, historique,
 * actions du moment et options avancées. S'ouvre depuis la liste ou le pipeline, sans quitter la page.
 */
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Copy, Mail, Phone } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/AdminKit";
import { Button, Pill } from "@/components/shared";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Registration, RegistrationStatus } from "@/types";
import { formatAmount, PAYMENT_METHOD_LABELS, type AdminPayment, type PaymentMethod } from "@/types/payment.type";
import { stageLabel, stageOf, STATUS_LABELS } from "./stages";

const stamp = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "—");
const dayOnly = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "—");

export interface DrawerActions {
  canDecide: boolean;
  canManagePayments: boolean;
  /** Saisir un paiement reçu hors site (la confirmation reste à la Finance). */
  canRecordPayments: boolean;
  canInvoice: boolean;
  onAccept: (r: Registration) => void;
  onReject: (r: Registration) => void;
  onCancel: (r: Registration) => void;
  onInvoice: (r: Registration) => void;
  onManualPayment: (r: Registration) => void;
  onRemind: (payment: AdminPayment) => void;
  onConfirm: (payment: AdminPayment) => void;
  onRejectPayment: (payment: AdminPayment) => void;
  onCopyLink: (link: string | null) => void;
  onComplete: (r: Registration) => void;
  onChangeStatus: (r: Registration, status: RegistrationStatus) => Promise<void>;
  onDelete: (r: Registration) => Promise<void>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-ink-secondary">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1 border-t border-[#E7E0D4] pt-4">
      <h3 className="font-heading text-sm font-bold uppercase tracking-[0.6px] text-navy">{title}</h3>
      <dl>{children}</dl>
    </section>
  );
}

export function CandidateDrawer({
  registration: r, payments, actions, onClose,
}: { registration: Registration | null; payments: AdminPayment[]; actions: DrawerActions; onClose: () => void }) {
  const [status, setStatus] = useState<RegistrationStatus | "">("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stage = r ? stageOf(r.status) : null;
  const pending = payments.find((p) => p.status === "PENDING");
  const declared = payments.find((p) => p.status === "DECLARED");
  const s = r?.paymentSummary;

  return (
    <Sheet open={!!r} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        {r && (
          <div className="flex flex-col gap-4">
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-xl font-bold text-navy">{r.firstName} {r.lastName}</SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                <Pill variant={stage === "ARCHIVED" ? "neutral" : stage === "ENROLLED" ? "success" : stage === "TO_CONFIRM" ? "warning" : "info"}>
                  {STATUS_LABELS[r.status]}
                </Pill>
                <span>Reçue le {dayOnly(r.createdAt)}</span>
              </SheetDescription>
            </SheetHeader>

            <Section title="Contact">
              <Row label="E-mail"><a className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-cta" href={`mailto:${r.email}`}><Mail className="h-3.5 w-3.5" aria-hidden="true" />{r.email}</a></Row>
              <Row label="Téléphone">{r.phone && <a className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-cta" href={`tel:${r.phone}`}><Phone className="h-3.5 w-3.5" aria-hidden="true" />{r.phone}</a>}</Row>
              <Row label="Pays">{r.country}</Row>
              <Row label="Profil">{r.profile}</Row>
              <Row label="École">{r.school}</Row>
              <Row label="Entreprise">{r.company}</Row>
              <Row label="Fonction">{r.position}</Row>
            </Section>

            <Section title="Candidature">
              <Row label="Formation">{r.bootcampTitle}</Row>
              <Row label="Session">{r.sessionName}</Row>
              <Row label="Message">{r.message && <span className="whitespace-pre-wrap">{r.message}</span>}</Row>
              <Row label="Code promo">{r.promoCodeUsed && <>{r.promoCodeUsed}{r.discountPercent ? ` (−${r.discountPercent} %)` : ""}</>}</Row>
              <Row label="Origine">{r.source === "ADMIN" ? "Saisie manuelle" : r.source ? "Site web" : null}</Row>
            </Section>

            {(r.totalAmount || s) && (
              <Section title="Paiement">
                <Row label="Payeur">{r.payerType === "COMPANY" ? "Entreprise" : r.payerType === "INDIVIDUAL" ? "Particulier" : null}</Row>
                <Row label="Montant total">{r.totalAmount ? formatAmount(r.totalAmount) : null}</Row>
                {s && s.installmentCount > 0 && (
                  <Row label="Échéances">{s.confirmedCount}/{s.installmentCount} payée{s.confirmedCount > 1 ? "s" : ""} · {formatAmount(s.paidAmount)} encaissés</Row>
                )}
                {pending && (
                  <Row label="À payer">
                    Échéance {pending.installmentNumber}/{pending.installmentCount} · <strong>{formatAmount(pending.amount, pending.currency)}</strong>
                    {pending.dueDate ? ` · avant le ${dayOnly(pending.dueDate)}` : ""}
                  </Row>
                )}
                {declared && (
                  <Row label="Déclaré">
                    {declared.method ? (PAYMENT_METHOD_LABELS[declared.method as PaymentMethod] ?? declared.method) : "Paiement"} · <strong>{formatAmount(declared.amount, declared.currency)}</strong>
                    {declared.reference ? ` · réf. ${declared.reference}` : ""}
                    {declared.proofUrl && <> · <a href={declared.proofUrl} target="_blank" rel="noreferrer" className="font-semibold text-navy underline underline-offset-2">Voir la preuve</a></>}
                  </Row>
                )}
                {s?.linkSentAt && <Row label="Lien envoyé">{stamp(s.linkSentAt)}{pending && pending.reminderCount > 0 ? ` · ${pending.reminderCount} relance${pending.reminderCount > 1 ? "s" : ""}` : ""}</Row>}
              </Section>
            )}

            <Section title="Historique">
              <Row label="Reçue">{stamp(r.createdAt)}</Row>
              <Row label="Acceptée">{r.acceptedAt ? stamp(r.acceptedAt) : null}</Row>
              <Row label="Refusée">{r.status === "REJECTED" && r.rejectedReason ? `Motif : ${r.rejectedReason}` : null}</Row>
              <Row label="Annulée">{r.status === "CANCELLED" ? `${r.cancelledAt ? stamp(r.cancelledAt) : ""}${r.cancelledReason ? ` · Motif : ${r.cancelledReason}` : ""}` : null}</Row>
            </Section>

            <Section title="Actions">
              <div className="flex flex-wrap gap-2 pt-1">
                {stage === "NEW" && actions.canDecide && (
                  <>
                    <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => actions.onAccept(r)}>Accepter</Button>
                    <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => actions.onReject(r)}>Refuser</Button>
                  </>
                )}
                {stage === "AWAITING_PAYMENT" && (
                  <>
                    <Button type="button" variant="outline" shape="rounded" size="sm" disabled={!pending} onClick={() => actions.onCopyLink(pending?.paymentLink ?? null)}><Copy />Copier le lien</Button>
                    {actions.canManagePayments && (
                      <Button type="button" variant="outline" shape="rounded" size="sm" disabled={!pending} onClick={() => pending && actions.onRemind(pending)}>Relancer</Button>
                    )}
                    {actions.canRecordPayments && (
                      <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => actions.onManualPayment(r)}>Paiement reçu hors site</Button>
                    )}
                  </>
                )}
                {stage === "TO_CONFIRM" && actions.canManagePayments && declared && (
                  <>
                    <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => actions.onConfirm(declared)}>Confirmer le paiement</Button>
                    <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => actions.onRejectPayment(declared)}>Rejeter</Button>
                  </>
                )}
                {stage === "ENROLLED" && (
                  <>
                    {s && s.confirmedCount < s.installmentCount && actions.canRecordPayments && (
                      <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => actions.onManualPayment(r)}>Paiement reçu hors site</Button>
                    )}
                    {r.status === "CONFIRMED" && actions.canDecide && (
                      <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => actions.onComplete(r)}>Marquer terminé</Button>
                    )}
                  </>
                )}
                {actions.canInvoice && stage !== "NEW" && stage !== "ARCHIVED" && (
                  <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => actions.onInvoice(r)}>Facture</Button>
                )}
                {actions.canDecide && (stage === "AWAITING_PAYMENT" || stage === "TO_CONFIRM" || r.status === "CONFIRMED") && (
                  <Button type="button" variant="outline" shape="rounded" size="sm" className="border-transparent text-error" onClick={() => actions.onCancel(r)}>Annuler l'inscription</Button>
                )}
                {stage === "ARCHIVED" && !actions.canDecide && <p className="text-sm text-ink-secondary">Aucune action disponible.</p>}
              </div>
            </Section>

            {actions.canDecide && (
              <Section title="Avancé">
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor="cd-status">Changer le statut</label>
                    <select
                      id="cd-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as RegistrationStatus | "")}
                      className="rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Changer le statut…</option>
                      {(Object.keys(STATUS_LABELS) as RegistrationStatus[]).filter((k) => k !== r.status).map((k) => (
                        <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                      ))}
                    </select>
                    <Button type="button" variant="outline" shape="rounded" size="sm" disabled={!status}
                      onClick={async () => { if (status) { await actions.onChangeStatus(r, status); setStatus(""); } }}>
                      Appliquer
                    </Button>
                  </div>
                  <p className="text-xs text-ink-secondary">Le changement manuel de statut ne déclenche ni e-mail ni échéance : préférez les actions ci-dessus.</p>
                  <Button type="button" variant="outline" shape="rounded" size="sm" className="w-fit border-transparent text-error" onClick={() => setConfirmDelete(true)}>
                    Supprimer cette candidature
                  </Button>
                </div>
              </Section>
            )}
            <p className="text-xs text-ink-secondary">Étape : {stage ? stageLabel(stage) : "—"}</p>
          </div>
        )}
      </SheetContent>
      {r && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Supprimer la candidature de ${r.firstName} ${r.lastName} ?`}
          description="Elle disparaît des listes. Si l'inscription était confirmée, la place est libérée. Cette action ne supprime pas les paiements déjà encaissés."
          onConfirm={async () => { await actions.onDelete(r); onClose(); }}
        />
      )}
    </Sheet>
  );
}
