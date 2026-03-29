import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Plus, Pencil, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/useRoles";
import type { AdminRole } from "@/types";

const SYSTEM_ROLES = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"];

export default function AdminRoles() {
  const { toast } = useToast();
  const { data, isLoading } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const roles: AdminRole[] = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (role: AdminRole) => {
    setEditing(role);
    setName(role.name);
    setDescription(role.description ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: { description } },
        {
          onSuccess: () => { setDialogOpen(false); toast({ title: "Role mis a jour" }); },
          onError: () => toast({ title: "Erreur", variant: "destructive" }),
        }
      );
    } else {
      if (!name.startsWith("ROLE_")) {
        toast({ title: "Le nom doit commencer par ROLE_", variant: "destructive" });
        return;
      }
      createMutation.mutate(
        { name, description: description || undefined },
        {
          onSuccess: () => { setDialogOpen(false); toast({ title: "Role cree" }); },
          onError: () => toast({ title: "Erreur — le role existe peut-etre deja", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (role: AdminRole) => {
    if (SYSTEM_ROLES.includes(role.name)) {
      toast({ title: "Impossible de supprimer un role systeme", variant: "destructive" });
      return;
    }
    if (!confirm(`Supprimer le role ${role.name} ?`)) return;
    deleteMutation.mutate(role.id, {
      onSuccess: () => toast({ title: "Role supprime" }),
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Gestion des roles">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{roles.length} role(s)</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouveau role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !roles.length ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Aucun role</p>
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
              <ShieldCheck className={`h-5 w-5 flex-shrink-0 ${SYSTEM_ROLES.includes(role.name) ? "text-amber-500" : "text-primary"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-foreground">{role.name}</p>
                  {SYSTEM_ROLES.includes(role.name) && (
                    <Badge variant="secondary" className="text-xs">Systeme</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{role.description || "Pas de description"}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(role)}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                {!SYSTEM_ROLES.includes(role.name) && (
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10"
                    onClick={() => handleDelete(role)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le role" : "Nouveau role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nom *</Label>
              <Input
                placeholder="ROLE_EDITOR"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                disabled={!!editing}
              />
              {!editing && (
                <p className="text-xs text-muted-foreground">Format: ROLE_NOM (majuscules et underscores)</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                placeholder="Acces au contenu editorial..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={isPending || (!editing && !name)}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Enregistrer" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
