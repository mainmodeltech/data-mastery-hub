/**
 * CatalogueFilters — choisir vite : les domaines en onglets, le métier en pastilles, les critères secondaires repliés. Des boutons à état
 * (aria-pressed) plutôt que cinq listes déroulantes : un clic, le résultat change, et on voit d'un coup d'œil ce qui est actif.
 */
import { FORMATIONS_UI as UI } from "@/config/formationsPage";
import { cn } from "@/lib/utils";
import type { DeliveredBy, Domain, FormationFormat, FormationLevel } from "@/types/formation.type";
import { FORMAT_LABELS, LEVEL_LABELS } from "@/types/formation.type";

export interface FormationFilters {
  domainId: string | "all";
  level: FormationLevel | "all";
  format: FormationFormat | "all";
  targetRole: string | "all";
  deliveredBy: DeliveredBy | "all";
}

export const EMPTY_FILTERS: FormationFilters = { domainId: "all", level: "all", format: "all", targetRole: "all", deliveredBy: "all" };

export const hasActiveFilters = (f: FormationFilters) => (Object.keys(EMPTY_FILTERS) as (keyof FormationFilters)[]).some((k) => f[k] !== "all");

interface Props {
  domains: Domain[];
  /** Nombre de formations par domaine (clé : id du domaine). */
  counts: Record<string, number>;
  total: number;
  targetRoles: string[];
  filters: FormationFilters;
  shown: number;
  onChange: (filters: FormationFilters) => void;
}

const tab = "home-press min-h-11 rounded-t-2xl px-5 text-base font-semibold";
const chip = "home-press min-h-11 rounded-full px-4 text-sm font-semibold";
const select = "min-h-11 w-full rounded-xl bg-white px-4 text-base text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

export function CatalogueFilters({ domains, counts, total, targetRoles, filters, shown, onChange }: Props) {
  const set = <K extends keyof FormationFilters>(key: K, value: FormationFilters[K]) => onChange({ ...filters, [key]: value });
  const active = hasActiveFilters(filters);
  const advancedActive = filters.level !== "all" || filters.format !== "all" || filters.deliveredBy !== "all";

  return (
    <div className="flex flex-col gap-5">
      {/* Domaines */}
      <div role="group" aria-label={UI.filters.domain} className="flex flex-wrap gap-2">
        {[{ id: "all", name: UI.filters.all, count: total }, ...domains.map((d) => ({ id: d.id, name: d.name, count: counts[d.id] ?? 0 }))].map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={filters.domainId === d.id}
            onClick={() => set("domainId", d.id)}
            className={cn(tab, filters.domainId === d.id ? "bg-navy text-white" : "bg-surface-sand text-navy hover:bg-navy/10")}
          >
            {d.name} <span className={filters.domainId === d.id ? "text-white/80" : "text-ink-secondary"}>({d.count})</span>
          </button>
        ))}
      </div>

      {/* Métiers */}
      {targetRoles.length > 0 && (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <p className="text-sm font-semibold text-navy" id="filter-role">{UI.filters.role}</p>
          <div role="group" aria-labelledby="filter-role" className="flex flex-wrap gap-2">
            {targetRoles.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={filters.targetRole === r}
                onClick={() => set("targetRole", filters.targetRole === r ? "all" : r)}
                className={cn(chip, filters.targetRole === r ? "bg-cta text-white" : "bg-surface-sand text-navy hover:bg-navy/10")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Critères secondaires, repliés */}
      <details className="group" open={advancedActive || undefined}>
        <summary className="home-press inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-base font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy [&::-webkit-details-marker]:hidden">
          {UI.moreFilters}
          <span aria-hidden="true" className="text-xl leading-none group-open:hidden">+</span>
          <span aria-hidden="true" className="hidden text-xl leading-none group-open:inline">−</span>
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
            {UI.filters.level}
            <select className={select} value={filters.level} onChange={(e) => set("level", e.target.value as FormationFilters["level"])}>
              <option value="all">{UI.filters.all}</option>
              {(Object.keys(LEVEL_LABELS) as FormationLevel[]).map((l) => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
            {UI.filters.format}
            <select className={select} value={filters.format} onChange={(e) => set("format", e.target.value as FormationFilters["format"])}>
              <option value="all">{UI.filters.all}</option>
              {(Object.keys(FORMAT_LABELS) as FormationFormat[]).map((f) => <option key={f} value={f}>{FORMAT_LABELS[f]}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
            {UI.filters.deliveredBy}
            <select className={select} value={filters.deliveredBy} onChange={(e) => set("deliveredBy", e.target.value as FormationFilters["deliveredBy"])}>
              <option value="all">{UI.filters.all}</option>
              <option value="INTERNAL">Model Technologie</option>
              <option value="PARTNER">Partenaires</option>
            </select>
          </label>
        </div>
      </details>

      <p aria-live="polite" className="flex flex-wrap items-center gap-4 text-base text-ink-secondary">
        <span>{shown} formation{shown > 1 ? "s" : ""}</span>
        {active && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="home-press min-h-11 font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">
            {UI.filters.reset}
          </button>
        )}
      </p>
    </div>
  );
}
