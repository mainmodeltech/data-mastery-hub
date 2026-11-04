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
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAuthOptions } from "@/hooks/useAuthOptions";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { Button } from "@/components/shared/Button";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MfaEnrollPanel, MfaVerifyPanel } from "@/components/auth/MfaPanels";
import { CONNEXION_UI as UI } from "@/config/connexionPage";
import { authService } from "@/services/api/authService";
import { ApiError } from "@/services/httpClient";

const fieldClass =
  "min-h-12 w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3 font-sans text-base text-ink focus-visible:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

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
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" shape="pill" size="lg" onClick={() => goTo("link-request")} className="home-press w-full">
        {UI.link}
      </Button>
      <p className="text-center text-base text-ink-secondary">{UI.linkHint}</p>
    </div>
  );

  return (
    <AuthShell>
      {pendingMfa?.kind === "verify" && <MfaVerifyPanel />}
      {pendingMfa?.kind === "enroll" && <MfaEnrollPanel />}

      {!pendingMfa && view === "password" && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy md:text-[2.5rem] lg:text-[2.75rem]">
              Bon retour parmi nous
            </h1>
            <p className="text-base text-ink-secondary lg:text-[1.0625rem]">
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
                <p className="text-center text-base text-ink-secondary">{UI.or}</p>
              )}
            </>
          )}

          {expired && !error && (
            <div role="status" className="rounded-xl bg-warning-bg px-4 py-3 text-base text-warning">
              Votre session a expiré ou a été fermée. Reconnectez-vous pour continuer.
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">
              {error}
            </div>
          )}

          {passwordEnabled ? (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="l-mail" className="text-base font-semibold text-ink">E-mail</label>
                <input
                  id="l-mail"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label htmlFor="l-pw" className="text-base font-semibold text-ink">Mot de passe</label>
                  <Link to="/mot-de-passe-oublie" className="text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">Mot de passe oublié ?</Link>
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

              <Button type="submit" variant="primary" shape="pill" size="lg" className="home-press w-full" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
              </Button>
            </form>
          ) : (
            loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />
          )}

          {linkEnabled && linkButton}

          <div className="mt-2 flex flex-col items-start gap-3 rounded-2xl bg-surface-sand p-5">
            <p className="font-heading text-lg font-bold text-navy">{UI.newHere.title}</p>
            <p className="text-base text-ink-secondary">{UI.newHere.text}</p>
            <Button asChild variant="navy" shape="pill" className="home-press">
              <Link to="/formations">{UI.newHere.cta}</Link>
            </Button>
          </div>
        </>
      )}

      {!pendingMfa && view === "link-request" && (
        <form onSubmit={sendLink} className="flex flex-col gap-5">
          <button type="button" onClick={() => goTo("password")} className="flex min-h-11 w-fit items-center gap-1.5 text-base font-semibold text-navy">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.5rem]">
              Recevoir un lien de connexion
            </h1>
            <p className="text-base text-ink-secondary">
              Nous vous envoyons un lien et un code à 6 chiffres, valables 10 minutes. Aucun mot de passe nécessaire.
            </p>
          </div>
          {error && <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">{error}</div>}
          <div className="flex flex-col gap-2">
            <label htmlFor="ll-mail" className="text-base font-semibold text-ink">E-mail</label>
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
          <Button type="submit" variant="primary" shape="pill" size="lg" className="home-press w-full" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer le lien et le code"}
          </Button>
        </form>
      )}

      {!pendingMfa && view === "link-code" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-5">
          <button type="button" onClick={() => goTo("link-request")} className="flex min-h-11 w-fit items-center gap-1.5 text-base font-semibold text-navy">
            <ArrowLeft className="h-4 w-4" /> Changer d'adresse
          </button>
          <div className="flex flex-col gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-success-bg">
              <MailCheck className="h-6 w-6 text-success" />
            </span>
            <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.5rem]">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-base text-ink-secondary">
              Si un compte correspond à <strong className="text-ink">{email}</strong>, vous y avez reçu un message.
              Entrez le code reçu ou cliquez sur le lien.
            </p>
          </div>
          {error && <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-base text-error">{error}</div>}
          <div className="flex flex-col gap-2">
            <label htmlFor="lc-code" className="text-base font-semibold text-ink">Code à 6 chiffres</label>
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
          <Button type="submit" variant="primary" shape="pill" size="lg" className="home-press w-full" disabled={loading || code.length !== 6}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
          </Button>
          <button
            type="button"
            disabled={resendIn > 0 || loading}
            onClick={() => void sendLink()}
            className="text-center text-[0.9375rem] font-semibold text-navy enabled:hover:underline disabled:text-ink-secondary"
          >
            {resendIn > 0 ? `Renvoyer un lien dans ${resendIn} s` : "Renvoyer un lien et un code"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
