/**
 * siteContent.ts — faits métier du site qui n'ont pas (encore) de back-office.
 *
 * Tant qu'une valeur est `null`, le site n'affiche AUCUN texte à compléter : le tarif devient
 * « Sur devis » et les blocs sans contenu (nom du coach, témoignage, atelier) sont masqués.
 * Renseigner une valeur ici suffit à la publier ; à terme ces champs rejoindront un module
 * « Paramètres du site » du back-office.
 */

/** Tarifs du coaching individuel (format libre, ex. « 30 000 FCFA »). */
export const COACHING_PRICES: { deblocage: string | null; progression: string | null; projet: string | null } = {
  deblocage: null,
  progression: null,
  projet: null,
};

/** Coach affiché sur la page Coaching. */
export const COACH: { name: string | null } = { name: null };

/** Témoignage d'un participant au coaching individuel. */
export const COACHING_TESTIMONIAL: { quote: string; author: string } | null = null;

/** Prochain atelier gratuit en ligne (page Ressources). */
export const NEXT_WORKSHOP: { title: string; date: string; time: string } | null = null;

/** Étude de cas client affichée sur la page Entreprises. */
export const CLIENT_CASE: { name: string; sector: string; size: string; need: string; result: string } | null = null;
