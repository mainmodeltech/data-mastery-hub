// Widget de discussion Tawk.to (chargé comme fichier du site : voir gtag-init.js).
//
// Tawk.to est un script tiers qui a accès à toute la page. Il n'est donc chargé que sur les pages
// publiques de présentation : jamais sur la connexion, les mots de passe, les liens de paiement, les
// certificats, ni dans l'espace apprenant et le back-office. Les liens vers ces pages sont des liens
// ordinaires (rechargement complet) pour que le widget ne reste pas en mémoire quand on y arrive.
(function () {
  var PRIVATE = /^\/(admin|espace|connexion|mot-de-passe-oublie|reinitialiser-mot-de-passe|paiement|newsletter|certificats)(\/|$)/;
  if (PRIVATE.test(window.location.pathname)) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  var s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/69cd3c944cdcf71c377f4a55/1jl4r98ue';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();
