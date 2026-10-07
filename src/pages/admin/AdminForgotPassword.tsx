/**
 * Demande de réinitialisation de mot de passe — route /admin/forgot-password
 * (lien depuis /connexion). Appelle POST /auth/forgot-password.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, Mail } from "lucide-react";

import { authService } from "@/services/api/authService";
import { AuthCardLayout } from "@/components/layouts/AuthCardLayout";
import { Button } from "@/components/shared";

const fieldClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white py-3.5 pl-11 pr-4 font-sans text-base text-ink outline-none focus:border-navy";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true); // Toujours confirmer (anti-énumération de comptes)
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      title="Mot de passe oublié"
      description="Saisissez votre e-mail pour recevoir un lien de réinitialisation."
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-success" />
          <div>
            <p className="font-semibold text-ink">E-mail envoyé !</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Si un compte est associé à <strong className="text-ink">{email}</strong>, vous recevrez un lien de
              réinitialisation dans quelques minutes. Pensez à vérifier vos spams.
            </p>
          </div>
          <Link to="/connexion" className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label htmlFor="fp-mail" className="text-sm font-semibold text-ink">Adresse e-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
              <input
                id="fp-mail"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={fieldClass}
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Envoyer le lien de réinitialisation"}
          </Button>
          <Link to="/connexion" className="inline-flex items-center justify-center gap-1 text-sm text-ink-secondary hover:text-navy">
            <ArrowLeft className="h-3 w-3" />
            Retour à la connexion
          </Link>
        </form>
      )}
    </AuthCardLayout>
  );
};

export default AdminForgotPassword;
