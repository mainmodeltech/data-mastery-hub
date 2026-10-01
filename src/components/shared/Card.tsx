/**
 * Design-system Card (Lot 0+, docs/design/README.md §1).
 * Net-new rather than a wrap of @/components/ui/card.tsx — the radius-tier/shadow
 * variant surface here is large enough that reusing the shadcn primitive would mean
 * overriding almost all of its fixed styling anyway.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("border", {
  variants: {
    variant: {
      default: "bg-white border-[#E7E0D4] text-ink",
      sand: "bg-surface-sand border-[#E7E0D4] text-ink",
      navy: "bg-navy border-navy text-white",
    },
    radius: {
      stat: "rounded-stat",
      card: "rounded-card",
      callout: "rounded-callout",
      hero: "rounded-hero",
    },
    shadow: {
      true: "shadow-[0_20px_40px_rgba(26,58,91,0.08)]",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    radius: "card",
    shadow: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, radius, shadow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, radius, shadow, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card, cardVariants };
