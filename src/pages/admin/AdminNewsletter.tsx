/**
 * AdminNewsletter.tsx — abonnés à la newsletter (double opt-in).
 * PENDING = e-mail de confirmation envoyé, CONFIRMED = abonné actif, UNSUBSCRIBED = désinscrit.
 * L'export CSV ne contient que les abonnés confirmés.
 */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, inputClass } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { httpClient } from "@/services/httpClient";
import { QUERY_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";

type NewsletterStatus = "PENDING" | "CONFIRMED" | "UNSUBSCRIBED";

interface Subscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  source: string | null;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

const STATUS: Record<NewsletterStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  CONFIRMED: { label: "Confirmé", variant: "success" },
  PENDING: { label: "En attente de confirmation", variant: "warning" },
  UNSUBSCRIBED: { label: "Désinscrit", variant: "neutral" },
};

const day = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "—");

function useSubscribers() {
  return useQuery({
    queryKey: ["admin", "newsletter"],
    queryFn: async () => {
      const res = await httpClient.get<{ data: Subscriber[] }>("/admin/newsletter-subscriptions", { params: { page: 0, size: 500 } });
      return res.data ?? [];
    },
    staleTime: QUERY_CONFIG.staleTime,
  });
}

function exportConfirmed(list: Subscriber[]) {
  const rows = list.filter((s) => s.status === "CONFIRMED");
  const csv = ["E-mail;Source;Confirmé le", ...rows.map((s) => `${s.email};${s.source ?? ""};${day(s.confirmedAt)}`)].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "newsletter-abonnes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminNewsletter() {
  const { data: subscribers = [], isLoading, isError } = useSubscribers();
  const [filter, setFilter] = useState<"all" | NewsletterStatus>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => ({
    CONFIRMED: subscribers.filter((s) => s.status === "CONFIRMED").length,
    PENDING: subscribers.filter((s) => s.status === "PENDING").length,
    UNSUBSCRIBED: subscribers.filter((s) => s.status === "UNSUBSCRIBED").length,
  }), [subscribers]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((s) => (filter === "all" || s.status === filter) && (!q || s.email.toLowerCase().includes(q)));
  }, [subscribers, filter, query]);

  return (
    <AdminLayout
      title="Newsletter"
      description="Abonnés (double confirmation)"
      actions={
        <Button type="button" variant="outline" size="sm" shape="rounded" disabled={counts.CONFIRMED === 0} onClick={() => exportConfirmed(subscribers)}>
          <Download />Exporter les confirmés
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4">
          {([["CONFIRMED", "Confirmés"], ["PENDING", "En attente"], ["UNSUBSCRIBED", "Désinscrits"]] as const).map(([k, label]) => (
            <Card key={k} radius="stat" className="flex flex-col gap-1 border border-[#E7E0D4] p-5">
              <span className="text-sm text-ink-secondary">{label}</span>
              <span className="font-heading text-[28px] font-extrabold text-navy">{counts[k]}</span>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
            <input aria-label="Rechercher un abonné" className={`${inputClass} pl-10`} placeholder="Adresse e-mail…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div role="group" aria-label="Statut" className="flex gap-1 rounded-xl bg-[#ECE6DB] p-1">
            {([["all", "Tous"], ["CONFIRMED", "Confirmés"], ["PENDING", "En attente"], ["UNSUBSCRIBED", "Désinscrits"]] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={filter === k}
                onClick={() => setFilter(k)}
                className={cn("rounded-[10px] px-3 py-1.5 text-sm font-semibold", filter === k ? "bg-white text-navy shadow-sm" : "text-ink-secondary hover:text-navy")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les abonnés.</ErrorNotice>}
        {!isLoading && !isError && subscribers.length === 0 && (
          <EmptyState title="Aucun abonné" text="Les inscriptions du formulaire de la page Ressources apparaîtront ici." />
        )}

        {shown.length > 0 && (
          <Card radius="stat" className="divide-y divide-[#E7E0D4] overflow-hidden border border-[#E7E0D4]">
            {shown.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{s.email}</span>
                <span className="text-xs text-ink-secondary">{s.source ?? "—"} · inscrit le {day(s.createdAt)}</span>
                <Pill variant={STATUS[s.status].variant}>{STATUS[s.status].label}</Pill>
              </div>
            ))}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
