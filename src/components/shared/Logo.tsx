/**
 * Logo officiel Model Technologie (fichiers fournis, fond transparent).
 * - "full" : symbole + « Modeltech » + slogan « Toujours plus haut ! »
 * - "mark" : symbole M seul (petits formats, barre latérale)
 * Le logo est bleu : sur fond sombre, le placer sur une pastille claire (<LogoChip />).
 */
import logoFull from "@/assets/logo-modeltech.png";
import logoMark from "@/assets/logo-modeltech-mark.png";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export function Logo({ variant = "full", className }: LogoProps) {
  const isFull = variant === "full";
  return (
    <img
      src={isFull ? logoFull : logoMark}
      alt="Model Technologie — Toujours plus haut !"
      width={isFull ? 501 : 209}
      height={isFull ? 301 : 176}
      className={cn("w-auto select-none", className)}
      draggable={false}
    />
  );
}

/** Logo sur pastille blanche, pour les fonds sombres (footer, barre latérale). */
export function LogoChip({ variant = "full", className }: LogoProps) {
  return (
    <span className="inline-flex rounded-xl bg-white p-2">
      <Logo variant={variant} className={className} />
    </span>
  );
}
