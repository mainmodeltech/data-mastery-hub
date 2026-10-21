/**
 * Import des questions d'un quiz depuis un tableau — fonctions pures.
 * Colonnes : Question ; Choix A … Choix H ; Bonne réponse (lettre A-H) ; Explication.
 * Règles : énoncé obligatoire, 2 à 8 choix non vides, une seule bonne réponse pointant un choix rempli.
 * Ajout à la banque existante, jamais de remplacement.
 */
import type { QuizQuestionEdit } from "../../types/authoring.type.ts";
import type { ImportError } from "./programImport.ts";
import { toRecords } from "./sheet.ts";

export interface ParsedQuiz { questions: { line: number; question: QuizQuestionEdit }[]; errors: ImportError[] }

const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function parseQuizRows(rows: string[][]): ParsedQuiz {
  const { headers, records } = toRecords(rows);
  const questions: ParsedQuiz["questions"] = [];
  const errors: ImportError[] = [];

  if (headers.length === 0) return { questions, errors: [{ line: 1, message: "le fichier est vide" }] };
  if (!headers.includes("question") || !headers.includes("bonne reponse") || !headers.includes("choix a") || !headers.includes("choix b")) {
    return { questions, errors: [{ line: 1, message: "colonnes obligatoires : Question, Choix A, Choix B, Bonne réponse" }] };
  }
  if (records.length === 0) return { questions, errors: [{ line: 1, message: "aucune question dans le fichier" }] };

  for (const { line, cells: c } of records) {
    const before = errors.length;
    const err = (message: string) => errors.push({ line, message });
    const text = c["question"] ?? "";
    if (!text) err("l'énoncé est obligatoire");

    const labels = LETTERS.map((l) => c[`choix ${l}`] ?? "");
    if (labels.filter(Boolean).length < 2) err("il faut au moins 2 choix renseignés");

    const answerRaw = (c["bonne reponse"] ?? "").trim();
    const letters = answerRaw.toLowerCase().split(/[\s,;+&/]+/).filter(Boolean);
    let correct = -1;
    if (!answerRaw) err("la bonne réponse est obligatoire (une lettre de A à H)");
    else if (letters.length !== 1) err(`une seule bonne réponse est attendue (reçu "${answerRaw}")`);
    else {
      correct = LETTERS.indexOf(letters[0]);
      if (correct < 0) err(`bonne réponse invalide "${answerRaw}" (une lettre de A à H)`);
      else if (!labels[correct]) err(`la bonne réponse ${letters[0].toUpperCase()} pointe un choix vide`);
    }

    if (errors.length > before) continue;
    questions.push({
      line,
      question: {
        text,
        explanation: c["explication"] || null,
        choices: labels.flatMap((label, i) => (label ? [{ label, correct: i === correct }] : [])),
      },
    });
  }
  return { questions, errors };
}

/** Ajoute les questions importées à la fin de la banque, sans rien remplacer. */
export function applyQuizImport(bank: QuizQuestionEdit[], parsed: ParsedQuiz): QuizQuestionEdit[] {
  return [...bank, ...parsed.questions.map((q) => q.question)];
}
