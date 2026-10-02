/**
 * Entrée de navigation désactivée : badge "en cours" + popup "bientôt disponible".
 * Remplace un <Link> tant que la page cible n'est pas prête.
 */
import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/shared/Button";

export interface ComingSoonLinkProps {
  title: string;
  className?: string;
  badge?: boolean;
  onOpen?: () => void;
  children: ReactNode;
}

export function ComingSoonLink({ title, className, badge = true, onOpen, children }: ComingSoonLinkProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-2 ${className ?? ""}`}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        {children}
        {badge && (
          <span className="rounded-pill bg-warning-bg px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-warning">
            en cours
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-callout">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold text-navy">{title} — bientôt disponible</DialogTitle>
            <DialogDescription className="text-ink-secondary">
              Cette section est en cours de préparation. Revenez très bientôt !
            </DialogDescription>
          </DialogHeader>
          <Button variant="primary" shape="pill" onClick={() => setOpen(false)} className="w-fit">
            Compris
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
