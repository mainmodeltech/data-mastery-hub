/**
 * AdminDashboard.tsx — tableau de bord du back-office (docs/design/screens/app/App-Admin-Dashboard.dc.html).
 *
 * Alimenté par GET /admin/stats/overview?from&to et GET /admin/stats/actions (contrat §3.D nonies).
 * Réservé SUPER_ADMIN et ADMIN : les autres rôles sont redirigés vers leur première page utile.
 * Montants en XOF (« 150 000 FCFA ») ; un taux null s'affiche « — ».
 */
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronRight, Loader2 } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ErrorNotice, errorMessage } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useAdminActions, useCanSeeStats, useStatsOverview } from "@/hooks/useAdminStats";
import { useAuth } from "@/hooks/useAuth";
import { backOfficeHome } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/httpClient";
import { formatAmount, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/types/payment.type";
import { formatRate, MAX_PERIOD_DAYS, type StatsOverview } from "@/types/stats.type";

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const longDate = (s: string) => format(parseISO(s), "d MMM yyyy", { locale: fr });
const count = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

const PRESETS = [
  { key: "7", label: "7 jours", days: 7 },
  { key: "30", label: "30 jours", days: 30 },
  { key: "90", label: "90 jours", days: 90 },
  { key: "365", label: "12 mois", days: 365 },
] as const;

const PROFILE_LABELS: Record<string, string> = { STUDENT: "Étudiant(e)", PROFESSIONAL: "Professionnel(le)", ENTREPRISE: "Entreprise", ENTREPRENEUR: "Entrepreneur(e)" };
const SOURCE_LABELS: Record<string, string> = { ADMIN: "Saisie manuelle", WEB: "Site web", WEBSITE: "Site web", SITE: "Site web" };
const MESSAGE_TYPE_LABELS: Record<string, string> = { CONTACT: "Contact", DIAGNOSTIC: "Diagnostic entreprise", PARTNER_APPLICATION: "Candidature partenaire" };
const SESSION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon", UPCOMING: "À venir", OPEN: "Inscriptions ouvertes", CLOSED: "Clôturée",
  IN_PROGRESS: "En cours", COMPLETED: "Terminée", CANCELLED: "Annulée",
};

