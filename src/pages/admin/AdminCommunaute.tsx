/**
 * AdminCommunaute.tsx — modération du fil d'entraide des formations : lecture avec l'identité réelle des
 * auteurs et suppression d'un message inapproprié (GET /admin/community, DELETE /admin/community/:id).
 * Réservé SUPER_ADMIN et ADMIN.
 */
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, inputClass, Pager } from "@/components/admin/AdminKit";
import { Button } from "@/components/shared";
import { useFormations } from "@/hooks/useFormations";
import { useToast } from "@/hooks/use-toast";
import { httpClient } from "@/services/httpClient";

interface ModerationPost {
  id: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

const PAGE_SIZE = 20;
const stamp = (iso: string) => format(parseISO(iso), "d MMM yyyy HH:mm", { locale: fr });

export default function AdminCommunaute() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: formations = [] } = useFormations();
  const [formationId, setFormationId] = useState("");
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState<ModerationPost | null>(null);

  const posts = useQuery({
    queryKey: ["admin", "community", formationId, page],
    queryFn: async () =>
      (await httpClient.get<{ data: ModerationPost[] }>("/admin/community", { params: { formationId, page, size: PAGE_SIZE } })).data ?? [],
    enabled: !!formationId,
  });

  const remove = async () => {
    if (!toDelete) return;
    await httpClient.delete<void>(`/admin/community/${toDelete.id}`);
    await qc.invalidateQueries({ queryKey: ["admin", "community"] });
    toast({ title: "Message supprimé" });
  };

  const items = posts.data ?? [];

  return (
    <AdminLayout title="Communauté" description="Modérez le fil d'entraide des apprenants, formation par formation">
      <div className="flex flex-col gap-5">
        <label className="flex max-w-md flex-col gap-1.5 text-sm font-semibold text-ink">
          Formation
          <select className={inputClass} value={formationId} onChange={(e) => { setFormationId(e.target.value); setPage(0); }}>
            <option value="">Choisir une formation…</option>
            {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        </label>

        {formationId && posts.isLoading && <Loader2 className="h-6 w-6 animate-spin text-ink-secondary" />}
        {posts.isError && <ErrorNotice>{errorMessage(posts.error, "Impossible de charger les messages.")}</ErrorNotice>}
        {formationId && !posts.isLoading && !posts.isError && items.length === 0 && (
          <EmptyState title="Aucun message" text="Les apprenants de cette formation n'ont pas encore écrit dans la communauté." />
        )}

        {items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {items.map((p) => (
              <li key={p.id} className={`flex items-start justify-between gap-3 rounded-card border border-[#E7E0D4] bg-white p-4 ${p.parentId ? "ml-6" : ""}`}>
                <div className="min-w-0">
                  <p className="text-xs text-ink-secondary">
                    <strong className="text-ink">{p.authorName}</strong> · {p.authorEmail} · {stamp(p.createdAt)}{p.parentId ? " · réponse" : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{p.content}</p>
                </div>
                <Button type="button" variant="outline" shape="rounded" size="sm" className="shrink-0 text-error" onClick={() => setToDelete(p)} aria-label="Supprimer le message">
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {formationId && (
          <Pager page={page} totalPages={items.length >= PAGE_SIZE ? page + 2 : page + 1} totalElements={items.length} onChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        title="Supprimer ce message ?"
        description="Le message (et ses réponses s'il est de premier niveau) disparaît pour tous les apprenants. Cette action est tracée."
        confirmLabel="Supprimer"
        onConfirm={async () => { await remove(); setToDelete(null); }}
      />
    </AdminLayout>
  );
}
