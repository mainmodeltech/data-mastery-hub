/**
 * MfaPanels.tsx — étapes de double authentification de la page /connexion (personnel du back-office).
 *
 *   - MfaVerifyPanel     : saisie du code à 6 chiffres de l'application d'authentification (ou d'un code de secours)
 *   - MfaEnrollPanel     : première connexion — enregistrer le compte dans l'application, confirmer avec un premier
 *                          code, puis noter les codes de secours (affichés une seule fois)
 *
 * Enrôlement : un QR code (adresse otpauth://, généré dans le navigateur — le secret ne quitte jamais la page) à scanner avec
 * l'application d'authentification ; en secours, la clé à recopier et un lien qui ouvre l'application sur mobile.
 */
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Check, Copy, Download, KeyRound, Loader2, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/shared/Button";
import { useAuth } from "@/hooks/useAuth";
import type { MfaEnrollment } from "@/types/auth.type";

const fieldClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3.5 font-sans text-base text-ink outline-none focus:border-navy";

const heading = "font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.5rem]";

function ErrorBox({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{message}</div>;
}

/** Secret Base32 par groupes de 4 caractères (plus lisible à recopier). */
function grouped(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

// ─── Vérification ─────────────────────────────────────────────────────────────

export function MfaVerifyPanel() {
  const { verifyMfa, cancelMfa } = useAuth();
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const failure = await verifyMfa(code.trim());
    if (failure) {
      setError(failure);
      setCode("");
      setLoading(false);
    }
    // Succès : la session s'ouvre, usePostLoginRedirect redirige.
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <button type="button" onClick={cancelMfa} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <div className="flex flex-col gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-info-bg">
          {recovery ? <KeyRound className="h-6 w-6 text-navy" /> : <ShieldCheck className="h-6 w-6 text-navy" />}
        </span>
        <h1 className={heading}>{recovery ? "Code de secours" : "Vérification en deux étapes"}</h1>
        <p className="text-base text-ink-secondary">
          {recovery
            ? "Saisissez l'un des codes de secours notés lors de la configuration. Chaque code ne sert qu'une fois."
            : "Ouvrez votre application d'authentification et saisissez le code à 6 chiffres affiché pour Model Technologie."}
        </p>
      </div>
      {error && <ErrorBox message={error} />}
      <div className="flex flex-col gap-2">
        <label htmlFor="mfa-code" className="text-sm font-semibold text-ink">
          {recovery ? "Code de secours" : "Code à 6 chiffres"}
        </label>
        {recovery ? (
          <input
            id="mfa-code"
            autoFocus
            required
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 11))}
            placeholder="ABCDE-FGHJK"
            className={`${fieldClass} text-center font-heading text-xl font-bold tracking-[0.15em]`}
          />
        ) : (
          <input
            id="mfa-code"
            autoFocus
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            className={`${fieldClass} text-center font-heading text-2xl font-bold tracking-[0.5em]`}
          />
        )}
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="rounded-xl text-[1.0625rem]"
        disabled={loading || (recovery ? code.length < 10 : code.length !== 6)}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Valider"}
      </Button>
      <button
        type="button"
        onClick={() => { setRecovery((r) => !r); setCode(""); setError(""); }}
        className="text-center text-[0.9375rem] font-semibold text-navy hover:underline"
      >
        {recovery ? "Utiliser l'application d'authentification" : "Je n'ai plus accès à mon application : utiliser un code de secours"}
      </button>
    </form>
  );
}

// ─── Enrôlement ───────────────────────────────────────────────────────────────

