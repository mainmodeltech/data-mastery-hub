// src/types/testimonial.types.ts

export interface Testimonial {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    content: string;
    bootcamp: string | null;
    result: string | null;
    rating: number;
    published: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface TestimonialRequest {
    name: string;
    role: string;
    company: string;
    content: string;
    bootcamp: string;
    result: string;
    rating: number;
    published: boolean;
    displayOrder: number;
}

export const TESTIMONIAL_EMPTY_FORM: TestimonialRequest = {
    name: "",
    role: "",
    company: "",
    content: "",
    bootcamp: "",
    result: "",
    rating: 5,
    published: true,
    displayOrder: 0,
};

// ─── Helpers UI ───────────────────────────────────────────────────────────────

/** "Amadou Diallo" → "AD" */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

/** Génère un dégradé CSS déterministe depuis le nom (même nom = même couleur) */
export function getGradientFromName(name: string): string {
    const palettes = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
        "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
        "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    ];
    const hash = name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return palettes[hash % palettes.length];
}

/** Classe de couleur badge selon le bootcamp */
export function getBootcampColorClass(bootcamp: string | null): string {
    if (!bootcamp) return "bg-secondary text-secondary-foreground";
    const lower = bootcamp.toLowerCase();
    if (lower.includes("power bi"))
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    if (lower.includes("python") || lower.includes("sql"))
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    if (lower.includes("data analyst") || lower.includes("data"))
        return "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300";
    return "bg-secondary text-secondary-foreground";
}

/** Résultat par défaut si le champ result est vide */
export function getResultFallback(bootcamp: string | null): string {
    if (!bootcamp) return "Compétences acquises";
    const lower = bootcamp.toLowerCase();
    if (lower.includes("power bi")) return "Dashboards automatisés";
    if (lower.includes("python") || lower.includes("sql")) return "Analyses maîtrisées";
    return "Objectifs atteints";
}
