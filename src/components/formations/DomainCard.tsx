import { Card } from "@/components/shared/Card";
import type { Domain } from "@/types/formation.type";

export interface DomainCardProps {
  domain: Domain;
  formationCount: number;
  onBrowse?: () => void;
}

export function DomainCard({ domain, formationCount, onBrowse }: DomainCardProps) {
  return (
    <Card
      radius="card"
      variant={domain.comingSoon ? "sand" : "default"}
      className="flex flex-col gap-3 p-6"
    >
      <span className="font-sans text-xs font-bold uppercase tracking-[1px] text-cta">{domain.badge}</span>
      <h3 className="font-heading text-xl font-extrabold text-navy">{domain.name}</h3>
      <p className="text-sm text-ink-secondary">{domain.description}</p>
      {!domain.comingSoon && (
        <button
          type="button"
          onClick={onBrowse}
          className="mt-2 text-left font-sans text-sm font-semibold text-navy hover:text-cta"
        >
          {formationCount} formation{formationCount > 1 ? "s" : ""} →
        </button>
      )}
    </Card>
  );
}
