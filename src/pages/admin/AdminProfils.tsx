/**
 * AdminProfils.tsx — profils et droits du back-office (direction).
 * Un profil est un ensemble de droits ; un compte cumule plusieurs profils. La direction règle ce que chaque profil peut faire,
 * crée des profils sur mesure, et dispose d'une matrice pour la revue trimestrielle des accès.
 * Garde-fous serveur : le profil « Direction » n'est pas modifiable, on ne donne que des droits qu'on détient, un profil
 * livré ne se supprime pas, un profil attribué non plus.
 */
import { Fragment, useMemo, useState } from "react";
import { Check, Loader2, Plus, RotateCcw, Trash2, Users } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateProfile, useDeleteProfile, usePermissionCatalogue, useProfiles, useResetProfile, useUpdateProfile,
} from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";
import type { PermissionDef, StaffProfile } from "@/types/profiles.type";

function groupPermissions(catalogue: PermissionDef[]): [string, PermissionDef[]][] {
  const groups = new Map<string, PermissionDef[]>();
  catalogue.forEach((p) => groups.set(p.group, [...(groups.get(p.group) ?? []), p]));
  return [...groups.entries()];
}

function ProfileDialog({
  profile, catalogue, onClose,
}: { profile: StaffProfile | null; catalogue: PermissionDef[]; onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateProfile();
  const update = useUpdateProfile();
  const reset = useResetProfile();
  const remove = useDeleteProfile();
  const [label, setLabel] = useState(profile?.label ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [granted, setGranted] = useState<Set<string>>(new Set(profile?.permissions ?? []));
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const readOnly = !!profile?.allPermissions;
  const pending = create.isPending || update.isPending || reset.isPending || remove.isPending;
  const groups = useMemo(() => groupPermissions(catalogue), [catalogue]);

  const toggle = (code: string) =>
    setGranted((cur) => {
      const next = new Set(cur);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });

  const toggleGroup = (items: PermissionDef[]) =>
    setGranted((cur) => {
      const next = new Set(cur);
      const all = items.every((p) => next.has(p.code));
      items.forEach((p) => (all ? next.delete(p.code) : next.add(p.code)));
      return next;
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = { label: label.trim(), description: description.trim(), permissions: [...granted] };
    try {
      if (profile) {
        await update.mutateAsync({ id: profile.id, payload });
        toast({ title: "Profil mis à jour", description: "Les nouveaux droits s'appliquent tout de suite côté serveur." });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Profil créé", description: payload.label });
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  const restore = async () => {
    if (!profile) return;
    setError("");
    try {
      const restored = await reset.mutateAsync(profile.id);
      setGranted(new Set(restored.permissions));
      setLabel(restored.label);
      setDescription(restored.description ?? "");
      toast({ title: "Droits par défaut rétablis", description: restored.label });
    } catch (err) {
      setError(errorMessage(err, "Impossible de rétablir les droits par défaut."));
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-callout">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold text-navy">
              {profile ? profile.label : "Nouveau profil"}
            </DialogTitle>
            <DialogDescription className="text-ink-secondary">
              {readOnly
                ? "La direction a tous les droits, y compris ceux ajoutés plus tard. Ce profil ne se modifie pas."
                : "Cochez ce que ce profil peut faire. Une personne peut cumuler plusieurs profils."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <ErrorNotice>{error}</ErrorNotice>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom du profil *" htmlFor="pf-label">
                <input id="pf-label" required minLength={3} maxLength={100} className={inputClass} value={label} disabled={readOnly}
                  onChange={(e) => setLabel(e.target.value)} />
              </Field>
              <Field label="Description" htmlFor="pf-desc">
                <input id="pf-desc" className={inputClass} value={description} disabled={readOnly} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>

            <div className="flex flex-col gap-4">
              {groups.map(([group, items]) => {
                const count = items.filter((p) => readOnly || granted.has(p.code)).length;
                return (
                  <fieldset key={group} className="rounded-card border border-[#E7E0D4] bg-white p-4">
                    <legend className="flex items-center gap-3 px-1">
                      <span className="font-heading text-sm font-bold text-navy">{group}</span>
                      <span className="text-xs text-ink-secondary">{count} / {items.length}</span>
                      {!readOnly && (
                        <button type="button" className="text-xs font-semibold text-navy hover:text-cta" onClick={() => toggleGroup(items)}>
                          {items.every((p) => granted.has(p.code)) ? "Tout retirer" : "Tout cocher"}
                        </button>
                      )}
                    </legend>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {items.map((p) => (
                        <label key={p.code} className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-app-bg", readOnly && "cursor-default")}>
                          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#1A3A5B]" disabled={readOnly}
                            checked={readOnly || granted.has(p.code)} onChange={() => toggle(p.code)} />
                          <span className="text-sm text-ink">{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {profile?.system && !readOnly && (
                  <Button type="button" variant="outline" shape="rounded" size="sm" disabled={pending} onClick={restore}>
                    <RotateCcw />Rétablir les droits par défaut
                  </Button>
                )}
                {profile && !profile.system && (
                  <Button type="button" variant="outline" shape="rounded" size="sm" disabled={pending} onClick={() => setConfirmDelete(true)}>
                    <Trash2 />Supprimer
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>{readOnly ? "Fermer" : "Annuler"}</Button>
                {!readOnly && (
                  <Button type="submit" shape="rounded" disabled={pending}>
                    {pending ? <Loader2 className="animate-spin" /> : profile ? "Enregistrer" : "Créer le profil"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {profile && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Supprimer ce profil ?"
          description={`« ${profile.label} » sera supprimé. Un profil encore attribué à des comptes ne peut pas l'être : retirez-le d'abord de ces comptes.`}
          onConfirm={async () => {
            try {
              await remove.mutateAsync(profile.id);
              toast({ title: "Profil supprimé", description: profile.label });
              onClose();
            } catch (err) {
              setConfirmDelete(false);
              setError(errorMessage(err, "Suppression impossible."));
            }
          }}
        />
      )}
    </>
  );
}

/** Revue des accès : qui peut quoi, profil par profil. */
function Matrix({ profiles, catalogue }: { profiles: StaffProfile[]; catalogue: PermissionDef[] }) {
  const groups = groupPermissions(catalogue);
  return (
    <div className="overflow-x-auto rounded-card border border-[#E7E0D4] bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[#E7E0D4] text-left text-xs text-ink-secondary">
            <th scope="col" className="sticky left-0 bg-white px-3 py-2.5 font-semibold">Droit</th>
            {profiles.map((p) => (
              <th key={p.id} scope="col" className="px-2 py-2.5 text-center font-semibold">
                <span className="block max-w-[96px] truncate" title={p.label}>{p.label}</span>
                <span className="font-normal">{p.activeUsers} compte{p.activeUsers > 1 ? "s" : ""}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(([group, items]) => (
            <Fragment key={group}>
              <tr className="bg-app-bg"><th colSpan={profiles.length + 1} scope="colgroup" className="px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wide text-navy">{group}</th></tr>
              {items.map((perm) => (
                <tr key={perm.code} className="border-b border-[#E7E0D4] last:border-b-0">
                  <th scope="row" className="sticky left-0 bg-white px-3 py-2 text-left font-normal text-ink">{perm.label}</th>
                  {profiles.map((p) => {
                    const has = p.allPermissions || p.permissions.includes(perm.code);
                    return (
                      <td key={p.id} className="px-2 py-2 text-center">
                        {has ? <Check className="mx-auto h-4 w-4 text-success" aria-label="Oui" /> : <span className="text-[#C9C0B0]" aria-label="Non">·</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminProfils() {
  const { data: profiles = [], isLoading, error } = useProfiles();
  const { data: catalogue = [] } = usePermissionCatalogue();
  const [editing, setEditing] = useState<StaffProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"cards" | "matrix">("cards");

  return (
    <AdminLayout
      title="Profils & droits"
      description="Qui peut faire quoi dans le back-office"
      actions={<Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau profil</Button>}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Affichage">
          <Button type="button" size="sm" shape="pill" variant={view === "cards" ? "navy" : "outline"} aria-pressed={view === "cards"} onClick={() => setView("cards")}>Profils</Button>
          <Button type="button" size="sm" shape="pill" variant={view === "matrix" ? "navy" : "outline"} aria-pressed={view === "matrix"} onClick={() => setView("matrix")}>Matrice des droits</Button>
          <span className="text-xs text-ink-secondary">La matrice sert à la revue trimestrielle des accès.</span>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {error && <ErrorNotice>{errorMessage(error, "Impossible de charger les profils.")}</ErrorNotice>}
        {!isLoading && !error && profiles.length === 0 && <EmptyState title="Aucun profil" />}

        {view === "matrix" && profiles.length > 0 && <Matrix profiles={profiles} catalogue={catalogue} />}

        {view === "cards" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profiles.map((p) => (
              <Card key={p.id} radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-bold text-navy">{p.label}</h2>
                  {p.allPermissions ? <Pill variant="info">Tous les droits</Pill> : p.system ? <Pill variant="neutral">Livré</Pill> : <Pill variant="success">Sur mesure</Pill>}
                </div>
                <p className="min-h-[2.5rem] text-sm text-ink-secondary">{p.description ?? "—"}</p>
                <div className="flex items-center justify-between gap-3 text-sm text-ink-secondary">
                  <span>{p.allPermissions ? "Tous" : p.permissions.length} droit{p.permissions.length > 1 ? "s" : ""}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" />{p.activeUsers} compte{p.activeUsers > 1 ? "s" : ""} actif{p.activeUsers > 1 ? "s" : ""}</span>
                </div>
                <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setEditing(p)}>
                  {p.allPermissions ? "Voir" : "Régler les droits"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
      {(creating || editing) && (
        <ProfileDialog profile={editing} catalogue={catalogue} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </AdminLayout>
  );
}
