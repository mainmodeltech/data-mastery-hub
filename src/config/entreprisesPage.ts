/**
 * Libellés de la page Entreprises qui ne sont pas des contenus éditoriaux : intitulés des champs du formulaire, titres de blocs ajoutés par la
 * refonte et mentions d'action. Les textes de la page (promesse, offres, méthode, services, étude de cas, formulaire) restent pilotés par le
 * contenu `page.entreprises` (administration) ; les coordonnées viennent de `site.company`.
 */
export const ENTREPRISES_UI = {
  form: {
    name: "Nom et prénom",
    role: "Fonction",
    company: "Entreprise",
    people: "Personnes à former",
    email: "E-mail professionnel",
    phone: "Téléphone / WhatsApp",
    need: "Besoin principal",
    context: "Votre contexte",
    optional: "facultatif",
    requiredNote: "* Champs obligatoires",
  },
  trust: { alumni: "Nos alumni travaillent chez" },
  testimonialsTitle: "Des professionnels formés chez nous",
  methodCta: "Demander mon diagnostic gratuit",
  closing: {
    title: "Un premier échange suffit pour cadrer votre besoin.",
    apply: "Demander un diagnostic",
    call: "Appeler",
    whatsapp: "WhatsApp",
    write: "Écrire",
  },
} as const;
