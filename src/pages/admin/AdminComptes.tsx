/**
 * AdminComptes.tsx — comptes du back-office (équipe, formateurs, partenaires).
 * Réservé au SUPER_ADMIN côté backend (403 sinon). Un compte créé reçoit une invitation par e-mail.
 * Garde-fous serveur : on ne peut ni se désactiver, ni retirer le dernier SUPER_ADMIN actif.
 */
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Pencil, Plus, ShieldCheck, ShieldOff } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAdminUsers, useCreateUser, useResetMfa, useUpdateUser } from "@/hooks/useAccountsAdmin";
import { useAdminPartners } from "@/hooks/useCatalogAdmin";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/services/httpClient";
import { PARTNER_PROFILE, plainRole, type AdminUserAccount, type StaffRole } from "@/types/accounts.type";
import type { StaffProfile } from "@/types/profiles.type";

const day = (iso: string | null) => (iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "jamais");

function UserDialog({ user, profiles, onClose }: { user: AdminUserAccount | null; profiles: StaffProfile[]; onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateUser();
  const update = useUpdateUser();
  const { data: partners = [] } = useAdminPartners();
  const [email, setEmail] = useState(user?.email ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [roles, setRoles] = useState<StaffRole[]>((user?.roles ?? []).map(plainRole));
  const [partnerId, setPartnerId] = useState(user?.partnerId ?? "");
  const [active, setActive] = useState(user?.active ?? true);
  const [error, setError] = useState("");
  const pending = create.isPending || update.isPending;

  const toggleRole = (r: StaffRole) => setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (roles.length === 0) return setError("Choisissez au moins un profil.");
    if (roles.includes(PARTNER_PROFILE) && !partnerId) return setError("Le profil Partenaire exige un partenaire rattaché.");
    const pid = roles.includes(PARTNER_PROFILE) ? partnerId : null;
    try {
      if (user) {
        await update.mutateAsync({ id: user.id, payload: { fullName: fullName.trim(), roles, partnerId: pid, active } });
        toast({ title: "Compte mis à jour", description: user.email });
      } else {
        await create.mutateAsync({ email: email.trim(), fullName: fullName.trim(), roles, partnerId: pid });
        toast({ title: "Compte créé", description: "Une invitation a été envoyée par e-mail." });
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{user ? "Modifier le compte" : "Nouveau compte"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            {user ? user.email : "La personne reçoit un e-mail pour définir son mot de passe."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          {!user && <Field label="E-mail *" htmlFor="us-mail"><input id="us-mail" type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>}
          <Field label="Nom complet *" htmlFor="us-name"><input id="us-name" required className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-ink">Profils * <span className="font-normal text-ink-secondary">(on peut en cumuler plusieurs)</span></legend>
            {profiles.map((p) => {
              const r = plainRole(p.name);
              return (
                <label key={p.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E7E0D4] bg-white px-3.5 py-2.5">
                  <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} className="mt-1 h-4 w-4 accent-[#1A3A5B]" />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-ink">{p.label}</span>
                    <span className="text-xs text-ink-secondary">{p.description ?? ""}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          {roles.includes(PARTNER_PROFILE) && (
            <Field label="Partenaire rattaché *" htmlFor="us-partner">
              <select id="us-partner" className={inputClass} value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                <option value="">— Choisir —</option>
                {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          )}
          {user && <SwitchRow label="Compte actif" description="Désactivé : connexion refusée." checked={active} onChange={setActive} />}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : user ? "Enregistrer" : "Créer et inviter"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminComptes() {
  const { user: me, can } = useAuth();
  const isSuper = can("ACCOUNTS_MANAGE");
  const { data: users = [], isLoading, error } = useAdminUsers();
  const { data: profiles = [] } = useProfiles();
  const labelOf = (role: string) => profiles.find((p) => p.name === role || plainRole(p.name) === plainRole(role))?.label ?? plainRole(role);
  const [editing, setEditing] = useState<AdminUserAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const resetMfa = useResetMfa();
  const { toast } = useToast();
  const forbidden = error instanceof ApiError && error.status === 403;

  return (
    <AdminLayout
      title="Comptes"
      description="Équipe, formateurs et partenaires du back-office : chaque personne reçoit un ou plusieurs profils"
      actions={isSuper ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau compte</Button> : undefined}
    >
      <div className="flex flex-col gap-4">
        {!isSuper && <ErrorNotice>Vous n'avez pas le droit de gérer les comptes.</ErrorNotice>}
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {error && !forbidden && <ErrorNotice>Impossible de charger les comptes.</ErrorNotice>}
        {!isLoading && !error && users.length === 0 && <EmptyState title="Aucun compte" />}
        {users.map((u) => (
          <Card key={u.id} radius="stat" className="flex flex-wrap items-center gap-4 border border-[#E7E0D4] p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-success text-sm font-bold text-white">
              {u.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-ink">{u.fullName}</span>
                {!u.active && <Pill variant="neutral">Désactivé</Pill>}
                {u.email === me?.email && <Pill variant="info">Vous</Pill>}
                {u.mfaEnabled
                  ? <Pill variant="success"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Double authentification</Pill>
                  : <Pill variant="warning"><ShieldOff className="mr-1 inline h-3.5 w-3.5" />À configurer</Pill>}
              </div>
              <span className="truncate text-sm text-ink-secondary">{u.email}</span>
              <div className="flex flex-wrap gap-1.5">
                {u.roles.map((r) => <Pill key={r} variant="info">{labelOf(r)}</Pill>)}
              </div>
              <span className="text-xs text-ink-secondary">Dernière connexion : {day(u.lastLoginAt)}</span>
            </div>
            {isSuper && (
              <div className="flex flex-wrap gap-2">
                {u.mfaEnabled && u.email !== me?.email && (
                  <Button
                    type="button"
                    variant="outline"
                    shape="rounded"
                    size="sm"
                    disabled={resetMfa.isPending}
                    onClick={() => {
                      if (!window.confirm(`Réinitialiser la double authentification de ${u.fullName} ?\nSes sessions seront fermées et il devra configurer un nouvel appareil à sa prochaine connexion. Il sera prévenu par e-mail.`)) return;
                      resetMfa.mutate(u.id, {
                        onSuccess: () => toast({ title: "Double authentification réinitialisée", description: `${u.fullName} en a été informé par e-mail.` }),
                        onError: (err) => toast({ title: "Réinitialisation impossible", description: errorMessage(err), variant: "destructive" }),
                      });
                    }}
                  >
                    <ShieldOff />Réinitialiser le MFA
                  </Button>
                )}
                <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setEditing(u)}><Pencil />Modifier</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      {creating && <UserDialog user={null} profiles={profiles} onClose={() => setCreating(false)} />}
      {editing && <UserDialog key={editing.id} user={editing} profiles={profiles} onClose={() => setEditing(null)} />}
    </AdminLayout>
  );
}
