// Initialisation de Google Analytics (chargée comme fichier du site pour que la politique de sécurité
// de contenu n'ait pas à autoriser les scripts « en ligne »). Le script gtag.js est chargé par index.html.
//
// Consentement : la mesure d'audience est DÉSACTIVÉE par défaut. Rien n'est configuré ni envoyé tant que le visiteur n'a pas accepté
// (bandeau cookies, voir src/lib/cookieConsent.ts, qui mémorise le choix sous « mt_cookie_consent »). Un refus ou un retrait coupe la
// mesure et efface les cookies Google Analytics.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

var MT_GA_ID = 'G-45P642SK03';

gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('js', new Date());

var mtConfigured = false;

window.mtEnableAnalytics = function () {
  window['ga-disable-' + MT_GA_ID] = false;
  gtag('consent', 'update', { analytics_storage: 'granted' });
  if (!mtConfigured) { gtag('config', MT_GA_ID); mtConfigured = true; }
};

window.mtDisableAnalytics = function () {
  window['ga-disable-' + MT_GA_ID] = true;
  gtag('consent', 'update', { analytics_storage: 'denied' });
  // Efface les cookies de mesure déjà déposés (_ga, _ga_XXXX, _gid) sur ce domaine et ses parents
  var host = location.hostname.split('.');
  document.cookie.split(';').forEach(function (c) {
    var name = c.split('=')[0].trim();
    if (name !== '_ga' && name.indexOf('_ga_') !== 0 && name !== '_gid') return;
    for (var i = 0; i < host.length - 1; i++) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + host.slice(i).join('.');
    }
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });
};

try {
  var saved = JSON.parse(localStorage.getItem('mt_cookie_consent') || 'null');
  if (saved && saved.analytics === true) window.mtEnableAnalytics();
} catch (e) { /* choix illisible : on reste sans mesure */ }
