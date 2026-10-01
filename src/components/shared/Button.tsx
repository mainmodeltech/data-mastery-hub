/**
 * Design-system Button (Lot 0+, docs/design/README.md §1).
 * Separate from @/components/ui/button.tsx (shadcn, tied to the primary/secondary/
 * destructive tokens) — this one uses the new navy/cta design tokens and is meant
 * for the new SiteLayout/AppLayout and pages built against the new design system.
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-cta text-white hover:bg-cta/90",
        navy: "bg-navy text-white hover:bg-navy/90",
        outline: "border border-navy bg-transparent text-navy hover:bg-navy/5",
      },
      shape: {
        pill: "rounded-pill",
        rounded: "rounded-card",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-[52px] px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "pill",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, shape, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, shape, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
