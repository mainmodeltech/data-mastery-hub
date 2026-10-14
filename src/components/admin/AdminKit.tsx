/**
 * AdminKit — petits éléments d'interface partagés par les pages du backoffice (design system).
 * Champs de formulaire, interrupteur, confirmation de suppression, état vide.
 */
import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-[#D6CEC0] bg-white px-3.5 py-2.5 font-sans text-[0.9375rem] text-ink outline-none placeholder:text-ink-secondary/60 focus:border-navy disabled:bg-app-bg disabled:text-ink-secondary";

export function Field({
  label, hint, htmlFor, className, children,
}: { label: string; hint?: string; htmlFor?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {hint && <span className="text-xs text-ink-secondary">{hint}</span>}
    </div>
  );
}

export function SwitchRow({
  label, description, checked, onChange, disabled,
}: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[#E7E0D4] bg-white px-4 py-3", disabled && "opacity-60")}>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {description && <span className="text-xs text-ink-secondary">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2",
          checked ? "bg-success" : "bg-[#D6CEC0]"
        )}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-[#D6CEC0] bg-white px-6 py-12 text-center">
      <p className="font-heading text-lg font-bold text-navy">{title}</p>
      {text && <p className="max-w-md text-sm text-ink-secondary">{text}</p>}
      {action}
    </div>
  );
}

export function ErrorNotice({ children }: { children: ReactNode }) {
  return <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">{children}</div>;
}

/** Confirmation avant une action destructive. `onConfirm` doit renvoyer une promesse. */
export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Supprimer", onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{title}</DialogTitle>
          <DialogDescription className="text-ink-secondary">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" shape="rounded" disabled={busy} onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            type="button"
            shape="rounded"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try { await onConfirm(); onOpenChange(false); } finally { setBusy(false); }
            }}
          >
            {busy ? <Loader2 className="animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Boîte de dialogue demandant un motif obligatoire (refus, annulation, remboursement…). */
export function ReasonDialog({ title, description, confirmLabel, onClose, onSubmit }: {
  title: string; description: string; confirmLabel: string; onClose: () => void; onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-w-md rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{title}</DialogTitle>
          <DialogDescription className="text-ink-secondary">{description}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!reason.trim()) return;
            setBusy(true);
            try { await onSubmit(reason.trim()); } finally { setBusy(false); }
          }}
        >
          <Field label="Motif *" htmlFor="reason">
            <textarea id="reason" rows={3} autoFocus required className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={busy} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={busy || !reason.trim()}>{busy ? <Loader2 className="animate-spin" /> : confirmLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Message d'erreur lisible pour une mutation (utilise le message renvoyé par l'API). */
export function errorMessage(e: unknown, fallback = "Une erreur est survenue."): string {
  return e instanceof Error && e.message && !/^Erreur \d+$/.test(e.message) ? e.message : fallback;
}

/** Pagination simple (précédent / suivant) pour les listes serveur. */
export function Pager({
  page, totalPages, totalElements, onChange,
}: { page: number; totalPages: number; totalElements: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) {
    return <p className="text-xs text-ink-secondary">{totalElements} élément{totalElements > 1 ? "s" : ""}</p>;
  }
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-xs text-ink-secondary">{totalElements} éléments · page {page + 1} sur {totalPages}</span>
      <div className="flex gap-2">
        <Button type="button" variant="outline" shape="rounded" size="sm" disabled={page <= 0} onClick={() => onChange(page - 1)}>Précédent</Button>
        <Button type="button" variant="outline" shape="rounded" size="sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Suivant</Button>
      </div>
    </div>
  );
}
