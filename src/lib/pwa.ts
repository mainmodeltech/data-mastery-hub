/**
 * pwa.ts — rend le site installable (manifeste + service worker) en production uniquement.
 * Le lien du manifeste et la couleur de thème sont ajoutés ici pour ne pas dépendre d'index.html.
 */
export function registerPwa(): void {
  if (!import.meta.env.PROD || typeof window === "undefined") return;

  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/manifest.webmanifest";
    document.head.appendChild(link);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#1A3A5B";
    document.head.appendChild(meta);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* installation impossible (navigateur ou contexte non sécurisé) : le site fonctionne normalement */
      });
    });
  }
}
