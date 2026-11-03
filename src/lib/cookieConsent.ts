/**
 * cookieConsent.ts — choix du visiteur sur la mesure d'audience (Google Analytics).
 * Les cookies strictement nécessaires (session, sécurité) n'ont pas besoin d'accord. La mesure d'audience est DÉSACTIVÉE tant que le visiteur n'a
 * pas accepté ; un refus (ou un retrait ultérieur) la coupe et efface les cookies de mesure. Le choix est mémorisé dans le navigateur.
 * `public/gtag-init.js` lit le même choix au chargement et expose `window.mtEnableAnalytics` / `window.mtDisableAnalytics`.
 */

const KEY = "mt_cookie_consent";
export const COOKIE_SETTINGS_EVENT = "mt:cookie-settings";

export interface CookieChoice { analytics: boolean; at: string }

declare global {
  interface Window { mtEnableAnalytics?: () => void; mtDisableAnalytics?: () => void }
}

export function readChoice(): CookieChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieChoice>;
    return typeof parsed.analytics === "boolean" ? { analytics: parsed.analytics, at: parsed.at ?? "" } : null;
  } catch {
    return null;   // navigateur sans stockage : on redemandera, sans mesure d'audience
  }
}

/** Mémorise le choix et applique ses effets tout de suite (sans recharger la page). */
export function saveChoice(analytics: boolean): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ analytics, at: new Date().toISOString() }));
  } catch { /* stockage indisponible : le choix vaut pour cette page seulement */ }
  if (analytics) window.mtEnableAnalytics?.();
  else window.mtDisableAnalytics?.();
}

/** Rouvre le bandeau (lien « Gérer mes cookies »). */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