export function MfaEnrollPanel() {
  const { startMfaEnrollment, confirmMfaEnrollment, cancelMfa } = useAuth();
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [recovery, setRecovery] = useState<{ codes: string[]; complete: () => void } | null>(null);
  const started = useRef(false);

  // Le secret est demandé une seule fois (le double rendu de StrictMode ne doit pas en générer un second)
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startMfaEnrollment().then(setEnrollment).catch((err: Error) => setError(err.message));
  }, [startMfaEnrollment]);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await confirmMfaEnrollment(code.trim());
    if (result.error || !result.complete) {
      setError(result.error ?? "Vérification impossible. Réessayez.");
      setCode("");
      setLoading(false);
      return;
    }
    setRecovery({ codes: result.recoveryCodes ?? [], complete: result.complete });
    setLoading(false);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* presse-papiers indisponible : le texte reste sélectionnable */ }
  };

  if (recovery) return <RecoveryCodesPanel codes={recovery.codes} onDone={recovery.complete} />;

  return (
    <form onSubmit={confirm} className="flex flex-col gap-5">
      <button type="button" onClick={cancelMfa} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <div className="flex flex-col gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-info-bg">
          <Smartphone className="h-6 w-6 text-navy" />
        </span>
        <h1 className={heading}>Sécurisez votre compte</h1>
        <p className="text-base text-ink-secondary">
          Le back-office exige une vérification en deux étapes. Configurez-la une fois : cela prend deux minutes.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <ol className="flex flex-col gap-4 text-[0.9375rem] text-ink">
        <li>
          <strong>1.</strong> Installez une application d'authentification sur votre téléphone (Google Authenticator,
          Microsoft Authenticator, Authy, 1Password, Bitwarden…).
        </li>
        <li className="flex flex-col gap-3">
          <span>
            <strong>2.</strong> Dans l'application, ajoutez un compte (« + » ou « Scanner un QR code ») et <strong>scannez ce code</strong> :
          </span>
          {enrollment ? (
            <>
              <div
                role="img"
                aria-label="QR code à scanner avec l'application d'authentification"
                className="mx-auto w-fit rounded-xl border border-[#E7E0D4] bg-white p-3"
              >
                <QRCodeSVG value={enrollment.otpauthUri} size={192} level="M" marginSize={2} bgColor="#FFFFFF" fgColor="#16202E" />
              </div>
              <details className="rounded-xl border border-[#E7E0D4] bg-surface-sand p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-navy">Je ne peux pas scanner le QR code</summary>
                <div className="mt-3 flex flex-col gap-3">
                  <a
                    href={enrollment.otpauthUri}
                    className="w-fit rounded-pill border-2 border-navy px-4 py-2 text-sm font-bold text-navy hover:bg-navy/5"
                  >
                    Ouvrir mon application d'authentification
                  </a>
                  <span className="text-[0.8125rem] text-ink-secondary">
                    (utile si vous êtes sur le téléphone qui porte l'application). Sinon, choisissez « saisir une clé » dans l'application et recopiez :
                  </span>
                  <div className="flex items-center gap-2">
                    <code
                      aria-label="Clé secrète"
                      className="flex-1 select-all break-all rounded-lg bg-white px-3 py-2 font-mono text-base font-bold tracking-wider text-navy"
                    >
                      {grouped(enrollment.secret)}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copy(enrollment.secret)}
                      aria-label="Copier la clé"
                      className="rounded-lg border border-[#D6CEC0] bg-white p-2.5 text-navy hover:bg-navy/5"
                    >
                      {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                  <span className="text-[0.8125rem] text-ink-secondary">Type : basé sur le temps (TOTP) · 6 chiffres · 30 secondes.</span>
                </div>
              </details>
            </>
          ) : !error ? (
            <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" aria-label="Préparation…" />
          ) : null}
        </li>
        <li>
          <strong>3.</strong> Saisissez le code à 6 chiffres affiché par l'application pour confirmer.
        </li>
      </ol>

      <div className="flex flex-col gap-2">
        <label htmlFor="mfa-enroll-code" className="text-sm font-semibold text-ink">Code à 6 chiffres</label>
        <input
          id="mfa-enroll-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          disabled={!enrollment}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className={`${fieldClass} text-center font-heading text-2xl font-bold tracking-[0.5em]`}
        />
      </div>
      <Button type="submit" variant="primary" size="lg" className="rounded-xl text-[1.0625rem]" disabled={loading || !enrollment || code.length !== 6}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Activer et continuer"}
      </Button>
    </form>
  );
}

// ─── Codes de secours ─────────────────────────────────────────────────────────

function RecoveryCodesPanel({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  const download = () => {
    const url = URL.createObjectURL(new Blob([
      `Model Technologie — codes de secours (double authentification)\nChaque code ne sert qu'une fois. Conservez ce fichier en lieu sûr.\n\n${text}\n`,
    ], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "model-technologie-codes-de-secours.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setSaved(true);
    } catch { /* presse-papiers indisponible */ }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-success-bg">
          <ShieldCheck className="h-6 w-6 text-success" />
        </span>
        <h1 className={heading}>Double authentification activée</h1>
        <p className="text-base text-ink-secondary">
          Voici vos <strong>codes de secours</strong>. Si vous perdez votre téléphone, chacun vous permet de vous connecter une fois.
          <strong> Ils ne seront plus jamais affichés</strong> : conservez-les dans un gestionnaire de mots de passe ou imprimez-les.
        </p>
      </div>
      <ul aria-label="Codes de secours" className="grid grid-cols-2 gap-2 rounded-xl border border-[#E7E0D4] bg-surface-sand p-4">
        {codes.map((c) => (
          <li key={c} className="select-all text-center font-mono text-[0.9375rem] font-bold tracking-wider text-navy">{c}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" shape="pill" size="sm" onClick={() => void copy()}>
          {copied ? <Check className="text-success" /> : <Copy />} Copier
        </Button>
        <Button type="button" variant="outline" shape="pill" size="sm" onClick={download}>
          <Download /> Télécharger
        </Button>
      </div>
      <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
        J'ai conservé ces codes en lieu sûr.
      </label>
      <Button type="button" variant="primary" size="lg" className="rounded-xl text-[1.0625rem]" disabled={!saved} onClick={onDone}>
        Accéder au back-office
      </Button>
    </div>
  );
}
