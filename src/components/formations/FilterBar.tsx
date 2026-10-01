import type { Domain, FormationLevel, FormationFormat, DeliveredBy } from "@/types/formation.type";
import { LEVEL_LABELS, FORMAT_LABELS } from "@/types/formation.type";

export interface FormationFilters {
  domainId: string | "all";
  level: FormationLevel | "all";
  format: FormationFormat | "all";
  targetRole: string | "all";
  deliveredBy: DeliveredBy | "all";
}

export const EMPTY_FILTERS: FormationFilters = {
  domainId: "all",
  level: "all",
  format: "all",
  targetRole: "all",
  deliveredBy: "all",
};

export interface FilterBarProps {
  domains: Domain[];
  targetRoles: string[];
  filters: FormationFilters;
  onChange: (filters: FormationFilters) => void;
}

const selectClass =
  "w-full rounded-card border border-[#E7E0D4] bg-white px-4 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

export function FilterBar({ domains, targetRoles, filters, onChange }: FilterBarProps) {
  const set = <K extends keyof FormationFilters>(key: K, value: FormationFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <select
        aria-label="Domaine"
        className={selectClass}
        value={filters.domainId}
        onChange={(e) => set("domainId", e.target.value)}
      >
        <option value="all">Tous les domaines</option>
        {domains.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Niveau"
        className={selectClass}
        value={filters.level}
        onChange={(e) => set("level", e.target.value as FormationFilters["level"])}
      >
        <option value="all">Tous niveaux</option>
        {(Object.keys(LEVEL_LABELS) as FormationLevel[]).map((l) => (
          <option key={l} value={l}>
            {LEVEL_LABELS[l]}
          </option>
        ))}
      </select>

      <select
        aria-label="Format"
        className={selectClass}
        value={filters.format}
        onChange={(e) => set("format", e.target.value as FormationFilters["format"])}
      >
        <option value="all">Tous formats</option>
        {(Object.keys(FORMAT_LABELS) as FormationFormat[]).map((f) => (
          <option key={f} value={f}>
            {FORMAT_LABELS[f]}
          </option>
        ))}
      </select>

      <select
        aria-label="Métier"
        className={selectClass}
        value={filters.targetRole}
        onChange={(e) => set("targetRole", e.target.value)}
      >
        <option value="all">Tous métiers</option>
        {targetRoles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      <select
        aria-label="Dispensé par"
        className={selectClass}
        value={filters.deliveredBy}
        onChange={(e) => set("deliveredBy", e.target.value as FormationFilters["deliveredBy"])}
      >
        <option value="all">Tous</option>
        <option value="INTERNAL">Model Technologie</option>
        <option value="PARTNER">Partenaires</option>
      </select>
    </div>
  );
}
