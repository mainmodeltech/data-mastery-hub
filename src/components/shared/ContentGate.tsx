/**
 * ContentGate — affiche le contenu éditorial d'une page quand il est disponible, sinon un état de chargement
 * ou d'erreur (avec « Réessayer »). Aucune donnée de remplacement n'est inventée côté front.
 */
import type { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ContentGateProps<T> {
  content: T | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  children: (content: T) => ReactNode;
}

export function ContentGate<T>({ content, isLoading, isError, onRetry, children }: ContentGateProps<T>) {
  if (content !== undefined && content !== null) return <>{children(content)}</>;

  if (isLoading && !isError) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[50vh] items-center justify-center px-6 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-navy" aria-label="Chargement" />
      </div>
    );
  }

  return (
    <div role="alert" className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-heading text-lg font-bold text-navy">Cette page est momentanément indisponible.</p>
      <p className="text-sm text-ink-secondary">Le contenu n'a pas pu être chargé. Vérifiez votre connexion puis réessayez.</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> Réessayer
        </Button>
      )}
    </div>
  );
}
