import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Plus, Pencil, Trash2, Loader2, KeyRound, Search,
  UserCheck, UserX, ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useRegenerateCredentials } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import type { AdminUser, AdminRole } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminUsers() {
  const { toast } = useToast();
  const [page] = useState(0);
  const { data, isLoading } = useUsers(page, 50);
  const { data: rolesData } = useRoles();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const regenMutation = useRegenerateCredentials();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  const users: AdminUser[] = data?.data?.content ?? [];
  const allRoles: AdminRole[] = rolesData?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some((r) => r.name.toLowerCase().includes(q))
    );
  }, [users, search]);

  // KPIs
  const kpis = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => !u.active).length,
  }), [users]);

  const openCreate = () => {
    setEditing(null);
    setEmail("");
    setFullName("");
    setSelectedRoleIds([]);
    setActive(true);
    setDialogOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setEmail(user.email);
    setFullName(user.fullName);
    setSelectedRoleIds(user.roles.map((r) => r.id));
    setActive(user.active);
    setDialogOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: { fullName, roleIds: selectedRoleIds, active } },
        {
          onSuccess: () => { setDialogOpen(false); toast({ title: "Utilisateur mis a jour" }); },
          onError: () => toast({ title: "Erreur", variant: "destructive" }),
        }
      );
    } else {
      if (!email || !fullName || selectedRoleIds.length === 0) {
        toast({ title: "Remplissez tous les champs obligatoires", variant: "destructive" });
        return;
      }
      createMutation.mutate(
        { email, fullName, roleIds: selectedRoleIds },
        {
          onSuccess: () => {
            setDialogOpen(false);
            toast({ title: "Utilisateur cree", description: "Les identifiants ont ete envoyes par email." });
          },
          onError: () => toast({ title: "Erreur — l'email existe peut-etre deja", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (user: AdminUser) => {
    if (!confirm(`Supprimer l'utilisateur ${user.fullName} ?`)) return;
    deleteMutation.mutate(user.id, {
      onSuccess: () => toast({ title: "Utilisateur supprime" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const handleRegenerate = (user: AdminUser) => {
    if (!confirm(`Regenerer les identifiants de ${user.fullName} ?\nUn nouveau mot de passe sera envoye par email.`)) return;
    regenMutation.mutate(user.id, {
      onSuccess: () => toast({ title: "Identifiants regeneres", description: `Envoyes a ${user.email}` }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Gestion des utilisateurs">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-2xl font-bold text-foreground">{kpis.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10"><UserCheck className="h-5 w-5 text-emerald-600" /></div>
          <div>
            <p className="text-2xl font-bold text-foreground">{kpis.active}</p>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10"><UserX className="h-5 w-5 text-red-600" /></div>
          <div>
            <p className="text-2xl font-bold text-foreground">{kpis.inactive}</p>
            <p className="text-xs text-muted-foreground">Inactifs</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button onClick={openCreate} className="ml-auto">
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Aucun utilisateur</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Derniere connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="outline" className="text-xs">
                          {role.name.replace("ROLE_", "")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.active ? "default" : "destructive"} className="text-xs">
                      {user.active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), "d MMM yyyy HH:mm", { locale: fr })
                      : "Jamais"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => handleRegenerate(user)}
                        disabled={regenMutation.isPending}
                        title="Regenerer les identifiants"
                      >
                        <KeyRound className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10"
                        onClick={() => handleDelete(user)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="user@model-technologie.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!editing}
              />
              {!editing && (
                <p className="text-xs text-muted-foreground">Un mot de passe aleatoire sera genere et envoye par email</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Nom complet *</Label>
              <Input
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Roles */}
            <div className="space-y-2">
              <Label>Roles *</Label>
              <div className="space-y-2">
                {allRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      selectedRoleIds.includes(role.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <ShieldCheck className={`h-4 w-4 flex-shrink-0 ${
                      selectedRoleIds.includes(role.id) ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{role.name.replace("ROLE_", "")}</p>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedRoleIds.includes(role.id)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}>
                      {selectedRoleIds.includes(role.id) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active toggle — only on edit */}
            {editing && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Compte actif</p>
                  <p className="text-xs text-muted-foreground">Un compte inactif ne peut plus se connecter</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Enregistrer" : "Creer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
