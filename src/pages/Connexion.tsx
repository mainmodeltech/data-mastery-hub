/**
 * Connexion.tsx — page /connexion unique (docs/design/README.md §2, screens/app/App-Connexion.dc.html
 * + M-Connexion.dc.html). Point d'entrée pour tous les rôles ; la redirection se fait selon le rôle
 * du jeton (personnel → /admin, apprenant → /espace).
 *
 * Les modes proposés viennent de GET /auth/options (jamais supposés) :
 *   - mot de passe  → POST /auth/login (429 après 5 échecs : on met le lien par e-mail en avant)
 *   - lien + code   → POST /auth/passwordless/request puis /verify {email, code} (le lien, lui,
 *                     est géré par la route /connexion/lien)
 *   - Google        → Google Identity Services puis POST /auth/google
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck, Play } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAuthOptions } from "@/hooks/useAuthOptions";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { Button } from "@/components/shared/Button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Logo } from "@/components/shared/Logo";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MfaEnrollPanel, MfaVerifyPanel } from "@/components/auth/MfaPanels";
import { authService } from "@/services/api/authService";
import { ApiError } from "@/services/httpClient";

const fieldClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3.5 font-sans text-base text-ink outline-none focus:border-navy";

type View = "password" | "link-request" | "link-code";
const RESEND_DELAY_S = 60;

/** Message d'erreur lisible pour un échec de lien/code/Google (le serveur donne un message générique). */
function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return err.message || "Trop de tentatives. Réessayez dans quelques minutes.";
    if (err.status === 400 && err.message && !/^Erreur \d+$/.test(err.message)) return err.message;
  }
  return fallback;
}

