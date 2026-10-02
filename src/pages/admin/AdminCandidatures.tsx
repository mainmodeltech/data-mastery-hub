/**
 * AdminCandidatures.tsx — Lot 4 (docs/design/README.md §2, screens/app/App-Admin-Candidatures.dc.html)
 *
 * Évolution de AdminInscriptions (conservée à /admin/inscriptions) en pipeline Kanban,
 * sur les données RÉELLES des inscriptions : PENDING → "Nouvelles candidatures",
 * CONFIRMED/COMPLETED → "Inscrits". Les deux colonnes de paiement dépendent de
 * l'entité Payment du backend (`feature/enrollment-payment`, pas encore livrée) :
 * affichées mais désactivées plutôt que simulées, pour qu'aucune action de
 * "confirmation de paiement" ne soit possible sur de fausses données.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Plus, Search } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button, Pill } from "@/components/shared";
import { ComingSoonLink } from "@/components/layouts/ComingSoonLink";
import { useRegistrations, useUpdateRegistrationStatus } from "@/hooks/useRegistrations";
import { useToast } from "@/hooks/use-toast";
import type { Registration, RegistrationStatus } from "@/types";

const PAGE_SIZE = 100;
const AVATAR_COLORS = ["#5B4B8A", "#0F5C73", "#8A5A00", "#1A3A5B", "#9A2E06", "#1F6B4F"];

const selectClass =
  "rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-navy";

function avatarColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function monthLabel(iso: string): string {
  return format(new Date(iso), "MMM", { locale: fr });
}

function CandidateCard({ r, actions }: { r: Registration; actions?: React.ReactNode }) {
  const name = `${r.firstName} ${r.lastName}`;
  const initials = `${r.firstName[0] ?? ""}${r.lastName[0] ?? ""}`.toUpperCase();
  const context = [r.position, r.company].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#E7E0D4] bg-white p-3.5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-xs font-bold text-white"
          style={{ background: avatarColor(name) }}
        >
          {initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold text-ink">{name}</span>
          <span className="truncate text-xs text-ink-secondary">
            {r.bootcampTitle ?? "Formation"} · {r.sessionName ?? monthLabel(r.createdAt)}
          </span>
        </span>
      </div>
      {(context || r.message) && (
        <span className="line-clamp-2 text-[13px] text-ink-secondary">
          {context}
          {context && r.message ? " · " : ""}
          {r.message ? `« ${r.message} »` : ""}
        </span>
      )}
      {actions}
    </div>
  );
}

function Column({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-stat bg-[#ECE6DB] p-3.5">
      <div className="flex items-center justify-between px-1 pt-1">
        <span className="font-sans text-[15px] font-bold text-navy">{title}</span>
        {count !== undefined && (
          <span className="rounded-pill bg-white px-2.5 py-0.5 text-[13px] font-bold text-ink-secondary">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function PendingPaymentColumn({ title }: { title: string }) {
  return (
    <Column title={title}>
      <div className="flex flex-col items-start gap-2 rounded-[14px] border border-dashed border-[#D6CEC0] p-4">
        <Pill variant="warning">en cours</Pill>
        <p className="text-[13px] text-ink-secondary">
          Disponible avec le module paiement (liens de paiement, relances, confirmation).
        </p>
      </div>
    </Column>
  );
}

export default function AdminCandidatures() {
  const { toast } = useToast();
  const { data, isLoading, isError } = useRegistrations(0, PAGE_SIZE);
  const updateStatus = useUpdateRegistrationStatus();

  const [formation, setFormation] = useState("all");
  const [session, setSession] = useState("all");
  const [search, setSearch] = useState("");

  const all: Registration[] = data?.content ?? [];
  const total = data?.totalElements ?? all.length;

  const formations = useMemo(
    () => Array.from(new Set(all.map((r) => r.bootcampTitle).filter(Boolean) as string[])).sort(),
    [all]
  );
  const sessions = useMemo(
    () => Array.from(new Set(all.map((r) => r.sessionName).filter(Boolean) as string[])).sort(),
    [all]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return all.filter((r) => {
      if (formation !== "all" && r.bootcampTitle !== formation) return false;
      if (session !== "all" && r.sessionName !== session) return false;
      if (q && !`${r.firstName} ${r.lastName} ${r.email} ${r.company ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, formation, session, search]);

  const newOnes = filtered.filter((r) => r.status === "PENDING");
  const enrolled = filtered.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED");
  const cancelledCount = filtered.filter((r) => r.status === "CANCELLED").length;

  const setStatus = async (id: string, status: RegistrationStatus, successMessage: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: successMessage });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title="Candidatures & paiements" description="Du formulaire du site à l'inscription confirmée">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Formation" className={selectClass} value={formation} onChange={(e) => setFormation(e.target.value)}>
            <option value="all">Toutes les formations</option>
            {formations.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select aria-label="Session" className={selectClass} value={session} onChange={(e) => setSession(e.target.value)}>
            <option value="all">Toutes les sessions</option>
            {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-ink-secondary" />
            <input
              type="search"
              aria-label="Rechercher une candidature"
              placeholder="Nom, e-mail, entreprise…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent text-sm outline-none"
            />
          </div>
          <span className="flex-1" />
          <Button asChild variant="outline" shape="rounded" size="sm">
            <Link to="/admin/promo-codes">Codes promo</Link>
          </Button>
          <ComingSoonLink
            title="Inscription manuelle"
            className="rounded-card bg-navy px-4 py-2.5 font-sans text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Inscription manuelle
          </ComingSoonLink>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-ink-secondary" />
          </div>
        ) : isError ? (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger les candidatures. Vérifiez la connexion au serveur puis rechargez la page.
          </div>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Column title="Nouvelles candidatures" count={newOnes.length}>
              {newOnes.length === 0 && <p className="px-1 text-[13px] text-ink-secondary">Aucune nouvelle candidature.</p>}
              {newOnes.map((r) => (
                <CandidateCard
                  key={r.id}
                  r={r}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        shape="rounded"
                        variant="navy"
                        size="sm"
                        disabled={updateStatus.isPending}
                        onClick={() => setStatus(r.id, "CONFIRMED", "Candidature acceptée")}
                      >
                        Accepter
                      </Button>
                      <Button
                        shape="rounded"
                        variant="outline"
                        size="sm"
                        className="border-transparent"
                        disabled={updateStatus.isPending}
                        onClick={() => setStatus(r.id, "CANCELLED", "Candidature refusée")}
                      >
                        Refuser
                      </Button>
                    </div>
                  }
                />
              ))}
            </Column>

            <PendingPaymentColumn title="Paiement en attente" />
            <PendingPaymentColumn title="Paiement à confirmer" />

            <Column title="Inscrits" count={enrolled.length}>
              {enrolled.length === 0 && <p className="px-1 text-[13px] text-ink-secondary">Aucun inscrit pour le moment.</p>}
              {enrolled.map((r) => (
                <CandidateCard
                  key={r.id}
                  r={r}
                  actions={
                    <div className="flex items-center justify-between gap-2">
                      <Pill variant={r.status === "COMPLETED" ? "info" : "success"}>
                        {r.status === "COMPLETED" ? "Terminé" : "Confirmé"}
                      </Pill>
                      {r.status === "CONFIRMED" && (
                        <Button
                          shape="rounded"
                          variant="outline"
                          size="sm"
                          className="border-transparent"
                          disabled={updateStatus.isPending}
                          onClick={() => setStatus(r.id, "COMPLETED", "Marqué comme terminé")}
                        >
                          Marquer terminé
                        </Button>
                      )}
                    </div>
                  }
                />
              ))}
            </Column>
          </div>
        )}

        {!isLoading && !isError && (
          <p className="text-xs text-ink-secondary">
            {cancelledCount} refusée(s)/annulée(s) non affichée(s)
            {total > PAGE_SIZE ? ` · ${PAGE_SIZE} inscriptions les plus récentes sur ${total} chargées` : ""}.{" "}
            L'historique complet reste disponible dans <Link to="/admin/inscriptions" className="font-semibold text-navy">Inscriptions</Link>.
          </p>
        )}

        <div className="rounded-[14px] bg-info-bg px-5 py-4 text-sm leading-relaxed text-navy">
          <span className="font-bold">Suivi des paiements :</span> liens de paiement, relances et confirmation
          arriveront avec le module paiement. En attendant, « Accepter » confirme l'inscription.
        </div>
      </div>
    </AdminLayout>
  );
}
