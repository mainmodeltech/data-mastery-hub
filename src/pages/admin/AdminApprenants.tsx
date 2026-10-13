/**
 * AdminApprenants.tsx — comptes apprenants et accès aux sessions.
 * Un compte est créé automatiquement à la confirmation du premier paiement ; on peut aussi
 * inviter un apprenant à la main (e-mail d'invitation valable 72 h), le désactiver (les jetons
 * déjà émis sont refusés) ou renvoyer l'invitation tant que le mot de passe n'est pas défini.
 */
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MailPlus, Plus, Search } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Field, inputClass } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAdminLearners, useCreateLearner, useResendInvitation, useSetLearnerActive } from "@/hooks/useAccountsAdmin";
import { useEnrollments } from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AdminLearner, LearnerPayload } from "@/types/accounts.type";

const day = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "—");
const ENROLLMENT_LABELS = { ACTIVE: "Actif", SUSPENDED: "Suspendu", COMPLETED: "Terminé", CANCELLED: "Annulé" } as const;
const ENROLLMENT_PILL = { ACTIVE: "success", SUSPENDED: "warning", COMPLETED: "info", CANCELLED: "neutral" } as const;

function InviteDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateLearner();
  const [form, setForm] = useState<LearnerPayload>({ firstName: "", lastName: "", email: "", phone: "", country: "" });
  const [error, setError] = useState("");
  const set = (k: keyof LearnerPayload, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);
    try {
      await create.mutateAsync({
        firstName: form.firstName.trim(), lastName: clean(form.lastName), email: form.email.trim(),
        phone: clean(form.phone), country: clean(form.country),
      });
      toast({ title: "Invitation envoyée", description: form.email });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Création impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !create.isPending && onClose()}>
      <DialogContent className="max-w-lg rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Inviter un apprenant</DialogTitle>
          <DialogDescription className="text-ink-secondary">Un e-mail lui permet de définir son mot de passe (lien valable 72 h).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom *" htmlFor="ln-first"><input id="ln-first" required className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
            <Field label="Nom" htmlFor="ln-last"><input id="ln-last" className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
          </div>
          <Field label="E-mail *" htmlFor="ln-mail"><input id="ln-mail" type="email" required className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="ln-phone"><input id="ln-phone" className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Pays" htmlFor="ln-country"><input id="ln-country" className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
          </div>
          <p className="text-xs text-ink-secondary">L'accès aux formations s'ouvre à la confirmation d'un paiement (Candidatures &amp; paiements).</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={create.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={create.isPending}>{create.isPending ? <Loader2 className="animate-spin" /> : "Envoyer l'invitation"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LearnersTab() {  const { can } = useAuth();
  const canManage = can("LEARNERS_MANAGE");

  const { toast } = useToast();
  const { data: learners = [], isLoading, isError } = useAdminLearners();
  const setActive = useSetLearnerActive();
  const resend = useResendInvitation();
  const [query, setQuery] = useState("");
  const [inviting, setInviting] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return learners.filter((l) => !q || `${l.firstName} ${l.lastName ?? ""} ${l.email}`.toLowerCase().includes(q));
  }, [learners, query]);

  const toggle = async (l: AdminLearner) => {
    if (l.active && !window.confirm(`Désactiver ${l.firstName} ${l.lastName ?? ""} ? Ses connexions en cours seront refusées.`)) return;
    try {
      await setActive.mutateAsync({ id: l.id, active: !l.active });
      toast({ title: l.active ? "Compte désactivé" : "Compte réactivé" });
    } catch (err) {
      toast({ title: "Action impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  const reinvite = async (l: AdminLearner) => {
    try {
      await resend.mutateAsync(l.id);
      toast({ title: "Invitation renvoyée", description: l.email });
    } catch (err) {
      toast({ title: "Envoi impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
          <input aria-label="Rechercher un apprenant" className={`${inputClass} pl-10`} placeholder="Nom ou e-mail…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {canManage && <Button type="button" shape="rounded" size="sm" onClick={() => setInviting(true)}><Plus />Inviter un apprenant</Button>}
      </div>

      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>Impossible de charger les apprenants.</ErrorNotice>}
      {!isLoading && !isError && learners.length === 0 && (
        <EmptyState title="Aucun apprenant" text="Les comptes sont créés à la confirmation du premier paiement, ou par invitation." />
      )}

      {shown.map((l) => (
        <Card key={l.id} radius="stat" className="flex flex-wrap items-center gap-4 border border-[#E7E0D4] p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-navy text-sm font-bold text-white">
            {`${l.firstName[0] ?? ""}${l.lastName?.[0] ?? ""}`.toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">{l.firstName} {l.lastName}</span>
              <Pill variant={l.active ? "success" : "neutral"}>{l.active ? "Actif" : "Désactivé"}</Pill>
              {!l.passwordSet && <Pill variant="warning">Invitation en attente</Pill>}
            </div>
            <span className="truncate text-sm text-ink-secondary">{l.email}{l.phone ? ` · ${l.phone}` : ""}{l.country ? ` · ${l.country}` : ""}</span>
            <span className="text-xs text-ink-secondary">Inscrit le {day(l.createdAt)} · dernière connexion : {day(l.lastLoginAt)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {canManage && !l.passwordSet && (
              <Button type="button" variant="outline" shape="rounded" size="sm" disabled={resend.isPending} onClick={() => void reinvite(l)}>
                <MailPlus />Renvoyer l'invitation
              </Button>
            )}
            {canManage && (
              <Button type="button" variant="outline" shape="rounded" size="sm" disabled={setActive.isPending} onClick={() => void toggle(l)}>
                {l.active ? "Désactiver" : "Réactiver"}
              </Button>
            )}
          </div>
        </Card>
      ))}
      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
    </div>
  );
}

function EnrollmentsTab() {
  const { data: enrollments = [], isLoading, isError } = useEnrollments();
  return (
    <div className="flex flex-col gap-3">
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>Impossible de charger les accès.</ErrorNotice>}
      {!isLoading && !isError && enrollments.length === 0 && (
        <EmptyState title="Aucun accès ouvert" text="Un accès est créé quand le premier paiement d'une inscription est confirmé." />
      )}
      {enrollments.map((e) => (
        <Card key={e.id} radius="stat" className="flex flex-wrap items-center gap-4 border border-[#E7E0D4] p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-bold text-ink">{e.learnerName}</span>
            <span className="truncate text-sm text-ink-secondary">{e.learnerEmail}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            <span className="font-semibold text-navy">{e.bootcampTitle ?? "Formation"}</span>
            <span className="text-ink-secondary">{e.sessionName ?? "—"} · accès du {day(e.accessStartsAt)} au {day(e.accessEndsAt)}</span>
          </div>
          <Pill variant={ENROLLMENT_PILL[e.status]}>{ENROLLMENT_LABELS[e.status]}</Pill>
        </Card>
      ))}
    </div>
  );
}

export default function AdminApprenants() {
  const [tab, setTab] = useState<"learners" | "access">("learners");
  return (
    <AdminLayout title="Apprenants" description="Comptes et accès aux sessions">
      <div className="flex flex-col gap-5">
        <div role="tablist" aria-label="Apprenants" className="flex w-fit gap-1 rounded-xl bg-[#ECE6DB] p-1">
          {([["learners", "Comptes"], ["access", "Accès aux sessions"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn("rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors", tab === key ? "bg-white text-navy shadow-sm" : "text-ink-secondary hover:text-navy")}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "learners" ? <LearnersTab /> : <EnrollmentsTab />}
      </div>
    </AdminLayout>
  );
}
