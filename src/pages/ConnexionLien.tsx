/**
 * ConnexionLien.tsx — route /connexion/lien?token=… : cible du lien de connexion reçu par e-mail.
 * Appelle POST /auth/passwordless/verify {token} UNE seule fois (le jeton est à usage unique, donc
 * les doubles rendus de React ne doivent pas rejouer l'appel), retire le jeton de l'URL, ouvre la
 * session puis redirige selon le rôle (apprenant → /espace, back-office → /admin).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { usePostLoginRedirect } from "@/hooks/usePostLoginRedirect";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/shared/Button";
import { authService } from "@/services/api/authService";
import { ApiError } from "@/services/httpClient";

export default function ConnexionLien() {
  const [params] = useSearchParams();
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
      .then((session) => applySession(session))
      .catch((err) => {
        setError(
          err instanceof ApiError && err.status === 429
            ? err.message || "Trop de tentatives. Réessayez dans quelques minutes."
            : err instanceof ApiError && err.status === 400 && err.message && !/^Erreur \d+$/.test(err.message)
              ? err.message
              : "Lien ou code invalide, expiré ou déjà utilisé."
        );
      });
  }, [applySession]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-10 bg-site-bg px-6 py-12">
      <Link to="/" aria-label="Model Technologie — accueil"><Logo className="h-14" /></Link>
      <div className="my-auto flex max-w-md flex-col items-center gap-5 text-center">
        {error ? (
          <>
            <XCircle className="h-12 w-12 text-error" aria-hidden="true" />
            <h1 className="font-heading text-3xl font-extrabold text-navy">Connexion impossible</h1>
            <p role="alert" className="text-ink-secondary">{error}</p>
            <Button asChild variant="primary" shape="pill"><Link to="/connexion">Retour à la connexion</Link></Button>
          </>
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-navy" aria-hidden="true" />
            <h1 className="font-heading text-2xl font-extrabold text-navy">Connexion en cours…</h1>
          </>
        )}
      </div>
    </div>
  );
}
