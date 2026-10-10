/**
 * ManualRegistrationDialog — « Inscription manuelle » : candidature saisie par l'équipe (appel, visite,
 * entreprise). Elle reste « en attente » dans le pipeline et s'accepte ensuite comme les autres.
 */
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { ErrorNotice, errorMessage, Field, inputClass } from "@/components/admin/AdminKit";
import { Button } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAllFormationSessions, useFormations } from "@/hooks/useFormations";
import { useCreateManualRegistration } from "@/hooks/usePayments";
import type { ManualRegistrationPayload } from "@/services/api/paymentService";

type Profile = ManualRegistrationPayload["profile"];

const PROFILES: { value: Profile; label: string }[] = [
  { value: "PROFESSIONAL", label: "Professionnel" },
  { value: "STUDENT", label: "Étudiant" },
  { value: "ENTREPRENEUR", label: "Entrepreneur" },
];

export function ManualRegistrationDialog({
  onClose, presetFormationId, presetSessionId,
}: { onClose: () => void; presetFormationId?: string; presetSessionId?: string }) {
  const { toast } = useToast();
  const create = useCreateManualRegistration();
  const { data: formations = [] } = useFormations();
  const { data: sessions = [] } = useAllFormationSessions();

  const [formationId, setFormationId] = useState(presetFormationId ?? "");
  const [sessionId, setSessionId] = useState(presetSessionId ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Sénégal");
  const [profile, setProfile] = useState<Profile>("PROFESSIONAL");
  const [school, setSchool] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formation = formations.find((f) => f.id === formationId);
  const formationSessions = useMemo(
    () => sessions.filter((s) => s.formationId === formationId && s.status !== "CANCELLED" && s.status !== "COMPLETED"),
    [sessions, formationId],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formationId) return setError("Choisissez la formation.");
    if (profile === "STUDENT" && !school.trim()) return setError("L'école est obligatoire pour un étudiant.");
    if (profile === "PROFESSIONAL" && (!company.trim() || !position.trim())) {
      return setError("L'entreprise et le poste sont obligatoires pour un professionnel.");
    }
    const clean = (v: string) => (v.trim() === "" ? undefined : v.trim());
    try {
      await create.mutateAsync({
        bootcampId: formationId,
        bootcampTitle: formation?.title,
        sessionId: clean(sessionId),
        promoCode: clean(promoCode),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: clean(phone),
        country: country.trim(),
        profile,
        school: profile === "STUDENT" ? clean(school) : undefined,
        company: profile !== "STUDENT" ? clean(company) : undefined,
        position: profile !== "STUDENT" ? clean(position) : undefined,
        message: clean(message),
      });
      toast({ title: "Candidature enregistrée", description: "Elle apparaît dans « Nouvelles candidatures » : vous pouvez l'accepter." });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "L'enregistrement a échoué."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !create.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Inscription manuelle</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Saisissez une candidature reçue par téléphone, en visite ou via une entreprise. Aucun e-mail n'est envoyé tant que vous ne l'acceptez pas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Formation *" htmlFor="mr-formation">
              <select id="mr-formation" required className={inputClass} value={formationId} onChange={(e) => { setFormationId(e.target.value); setSessionId(""); }}>
                <option value="" disabled>Choisir…</option>
                {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </Field>
            <Field label="Session" htmlFor="mr-session" hint="Facultatif : sans session, la candidature reste rattachée à la formation.">
              <select id="mr-session" className={inputClass} value={sessionId} onChange={(e) => setSessionId(e.target.value)} disabled={!formationId}>
                <option value="">Aucune session</option>
                {formationSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sessionName ?? "Session"}{s.startDate ? ` — ${new Date(s.startDate).toLocaleDateString("fr-FR")}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prénom *" htmlFor="mr-first"><input id="mr-first" required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="off" /></Field>
            <Field label="Nom *" htmlFor="mr-last"><input id="mr-last" required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="off" /></Field>
            <Field label="E-mail *" htmlFor="mr-email"><input id="mr-email" type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" /></Field>
            <Field label="Téléphone / WhatsApp" htmlFor="mr-phone"><input id="mr-phone" type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" /></Field>
            <Field label="Pays de provenance *" htmlFor="mr-country"><input id="mr-country" required className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
            <Field label="Profil *" htmlFor="mr-profile">
              <select id="mr-profile" className={inputClass} value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
                {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            {profile === "STUDENT" ? (
              <Field label="École / institution *" htmlFor="mr-school" className="sm:col-span-2">
                <input id="mr-school" className={inputClass} value={school} onChange={(e) => setSchool(e.target.value)} />
              </Field>
            ) : (
              <>
                <Field label={profile === "PROFESSIONAL" ? "Entreprise *" : "Entreprise"} htmlFor="mr-company">
                  <input id="mr-company" className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} />
                </Field>
                <Field label={profile === "PROFESSIONAL" ? "Poste *" : "Activité"} htmlFor="mr-position">
                  <input id="mr-position" className={inputClass} value={position} onChange={(e) => setPosition(e.target.value)} />
                </Field>
              </>
            )}
            <Field label="Code promo / parrainage" htmlFor="mr-promo"><input id="mr-promo" className={inputClass} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} autoComplete="off" /></Field>
          </div>
          <Field label="Note" htmlFor="mr-message">
            <textarea id="mr-message" rows={3} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={create.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="navy" shape="rounded" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer la candidature"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
