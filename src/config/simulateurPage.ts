/**
 * Libellés de la page Simulateur qui ne sont pas des contenus éditoriaux : intitulés des champs, mentions d'action et titres de blocs ajoutés
 * par la refonte. Les textes de la page (promesse, couverture de l'examen, fonctionnalités, forfaits, étapes, FAQ, essai gratuit, liste
 * d'attente) restent pilotés par le contenu `page.simulateur` (administration). Les prix affichés viennent du serveur (forfaits en vente).
 */
export const SIMULATEUR_UI = {
  trial: { name: "Nom et prénom", email: "E-mail", phone: "Téléphone / WhatsApp" },
  waitlist: {
    name: "Nom et prénom", email: "E-mail", phone: "Téléphone / WhatsApp", company: "Entreprise ou école",
    plan: "Forfait qui vous intéresse", horizon: "Date d'examen envisagée", context: "Votre niveau et vos outils",
  },
  optional: "facultatif",
  requiredNote: "* Champs obligatoires",
  buy: "Acheter ce forfait",
  joinWaitlist: "Rejoindre la liste d'attente",
  quote: "Demander un devis",
  quoteHref: "/entreprises",
  /** Un forfait « sur devis » n'est jamais en vente en ligne. */
  quoteCode: "ENTREPRISE",
  weightLabel: "de l'examen",
  closingTitle: "Mesurez votre niveau avant le jour de l'examen.",
  closingMore: "Voir les forfaits",
} as const;
