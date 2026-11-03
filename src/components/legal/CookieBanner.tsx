/**
 * CookieBanner — bandeau d'information sur la mesure d'audience. Affiché tant que le visiteur n'a pas choisi, et rouvert par « Gérer mes cookies ».
 * « Refuser » et « Accepter » ont le même poids visuel ; ne rien choisir équivaut à refuser (rien n'est mesuré).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/shared";
import { COOKIE_SETTINGS_EVENT, readChoice, saveChoice } from "@/lib/cookieConsent";

export function CookieBanner() {
  const [open, setOpen] = useState(() => readChoice() === null);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;
  const choose = (analytics: boolean) => { saveChoice(analytics); setOpen(false); };

  return (
    <div role="dialog" aria-label="Cookies" aria-live="polite" className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#D6CEC0] bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">
          Nous utilisons des cookies de <strong>mesure d'audience</strong> pour améliorer le site, uniquement si vous l'acceptez. Les cookies strictement
          nécessaires au fonctionnement ne demandent pas votre accord.{" "}
          <Link to="/confidentialite" className="font-semibold text-navy underline underline-offset-2">En savoir plus</Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button type="button" variant="outline" shape="pill" size="sm" onClick={() => choose(false)}>Refuser</Button>
          <Button type="button" shape="pill" size="sm" onClick={() => choose(true)}>Accepter</Button>
        </div>
      </div>
    </div>
  );
}
