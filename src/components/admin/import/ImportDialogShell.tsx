/**
 * Parcours commun des imports en masse : choix du fichier -> aperçu -> rapport d'erreurs ligne par ligne.
 * « Appliquer » reste désactivé tant qu'il y a une erreur (rien n'est appliqué partiellement).
 */
import { useRef, useState, type ReactNode } from "react";
import { Download, FileUp } from "lucide-react";

import { Button } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { readSpreadsheet } from "@/lib/import/sheet";
import type { ImportError } from "@/lib/import/programImport";

export interface Analysis {
  errors: ImportError[];
  /** Nombre d'éléments qui seront ajoutés (0 = rien à appliquer). */
  count: number;
  preview: ReactNode;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Chemin du modèle sans extension : proposé en .xlsx et en .csv. */
  templateBase: string;
  analyse: (rows: string[][]) => Analysis;
  onApply: () => void;
  applyLabel: string;
}

export function ImportDialogShell({ open, onOpenChange, title, description, templateBase, analyse, onApply, applyLabel }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const reset = () => {
    setFileName(null);
    setResult(null);
    setReadError(null);
    if (input.current) input.current.value = "";
  };

  const handleFile = async (file: File | undefined) => {
    reset();
    if (!file) return;
    setFileName(file.name);
    try {
      setResult(analyse(await readSpreadsheet(file)));
    } catch (e) {
      setReadError(e instanceof Error ? e.message : "Impossible de lire ce fichier.");
    }
  };

  const blocked = !result || result.errors.length > 0 || result.count === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <input ref={input} type="file" accept=".xlsx,.xls,.csv,.txt" className="sr-only" aria-label="Fichier à importer" onChange={(e) => void handleFile(e.target.files?.[0])} />
          <Button type="button" variant="navy" shape="rounded" size="sm" onClick={() => input.current?.click()}>
            <FileUp className="h-4 w-4" /> Choisir un fichier
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-secondary">
            <Download className="h-4 w-4" /> Modèle :
            <a href={`${templateBase}.xlsx`} download className="font-semibold text-navy underline">Excel</a>
            <a href={`${templateBase}.csv`} download className="font-semibold text-navy underline">CSV</a>
          </span>
          {fileName && <span className="text-sm text-ink-secondary">{fileName}</span>}
        </div>

        {readError && <div role="alert" className="rounded-card bg-error-bg px-4 py-3 text-sm text-error">{readError}</div>}

        {result && result.errors.length > 0 && (
          <div role="alert" className="flex flex-col gap-2 rounded-card bg-error-bg px-4 py-3 text-sm text-error">
            <p className="font-bold">
              {result.errors.length} erreur{result.errors.length > 1 ? "s" : ""} : corrigez le fichier puis choisissez-le à nouveau. Rien n'est ajouté tant qu'il reste une erreur.
            </p>
            <ul className="max-h-48 list-disc overflow-y-auto pl-5">
              {result.errors.map((er, i) => <li key={i}>Ligne {er.line} : {er.message}</li>)}
            </ul>
          </div>
        )}

        {result && result.errors.length === 0 && result.count > 0 && (
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-card border border-[#E7E0D4] px-4 py-3 text-sm">
            <p className="font-bold text-navy">Aperçu : ce qui sera ajouté</p>
            {result.preview}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" variant="primary" shape="rounded" size="sm" disabled={blocked} onClick={() => { onApply(); reset(); onOpenChange(false); }}>
            {applyLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
