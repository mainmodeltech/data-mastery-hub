/**
 * AdminReglagesPaiement.tsx — réglages de paiement (Direction seulement).
 * Choisit, service par service, comment le client paie : en ligne (PayDunya), en manuel (Wave, Orange Money, virement) ou les deux.
 * Le manuel reste toujours disponible comme secours : coupure d'urgence, clés absentes ou passerelle en panne basculent seuls.
 * Les frais (absorbés ou répercutés) se règlent par variables d'environnement, jamais ici. Chaque changement exige un motif et est audité.
 */
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice, errorMessage, Field, inputClass, ReasonDialog, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useToast } from "@/hooks/use-toast";
import { usePaymentSettings, useResetGateway, useUpdatePaymentSettings } from "@/hooks/usePaymentSettings";
import { formatAmount } from "@/types/payment.type";
import { PAYMENT_MODE_LABELS, type PayableService, type PaymentMode } from "@/types/paymentSettings.type";

const MODES = Object.keys(PAYMENT_MODE_LABELS) as PaymentMode[];

const SERVICE_HINTS: Record<PayableService, string> = {
  SIMULATOR: "Achat d'un forfait du simulateur PL-300.",
  REGISTRATION: "Règlement des échéances d'une inscription (après validation de la candidature par l'équipe).",
  COACHING: "Règlement d'un coaching validé (lien de paiement envoyé par e-mail après validation par le responsable pédagogique).",
};

