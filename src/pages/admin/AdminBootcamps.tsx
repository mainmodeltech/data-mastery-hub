/**
 * AdminBootcamps.tsx — liste des formations du catalogue (/admin/bootcamps).
 * Création et modification passent par l'éditeur de fiche (BootcampForm) ; les sessions
 * (dates, places, prix) par « Sessions ». La publication se bascule directement ici.
 */
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, CalendarDays, Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, inputClass } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useAdminDomains, useAdminFormations, CATALOG_KEYS } from "@/hooks/useCatalogAdmin";
import { adminBootcampService } from "@/services/Adminbootcampservice";
import { useToast } from "@/hooks/use-toast";
import type { Formation } from "@/types/formation.type";

const LEVEL_LABELS: Record<string, string> = { DEBUTANT: "Débutant", INTERMEDIAIRE: "Intermédiaire", AVANCE: "Avancé" };
const FORMAT_LABELS: Record<string, string> = { PRESENTIEL: "Présentiel", EN_LIGNE: "En ligne", HYBRIDE: "Hybride" };

export default function AdminBootcamps() {  const { can } = useAuth();
  const canManage = can("CATALOG_MANAGE");

  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: formations = [], isLoading, isError } = useAdminFormations();
  const { data: domains = [] } = useAdminDomains();
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [deleting, setDeleting] = useState<Formation | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: CATALOG_KEYS.formations });
    qc.invalidateQueries({ queryKey: ["formations"] });
  };

  const toggle = useMutation({
    mutationFn: (id: string) => adminBootcampService.togglePublished(id),
    onSuccess: (b) => {
      refresh();
      toast({ title: b.published ? "Formation publiée" : "Formation passée en brouillon", description: b.title });
    },
    onError: (e) => toast({ title: "Action impossible", description: errorMessage(e), variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminBootcampService.delete(id),
    onSuccess: () => { refresh(); toast({ title: "Formation supprimée" }); },
    onError: (e) => toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }),
  });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...formations]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .filter((f) => (!q || f.title.toLowerCase().includes(q)) && (!domainFilter || f.domainId === domainFilter));
  }, [formations, query, domainFilter]);

  return (
    <AdminLayout
      title="Formations"
      description={`${formations.length} formation${formations.length > 1 ? "s" : ""} au catalogue`}
      actions={
        canManage ? (
          <Button asChild size="sm" shape="rounded">
            <Link to="/admin/bootcamps/new"><Plus />Nouvelle formation</Link>
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
            <input aria-label="Rechercher une formation" className={`${inputClass} pl-10`} placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select aria-label="Filtrer par domaine" className={`${inputClass} w-auto`} value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
            <option value="">Tous les domaines</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les formations.</ErrorNotice>}
        {!isLoading && !isError && formations.length === 0 && (
          <EmptyState
            title="Aucune formation"
            text="Créez votre première fiche : elle apparaîtra sur le site dès sa publication."
            action={<Button asChild shape="rounded"><Link to="/admin/bootcamps/new"><Plus />Nouvelle formation</Link></Button>}
          />
        )}
        {!isLoading && formations.length > 0 && shown.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-secondary">Aucune formation ne correspond à votre recherche.</p>
        )}

        {shown.map((f) => (
          <Card key={f.id} radius="stat" className="flex flex-wrap items-start gap-4 border border-[#E7E0D4] p-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/admin/bootcamps/${f.id}/edit`} className="font-heading text-lg font-bold text-navy hover:text-cta">{f.title}</Link>
                <Pill variant={f.published ? "success" : "neutral"}>{f.published ? "Publiée" : "Brouillon"}</Pill>
                {f.featured && <Pill variant="warning">Mise en avant</Pill>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-secondary">
                {f.domain ? <Pill variant="info">{f.domain.name}</Pill> : <Pill variant="warning">Sans domaine</Pill>}
                <span>{f.deliveredBy === "PARTNER" ? `Partenaire · ${f.partner?.name ?? "—"}` : "Model Technologie"}</span>
                {f.level && <span>· {LEVEL_LABELS[f.level] ?? f.level}</span>}
                {f.format && <span>· {FORMAT_LABELS[f.format] ?? f.format}</span>}
                {f.duration && <span>· {f.duration}</span>}
                {f.price && <span>· {f.price}</span>}
              </div>
              <span className="text-xs text-ink-secondary">
                {f.sessions?.length ? `${f.sessions.length} session${f.sessions.length > 1 ? "s" : ""}` : "Aucune session"}
                {f.nextSession?.startDate && ` · prochaine le ${new Date(f.nextSession.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
              </span>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2 sm:shrink-0">
              {canManage && (
                <Button type="button" variant="outline" shape="rounded" size="sm" disabled={toggle.isPending} onClick={() => toggle.mutate(f.id)}>
                  {f.published ? <><EyeOff />Dépublier</> : <><Eye />Publier</>}
                </Button>
              )}
              {can("PROGRAM_MANAGE") && <Button asChild variant="navy" shape="rounded" size="sm"><Link to={`/admin/formations/${f.id}`}><BookOpenCheck />Programme</Link></Button>}
              <Button asChild variant="outline" shape="rounded" size="sm"><Link to={`/admin/bootcamp-sessions?bootcamp=${f.id}`}><CalendarDays />Sessions</Link></Button>
              {(canManage || can("PRICING_MANAGE")) && (
                <Button asChild variant="outline" shape="rounded" size="sm"><Link to={`/admin/bootcamps/${f.id}/edit`}><Pencil />{canManage ? "Modifier" : "Tarifs"}</Link></Button>
              )}
              {canManage && <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Supprimer ${f.title}`} onClick={() => setDeleting(f)}><Trash2 /></Button>}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Supprimer « ${deleting?.title} » ?`}
        description="La fiche disparaît du site et de l'administration. Les inscriptions existantes sont conservées."
        onConfirm={() => remove.mutateAsync(deleting!.id)}
      />
    </AdminLayout>
  );
}
