/**
 * Design-system SectionHeader (Lot 0+, docs/design/README.md §1).
 * Eyebrow label + large heading + optional description/action, matching the
 * repeated pattern across docs/design/screens (e.g. "PAR MÉTIER" / "Mes formations").
 */
import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex gap-6",
        centered ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("flex flex-col gap-3", centered && "items-center")}>
        {eyebrow && (
          <span className="font-sans text-sm font-bold uppercase tracking-[1.5px] text-cta">
            {eyebrow}
          </span>
        )}
        <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-navy">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl font-sans text-base text-ink-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { SectionHeader };
