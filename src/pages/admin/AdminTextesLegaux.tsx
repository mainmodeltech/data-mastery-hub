/**
 * AdminTextesLegaux.tsx — textes légaux de la plateforme (Direction seulement).
 * CGU, CGV, politique de confidentialité et mentions légales : un modèle est chargé en brouillon, à compléter puis à FAIRE VALIDER par le conseil
 * juridique. La publication exige que tous les champs « [À COMPLÉTER] » soient renseignés et que la validation du conseil (qui, quand) soit
 * indiquée ; la version publiée est figée (une modification ouvre une nouvelle version). Tant qu'un texte n'est pas publié, il n'est pas exigé.
 * L'onglet « Preuves d'acceptation » liste qui a accepté quelle version, quand et pour quel acte.
 */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Eye, Loader2, Pencil, Save, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, Pager } from "@/components/admin/AdminKit";
import { LegalText } from "@/components/legal/LegalText";
import { Button, Card, Pill } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDiscardLegalDraft, useLegalAcceptances, useLegalOverview, usePublishLegal, useSaveLegalDraft } from "@/hooks/useLegal";
import { placeholderCount } from "@/lib/legalText";
import { LEGAL_CODES, LEGAL_CONTEXT_LABELS, LEGAL_STATUS_LABELS, type LegalAdminOverview, type LegalCode } from "@/types/legal.type";

const stamp = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr }) : "—");
const day = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMM yyyy", { locale: fr }) : "—");

// ── Publication ─────────────────────────────────────────────────────────

