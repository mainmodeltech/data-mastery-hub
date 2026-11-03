import { useEffect, type RefObject } from "react";

/**
 * useReveal — fait apparaître les éléments `.reveal` de la page quand ils arrivent dans l'écran (une seule fois).
 * Marque d'abord la page (`data-reveal="on"`) : tant que ce n'est pas fait, rien n'est masqué (pré-rendu, navigateur sans script).
 * Un test de position au défilement (et non un IntersectionObserver) : un saut de page (lien d'ancre, défilement rapide) ne laisse
 * aucun bloc masqué derrière soi. Les blocs qui arrivent plus tard (données de l'API) sont repérés par un MutationObserver.
 * Mouvement réduit : tout est montré sans transition (voir styles/home.css).
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const showAll = () => el.querySelectorAll(".reveal").forEach((t) => t.setAttribute("data-in", ""));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(el, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    el.setAttribute("data-reveal", "on");
    let pending: Element[] = [];
    let frame = 0;

    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.92;
      pending = pending.filter((t) => {
        if (t.getBoundingClientRect().top >= line) return true; // encore sous l'écran
        t.setAttribute("data-in", ""); // visible, ou déjà dépassé
        return false;
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    const scan = () => {
      pending = Array.from(el.querySelectorAll(".reveal:not([data-in])"));
      schedule();
    };

    scan();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      el.removeAttribute("data-reveal");
    };
  }, [root]);
}
