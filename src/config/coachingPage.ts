/**
 * Libellés de la page Coaching et de sa demande qui ne sont pas des contenus éditoriaux : intitulés des champs, mentions d'action et titres
 * de blocs ajoutés par la refonte. Les textes de la page (promesse, formules, tarifs, déroulé, coach, FAQ) restent pilotés par le contenu
 * `page.coaching` (administration) ; les coordonnées viennent de `site.company`.
 */
export const COACHING_UI = {
  reserve: "Réserver",
  slotFull: "complet",
  closingTitle: "Avançons sur votre fichier.",
  closing: { call: "Appeler", whatsapp: "WhatsApp" },
  form: {
    title: "Demander un coaching",
    intro:
      "Décrivez votre besoin. Notre responsable pédagogique étudie votre demande avec le formateur le plus adapté, puis revient vers vous avec une proposition et un lien de paiement.",
    noPayment: "Aucun paiement n'est demandé maintenant.",
    name: "Nom et prénom",
    email: "E-mail",
    phone: "Téléphone / WhatsApp",
    company: "Entreprise",
    tier: "Formule souhaitée",
    slot: "Créneau souhaité",
    message: "Votre besoin",
    messagePlaceholder: "Votre objectif, votre niveau, ce que vous voulez accomplir…",
    optional: "facultatif",
    requiredNote: "* Champs obligatoires",
    submit: "Envoyer ma demande",
  },
} as const;
