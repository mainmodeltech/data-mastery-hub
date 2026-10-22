/** Import d'un programme (modules / leçons) depuis un fichier Excel ou CSV : aperçu, rapport d'erreurs, ajout à l'état local. */
import { useRef } from "react";

import { applyProgramImport, lessonTypeLabel, parseProgramRows, previewProgramImport, type ParsedProgram } from "@/lib/import/programImport";
import type { CourseModule } from "@/types/course.type";
import { ImportDialogShell, type Analysis } from "./ImportDialogShell";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: CourseModule[];
  /** Reçoit les modules complets après ajout (l'utilisateur enregistre ensuite le programme). */
  onApply: (modules: CourseModule[]) => void;
}

export function ImportProgramDialog({ open, onOpenChange, modules, onApply }: Props) {
  const parsed = useRef<ParsedProgram | null>(null);

  const analyse = (rows: string[][]): Analysis => {
    const p = parseProgramRows(rows);
    parsed.current = p;
    const preview = previewProgramImport(modules, p);
    return {
      errors: p.errors,
      count: p.lessons.length,
      preview: (
        <>
          <p>{p.lessons.length} leçon{p.lessons.length > 1 ? "s" : ""} en brouillon, dans {preview.length} module{preview.length > 1 ? "s" : ""}.</p>
          <ul className="flex flex-col gap-2">
            {preview.map((m) => (
              <li key={m.title}>
                <span className="font-bold">{m.title}</span>{" "}
                <span className="text-ink-secondary">{m.isNew ? "(nouveau module)" : "(module existant : leçons ajoutées à la suite)"}</span>
                <ul className="list-disc pl-5">
                  {m.lessons.map((l, i) => <li key={i}>{l.title} <span className="text-ink-secondary">· {lessonTypeLabel(l.type)}</span></li>)}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ),
    };
  };

  return (
    <ImportDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Importer un programme"
      description="Un fichier Excel (.xlsx) ou CSV, une ligne par leçon. Les éléments sont ajoutés au programme actuel sans rien remplacer ; pensez à enregistrer ensuite."
      templateBase="/modeles/modele-programme"
      analyse={analyse}
      applyLabel="Ajouter au programme"
      onApply={() => { if (parsed.current) onApply(applyProgramImport(modules, parsed.current)); }}
    />
  );
}
