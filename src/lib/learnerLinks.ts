/** Destination d'un « À faire » de l'espace apprenant : l'identifiant du serveur encode sa nature (pay-, quiz-, project-). */
export function todoHref(id: string): string {
  if (id.startsWith("pay-")) return "/espace/paiements";
  if (id.startsWith("project-")) return `/espace/formations/${id.slice("project-".length)}/evaluations`;
  if (id.startsWith("quiz-")) return "/espace/evaluations";
  return "/espace";
}