export default function AdminReglagesPaiement() {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = usePaymentSettings();
  const update = useUpdatePaymentSettings();
  const reset = useResetGateway();

  const [online, setOnline] = useState(true);
  const [modes, setModes] = useState<Partial<Record<PayableService, PaymentMode>>>({});
  const [asking, setAsking] = useState(false);

  // Le formulaire repart de l'état enregistré à chaque rafraîchissement du serveur (changement fait par une autre personne, par exemple).
  const stamp = data?.updatedAt ?? "";
  useEffect(() => {
    if (!data) return;
    setOnline(data.onlineEnabled);
    setModes(Object.fromEntries(data.services.map((s) => [s.service, s.mode])));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seule une nouvelle version enregistrée réinitialise le formulaire
  }, [stamp, data?.services.length]);

  const dirty = !!data && (online !== data.onlineEnabled || data.services.some((s) => modes[s.service] !== s.mode));

  const save = async (reason: string) => {
    try {
      await update.mutateAsync({ onlineEnabled: online, modes, reason });
      toast({ title: "Réglages enregistrés", description: "Ils s'appliquent immédiatement sur le site." });
      setAsking(false);
    } catch (err) {
      toast({ title: "Enregistrement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const resetGateway = async () => {
    try {
      await reset.mutateAsync();
      toast({ title: "Passerelle remise en service", description: "Le prochain paiement en ligne retentera PayDunya." });
    } catch (err) {
      toast({ title: "Action impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const gw = data?.gateway;
  const sandbox = gw?.mode === "sandbox";

  return (
    <AdminLayout title="Réglages de paiement" description="Comment vos clients paient : en ligne, en manuel, ou les deux. Réservé à la Direction.">
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les réglages.")}</ErrorNotice>}

      {data && gw && (
        <div className="flex max-w-3xl flex-col gap-6">
          {/* État de la passerelle */}
          <Card radius="stat" className={`flex flex-col gap-2 border p-4 ${gw.degraded || !gw.configured ? "border-warning/50 bg-warning-bg" : "border-[#E7E0D4]"}`}>
            <div className="flex flex-wrap items-center gap-2">
              {gw.configured && !gw.degraded ? <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /> : <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />}
              <strong className="text-sm text-ink">{gw.provider === "PAYDUNYA" ? "PayDunya" : gw.provider}</strong>
              <Pill variant={gw.configured ? (sandbox ? "warning" : "success") : "error"}>
                {gw.configured ? (sandbox ? "Mode test : aucun argent réel" : "Mode production") : "Non configuré"}
              </Pill>
              {gw.degraded && <Pill variant="error">Panne détectée</Pill>}
            </div>
            {!gw.configured && <p className="text-sm text-warning">Les clés ne sont pas renseignées sur le serveur : tout le monde paie en manuel, quels que soient les réglages ci-dessous.</p>}
            {gw.degraded && (
              <>
                <p className="text-sm text-warning">
                  Plusieurs échecs de suite chez le prestataire : le paiement manuel est proposé automatiquement à la place pendant quelques minutes.
                </p>
                <Button type="button" size="sm" variant="outline" shape="rounded" className="w-fit" disabled={reset.isPending} onClick={resetGateway}>
                  {reset.isPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}Remettre en service
                </Button>
              </>
            )}
            <p className="text-xs text-ink-secondary">
              Adresse de notification (IPN) à déclarer chez PayDunya :{" "}
              {gw.notificationUrl ? <code className="break-all rounded bg-surface-sand px-1.5 py-0.5">{gw.notificationUrl}</code> : <em>non définie sur ce serveur</em>}
            </p>
          </Card>

          {/* Coupure d'urgence */}
          <SwitchRow
            label="Paiement en ligne activé"
            description="Interrupteur général. Désactivé, plus aucun paiement en ligne n'est proposé : tout passe par le paiement manuel, sans coupure de service."
            checked={online}
            onChange={setOnline}
          />

          {/* Mode par service */}
          <div className="flex flex-col gap-4">
            {data.services.map((s) => (
              <Field key={s.service} label={s.label} htmlFor={`mode-${s.service}`} hint={SERVICE_HINTS[s.service]}>
                <select
                  id={`mode-${s.service}`}
                  className={inputClass}
                  value={modes[s.service] ?? s.mode}
                  onChange={(e) => setModes((m) => ({ ...m, [s.service]: e.target.value as PaymentMode }))}
                >
                  {MODES.map((m) => <option key={m} value={m}>{PAYMENT_MODE_LABELS[m]}</option>)}
                </select>
                {s.updatedAt && s.updatedBy && <span className="text-xs text-ink-secondary">Dernier changement par {s.updatedBy}</span>}
              </Field>
            ))}
            <p className="text-xs text-ink-secondary">
              Une entreprise qui paie sur facture règle toujours en manuel. Le paiement manuel reste disponible en secours, quel que soit le réglage choisi.
            </p>
          </div>

          {/* Frais : information seulement */}
          <Card radius="stat" className="flex flex-col gap-1 border border-[#E7E0D4] p-4">
            <h3 className="text-sm font-semibold text-ink">Frais du prestataire</h3>
            {data.fees.mode === "ABSORB" ? (
              <p className="text-sm text-ink-secondary">Absorbés : le client paie exactement le prix du catalogue, en ligne comme en manuel.</p>
            ) : (
              <p className="text-sm text-ink-secondary">
                Répercutés sur le paiement en ligne ({data.fees.percent} %{data.fees.fixedXof > 0 && ` + ${formatAmount(data.fees.fixedXof)}`}) : le client paie le prix du catalogue plus les frais.
                Le paiement manuel reste au prix du catalogue.
              </p>
            )}
            <p className="text-xs text-ink-secondary">Se règle par les variables d'environnement PAYMENTS_FEES_MODE, PAYMENTS_FEES_PERCENT et PAYMENTS_FEES_FIXED_XOF, sans modifier le code.</p>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-ink-secondary">
              {data.updatedAt && data.updatedBy ? `Dernière modification par ${data.updatedBy}.` : "Aucune modification depuis la mise en service."}
            </p>
            <Button type="button" shape="rounded" disabled={!dirty || update.isPending} onClick={() => setAsking(true)}>Enregistrer</Button>
          </div>
        </div>
      )}

      {asking && (
        <ReasonDialog
          title="Enregistrer les réglages de paiement"
          description="Le changement s'applique tout de suite sur le site. Indiquez pourquoi : le motif est consigné dans le journal d'audit."
          confirmLabel="Enregistrer"
          onClose={() => setAsking(false)}
          onSubmit={save}
        />
      )}
    </AdminLayout>
  );
}