const countryName = (() => {
  try {
    const names = new Intl.DisplayNames(["fr"], { type: "region" });
    return (code: string) => (/^[A-Za-z]{2}$/.test(code) ? names.of(code.toUpperCase()) ?? code : code);
  } catch {
    return (code: string) => code;
  }
})();

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "error" }) {
  return (
    <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-5">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className={cn("font-heading text-[28px] font-extrabold leading-none", tone === "error" ? "text-error" : "text-navy")}>{value}</span>
      {hint && <span className="text-xs text-ink-secondary">{hint}</span>}
    </Card>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <Card radius="stat" className="flex min-w-0 flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-navy">{title}</h2>
        {aside}
      </div>
      {children}
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-secondary">{children}</p>;
}

function FunnelStep({ label, value, rate, max }: { label: string; value: number; rate?: string; max: number }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-ink-secondary"><b className="text-navy">{count(value)}</b>{rate ? ` · ${rate}` : ""}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-pill bg-[#ECE6DB]" role="img" aria-label={`${label} : ${value}`}>
        <div className="h-full rounded-pill bg-navy" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Répartition : barres proportionnelles au plus grand total, 6 lignes maximum. */
function Breakdown({ title, data, label }: { title: string; data: Record<string, number>; label?: (key: string) => string }) {
  const rows = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(1, ...rows.map(([, v]) => v));
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-navy">{title}</h3>
      {rows.length === 0 ? (
        <Empty>Aucune donnée sur la période.</Empty>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map(([key, value]) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 truncate text-ink" title={label ? label(key) : key}>{label ? label(key) : key}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-pill bg-[#ECE6DB]">
                <span className="block h-full rounded-pill bg-navy-medium" style={{ width: `${Math.max(3, (value / max) * 100)}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right font-semibold text-navy">{count(value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MonthlyChart({ monthly }: { monthly: StatsOverview["monthly"] }) {
  const data = monthly.map((m) => ({
    ...m,
    label: format(parseISO(`${m.month}-01`), "MMM yy", { locale: fr }),
  }));
  if (data.length === 0) return <Empty>Aucune donnée sur la période.</Empty>;
  return (
    <>
      <div className="h-64 w-full" role="img" aria-label="Encaissé et candidatures par mois">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#4A5566" }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="amount" tick={{ fontSize: 12, fill: "#4A5566" }} tickLine={false} axisLine={false} width={56}
              tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M` : v >= 1000 ? `${Math.round(v / 1000)} k` : String(v))} />
            <YAxis yAxisId="count" orientation="right" allowDecimals={false} tick={{ fontSize: 12, fill: "#4A5566" }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              formatter={(value: number, name: string) => (name === "Encaissé" ? formatAmount(value) : count(value))}
              contentStyle={{ borderRadius: 12, border: "1px solid #E7E0D4", fontSize: 13 }}
            />
            <Bar yAxisId="amount" dataKey="collected" name="Encaissé" fill="#1A3A5B" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Line yAxisId="count" dataKey="registrations" name="Candidatures" stroke="#C73A08" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-navy" />Encaissé (FCFA, axe gauche)</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-cta" />Candidatures (axe droit)</span>
      </div>
      {/* Équivalent texte du graphique pour les lecteurs d'écran */}
      <table className="sr-only">
        <caption>Encaissé et candidatures par mois</caption>
        <thead><tr><th>Mois</th><th>Encaissé</th><th>Candidatures</th></tr></thead>
        <tbody>{data.map((m) => <tr key={m.month}><td>{m.label}</td><td>{formatAmount(m.collected)}</td><td>{m.registrations}</td></tr>)}</tbody>
      </table>
    </>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const canSeeStats = useCanSeeStats();
  const today = useMemo(() => new Date(), []);

  const [preset, setPreset] = useState<string>("30");
  const [range, setRange] = useState(() => ({ from: iso(subDays(today, 29)), to: iso(today) }));
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo] = useState(range.to);

  const customError = useMemo(() => {
    if (!customFrom || !customTo) return "Renseignez les deux dates.";
    const days = differenceInCalendarDays(parseISO(customTo), parseISO(customFrom));
    if (days < 0) return "La date de début doit précéder la date de fin.";
    if (days + 1 > MAX_PERIOD_DAYS) return `La période ne peut pas dépasser ${MAX_PERIOD_DAYS} jours.`;
    return null;
  }, [customFrom, customTo]);

  const overview = useStatsOverview(range.from, range.to, canSeeStats);
  const todo = useAdminActions();

  // Le tableau de bord est masqué aux autres rôles : on les envoie vers leur première page utile
  if (!canSeeStats) {
    return <Navigate to={backOfficeHome(user?.roles)} replace />;
  }

  const choosePreset = (key: string, days: number) => {
    const next = { from: iso(subDays(today, days - 1)), to: iso(today) };
    setPreset(key);
    setRange(next);
    setCustomFrom(next.from);
    setCustomTo(next.to);
  };

  const applyCustom = () => {
    if (customError) return;
    setPreset("custom");
    setRange({ from: customFrom, to: customTo });
  };

  const o = overview.data;
  const a = todo.data;
  const queues = a
    ? [
        { n: a.newApplications, title: "Candidatures à examiner", to: "/admin/candidatures" },
        { n: a.paymentsToConfirm, title: "Paiements à confirmer", to: "/admin/candidatures" },
        { n: a.overdueInstallments, title: "Échéances en retard", to: "/admin/candidatures", urgent: true },
        { n: a.unreadMessages, title: "Messages non lus", to: "/admin/messages" },
        { n: a.openQuestions, title: "Questions sans réponse", to: "/admin/bootcamp-sessions" },
        { n: a.projectsToReview, title: "Projets à corriger", to: "/admin/bootcamp-sessions" },
        { n: a.upcomingLives, title: "Lives dans les 7 jours", to: "/admin/bootcamp-sessions" },
        { n: a.failedEmails, title: "E-mails en échec (7 jours)", to: null, urgent: true },
      ].filter((q) => q.n > 0)
    : [];

  const periodError =
    overview.error instanceof ApiError && overview.error.status === 400
      ? overview.error.message
      : overview.isError
        ? errorMessage(overview.error, "Impossible de charger les indicateurs. Vérifiez la connexion au serveur puis réessayez.")
        : null;

  return (
    <AdminLayout title="Tableau de bord" description={`Du ${longDate(range.from)} au ${longDate(range.to)}`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Période">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                type="button"
                size="sm"
                shape="pill"
                variant={preset === p.key ? "navy" : "outline"}
                aria-pressed={preset === p.key}
                onClick={() => choosePreset(p.key, p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
              Du
              <input type="date" value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-xl border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
              Au
              <input type="date" value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-xl border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy" />
            </label>
            <Button type="button" size="sm" shape="rounded" variant="outline" disabled={!!customError} onClick={applyCustom}>Appliquer</Button>
            {customError && <span role="alert" className="text-xs text-error">{customError}</span>}
          </div>
        </div>

        {periodError && <ErrorNotice>{periodError}</ErrorNotice>}
        {overview.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}

        {queues.length > 0 && (
          <Section title="À traiter">
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {queues.map((q) => {
                const inner = (
                  <>
                    <span className={cn("flex h-9 min-w-9 items-center justify-center rounded-pill px-2 text-sm font-bold text-white", q.urgent ? "bg-error" : "bg-cta")}>{q.n}</span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">{q.title}</span>
                    {q.to && <ChevronRight className="h-4 w-4 shrink-0 text-ink-secondary" />}
                  </>
                );
                return (
                  <li key={q.title}>
                    {q.to ? (
                      <Link to={q.to} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-app-bg">{inner}</Link>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {o && (
          <>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <Kpi label="Encaissé" value={formatAmount(o.revenue.collected, o.currency)} hint={o.revenue.averagePayment != null ? `Paiement moyen ${formatAmount(o.revenue.averagePayment, o.currency)}` : "Paiements confirmés"} />
              <Kpi label="Net" value={formatAmount(o.revenue.net, o.currency)} hint={`Remboursé ${formatAmount(o.revenue.refunded, o.currency)}`} />
              <Kpi label="Reste à encaisser" value={formatAmount(o.revenue.outstanding, o.currency)} hint="Toutes périodes" />
              <Kpi label="En retard" value={formatAmount(o.revenue.overdue, o.currency)} hint="Échéances dépassées, toutes périodes" tone={o.revenue.overdue > 0 ? "error" : undefined} />
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <Section title="Parcours des candidatures">
                {o.funnel.submitted === 0 ? (
                  <Empty>Aucune candidature déposée sur la période.</Empty>
                ) : (
                  <div className="flex flex-col gap-4">
                    <FunnelStep label="Candidatures déposées" value={o.funnel.submitted} max={o.funnel.submitted} />
                    <FunnelStep label="Acceptées" value={o.funnel.accepted} rate={`${formatRate(o.funnel.acceptanceRate)} des candidatures`} max={o.funnel.submitted} />
                    <FunnelStep label="Payées" value={o.funnel.paid} rate={`${formatRate(o.funnel.paymentRate)} des acceptées`} max={o.funnel.submitted} />
                    <p className="text-sm text-ink-secondary">Conversion globale : <b className="text-navy">{formatRate(o.funnel.conversionRate)}</b></p>
                  </div>
                )}
              </Section>

              <Section title="Évolution mensuelle">
                <MonthlyChart monthly={o.monthly} />
              </Section>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-2">
              <Section title="Remplissage des sessions">
                {o.sessions.length === 0 ? (
                  <Empty>Aucune session à venir ou en cours.</Empty>
                ) : (
                  <ul className="flex flex-col">
                    {o.sessions.map((s) => {
                      const pct = s.fillRate ?? 0;
                      return (
                        <li key={s.sessionId} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#E7E0D4] py-3 last:border-b-0">
                          <div className="flex min-w-0 flex-1 basis-44 flex-col">
                            <span className="truncate font-semibold text-ink">{s.sessionName ?? s.formationTitle ?? "Session"}</span>
                            <span className="truncate text-xs text-ink-secondary">
                              {s.formationTitle && s.sessionName ? `${s.formationTitle} · ` : ""}
                              {s.startDate ? longDate(s.startDate) : "Date à définir"} · {SESSION_STATUS_LABELS[s.status] ?? s.status}
                            </span>
                          </div>
                          <div className="flex w-44 flex-col gap-1">
                            <div role="progressbar" aria-label={`Remplissage ${s.sessionName ?? s.formationTitle ?? ""}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                              className="h-2 overflow-hidden rounded-pill bg-[#ECE6DB]">
                              <div className="h-full rounded-pill" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 100 ? "#8A5A00" : "#1F6B4F" }} />
                            </div>
                            <span className="text-xs text-ink-secondary">
                              {s.capacity > 0 ? `${s.confirmed} / ${s.capacity} places · ${formatRate(s.fillRate)}` : `${s.confirmed} inscrits`}
                              {s.pending > 0 ? ` · ${s.pending} en cours` : ""}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>

              <Section title="Formations les plus demandées">
                {o.topFormations.length === 0 ? (
                  <Empty>Aucune candidature sur la période.</Empty>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] text-sm">
                      <thead>
                        <tr className="border-b border-[#E7E0D4] text-left text-xs text-ink-secondary">
                          <th scope="col" className="pb-2 font-semibold">Formation</th>
                          <th scope="col" className="pb-2 text-right font-semibold">Candidatures</th>
                          <th scope="col" className="pb-2 text-right font-semibold">Payées</th>
                          <th scope="col" className="pb-2 text-right font-semibold">Encaissé</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.topFormations.map((f) => (
                          <tr key={f.formationId} className="border-b border-[#E7E0D4] last:border-b-0">
                            <td className="max-w-[220px] truncate py-2.5 pr-3 font-semibold text-ink" title={f.title}>{f.title}</td>
                            <td className="py-2.5 text-right">{count(f.registrations)}</td>
                            <td className="py-2.5 text-right">{count(f.paid)}</td>
                            <td className="py-2.5 text-right font-semibold text-navy">{formatAmount(f.collected, o.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>

            <Section title="Répartitions des candidatures">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <Breakdown title="Source" data={o.breakdowns.bySource} label={(k) => SOURCE_LABELS[k] ?? k} />
                <Breakdown title="Profil" data={o.breakdowns.byProfile} label={(k) => PROFILE_LABELS[k] ?? k} />
                <Breakdown title="Pays" data={o.breakdowns.byCountry} label={countryName} />
                <Breakdown title="Code promo" data={o.breakdowns.byPromoCode} />
              </div>
              {Object.keys(o.revenue.collectedByMethod ?? {}).length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-[#E7E0D4] pt-4">
                  <span className="mr-1 text-sm font-bold text-navy">Encaissé par moyen :</span>
                  {Object.entries(o.revenue.collectedByMethod).map(([m, v]) => (
                    <Pill key={m} variant="info">{PAYMENT_METHOD_LABELS[m as PaymentMethod] ?? m} · {formatAmount(v, o.currency)}</Pill>
                  ))}
                </div>
              )}
            </Section>

            <div className="grid gap-5 lg:grid-cols-2">
              <Section title="Apprenants et certificats">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-ink-secondary">Apprenants</dt><dd className="font-heading text-2xl font-extrabold text-navy">{count(o.learners.total)}</dd></div>
                  <div><dt className="text-ink-secondary">Nouveaux sur la période</dt><dd className="font-heading text-2xl font-extrabold text-navy">{count(o.learners.newInPeriod)}</dd></div>
                  <div><dt className="text-ink-secondary">Accès actifs</dt><dd className="font-heading text-2xl font-extrabold text-navy">{count(o.learners.activeEnrollments)}</dd></div>
                  <div>
                    <dt className="text-ink-secondary">Certificats délivrés</dt>
                    <dd className="font-heading text-2xl font-extrabold text-navy">{count(o.learners.certificatesIssued)}<span className="text-sm font-semibold text-ink-secondary"> / {count(o.learners.certificatesTotal)} au total</span></dd>
                  </div>
                </dl>
              </Section>

              <Section title="Newsletter et messages">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-ink-secondary">Abonnés newsletter</dt><dd className="font-heading text-2xl font-extrabold text-navy">{count(o.audience.newsletterSubscribers)}</dd></div>
                  <div><dt className="text-ink-secondary">Nouveaux sur la période</dt><dd className="font-heading text-2xl font-extrabold text-navy">{count(o.audience.newsletterNewInPeriod)}</dd></div>
                </dl>
                <Breakdown title="Messages reçus sur la période" data={o.audience.contactMessagesByType} label={(k) => MESSAGE_TYPE_LABELS[k] ?? k} />
              </Section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
