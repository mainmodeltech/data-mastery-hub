/**
 * Réinitialisation du mot de passe — route /admin/reset-password?token=<uuid>
 * (lien reçu par e-mail). Appelle POST /auth/reset-password.
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { authService } from "@/services/api/authService";
import { ApiError } from "@/services/httpClient";
import { AuthCardLayout } from "@/components/layouts/AuthCardLayout";
import { Button } from "@/components/shared";

const fieldClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white py-3.5 pl-11 pr-12 font-sans text-base text-ink outline-none focus:border-navy";

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Pas de token dans l'URL : rien à réinitialiser
  useEffect(() => {
    if (!token) navigate("/connexion", { replace: true });
  }, [token, navigate]);

  // Après succès, retour automatique vers la connexion
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/connexion"), 3000);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 10) {
      setError("Le mot de passe doit contenir au moins 10 caractères (12 pour le personnel).");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      // Le serveur explique le refus (mot de passe trop courant, trop court…) ou signale un lien invalide
      setError(
        err instanceof ApiError && err.status === 400 && err.message && !/^Erreur \d+$/.test(err.message)
          ? err.message
          : "Le lien est invalide ou a expiré. Veuillez faire une nouvelle demande."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  const toggle = (
    <button
      type="button"
      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      onClick={() => setShowPassword((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-navy"
    >
      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );

  return (
    <AuthCardLayout
      title="Nouveau mot de passe"
      description="Choisissez une phrase de passe longue : 10 caractères minimum (12 pour le personnel), sans mot courant."
    >
      {success ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-success" />
          <div>
            <p className="font-semibold text-ink">Mot de passe modifié !</p>
            <p className="mt-1 text-sm text-ink-secondary">Vous allez être redirigé vers la page de connexion…</p>
          </div>
          <Link to="/connexion" className="text-sm font-semibold text-navy">Se connecter maintenant</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-error-bg px-4 py-3 text-sm text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="rp-new" className="text-sm font-semibold text-ink">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
              <input
                id="rp-new"
                type={showPassword ? "text" : "password"}
                required
                minLength={10}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
              />
              {toggle}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rp-confirm" className="text-sm font-semibold text-ink">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
              <input
                id="rp-confirm"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
              />
            </div>
          </div>

          {confirmPassword && (
            <p className={`text-xs ${newPassword === confirmPassword ? "text-success" : "text-error"}`}>
              {newPassword === confirmPassword
                ? "✓ Les mots de passe correspondent"
                : "✗ Les mots de passe ne correspondent pas"}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="rounded-xl"
            disabled={loading || newPassword !== confirmPassword}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Définir le nouveau mot de passe"}
          </Button>

          <Link to="/admin/forgot-password" className="text-center text-sm text-ink-secondary hover:text-navy">
            Demander un nouveau lien
          </Link>
        </form>
      )}
    </AuthCardLayout>
  );
};

export default AdminResetPassword;
