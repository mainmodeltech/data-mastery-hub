/**
 * Libellés de la page Formations qui ne sont pas des contenus éditoriaux du catalogue : intitulés des boutons, mentions de réassurance déjà
 * publiées dans la FAQ (moyens de paiement, facture entreprise) et blocs d'aide à la décision. Les titres, le parcours en étapes, la FAQ et le
 * quiz restent pilotés par le contenu `page.formations` (administration). Ces valeurs servent aussi de repli quand ce contenu est indisponible.
 */
export const FORMATIONS_UI = {
  heroFallbackTitle: "Nos formations",
  apply: "Candidater",
  applyNext: "Candidater à la prochaine cohorte",
  notify: "Être prévenu de la prochaine date",
  notifyShort: "Être prévenu",
  seeProgram: "Voir le programme",
  browse: "Voir toutes les formations",
  full: "Complet",
  cohortsTitle: "Prochaines cohortes",
  cohortsHint: "Plus la barre monte, plus la cohorte se remplit.",
  noCohort: "Aucune cohorte n'est ouverte pour le moment.",
  noCohortAction: "Dites-nous ce qui vous intéresse, nous vous prévenons dès l'ouverture.",
  reassurance: {
    payment: "Paiement par Wave, Orange Money ou virement",
    invoice: "Facture entreprise sur demande",
  },
  help: {
    title: "Pas encore décidé ? Faites-vous accompagner.",
    quiz: { title: "Le quiz d'orientation", text: "Deux minutes pour trouver la formation qui correspond à votre métier et à votre objectif." },
    advisor: { title: "Parler à un conseiller", text: "Posez vos questions sur le contenu, le financement ou le rythme : nous répondons vite.", cta: "Écrire sur WhatsApp", fallbackCta: "Nous contacter" },
    team: { title: "Former votre équipe", text: "Bon de commande et facture entreprise sur demande, sessions adaptées à vos équipes.", cta: "Voir l'offre entreprises" },
  },
  photosCaption: "Une cohorte Model Technologie, en salle à Dakar.",
  testimonialsTitle: "Ils ont suivi nos formations",
  moreFilters: "Plus de critères",
  filters: { domain: "Domaine", role: "Votre métier", level: "Niveau", format: "Format", deliveredBy: "Dispensé par", all: "Tous", reset: "Réinitialiser" },
  closing: { title: "Votre place se prépare maintenant.", other: "Voir les autres dates" },
} as const;
