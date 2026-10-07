/**
 * SessionAvailabilityBadge.tsx
 * Composant réutilisable affichant la disponibilité d'une session
 * (places restantes + couleur sémantique) à partir de l'API.
 * Couleurs alignées sur les tokens du design system (success / warning / error).
 */

import { useSessionAvailability } from "@/hooks/useRegistrations";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Couleurs retournées par le backend */
type DisplayColor = "green" | "yellow" | "red";

/** Réponse brute du hook — on ne type que ce qu'on utilise ici */
interface AvailabilityData {
    displayColor: DisplayColor;
    displayMessage: string;
    remainingSpots: number | null;
    isOpenForRegistration: boolean;
}

const COLOR_CLASSES: Record<DisplayColor, string> = {
    green: "bg-success-bg text-success",
    yellow: "bg-warning-bg text-warning",
    red: "bg-error-bg text-error",
};

/** Valeur de secours si le backend renvoie une couleur inattendue */
const FALLBACK_COLOR: DisplayColor = "green";

function resolveColor(raw: string | undefined): DisplayColor {
    if (raw === "green" || raw === "yellow" || raw === "red") return raw;
    return FALLBACK_COLOR;
}

interface SessionAvailabilityBadgeProps {
    sessionId: string;
    className?: string;
}

export function SessionAvailabilityBadge({ sessionId, className }: SessionAvailabilityBadgeProps) {
    const { data, isLoading, isError } = useSessionAvailability(sessionId);

    if (isLoading) {
        return (
            <span className={cn("inline-flex items-center gap-1 text-xs text-ink-secondary", className)}>
                <Loader2 className="h-3 w-3 animate-spin" />
                Vérification…
            </span>
        );
    }

    if (isError || !data) return null;

    const availability = data as AvailabilityData;
    const colorClass = COLOR_CLASSES[resolveColor(availability.displayColor)];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-pill px-3 py-1 font-sans text-xs font-semibold",
                colorClass,
                className
            )}
        >
            {availability.displayMessage}
        </span>
    );
}
