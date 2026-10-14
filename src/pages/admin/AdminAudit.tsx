/**
 * AdminAudit.tsx — journal d'audit (lecture seule) : qui a fait quoi, quand, depuis quelle adresse. Filtres par catégorie,
 * action, personne, période et texte ; « À surveiller » isole les actions sans second contrôle et les dérogations.
 * Le journal ne se modifie pas et ne se supprime pas (la base elle-même l'interdit).
 */
import { Fragment, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, ChevronRight, Loader2, Search, ShieldAlert } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, inputClass, Pager } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useAuditCatalogue, useAuditLog } from "@/hooks/useAudit";
import { cn } from "@/lib/utils";
import type { AuditEntry, AuditFilters } from "@/types/audit.type";

const stamp = (iso: string) => format(new Date(iso), "d MMM yyyy 'à' HH:mm:ss", { locale: fr });
const isoDay = (d: Date) => format(d, "yyyy-MM-dd");

const PERIODS = [
  { key: "all", label: "Tout" },
  { key: "today", label: "Aujourd'hui" },
  { key: "7", label: "7 jours" },
  { key: "30", label: "30 jours" },
] as const;

/** Clés techniques des détails → libellés lisibles. */
const DETAIL_LABELS: Record<string, string> = {
  registrationId: "Inscription", montant: "Montant", devise: "Devise", moyen: "Moyen de paiement", saisiPar: "Saisi par",
  demandePar: "Demandé par", motif: "Motif", motifDuRefus: "Motif du refus", echeances: "Échéances", tarifCatalogue: "Tarif du catalogue",
  avant: "Avant", apres: "Après", droitsAjoutes: "Droits ajoutés", droitsRetires: "Droits retirés",
};

function DetailValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <>{value.length ? value.join(", ") : "—"}</>;
  if (value === null || value === undefined || value === "") return <>—</>;
  return <>{String(value)}</>;
}

export default function AdminAudit() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30");
  const [category, setCategory] = useState("");
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [q, setQ] = useState("");
  const [watch, setWatch] = useState(false);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const filters = useMemo<AuditFilters>(() => {
    const today = new Date();
    return {
      category: category || undefined,
      action: action || undefined,
      actor: actor.trim() || undefined,
      q: q.trim() || undefined,
      flag: watch ? "ANY" : undefined,
      from: period === "all" ? undefined : isoDay(period === "today" ? today : subDays(today, Number(period))),
    };
  }, [period, category, action, actor, q, watch]);

  const { data: catalogue } = useAuditCatalogue();
  const { data, isLoading, isError, error, isFetching } = useAuditLog(filters, page);

  const actions = (catalogue?.actions ?? []).filter((a) => !category || a.category === category);
  const entries = data?.entries ?? [];
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(0); };

  return (
    <AdminLayout title="Journal d'audit" description="Qui a fait quoi, et quand. Ce journal est en lecture seule : il ne peut être ni modifié ni effacé.">
      <div className="flex flex-col gap-5">
        <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Période">
            {PERIODS.map((p) => (
              <Button key={p.key} type="button" size="sm" shape="pill" variant={period === p.key ? "navy" : "outline"} aria-pressed={period === p.key} onClick={() => reset(setPeriod)(p.key)}>
                {p.label}
              </Button>
            ))}
            <span className="flex-1" />
            <Button type="button" size="sm" shape="pill" variant={watch ? "primary" : "outline"} aria-pressed={watch} onClick={() => reset(setWatch)(!watch)}>
              <ShieldAlert />À surveiller
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="sr-only">Catégorie</span>
              <select className={inputClass} value={category} onChange={(e) => { setCategory(e.target.value); setAction(""); setPage(0); }}>
                <option value="">Toutes les catégories</option>
                {(catalogue?.categories ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Action</span>
              <select className={inputClass} value={action} onChange={(e) => reset(setAction)(e.target.value)}>
                <option value="">Toutes les actions</option>
                {actions.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
              </select>
            </label>
            <label className="relative">
              <span className="sr-only">Personne</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" aria-hidden="true" />
              <input className={cn(inputClass, "pl-9")} placeholder="Personne (nom ou e-mail)" value={actor} onChange={(e) => reset(setActor)(e.target.value)} />
            </label>
            <label className="relative">
              <span className="sr-only">Texte</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" aria-hidden="true" />
              <input className={cn(inputClass, "pl-9")} placeholder="Dans le détail (nom, montant…)" value={q} onChange={(e) => reset(setQ)(e.target.value)} />
            </label>
          </div>
        </Card>

        {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger le journal.")}</ErrorNotice>}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {data && entries.length === 0 && <EmptyState title="Aucune ligne" text="Aucune action ne correspond à ces filtres sur la période choisie." />}

        {entries.length > 0 && (
          <Card radius="stat" className={cn("overflow-hidden border border-[#E7E0D4] p-0", isFetching && "opacity-70")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-[#E7E0D4] bg-app-bg text-left text-xs text-ink-secondary">
                    <th scope="col" className="w-8 px-3 py-2.5"><span className="sr-only">Détails</span></th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Quand</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Qui</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Quoi</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e: AuditEntry) => {
                    const expanded = open === e.id;
                    const details = e.details ? Object.entries(e.details) : [];
                    return (
                      <Fragment key={e.id}>
                        <tr className="border-b border-[#E7E0D4] align-top last:border-b-0">
                          <td className="px-3 py-3">
                            <button type="button" aria-expanded={expanded} aria-label={expanded ? "Masquer les détails" : "Afficher les détails"} onClick={() => setOpen(expanded ? null : e.id)} className="text-ink-secondary hover:text-navy">
                              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-ink-secondary">{stamp(e.occurredAt)}</td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-ink">{e.actorName ?? e.actorEmail}</div>
                            <div className="text-xs text-ink-secondary">{e.actorName ? e.actorEmail : ""}{e.actorProfiles ? ` · ${e.actorProfiles}` : ""}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Pill variant="info">{e.actionLabel}</Pill>
                              {e.flag && <Pill variant="warning">{e.flagLabel ?? e.flag}</Pill>}
                            </div>
                            <p className="mt-1 text-ink">{e.summary}</p>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-b border-[#E7E0D4] bg-app-bg last:border-b-0">
                            <td />
                            <td colSpan={3} className="px-3 py-3">
                              <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
                                <dt className="text-ink-secondary">Adresse IP</dt><dd className="text-ink">{e.ip ?? "—"}</dd>
                                {e.entityType && (<><dt className="text-ink-secondary">Élément concerné</dt><dd className="break-all text-ink">{e.entityType} · {e.entityId}</dd></>)}
                                {details.map(([k, v]) => (
                                  <Fragment key={k}>
                                    <dt className="text-ink-secondary">{DETAIL_LABELS[k] ?? k}</dt>
                                    <dd className="break-all text-ink"><DetailValue value={v} /></dd>
                                  </Fragment>
                                ))}
                              </dl>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {data && <Pager page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />}
      </div>
    </AdminLayout>
  );
}
