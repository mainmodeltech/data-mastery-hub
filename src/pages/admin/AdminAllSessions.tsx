/**
 * AdminAllSessions.tsx — sessions de toutes les formations (design system) : filtres par statut et formation, recherche,
 * remplissage des places, mise en avant, suivi, création/modification. Les prix relèvent du droit « Tarifs » (le serveur
 * refuse la modification d'un prix sans ce droit).
 */
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { BookOpen, CalendarDays, ClipboardList, Loader2, MapPin, Pencil, Plus, Search, Star, Trash2, Users } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { adminBootcampService } from "@/services/Adminbootcampservice";
import type {
  BootcampSession, CreateSessionPayload, SessionFormat, SessionStatus, UpdateSessionPayload,
} from "@/types/bootcamp.type";

const STATUS_LABELS: Record<SessionStatus, string> = {
  DRAFT: "Brouillon", UPCOMING: "À venir", OPEN: "Inscriptions ouvertes", CLOSED: "Inscriptions fermées",
  IN_PROGRESS: "En cours", COMPLETED: "Terminée", CANCELLED: "Annulée",
};

const STATUS_PILL: Record<SessionStatus, "success" | "warning" | "error" | "info" | "neutral"> = {
  DRAFT: "neutral", UPCOMING: "info", OPEN: "success", CLOSED: "warning", IN_PROGRESS: "info", COMPLETED: "neutral", CANCELLED: "error",
};

const FORMAT_LABELS: Record<SessionFormat, string> = { PRESENTIEL: "Présentiel", REMOTE: "À distance", HYBRID: "Hybride" };

/** Regroupements affichés en puces (un clic = un filtre) ; « Toutes » ne filtre pas. */
const GROUPS: { key: string; label: string; statuses: SessionStatus[] | null }[] = [
  { key: "ALL", label: "Toutes", statuses: null },
  { key: "OPEN", label: "Inscriptions ouvertes", statuses: ["OPEN"] },
  { key: "SOON", label: "À venir", statuses: ["UPCOMING", "CLOSED"] },
  { key: "RUNNING", label: "En cours", statuses: ["IN_PROGRESS"] },
  { key: "DONE", label: "Terminées", statuses: ["COMPLETED", "CANCELLED"] },
  { key: "DRAFT", label: "Brouillons", statuses: ["DRAFT"] },
];

interface SessionWithBootcamp extends BootcampSession { bootcampTitle?: string }

interface FormState {
  bootcampId: string; sessionName: string; cohortNumber: string; year: string;
  startDate: string; endDate: string; registrationDeadline: string; maxParticipants: string;
  status: SessionStatus; format: SessionFormat; location: string;
  priceOverride: string; earlyBirdPrice: string; priceOverrideAmount: string; earlyBirdAmount: string; earlyBirdDeadline: string;
  isFeatured: boolean; published: boolean;
}

const emptyForm = (bootcampId = ""): FormState => ({
  bootcampId, sessionName: "", cohortNumber: "", year: String(new Date().getFullYear()), startDate: "", endDate: "",
  registrationDeadline: "", maxParticipants: "20", status: "UPCOMING", format: "PRESENTIEL", location: "Dakar, Sénégal",
  priceOverride: "", earlyBirdPrice: "", priceOverrideAmount: "", earlyBirdAmount: "", earlyBirdDeadline: "", isFeatured: false, published: true,
});

function toForm(s: SessionWithBootcamp): FormState {
  return {
    bootcampId: s.bootcampId, sessionName: s.sessionName ?? "", cohortNumber: s.cohortNumber?.toString() ?? "",
    year: s.year?.toString() ?? String(new Date().getFullYear()), startDate: s.startDate ?? "", endDate: s.endDate ?? "",
    registrationDeadline: s.registrationDeadline ?? "", maxParticipants: s.maxParticipants.toString(), status: s.status,
    format: s.format, location: s.location ?? "", priceOverride: s.price ?? "", earlyBirdPrice: s.earlyBirdPrice ?? "",
    priceOverrideAmount: s.priceOverrideAmount?.toString() ?? "", earlyBirdAmount: s.earlyBirdAmount?.toString() ?? "",
    earlyBirdDeadline: s.earlyBirdDeadline ?? "", isFeatured: s.isFeatured, published: s.published,
  };
}

const day = (iso: string | null | undefined, withYear = true) =>
  (iso ? format(parseISO(iso), withYear ? "d MMM yyyy" : "d MMM", { locale: fr }) : "");

