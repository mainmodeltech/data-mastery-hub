/**
 * Design-system ProgressBar (Lot 0+, docs/design/README.md §1).
 * Thin styled wrapper around @/components/ui/progress.tsx (Radix) — reused for its
 * accessibility (role="progressbar", value clamping), restyled to the new tokens.
 * Unrelated to the local, non-exported `ProgressBar` step-indicator in
 * src/pages/Orientation.tsx (different semantics — step count, not a 0-100 fill).
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const trackVariants = cva("h-2.5 rounded-pill bg-surface-sand overflow-hidden", {
  variants: {
    variant: {
      default: "[&>div]:bg-success",
      "accent-on-navy": "[&>div]:bg-[#8FE0B8]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ProgressBarProps extends VariantProps<typeof trackVariants> {
  value: number;
  max?: number;
  className?: string;
  "aria-label"?: string;
}

function ProgressBar({ value, max = 100, variant, className, ...props }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <Progress
      value={pct}
      className={cn(trackVariants({ variant, className }))}
      {...props}
    />
  );
}

export { ProgressBar };
