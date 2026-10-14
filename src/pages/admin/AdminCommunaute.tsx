/**
 * AdminCommunaute.tsx — tout ce que les apprenants écrivent, au même endroit :
 *  - « Questions » : les questions posées sous une leçon (elles arrivent aussi par e-mail au formateur), toutes sessions
 *    confondues, avec réponse directe ; la réponse est envoyée à l'apprenant par e-mail ;
 *  - « Entraide » : le fil d'échange entre apprenants d'une formation, que l'équipe modère (suppression d'un message
 *    inapproprié, identité réelle des auteurs visible).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, inputClass, Pager } from "@/components/admin/AdminKit";
import { QuestionItem } from "@/components/admin/QuestionItem";
import { RichText } from "@/components/rich/RichText";
import { Button, Card } from "@/components/shared";
import { useAdminFormations } from "@/hooks/useCatalogAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useQuestionInbox } from "@/hooks/useSessionOps";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { httpClient } from "@/services/httpClient";
import type { QuestionStatus } from "@/services/api/sessionOpsService";

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

const STATUSES: { key: QuestionStatus; label: string }[] = [
  { key: "OPEN", label: "Sans réponse" },
  { key: "ANSWERED", label: "Répondues" },
  { key: "ALL", label: "Toutes" },
];

function QuestionsTab({ canAnswer }: { canAnswer: boolean }) {
  const [status, setStatus] = useState<QuestionStatus>("OPEN");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, isFetching } = useQuestionInbox({ status, q: q || undefined, page, size: PAGE_SIZE });
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <Button key={s.key} type="button" size="sm" shape="pill" variant={status === s.key ? "navy" : "outline"} aria-pressed={status === s.key}
            onClick={() => { setStatus(s.key); setPage(0); }}>{s.label}</Button>
        ))}
        <span className="flex-1" />
        <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5">
          <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
          <input type="search" aria-label="Rechercher une question" placeholder="Apprenant, leçon, session, mot…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm outline-none" />
        </div>
      </div>

      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>Impossible de charger les questions.</ErrorNotice>}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title={status === "OPEN" ? "Aucune question en attente" : "Aucune question"}
          text="Les questions posées par les apprenants sous une leçon apparaissent ici et sont aussi envoyées par e-mail au formateur de la session."
        />
      )}

      <ul className={cn("flex flex-col gap-3", isFetching && "opacity-70 transition-opacity")}>
        {items.map((it) => (
          <li key={it.id}>
            <Card radius="stat" className="flex flex-col gap-2 border border-[#E7E0D4] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary">
                <span>{it.formationTitle}{it.sessionName ? ` · ${it.sessionName}` : ""}</span>
                <Link to={`/admin/sessions/${it.sessionId}`} className="font-semibold text-navy hover:text-cta">Suivi de la session →</Link>
              </div>
              <QuestionItem sessionId={it.sessionId} q={it} canAnswer={canAnswer} />
            </Card>
          </li>
        ))}
      </ul>
      {data && <Pager page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />}
    </div>
  );
}

function SupportTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: formations = [] } = useAdminFormations();
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
    <div className="flex flex-col gap-5">
      <p className="rounded-xl bg-info-bg px-4 py-3 text-sm text-navy">
        L'entraide est le fil où les apprenants d'une même formation s'écrivent entre eux. Vous y intervenez pour modérer ; les questions adressées à l'équipe sont dans l'onglet « Questions ».
      </p>
      <label className="flex max-w-md flex-col gap-1.5 text-sm font-semibold text-ink">
        Formation
        <select className={inputClass} value={formationId} onChange={(e) => { setFormationId(e.target.value); setPage(0); }}>
          <option value="">— Choisir une formation —</option>
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
            <li key={p.id} className={cn("flex items-start justify-between gap-3 rounded-card border border-[#E7E0D4] bg-white p-4", p.parentId && "ml-6")}>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-secondary">
                  <strong className="text-ink">{p.authorName}</strong> · {p.authorEmail} · {stamp(p.createdAt)}{p.parentId ? " · réponse" : ""}
                </p>
                <RichText source={p.content} className="mt-1" />
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

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => { if (!o) setToDelete(null); }}
        title="Supprimer ce message ?"
        description="Le message (et ses réponses s'il est de premier niveau) disparaît pour tous les apprenants. Cette action est tracée."
        confirmLabel="Supprimer"
        onConfirm={async () => { await remove(); setToDelete(null); }}
      />
    </div>
  );
}

export default function AdminCommunaute() {
  const { can } = useAuth();
  const canQuestions = can("SESSIONS_VIEW");
  const canAnswer = can("SESSIONS_TRACK");
  const canModerate = can("COMMUNITY_MODERATE");
  const [tab, setTab] = useState<"questions" | "support">(canQuestions ? "questions" : "support");

  return (
    <AdminLayout title="Communauté" description="Les questions des apprenants et le fil d'entraide, au même endroit">
      <div className="flex flex-col gap-5">
        {canQuestions && canModerate && (
          <div className="flex gap-2" role="tablist" aria-label="Communauté">
            <Button type="button" role="tab" size="sm" shape="pill" variant={tab === "questions" ? "navy" : "outline"} aria-selected={tab === "questions"} onClick={() => setTab("questions")}>Questions aux formateurs</Button>
            <Button type="button" role="tab" size="sm" shape="pill" variant={tab === "support" ? "navy" : "outline"} aria-selected={tab === "support"} onClick={() => setTab("support")}>Entraide entre apprenants</Button>
          </div>
        )}
        {tab === "questions" && canQuestions && <QuestionsTab canAnswer={canAnswer} />}
        {tab === "support" && canModerate && <SupportTab />}
      </div>
    </AdminLayout>
  );
}
