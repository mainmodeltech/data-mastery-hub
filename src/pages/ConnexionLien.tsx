/**
 * ConnexionLien.tsx — route /connexion/lien?token=… : cible du lien de connexion reçu par e-mail.
 * Appelle POST /auth/passwordless/verify {token} UNE seule fois (le jeton est à usage unique, donc
 * les doubles rendus de React ne doivent pas rejouer l'appel), retire le jeton de l'URL, ouvre la
 * session puis redirige selon le rôle (apprenant → /espace, back-office → /admin).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { Button } from "@/components/shared/Button";
import { authService } from "@/services/api/authService";
import { ApiError } from "@/services/httpClient";

export default function ConnexionLien() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applySession } = useAuth();
  usePostLoginRedirect();
  const [error, setError] = useState<string | null>(null);
  // Le jeton est lu une fois puis effacé de l'URL ; la ref empêche un second appel (StrictMode, re-rendu)
  const token = useRef(params.get("token"));
  const started = useRef(false);

  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
    if (started.current) return;
    started.current = true;
    const value = token.current;
    if (!value) {
      setError("Ce lien est incomplet. Ouvrez-le depuis l'e-mail reçu, ou demandez-en un nouveau.");
      return;
    }
    authService
      .verifyLogin({ token: value })
      // Personnel : le lien prouve l'identité, le second facteur reste à valider sur la page de connexion
      .then((session) => { if (applySession(session) === "mfa") navigate("/connexion", { replace: true }); })
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 429
            ? err.message || "Trop de tentatives. Réessayez dans quelques minutes."
            : err instanceof ApiError && err.status === 400 && err.message && !/^Erreur \d+$/.test(err.message)
              ? err.message
              : "Lien ou code invalide, expiré ou déjà utilisé."
        );
      });
  }, [applySession, navigate]);

  return (
    <AuthShell>
      {error ? (
        <div className="flex flex-col items-start gap-4">
          <XCircle className="h-12 w-12 text-error" aria-hidden="true" />
          <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.5rem]">Connexion impossible</h1>
          <p role="alert" className="text-base text-ink-secondary">{error}</p>
          <Button asChild variant="primary" shape="pill" size="lg" className="home-press"><Link to="/connexion">Retour à la connexion</Link></Button>
        </div>
      ) : (
        <div role="status" className="flex flex-col items-start gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-navy motion-reduce:animate-none" aria-hidden="true" />
          <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.5rem]">Connexion en cours…</h1>
        </div>
      )}
    </AuthShell>
  );
}