function SessionDialog({
  session, bootcamps, defaultBootcamp, canPrice, onClose,
}: { session: SessionWithBootcamp | null; bootcamps: { id: string; title: string }[]; defaultBootcamp: string; canPrice: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(session ? toForm(session) : emptyForm(defaultBootcamp));
  const [error, setError] = useState("");
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const done = (title: string) => {
    qc.invalidateQueries({ queryKey: ["admin", "allSessions"] });
    qc.invalidateQueries({ queryKey: ["admin", "bootcamps"] });
    toast({ title });
    onClose();
  };
  const create = useMutation({
    mutationFn: ({ bootcampId, payload }: { bootcampId: string; payload: CreateSessionPayload }) => adminBootcampService.createSession(bootcampId, payload),
    onSuccess: () => done("Session créée"),
    onError: (e) => setError(errorMessage(e, "Création impossible.")),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionPayload }) => adminBootcampService.updateSession(id, payload),
    onSuccess: () => done("Session mise à jour"),
    onError: (e) => setError(errorMessage(e, "Enregistrement impossible.")),
  });
  const pending = create.isPending || update.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!session && !form.bootcampId) return setError("Choisissez la formation.");
    if (form.startDate && form.endDate && form.endDate < form.startDate) return setError("La date de fin précède la date de début.");
    const payload: CreateSessionPayload = {
      sessionName: form.sessionName || undefined,
      cohortNumber: form.cohortNumber ? parseInt(form.cohortNumber) : undefined,
      year: form.year ? parseInt(form.year) : undefined,
      startDate: form.startDate || undefined, endDate: form.endDate || undefined,
      registrationDeadline: form.registrationDeadline || undefined,
      maxParticipants: parseInt(form.maxParticipants) || 20,
      status: form.status, format: form.format, location: form.location || undefined,
      priceOverride: form.priceOverride || undefined, earlyBirdPrice: form.earlyBirdPrice || undefined,
      priceOverrideAmount: form.priceOverrideAmount ? parseInt(form.priceOverrideAmount) : undefined,
      earlyBirdAmount: form.earlyBirdAmount ? parseInt(form.earlyBirdAmount) : undefined,
      earlyBirdDeadline: form.earlyBirdDeadline || undefined,
      isFeatured: form.isFeatured, published: form.published,
    };
    if (session) update.mutate({ id: session.id, payload });
    else create.mutate({ bootcampId: form.bootcampId, payload });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{session ? "Modifier la session" : "Nouvelle session"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">Dates, places, format et tarifs spécifiques à cette session.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          {!session && (
            <Field label="Formation *" htmlFor="ss-b">
              <select id="ss-b" required className={inputClass} value={form.bootcampId} onChange={(e) => set("bootcampId", e.target.value)}>
                <option value="">— Choisir —</option>
                {bootcamps.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Field label="Nom de la session" htmlFor="ss-n"><input id="ss-n" className={inputClass} placeholder="Cohorte 5 — Mars 2027" value={form.sessionName} onChange={(e) => set("sessionName", e.target.value)} /></Field>
            <Field label="N° de cohorte" htmlFor="ss-c"><input id="ss-c" type="number" min={1} className={inputClass} value={form.cohortNumber} onChange={(e) => set("cohortNumber", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Début" htmlFor="ss-s"><input id="ss-s" type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
            <Field label="Fin" htmlFor="ss-e"><input id="ss-e" type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
            <Field label="Limite d'inscription" htmlFor="ss-d"><input id="ss-d" type="date" className={inputClass} value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Statut" htmlFor="ss-st">
              <select id="ss-st" className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as SessionStatus)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Format" htmlFor="ss-f">
              <select id="ss-f" className={inputClass} value={form.format} onChange={(e) => set("format", e.target.value as SessionFormat)}>
                {Object.entries(FORMAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Places" htmlFor="ss-m"><input id="ss-m" type="number" min={1} className={inputClass} value={form.maxParticipants} onChange={(e) => set("maxParticipants", e.target.value)} /></Field>
            <Field label="Lieu" htmlFor="ss-l"><input id="ss-l" className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
          </div>

          <fieldset className="flex flex-col gap-3 rounded-card border border-[#E7E0D4] p-4" disabled={!canPrice}>
            <legend className="px-1 font-heading text-sm font-bold text-navy">Tarifs de la session <span className="font-normal text-ink-secondary">(vides : le prix de la formation s'applique)</span></legend>
            {!canPrice && <p className="text-xs text-ink-secondary">Les tarifs sont gérés par la finance : ces champs sont en lecture seule pour votre profil.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prix affiché" htmlFor="ss-po"><input id="ss-po" className={inputClass} placeholder="400 000 FCFA" value={form.priceOverride} onChange={(e) => set("priceOverride", e.target.value)} /></Field>
              <Field label="Montant (FCFA)" htmlFor="ss-pa"><input id="ss-pa" type="number" min={0} step={1000} className={inputClass} value={form.priceOverrideAmount} onChange={(e) => set("priceOverrideAmount", e.target.value)} /></Field>
              <Field label="Prix early bird affiché" htmlFor="ss-eb"><input id="ss-eb" className={inputClass} placeholder="350 000 FCFA" value={form.earlyBirdPrice} onChange={(e) => set("earlyBirdPrice", e.target.value)} /></Field>
              <Field label="Montant early bird (FCFA)" htmlFor="ss-ea"><input id="ss-ea" type="number" min={0} step={1000} className={inputClass} value={form.earlyBirdAmount} onChange={(e) => set("earlyBirdAmount", e.target.value)} /></Field>
              <Field label="Early bird jusqu'au" htmlFor="ss-ed" className="sm:col-span-2"><input id="ss-ed" type="date" className={inputClass} value={form.earlyBirdDeadline} onChange={(e) => set("earlyBirdDeadline", e.target.value)} /></Field>
            </div>
            <p className="text-xs text-ink-secondary">Les montants servent au calcul des paiements ; les prix en texte ne servent qu'à l'affichage.</p>
          </fieldset>

          <SwitchRow label="Mise en avant" description="Affichée comme « Prochaine session » sur la fiche de la formation." checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} />
          <SwitchRow label="Publiée" description="Visible sur le site public." checked={form.published} onChange={(v) => set("published", v)} />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : session ? "Enregistrer" : "Créer la session"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAllSessions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { can } = useAuth();
  const canManage = can("CATALOG_MANAGE");
  const canPrice = can("PRICING_MANAGE");
  const [searchParams] = useSearchParams();

  const [group, setGroup] = useState("ALL");
  const [bootcampFilter, setBootcampFilter] = useState(searchParams.get("bootcamp") ?? "");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<SessionWithBootcamp | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<SessionWithBootcamp | null>(null);

  const { data: bootcamps, isLoading: loadingBootcamps } = useQuery({ queryKey: ["admin", "bootcamps"], queryFn: adminBootcampService.list });
  const { data: allSessions, isLoading: loadingSessions, isError } = useQuery({
    queryKey: ["admin", "allSessions", bootcamps?.map((b) => b.id)],
    queryFn: async (): Promise<SessionWithBootcamp[]> => {
      if (!bootcamps?.length) return [];
      const results = await Promise.all(
        bootcamps.map((b) => adminBootcampService.listSessions(b.id).then((s) => s.map((x) => ({ ...x, bootcampTitle: b.title })))),
      );
      return results.flat();
    },
    enabled: !!bootcamps?.length,
  });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin", "allSessions"] }); qc.invalidateQueries({ queryKey: ["admin", "bootcamps"] }); };
  const featured = useMutation({ mutationFn: (id: string) => adminBootcampService.toggleSessionFeatured(id), onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: (id: string) => adminBootcampService.deleteSession(id),
    onSuccess: () => { invalidate(); toast({ title: "Session supprimée" }); },
  });

  const sessions = useMemo(() => allSessions ?? [], [allSessions]);
  const groupCount = (statuses: SessionStatus[] | null) => (statuses ? sessions.filter((s) => statuses.includes(s.status)).length : sessions.length);

  const visible = useMemo(() => {
    const g = GROUPS.find((x) => x.key === group)!;
    const q = search.trim().toLowerCase();
    return sessions
      .filter((s) => (!g.statuses || g.statuses.includes(s.status))
        && (!bootcampFilter || s.bootcampId === bootcampFilter)
        && (!q || `${s.sessionName ?? ""} ${s.bootcampTitle ?? ""} ${s.location ?? ""}`.toLowerCase().includes(q)))
      .sort((a, b) => {
        // À venir et en cours : la plus proche d'abord ; terminées : la plus récente d'abord
        const ta = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        const tb = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        return group === "DONE" ? tb - ta : ta - tb;
      });
  }, [sessions, group, bootcampFilter, search]);

  const isLoading = loadingBootcamps || loadingSessions;

  return (
    <AdminLayout
      title="Sessions"
      description={`${sessions.length} session${sessions.length > 1 ? "s" : ""} sur ${bootcamps?.length ?? 0} formation${(bootcamps?.length ?? 0) > 1 ? "s" : ""}`}
      actions={canManage ? <Button type="button" size="sm" shape="rounded" disabled={!bootcamps?.length} onClick={() => setCreating(true)}><Plus />Nouvelle session</Button> : undefined}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les sessions">
          {GROUPS.map((g) => (
            <Button key={g.key} type="button" size="sm" shape="pill" variant={group === g.key ? "navy" : "outline"} aria-pressed={group === g.key} onClick={() => setGroup(g.key)}>
              {g.label}<span className="ml-1.5 rounded-pill bg-surface-sand px-1.5 text-[0.6875rem] font-bold text-ink-secondary">{groupCount(g.statuses)}</span>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Formation" className={cn(inputClass, "max-w-xs")} value={bootcampFilter} onChange={(e) => setBootcampFilter(e.target.value)}>
            <option value="">Toutes les formations</option>
            {bootcamps?.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 sm:max-w-xs">
            <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            <input type="search" aria-label="Rechercher une session" placeholder="Nom, formation, lieu…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les sessions.</ErrorNotice>}
        {!isLoading && !isError && sessions.length === 0 && (
          <EmptyState title="Aucune session" text="Créez d'abord une formation, puis ajoutez ses sessions."
            action={<Button asChild variant="outline" shape="rounded"><Link to="/admin/bootcamps"><BookOpen />Gérer les formations</Link></Button>} />
        )}
        {!isLoading && sessions.length > 0 && visible.length === 0 && <EmptyState title="Aucune session ne correspond" text="Modifiez les filtres ou la recherche." />}

        <ul className="flex flex-col gap-3">
          {visible.map((s) => {
            const fill = s.maxParticipants > 0 ? Math.min(100, Math.round((s.currentParticipants / s.maxParticipants) * 100)) : 0;
            return (
              <li key={s.id}>
                <Card radius="stat" className="flex flex-wrap items-center gap-x-5 gap-y-3 border border-[#E7E0D4] p-4">
                  <button
                    type="button"
                    disabled={!canManage || featured.isPending}
                    onClick={() => featured.mutate(s.id)}
                    className={cn("shrink-0", s.isFeatured ? "text-cta" : "text-[#C9C0B0] hover:text-cta", !canManage && "cursor-default hover:text-[#C9C0B0]")}
                    title={s.isFeatured ? "Mise en avant : retirer" : "Mettre en avant"}
                    aria-label={s.isFeatured ? "Retirer la mise en avant" : "Mettre en avant"}
                    aria-pressed={s.isFeatured}
                  >
                    <Star className={cn("h-5 w-5", s.isFeatured && "fill-current")} />
                  </button>
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-base font-bold text-navy">{s.sessionName ?? `Cohorte ${s.cohortNumber ?? "?"}`}</span>
                      <Pill variant={STATUS_PILL[s.status]}>{STATUS_LABELS[s.status]}</Pill>
                      {!s.published && <Pill variant="neutral">Non publiée</Pill>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
                      {s.bootcampTitle && <span className="inline-flex items-center gap-1 font-semibold text-navy"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />{s.bootcampTitle}</span>}
                      {s.startDate && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{day(s.startDate)}{s.endDate ? ` → ${day(s.endDate)}` : ""}</span>}
                      <span>{FORMAT_LABELS[s.format]}</span>
                      {s.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{s.location}</span>}
                      {s.price && <span className="font-semibold text-ink">{s.price}</span>}
                    </div>
                  </div>
                  <div className="flex w-40 flex-col gap-1" aria-label="Places">
                    <span className="inline-flex items-center gap-1 text-xs text-ink-secondary"><Users className="h-3.5 w-3.5" aria-hidden="true" />{s.currentParticipants} / {s.maxParticipants} places{s.isFull ? " · complète" : ""}</span>
                    <ProgressBar value={fill} max={100} />
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button asChild variant="outline" shape="rounded" size="sm"><Link to={`/admin/sessions/${s.id}`} aria-label={`Suivi de ${s.sessionName ?? "la session"}`}><ClipboardList />Suivi</Link></Button>
                    {(canManage || canPrice) && (
                      <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Modifier ${s.sessionName ?? "la session"}`} onClick={() => setEditing(s)}><Pencil /></Button>
                    )}
                    {canManage && (
                      <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Supprimer ${s.sessionName ?? "la session"}`} onClick={() => setDeleting(s)}><Trash2 /></Button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>

      {(creating || editing) && (
        <SessionDialog
          session={editing}
          bootcamps={bootcamps ?? []}
          defaultBootcamp={bootcampFilter || searchParams.get("bootcamp") || bootcamps?.[0]?.id || ""}
          canPrice={canPrice}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Supprimer cette session ?"
        description={deleting ? `« ${deleting.sessionName ?? "Session"} » (${deleting.bootcampTitle ?? ""}) sera supprimée. Les inscriptions existantes ne sont pas supprimées.` : ""}
        onConfirm={async () => { if (deleting) { try { await remove.mutateAsync(deleting.id); } catch (e) { toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }); } } }}
      />
    </AdminLayout>
  );
}
