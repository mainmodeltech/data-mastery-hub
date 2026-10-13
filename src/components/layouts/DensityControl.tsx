import { Check, ALargeSmall } from "lucide-react";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DENSITIES, type Density } from "@/hooks/useDensity";

/** Choix de la taille d'affichage (compact / standard / confortable), dans l'en-tête de l'espace connecté. */
export function DensityControl({ density, onChange }: { density: Density; onChange: (d: Density) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden h-11 w-11 items-center justify-center rounded-card border border-[#E7E0D4] text-navy hover:bg-app-bg sm:flex"
          aria-label="Taille d'affichage"
          title="Taille d'affichage"
        >
          <ALargeSmall className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Taille d'affichage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DENSITIES.map((d) => (
          <DropdownMenuItem key={d.value} onSelect={() => onChange(d.value)} className="flex items-start gap-2">
            <Check className={density === d.value ? "mt-0.5 h-4 w-4 text-success" : "mt-0.5 h-4 w-4 opacity-0"} aria-hidden="true" />
            <span className="flex flex-col">
              <span className="font-semibold">{d.label}</span>
              <span className="text-xs text-muted-foreground">{d.hint}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
