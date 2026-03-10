/**
 * SessionAvailabilityBadge.tsx
 * Composant réutilisable affichant la disponibilité d'une session
 * (places restantes + couleur sémantique) à partir de l'API.
 */

import { useSessionAvailability } from "@/hooks/useRegistrations";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Couleurs retournées par le backend */
type DisplayColor = "green" | "yellow" | "red";

/** Réponse brute du hook — on ne type que ce qu'on utilise ici */
interface AvailabilityData {
    displayColor: DisplayColor;
    displayMessage: string;
    remainingSpots: number | null;
    isOpenForRegistration: boolean;
}

// ─── Mapping couleur → classes Tailwind ──────────────────────────────────────

const COLOR_CLASSES: Record<DisplayColor, string> = {
    green: "text-green-700 bg-green-50 border-green-200",
    yellow: "text-yellow-700 bg-yellow-50 border-yellow-200",
    red: "text-red-700 bg-red-50 border-red-200",
};

/** Valeur de secours si le backend renvoie une couleur inattendue */
const FALLBACK_COLOR: DisplayColor = "green";

function resolveColor(raw: string | undefined): DisplayColor {
    if (raw === "green" || raw === "yellow" || raw === "red") return raw;
    return FALLBACK_COLOR;
}

// ─── Composant ────────────────────────────────────────────────────────────────

interface SessionAvailabilityBadgeProps {
    sessionId: string;
    className?: string;
}

export function SessionAvailabilityBadge({sessionId,  className, }: SessionAvailabilityBadgeProps) {
    const { data, isLoading, isError } = useSessionAvailability(sessionId);

    if (isLoading) {
        return (
            <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Vérification…
      </span>
        );
    }

    if (isError || !data) return null;

    // Cast explicite : le hook retourne `unknown`, on accède aux champs en sécurité
    const availability = data as AvailabilityData;
    const color = resolveColor(availability.displayColor);
    const colorClass = COLOR_CLASSES[color];

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                colorClass,
                className
            )}
        >
      {availability.displayMessage}
    </span>
    );
}
