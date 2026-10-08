/**
 * Bouton « Continuer avec Google » (Google Identity Services).
 * L'ID client vient de GET /auth/options (jamais codé en dur). Le `credential` (ID token) reçu de
 * Google est transmis tel quel au parent, qui l'envoie à POST /auth/google : on ne le stocke ni ne
 * le journalise.
 */
import { useEffect, useRef, useState } from "react";

interface GoogleId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode?: "popup";
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = SCRIPT_SRC;
      el.async = true;
      el.defer = true;
      el.onload = () => resolve();
      el.onerror = () => {
        scriptPromise = null;
        reject(new Error("Google indisponible"));
      };
      document.head.appendChild(el);
    });
  }
  return scriptPromise;
}

export interface GoogleSignInButtonProps {
  clientId: string;
  onCredential: (credential: string) => void;
  /** Le script Google n'a pas pu être chargé (réseau, bloqueur de contenu…) */
  onUnavailable?: () => void;
}

export function GoogleSignInButton({ clientId, onCredential, onUnavailable }: GoogleSignInButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // Callbacks lus au moment de l'appel : évite de réinitialiser Google à chaque rendu du parent
  const handlers = useRef({ onCredential, onUnavailable });
  handlers.current = { onCredential, onUnavailable };

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) handlers.current.onCredential(response.credential);
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          locale: "fr",
          width: Math.min(400, Math.max(200, ref.current.offsetWidth || 400)),
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) handlers.current.onUnavailable?.();
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div
      ref={ref}
      aria-label="Continuer avec Google"
      className={`flex min-h-[44px] w-full justify-center ${ready ? "" : "animate-pulse rounded-xl bg-surface-sand"}`}
    />
  );
}
