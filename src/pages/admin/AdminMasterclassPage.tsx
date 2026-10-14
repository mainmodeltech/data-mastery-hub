/**
 * AdminMasterclassPage.tsx — masterclass (design system) : une par mois ou tous les deux mois, gérées comme des événements.
 * Liste des événements (statut, inscrits, présents), création/modification (date, durée, lieu, lien de connexion, places,
 * publication), fiche d'un événement avec ses inscrits (recherche, présence, export CSV) et message aux inscrits.
 * Le lien de connexion n'est jamais public : il est envoyé aux inscrits dans la confirmation.
 */
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, CalendarDays, Download, Loader2, Mail, MapPin, Pencil, Plus, Search, Send, Trash2, Users, Video } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useAdminMasterclasses, useDeleteMasterclass, useMasterclassRegistrants, useMessageRegistrants, useSaveMasterclass, useSetAttendance,
} from "@/hooks/useMasterclasses";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { csvRow, downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_LABELS, FORMAT_LABELS, STATUS_LABELS,
  type AdminMasterclass, type Attendance, type MasterclassFormat, type MasterclassPayload, type MasterclassStatus,
} from "@/services/api/masterclassService";

const STATUS_PILL: Record<MasterclassStatus, "neutral" | "success" | "warning" | "info"> = { DRAFT: "neutral", OPEN: "success", CLOSED: "warning", DONE: "info" };
const ATTENDANCE_PILL: Record<Attendance, "neutral" | "success" | "error"> = { REGISTERED: "neutral", ATTENDED: "success", ABSENT: "error" };

