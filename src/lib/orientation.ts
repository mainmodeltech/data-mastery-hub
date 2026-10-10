/**
 * Calcul du résultat du quiz d'orientation à partir des règles du contenu `page.orientation`.
 * Les règles sont évaluées dans l'ordre : la première dont une clause (`anyOf`) est satisfaite l'emporte ;
 * une clause est satisfaite quand, pour chaque question citée, la réponse figure dans la liste de valeurs.
 */
export interface OrientationRule {
  result: string;
  anyOf: Record<string, string[]>[];
}

export function computeOrientationResult(
  answers: Record<string, string>,
  rules: OrientationRule[],
  defaultResult: string,
): string {
  for (const rule of rules) {
    const matched = rule.anyOf.some((clause) =>
      Object.entries(clause).every(([questionId, values]) => values.includes(answers[questionId])),
    );
    if (matched) return rule.result;
  }
  return defaultResult;
}
