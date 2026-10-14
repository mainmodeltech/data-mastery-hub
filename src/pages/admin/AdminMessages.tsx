/**
 * AdminMessages.tsx — messages reçus par le site (contact, diagnostic entreprise, candidature partenaire), design system.
 * Puces de statut avec compteurs, filtre par origine, recherche, liste, fiche dans un panneau latéral (ouvrir un message
 * non lu le marque comme lu), changement de statut, réponse par e-mail, suppression confirmée.
 */
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Mail, Phone, Search, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, inputClass } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useContactMessages, useDeleteContactMessage, useUpdateContactStatus } from "@/hooks/useContacts";
import { cn } from "@/lib/utils";
import { PARTNER_DOMAINS, PEOPLE_COUNTS, TRAINING_NEEDS } from "@/services/api/siteFormsService";
import type { ContactMessage, ContactMessageStatus, ContactMessageType } from "@/types";

const STATUS: Record<ContactMessageStatus, { label: string; pill: "error" | "neutral" | "success" | "info" }> = {
  unread: { label: "Non lu", pill: "error" },
  read: { label: "Lu", pill: "neutral" },
  replied: { label: "Répondu", pill: "success" },
  archived: { label: "Archivé", pill: "info" },
};

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "unread", label: "Non lus" },
  { value: "read", label: "Lus" },
  { value: "replied", label: "Répondus" },
  { value: "archived", label: "Archivés" },
];

const TYPE_LABELS: Record<ContactMessageType, string> = {
  CONTACT: "Contact",
  DIAGNOSTIC: "Diagnostic entreprise",
  PARTNER_APPLICATION: "Candidature partenaire",
};

const TYPE_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Toutes origines" },
  { value: "CONTACT", label: "Contacts" },
  { value: "DIAGNOSTIC", label: "Diagnostics" },
  { value: "PARTNER_APPLICATION", label: "Partenaires" },
];

/** Libellés lisibles des détails structurés renvoyés par le backend. */
const DETAIL_LABELS: Record<string, string> = {
  role: "Fonction", peopleCount: "Personnes à former", need: "Besoin principal", context: "Contexte",
  organization: "Organisme", domain: "Domaine", linkedinUrl: "Profil LinkedIn", proposal: "Formation proposée", references: "Références",
};

/** Codes d'énumération du backend → libellés affichés dans le formulaire du site. */
const CODE_LABELS: Record<string, string> = Object.fromEntries(
  [...PEOPLE_COUNTS, ...TRAINING_NEEDS, ...PARTNER_DOMAINS].map((o) => [o.code, o.label]),
);

function detailValue(v: unknown): string {
  if (typeof v !== "string") return JSON.stringify(v);
  return v ? CODE_LABELS[v] ?? v : "—";
}

const when = (iso: string) => format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });
const short = (iso: string) => format(new Date(iso), "d MMM", { locale: fr });