export default function Connexion() {
  const { signIn, applySession, pendingMfa } = useAuth();
  usePostLoginRedirect();
  const { data: options } = useAuthOptions();

  // Sans réponse de /auth/options (ancien serveur, panne), seul le mot de passe — toujours disponible — est proposé.
  const passwordEnabled = options?.password ?? true;
  const linkEnabled = options?.passwordless ?? false;
  const googleClientId = options?.google ? options.googleClientId ?? null : null;

  const [view, setView] = useState<View>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Déconnecté par le serveur (jeton expiré/révoqué) : message affiché une seule fois
  const [expired] = useState(() => {
    try {
      const flag = sessionStorage.getItem("session_expired") === "1";
      if (flag) sessionStorage.removeItem("session_expired");
      return flag;
    } catch {
      return false;
    }
  });
  const [rateLimited, setRateLimited] = useState(false);
  const [googleBroken, setGoogleBroken] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Compte à rebours avant de pouvoir renvoyer un lien/code
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const goTo = (next: View) => {
    setError("");
    setView(next);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRateLimited(false);
    const { error: signInError, status, mfa } = await signIn(email.trim(), password);
    if (mfa) {
      setPassword("");
      setLoading(false);
      return;
    }
    if (signInError) {
      setError(signInError);
      setRateLimited(status === 429);
      setLoading(false);
    }
    // Succès : usePostLoginRedirect redirige dès que `user` est dérivé du JWT.
  };

  const sendLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.requestLoginLink(email.trim());
      setCode("");
      setResendIn(RESEND_DELAY_S);
      setView("link-code");
    } catch (err) {
      setError(authErrorMessage(err, "Envoi impossible pour le moment. Réessayez dans un instant."));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Entrez le code à 6 chiffres reçu par e-mail.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await authService.verifyLogin({ email: email.trim(), code });
      if (applySession(session) === "mfa") setLoading(false);
    } catch (err) {
      setError(authErrorMessage(err, "Lien ou code invalide, expiré ou déjà utilisé."));
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setLoading(true);
    setError("");
    try {
      const session = await authService.loginWithGoogle(credential);
      if (applySession(session) === "mfa") setLoading(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setGoogleBroken(true); // Google n'est pas configuré côté serveur
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Aucun compte ne correspond à ce compte Google.");
      } else {
        setError(authErrorMessage(err, "Connexion avec Google impossible pour le moment."));
      }
      setLoading(false);
    }
  };

  const showGoogle = !!googleClientId && !googleBroken && view === "password" && !pendingMfa;

  const linkButton = (
    <button
      type="button"
      onClick={() => goTo("link-request")}
      className={
        rateLimited
          ? "w-full rounded-xl border border-navy bg-white px-4 py-3.5 text-[15px] font-semibold text-navy hover:bg-navy/5"
          : "text-center text-[15px] font-semibold text-navy hover:underline"
      }
    >
      Recevoir un lien de connexion par e-mail
    </button>
  );

  return (
    <div className="grid min-h-screen bg-site-bg lg:grid-cols-2">
      <div className="flex flex-col gap-10 px-6 py-8 lg:px-24 lg:py-12">
        <Link to="/" aria-label="Model Technologie — accueil" className="flex w-fit items-center">
          <Logo className="h-14 lg:h-16" />
        </Link>

        <div className="my-auto flex w-full max-w-[440px] flex-col gap-5">
          {pendingMfa?.kind === "verify" && <MfaVerifyPanel />}
          {pendingMfa?.kind === "enroll" && <MfaEnrollPanel />}

          {!pendingMfa && view === "password" && (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-heading text-[32px] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[44px]">
                  Bon retour parmi nous
                </h1>
                <p className="text-base text-ink-secondary lg:text-[17px]">
                  Connectez-vous pour reprendre votre formation.
                </p>
              </div>

              {showGoogle && (
                <>
                  <GoogleSignInButton
                    clientId={googleClientId}
                    onCredential={(c) => void handleGoogle(c)}
                    onUnavailable={() => setGoogleBroken(true)}
                  />
                  {passwordEnabled && (
                    <div className="flex items-center gap-3 text-[13px] text-ink-secondary">
                      <span className="h-px flex-1 bg-[#E7E0D4]" />
                      ou avec votre e-mail
                      <span className="h-px flex-1 bg-[#E7E0D4]" />
                    </div>
                  )}
                </>
              )}

              {expired && !error && (
                <div role="status" className="rounded-xl bg-warning-bg px-4 py-3 text-sm text-warning">
                  Votre session a expiré ou a été fermée. Reconnectez-vous pour continuer.
                </div>
              )}
              {error && (
                <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              {passwordEnabled ? (
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="l-mail" className="text-sm font-semibold text-ink">E-mail</label>
                    <input
                      id="l-mail"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className={fieldClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <label htmlFor="l-pw" className="text-sm font-semibold text-ink">Mot de passe</label>
                      <Link to="/mot-de-passe-oublie" className="text-sm font-semibold">Mot de passe oublié ?</Link>
                    </div>
                    <div className="relative">
                      <input
                        id="l-pw"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${fieldClass} pr-12`}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-navy"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="rounded-xl text-[17px]" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
                  </Button>
                </form>
              ) : (
                loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />
              )}

              {linkEnabled && linkButton}

              <p className="text-center text-sm text-ink-secondary">
                Pas encore de compte ? Il est créé automatiquement à votre inscription.{" "}
                <Link to="/formations" className="font-semibold">Voir les formations</Link>
              </p>
            </>
          )}

          {!pendingMfa && view === "link-request" && (
            <form onSubmit={sendLink} className="flex flex-col gap-5">
              <button type="button" onClick={() => goTo("password")} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <div className="flex flex-col gap-2">
                <h1 className="font-heading text-[32px] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[40px]">
                  Recevoir un lien de connexion
                </h1>
                <p className="text-base text-ink-secondary">
                  Nous vous envoyons un lien et un code à 6 chiffres, valables 10 minutes. Aucun mot de passe nécessaire.
                </p>
              </div>
              {error && <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}
              <div className="flex flex-col gap-2">
                <label htmlFor="ll-mail" className="text-sm font-semibold text-ink">E-mail</label>
                <input
                  id="ll-mail"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className={fieldClass}
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="rounded-xl text-[17px]" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer le lien et le code"}
              </Button>
            </form>
          )}

          {!pendingMfa && view === "link-code" && (
            <form onSubmit={verifyCode} className="flex flex-col gap-5">
              <button type="button" onClick={() => goTo("link-request")} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy">
                <ArrowLeft className="h-4 w-4" /> Changer d'adresse
              </button>
              <div className="flex flex-col gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-success-bg">
                  <MailCheck className="h-6 w-6 text-success" />
                </span>
                <h1 className="font-heading text-[32px] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[40px]">
                  Vérifiez votre boîte mail
                </h1>
                <p className="text-base text-ink-secondary">
                  Si un compte correspond à <strong className="text-ink">{email}</strong>, vous y avez reçu un message.
                  Entrez le code reçu ou cliquez sur le lien.
                </p>
              </div>
              {error && <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{error}</div>}
              <div className="flex flex-col gap-2">
                <label htmlFor="lc-code" className="text-sm font-semibold text-ink">Code à 6 chiffres</label>
                <input
                  id="lc-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoFocus
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className={`${fieldClass} text-center font-heading text-2xl font-bold tracking-[0.5em]`}
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="rounded-xl text-[17px]" disabled={loading || code.length !== 6}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
              </Button>
              <button
                type="button"
                disabled={resendIn > 0 || loading}
                onClick={() => void sendLink()}
                className="text-center text-[15px] font-semibold text-navy enabled:hover:underline disabled:text-ink-secondary"
              >
                {resendIn > 0 ? `Renvoyer un lien dans ${resendIn} s` : "Renvoyer un lien et un code"}
              </button>
            </form>
          )}
        </div>

        <span className="hidden text-[13px] text-ink-secondary lg:block">
          © {new Date().getFullYear()} Model Technologie · <Link to="/contact">Aide</Link>
        </span>
      </div>

      <div className="relative hidden flex-col justify-end gap-7 overflow-hidden bg-navy p-16 lg:flex">
        <div className="absolute inset-x-16 top-16 flex h-[420px] flex-col gap-3.5 rounded-callout bg-navy-medium p-7">
          <span className="text-[13px] font-bold uppercase tracking-[1px] text-cta-on-navy">
            REPRENDRE OÙ VOUS EN ÉTIEZ
          </span>
          <span className="font-heading text-2xl font-bold text-white">Power BI · Module 3 — Mesures DAX</span>
          <div className="flex flex-1 items-center justify-center rounded-[14px] bg-navy-dark">
            <Play className="h-12 w-12 text-white" aria-hidden="true" />
          </div>
          <ProgressBar value={64} variant="accent-on-navy" aria-label="Progression de l'exemple" />
          <span className="text-sm text-[#D5DEE8]">64 % terminé · 3 leçons restantes</span>
        </div>
        <p className="font-heading text-[30px] font-bold leading-tight text-white">
          « Mon reporting mensuel prenait 2 jours. Maintenant 2 heures. »
        </p>
        <span className="text-[15px] text-[#D5DEE8]">Emmanuel Bouadi — Data Analyst, Wave</span>
      </div>
    </div>
  );
}
