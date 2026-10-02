/**
 * Connexion.tsx — Lot 3 (docs/design/README.md §2, screens/app/App-Connexion.dc.html
 * + M-Connexion.dc.html). Point d'entrée unique pour tous les rôles : l'e-mail +
 * mot de passe passent par le login JWT existant (useAuth.signIn), puis redirection
 * selon le rôle (personnel → /admin, apprenant → /espace).
 *
 * Google OAuth, lien de connexion par e-mail et code WhatsApp dépendent du backend
 * `feature/learner-accounts` (pas encore livré) : affichés mais marqués "en cours".
 */
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, MessageCircle, Play } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/shared/Button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ComingSoonLink } from "@/components/layouts/ComingSoonLink";
import { hasAnyRole, homePathForRoles, LEARNER_ROLES, STAFF_ROLES } from "@/lib/roles";

const fieldClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white px-4 py-3.5 font-sans text-base text-ink outline-none focus:border-navy";

export default function Connexion() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    const canReturn =
      from &&
      ((from.startsWith("/admin") && hasAnyRole(user.roles, STAFF_ROLES)) ||
        (from.startsWith("/espace") && hasAnyRole(user.roles, LEARNER_ROLES)));
    navigate(canReturn ? from : homePathForRoles(user.roles), { replace: true });
  }, [user, location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    }
    // Succès : l'effet ci-dessus redirige dès que `user` est dérivé du JWT.
  };

  return (
    <div className="grid min-h-screen bg-site-bg lg:grid-cols-2">
      <div className="flex flex-col gap-10 px-6 py-8 lg:px-24 lg:py-12">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-navy font-heading text-xl font-extrabold text-white lg:h-10 lg:w-10 lg:rounded-[10px]">
            M
          </span>
          <span className="font-heading text-lg font-bold text-navy">
            Model<span className="text-cta">Technologie</span>
          </span>
        </Link>

        <form onSubmit={handleSubmit} className="my-auto flex w-full max-w-[440px] flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[32px] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[44px]">
              Bon retour parmi nous
            </h1>
            <p className="text-base text-ink-secondary lg:text-[17px]">
              Connectez-vous pour reprendre votre formation.
            </p>
          </div>

          <ComingSoonLink
            title="Connexion avec Google"
            className="w-full justify-center rounded-xl border border-[#D6CEC0] bg-white px-4 py-3.5 font-sans text-base font-semibold text-ink"
          >
            <span className="text-lg font-extrabold text-[#4285F4]">G</span>
            Continuer avec Google
          </ComingSoonLink>

          <div className="flex items-center gap-3 text-[13px] text-ink-secondary">
            <span className="h-px flex-1 bg-[#E7E0D4]" />
            ou avec votre e-mail
            <span className="h-px flex-1 bg-[#E7E0D4]" />
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

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
              <Link to="/admin/forgot-password" className="text-sm font-semibold">Mot de passe oublié ?</Link>
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

          <ComingSoonLink title="Lien de connexion par e-mail" className="justify-center text-[15px] font-semibold text-navy">
            Recevoir un lien de connexion par e-mail
          </ComingSoonLink>
          <ComingSoonLink title="Code par WhatsApp" className="justify-center text-[15px] font-semibold text-navy lg:hidden">
            <MessageCircle className="h-5 w-5 text-success" />
            Recevoir un code par WhatsApp
          </ComingSoonLink>

          <p className="text-center text-sm text-ink-secondary">
            Pas encore de compte ? Il est créé automatiquement à votre inscription.{" "}
            <Link to="/formations" className="font-semibold">Voir les formations</Link>
          </p>
        </form>

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
