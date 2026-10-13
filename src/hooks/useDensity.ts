/**
 * Densité d'affichage du back-office et de l'espace apprenant.
 *
 * Tout le design est en rem : changer la taille de base de la page (html) réduit ou agrandit l'ensemble de façon homogène,
 * sans toucher aux points de rupture responsive (qui restent calés sur 16 px). Le choix est propre à chaque navigateur.
 * Le site public n'est pas concerné.
 */
import { useCallback, useEffect, useState } from "react";

export type Density = "compact" | "standard" | "large";

export const DENSITIES: { value: Density; label: string; hint: string }[] = [
  { value: "compact", label: "Compact", hint: "Comme un zoom navigateur à 80 %" },
  { value: "standard", label: "Standard", hint: "Recommandé" },
  { value: "large", label: "Confortable", hint: "Taille d'origine" },
];

const KEY = "mt_density";
const DEFAULT: Density = "standard";

function read(): Density {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "compact" || v === "standard" || v === "large") return v;
  } catch { /* stockage indisponible */ }
  return DEFAULT;
}

/** Applique la densité à la page tant que le composant est affiché (retire l'attribut en quittant : le site public reste inchangé). */
export function useDensity(): { density: Density; setDensity: (d: Density) => void } {
  const [density, setState] = useState<Density>(read);

  useEffect(() => {
    document.documentElement.dataset.density = density;
    return () => { delete document.documentElement.dataset.density; };
  }, [density]);

  const setDensity = useCallback((d: Density) => {
    setState(d);
    try { localStorage.setItem(KEY, d); } catch { /* ignoré */ }
  }, []);

  return { density, setDensity };
}