const when = (iso: string) => format(parseISO(iso), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr });
const shortDay = (iso: string) => format(parseISO(iso), "d MMM yyyy", { locale: fr });
const hours = (min: number) => `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60}` : ""}`;

interface FormState {
  title: string; description: string; startsAt: string; durationMinutes: string; format: MasterclassFormat;
  place: string; joinUrl: string; capacity: string; published: boolean; registrationsClosed: boolean;
}

const emptyForm = (): FormState => ({
  title: "", description: "", startsAt: "", durationMinutes: "120", format: "ONLINE", place: "En ligne", joinUrl: "",
  capacity: "", published: false, registrationsClosed: false,
});

const toForm = (m: AdminMasterclass): FormState => ({
  title: m.title, description: m.description ?? "", startsAt: m.startsAt.slice(0, 16), durationMinutes: String(m.durationMinutes), format: m.format,
  place: m.place ?? "", joinUrl: m.joinUrl ?? "", capacity: m.capacity?.toString() ?? "", published: m.published, registrationsClosed: m.registrationsClosed,
});

function EventDialog({ event, onClose }: { event: AdminMasterclass | null; onClose: () => void }) {
  const { toast } = useToast();
  const save = useSaveMasterclass();
  const [form, setForm] = useState<FormState>(event ? toForm(event) : emptyForm());
  const [error, setError] = useState("");
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const duration = Number(form.durationMinutes);
    if (!form.startsAt) return setError("La date et l'heure sont obligatoires.");
    if (!Number.isInteger(duration) || duration < 15 || duration > 600) return setError("La durée doit être comprise entre 15 minutes et 10 heures.");
    if (form.published && form.format !== "ONSITE" && !form.joinUrl.trim()) return setError("Renseignez le lien de connexion avant de publier : il est envoyé aux inscrits.");
    const payload: MasterclassPayload = {
      title: form.title.trim(), description: form.description.trim(),
      startsAt: form.startsAt.length === 16 ? `${form.startsAt}:00` : form.startsAt,
      durationMinutes: duration, format: form.format, place: form.place.trim(), joinUrl: form.joinUrl.trim(),
      capacity: form.capacity ? Number(form.capacity) : null, published: form.published, registrationsClosed: form.registrationsClosed,
    };
    try {
      await save.mutateAsync({ id: event?.id, payload });
      toast({ title: event ? "Masterclass mise à jour" : "Masterclass créée", description: payload.title });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !save.isPending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{event ? "Modifier la masterclass" : "Nouvelle masterclass"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">La page « Masterclass » du site affiche la prochaine masterclass publiée.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <Field label="Titre *" htmlFor="mc-title"><input id="mc-title" required maxLength={200} className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Power BI : de zéro à votre premier tableau de bord" /></Field>
          <Field label="Description" htmlFor="mc-desc"><textarea id="mc-desc" rows={3} maxLength={5000} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date et heure *" htmlFor="mc-start"><input id="mc-start" type="datetime-local" required className={inputClass} value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></Field>
            <Field label="Durée (minutes)" htmlFor="mc-dur"><input id="mc-dur" type="number" min={15} max={600} step={15} className={inputClass} value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} /></Field>
            <Field label="Places" htmlFor="mc-cap" hint="Vide : illimité."><input id="mc-cap" type="number" min={1} className={inputClass} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <Field label="Format" htmlFor="mc-format">
              <select id="mc-format" className={inputClass} value={form.format} onChange={(e) => set("format", e.target.value as MasterclassFormat)}>
                {Object.entries(FORMAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Lieu" htmlFor="mc-place"><input id="mc-place" className={inputClass} value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="En ligne (Google Meet) ou adresse" /></Field>
          </div>
          <Field label="Lien de connexion" htmlFor="mc-join" hint="Jamais affiché sur le site : envoyé uniquement aux inscrits (confirmation et messages).">
            <input id="mc-join" type="url" className={inputClass} value={form.joinUrl} onChange={(e) => set("joinUrl", e.target.value)} placeholder="https://meet.google.com/…" />
          </Field>
          <SwitchRow label="Publiée" description="Visible sur le site et ouverte aux inscriptions." checked={form.published} onChange={(v) => set("published", v)} />
          <SwitchRow label="Inscriptions closes" description="Ferme les inscriptions sans dépublier (complet avant l'heure, événement annulé…)." checked={form.registrationsClosed} onChange={(v) => set("registrationsClosed", v)} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={save.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={save.isPending}>{save.isPending ? <Loader2 className="animate-spin" /> : event ? "Enregistrer" : "Créer la masterclass"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MessageDialog({ event, onClose }: { event: AdminMasterclass; onClose: () => void }) {
  const { toast } = useToast();
  const send = useMessageRegistrants(event.id);
  const [subject, setSubject] = useState(`Rappel — ${event.title}`);
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"ALL" | "ATTENDED" | "ABSENT">("ALL");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const n = await send.mutateAsync({ subject: subject.trim(), body: body.trim(), audience });
      toast({ title: n === 0 ? "Aucun destinataire" : `Message envoyé à ${n} inscrit${n > 1 ? "s" : ""}` });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Envoi impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !send.isPending && onClose()}>
      <DialogContent className="max-w-lg rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Écrire aux inscrits</DialogTitle>
          <DialogDescription className="text-ink-secondary">Rappel, lien de connexion, support ou remerciements. L'e-mail reprend la date, le lieu et le lien.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <Field label="Destinataires" htmlFor="mm-aud">
            <select id="mm-aud" className={inputClass} value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)}>
              <option value="ALL">Tous les inscrits ({event.registered})</option>
              <option value="ATTENDED">Les présents ({event.attended})</option>
              <option value="ABSENT">Les absents</option>
            </select>
          </Field>
          <Field label="Objet *" htmlFor="mm-sub"><input id="mm-sub" required maxLength={150} className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Message *" htmlFor="mm-body"><textarea id="mm-body" required rows={6} maxLength={5000} className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={send.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={send.isPending || !body.trim()}>{send.isPending ? <Loader2 className="animate-spin" /> : <><Send />Envoyer</>}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventDetail({ event, canManage, onBack, onEdit }: { event: AdminMasterclass; canManage: boolean; onBack: () => void; onEdit: () => void }) {
  const { toast } = useToast();
  const { data, isLoading, isError } = useMasterclassRegistrants(event.id);
  const attendance = useSetAttendance(event.id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | Attendance>("ALL");
  const [messaging, setMessaging] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => (filter === "ALL" || r.attendance === filter)
      && (!q || `${r.firstName} ${r.lastName} ${r.email} ${r.phone ?? ""} ${r.company ?? ""} ${r.profile ?? ""}`.toLowerCase().includes(q)));
  }, [items, search, filter]);
  const fill = event.capacity ? Math.min(100, Math.round((event.registered / event.capacity) * 100)) : 0;

  const exportCsv = () => {
    const lines = [csvRow(["Inscrit le", "Prénom", "Nom", "E-mail", "Téléphone", "Profil", "Entreprise", "Présence"])];
    items.forEach((r) => lines.push(csvRow([r.createdAt.slice(0, 10), r.firstName, r.lastName, r.email, r.phone, r.profile, r.company, ATTENDANCE_LABELS[r.attendance]])));
    downloadCsv(`masterclass-${event.code}.csv`, lines);
  };

  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-navy hover:text-cta"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Toutes les masterclass</button>

      <Card radius="stat" className="flex flex-col gap-3 border border-[#E7E0D4] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-bold text-navy">{event.title}</h2>
          <Pill variant={STATUS_PILL[event.status]}>{STATUS_LABELS[event.status]}</Pill>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-secondary">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" />{when(event.startsAt)} · {hours(event.durationMinutes)}</span>
          <span className="inline-flex items-center gap-1.5"><Video className="h-4 w-4" aria-hidden="true" />{FORMAT_LABELS[event.format]}</span>
          {event.place && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden="true" />{event.place}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm"><strong className="text-ink">{event.registered}</strong> inscrit{event.registered > 1 ? "s" : ""}{event.capacity ? ` sur ${event.capacity} places` : ""} · <strong className="text-ink">{event.attended}</strong> présent{event.attended > 1 ? "s" : ""}</span>
            {event.capacity ? <div className="w-56"><ProgressBar value={fill} max={100} /></div> : null}
          </div>
          <span className="flex-1" />
          {canManage && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" shape="rounded" size="sm" onClick={onEdit}><Pencil />Modifier</Button>
              <Button type="button" variant="navy" shape="rounded" size="sm" disabled={event.registered === 0} onClick={() => setMessaging(true)}><Mail />Écrire aux inscrits</Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "REGISTERED", "ATTENDED", "ABSENT"] as const).map((f) => (
          <Button key={f} type="button" size="sm" shape="pill" variant={filter === f ? "navy" : "outline"} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "ALL" ? "Tous" : f === "REGISTERED" ? "À pointer" : ATTENDANCE_LABELS[f]}
            <span className="ml-1.5 rounded-pill bg-surface-sand px-1.5 text-[0.6875rem] font-bold text-ink-secondary">{f === "ALL" ? items.length : items.filter((r) => r.attendance === f).length}</span>
          </Button>
        ))}
        <span className="flex-1" />
        <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5">
          <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
          <input type="search" aria-label="Rechercher un inscrit" placeholder="Nom, e-mail, entreprise…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 bg-transparent text-sm outline-none" />
        </div>
        <Button type="button" variant="outline" shape="rounded" size="sm" disabled={items.length === 0} onClick={exportCsv}><Download />Exporter</Button>
      </div>

      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>Impossible de charger les inscrits.</ErrorNotice>}
      {!isLoading && !isError && items.length === 0 && <EmptyState title="Aucun inscrit pour le moment" text="Les inscriptions faites depuis le site apparaissent ici." />}
      {items.length > 0 && visible.length === 0 && <EmptyState title="Aucun inscrit ne correspond" />}

      {visible.length > 0 && (
        <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] bg-app-bg text-xs text-ink-secondary">
                <tr><th scope="col" className="px-4 py-3 font-semibold">Inscrit</th><th scope="col" className="px-4 py-3 font-semibold">Contact</th><th scope="col" className="px-4 py-3 font-semibold">Profil</th><th scope="col" className="px-4 py-3 font-semibold">Le</th><th scope="col" className="px-4 py-3 font-semibold">Présence</th></tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-b border-[#E7E0D4] last:border-b-0">
                    <td className="px-4 py-3"><div className="font-semibold text-ink">{r.firstName} {r.lastName}</div>{r.company && <div className="text-xs text-ink-secondary">{r.company}</div>}</td>
                    <td className="px-4 py-3"><a href={`mailto:${r.email}`} className="text-navy hover:text-cta">{r.email}</a><div className="text-xs text-ink-secondary">{r.phone}</div></td>
                    <td className="px-4 py-3 text-ink-secondary">{r.profile ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-secondary">{shortDay(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      {canManage ? (
                        <select aria-label={`Présence de ${r.firstName} ${r.lastName}`} className={cn(inputClass, "w-36 py-1.5")} value={r.attendance} disabled={attendance.isPending}
                          onChange={(e) => attendance.mutate({ registrationId: r.id, attendance: e.target.value as Attendance }, { onError: (err) => toast({ title: "Enregistrement impossible", description: errorMessage(err), variant: "destructive" }) })}>
                          {Object.entries(ATTENDANCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      ) : <Pill variant={ATTENDANCE_PILL[r.attendance]}>{ATTENDANCE_LABELS[r.attendance]}</Pill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {data && data.total > items.length && <p className="text-xs text-ink-secondary">{items.length} inscrits affichés sur {data.total}.</p>}
      {messaging && <MessageDialog event={event} onClose={() => setMessaging(false)} />}
    </div>
  );
}

export default function AdminMasterclassPage() {
  const { can } = useAuth();
  const canManage = can("MASTERCLASS_MANAGE");
  const { toast } = useToast();
  const { data: events = [], isLoading, isError } = useAdminMasterclasses();
  const remove = useDeleteMasterclass();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminMasterclass | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminMasterclass | null>(null);

  const selected = events.find((e) => e.id === openId) ?? null;
  const upcoming = events.filter((e) => e.status !== "DONE").sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const done = events.filter((e) => e.status === "DONE");

  const card = (m: AdminMasterclass) => {
    const fill = m.capacity ? Math.min(100, Math.round((m.registered / m.capacity) * 100)) : 0;
    return (
      <li key={m.id}>
        <Card radius="stat" className="flex flex-wrap items-center gap-x-5 gap-y-3 border border-[#E7E0D4] p-4">
          <button type="button" onClick={() => setOpenId(m.id)} className="min-w-0 flex-1 basis-72 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-base font-bold text-navy">{m.title}</span>
              <Pill variant={STATUS_PILL[m.status]}>{STATUS_LABELS[m.status]}</Pill>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{when(m.startsAt)}</span>
              <span>{FORMAT_LABELS[m.format]}{m.place ? ` · ${m.place}` : ""}</span>
            </div>
          </button>
          <div className="flex w-48 flex-col gap-1">
            <span className="inline-flex items-center gap-1 text-xs text-ink-secondary"><Users className="h-3.5 w-3.5" aria-hidden="true" />{m.registered}{m.capacity ? ` / ${m.capacity}` : ""} inscrit{m.registered > 1 ? "s" : ""}{m.attended ? ` · ${m.attended} présent${m.attended > 1 ? "s" : ""}` : ""}</span>
            {m.capacity ? <ProgressBar value={fill} max={100} /> : null}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button type="button" variant="outline" shape="rounded" size="sm" onClick={() => setOpenId(m.id)}>Inscrits</Button>
            {canManage && <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Modifier ${m.title}`} onClick={() => setEditing(m)}><Pencil /></Button>}
            {canManage && m.registered === 0 && <Button type="button" variant="outline" shape="rounded" size="sm" aria-label={`Supprimer ${m.title}`} onClick={() => setDeleting(m)}><Trash2 /></Button>}
          </div>
        </Card>
      </li>
    );
  };

  return (
    <AdminLayout
      title="Masterclass"
      description="Les événements gratuits : dates, inscrits et présences"
      actions={canManage && !selected ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouvelle masterclass</Button> : undefined}
    >
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>Impossible de charger les masterclass.</ErrorNotice>}

      {selected ? (
        <EventDetail event={selected} canManage={canManage} onBack={() => setOpenId(null)} onEdit={() => setEditing(selected)} />
      ) : (
        !isLoading && !isError && (
          <div className="flex flex-col gap-6">
            {events.length === 0 && <EmptyState title="Aucune masterclass" text="Créez la prochaine masterclass : elle apparaît sur le site dès qu'elle est publiée." />}
            {upcoming.length > 0 && (
              <section className="flex flex-col gap-3"><h2 className="font-heading text-lg font-bold text-navy">À venir</h2><ul className="flex flex-col gap-3">{upcoming.map(card)}</ul></section>
            )}
            {done.length > 0 && (
              <section className="flex flex-col gap-3"><h2 className="font-heading text-lg font-bold text-navy">Terminées</h2><ul className="flex flex-col gap-3">{done.map(card)}</ul></section>
            )}
          </div>
        )
      )}

      {(creating || editing) && <EventDialog event={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Supprimer cette masterclass ?"
        description={deleting ? `« ${deleting.title} » n'a aucun inscrit ; elle sera supprimée.` : ""}
        onConfirm={async () => { if (deleting) { try { await remove.mutateAsync(deleting.id); toast({ title: "Masterclass supprimée" }); } catch (e) { toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }); } } }}
      />
    </AdminLayout>
  );
}
