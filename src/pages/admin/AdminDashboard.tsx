/**
 * AdminDashboard.tsx — tableau de bord du back-office (docs/design/screens/app/App-Admin-Dashboard.dc.html).
 *
 * Construit sur les endpoints existants (inscriptions, paiements, formations, messages) :
 * aucun endpoint de statistiques n'existe encore côté backend (`feature/admin-stats`), donc les
 * agrégats sont calculés ici sur les 200 inscriptions et paiements les plus récents. Les indicateurs
 * qui dépendent des certificats (taux de complétion, certificats délivrés) arriveront avec ce lot.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, startOfMonth, subMonths, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice } from "@/components/admin/AdminKit";
import { Button, Card } from "@/components/shared";
import { useContactMessages } from "@/hooks/useContacts";
import { useAdminFormations } from "@/hooks/useCatalogAdmin";
import { useOpenPayments } from "@/hooks/usePayments";
import { useRegistrations } from "@/hooks/useRegistrations";
import { paymentAdminService } from "@/services/api/paymentService";
import { formatAmount, type AdminPayment } from "@/types/payment.type";
import type { Registration } from "@/types";

const SAMPLE = 200;

function useConfirmedPayments() {
  return useQuery({
    queryKey: ["admin", "payments", "confirmed"],
    queryFn: () => paymentAdminService.listPayments({ status: "CONFIRMED", size: SAMPLE }),
    staleTime: 60 * 1000,
  });
}

function Delta({ value, unit = "" }: { value: number; unit?: string }) {
  if (value === 0) return <span className="text-sm text-ink-secondary">= mois précédent</span>;
  return (
    <span className={value > 0 ? "text-sm font-semibold text-success" : "text-sm font-semibold text-error"}>
      {value > 0 ? "+" : ""}{value}{unit} vs mois précédent
    </span>
  );
}

function Kpi({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-5">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="font-heading text-[30px] font-extrabold leading-none text-navy">{value}</span>
      {extra}
    </Card>
  );
}

interface TodoItem { count: number; title: string; hint: string; to: string }

export default function AdminDashboard() {
  const regs = useRegistrations(0, SAMPLE);
  const confirmed = useConfirmedPayments();
  const open = useOpenPayments();
  const formations = useAdminFormations();
  const messages = useContactMessages(0, SAMPLE);

  const registrations: Registration[] = regs.data?.content ?? [];
  const payments: AdminPayment[] = confirmed.data ?? [];
  const now = new Date();

  const stats = useMemo(() => {
    const thisMonth = registrations.filter((r) => isSameMonth(new Date(r.createdAt), now));
    const lastMonth = registrations.filter((r) => isSameMonth(new Date(r.createdAt), subMonths(now, 1)));
    const revenueOf = (m: Date) =>
      payments.filter((p) => p.confirmedAt && isSameMonth(new Date(p.confirmedAt), m)).reduce((s, p) => s + p.amount, 0);
    const months = Array.from({ length: 6 }, (_, i) => {
      const m = startOfMonth(subMonths(now, 5 - i));
      return { label: format(m, "MMM", { locale: fr }), count: registrations.filter((r) => isSameMonth(new Date(r.createdAt), m)).length };
    });
    return {
      newThis: thisMonth.length,
      newDelta: thisMonth.length - lastMonth.length,
      revenueThis: revenueOf(now),
      revenueLast: revenueOf(subMonths(now, 1)),
      active: registrations.filter((r) => r.status === "CONFIRMED").length,
      toQualify: registrations.filter((r) => r.status === "PENDING").length,
      months,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrations, payments]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (formations.data ?? [])
      .flatMap((f) => (f.sessions?.length ? f.sessions : f.nextSession ? [f.nextSession] : []).map((s) => ({ s, f })))
      .filter(({ s }) => s.published !== false && s.startDate && s.startDate >= today && s.status !== "CANCELLED" && s.status !== "DRAFT")
      .sort((a, b) => (a.s.startDate ?? "").localeCompare(b.s.startDate ?? ""))
      .slice(0, 5);
  }, [formations.data]);

  const unread = (messages.data?.items ?? []).filter((m) => m.status === "unread");
  const toConfirm = (open.data ?? []).filter((p) => p.status === "DECLARED").length;
  const todos: TodoItem[] = [
    { count: toConfirm, title: "Paiements à confirmer", hint: "Wave / Orange Money déclarés, à rapprocher", to: "/admin/candidatures" },
    { count: stats.toQualify, title: "Candidatures à valider", hint: "Nouvelles demandes d'inscription", to: "/admin/candidatures" },
    { count: unread.filter((m) => (m.type ?? "CONTACT") === "CONTACT").length, title: "Messages non lus", hint: "Formulaire de contact", to: "/admin/messages" },
    { count: unread.filter((m) => m.type === "DIAGNOSTIC").length, title: "Demandes de diagnostic entreprise", hint: "Formulaire B2B", to: "/admin/messages" },
    { count: unread.filter((m) => m.type === "PARTNER_APPLICATION").length, title: "Candidatures partenaire", hint: "Proposition de formation", to: "/admin/messages" },
  ].filter((t) => t.count > 0);

  const activity = useMemo(() => {
    const items = [
      ...registrations.map((r) => ({
        at: r.createdAt,
        who: `${r.firstName} ${r.lastName}`,
        text: `a candidaté à ${r.bootcampTitle ?? "une formation"}`,
      })),
      ...payments.filter((p) => p.confirmedAt).map((p) => ({
        at: p.confirmedAt as string,
        who: `${p.firstName} ${p.lastName}`,
        text: `a payé ${formatAmount(p.amount, p.currency)}${p.bootcampTitle ? ` · ${p.bootcampTitle}` : ""}`,
      })),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  }, [registrations, payments]);

  const loading = regs.isLoading || confirmed.isLoading;
  const failed = regs.isError;
  const max = Math.max(1, ...stats.months.map((m) => m.count));
  const revenueDelta = stats.revenueLast > 0 ? Math.round(((stats.revenueThis - stats.revenueLast) / stats.revenueLast) * 100) : null;

  return (
    <AdminLayout title="Tableau de bord" description={format(now, "EEEE d MMMM yyyy", { locale: fr })}>
      <div className="flex flex-col gap-6">
        {failed && <ErrorNotice>Impossible de charger les données. Vérifiez la connexion au serveur puis rechargez la page.</ErrorNotice>}
        {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Kpi
            label={`Encaissé · ${format(now, "MMMM", { locale: fr })}`}
            value={formatAmount(stats.revenueThis)}
            extra={revenueDelta !== null ? <Delta value={revenueDelta} unit=" %" /> : <span className="text-sm text-ink-secondary">Paiements confirmés</span>}
          />
          <Kpi label="Nouvelles candidatures" value={String(stats.newThis)} extra={<Delta value={stats.newDelta} />} />
          <Kpi label="Inscrits confirmés" value={String(stats.active)} extra={<span className="text-sm text-ink-secondary">Accès ouverts</span>} />
          <Kpi label="À traiter" value={String(todos.reduce((s, t) => s + t.count, 0))} extra={<span className="text-sm text-ink-secondary">Actions en attente</span>} />
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <Card radius="stat" className="flex flex-col gap-5 border border-[#E7E0D4] p-5 lg:p-6">
              <h2 className="font-heading text-xl font-bold text-navy">Candidatures par mois</h2>
              <div className="flex h-44 items-end gap-3" role="img" aria-label="Candidatures des six derniers mois">
                {stats.months.map((m) => (
                  <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-sm font-bold text-navy">{m.count}</span>
                    <div className="w-full rounded-t-lg bg-navy" style={{ height: `${Math.max(4, (m.count / max) * 120)}px` }} />
                    <span className="text-xs text-ink-secondary">{m.label}</span>
                  </div>
                ))}
              </div>
              {(regs.data?.totalElements ?? 0) > SAMPLE && (
                <p className="text-xs text-ink-secondary">Calculé sur les {SAMPLE} candidatures les plus récentes.</p>
              )}
            </Card>

            <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-bold text-navy">Sessions à venir</h2>
                <Button asChild variant="outline" size="sm" shape="rounded"><Link to="/admin/bootcamp-sessions"><Plus />Nouvelle session</Link></Button>
              </div>
              {formations.isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-ink-secondary" />}
              {!formations.isLoading && upcoming.length === 0 && <p className="text-sm text-ink-secondary">Aucune session programmée. Créez-en une depuis « Sessions ».</p>}
              {upcoming.map(({ s, f }) => {
                const pct = s.maxParticipants ? Math.min(100, Math.round((s.currentParticipants / s.maxParticipants) * 100)) : 0;
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#E7E0D4] py-3 last:border-b-0">
                    <div className="flex min-w-0 flex-1 basis-48 flex-col">
                      <span className="truncate font-semibold text-ink">{s.sessionName ?? f.title}</span>
                      <span className="truncate text-xs text-ink-secondary">{f.domain?.name ?? f.title} · {f.deliveredBy === "PARTNER" ? f.partner?.name ?? "Partenaire" : "Model Technologie"}</span>
                    </div>
                    <span className="w-24 text-sm text-ink-secondary">{s.startDate ? format(new Date(s.startDate), "d MMM yyyy", { locale: fr }) : "—"}</span>
                    <div className="flex w-44 flex-col gap-1">
                      <div role="progressbar" aria-label={`Remplissage ${s.sessionName ?? f.title}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-pill bg-[#ECE6DB]">
                        <div className="h-full rounded-pill" style={{ width: `${pct}%`, background: pct >= 100 ? "#8A5A00" : "#1F6B4F" }} />
                      </div>
                      <span className="text-xs text-ink-secondary">{s.currentParticipants} / {s.maxParticipants} places</span>
                    </div>
                    <Button asChild variant="outline" size="sm" shape="rounded"><Link to={`/admin/sessions/${s.id}`}>Gérer</Link></Button>
                  </div>
                );
              })}
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-5 lg:p-6">
              <h2 className="mb-1 font-heading text-xl font-bold text-navy">À traiter</h2>
              {todos.length === 0 && !loading && <p className="text-sm text-ink-secondary">Rien en attente. Beau travail !</p>}
              {todos.map((t) => (
                <Link key={t.title} to={t.to} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-app-bg">
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-pill bg-cta px-2 text-sm font-bold text-white">{t.count}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-semibold text-ink">{t.title}</span>
                    <span className="truncate text-xs text-ink-secondary">{t.hint}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-secondary" />
                </Link>
              ))}
            </Card>

            <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-5 lg:p-6">
              <h2 className="mb-1 font-heading text-xl font-bold text-navy">Activité récente</h2>
              {activity.length === 0 && !loading && <p className="text-sm text-ink-secondary">Aucune activité pour le moment.</p>}
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-navy text-xs font-bold text-white">
                    {a.who.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 text-sm"><b>{a.who}</b> {a.text}</span>
                  <span className="shrink-0 text-xs text-ink-secondary">{format(new Date(a.at), "d MMM", { locale: fr })}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
