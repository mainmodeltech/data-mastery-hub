/**
 * Design-system status Pill (Lot 0+, docs/design/README.md §1).
 * Distinct from @/components/ui/badge.tsx (shadcn, tied to the primary/secondary/
 * destructive tokens) — this one carries the new status-color semantics
 * (info/success/warning/error/neutral) used across the app screens.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-sans text-xs font-semibold",
  {
    variants: {
      variant: {
        info: "bg-info-bg text-navy",
        success: "bg-success-bg text-success",
        warning: "bg-warning-bg text-warning",
        error: "bg-error-bg text-error",
        neutral: "bg-surface-sand text-ink-secondary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(pillVariants({ variant, className }))} {...props} />
  )
);
Pill.displayName = "Pill";

export { Pill, pillVariants };