function PublishDialog({ code, label, onClose }: { code: LegalCode; label: string; onClose: () => void }) {
  const { toast } = useToast();
  const publish = usePublishLegal();
  const [counsel, setCounsel] = useState("");
  const [on, setOn] = useState(format(new Date(), "yyyy-MM-dd"));
  const [summary, setSummary] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publish.mutateAsync({ code, body: { counselValidatedBy: counsel.trim(), counselValidatedOn: on, changeSummary: summary.trim() } });
      toast({ title: "Texte publié", description: `${label} est en vigueur : il est désormais exigé aux clients.` });
      onClose();
    } catch (err) {
      toast({ title: "Publication impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !publish.isPending && onClose()}>
      <DialogContent className="max-w-lg rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">Publier : {label}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            La version publiée est <strong>figée</strong> et devient celle que les clients doivent accepter (achat, candidature, demande, espace apprenant). Les acceptations
            seront enregistrées avec cette version. Ne publiez qu'un texte validé par votre conseil juridique.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Validé par (conseil juridique) *" htmlFor="lg-counsel" hint="Nom du juriste ou du cabinet."><input id="lg-counsel" required maxLength={255} className={inputClass} value={counsel} onChange={(e) => setCounsel(e.target.value)} /></Field>
            <Field label="Date de validation *" htmlFor="lg-on"><input id="lg-on" type="date" required max={format(new Date(), "yyyy-MM-dd")} className={inputClass} value={on} onChange={(e) => setOn(e.target.value)} /></Field>
          </div>
          <Field label="Ce qui change *" htmlFor="lg-summary" hint="Résumé gardé dans l'historique (par exemple « première publication », « ajout de la clause de remboursement »)."><textarea id="lg-summary" required rows={3} maxLength={2000} className={inputClass} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={publish.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={publish.isPending || !counsel.trim() || !summary.trim()}>{publish.isPending ? <Loader2 className="animate-spin" /> : "Publier"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Un texte ────────────────────────────────────────────────────────────

function DocumentEditor({ doc }: { doc: LegalAdminOverview }) {
  const { toast } = useToast();
  const save = useSaveLegalDraft();
  const discard = useDiscardLegalDraft();
  const source = doc.draft ?? doc.published;
  const [title, setTitle] = useState(source?.title ?? doc.label);
  const [body, setBody] = useState(source?.body ?? "");
  const [summary, setSummary] = useState(doc.draft?.changeSummary ?? "");
  const [editing, setEditing] = useState(!!doc.draft);
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  // Le formulaire repart de l'état enregistré quand on change de texte ou que le serveur renvoie une nouvelle version
  useEffect(() => {
    const s = doc.draft ?? doc.published;
    setTitle(s?.title ?? doc.label);
    setBody(s?.body ?? "");
    setSummary(doc.draft?.changeSummary ?? "");
    setEditing(!!doc.draft);
    setPreview(false);
  }, [doc.code, doc.draft?.id, doc.draft?.updatedAt, doc.published?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const missing = useMemo(() => placeholderCount(body), [body]);
  const dirty = doc.draft ? (title !== doc.draft.title || body !== doc.draft.body || summary !== (doc.draft.changeSummary ?? "")) : editing;
  const canPublish = !!doc.draft && !dirty && !doc.draft.hasPlaceholders;

  const saveDraft = async () => {
    try {
      await save.mutateAsync({ code: doc.code, body: { title: title.trim(), body, changeSummary: summary.trim() || undefined } });
      toast({ title: "Brouillon enregistré" });
    } catch (err) {
      toast({ title: "Enregistrement impossible", description: errorMessage(err), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {doc.published ? <Pill variant="success">En vigueur : version {doc.published.version} ({day(doc.published.publishedAt)})</Pill> : <Pill variant="warning">Non publié : rien n'est exigé</Pill>}
        {doc.draft && <Pill variant="info">Brouillon version {doc.draft.version}</Pill>}
        <a href={doc.path} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-navy underline">Voir la page publique</a>
      </div>

      {doc.published && (
        <p className="text-xs text-ink-secondary">
          Version en vigueur validée par <strong>{doc.published.counselValidatedBy}</strong> le {day(doc.published.counselValidatedOn)}, publiée par {doc.published.publishedBy} le {stamp(doc.published.publishedAt)}.
        </p>
      )}

      {!editing ? (
        <>
          <Card radius="stat" className="max-h-[28rem] overflow-y-auto border border-[#E7E0D4] p-5"><LegalText source={doc.published?.body ?? ""} /></Card>
          <Button type="button" shape="rounded" className="w-fit" onClick={() => setEditing(true)}><Pencil />Modifier (ouvre une nouvelle version)</Button>
        </>
      ) : (
        <>
          {missing > 0 && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-warning-bg px-4 py-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{missing} champ{missing > 1 ? "s" : ""} « [À COMPLÉTER] » restent à renseigner. Vous pouvez enregistrer le brouillon, mais la publication est bloquée tant qu'il en reste.</span>
            </p>
          )}
          <Field label="Titre *" htmlFor="lg-title"><input id="lg-title" required maxLength={200} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">Texte *</span>
            <Button type="button" size="sm" variant="outline" shape="rounded" onClick={() => setPreview((p) => !p)}><Eye />{preview ? "Modifier" : "Aperçu"}</Button>
          </div>
          {preview
            ? <Card radius="stat" className="max-h-[32rem] overflow-y-auto border border-[#E7E0D4] p-5"><LegalText source={body} /></Card>
            : <textarea aria-label="Texte" rows={22} spellCheck className={`${inputClass} font-mono text-[0.8125rem] leading-relaxed`} value={body} onChange={(e) => setBody(e.target.value)} />}
          <p className="text-xs text-ink-secondary">Mise en forme : « ## Titre », « ### Sous-titre », « - » pour une liste, **gras**, *italique*. Une ligne vide sépare les paragraphes.</p>
          <Field label="Ce qui change" htmlFor="lg-summary-draft" hint="Repris dans l'historique à la publication."><input id="lg-summary-draft" maxLength={2000} className={inputClass} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
          <div className="flex flex-wrap gap-3">
            <Button type="button" shape="rounded" disabled={save.isPending || !title.trim() || !body.trim() || (!!doc.draft && !dirty)} onClick={saveDraft}>
              {save.isPending ? <Loader2 className="animate-spin" /> : <><Save />Enregistrer le brouillon</>}
            </Button>
            <Button type="button" shape="rounded" variant="outline" disabled={!canPublish} onClick={() => setPublishing(true)} title={!doc.draft ? "Enregistrez d'abord le brouillon" : dirty ? "Enregistrez vos modifications avant de publier" : missing > 0 ? "Complétez les champs restants" : undefined}>
              <CheckCircle2 />Publier après validation juridique
            </Button>
            {doc.draft && <Button type="button" shape="rounded" variant="outline" onClick={() => setDiscarding(true)}><Trash2 />Abandonner le brouillon</Button>}
          </div>
        </>
      )}

      {doc.history.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-base font-bold text-navy">Historique</h3>
          <ul className="flex flex-col divide-y divide-[#E7E0D4] rounded-xl border border-[#E7E0D4] text-sm">
            {doc.history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span><strong>Version {h.version}</strong> · {LEGAL_STATUS_LABELS[h.status]} · publiée le {day(h.publishedAt)} · validée par {h.counselValidatedBy}</span>
                <span className="text-xs text-ink-secondary">{h.changeSummary}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {publishing && <PublishDialog code={doc.code} label={doc.label} onClose={() => setPublishing(false)} />}
      <ConfirmDialog
        open={discarding} onOpenChange={setDiscarding} title="Abandonner le brouillon ?" confirmLabel="Abandonner"
        description="Les modifications du brouillon sont perdues. La version en vigueur n'est pas touchée."
        onConfirm={async () => { try { await discard.mutateAsync(doc.code); toast({ title: "Brouillon abandonné" }); } catch (err) { toast({ title: "Action impossible", description: errorMessage(err), variant: "destructive" }); } }}
      />
    </div>
  );
}

// ── Preuves d'acceptation ───────────────────────────────────────────────

function Acceptances() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<LegalCode | "">("");
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error } = useLegalAcceptances(email.trim() || undefined, code || undefined, page);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-secondary">Chaque acceptation conserve la version exacte lue (et l'empreinte de son contenu), l'adresse e-mail, l'acte concerné, l'heure, l'adresse IP et le navigateur.</p>
      <div className="flex flex-wrap gap-3">
        <input aria-label="Rechercher par e-mail" placeholder="Rechercher par e-mail" className={`${inputClass} w-64`} value={email} onChange={(e) => { setEmail(e.target.value); setPage(0); }} />
        <select aria-label="Texte" className={`${inputClass} w-56`} value={code} onChange={(e) => { setCode(e.target.value as LegalCode | ""); setPage(0); }}>
          <option value="">Tous les textes</option>
          {LEGAL_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
      {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les preuves.")}</ErrorNotice>}
      {data && data.items.length === 0 && <EmptyState title="Aucune acceptation" text="Les acceptations apparaîtront ici dès qu'un texte publié aura été accepté." />}
      {data && data.items.length > 0 && (
        <>
          <Card radius="stat" className="overflow-x-auto border border-[#E7E0D4] p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#E7E0D4] text-xs uppercase tracking-wide text-ink-secondary">
                <tr><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Personne</th><th className="px-4 py-3 font-semibold">Texte</th><th className="px-4 py-3 font-semibold">Acte</th><th className="px-4 py-3 font-semibold">IP</th></tr>
              </thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.id} className="border-b border-[#E7E0D4] align-top last:border-b-0">
                    <td className="px-4 py-3 text-ink-secondary">{stamp(a.acceptedAt)}</td>
                    <td className="px-4 py-3"><div className="font-semibold text-ink">{a.fullName ?? "—"}</div><div className="text-xs text-ink-secondary">{a.email}</div></td>
                    <td className="px-4 py-3">{a.code} · v{a.version}<div className="font-mono text-[0.6875rem] text-ink-secondary" title="Empreinte SHA-256 du texte accepté">{a.contentHash.slice(0, 12)}…</div></td>
                    <td className="px-4 py-3">{LEGAL_CONTEXT_LABELS[a.context] ?? a.context}<div className="break-all text-xs text-ink-secondary">{a.subjectType} {a.subjectRef}</div></td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">{a.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pager page={page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function AdminTextesLegaux() {
  const { data, isLoading, isError, error } = useLegalOverview();
  const [tab, setTab] = useState<LegalCode | "PROOFS">("CGU");
  const current = data?.find((d) => d.code === tab) ?? null;

  return (
    <AdminLayout title="Textes légaux" description="CGU, CGV, confidentialité et mentions légales : à compléter, faire valider par le conseil juridique, puis publier. Réservé à la Direction.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Textes légaux">
          {(data ?? LEGAL_CODES.map((c) => ({ code: c, label: c, published: null, draft: null }) as unknown as LegalAdminOverview)).map((d) => (
            <button
              key={d.code} type="button" role="tab" aria-selected={tab === d.code} onClick={() => setTab(d.code)}
              className={`rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors ${tab === d.code ? "border-navy bg-navy text-white" : "border-[#D6CEC0] bg-white text-ink hover:border-navy"}`}
            >
              {d.label}{d.published ? ` · v${d.published.version}` : " · non publié"}
            </button>
          ))}
          <button
            type="button" role="tab" aria-selected={tab === "PROOFS"} onClick={() => setTab("PROOFS")}
            className={`rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors ${tab === "PROOFS" ? "border-navy bg-navy text-white" : "border-[#D6CEC0] bg-white text-ink hover:border-navy"}`}
          >
            Preuves d'acceptation
          </button>
        </div>
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>{errorMessage(error, "Impossible de charger les textes.")}</ErrorNotice>}
        {tab === "PROOFS" ? <Acceptances /> : current && <DocumentEditor key={current.code} doc={current} />}
      </div>
    </AdminLayout>
  );
}
