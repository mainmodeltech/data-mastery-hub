/**
 * Libellés des écrans d'authentification (connexion, lien reçu par e-mail, mot de passe oublié) qui ne sont pas des contenus éditoriaux.
 * Les messages d'erreur et d'état viennent des pages et du serveur ; ce fichier ne porte que les blocs ajoutés par la refonte.
 */
export const CONNEXION_UI = {
  newHere: {
    title: "Pas encore inscrit ?",
    text: "Votre compte est créé automatiquement à votre inscription.",
    cta: "Voir les formations",
  },
  link: "Recevoir un lien de connexion par e-mail",
  linkHint: "Sans mot de passe : un lien et un code à 6 chiffres.",
  or: "ou avec votre e-mail",
  help: "Aide",
  panel: {
    nextCohort: "Prochaine cohorte",
    see: "Voir la formation",
  },
} as const;
