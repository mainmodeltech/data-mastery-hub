import { useEffect, useState, type RefObject } from "react";

/**
 * useStickyHidden — pilote l'affichage d'une barre d'appel fixe : elle reste cachée tant qu'un des éléments `hideWhenVisible` est à l'écran
 * (le haut de page propose déjà l'action) et disparaît pour de bon à partir de `hideFrom` (bandeau de fin : visible ou déjà dépassé).
 * Cachée par défaut : sans IntersectionObserver, la barre ne s'affiche pas.
 */
export function useStickyHidden(hideWhenVisible: RefObject<HTMLElement | null>[], hideFrom: RefObject<HTMLElement | null>): boolean {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const from = hideFrom.current;
    const els = [...hideWhenVisible.map((r) => r.current), from].filter((e): e is HTMLElement => e !== null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting || (e.target === from && e.boundingClientRect.top < 0));
      setHidden([...seen.values()].some(Boolean));
    });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [hideWhenVisible, hideFrom]);

  return hidden;
}
