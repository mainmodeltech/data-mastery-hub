/**
 * /espace/communaute — fil d'entraide par formation : les apprenants d'une même formation s'écrivent et se
 * répondent (un niveau de réponse). Les noms affichés sont « Prénom N. » ; l'équipe modère les messages.
 * (GET/POST /learner/formations/:id/community, DELETE /learner/community/:postId)
 */
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";

import { Button, Card } from "@/components/shared";
import { inputClass } from "@/components/admin/AdminKit";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useLearnerDashboard } from "@/hooks/useCourse";
import { useCommunity, useCommunityDelete, useCommunityPost } from "@/hooks/useLearner";
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost } from "@/services/api/learnerService";

const stamp = (iso: string) => format(parseISO(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });

function Compose({ placeholder, busy, onSubmit, onCancel }: {
  placeholder: string; busy: boolean; onSubmit: (content: string) => Promise<void>; onCancel?: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        await onSubmit(value.trim());
        setValue("");
      }}
    >
      <textarea aria-label={placeholder} rows={3} maxLength={2000} required placeholder={placeholder} className={inputClass} value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="outline" shape="rounded" size="sm" onClick={onCancel}>Annuler</Button>}
        <Button type="submit" variant="navy" shape="rounded" size="sm" disabled={busy || !value.trim()}>
          {busy ? <Loader2 className="animate-spin" /> : "Publier"}
        </Button>
      </div>
    </form>
  );
}

function Message({ post, onDelete }: { post: CommunityPost; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-ink-secondary">
        <strong className="text-ink">{post.author}</strong> · {stamp(post.createdAt)}
      </p>
      <p className="whitespace-pre-wrap text-sm text-ink">{post.content}</p>
      {post.mine && (
        <button type="button" onClick={onDelete} className="flex w-fit items-center gap-1 text-xs font-semibold text-ink-secondary hover:text-error">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Supprimer
        </button>
      )}
    </div>
  );
}

export default function EspaceCommunaute() {
  const { toast } = useToast();
  const { data: result, isLoading: loadingCourses } = useLearnerDashboard();
  const courses = (result?.data?.courses ?? []).filter((c) => c.status !== "UPCOMING");
  const [formationId, setFormationId] = useState<string>("");
  const [page, setPage] = useState(0);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    if (!formationId && courses.length > 0) setFormationId(courses[0].formationId);
  }, [courses, formationId]);

  const community = useCommunity(formationId || undefined, page);
  const post = useCommunityPost(formationId);
  const remove = useCommunityDelete(formationId);

  const publish = async (content: string, parentId?: string) => {
    try {
      await post.mutateAsync({ content, parentId });
      setReplyTo(null);
      if (!parentId) setPage(0);
    } catch (err) {
      toast({ title: "Publication impossible", description: err instanceof Error ? err.message : "Réessayez dans un instant.", variant: "destructive" });
    }
  };

  const del = async (id: string) => {
    if (!window.confirm("Supprimer ce message ? Les réponses associées seront supprimées aussi.")) return;
    try {
      await remove.mutateAsync(id);
    } catch {
      toast({ title: "Suppression impossible", variant: "destructive" });
    }
  };

  return (
    <LearnerShell title="Communauté" description="Entraide entre les apprenants de votre formation">
      <div className="flex max-w-3xl flex-col gap-6">
        {loadingCourses && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}

        {!loadingCourses && courses.length === 0 && (
          <Card radius="stat" variant="sand" className="flex flex-col gap-2 p-8">
            <p className="font-heading text-lg font-bold text-navy">La communauté s'ouvre avec votre formation</p>
            <p className="text-sm text-ink-secondary">Dès que l'accès à votre formation est ouvert, vous pouvez poser vos questions et échanger avec les autres apprenants.</p>
          </Card>
        )}

        {courses.length > 0 && (
          <>
            {courses.length > 1 && (
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Formation
                <select className={inputClass} value={formationId} onChange={(e) => { setFormationId(e.target.value); setPage(0); setReplyTo(null); }}>
                  {courses.map((c) => <option key={c.formationId} value={c.formationId}>{c.title}</option>)}
                </select>
              </label>
            )}

            <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5 lg:p-6">
              <h2 className="font-heading text-xl font-bold text-navy">Poser une question ou partager</h2>
              <Compose placeholder="Votre message à la promo…" busy={post.isPending && replyTo === null} onSubmit={(c) => publish(c)} />
              <p className="text-xs text-ink-secondary">Restez courtois : l'équipe peut supprimer un message inapproprié. Pour une question au formateur, utilisez l'onglet « Questions » d'une leçon.</p>
            </Card>

            {community.isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
            {community.isError && <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">Impossible de charger les messages pour le moment.</div>}

            {community.data && community.data.threads.length === 0 && (
              <p className="text-sm text-ink-secondary">Aucun message pour le moment : lancez la discussion !</p>
            )}

            {community.data?.threads.map((t) => (
              <Card key={t.id} radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5 lg:p-6">
                <Message post={t} onDelete={() => void del(t.id)} />
                {t.replies.length > 0 && (
                  <div className="flex flex-col gap-3 border-l-2 border-[#E7E0D4] pl-4">
                    {t.replies.map((r) => <Message key={r.id} post={r} onDelete={() => void del(r.id)} />)}
                  </div>
                )}
                {replyTo === t.id ? (
                  <Compose placeholder="Votre réponse…" busy={post.isPending} onSubmit={(c) => publish(c, t.id)} onCancel={() => setReplyTo(null)} />
                ) : (
                  <button type="button" onClick={() => setReplyTo(t.id)} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-navy hover:text-cta">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> Répondre
                  </button>
                )}
              </Card>
            ))}

            {community.data && community.data.totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-ink-secondary">Page {community.data.page + 1} sur {community.data.totalPages}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" shape="rounded" size="sm" disabled={page <= 0} onClick={() => setPage(page - 1)}>Plus récents</Button>
                  <Button type="button" variant="outline" shape="rounded" size="sm" disabled={page >= community.data.totalPages - 1} onClick={() => setPage(page + 1)}>Plus anciens</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </LearnerShell>
  );
}