export default function AdminMessages() {
  const { can } = useAuth();
  const canManage = can("MESSAGES_MANAGE");
  const [filterStatus, setFilterStatus] = useState("unread");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);

  const { data, isLoading, isError } = useContactMessages(0, 200);
  const updateStatus = useUpdateContactStatus();
  const deleteMsg = useDeleteContactMessage();

  const messages = useMemo(() => data?.items ?? [], [data]);
  const selected = messages.find((m) => m.id === openId) ?? null;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: messages.length, unread: 0, read: 0, replied: 0, archived: 0 };
    messages.forEach((m) => { c[m.status] = (c[m.status] ?? 0) + 1; });
    return c;
  }, [messages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) =>
      (filterStatus === "all" || m.status === filterStatus)
      && (filterType === "all" || (m.type ?? "CONTACT") === filterType)
      && (!q || `${m.firstName} ${m.lastName} ${m.email} ${m.subject ?? ""} ${m.company ?? ""} ${m.message}`.toLowerCase().includes(q)));
  }, [messages, filterStatus, filterType, search]);

  const open = (m: ContactMessage) => {
    setOpenId(m.id);
    if (m.status === "unread" && canManage) updateStatus.mutate({ id: m.id, status: "read" });
  };

  return (
    <AdminLayout title="Messages" description="Contacts, diagnostics entreprise et candidatures de partenaires reçus par le site">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par statut">
          {STATUS_TABS.map((t) => (
            <Button key={t.value} type="button" size="sm" shape="pill" variant={filterStatus === t.value ? "navy" : "outline"} aria-pressed={filterStatus === t.value} onClick={() => setFilterStatus(t.value)}>
              {t.label}
              <span className={cn("ml-1.5 rounded-pill px-1.5 text-[0.6875rem] font-bold", t.value === "unread" && counts.unread > 0 ? "bg-cta text-white" : "bg-surface-sand text-ink-secondary")}>{counts[t.value] ?? 0}</span>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Origine" className={cn(inputClass, "max-w-[220px]")} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {TYPE_TABS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5 sm:max-w-sm">
            <Search className="h-4 w-4 text-ink-secondary" aria-hidden="true" />
            <input type="search" aria-label="Rechercher un message" placeholder="Nom, e-mail, sujet, texte…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les messages.</ErrorNotice>}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState title={messages.length === 0 ? "Aucun message" : "Aucun message ne correspond"} text={messages.length === 0 ? "Les messages envoyés depuis le site apparaissent ici." : "Modifiez le statut, l'origine ou la recherche."} />
        )}

        {filtered.length > 0 && (
          <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
            <ul>
              {filtered.map((m) => (
                <li key={m.id} className="border-b border-[#E7E0D4] last:border-b-0">
                  <button type="button" onClick={() => open(m)} className="flex w-full items-start gap-4 px-4 py-3.5 text-left hover:bg-app-bg">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-pill", m.status === "unread" ? "bg-cta" : "bg-transparent")} aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn("truncate text-sm text-ink", m.status === "unread" && "font-bold")}>{m.firstName} {m.lastName}</span>
                        {m.company && <span className="truncate text-xs text-ink-secondary">{m.company}</span>}
                        <Pill variant={STATUS[m.status].pill}>{STATUS[m.status].label}</Pill>
                        {(m.type ?? "CONTACT") !== "CONTACT" && <Pill variant="info">{TYPE_LABELS[m.type as ContactMessageType]}</Pill>}
                      </span>
                      <span className="truncate text-sm font-semibold text-navy">{m.subject || "(sans objet)"}</span>
                      <span className="line-clamp-1 text-[0.8125rem] text-ink-secondary">{m.message}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-secondary">{short(m.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {data && data.pagination.totalElements > messages.length && (
          <p className="text-xs text-ink-secondary">{messages.length} messages les plus récents affichés sur {data.pagination.totalElements}.</p>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <div className="flex flex-col gap-4">
              <SheetHeader className="text-left">
                <SheetTitle className="font-heading text-xl font-bold text-navy">{selected.firstName} {selected.lastName}</SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2">
                  <Pill variant={STATUS[selected.status].pill}>{STATUS[selected.status].label}</Pill>
                  <span>Reçu le {when(selected.createdAt)}</span>
                </SheetDescription>
              </SheetHeader>

              <dl className="grid gap-1.5 rounded-card bg-app-bg p-4 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-navy" aria-hidden="true" /><a href={`mailto:${selected.email}`} className="font-semibold text-navy hover:text-cta">{selected.email}</a></div>
                {selected.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-navy" aria-hidden="true" /><a href={`tel:${selected.phone}`} className="hover:text-cta">{selected.phone}</a></div>}
                {selected.company && <div><span className="text-ink-secondary">Entreprise : </span><strong>{selected.company}</strong></div>}
                {(selected.type || selected.requesterType) && (
                  <div>
                    <span className="text-ink-secondary">Origine : </span>
                    <strong>{selected.type ? TYPE_LABELS[selected.type] : "Contact"}{selected.requesterType ? ` · ${selected.requesterType === "ENTREPRISE" ? "entreprise" : "particulier"}` : ""}</strong>
                  </div>
                )}
              </dl>

              {selected.subject && <h3 className="font-heading text-lg font-bold text-navy">{selected.subject}</h3>}

              {selected.details && Object.keys(selected.details).length > 0 && (
                <dl className="grid gap-x-6 gap-y-2 rounded-card border border-[#E7E0D4] p-4 text-sm sm:grid-cols-2">
                  {Object.entries(selected.details).map(([k, v]) => (
                    <div key={k} className="min-w-0">
                      <dt className="text-xs text-ink-secondary">{DETAIL_LABELS[k] ?? k}</dt>
                      <dd className="break-words font-semibold text-ink">{detailValue(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="whitespace-pre-wrap rounded-card border-l-4 border-navy bg-white p-4 text-sm leading-relaxed text-ink">{selected.message}</div>

              {canManage && (
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="ms-status" className="text-sm font-semibold text-ink">Statut</label>
                  <select id="ms-status" className={cn(inputClass, "w-44")} value={selected.status} onChange={(e) => updateStatus.mutate({ id: selected.id, status: e.target.value as ContactMessageStatus })}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button asChild shape="rounded" variant="navy" onClick={() => canManage && selected.status !== "replied" && updateStatus.mutate({ id: selected.id, status: "replied" })}>
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject ?? "Votre message"}`)}`}><Mail />Répondre par e-mail</a>
                </Button>
                {canManage && (
                  <Button type="button" shape="rounded" variant="outline" className="text-error" onClick={() => setToDelete(selected)}><Trash2 />Supprimer</Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer ce message ?"
        description={toDelete ? `Le message de ${toDelete.firstName} ${toDelete.lastName} sera supprimé définitivement.` : ""}
        onConfirm={async () => { if (toDelete) { await deleteMsg.mutateAsync(toDelete.id); if (openId === toDelete.id) setOpenId(null); } }}
      />
    </AdminLayout>
  );
}
